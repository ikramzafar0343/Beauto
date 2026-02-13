import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Composio } from "@composio/core";
import { OpenAIAgentsProvider } from "@composio/openai-agents";
import { Agent, run, hostedMcpTool } from "@openai/agents";
import { env } from "@/lib/config/env";

const composio = new Composio({
  apiKey: process.env.COMPOSIO_API_KEY,
  provider: new OpenAIAgentsProvider(),
}) as any;

function sseEvent(event: string, data: any) {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  const { id: workflowId } = await context.params;
  const { inputData = {} } = await request.json().catch(() => ({}));

  const { data: workflow } = await supabase
    .from("workflows")
    .select("*")
    .eq("id", workflowId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!workflow) return new Response(JSON.stringify({ error: "Workflow not found" }), { status: 404 });

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    start: async (controller) => {
      const write = (event: string, data: any) => controller.enqueue(encoder.encode(sseEvent(event, data)));

      const { data: execution, error: execError } = await supabase
        .from("workflow_executions")
        .insert({
          workflow_id: workflowId,
          user_id: user.id,
          status: "running",
          started_at: new Date().toISOString(),
          input_data: inputData,
        })
        .select()
        .single();

      if (execError || !execution) {
        write("execution_error", { message: execError?.message || "Failed to create execution" });
        controller.close();
        return;
      }

      write("execution_started", { executionId: execution.id });

      const steps = (workflow.steps || []) as any[];
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

      if (stepsError || !createdSteps) {
        await supabase
          .from("workflow_executions")
          .update({ status: "failed", error_message: stepsError?.message || "Failed to create steps", completed_at: new Date().toISOString() })
          .eq("id", execution.id);

        write("execution_error", { executionId: execution.id, message: stepsError?.message || "Failed to create steps" });
        controller.close();
        return;
      }

      const apps = Array.from(new Set(steps.map((s: any) => s.app).filter(Boolean))).map((a) => String(a));
      const session = await composio.toolRouter.create(user.id, {
        toolkits: apps.length > 0 ? apps : undefined,
        mcpConfigId: env().COMPOSIO_MCP_CONFIG_ID,
      });

      const agent = new Agent({
        name: "WorkflowRunner",
        model: env().OPENAI_MODEL || "gpt-4o-mini",
        instructions: "Execute workflow steps exactly. Use tools when needed. Return raw results as JSON when possible.",
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
        const stepRow = createdSteps[index] as any;
        const stepId = step.id || `step-${index}`;

        await supabase
          .from("execution_steps")
          .update({ status: "running", started_at: new Date().toISOString() })
          .eq("id", stepRow.id);

        write("step_started", { executionId: execution.id, stepIndex: index, stepId, name: stepRow.step_name });

        try {
          let result: any = null;

          if (step.type === "delay") {
            const duration = step.parameters?.duration || 1000;
            await new Promise((resolve) => setTimeout(resolve, duration));
            result = { ok: true, message: "Delay completed", duration };
          } else {
            const prompt = [
              `Step name: ${stepRow.step_name}`,
              `Step app: ${step.app || ""}`,
              `Step action: ${step.action || ""}`,
              `Step description: ${step.description || ""}`,
              `Parameters JSON: ${JSON.stringify(step.parameters || step.input || {})}`,
              `Context JSON: ${JSON.stringify({ inputData, previous: stepResults })}`,
              `Do the step now. If you need to call a tool, call it. Return the tool result.`,
            ].join("\n");

            const response: any = await run(agent, prompt);
            result = response.finalOutput ?? response.messages?.[response.messages.length - 1]?.content ?? null;
          }

          stepResults[stepId] = result;

          await supabase
            .from("execution_steps")
            .update({
              status: "completed",
              completed_at: new Date().toISOString(),
              output_data: result,
              logs: [`completed:${new Date().toISOString()}`],
            })
            .eq("id", stepRow.id);

          write("step_completed", { executionId: execution.id, stepIndex: index, stepId, result });
        } catch (error: any) {
          await supabase
            .from("execution_steps")
            .update({
              status: "failed",
              completed_at: new Date().toISOString(),
              error_message: error?.message || "Step failed",
              logs: [`failed:${new Date().toISOString()}`, String(error?.message || error)],
            })
            .eq("id", stepRow.id);

          await supabase
            .from("workflow_executions")
            .update({
              status: "failed",
              completed_at: new Date().toISOString(),
              error_message: error?.message || "Execution failed",
              output_data: stepResults,
            })
            .eq("id", execution.id);

          write("step_failed", { executionId: execution.id, stepIndex: index, message: error?.message || "Step failed" });
          write("execution_failed", { executionId: execution.id });
          controller.close();
          return;
        }
      }

      await supabase
        .from("workflow_executions")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          output_data: stepResults,
        })
        .eq("id", execution.id);

      write("execution_completed", { executionId: execution.id, output: stepResults });
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

