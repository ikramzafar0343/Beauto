import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { env } from "@/lib/config/env";
import { parseExpression } from "cron-parser";
import { Composio } from "@composio/core";
import { OpenAIAgentsProvider } from "@composio/openai-agents";
import { Agent, run, hostedMcpTool } from "@openai/agents";

const composio = new Composio({
  apiKey: process.env.COMPOSIO_API_KEY,
  provider: new OpenAIAgentsProvider(),
}) as any;

function authorized(req: NextRequest) {
  const secret = env().CRON_SECRET;
  if (req.headers.get("x-vercel-cron")) return true;
  if (!secret) return true;
  const header = req.headers.get("authorization") || "";
  return header === `Bearer ${secret}`;
}

async function runWorkflowOnce(opts: { userId: string; workflow: any; supabase: any }) {
  const { userId, workflow, supabase } = opts;
  const steps = (workflow.steps || []) as any[];

  const { data: execution, error: execError } = await supabase
    .from("workflow_executions")
    .insert({
      workflow_id: workflow.id,
      user_id: userId,
      status: "running",
      started_at: new Date().toISOString(),
      input_data: {},
    })
    .select()
    .single();

  if (execError || !execution) throw new Error(execError?.message || "Failed to create execution");

  const stepRecords = steps.map((step: any, index: number) => ({
    execution_id: execution.id,
    step_index: index,
    step_name: step.name || `Step ${index + 1}`,
    step_type: step.type || "action",
    status: "pending",
    input_data: step.parameters || step.input || {},
  }));

  const { data: createdSteps, error: stepsError } = await supabase
    .from("execution_steps")
    .insert(stepRecords)
    .select();

  if (stepsError) throw new Error(stepsError.message);

  const apps = Array.from(new Set(steps.map((s: any) => s.app).filter(Boolean))).map((a) => String(a));
  const session = await composio.toolRouter.create(userId, {
    toolkits: apps.length > 0 ? apps : undefined,
    mcpConfigId: env().COMPOSIO_MCP_CONFIG_ID,
  });

  const agent = new Agent({
    name: "WorkflowCronRunner",
    model: env().OPENAI_MODEL || "gpt-4o-mini",
    instructions: "Execute workflow steps exactly. Use tools when needed.",
    tools: [
      hostedMcpTool({
        serverLabel: "tool_router",
        serverUrl: session.mcp.url,
        headers: {
          ...(session.mcp.headers as any),
          "x-api-key": env().COMPOSIO_API_KEY,
        } as any,
      }),
    ],
  });

  const stepResults: Record<string, any> = {};

  for (let index = 0; index < steps.length; index++) {
    const step = steps[index];
    const row = createdSteps[index] as any;
    const stepId = step.id || `step-${index}`;

    await supabase
      .from("execution_steps")
      .update({ status: "running", started_at: new Date().toISOString() })
      .eq("id", row.id);

    try {
      let result: any = null;
      if (step.type === "delay") {
        const duration = step.parameters?.duration || 1000;
        await new Promise((resolve) => setTimeout(resolve, duration));
        result = { ok: true, duration };
      } else {
        const prompt = [
          `Step name: ${row.step_name}`,
          `Step app: ${step.app || ""}`,
          `Step action: ${step.action || ""}`,
          `Step description: ${step.description || ""}`,
          `Parameters JSON: ${JSON.stringify(step.parameters || step.input || {})}`,
          `Context JSON: ${JSON.stringify({ previous: stepResults })}`,
          `Do the step now.`,
        ].join("\n");
        const response: any = await run(agent, prompt);
        result = response.finalOutput ?? response.messages?.[response.messages.length - 1]?.content ?? null;
      }

      stepResults[stepId] = result;

      await supabase
        .from("execution_steps")
        .update({ status: "completed", completed_at: new Date().toISOString(), output_data: result })
        .eq("id", row.id);
    } catch (e: any) {
      await supabase
        .from("execution_steps")
        .update({ status: "failed", completed_at: new Date().toISOString(), error_message: e?.message || "Step failed" })
        .eq("id", row.id);
      await supabase
        .from("workflow_executions")
        .update({ status: "failed", completed_at: new Date().toISOString(), error_message: e?.message || "Execution failed", output_data: stepResults })
        .eq("id", execution.id);
      throw e;
    }
  }

  await supabase
    .from("workflow_executions")
    .update({ status: "completed", completed_at: new Date().toISOString(), output_data: stepResults })
    .eq("id", execution.id);

  return execution.id as string;
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = createAdminClient();
  const now = new Date();

  const { data: schedules, error } = await supabase
    .from("workflow_schedules")
    .select("id,user_id,workflow_id,cron,timezone,next_run_at,enabled")
    .eq("enabled", true)
    .or(`next_run_at.is.null,next_run_at.lte.${now.toISOString()}`)
    .limit(25);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const results: any[] = [];

  for (const schedule of schedules || []) {
    try {
      const { data: workflow } = await supabase
        .from("workflows")
        .select("*")
        .eq("id", schedule.workflow_id)
        .eq("user_id", schedule.user_id)
        .maybeSingle();

      if (!workflow) {
        await supabase.from("workflow_schedules").update({ enabled: false }).eq("id", schedule.id);
        results.push({ scheduleId: schedule.id, skipped: true, reason: "Workflow missing" });
        continue;
      }

      const executionId = await runWorkflowOnce({ userId: schedule.user_id, workflow, supabase });

      const interval = parseExpression(schedule.cron, {
        currentDate: now,
        tz: schedule.timezone || "UTC",
      });
      const nextRun = interval.next().toDate().toISOString();

      await supabase
        .from("workflow_schedules")
        .update({ last_run_at: now.toISOString(), next_run_at: nextRun, updated_at: now.toISOString() })
        .eq("id", schedule.id);

      results.push({ scheduleId: schedule.id, executionId, ok: true, nextRunAt: nextRun });
    } catch (e: any) {
      results.push({ scheduleId: schedule.id, ok: false, error: e?.message || "Failed" });
    }
  }

  return NextResponse.json({ ok: true, ran: results.length, results });
}

