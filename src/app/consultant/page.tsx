"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { 
  Send, 
  Loader2, 
  Sparkles, 
  ArrowLeft, 
  Bot, 
  User, 
  CheckCircle2, 
  ShoppingCart, 
  Calendar,
  Zap,
  Layout,
  Globe,
  Plus
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { createClient } from "@/lib/supabase/client";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  recommendations?: {
    plan: string;
    apps: string[];
    reason: string;
  };
}

export default function ConsultantPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language, t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      } else {
        router.push("/auth/sign-in?redirect=/consultant");
      }
    };
    getUser();
  }, [router]);

  useEffect(() => {
    if (messages.length === 0 && currentUserId) {
      const welcomeMessage: Message = {
        id: "1",
        role: "assistant",
        content: t.consultant.title + "\n\n" + t.consultant.subtitle + "\n\nTo help you best, could you tell me a bit about your business and what you're looking to automate?",
      };
      setMessages([welcomeMessage]);
    }
  }, [currentUserId, messages.length, t]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading || !currentUserId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: inputValue,
          messages: messages.map(m => ({ role: m.role, content: m.content })),
          userId: currentUserId,
          isConsultant: true,
        }),
      });

      const data = await res.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response || "I'm sorry, I couldn't process that. Please try again.",
        recommendations: data.recommendations,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Consultant chat error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuy = (plan: string) => {
    // Redirect to purchase or stripe
    router.push(`/auth/sign-up?plan=${plan.toLowerCase()}`);
  };

  const handleDemo = () => {
    router.push("/demo");
  };

  return (
    <div className="flex flex-col h-screen bg-[#fcfcfd] dark:bg-[#0a0a0a] text-[#343434] dark:text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-[#dae0e2] dark:border-[#27272a] bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-xl z-20">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 rounded-full hover:bg-[#f3f4f6] dark:hover:bg-[#27272a] transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#343434] dark:bg-white flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white dark:text-[#0a0a0a]" />
            </div>
            <div>
              <h1 className="text-sm font-bold leading-none">AI Business Consultant</h1>
              <p className="text-[10px] text-[#343434]/50 dark:text-white/40">Powered by Beauto Intelligence</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleDemo}
            className="text-xs font-medium hover:text-blue-500 transition-colors"
          >
            Request Demo
          </button>
          <div className="h-4 w-[1px] bg-[#dae0e2] dark:bg-[#27272a]" />
          <Link href="/auth/sign-up" className="text-xs font-bold px-4 py-2 rounded-full bg-[#343434] dark:bg-white text-white dark:text-[#0a0a0a] hover:opacity-90 transition-opacity">
            Join Beauto
          </Link>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 overflow-y-auto relative custom-scrollbar">
        <div className="max-w-3xl mx-auto px-6 py-12 space-y-8">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex gap-4 ${message.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center ${
                message.role === "assistant" 
                  ? "bg-[#343434] dark:bg-white" 
                  : "bg-blue-500"
              }`}>
                {message.role === "assistant" ? (
                  <Bot className="w-4 h-4 text-white dark:text-[#0a0a0a]" />
                ) : (
                  <User className="w-4 h-4 text-white" />
                )}
              </div>
              <div className={`flex flex-col gap-2 max-w-[85%] ${message.role === "user" ? "items-end" : ""}`}>
                <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                  message.role === "assistant"
                    ? "bg-white dark:bg-[#1a1a1a] border border-[#dae0e2] dark:border-[#27272a] shadow-sm"
                    : "bg-[#343434] dark:bg-white text-white dark:text-[#0a0a0a]"
                }`}>
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>

                {message.recommendations && (
                  <div className="mt-4 w-full p-6 rounded-[32px] bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800/30 animate-fade-in">
                    <div className="flex items-center gap-2 mb-4">
                      <Zap className="w-5 h-5 text-blue-600" />
                      <h3 className="font-bold text-blue-900 dark:text-blue-100">Recommended Stack</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-blue-600 font-bold mb-1">Recommended Plan</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-white">{message.recommendations.plan}</p>
                      </div>
                      
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-blue-600 font-bold mb-2">Apps to integrate</p>
                        <div className="flex flex-wrap gap-2">
                          {message.recommendations.apps.map(app => (
                            <div key={app} className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-white/5 rounded-xl border border-blue-100 dark:border-white/10 shadow-sm">
                              <Image 
                                src={`https://logos.composio.dev/api/${app.toLowerCase()}`}
                                alt={app}
                                width={14}
                                height={14}
                                unoptimized
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "/beauto-logo.png";
                                }}
                              />
                              <span className="text-xs font-medium">{app}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2">
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed italic">
                          "{message.recommendations.reason}"
                        </p>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <button 
                          onClick={() => handleBuy(message.recommendations!.plan)}
                          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          Get Started
                        </button>
                        <button 
                          onClick={handleDemo}
                          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-white dark:bg-white/5 text-[#343434] dark:text-white border border-[#dae0e2] dark:border-white/10 font-bold text-sm hover:bg-[#f8f9fa] dark:hover:bg-white/10 transition-all"
                        >
                          <Calendar className="w-4 h-4" />
                          Free Demo
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-4 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-[#dae0e2] dark:bg-[#27272a] flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin text-[#343434]/40" />
              </div>
              <div className="h-12 w-48 bg-[#f3f4f6] dark:bg-[#1a1a1a] rounded-2xl" />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <div className="p-6 border-t border-[#dae0e2] dark:border-[#27272a] bg-white dark:bg-[#0a0a0a]">
        <div className="max-w-3xl mx-auto relative">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Describe your business and what you want to achieve..."
            className="w-full pl-6 pr-14 py-4 rounded-[28px] border border-[#dae0e2] dark:border-[#27272a] bg-[#fcfcfd] dark:bg-[#1a1a1a] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all resize-none max-h-32 min-h-[56px]"
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            className={`absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-full transition-all ${
              inputValue.trim() && !isLoading
                ? "bg-[#343434] dark:bg-white text-white dark:text-[#0a0a0a] shadow-lg"
                : "bg-[#dae0e2] dark:bg-[#27272a] text-white/50 cursor-not-allowed"
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[10px] text-center mt-3 text-[#343434]/40 dark:text-white/40">
          Beauto AI can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
}
