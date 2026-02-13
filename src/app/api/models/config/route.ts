import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { defaultLlmConfig } from "@/lib/models/runtime";

const UpdateSchema = z.object({
  default_model: z.enum(["openai", "gemini"]),
  fallback_model: z.enum(["openai", "gemini"]),
  model_settings: z.record(z.any()).optional(),
});

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data } = await supabase
    .from("model_configurations")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  const defaults = defaultLlmConfig();
  return NextResponse.json({
    config: data || {
      user_id: user.id,
      default_model: defaults.provider,
      fallback_model: defaults.fallbackProvider,
      model_settings: {
        openai: { model: defaults.model },
        gemini: { model: defaults.fallbackModel },
      },
    },
  });
}

export async function PUT(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const json = await req.json();
  const parsed = UpdateSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.message }, { status: 400 });

  const { data, error } = await supabase
    .from("model_configurations")
    .upsert({
      user_id: user.id,
      default_model: parsed.data.default_model,
      fallback_model: parsed.data.fallback_model,
      model_settings: parsed.data.model_settings || {},
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ config: data });
}

