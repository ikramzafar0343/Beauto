"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save } from "lucide-react";

type Provider = "openai" | "gemini";

type ModelConfig = {
  default_model: Provider;
  fallback_model: Provider;
  model_settings?: Record<string, any>;
};

export default function ModelSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<ModelConfig | null>(null);
  const [openaiModel, setOpenaiModel] = useState("gpt-4o-mini");
  const [geminiModel, setGeminiModel] = useState("gemini-2.0-flash-exp");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/models/config");
        const data = await res.json();
        const cfg = data.config as any;
        setConfig({
          default_model: cfg.default_model,
          fallback_model: cfg.fallback_model,
          model_settings: cfg.model_settings || {},
        });
        setOpenaiModel(cfg.model_settings?.openai?.model || "gpt-4o-mini");
        setGeminiModel(cfg.model_settings?.gemini?.model || "gemini-2.0-flash-exp");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const save = async () => {
    if (!config) return;
    setSaving(true);
    try {
      const payload = {
        default_model: config.default_model,
        fallback_model: config.fallback_model,
        model_settings: {
          ...(config.model_settings || {}),
          openai: { model: openaiModel },
          gemini: { model: geminiModel },
        },
      };

      const res = await fetch("/api/models/config", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      setConfig({
        default_model: data.config.default_model,
        fallback_model: data.config.fallback_model,
        model_settings: data.config.model_settings || {},
      });
    } catch (e: any) {
      alert(e.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0a0a0a]">
        <Loader2 className="w-6 h-6 animate-spin text-[#343434]/40 dark:text-white/40" />
      </div>
    );
  }

  if (!config) return null;

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a]">
      <header className="border-b border-[#dae0e2] dark:border-[#27272a] bg-white dark:bg-[#1a1a1a]">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => router.push("/settings")}
            className="p-2 rounded-lg hover:bg-[#f8f9fa] dark:hover:bg-[#27272a] transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[#343434] dark:text-white" />
          </button>
          <h1 className="text-xl font-semibold text-[#343434] dark:text-white">Model Settings</h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        <div className="rounded-2xl border border-[#dae0e2] dark:border-[#27272a] bg-white dark:bg-[#1a1a1a] p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="text-sm font-medium text-[#343434] dark:text-white block mb-2">Default Provider</label>
              <select
                value={config.default_model}
                onChange={(e) => setConfig((prev) => prev ? { ...prev, default_model: e.target.value as Provider } : prev)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#dae0e2] dark:border-[#27272a] bg-white dark:bg-[#0a0a0a] text-[#343434] dark:text-white"
              >
                <option value="openai">OpenAI</option>
                <option value="gemini">Gemini</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-[#343434] dark:text-white block mb-2">Fallback Provider</label>
              <select
                value={config.fallback_model}
                onChange={(e) => setConfig((prev) => prev ? { ...prev, fallback_model: e.target.value as Provider } : prev)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#dae0e2] dark:border-[#27272a] bg-white dark:bg-[#0a0a0a] text-[#343434] dark:text-white"
              >
                <option value="gemini">Gemini</option>
                <option value="openai">OpenAI</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="text-sm font-medium text-[#343434] dark:text-white block mb-2">OpenAI Model</label>
              <input
                value={openaiModel}
                onChange={(e) => setOpenaiModel(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#dae0e2] dark:border-[#27272a] bg-white dark:bg-[#0a0a0a] text-[#343434] dark:text-white"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#343434] dark:text-white block mb-2">Gemini Model</label>
              <input
                value={geminiModel}
                onChange={(e) => setGeminiModel(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#dae0e2] dark:border-[#27272a] bg-white dark:bg-[#0a0a0a] text-[#343434] dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={save}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#343434] dark:bg-white text-white dark:text-[#0a0a0a] font-medium disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

