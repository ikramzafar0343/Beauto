"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Play, 
  Pause, 
  ChevronRight, 
  ChevronLeft,
  Sparkles,
  Link2,
  Zap,
  Bot,
  Send,
  Loader2,
  CheckCircle2,
  Globe,
  MousePointer,
  Mic,
  Headphones,
  PlusSquare,
  CalendarDays,
  Users,
  Target,
  TrendingUp,
  Layout,
  Clock
} from "lucide-react";
import Image from "next/image";

interface Scene {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  icon: any;
  gradient: string;
  accentColor: string;
  persona?: {
    image: string;
    name: string;
    role: string;
  };
}

const PERSONA_IMAGES = {
  sales: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Gemini_Generated_Image_2sfngy2sfngy2sfn-1766079943448.png?width=8000&height=8000&resize=contain",
  admin: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Gemini_Generated_Image_76krx876krx876kr-1766079960841.png?width=8000&height=8000&resize=contain",
  accounting: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Gemini_Generated_Image_xfhe80xfhe80xfhe-1766079983224.png?width=8000&height=8000&resize=contain",
  support: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Gemini_Generated_Image_e9qcx4e9qcx4e9qc-1766080063714.png?width=8000&height=8000&resize=contain",
  hr: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Gemini_Generated_Image_hswwzghswwzghsww-1766080128781.png?width=8000&height=8000&resize=contain",
  marketing: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Gemini_Generated_Image_5y0ncy5y0ncy5y0n-1766080149784.png?width=8000&height=8000&resize=contain",
};

const SCENES: Scene[] = [
  {
    id: 1,
    title: "Welcome to Beauto",
    subtitle: "Your Vision, Automated",
    description: "Experience how AI transforms the way you work. From idea to execution in seconds.",
    icon: Sparkles,
    gradient: "from-violet-600 via-purple-600 to-indigo-700",
    accentColor: "violet",
  },
  {
    id: 2,
    title: "Live Voice Assistant",
    subtitle: "Natural Interaction",
    description: "Talk to your AI assistant in real-time. Execute commands and control your apps hands-free.",
    icon: Mic,
    gradient: "from-cyan-500 via-blue-600 to-indigo-700",
    accentColor: "cyan",
    persona: { image: PERSONA_IMAGES.admin, name: "Sofia", role: "Admin & Office" }
  },
  {
    id: 3,
    title: "Create Website with AI",
    subtitle: "Design & Deploy",
    description: "Build beautiful, responsive websites in seconds. Just describe it, and AI generates the design and code.",
    icon: Globe,
    gradient: "from-emerald-500 via-teal-600 to-cyan-700",
    accentColor: "emerald",
    persona: { image: PERSONA_IMAGES.marketing, name: "Emma", role: "Digital Marketer" }
  },
  {
    id: 4,
    title: "Social Media Autopilot",
    subtitle: "Growth on Autopilot",
    description: "AI creates content, finds optimal posting times, and publishes automatically while you focus on business.",
    icon: Zap,
    gradient: "from-amber-500 via-orange-600 to-red-600",
    accentColor: "amber",
    persona: { image: PERSONA_IMAGES.marketing, name: "Emma", role: "Digital Marketer" }
  },
  {
    id: 5,
    title: "Seamless Integrations",
    subtitle: "Connect Your Ecosystem",
    description: "Gmail, Slack, Instagram, and 900+ other apps working together in perfect harmony.",
    icon: Link2,
    gradient: "from-blue-500 via-indigo-600 to-violet-700",
    accentColor: "blue",
  },
  {
    id: 6,
    title: "Marketplace & Templates",
    subtitle: "Proven Workflows",
    description: "Discover pre-built automation templates and industry-specific tools to get started instantly.",
    icon: PlusSquare,
    gradient: "from-indigo-500 via-purple-600 to-pink-700",
    accentColor: "indigo",
    persona: { image: PERSONA_IMAGES.accounting, name: "James", role: "Accounting" }
  },
  {
    id: 7,
    title: "Scheduled Actions",
    subtitle: "Visual Calendar",
    description: "Automate your future. Schedule tasks, emails, and social posts to stay organized effortlessly.",
    icon: CalendarDays,
    gradient: "from-orange-500 via-red-600 to-rose-700",
    accentColor: "orange",
    persona: { image: PERSONA_IMAGES.hr, name: "David", role: "HR & Recruitment" }
  },
  {
    id: 8,
    title: "You're All Set!",
    subtitle: "Ready to Automate",
    description: "Start chatting, explore features, or connect more apps. Your automated journey begins now.",
    icon: Users,
    gradient: "from-emerald-500 via-green-600 to-teal-700",
    accentColor: "emerald",
  }
];

