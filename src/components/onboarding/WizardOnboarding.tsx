"use client";

import { useState, useEffect } from "react";
import { X, Check, ArrowRight, Sparkles, MessageSquare, Users, Target, Zap, ChevronRight, RotateCcw, Play, Link2, Send, Calendar, Mail, FileText, Bot, PlusSquare, CalendarDays, BarChart3, TrendingUp, Settings, Image as ImageIcon, Clock, Share2, Palette, Volume2, Globe, Layout, User, Gauge, MousePointer, Eye, Mic, Headphones, MessageCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  icon: typeof Sparkles;
  iconGradient: string;
  action: string;
  completed: boolean;
  chatExplanation: string;
    visualDemo?: {
      type: "welcome" | "apps" | "chat" | "create-post" | "schedule" | "conversations" | "calendar" | "assistant" | "autopilot" | "settings" | "success" | "agent-takeover" | "website-builder" | "custom-profile" | "dashboard" | "voice" | "support";
      content: string[];
    };
  }
  
    const ONBOARDING_STEPS: OnboardingStep[] = [
      {
        id: 1,
        title: "Welcome to Beauto",
        description: "Your AI-powered automation assistant is ready to supercharge your workflow. Let's take a tour of all the powerful features available.",
        icon: Sparkles,
        iconGradient: "from-purple-500 to-pink-600",
        action: "Start Tour",
        completed: false,
        chatExplanation: "Hi! I'm your AI assistant. I'll help you:\n\n• Automate repetitive tasks\n• Connect all your apps\n• Schedule actions for later\n• Let AI agents work for you\n• Build websites with AI\n\nLet me show you everything!",
        visualDemo: {
          type: "welcome",
          content: ["Marketing on autopilot", "Email automation", "Social media management", "AI-powered workflows", "Website creation"]
        }
      },
      {
        id: 2,
        title: "Live Voice Assistant",
        description: "Talk to your AI assistant in real-time. Use voice commands to automate tasks, ask questions, or control your apps hands-free.",
        icon: Mic,
        iconGradient: "from-blue-500 to-indigo-600",
        action: "Try Voice",
        completed: false,
        chatExplanation: "Voice mode allows you to:\n\n🎙️ Talk naturally with AI\n⚡ Execute commands instantly\n🎧 Listen to audio responses\n🚗 Hands-free productivity\n🌍 Multi-language support\n\nJust click the microphone icon!",
        visualDemo: {
          type: "voice",
          content: ["Listening...", "How can I help you today?", "Schedule a meeting for tomorrow at 10 AM"]
        }
      },
      {
        id: 3,
        title: "Create Website with AI",
        description: "Build beautiful, responsive websites in seconds. Just describe what you want, and AI generates the complete design and code.",
        icon: Globe,
        iconGradient: "from-emerald-500 to-teal-600",
        action: "Build Website",
        completed: false,
        chatExplanation: "Website Builder features:\n\n🎨 AI-generated designs\n📱 Mobile-responsive layouts\n⚡ Lightning-fast pages\n🔧 Customizable components\n🚀 One-click deployment\n\nFrom idea to live website in minutes!",
        visualDemo: {
          type: "website-builder",
          content: []
        }
      },
    {
      id: 4,
      title: "Social Media Autopilot",
      description: "Set your social media on autopilot. AI creates content, finds optimal posting times, and publishes automatically while you focus on your business.",
      icon: Zap,
      iconGradient: "from-yellow-500 to-orange-600",
      action: "Enable Autopilot",
      completed: false,
      chatExplanation: "Autopilot handles everything:\n\n🤖 AI generates content daily\n📅 Auto-schedules optimal times\n📊 Monitors engagement\n🎯 Targets your audience\n💡 Suggests trending topics\n\nSet it once, watch your socials grow!",
      visualDemo: {
        type: "autopilot",
        content: []
      }
    },
    {
      id: 5,
      title: "Connect Your Apps",
      description: "Connect Gmail, Slack, Instagram, or 900+ other apps. This lets me send emails, schedule posts, and automate tasks across your tools.",
      icon: Link2,
      iconGradient: "from-blue-500 to-cyan-600",
      action: "View Apps",
      completed: false,
      chatExplanation: "To unlock my full potential, connect apps like:\n\n🔗 Gmail - Send emails automatically\n🔗 Instagram - Schedule & publish posts\n🔗 LinkedIn - Share business updates\n🔗 Slack - Team notifications\n🔗 Google Sheets - Data sync\n\nClick 'Apps' in the sidebar to connect!",
      visualDemo: {
        type: "apps",
        content: ["gmail", "instagram", "linkedin", "slack", "googlesheets", "hubspot", "notion", "shopify"]
      }
    },
    {
      id: 6,
      title: "Marketplace & Templates",
      description: "Discover pre-built automation templates and industry-specific tools in our marketplace. Get started instantly with proven workflows.",
      icon: PlusSquare,
      iconGradient: "from-indigo-500 to-purple-600",
      action: "Browse Marketplace",
      completed: false,
      chatExplanation: "Find everything you need in our Marketplace:\n\n🏪 Pre-built AI agents\n📦 Industry-specific templates\n🛠️ Custom automation tools\n📈 Proven business workflows\n🔄 Community-shared solutions\n\nSave hours of setup time!",
      visualDemo: {
        type: "assistant",
        content: ["I want a real estate template", "Here are the best templates for Real Estate:\n• Property Listing Bot\n• Lead Nurture Flow\n• Market Update Generator"]
      }
    },
    {
      id: 7,
      title: "Scheduled Actions & Calendar",
      description: "Automate your future. Schedule tasks, emails, and social posts. Manage everything in a visual calendar to stay organized.",
      icon: CalendarDays,
      iconGradient: "from-orange-500 to-red-600",
      action: "View Calendar",
      completed: false,
      chatExplanation: "Manage your time with Scheduled Actions:\n\n📅 Visual automation calendar\n⏰ Precise timing for all tasks\n🔄 Recurring automation flows\n📱 Cross-platform scheduling\n📊 Clear overview of your week\n\nSet your business on cruise control!",
      visualDemo: {
        type: "schedule",
        content: []
      }
    },
    {
      id: 8,
      title: "You're All Set!",
      description: "Beauto is ready to automate your workflow. Start chatting, explore features, or connect more apps whenever you're ready.",
      icon: Users,
      iconGradient: "from-emerald-500 to-green-600",
      action: "Start Using Beauto",
      completed: false,
      chatExplanation: "🎉 You're all set!\n\nHere's what you can do next:\n\n✨ Start a conversation\n📅 Schedule your first task\n🔗 Connect more apps\n🤖 Enable autopilot\n🌐 Build a website\n\nReady to automate? Let's go!",
      visualDemo: {
        type: "success",
        content: ["You're ready to use Beauto!", "Start chatting to see the magic happen"]
      }
    },
  ];

