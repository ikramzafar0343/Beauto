import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";
import { env } from "@/lib/config/env";

export type LlmProvider = "openai" | "gemini";

export type LlmConfig = {
  provider: LlmProvider;
  model: string;
  fallbackProvider: LlmProvider;
  fallbackModel: string;
};

export function defaultLlmConfig(): LlmConfig {
  const e = env();
  const provider: LlmProvider = e.DEFAULT_LLM_PROVIDER || (e.OPENAI_API_KEY ? "openai" : "gemini");
  const fallbackProvider: LlmProvider = provider === "openai" ? "gemini" : "openai";
  return {
    provider,
    model: provider === "openai" ? (e.OPENAI_MODEL || "gpt-4o-mini") : (e.GEMINI_MODEL || "gemini-2.0-flash-exp"),
    fallbackProvider,
    fallbackModel: fallbackProvider === "openai" ? (e.OPENAI_MODEL || "gpt-4o-mini") : (e.GEMINI_MODEL || "gemini-2.0-flash-exp"),
  };
}

export async function generateJsonObject(opts: {
  provider: LlmProvider;
  model: string;
  system: string;
  user: string;
  temperature?: number;
}) {
  const { provider, model, system, user, temperature = 0.2 } = opts;
  const e = env();

  if (provider === "openai") {
    if (!e.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is required for OpenAI provider");
    const client = new OpenAI({ apiKey: e.OPENAI_API_KEY });
    const completion = await client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature,
      response_format: { type: "json_object" },
    });
    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("Empty OpenAI response");
    return JSON.parse(content);
  }

  if (!e.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is required for Gemini provider");
  const ai = new GoogleGenAI({ apiKey: e.GEMINI_API_KEY });
  const result = await ai.models.generateContent({
    model,
    contents: [
      {
        role: "user",
        parts: [{ text: `${system}\n\n${user}` }],
      },
    ],
    config: { temperature },
  });
  const text = result.text || "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Gemini did not return JSON");
  return JSON.parse(jsonMatch[0]);
}

export async function generateJsonObjectWithFallback(opts: {
  config: LlmConfig;
  system: string;
  user: string;
  temperature?: number;
}) {
  try {
    return await generateJsonObject({
      provider: opts.config.provider,
      model: opts.config.model,
      system: opts.system,
      user: opts.user,
      temperature: opts.temperature,
    });
  } catch (primaryError) {
    return await generateJsonObject({
      provider: opts.config.fallbackProvider,
      model: opts.config.fallbackModel,
      system: opts.system,
      user: opts.user,
      temperature: opts.temperature,
    });
  }
}

