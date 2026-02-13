import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { workflowsCache } from "../../route";

export async function POST(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await context.params;

    // Get the original workflow
    const { data: original, error: fetchError } = await supabase
      .from("workflows")
      .select("id, name, description, status, steps")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !original) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
    }

    // Create a copy with a new name
    const copyName = `${original.name} (Copy)`;
    const { data: copied, error: insertError } = await supabase
      .from("workflows")
      .insert({
        user_id: user.id,
        name: copyName,
        description: original.description,
        steps: original.steps,
        status: "draft",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select("id, name, description, status, steps, created_at, updated_at")
      .single();

    if (insertError) throw insertError;

    // Invalidate cache
    workflowsCache.delete(`workflows:${user.id}:all`);
    workflowsCache.delete(`workflows:${user.id}:draft`);

    return NextResponse.json({ workflow: copied });
  } catch (error: any) {
    console.error("Failed to copy workflow:", error);
    return NextResponse.json(
      { error: error.message || "Failed to copy workflow" },
      { status: 500 }
    );
  }
}
