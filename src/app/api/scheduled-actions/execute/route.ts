import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Composio } from "@composio/core";
import { OpenAIAgentsProvider } from "@composio/openai-agents";
import { Agent, run, hostedMcpTool } from "@openai/agents";
import { env } from "@/lib/config/env";

const composio = new Composio({
  apiKey: process.env.COMPOSIO_API_KEY,
  provider: new OpenAIAgentsProvider(),
}) as any;

// This endpoint runs on a cron job to execute scheduled actions
export async function POST(request: NextRequest) {
  try {
    const secret = env().CRON_SECRET;
    if (secret && !request.headers.get("x-vercel-cron") && request.headers.get("authorization") !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const supabase = createAdminClient();
    
    // Get all pending actions that should be executed now
    const now = new Date();
    const { data: actions, error } = await supabase
      .from("scheduled_actions")
      .select("*")
      .eq("status", "pending")
      .lte("scheduled_time", now.toISOString())
      .order("scheduled_time", { ascending: true });

    if (error) throw error;

    if (!actions || actions.length === 0) {
      return NextResponse.json({ 
        message: "No pending actions to execute", 
        executed: 0 
      });
    }

    const results = [];

    for (const action of actions) {
      try {
        // Executing scheduled action
        
        // Update status to running
        await supabase
          .from("scheduled_actions")
          .update({ status: "running", started_at: new Date().toISOString() })
          .eq("id", action.id);

        // Execute the action
        const result = await executeScheduledAction(action);

        // Update with result - status completed
        await supabase
          .from("scheduled_actions")
          .update({
            status: "completed",
            result: result,
            executed_at: new Date().toISOString(),
            completed_at: new Date().toISOString(),
          })
          .eq("id", action.id);

        // Action completed successfully
        results.push({ id: action.id, success: true, result });
      } catch (error: any) {
        console.error(`Action ${action.id} failed:`, error);
        
        // Update with error
        await supabase
          .from("scheduled_actions")
          .update({
            status: "failed",
            error: error.message,
            executed_at: new Date().toISOString(),
            completed_at: new Date().toISOString(),
            error_message: error.message,
          })
          .eq("id", action.id);

        results.push({ id: action.id, success: false, error: error.message });
      }
    }

    return NextResponse.json({
      message: "Execution completed",
      executed: results.length,
      results,
    });
  } catch (error: any) {
    console.error("Failed to execute scheduled actions:", error);
    return NextResponse.json(
      { error: "Failed to execute scheduled actions" },
      { status: 500 }
    );
  }
}

async function executeScheduledAction(action: any) {
  const { user_id, toolkit, action_params } = action;
  const { originalMessage, language, customContext } = action_params;

  // Create Composio session
  const session = await composio.toolRouter.create(user_id, {
    toolkits: [toolkit],
    mcpConfigId: env().COMPOSIO_MCP_CONFIG_ID,
  });

  // Create agent
  const agent = new Agent({
    name: "Beauto Scheduler",
    model: env().OPENAI_MODEL || "gpt-4o-mini",
    instructions: `You are executing a scheduled action for the user.
    
The user requested: "${originalMessage}"

Execute this action now. Respond in ${language === 'Swedish' ? 'Swedish' : language === 'Danish' ? 'Danish' : 'English'}.

${customContext ? `
This is for ${customContext.companyName}.
Brand Voice: ${customContext.brandVoice}
Target Audience: ${customContext.targetAudience}
Brand Colors: ${customContext.colors?.join(", ")}` : ''}

Perform the action and provide a clear confirmation message.`,
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

  // Run the agent
  const response: any = await run(agent, originalMessage);
  
  return {
    message: response.messages?.[response.messages.length - 1]?.content || "Action completed successfully",
    details: response,
  };
}
