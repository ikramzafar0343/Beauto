import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { workflowsCache } from "../route";

const UpdateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  steps: z.array(z.any()).optional(),
  status: z.enum(["draft", "active", "paused", "archived"]).optional(),
});

export async function GET(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;

  // Optimized query - select only needed fields
  const { data, error } = await supabase
    .from("workflows")
    .select("id, name, description, status, steps, created_at, updated_at")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json({ workflow: data });
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;

  const parsed = UpdateSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.message }, { status: 400 });

  // Get old status for cache invalidation
  const { data: oldWorkflow } = await supabase
    .from("workflows")
    .select("status")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  const { data, error } = await supabase
    .from("workflows")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id, name, description, status, steps, created_at, updated_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Invalidate cache
  workflowsCache.delete(`workflows:${user.id}:all`);
  if (oldWorkflow) workflowsCache.delete(`workflows:${user.id}:${oldWorkflow.status}`);
  if (parsed.data.status) workflowsCache.delete(`workflows:${user.id}:${parsed.data.status}`);

  return NextResponse.json({ workflow: data });
}

export async function DELETE(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;

  // Get workflow status for cache invalidation
  const { data: workflow } = await supabase
    .from("workflows")
    .select("status")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  const { error } = await supabase
    .from("workflows")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Invalidate cache
  if (workflow) {
    workflowsCache.delete(`workflows:${user.id}:all`);
    workflowsCache.delete(`workflows:${user.id}:${workflow.status}`);
  }

  return NextResponse.json({ ok: true });
}

