import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Composio } from "@composio/core";
import { OpenAIAgentsProvider } from "@composio/openai-agents";
import { Agent, run, hostedMcpTool } from "@openai/agents";
import { env } from "@/lib/config/env";

const composio = new Composio({
  apiKey: process.env.COMPOSIO_API_KEY,
  provider: new OpenAIAgentsProvider(),
}) as any;

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: workflowId } = await context.params;
    const body = await request.json();
    const { inputData = {} } = body;

    // Get workflow
    const { data: workflow, error: workflowError } = await supabase
      .from("workflows")
      .select("*")
      .eq("id", workflowId)
      .eq("user_id", user.id)
      .single();

    if (workflowError || !workflow) {
      return NextResponse.json(
        { error: "Workflow not found" },
        { status: 404 }
      );
    }

    // Create execution record
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

    if (execError) throw execError;

    // Execute workflow steps asynchronously
    executeWorkflowSteps(workflow, execution.id, user.id, inputData, supabase).catch(
      (error) => {
        console.error("Workflow execution error:", error);
        supabase
          .from("workflow_executions")
          .update({
            status: "failed",
            error_message: error.message,
            completed_at: new Date().toISOString(),
          })
          .eq("id", execution.id);
      }
    );

    return NextResponse.json({
      executionId: execution.id,
      status: "running",
      message: "Workflow execution started",
    });
  } catch (error: any) {
    console.error("Failed to execute workflow:", error);
    return NextResponse.json(
      { error: error.message || "Failed to execute workflow" },
      { status: 500 }
    );
  }
}

async function executeWorkflowSteps(
  workflow: any,
  executionId: string,
  userId: string,
  inputData: any,
  supabase: any
) {
  const steps = workflow.steps || [];
  const stepResults: Record<string, any> = {};

  // Create execution step records
  const stepRecords = steps.map((step: any, index: number) => ({
    execution_id: executionId,
    step_index: index,
    step_name: step.name,
    step_type: step.type,
    status: "pending",
    input_data: step.parameters || {},
  }));

  const { data: createdSteps, error: stepsError } = await supabase
    .from("execution_steps")
    .insert(stepRecords)
    .select();

  if (stepsError) throw stepsError;

  // Execute steps in order (respecting dependencies)
  const executedSteps = new Set<string>();
  const pendingSteps = new Map<string, any>(createdSteps.map((s: any, i: number) => [String(steps[i]?.id ?? `step-${i}`), s]));

  while (executedSteps.size < steps.length) {
    let progress = false;

    for (const [stepId, stepRecord] of pendingSteps.entries()) {
      if (executedSteps.has(stepId)) continue;

      const step = steps.find((s: any) => String(s.id) === stepId);
      if (!step) continue;

      // Check dependencies
      if (step.dependsOn && (step.dependsOn as any[]).some((dep: any) => !executedSteps.has(String(dep)))) {
        continue;
      }

      progress = true;
      await executeStep(step, stepRecord, stepResults, userId, supabase);
      executedSteps.add(stepId);
    }

    if (!progress) {
      throw new Error("Circular dependency or missing step detected");
    }
  }

  // Update execution status
  await supabase
    .from("workflow_executions")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
      output_data: stepResults,
    })
    .eq("id", executionId);
}

async function executeStep(
  step: any,
  stepRecord: any,
  stepResults: Record<string, any>,
  userId: string,
  supabase: any
) {
  // Update step status to running
  await supabase
    .from("execution_steps")
    .update({
      status: "running",
      started_at: new Date().toISOString(),
    })
    .eq("id", stepRecord.id);

  try {
    let result: any;

    if (step.type === "delay") {
      // Handle delay
      const duration = step.parameters?.duration || 1000;
      await new Promise((resolve) => setTimeout(resolve, duration));
      result = { message: "Delay completed" };
    } else if (step.type === "action" && step.app && step.action) {
      // Execute Composio action
      let session;
      try {
        // First try to check if it's a valid toolkit
        session = await composio.toolRouter.create(userId, {
          toolkits: [step.app.toLowerCase()], // Ensure toolkit is lowercase
          mcpConfigId: env().COMPOSIO_MCP_CONFIG_ID,
        });
      } catch (e: any) {
        // Fallback for custom toolkits or if the slug is invalid
        console.warn(`[Workflow] Failed to create tool router for ${step.app}, trying generic session`, e.message);
        
        // Try creating a session without specific toolkit if previous failed
        // or just skip this step gracefully if it's a configuration error
        if (e.message?.includes("Invalid toolkit slugs")) {
           throw new Error(`Invalid integration: ${step.app}. Please check if this app is supported and correctly spelled.`);
        }
        throw e;
      }

      const agent = new Agent({
        name: `Workflow Step: ${step.name}`,
        instructions: `Execute the ${step.action} action for ${step.app}.`,
        model: env().OPENAI_MODEL || "gpt-4o-mini",
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

      const response: any = await run(agent, `Execute ${step.action} with parameters: ${JSON.stringify(step.parameters || {})}`);
      result = response.messages?.[response.messages.length - 1]?.content || "Action completed";
    } else {
      result = { message: "Step executed" };
    }

    stepResults[step.id] = result;

    // Update step status to completed
    await supabase
      .from("execution_steps")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        output_data: result,
        logs: [`Step ${step.name} completed successfully`],
      })
      .eq("id", stepRecord.id);
  } catch (error: any) {
    // Update step status to failed
    await supabase
      .from("execution_steps")
      .update({
        status: "failed",
        completed_at: new Date().toISOString(),
        error_message: error.message,
        logs: [`Error: ${error.message}`],
      })
      .eq("id", stepRecord.id);

    throw error;
  }
}
