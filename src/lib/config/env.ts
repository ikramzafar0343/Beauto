import { z } from "zod";

const EnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  OPENAI_API_KEY: z.string().min(1).optional(),
  OPENAI_MODEL: z.string().min(1).optional(),
  GEMINI_API_KEY: z.string().min(1).optional(),
  GEMINI_MODEL: z.string().min(1).optional(),
  DEFAULT_LLM_PROVIDER: z.enum(["openai", "gemini"]).optional(),
  COMPOSIO_API_KEY: z.string().min(1).optional(),
  COMPOSIO_MCP_CONFIG_ID: z.string().min(1).optional(),
  ENCRYPTION_KEY: z.string().min(16).optional(),
  MCP_TOKEN_TTL_HOURS: z.coerce.number().int().positive().optional(),
  CRON_SECRET: z.string().min(8).optional(),
});

let cached: z.infer<typeof EnvSchema> | null = null;

export function env() {
  if (cached) return cached;
  const parsed = EnvSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }
  cached = parsed.data;
  return cached;
}

