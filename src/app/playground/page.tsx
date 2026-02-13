"use client";

import { useState, useEffect } from "react";
import { 
  ChevronDown, 
  Plus, 
  Trash2, 
  Mail, 
  Layout, 
  Search,
  ArrowLeft,
  Settings,
  Shield,
  User,
  Zap,
  Loader2,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

interface Toolkit {
  id: string;
  name: string;
  category: string;
  logo: string;
  description?: string;
  marketplaceUrl?: string;
}

interface Tool {
  name: string;
  description: string;
  logo: string;
}

interface AuthConfig {
  id: string;
  name: string;
}

interface ConnectedAccount {
  id: string;
  name: string;
}

export default function PlaygroundPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [toolkits, setToolkits] = useState<Toolkit[]>([]);
  const [selectedToolkit, setSelectedToolkit] = useState<string>("");
  const [authConfigs, setAuthConfigs] = useState<AuthConfig[]>([]);
  const [selectedAuthConfig, setSelectedAuthConfig] = useState<string>("");
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingTools, setLoadingTools] = useState(false);

  const supabase = createClient();

  // Load user
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    init();
  }, []);

  // Load toolkits
  useEffect(() => {
    if (!userId) return;
    const loadToolkits = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/composio/toolkits?userId=${userId}&limit=100`);
        const data = await res.json();
        setToolkits(data.toolkits || []);
      } catch (e) {
        console.error("Failed to load toolkits:", e);
      } finally {
        setLoading(false);
      }
    };
    loadToolkits();
  }, [userId]);

  // Load tools when toolkit changes
  useEffect(() => {
    if (!selectedToolkit || !userId) return;
    const loadTools = async () => {
      setLoadingTools(true);
      try {
        const res = await fetch(`/api/composio/tools?toolkit=${selectedToolkit}&userId=${userId}`);
        const data = await res.json();
        setTools(data.tools || []);
        setAuthConfigs(data.authConfigs || []);
        setConnectedAccounts(data.connectedAccounts || []);
      } catch (e) {
        console.error("Failed to load tools:", e);
      } finally {
        setLoadingTools(false);
      }
    };
    loadTools();
  }, [selectedToolkit, userId]);

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#0a0a0a] text-[#343434] dark:text-white pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-[#111111] border-b border-[#dae0e2] dark:border-[#27272a] px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link href="/chat" className="p-2 hover:bg-[#f8f9fa] dark:hover:bg-[#27272a] rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-semibold">Playground</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
            {userId ? "U" : "?"}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 pt-10">
        <div className="bg-white dark:bg-[#111111] rounded-[32px] border border-[#dae0e2] dark:border-[#27272a] shadow-sm overflow-hidden mb-8">
          {/* Config Section */}
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-[140px_1fr] items-center gap-6">
              <label className="text-sm font-medium text-[#343434]/60 dark:text-white/60">Toolkit</label>
              <div className="relative group">
                <select 
                  value={selectedToolkit}
                  onChange={(e) => setSelectedToolkit(e.target.value)}
                  className="w-full appearance-none bg-[#f8f9fa] dark:bg-[#1a1a1a] border border-[#dae0e2] dark:border-[#27272a] rounded-2xl px-4 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer pl-11"
                >
                  <option value="">Select Toolkit</option>
                  {toolkits.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                  {selectedToolkit && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      <Image 
                        src={`https://logos.composio.dev/api/${selectedToolkit}`} 
                        alt="" 
                        width={20} 
                        height={20} 
                        className="w-5 h-5" 
                        unoptimized 
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = "/beauto-logo.png";
                          }}
                        />
                      </div>
                    )}
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#343434]/40 pointer-events-none" />
                </div>
              </div>

              {selectedToolkit && (
                <div className="grid grid-cols-[140px_1fr] gap-6 animate-fade-in">
                  <div />
                  <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100/50 dark:border-blue-800/20">
                    <p className="text-sm text-[#343434]/70 dark:text-white/70 leading-relaxed mb-3">
                      {toolkits.find(t => t.id === selectedToolkit)?.description}
                    </p>
                    {toolkits.find(t => t.id === selectedToolkit)?.marketplaceUrl && (
                      <a 
                        href={toolkits.find(t => t.id === selectedToolkit)?.marketplaceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1.5"
                      >
                        Learn more on Rube Marketplace
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              )}


            <div className="grid grid-cols-[140px_1fr] items-center gap-6">
              <label className="text-sm font-medium text-[#343434]/60 dark:text-white/60">Auth Config</label>
              <div className="relative group">
                <select 
                  value={selectedAuthConfig}
                  onChange={(e) => setSelectedAuthConfig(e.target.value)}
                  className="w-full appearance-none bg-[#f8f9fa] dark:bg-[#1a1a1a] border border-[#dae0e2] dark:border-[#27272a] rounded-2xl px-4 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer pl-11"
                >
                  <option value="">Select Auth Config</option>
                  {authConfigs.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                  {authConfigs.length === 0 && selectedToolkit && <option disabled>No auth configs found</option>}
                </select>
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <Shield className="w-5 h-5 text-blue-500" />
                </div>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#343434]/40 pointer-events-none" />
              </div>
            </div>

            <div className="grid grid-cols-[140px_1fr] items-center gap-6">
              <label className="text-sm font-medium text-[#343434]/60 dark:text-white/60">Test Account</label>
              <div className="relative group">
                <select 
                  value={selectedAccount}
                  onChange={(e) => setSelectedAccount(e.target.value)}
                  className="w-full appearance-none bg-[#f8f9fa] dark:bg-[#1a1a1a] border border-[#dae0e2] dark:border-[#27272a] rounded-2xl px-4 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer pl-11"
                >
                  <option value="">Select Connected Account</option>
                  {connectedAccounts.map(a => (
                    <option key={a.id} value={a.id}>{a.name || a.id}</option>
                  ))}
                  {connectedAccounts.length === 0 && selectedToolkit && <option disabled>No accounts connected</option>}
                </select>
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <User className="w-5 h-5 text-blue-500" />
                </div>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#343434]/40 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Tools Section */}
          <div className="border-t border-[#dae0e2] dark:border-[#27272a]">
            <div className="px-8 py-5 flex items-center justify-between bg-[#fcfdfe] dark:bg-[#0f0f0f]">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                Tools {tools.length > 0 && <span className="text-[#343434]/40 text-sm font-normal">({tools.length})</span>}
              </h2>
              <button 
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#dae0e2] dark:border-[#27272a] text-sm font-medium hover:bg-[#f8f9fa] dark:hover:bg-[#27272a] transition-colors"
                onClick={() => alert("Add Tool function coming soon!")}
              >
                <Plus className="w-4 h-4" />
                Add Tool
              </button>
            </div>

            <div className="divide-y divide-[#dae0e2] dark:divide-[#27272a]">
              {loadingTools ? (
                <div className="p-20 flex flex-col items-center justify-center text-[#343434]/40">
                  <Loader2 className="w-8 h-8 animate-spin mb-4" />
                  <p>Loading tools...</p>
                </div>
              ) : tools.length > 0 ? (
                tools.map((tool, idx) => (
                  <div key={idx} className="p-6 flex items-center justify-between hover:bg-[#f8f9fa] dark:hover:bg-[#1a1a1a] transition-all group">
                      <div className="flex items-center gap-4 flex-1">
                          <div className="w-12 h-12 rounded-xl bg-[#f8f9fa] dark:bg-[#27272a] flex items-center justify-center p-2.5 shrink-0">
                            <Image 
                              src={tool.logo || `https://logos.composio.dev/api/${selectedToolkit}`} 
                              alt="" 
                              width={32} 
                              height={32} 
                              unoptimized 
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = "/logo.png";
                              }}
                            />
                          </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-[15px] truncate">{tool.name.split("_").map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(" ")}</h4>
                          <p className="text-xs text-[#343434]/40 dark:text-white/40 uppercase tracking-wider font-mono mt-0.5">{tool.name}</p>
                          <p className="text-xs text-[#343434]/60 dark:text-white/60 mt-1 line-clamp-2">{tool.description}</p>
                        </div>
                      </div>
                    <button className="p-2.5 opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-950/20 text-[#343434]/40 hover:text-red-500 rounded-xl transition-all">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))
              ) : selectedToolkit ? (
                <div className="p-20 text-center text-[#343434]/40">
                  <Layout className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>No tools found for this toolkit</p>
                </div>
              ) : (
                <div className="p-20 text-center text-[#343434]/40">
                  <Zap className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>Select a toolkit to see its tools</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