interface WizardOnboardingProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WizardOnboarding({ isOpen, onClose }: WizardOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState(ONBOARDING_STEPS);
  const [isAnimating, setIsAnimating] = useState(false);
  const [demoAnimation, setDemoAnimation] = useState(0);

  useEffect(() => {
    if (isOpen) {
      const interval = setInterval(() => {
        setDemoAnimation(prev => prev + 1);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNext = async () => {
    if (currentStep === steps.length - 1) {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        await supabase
          .from('user_profiles')
          .upsert({ 
            user_id: user.id, 
            onboarding_completed: true,
            updated_at: new Date().toISOString()
          });
      }
      
      onClose();
      return;
    }

    setIsAnimating(true);
    
    const updatedSteps = [...steps];
    updatedSteps[currentStep].completed = true;
    setSteps(updatedSteps);

    setTimeout(() => {
      setCurrentStep(currentStep + 1);
      setIsAnimating(false);
    }, 400);
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setSteps(ONBOARDING_STEPS.map(step => ({ ...step, completed: false })));
  };

  const handleSkip = () => {
    onClose();
  };

  const currentStepData = steps[currentStep];
  const StepIcon = currentStepData.icon;
  const progress = ((currentStep + 1) / steps.length) * 100;

  const renderVisualDemo = () => {
    const demo = currentStepData.visualDemo;
    if (!demo) return null;

    switch (demo.type) {
        case "welcome":
          return (
            <div className="space-y-3 animate-fade-in">
              <div className="grid grid-cols-1 gap-2">
                {demo.content.map((feature, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-3 p-3 rounded-xl bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-sm border border-[#dae0e2] dark:border-[#27272a] transition-all duration-500 ${
                      demoAnimation % demo.content.length === idx ? "scale-105 border-purple-500 shadow-lg" : ""
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${
                      idx === 0 ? "from-blue-500 to-blue-600" :
                      idx === 1 ? "from-green-500 to-emerald-600" :
                      idx === 2 ? "from-orange-500 to-red-600" :
                      idx === 3 ? "from-indigo-500 to-purple-600" :
                      "from-purple-500 to-pink-600"
                    } flex items-center justify-center`}>
                      {idx === 0 && <Target className="w-4 h-4 text-white" />}
                      {idx === 1 && <Mail className="w-4 h-4 text-white" />}
                      {idx === 2 && <Share2 className="w-4 h-4 text-white" />}
                      {idx === 3 && <Zap className="w-4 h-4 text-white" />}
                      {idx === 4 && <Globe className="w-4 h-4 text-white" />}
                    </div>
                    <span className="text-sm font-medium text-[#343434] dark:text-white">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          );

        case "voice":
          return (
            <div className="space-y-4 animate-fade-in flex flex-col items-center justify-center py-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-blue-500/20 flex items-center justify-center animate-pulse">
                  <div className="w-16 h-16 rounded-full bg-blue-500/40 flex items-center justify-center">
                    <Mic className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
                <div className="absolute -top-1 -right-1 flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                </div>
              </div>
              <div className="space-y-2 w-full">
                {demo.content.map((text, i) => (
                  <div 
                    key={i} 
                    className={`p-2 rounded-lg text-xs transition-all duration-500 ${
                      demoAnimation % demo.content.length === i 
                        ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 scale-105 border border-blue-200" 
                        : "bg-white/60 dark:bg-[#1a1a1a]/60 text-[#343434]/40 dark:text-white/40 opacity-50"
                    }`}
                  >
                    {text}
                  </div>
                ))}
              </div>
            </div>
          );

      case "dashboard":
        return (
          <div className="space-y-3 animate-fade-in">
            <div className="p-4 rounded-xl bg-white/80 dark:bg-[#1a1a1a]/80 border border-[#dae0e2] dark:border-[#27272a]">
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { label: "Tasks Today", value: "12", color: "text-blue-600", bg: "bg-blue-50" },
                  { label: "Automated", value: "847", color: "text-green-600", bg: "bg-green-50" },
                  { label: "Time Saved", value: "24h", color: "text-purple-600", bg: "bg-purple-50" }
                ].map((stat, i) => (
                  <div key={i} className={`p-3 rounded-lg ${stat.bg} dark:bg-[#27272a]`}>
                    <p className="text-lg font-bold text-[#343434] dark:text-white">{stat.value}</p>
                    <p className="text-[10px] text-[#343434]/60 dark:text-white/60">{stat.label}</p>
                  </div>
                ))}
              </div>
              <div className="h-24 rounded-lg bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center">
                <BarChart3 className="w-8 h-8 text-blue-500/50" />
                <span className="ml-2 text-xs text-blue-600/50">Activity Chart</span>
              </div>
            </div>
            <div className="flex gap-2">
              {["New Chat", "Schedule", "Apps", "Settings"].map((btn, i) => (
                <button key={i} className="flex-1 p-2 rounded-lg bg-white/60 dark:bg-[#1a1a1a]/60 border border-[#dae0e2] dark:border-[#27272a] text-[10px] font-medium text-[#343434] dark:text-white">
                  {btn}
                </button>
              ))}
            </div>
          </div>
        );

      case "apps":
        return (
          <div className="grid grid-cols-4 gap-2 animate-fade-in">
            {demo.content.map((app, idx) => (
              <div
                key={app}
                className={`p-3 rounded-xl bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-sm border border-[#dae0e2] dark:border-[#27272a] hover:border-blue-500 transition-all cursor-pointer ${
                  idx < 4 ? "ring-2 ring-green-500 ring-offset-2" : ""
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-[#f8f9fa] dark:bg-[#27272a] mx-auto mb-1 overflow-hidden flex items-center justify-center">
                  <Image src={`https://logos.composio.dev/api/${app}`} alt={app} width={24} height={24} unoptimized />
                </div>
                <p className="text-[10px] text-center text-[#343434]/60 dark:text-white/60 truncate capitalize">{app}</p>
                {idx < 4 && (
                  <div className="flex justify-center mt-1">
                    <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">Connected</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        );

      case "schedule":
        return (
          <div className="space-y-3 animate-fade-in">
            <div className="grid grid-cols-7 gap-1">
              {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                <div key={i} className="text-center text-[10px] text-[#343434]/40 dark:text-white/40 font-medium">{d}</div>
              ))}
              {Array.from({ length: 14 }).map((_, i) => (
                <div
                  key={i}
                  className={`aspect-square rounded-lg flex items-center justify-center text-xs ${
                    [2, 5, 8, 11].includes(i)
                      ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white font-medium"
                      : "bg-white/60 dark:bg-[#1a1a1a]/60 text-[#343434]/60 dark:text-white/60"
                  }`}
                >
                  {i + 16}
                </div>
              ))}
            </div>
            <div className="space-y-2">
              {[
                { time: "9:00 AM", platform: "gmail", title: "Send weekly report" },
                { time: "12:00 PM", platform: "instagram", title: "Publish product post" },
                { time: "3:00 PM", platform: "slack", title: "Team standup reminder" }
              ].map((post, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-white/60 dark:bg-[#1a1a1a]/60 border border-[#dae0e2] dark:border-[#27272a]">
                  <Clock className="w-3 h-3 text-[#343434]/40 dark:text-white/40" />
                  <span className="text-[10px] text-[#343434]/60 dark:text-white/60">{post.time}</span>
                  <Image src={`https://logos.composio.dev/api/${post.platform}`} alt={post.platform} width={14} height={14} unoptimized />
                  <span className="text-xs text-[#343434] dark:text-white flex-1 truncate">{post.title}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case "conversations":
        return (
          <div className="space-y-2 animate-fade-in">
            {[
              { name: "Sarah M.", platform: "instagram", msg: "Love your new collection! 💕", time: "2m", unread: true },
              { name: "John D.", platform: "facebook", msg: "When does the sale end?", time: "15m", unread: true },
              { name: "Emma K.", platform: "linkedin", msg: "Great article, would love to...", time: "1h", unread: false }
            ].map((conv, idx) => (
              <div key={idx} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                conv.unread 
                  ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800" 
                  : "bg-white/60 dark:bg-[#1a1a1a]/60 border-[#dae0e2] dark:border-[#27272a]"
              }`}>
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600" />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white dark:bg-[#1a1a1a] flex items-center justify-center">
                    <Image src={`https://logos.composio.dev/api/${conv.platform}`} alt={conv.platform} width={10} height={10} unoptimized />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[#343434] dark:text-white">{conv.name}</span>
                    <span className="text-[10px] text-[#343434]/40 dark:text-white/40">{conv.time}</span>
                  </div>
                  <p className="text-[11px] text-[#343434]/60 dark:text-white/60 truncate">{conv.msg}</p>
                </div>
                {conv.unread && <div className="w-2 h-2 rounded-full bg-blue-500" />}
              </div>
            ))}
          </div>
        );

      case "calendar":
        return (
          <div className="animate-fade-in">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => (
                <div key={d} className="text-center text-[9px] text-[#343434]/40 dark:text-white/40 font-medium">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 21 }).map((_, i) => {
                const hasPost = [2, 4, 6, 9, 11, 14, 16, 18].includes(i);
                const colors = ["bg-pink-500", "bg-blue-500", "bg-purple-500", "bg-green-500"];
                return (
                  <div key={i} className="aspect-square rounded-lg bg-white/60 dark:bg-[#1a1a1a]/60 border border-[#dae0e2] dark:border-[#27272a] p-0.5 flex flex-col items-center justify-center gap-0.5">
                    <span className="text-[9px] text-[#343434]/60 dark:text-white/60">{i + 1}</span>
                    {hasPost && (
                      <div className="flex gap-0.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${colors[i % 4]}`} />
                        {i % 3 === 0 && <div className={`w-1.5 h-1.5 rounded-full ${colors[(i + 1) % 4]}`} />}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );

      case "assistant":
        return (
          <div className="space-y-3 animate-fade-in">
            <div className="flex justify-end">
              <div className="max-w-[85%] px-3 py-2 rounded-xl bg-[#343434] dark:bg-white text-white dark:text-[#0a0a0a] text-xs">
                {demo.content[0]}
              </div>
            </div>
            <div className="flex justify-start">
              <div className="max-w-[85%] px-3 py-2 rounded-xl bg-white dark:bg-[#1a1a1a] border border-[#dae0e2] dark:border-[#27272a] text-[#343434] dark:text-white text-xs whitespace-pre-line">
                {demo.content[1]}
              </div>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 px-3 py-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-[10px] font-medium">
                Draft Replies
              </button>
              <button className="flex-1 px-3 py-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-[10px] font-medium">
                Mark as Read
              </button>
            </div>
          </div>
        );

      case "autopilot":
        return (
          <div className="space-y-3 animate-fade-in">
            <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-5 h-5 text-yellow-600" />
                <span className="text-sm font-semibold text-[#343434] dark:text-white">Autopilot Active</span>
                <div className="ml-auto w-10 h-5 rounded-full bg-green-500 flex items-end justify-end p-0.5">
                  <div className="w-4 h-4 rounded-full bg-white" />
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { label: "Posts created today", value: "5" },
                  { label: "Scheduled this week", value: "21" },
                  { label: "Engagement boost", value: "+63%" }
                ].map((stat, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span className="text-[#343434]/60 dark:text-white/60">{stat.label}</span>
                    <span className="font-semibold text-[#343434] dark:text-white">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-green-600 dark:text-green-400 font-medium">AI is actively managing your content</span>
            </div>
          </div>
        );

      case "agent-takeover":
        return (
          <div className="space-y-3 animate-fade-in">
            <div className="relative p-4 rounded-xl bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-800 overflow-hidden">
              <div className="absolute top-2 right-2 flex gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[8px] text-red-600 font-bold uppercase">Live</span>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <MousePointer className="w-5 h-5 text-red-600" />
                <span className="text-sm font-semibold text-[#343434] dark:text-white">Agent Takeover</span>
              </div>
              <div className="space-y-2">
                <div className="h-20 rounded-lg bg-white/80 dark:bg-[#1a1a1a]/80 border border-[#dae0e2] dark:border-[#27272a] flex items-center justify-center overflow-hidden relative">
                  <Globe className="w-8 h-8 text-[#343434]/20" />
                  <div className="absolute w-4 h-4 bg-red-500 rounded-full animate-bounce shadow-lg" style={{ top: '30%', left: '40%' }} />
                </div>
                <div className="flex items-center gap-2 text-[10px] text-[#343434]/60 dark:text-white/60">
                  <Eye className="w-3 h-3" />
                  <span>Navigating to Google Flights...</span>
                </div>
              </div>
            </div>
            <p className="text-[10px] text-center text-[#343434]/50 dark:text-white/50">Watch AI complete tasks visually in your browser</p>
          </div>
        );

        case "website-builder":
          return (
            <div className="space-y-3 animate-fade-in">
              <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800 shadow-inner">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-400" />
                    <div className="w-2 h-2 rounded-full bg-yellow-400" />
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                  </div>
                  <div className="h-4 w-32 bg-white/50 rounded-full border border-emerald-100 flex items-center px-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 mr-2" />
                    <div className="h-1.5 w-full bg-emerald-100 rounded" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-32 rounded-lg bg-white dark:bg-[#0a0a0a] border border-[#dae0e2] dark:border-[#27272a] p-3 overflow-hidden shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <div className="h-3 w-16 bg-[#343434] dark:bg-white rounded" />
                      <div className="flex gap-2">
                        <div className="h-2 w-4 bg-[#dae0e2] rounded" />
                        <div className="h-2 w-4 bg-[#dae0e2] rounded" />
                      </div>
                    </div>
                    <div className="flex gap-3 mb-4">
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded" />
                        <div className="h-2 w-3/4 bg-[#dae0e2] rounded" />
                        <div className="h-2 w-1/2 bg-[#dae0e2] rounded" />
                      </div>
                      <div className="w-16 h-16 rounded-lg bg-[#f8f9fa] border border-[#dae0e2] flex items-center justify-center">
                         <Sparkles className="w-6 h-6 text-emerald-500/30" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-8 rounded bg-[#f8f9fa] border border-[#dae0e2]" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {["Header", "Hero", "Features", "Footer"].map((section, i) => (
                  <button key={i} className="flex-1 p-1.5 rounded-lg bg-white/60 dark:bg-[#1a1a1a]/60 border border-[#dae0e2] dark:border-[#27272a] text-[9px] font-medium text-[#343434] dark:text-white hover:bg-emerald-50 transition-colors">
                    {section}
                  </button>
                ))}
              </div>
            </div>
          );

        case "autopilot":
          return (
            <div className="space-y-3 animate-fade-in">
              <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800 shadow-inner">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-5 h-5 text-yellow-600" />
                  <span className="text-sm font-bold text-[#343434] dark:text-white uppercase tracking-wider">Growth Engine</span>
                  <div className="ml-auto flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[8px] font-bold text-green-600 uppercase">Live</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="bg-white/80 dark:bg-[#1a1a1a]/80 p-3 rounded-xl border border-yellow-100">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="w-3 h-3 text-yellow-600" />
                      <span className="text-[9px] text-yellow-700/60 font-medium">Reach</span>
                    </div>
                    <p className="text-lg font-bold text-[#343434]">+124%</p>
                  </div>
                  <div className="bg-white/80 dark:bg-[#1a1a1a]/80 p-3 rounded-xl border border-yellow-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="w-3 h-3 text-orange-600" />
                      <span className="text-[9px] text-orange-700/60 font-medium">Leads</span>
                    </div>
                    <p className="text-lg font-bold text-[#343434]">842</p>
                  </div>
                </div>
                <div className="p-3 bg-white/40 rounded-lg border border-yellow-100/50">
                  <div className="flex justify-between items-center text-[10px] mb-2">
                    <span className="text-yellow-800/60 font-medium">Weekly Content Schedule</span>
                    <span className="text-yellow-800 font-bold">85% Done</span>
                  </div>
                  <div className="h-1.5 w-full bg-yellow-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 w-[85%]" />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="w-3 h-3 text-yellow-600 animate-spin-slow" />
                <span className="text-[10px] text-yellow-600 dark:text-yellow-400 font-bold uppercase tracking-widest">AI is actively managing your content</span>
              </div>
            </div>
          );

        case "custom-profile":
          return (
            <div className="space-y-3 animate-fade-in">
              <div className="p-4 rounded-xl bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 border border-pink-200 dark:border-pink-800">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white font-bold text-lg">
                    A
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#343434] dark:text-white">Acme Corp Agent</p>
                    <p className="text-[10px] text-[#343434]/60 dark:text-white/60">AI Assistant</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {[
                    { label: "Voice", value: "Friendly & Professional" },
                    { label: "Audience", value: "Small Business Owners" },
                    { label: "Integrations", value: "Gmail, Slack, HubSpot" }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className="text-[#343434]/60 dark:text-white/60">{item.label}</span>
                      <span className="text-[#343434] dark:text-white font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <div className="w-4 h-4 rounded-full bg-pink-500" />
                <div className="w-4 h-4 rounded-full bg-rose-500" />
                <div className="w-4 h-4 rounded-full bg-purple-500" />
                <div className="w-4 h-4 rounded-full bg-blue-500" />
                <span className="text-[10px] text-[#343434]/60 dark:text-white/60 ml-2">Brand Colors</span>
              </div>
            </div>
          );

      case "settings":
        return (
          <div className="space-y-2 animate-fade-in">
            {[
              { icon: Palette, label: "Theme", value: "Auto" },
              { icon: Volume2, label: "Notifications", value: "Enabled" },
              { icon: Clock, label: "Default Schedule", value: "9 AM" },
              { icon: Link2, label: "Connected Apps", value: "12" }
            ].map((setting, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-white/60 dark:bg-[#1a1a1a]/60 border border-[#dae0e2] dark:border-[#27272a]">
                <setting.icon className="w-4 h-4 text-[#343434]/40 dark:text-white/40" />
                <span className="text-xs text-[#343434] dark:text-white flex-1">{setting.label}</span>
                <span className="text-xs text-[#343434]/60 dark:text-white/60 px-2 py-1 rounded-full bg-[#d6dfe8] dark:bg-[#27272a]">{setting.value}</span>
              </div>
            ))}
          </div>
        );

      case "success":
        return (
          <div className="text-center p-6 animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/30">
              <Check className="w-10 h-10 text-white" />
            </div>
            <p className="text-lg font-semibold text-[#343434] dark:text-white mb-1">{demo.content[0]}</p>
            <p className="text-sm text-[#343434]/60 dark:text-white/60">{demo.content[1]}</p>
            <div className="flex justify-center gap-3 mt-4">
              {["gmail", "slack", "instagram", "notion"].map(p => (
                <div key={p} className="w-10 h-10 rounded-full bg-white dark:bg-[#1a1a1a] border border-[#dae0e2] dark:border-[#27272a] flex items-center justify-center">
                  <Image src={`https://logos.composio.dev/api/${p}`} alt={p} width={20} height={20} unoptimized />
                </div>
              ))}
            </div>
          </div>
        );

      case "create-post":
        return (
          <div className="space-y-3 animate-fade-in">
            <div className="p-4 rounded-xl bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-sm border border-[#dae0e2] dark:border-[#27272a]">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <ImageIcon className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <div className="h-2 w-20 bg-[#d6dfe8] dark:bg-[#27272a] rounded animate-pulse" />
                </div>
              </div>
              <div className="aspect-video rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center mb-3">
                <div className="text-center">
                  <Sparkles className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                  <p className="text-xs text-purple-600 dark:text-purple-400">AI generating image...</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 w-full bg-[#d6dfe8] dark:bg-[#27272a] rounded" />
                <div className="h-3 w-3/4 bg-[#d6dfe8] dark:bg-[#27272a] rounded" />
              </div>
            </div>
            <div className="flex gap-2">
              {["instagram", "facebook", "linkedin", "twitter"].map(p => (
                <div key={p} className="flex-1 p-2 rounded-lg bg-white/60 dark:bg-[#1a1a1a]/60 border border-[#dae0e2] dark:border-[#27272a] flex items-center justify-center">
                  <Image src={`https://logos.composio.dev/api/${p}`} alt={p} width={16} height={16} unoptimized />
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-transparent rounded-full blur-3xl animate-float" style={{ animationDuration: '20s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-gradient-to-br from-pink-400/20 via-purple-400/20 to-transparent rounded-full blur-3xl animate-float-slow" style={{ animationDuration: '25s' }} />
      </div>

      <div 
        className={`relative w-full max-w-5xl mx-4 bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-2xl overflow-hidden transition-all duration-400 max-h-[90vh] overflow-y-auto ${
          isAnimating ? "scale-95 opacity-50" : "scale-100 opacity-100"
        }`}
      >
        <div className="sticky top-0 bg-white dark:bg-[#1a1a1a] z-10 border-b border-[#dae0e2] dark:border-[#27272a]">
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${currentStepData.iconGradient} flex items-center justify-center`}>
                <StepIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-semibold text-[#343434] dark:text-white">Setup Wizard</span>
                <p className="text-xs text-[#343434]/40 dark:text-white/40">Step {currentStep + 1} of {steps.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRestart}
                className="p-2 rounded-full hover:bg-[#d6dfe8]/50 dark:hover:bg-[#27272a] transition-colors"
                title="Restart tutorial"
              >
                <RotateCcw className="w-5 h-5 text-[#343434]/60 dark:text-white/60" />
              </button>
              <button
                onClick={handleSkip}
                className="p-2 rounded-full hover:bg-[#d6dfe8]/50 dark:hover:bg-[#27272a] transition-colors"
              >
                <X className="w-5 h-5 text-[#343434]/60 dark:text-white/60" />
              </button>
            </div>
          </div>

          <div className="h-1.5 bg-[#d6dfe8] dark:bg-[#27272a]">
            <div 
              className={`h-full bg-gradient-to-r ${currentStepData.iconGradient} transition-all duration-500 ease-out`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="p-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-2">
                {steps.map((step, idx) => (
                  <div key={step.id} className="flex items-center">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300 ${
                        idx < currentStep
                          ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                          : idx === currentStep
                          ? `bg-gradient-to-r ${currentStepData.iconGradient} text-white scale-110 shadow-lg`
                          : "bg-[#d6dfe8] dark:bg-[#27272a] text-[#343434]/40 dark:text-white/40"
                      }`}
                    >
                      {idx < currentStep ? <Check className="w-3 h-3" /> : idx + 1}
                    </div>
                    {idx < steps.length - 1 && (
                      <div
                        className={`w-4 h-0.5 mx-0.5 transition-all duration-300 ${
                          idx < currentStep
                            ? "bg-gradient-to-r from-green-500 to-emerald-600"
                            : "bg-[#d6dfe8] dark:bg-[#27272a]"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-start mb-6">
                <div 
                  className={`relative w-20 h-20 rounded-2xl bg-gradient-to-br ${currentStepData.iconGradient} flex items-center justify-center shadow-2xl`}
                  style={{
                    transform: "perspective(1000px) rotateY(10deg) rotateX(5deg)",
                    animation: "float 3s ease-in-out infinite",
                  }}
                >
                  <StepIcon className="w-10 h-10 text-white" />
                  <div className="absolute inset-0 rounded-2xl bg-white/20 backdrop-blur-sm animate-pulse" />
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-[#343434] dark:text-white mb-3">
                  {currentStepData.title}
                </h2>
                <p className="text-base text-[#343434]/60 dark:text-white/60 leading-relaxed">
                  {currentStepData.description}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={handleNext}
                  className={`px-6 py-3 rounded-full bg-gradient-to-r ${currentStepData.iconGradient} text-white font-medium hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center gap-2`}
                >
                  {currentStepData.action}
                  {currentStep < steps.length - 1 ? (
                    <ChevronRight className="w-5 h-5" />
                  ) : (
                    <Check className="w-5 h-5" />
                  )}
                </button>
                <button
                  onClick={handleSkip}
                  className="px-6 py-3 rounded-full border border-[#dae0e2] dark:border-[#27272a] text-[#343434]/60 dark:text-white/60 hover:text-[#343434] dark:hover:text-white hover:bg-[#d6dfe8]/30 dark:hover:bg-[#27272a]/50 transition-colors"
                >
                  Skip Tutorial
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#f8f9fa] to-[#e8ecef] dark:from-[#0a0a0a] dark:to-[#1a1a1a] rounded-2xl border border-[#dae0e2] dark:border-[#27272a] p-6 flex flex-col">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[#dae0e2] dark:border-[#27272a]">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${currentStepData.iconGradient} flex items-center justify-center`}>
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#343434] dark:text-white">AI Assistant</p>
                  <p className="text-xs text-[#343434]/40 dark:text-white/40">Explaining {currentStepData.title.toLowerCase()}</p>
                </div>
              </div>

              <div className="flex-1 mb-4">
                <div className="p-4 rounded-xl bg-white dark:bg-[#1a1a1a] border border-[#dae0e2] dark:border-[#27272a] mb-4">
                  <p className="text-sm text-[#343434] dark:text-white whitespace-pre-line leading-relaxed">
                    {currentStepData.chatExplanation}
                  </p>
                </div>

                {renderVisualDemo()}
              </div>

              <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-[#dae0e2] dark:border-[#27272a] bg-white dark:bg-[#1a1a1a]">
                <input 
                  type="text" 
                  placeholder="Ask me anything..." 
                  className="flex-1 bg-transparent text-sm text-[#343434] dark:text-white placeholder:text-[#343434]/40 dark:placeholder:text-white/40 focus:outline-none"
                  disabled
                />
                <div className={`p-2 rounded-full bg-gradient-to-r ${currentStepData.iconGradient}`}>
                  <Send className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: perspective(1000px) rotateY(10deg) rotateX(5deg) translateY(0); }
          50% { transform: perspective(1000px) rotateY(10deg) rotateX(5deg) translateY(-10px); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
      `}</style>
    </div>
  );
}