const MockChatUI = ({ sceneIndex, progress }: { sceneIndex: number; progress: number }) => {
  const [typingText, setTypingText] = useState("");
  const prompts = [
    "Welcome to Beauto! How can I help?",
    "Schedule a meeting for tomorrow at 10 AM",
    "Build a modern landing page for my bakery",
    "Create and schedule 5 Instagram posts",
    "Fetch my latest emails from Gmail",
    "Show me the Real Estate marketplace template",
    "Show my schedule for next week",
    "You're all set! Let's get started."
  ];
  
  const currentPrompt = prompts[sceneIndex] || prompts[0];

  useEffect(() => {
    const charCount = Math.floor((progress / 100) * currentPrompt.length);
    setTypingText(currentPrompt.slice(0, charCount));
  }, [sceneIndex, progress, currentPrompt]);

  const renderSceneContent = () => {
    switch (sceneIndex) {
      case 0:
        return (
          <div className="grid grid-cols-2 gap-3 mt-4">
            {["Marketing", "Sales", "Support", "Growth"].map((f, i) => (
              <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl flex items-center gap-3 hover:bg-white/10 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-white/90">{f}</span>
              </div>
            ))}
          </div>
        );
      case 1:
        return (
          <div className="flex flex-col items-center justify-center py-6 gap-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-cyan-500/20 animate-pulse flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/50">
                  <Mic className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5, 6, 7].map(i => (
                <motion.div 
                  key={i}
                  animate={{ height: [10, 30, 10] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
                  className="w-1 bg-gradient-to-t from-cyan-400 to-blue-500 rounded-full"
                />
              ))}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="mt-4 p-4 rounded-2xl bg-white/5 border border-emerald-500/30 backdrop-blur-xl overflow-hidden">
            <div className="flex items-center gap-1.5 mb-3">
              <div className="w-2 h-2 rounded-full bg-red-400" />
              <div className="w-2 h-2 rounded-full bg-yellow-400" />
              <div className="w-2 h-2 rounded-full bg-green-400" />
            </div>
            <div className="space-y-3">
              <div className="h-4 w-1/2 bg-emerald-500/30 rounded" />
              <div className="flex gap-3">
                <div className="flex-1 h-20 bg-emerald-500/10 rounded-lg border border-emerald-500/20" />
                <div className="w-20 h-20 bg-emerald-500/10 rounded-lg border border-emerald-500/20" />
              </div>
              <div className="h-8 w-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg" />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-amber-500/30 backdrop-blur-xl">
              <TrendingUp className="w-6 h-6 text-amber-400 mb-2" />
              <p className="text-2xl font-bold text-white">+142%</p>
              <p className="text-[10px] text-white/40 uppercase font-bold">Engagement</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-orange-500/30 backdrop-blur-xl">
              <Users className="w-6 h-6 text-orange-400 mb-2" />
              <p className="text-2xl font-bold text-white">1.2k</p>
              <p className="text-[10px] text-white/40 uppercase font-bold">New Followers</p>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="mt-4 grid grid-cols-4 gap-3">
            {["gmail", "slack", "instagram", "notion", "shopify", "hubspot", "twitter", "googledrive"].map(app => (
              <div key={app} className="aspect-square rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center p-3 hover:bg-white/10 hover:scale-110 transition-all backdrop-blur-xl">
                <Image src={`https://logos.composio.dev/api/${app}`} alt={app} width={24} height={24} unoptimized />
              </div>
            ))}
          </div>
        );
      case 5:
        return (
          <div className="mt-4 space-y-3">
            {[
              { name: "Real Estate Bot", category: "Industry", icon: Layout },
              { name: "Lead Nurture", category: "Marketing", icon: Target }
            ].map((t, i) => (
              <div key={i} className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4 backdrop-blur-xl hover:bg-white/10 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <t.icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-white">{t.name}</p>
                  <p className="text-[10px] text-white/40 uppercase font-black">{t.category}</p>
                </div>
                <PlusSquare className="w-5 h-5 text-indigo-400" />
              </div>
            ))}
          </div>
        );
      case 6:
        return (
          <div className="mt-4 p-4 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
            <div className="grid grid-cols-7 gap-1 mb-4">
              {Array.from({ length: 14 }).map((_, i) => (
                <div key={i} className={`aspect-square rounded-lg border ${[2, 5, 8, 11].includes(i) ? 'bg-gradient-to-br from-orange-500 to-red-500 border-orange-400' : 'bg-white/5 border-white/10'} flex items-center justify-center`}>
                  <span className={`text-[10px] font-bold ${[2, 5, 8, 11].includes(i) ? 'text-white' : 'text-white/30'}`}>{i + 1}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-2 rounded-xl bg-orange-500/10 border border-orange-500/20">
                <Clock className="w-4 h-4 text-orange-400" />
                <span className="text-xs font-bold text-orange-300">10:00 AM - Instagram Post</span>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <Clock className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold text-blue-300">02:00 PM - Email Newsletter</span>
              </div>
            </div>
          </div>
        );
      case 7:
        return (
          <div className="mt-8 flex flex-col items-center justify-center gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-2xl shadow-emerald-500/50">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-white mb-2 uppercase tracking-tight">System Ready</p>
              <p className="text-sm text-white/50 font-medium">Beauto is now managing your workflow</p>
            </div>
            <div className="flex -space-x-3 mt-4">
              {["gmail", "slack", "instagram", "notion"].map(app => (
                <div key={app} className="w-10 h-10 rounded-full bg-white/10 border-2 border-black shadow-lg flex items-center justify-center backdrop-blur-xl">
                  <Image src={`https://logos.composio.dev/api/${app}`} alt={app} width={20} height={20} unoptimized />
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
    <div className="w-full max-w-xl bg-black/40 backdrop-blur-2xl rounded-[32px] border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8)] overflow-hidden relative aspect-[4/3] flex flex-col scale-90 md:scale-100">
      <div className="px-6 py-4 border-b border-white/10 bg-black/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <div className="text-[11px] font-bold text-white/30 uppercase tracking-[0.2em]">Live Demonstration</div>
        <div className="w-6" />
      </div>

      <div className="flex-1 p-8 space-y-6 overflow-hidden relative">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={`scene-${sceneIndex}`}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="flex flex-col gap-6"
          >
            <div className="flex justify-end">
              <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-5 py-3 rounded-2xl rounded-tr-none shadow-xl shadow-purple-500/30 text-sm max-w-[85%] leading-relaxed">
                {typingText}
                {progress < 100 && (
                  <motion.span 
                    animate={{ opacity: [1, 0] }} 
                    transition={{ repeat: Infinity, duration: 0.6 }} 
                    className="inline-block w-0.5 h-4 bg-white/50 ml-1 translate-y-0.5" 
                  />
                )}
              </div>
            </div>

            {progress > 20 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex items-center gap-2.5 px-4 py-1 rounded-full bg-violet-500/20 border border-violet-500/30">
                    <Loader2 className="w-3 h-3 text-violet-400 animate-spin" />
                    <span className="text-[10px] font-bold text-violet-300 uppercase tracking-wider">
                      {progress < 90 ? "Processing..." : "Complete"}
                    </span>
                  </div>
                </div>
                
                <div className="ml-12">
                  {renderSceneContent()}
                </div>
              </motion.div>
            )}

            {progress > 90 && (
              <motion.div 
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="ml-12 flex items-center gap-2 text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-full w-fit border border-emerald-500/30 shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-[11px] font-bold uppercase tracking-[0.1em]">Verified</span>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="p-6 border-t border-white/10 bg-black/30 flex gap-4">
        <div className="flex-1 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center px-5">
          <motion.div 
            initial={{ width: "30%" }}
            animate={{ width: "60%" }}
            className="h-2.5 bg-white/10 rounded-full opacity-40" 
          />
        </div>
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30 transition-transform active:scale-90">
          <Send className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );
};

interface CinematicOnboardingProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CinematicOnboarding({ isOpen, onClose }: CinematicOnboardingProps) {
  const [currentScene, setCurrentScene] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

  const nextScene = useCallback(() => {
    if (currentScene < SCENES.length - 1) {
      setCurrentScene(prev => prev + 1);
      setProgress(0);
    } else {
      onClose();
    }
  }, [currentScene, onClose]);

  const prevScene = () => {
    if (currentScene > 0) {
      setCurrentScene(prev => prev - 1);
      setProgress(0);
    }
  };

  useEffect(() => {
    let interval: any;
    if (isOpen && isPlaying) {
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            nextScene();
            return 0;
          }
          return prev + 0.6; 
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isOpen, isPlaying, nextScene]);

  if (!isOpen) return null;

  const scene = SCENES[currentScene];

  return (
    <div className="fixed inset-0 z-[100] bg-[#0a0a0f] overflow-hidden flex items-center justify-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentScene}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
          className="absolute inset-0"
        >
          <div className="absolute inset-0">
            <div className={`absolute inset-0 bg-gradient-to-br ${scene.gradient} opacity-20`} />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),transparent)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(120,119,198,0.15),transparent_50%)]" />
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>

          <div className="relative h-full w-full flex flex-col md:flex-row items-center justify-center px-8 md:px-24 gap-12 md:gap-20 max-w-[1600px] mx-auto">
            
            <div className="flex-1 text-center md:text-left space-y-8 z-10 max-w-xl">
              <motion.div
                initial={{ opacity: 0, x: -60 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 1, ease: [0.22, 1, 0.36, 1] }}
              >
                {scene.persona && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center gap-4 mb-8"
                  >
                    <div className="relative">
                      <div className={`absolute -inset-1 bg-gradient-to-r ${scene.gradient} rounded-full blur-md opacity-60`} />
                      <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-white/20">
                        <Image 
                          src={scene.persona.image} 
                          alt={scene.persona.name}
                          fill
                          className="object-cover object-top"
                          unoptimized
                        />
                      </div>
                    </div>
                    <div>
                      <p className="text-white font-semibold">{scene.persona.name}</p>
                      <p className="text-white/40 text-sm">{scene.persona.role}</p>
                    </div>
                  </motion.div>
                )}

                <div className={`w-16 h-16 rounded-3xl bg-gradient-to-br ${scene.gradient} flex items-center justify-center shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] mb-10`}>
                  <scene.icon className="w-8 h-8 text-white" />
                </div>
                
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <h3 className="text-[11px] font-black tracking-[0.5em] uppercase text-white/30 mb-4">
                    {scene.subtitle}
                  </h3>
                  <h2 className="text-5xl md:text-7xl font-bold text-white tracking-tight leading-[1.05] mb-8">
                    {scene.title}
                  </h2>
                  <div className={`h-[2px] w-20 bg-gradient-to-r ${scene.gradient} mb-8`} />
                  <p className="text-lg md:text-xl text-white/50 leading-relaxed font-light">
                    {scene.description}
                  </p>
                </motion.div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="flex items-center gap-6"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-black text-white/5 tabular-nums">{currentScene + 1 < 10 ? `0${currentScene + 1}` : currentScene + 1}</span>
                  <div className="w-16 h-[1px] bg-white/10" />
                  <span className="text-xs font-bold text-white/20 tracking-widest uppercase">/ 10</span>
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.85, x: 100, rotateY: -20, rotateX: 5 }}
              animate={{ opacity: 1, scale: 1, x: 0, rotateY: 0, rotateX: 0 }}
              transition={{ delay: 0.5, duration: 1.5, type: "spring", damping: 25, stiffness: 60 }}
              className="flex-1 w-full [perspective:2000px] relative z-20"
            >
              <div className="relative group">
                <MockChatUI sceneIndex={currentScene} progress={progress} />
                
                <div className={`absolute -inset-10 bg-gradient-to-br ${scene.gradient} rounded-[60px] blur-[80px] -z-10 opacity-20 group-hover:opacity-30 transition-opacity duration-1000`} />
                <div className={`absolute top-0 -right-20 w-40 h-80 bg-gradient-to-b ${scene.gradient} blur-[100px] -z-10 opacity-20 animate-pulse`} />
                <div className={`absolute bottom-0 -left-20 w-40 h-80 bg-gradient-to-t ${scene.gradient} blur-[100px] -z-10 opacity-20 animate-pulse`} style={{ animationDelay: '1s' }} />
              </div>
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
                className="absolute -top-6 -right-6 px-4 py-2 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl z-30 hidden md:flex items-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Real-time API</span>
              </motion.div>
            </motion.div>

          </div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute top-10 left-10 md:left-20 flex items-center gap-8 z-[110]">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center shadow-2xl">
            <span className="text-white font-bold text-lg">B</span>
          </div>
          <div className="hidden md:block">
            <h4 className="text-[10px] font-black tracking-[0.3em] uppercase text-white/40">Exclusive Preview</h4>
            <p className="text-xs font-bold text-white/80">BEAUTO CORE v2.0</p>
          </div>
        </div>
      </div>

      <div className="absolute top-10 right-10 md:right-20 flex items-center gap-5 z-[110]">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="w-14 h-14 rounded-full bg-white/5 backdrop-blur-2xl border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all hover:scale-110 active:scale-90 group"
        >
          {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
        </button>
        <button
          onClick={onClose}
          className={`px-8 h-14 rounded-full bg-gradient-to-r ${scene.gradient} text-white flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest hover:opacity-90 hover:scale-105 active:scale-95 transition-all shadow-[0_10px_30px_-5px_rgba(139,92,246,0.4)]`}
        >
          Skip
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="absolute bottom-12 left-0 right-0 z-[110] px-10 md:px-20">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-center gap-12">
            <button
              onClick={prevScene}
              disabled={currentScene === 0}
              className="text-white/20 hover:text-white disabled:opacity-0 transition-all hover:scale-125"
            >
              <ChevronLeft className="w-12 h-12" />
            </button>

            <div className="flex-1 flex gap-4">
              {SCENES.map((s, i) => (
                <div 
                  key={i} 
                  className="h-1.5 flex-1 bg-white/5 rounded-full overflow-hidden relative cursor-pointer group"
                  onClick={() => {
                    setCurrentScene(i);
                    setProgress(0);
                  }}
                >
                  <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors" />
                  {i === currentScene && (
                    <motion.div 
                      className={`absolute inset-y-0 left-0 bg-gradient-to-r ${scene.gradient} shadow-[0_0_20px_rgba(139,92,246,0.8)]`}
                      style={{ width: `${progress}%` }}
                    />
                  )}
                  {i < currentScene && <div className={`absolute inset-0 bg-gradient-to-r ${s.gradient} opacity-60`} />}
                </div>
              ))}
            </div>

            <button
              onClick={nextScene}
              className="flex items-center gap-6 group"
            >
              <div className="text-right hidden xl:block">
                <p className="text-[10px] font-black tracking-[0.4em] uppercase text-white/30">Next Scene</p>
                <p className="text-sm font-black text-white uppercase group-hover:text-violet-400 transition-colors">
                  {currentScene === SCENES.length - 1 ? "Get Started" : SCENES[currentScene + 1].title}
                </p>
              </div>
              <div className={`w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white group-hover:bg-gradient-to-r ${scene.gradient} transition-all hover:scale-110`}>
                <ChevronRight className="w-8 h-8" />
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 pointer-events-none border-[40px] md:border-[60px] border-black/20" />
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_300px_rgba(0,0,0,0.9)]" />
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </div>
  );
}
