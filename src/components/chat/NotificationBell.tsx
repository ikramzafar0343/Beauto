"use client";

import { useState, useEffect } from "react";
import { Bell, Sparkles, X, Play, Loader2, Calendar, Mail, Instagram, MessageSquare, Zap, BarChart3 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";

interface TaskIdea {
  id: string;
  title: string;
  description: string;
  type: string;
  integration: string;
  action_data: {
    prompt: string;
    toolkit?: string;
    platform?: string;
  };
  status: string;
  created_at: string;
}

interface NotificationBellProps {
  onRunAction: (prompt: string) => void;
}

export function NotificationBell({ onRunAction }: NotificationBellProps) {
  const { t } = useLanguage();
  const [ideas, setIdeas] = useState<TaskIdea[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const formatIntegrationName = (integration: string) => {
    return integration.charAt(0).toUpperCase() + integration.slice(1).toLowerCase();
  };

  useEffect(() => {
    fetchIdeas();
  }, []);

  const fetchIdeas = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai-ideas");
      const data = await res.json();
      if (Array.isArray(data)) {
        setIdeas(data);
      }
    } catch (error) {
      console.error("Failed to fetch ideas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = async (id: string) => {
    try {
      await fetch("/api/ai-ideas", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "dismissed" }),
      });
      setIdeas(prev => prev.filter(i => i.id !== id));
    } catch (error) {
      console.error("Failed to dismiss idea:", error);
    }
  };

  const handleRun = async (idea: TaskIdea) => {
    onRunAction(idea.action_data.prompt);
    try {
      await fetch("/api/ai-ideas", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: idea.id, status: "completed" }),
      });
      setIdeas(prev => prev.filter(i => i.id !== idea.id));
    } catch (error) {
      console.error("Failed to complete idea:", error);
    }
    setIsOpen(false);
  };

  const getIcon = (integration: string) => {
    switch (integration.toLowerCase()) {
      case "gmail": return <Mail className="w-4 h-4 text-red-500" />;
      case "instagram": return <Instagram className="w-4 h-4 text-pink-500" />;
      case "googlecalendar": return <Calendar className="w-4 h-4 text-blue-500" />;
      case "hubspot": return <MessageSquare className="w-4 h-4 text-orange-500" />;
      default: return <Sparkles className="w-4 h-4 text-purple-500" />;
    }
  };

  const unreadCount = ideas.length;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-full border border-[#dae0e2] dark:border-[#27272a] text-[#343434] dark:text-white hover:bg-[#d6dfe8]/30 dark:hover:bg-[#27272a] transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-full mt-2 w-96 max-h-[500px] overflow-y-auto bg-white dark:bg-[#1a1a1a] rounded-2xl border border-[#dae0e2] dark:border-[#27272a] shadow-2xl z-50"
            >
              <div className="sticky top-0 bg-white dark:bg-[#1a1a1a] border-b border-[#dae0e2] dark:border-[#27272a] px-4 py-3 flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  <h3 className="text-sm font-bold text-[#343434] dark:text-white">AI Task Ideas</h3>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-full hover:bg-[#f8f9fa] dark:hover:bg-[#27272a] text-[#343434]/40 dark:text-white/40"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 space-y-3">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-5 h-5 animate-spin text-[#343434]/40 dark:text-white/40" />
                  </div>
                ) : ideas.length === 0 ? (
                  <div className="text-center py-8">
                    <Zap className="w-10 h-10 mx-auto mb-3 text-[#343434]/20 dark:text-white/20" />
                    <p className="text-sm text-[#343434]/60 dark:text-white/60">Inga nya idéer just nu</p>
                    <p className="text-xs text-[#343434]/40 dark:text-white/40 mt-1">
                      AI:n kommer att föreslå saker baserat på dina integrationer
                    </p>
                  </div>
                ) : (
                  ideas.map((idea) => (
                    <motion.div
                      key={idea.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="group relative p-4 rounded-xl bg-[#f8f9fa] dark:bg-[#0a0a0a] border border-[#dae0e2] dark:border-[#27272a] hover:shadow-md transition-all"
                    >
                      <button
                        onClick={() => handleDismiss(idea.id)}
                        className="absolute top-2 right-2 p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 text-[#343434]/20 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <X className="w-3 h-3" />
                      </button>

                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 w-8 h-8 rounded-lg bg-white dark:bg-[#1a1a1a] flex items-center justify-center shrink-0 border border-[#dae0e2] dark:border-[#27272a]">
                          {getIcon(idea.integration)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-[#343434] dark:text-white truncate pr-4">
                            {idea.title}
                          </p>
                          <p className="text-xs text-[#343434]/60 dark:text-white/60 mt-1 line-clamp-2 leading-relaxed">
                            {idea.description}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-[9px] font-bold text-[#343434]/40 dark:text-white/40 uppercase tracking-widest flex items-center gap-1">
                          {t.chat.via} {formatIntegrationName(idea.integration)}
                        </span>
                        <button
                          onClick={() => handleRun(idea)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#343434] dark:bg-white text-white dark:text-[#0a0a0a] text-xs font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-sm"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          {t.chat.runAction}
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              <div className="sticky bottom-0 bg-white dark:bg-[#1a1a1a] border-t border-[#dae0e2] dark:border-[#27272a] px-4 py-3">
                <a
                  href="/settings/dashboard"
                  className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-[#f8f9fa] dark:bg-[#0a0a0a] text-[#343434] dark:text-white text-xs font-medium hover:bg-[#d6dfe8] dark:hover:bg-[#27272a] transition-colors"
                >
                  <BarChart3 className="w-4 h-4" />
                  View Analytics Dashboard
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
