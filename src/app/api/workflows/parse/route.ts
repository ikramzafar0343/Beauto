import { NextRequest, NextResponse } from "next/server";
import { parseNaturalLanguageToWorkflow } from "@/lib/workflow/parser";
import { createClient } from "@/lib/supabase/server";
import { defaultLlmConfig, generateJsonObjectWithFallback } from "@/lib/models/runtime";
import { getUserLlmConfig } from "@/lib/models/user-config";

export async function POST(request: NextRequest) {
  try {
    const { instruction, availableApps = [], provider } = await request.json();

    if (!instruction) {
      return NextResponse.json(
        { error: "Instruction is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const config = user ? await getUserLlmConfig(supabase as any, user.id) : defaultLlmConfig();
    const resolvedConfig = provider ? { ...config, provider } : config;

    // Try pattern detection first
    const parsed = await parseNaturalLanguageToWorkflow(instruction, availableApps, resolvedConfig.provider);

    // If we have steps, return them
    if (parsed.steps.length > 0) {
      return NextResponse.json(parsed);
    }

    // Otherwise, use AI to parse
    const systemPrompt = `You are a workflow parser that converts natural language instructions into structured multi-step workflows for a tool-based automation system.

Available Apps: ${availableApps.join(', ') || 'All Composio apps'}

Return ONLY a valid JSON object with this exact structure:
{
  "name": "Workflow name",
  "description": "Brief description",
  "steps": [
    {
      "id": "step-0",
      "type": "action",
      "name": "Step name",
      "description": "What this step does",
      "app": "app_name",
      "action": "action_name",
      "parameters": {},
      "dependsOn": []
    }
  ],
  "requiredApps": ["app1", "app2"]
}

Rules:
- Each step must have a unique id (step-0, step-1, etc.)
- Use dependsOn to chain steps
- Extract parameters from the instruction
- Return ONLY JSON, no markdown, no explanations`;

    const aiResponse = await generateJsonObjectWithFallback({
      config: resolvedConfig,
      system: systemPrompt,
      user: `User Instruction: ${instruction}`,
      temperature: 0.3,
    });

    // Merge AI response with pattern detection
    if (aiResponse && aiResponse.steps) {
      return NextResponse.json({
        name: aiResponse.name || parsed.name,
        description: aiResponse.description || parsed.description,
        steps: aiResponse.steps,
        requiredApps: aiResponse.requiredApps || parsed.requiredApps,
      });
    }

    // Fallback to pattern detection
    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error("Workflow parsing error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to parse workflow" },
      { status: 500 }
    );
  }
}
