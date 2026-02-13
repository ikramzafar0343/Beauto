"use client";

import { useState, useEffect } from "react";
import { Sparkles, Play, X, Loader2, Calendar, Mail, Instagram, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
}

interface TaskIdeasProps {
  onRunAction: (prompt: string) => void;
}

export function TaskIdeas({ onRunAction }: TaskIdeasProps) {
  const { t } = useLanguage();
  const [ideas, setIdeas] = useState<TaskIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissingId, setDismissingId] = useState<string | null>(null);
  
  const formatIntegrationName = (integration: string) => {
    return integration.charAt(0).toUpperCase() + integration.slice(1).toLowerCase();
  };

  useEffect(() => {
    fetchIdeas();
  }, []);

  const fetchIdeas = async () => {
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
    setDismissingId(id);
    try {
      await fetch("/api/ai-ideas", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "dismissed" }),
      });
      setIdeas(prev => prev.filter(i => i.id !== id));
    } catch (error) {
      console.error("Failed to dismiss idea:", error);
    } finally {
      setDismissingId(null);
    }
  };

  const handleRun = async (idea: TaskIdea) => {
    onRunAction(idea.action_data.prompt);
    // Mark as completed
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

  if (loading && ideas.length === 0) return null;
  if (ideas.length === 0) return null;

  return (
    <div className="space-y-3 p-4">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-4 h-4 text-purple-500" />
        <h3 className="text-sm font-bold text-[#343434] dark:text-white">AI Task Ideas</h3>
      </div>
      
      <AnimatePresence mode="popLayout">
        {ideas.map((idea) => (
          <motion.div
            key={idea.id}
            layout
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className="group relative p-4 rounded-2xl bg-white dark:bg-[#1a1a1a] border border-[#dae0e2] dark:border-[#27272a] shadow-sm hover:shadow-md transition-all"
          >
            <button
              onClick={() => handleDismiss(idea.id)}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 text-[#343434]/20 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
            >
              <X className="w-3 h-3" />
            </button>

            <div className="flex items-start gap-3">
              <div className="mt-1 w-8 h-8 rounded-xl bg-[#f8f9fa] dark:bg-[#0a0a0a] flex items-center justify-center shrink-0 border border-[#dae0e2] dark:border-[#27272a]">
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

            <div className="mt-4 flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#343434]/40 dark:text-white/40 uppercase tracking-widest flex items-center gap-1">
                {t.chat.via} {formatIntegrationName(idea.integration)}
              </span>
              <button
                onClick={() => handleRun(idea)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#343434] dark:bg-white text-white dark:text-[#0a0a0a] text-xs font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-sm"
              >
                <Play className="w-3 h-3 fill-current" />
                {t.chat.runAction}
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
