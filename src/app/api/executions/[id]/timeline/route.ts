import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: executionId } = await context.params;

    // Get execution
    const { data: execution, error: execError } = await supabase
      .from("workflow_executions")
      .select("*")
      .eq("id", executionId)
      .eq("user_id", user.id)
      .single();

    if (execError || !execution) {
      return NextResponse.json(
        { error: "Execution not found" },
        { status: 404 }
      );
    }

    // Get execution steps (timeline)
    const { data: steps, error: stepsError } = await supabase
      .from("execution_steps")
      .select("*")
      .eq("execution_id", executionId)
      .order("step_index", { ascending: true });

    if (stepsError) throw stepsError;

    return NextResponse.json({
      execution,
      steps: steps || [],
    });
  } catch (error: any) {
    console.error("Failed to fetch execution timeline:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch timeline" },
      { status: 500 }
    );
  }
}
