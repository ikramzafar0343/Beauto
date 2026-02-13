"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Plus, Trash2, Copy } from "lucide-react";

type TokenRow = {
  id: string;
  client_type: string | null;
  token_prefix: string;
  expires_at: string | null;
  last_used_at: string | null;
  created_at: string;
  composio_mcp_url?: string | null;
};

export default function McpSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [tokens, setTokens] = useState<TokenRow[]>([]);
  const [clientType, setClientType] = useState("cursor");
  const [newToken, setNewToken] = useState<string | null>(null);
  const [newConfig, setNewConfig] = useState<{ serverUrl: string; headers: Record<string, string> } | null>(null);

  const configText = useMemo(() => {
    if (!newConfig) return "";
    return JSON.stringify(
      {
        mcpServers: {
          rubeClone: {
            url: newConfig.serverUrl,
            headers: newConfig.headers,
          },
        },
      },
      null,
      2
    );
  }, [newConfig]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/mcp/tokens");
      const data = await res.json();
      setTokens(data.tokens || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const createToken = async () => {
    setCreating(true);
    try {
      const res = await fetch("/api/mcp/tokens", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ clientType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create token");
      setNewToken(data.token);
      setNewConfig(data.mcp);
      await load();
    } catch (e: any) {
      alert(e.message || "Failed to create token");
    } finally {
      setCreating(false);
    }
  };

  const revoke = async (id: string) => {
    if (!confirm("Revoke this token?")) return;
    const res = await fetch("/api/mcp/tokens", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    if (!res.ok) alert(data.error || "Failed to revoke");
    await load();
  };

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      alert("Copy failed");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0a0a0a]">
        <Loader2 className="w-6 h-6 animate-spin text-[#343434]/40 dark:text-white/40" />
      </div>
    );
  }

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
          <h1 className="text-xl font-semibold text-[#343434] dark:text-white">MCP Access</h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        <div className="rounded-2xl border border-[#dae0e2] dark:border-[#27272a] bg-white dark:bg-[#1a1a1a] p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
            <div>
              <div className="text-sm font-semibold text-[#343434] dark:text-white">Generate token</div>
              <div className="text-xs text-[#343434]/60 dark:text-white/60">Use this to connect Cursor/Claude/Agent Builder to your MCP server.</div>
            </div>
            <div className="flex gap-2 items-center">
              <select
                value={clientType}
                onChange={(e) => setClientType(e.target.value)}
                className="px-3 py-2 rounded-xl border border-[#dae0e2] dark:border-[#27272a] bg-white dark:bg-[#0a0a0a] text-sm text-[#343434] dark:text-white"
              >
                <option value="cursor">Cursor</option>
                <option value="claude">Claude</option>
                <option value="chatgpt">ChatGPT</option>
                <option value="agent_builder">Agent Builder</option>
                <option value="other">Other</option>
              </select>
              <button
                onClick={createToken}
                disabled={creating}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#343434] dark:bg-white text-white dark:text-[#0a0a0a] text-sm font-medium disabled:opacity-50"
              >
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Create
              </button>
            </div>
          </div>

          {newToken && newConfig && (
            <div className="rounded-xl border border-[#dae0e2] dark:border-[#27272a] bg-[#f8f9fa] dark:bg-[#0a0a0a] p-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs font-semibold text-[#343434] dark:text-white">New token</div>
                <button onClick={() => copy(newToken)} className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg bg-white dark:bg-[#1a1a1a] border border-[#dae0e2] dark:border-[#27272a]">
                  <Copy className="w-3.5 h-3.5" />
                  Copy
                </button>
              </div>
              <div className="font-mono text-xs break-all text-[#343434] dark:text-white">{newToken}</div>
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs font-semibold text-[#343434] dark:text-white">Config snippet</div>
                <button onClick={() => copy(configText)} className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg bg-white dark:bg-[#1a1a1a] border border-[#dae0e2] dark:border-[#27272a]">
                  <Copy className="w-3.5 h-3.5" />
                  Copy
                </button>
              </div>
              <pre className="text-xs overflow-auto whitespace-pre-wrap text-[#343434] dark:text-white">{configText}</pre>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-[#dae0e2] dark:border-[#27272a] bg-white dark:bg-[#1a1a1a] p-6">
          <div className="text-sm font-semibold text-[#343434] dark:text-white mb-4">Active tokens</div>
          {tokens.length === 0 ? (
            <div className="text-sm text-[#343434]/60 dark:text-white/60">No tokens yet.</div>
          ) : (
            <div className="space-y-3">
              {tokens.map((t) => (
                <div key={t.id} className="flex items-center justify-between gap-4 rounded-xl border border-[#dae0e2] dark:border-[#27272a] p-4">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-[#343434] dark:text-white">
                      {t.client_type || "unknown"} • {t.token_prefix}…
                    </div>
                    <div className="text-xs text-[#343434]/60 dark:text-white/60">
                      Expires: {t.expires_at ? new Date(t.expires_at).toLocaleString() : "never"} • Last used:{" "}
                      {t.last_used_at ? new Date(t.last_used_at).toLocaleString() : "never"}
                    </div>
                  </div>
                  <button
                    onClick={() => revoke(t.id)}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-[#dae0e2] dark:border-[#27272a] bg-white dark:bg-[#0a0a0a] text-sm text-red-600 dark:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                    Revoke
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

