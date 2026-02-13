import type { SupabaseClient } from "@supabase/supabase-js";
import type { LlmConfig, LlmProvider } from "@/lib/models/runtime";
import { defaultLlmConfig } from "@/lib/models/runtime";

type ModelConfigurationsRow = {
  default_model: string | null;
  fallback_model: string | null;
  model_settings: any;
};

export async function getUserLlmConfig(supabase: SupabaseClient, userId: string): Promise<LlmConfig> {
  const defaults = defaultLlmConfig();

  const { data } = await supabase
    .from("model_configurations")
    .select("default_model,fallback_model,model_settings")
    .eq("user_id", userId)
    .maybeSingle();

  const row = data as ModelConfigurationsRow | null;
  const provider = (row?.default_model as LlmProvider) || defaults.provider;
  const fallbackProvider = (row?.fallback_model as LlmProvider) || defaults.fallbackProvider;

  const settings = (row?.model_settings || {}) as Record<string, any>;
  const providerModel = settings?.[provider]?.model;
  const fallbackModel = settings?.[fallbackProvider]?.model;

  return {
    provider,
    model: providerModel || defaults.model,
    fallbackProvider,
    fallbackModel: fallbackModel || defaults.fallbackModel,
  };
}

