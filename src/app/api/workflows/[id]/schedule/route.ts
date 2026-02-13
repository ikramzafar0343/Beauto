import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { parseExpression } from "cron-parser";
import { z } from "zod";

const UpsertSchema = z.object({
  cron: z.string().min(1),
  timezone: z.string().min(1).optional(),
  enabled: z.boolean().optional(),
});

export async function GET(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;

  const { data, error } = await supabase
    .from("workflow_schedules")
    .select("*")
    .eq("workflow_id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ schedule: data });
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;

  const parsed = UpsertSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.message }, { status: 400 });

  const now = new Date();
  const tz = parsed.data.timezone || "UTC";
  const interval = parseExpression(parsed.data.cron, { currentDate: now, tz });
  const nextRunAt = interval.next().toDate().toISOString();

  const { data, error } = await supabase
    .from("workflow_schedules")
    .upsert({
      user_id: user.id,
      workflow_id: id,
      cron: parsed.data.cron,
      timezone: tz,
      enabled: parsed.data.enabled ?? true,
      next_run_at: nextRunAt,
      updated_at: now.toISOString(),
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ schedule: data });
}

export async function DELETE(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;

  const { error } = await supabase
    .from("workflow_schedules")
    .delete()
    .eq("workflow_id", id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

