"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from "framer-motion";
import { 
  CheckCircle2, 
  Loader2, 
  Zap, 
  Sparkles,
  Search,
  Mail,
  Lock,
  BarChart3,
  Code as CodeIcon,
  Layout,
  Terminal,
  Cpu,
  Globe,
  MessageSquare,
  Instagram,
  Facebook,
  Twitter,
  Briefcase,
  DollarSign,
  Shield,
  Layers,
  Database,
  Calendar,
  Share2,
  Bell,
  Activity,
  Box,
  Circle,
  Triangle,
  Hexagon,
  Monitor,
  Zap as ZapIcon
} from "lucide-react";

// Reuse the visual logic from Plan but make it more cinematic with 3D effects
function InfographicVisual({ type, status }: { type?: string, status: string }) {
  if (!type) return null;

    switch (type) {
      case 'browser':
        return (
          <div className="flex flex-col h-full bg-[#f8f9fa] dark:bg-[#0d0d0d] rounded-2xl md:rounded-[40px] border border-[#dae0e2] dark:border-[#27272a] overflow-hidden shadow-2xl relative">
            <div className="flex items-center gap-3 p-4 border-b border-[#dae0e2] dark:border-[#27272a] bg-[#f0f2f5] dark:bg-[#1a1a1a]">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 bg-white dark:bg-[#0a0a0a] rounded-xl px-4 py-1.5 text-[11px] text-[#343434]/40 dark:text-white/40 truncate font-mono border border-[#dae0e2] dark:border-[#27272a]/50">
                https://beauto.ai/orchestrator/live_view
              </div>
            </div>
            <div className="flex-1 p-6 md:p-12 relative flex items-center justify-center">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(59,130,246,0.08),transparent)] pointer-events-none" />
              <motion.div 
                className="grid grid-cols-2 gap-6 md:gap-10 w-full max-w-2xl"
                animate={status === 'in-progress' ? { 
                  y: [0, -15, 0],
                  rotateX: [0, 4, 0],
                  rotateY: [0, -4, 0],
                } : {}}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                style={{ transformStyle: "preserve-3d" }}
              >
                {[1, 2, 3, 4].map(i => (
                  <motion.div 
                    key={i} 
                    className="h-28 md:h-40 rounded-3xl bg-white dark:bg-[#1a1a1a] border border-[#dae0e2] dark:border-[#27272a] flex flex-col p-6 shadow-2xl relative group overflow-hidden"
                    whileHover={{ translateZ: 30, scale: 1.02 }}
                  >
                    <div className="absolute top-0 left-0 w-full h-1 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="h-2 w-16 bg-[#dae0e2] dark:bg-[#27272a] rounded-full mb-4" />
                    <div className="flex-1 flex items-center justify-center relative">
                      <div className="grid grid-cols-2 gap-2 opacity-10">
                        <div className="w-8 h-8 rounded-lg bg-current" />
                        <div className="w-8 h-8 rounded-lg bg-current" />
                        <div className="w-8 h-8 rounded-lg bg-current" />
                        <div className="w-8 h-8 rounded-lg bg-current" />
                      </div>
                      <Layout className="absolute w-8 h-8 text-[#343434]/20 dark:text-white/20 group-hover:text-blue-500/30 transition-colors" />
                      {status === 'in-progress' && i === 1 && (
                        <motion.div 
                          className="absolute inset-0 flex items-center justify-center"
                          animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.8, 0.4] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Sparkles className="w-12 h-12 text-blue-500/20" />
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        );
      case 'code':
        return (
          <div className="flex flex-col h-full bg-[#050505] font-mono text-[11px] md:text-sm p-8 md:p-12 rounded-2xl md:rounded-[40px] border border-[#27272a] shadow-[0_30px_60px_rgba(0,0,0,0.5)] overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 opacity-60" />
            <div className="flex items-center gap-4 mb-8 text-white/40 relative z-10">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-inner">
                <CodeIcon className="w-4 h-4 text-blue-400" />
              </div>
              <span className="text-[11px] tracking-[0.3em] font-black uppercase text-blue-400/80">core_logic_generator.ts</span>
              <div className="ml-auto flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-blue-500/50 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                <div className="w-2 h-2 rounded-full bg-blue-500/20" />
              </div>
            </div>
            <div className="space-y-4 relative z-10">
              {[
                'async function orchestrate(context: Prompt) {',
                '  const intent = await NLP.extract(context);',
                '  const flow = await Agent.plan(intent);',
                '  return await flow.execute({',
                '    precision: "cinematic",',
                '    visuals: true,',
                '    adaptive: "context"',
                '  });',
                '}'
              ].map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="whitespace-pre flex items-center gap-8 group/line"
                >
                  <span className="text-white/5 w-6 text-right font-mono text-[10px] group-hover/line:text-blue-500/30 transition-colors">{i + 1}</span>
                  <span className={`${
                    line.includes('function') || line.includes('return') ? "text-purple-400" :
                    line.includes('const') || line.includes('await') ? "text-blue-400" :
                    line.includes('"') ? "text-emerald-400" : "text-gray-400"
                  } relative drop-shadow-[0_0_8px_rgba(255,255,255,0.05)]`}>
                    {line}
                    {status === 'in-progress' && i === (Math.floor(Date.now() / 400) % 9) && (
                      <motion.div 
                        className="absolute -right-3 top-0 bottom-0 w-1.5 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]"
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity }}
                      />
                    )}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        );
      case 'analysis':
        return (
          <div className="flex flex-col h-full items-center justify-center p-8 md:p-16 bg-white dark:bg-[#0a0a0a] rounded-2xl md:rounded-[40px] border border-[#dae0e2] dark:border-[#27272a] shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent)]" />
            <div className="relative mb-16">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
                className="w-48 h-48 md:w-72 md:h-72 rounded-full border border-dashed border-blue-200 dark:border-blue-900/30 flex items-center justify-center relative shadow-inner"
              >
                <div className="absolute inset-0 border-2 border-blue-500/5 rounded-full animate-ping" />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                  className="w-36 h-36 md:w-56 md:h-56 rounded-full border border-dashed border-purple-200 dark:border-purple-900/30 flex items-center justify-center"
                >
                  <div className="relative">
                    <BarChart3 className="w-16 h-16 md:w-24 md:h-24 text-blue-500/30 relative z-10" />
                    <motion.div 
                      className="absolute inset-0 blur-3xl bg-blue-500/20"
                      animate={{ scale: [1, 1.8, 1], opacity: [0.3, 0.7, 0.3] }}
                      transition={{ duration: 4, repeat: Infinity }}
                    />
                  </div>
                </motion.div>
              </motion.div>
            </div>
            <div className="flex gap-4 h-24 md:h-40 items-end relative z-10 w-full max-w-md">
              {[0.4, 0.7, 0.5, 0.9, 0.6, 0.8, 0.3, 0.7, 0.5, 0.8, 0.6, 0.4].map((h, i) => (
                <motion.div
                  key={i}
                  className="flex-1 bg-gradient-to-t from-blue-500/80 to-purple-500/80 rounded-t-2xl shadow-xl relative overflow-hidden"
                  animate={status === 'in-progress' ? { 
                    height: [`${h * 100}%`, `${(1.3 - h) * 100}%`, `${h * 100}%`],
                    filter: ["brightness(1)", "brightness(1.4)", "brightness(1)"]
                  } : { height: `${h * 100}%` }}
                  transition={{ repeat: Infinity, duration: 2.5 + i * 0.2, ease: "easeInOut" }}
                >
                  <div className="absolute inset-x-0 top-0 h-2 bg-white/30" />
                </motion.div>
              ))}
            </div>
          </div>
        );
    case 'auth':
      return (
        <div className="flex flex-col h-full items-center justify-center bg-[#f8f9fa] dark:bg-[#0a0a0a] rounded-2xl border border-[#dae0e2] dark:border-[#27272a] p-6 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16 relative">
            <motion.div 
              className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-white dark:bg-[#1a1a1a] border border-[#dae0e2] dark:border-[#27272a] flex items-center justify-center shadow-xl relative group"
              animate={status === 'in-progress' ? { rotateY: [0, 15, 0] } : {}}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <Shield className="w-10 h-10 md:w-12 md:h-12 text-blue-500/40 group-hover:text-blue-500 transition-colors" />
              <div className="absolute -inset-2 bg-blue-500/5 rounded-[40px] blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
            
            <div className="w-32 md:w-48 h-2 bg-[#dae0e2] dark:bg-[#1a1a1a] rounded-full relative overflow-hidden shadow-inner">
              {status === 'in-progress' && (
                <motion.div 
                  className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-blue-500 to-transparent shadow-[0_0_20px_rgba(59,130,246,0.5)]"
                  animate={{ left: ['-50%', '100%'] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                />
              )}
            </div>

            <motion.div 
              className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30 flex items-center justify-center shadow-xl relative"
              animate={status === 'in-progress' ? { 
                scale: [1, 1.05, 1],
                boxShadow: ["0 0 0px rgba(59,130,246,0)", "0 0 30px rgba(59,130,246,0.2)", "0 0 0px rgba(59,130,246,0)"]
              } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Lock className="w-10 h-10 md:w-12 md:h-12 text-blue-600 dark:text-blue-400" />
            </motion.div>
          </div>
          <p className="mt-8 text-[10px] font-bold tracking-[0.3em] uppercase text-blue-500/50">Secure Handshake</p>
        </div>
      );
    case 'search':
      return (
        <div className="flex flex-col h-full p-6 md:p-10 bg-white dark:bg-[#0a0a0a] rounded-2xl border border-[#dae0e2] dark:border-[#27272a] shadow-2xl relative">
          <div className="flex items-center gap-4 mb-10">
            <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/20 shadow-sm">
              <Search className="w-6 h-6 text-blue-500" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="h-4 w-48 md:w-72 bg-[#f0f2f5] dark:bg-[#1a1a1a] rounded-full relative overflow-hidden border border-[#dae0e2] dark:border-[#27272a]">
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                />
              </div>
              <div className="flex gap-2">
                <div className="h-1.5 w-12 bg-blue-200/50 rounded-full" />
                <div className="h-1.5 w-8 bg-purple-200/50 rounded-full" />
              </div>
            </div>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 20, rotateX: -10 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ delay: i * 0.15 }}
                className="p-5 border border-[#dae0e2] dark:border-[#27272a] rounded-2xl bg-[#f8f9fa] dark:bg-[#111] flex gap-4 shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className="w-12 h-12 rounded-xl bg-white dark:bg-[#1a1a1a] border border-[#dae0e2] dark:border-[#27272a] shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Globe className="w-6 h-6 text-blue-500/30" />
                </div>
                <div className="flex-1 space-y-3">
                  <div className="h-3 w-40 bg-blue-500/10 rounded-full" />
                  <div className="space-y-1.5">
                    <div className="h-1.5 w-full bg-[#dae0e2] dark:bg-[#27272a] rounded-full" />
                    <div className="h-1.5 w-2/3 bg-[#dae0e2] dark:bg-[#27272a] rounded-full" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      );
    case 'email':
      return (
        <div className="flex flex-col h-full p-6 md:p-10 bg-white dark:bg-[#0a0a0a] rounded-2xl border border-[#dae0e2] dark:border-[#27272a] shadow-2xl relative">
          <div className="absolute top-4 right-6 flex gap-1">
             {[1,2,3].map(i => <div key={i} className="w-1 h-1 rounded-full bg-orange-500/20" />)}
          </div>
          <div className="flex items-center gap-4 mb-10 border-b border-[#dae0e2] dark:border-[#27272a] pb-8">
            <motion.div 
              className="p-3 rounded-2xl bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-800/20 shadow-sm"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Mail className="w-7 h-7 text-orange-500" />
            </motion.div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-[#343434]/40 dark:text-white/40 tracking-[0.4em] uppercase">Email Engine</span>
              <span className="text-[9px] text-orange-500/60 font-mono">v4.0_READY</span>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {[1, 2].map(i => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.2 }}
                className="flex gap-5 items-center p-5 rounded-2xl bg-[#f8f9fa] dark:bg-[#111] border border-[#dae0e2] dark:border-[#27272a] shadow-sm relative group"
              >
                <div className="w-12 h-12 rounded-full bg-white dark:bg-[#1a1a1a] border border-[#dae0e2] dark:border-[#27272a] flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
                  <Mail className="w-6 h-6 text-orange-400" />
                </div>
                <div className="flex-1 space-y-3">
                  <div className="h-2.5 w-32 bg-orange-500/10 rounded-full" />
                  <div className="h-1.5 w-full bg-[#dae0e2] dark:bg-[#27272a] rounded-full" />
                </div>
                {status === 'in-progress' && i === 1 && (
                  <div className="absolute right-4 w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      );
    case 'calendar':
      return (
        <div className="flex flex-col h-full p-6 md:p-10 bg-white dark:bg-[#0a0a0a] rounded-2xl border border-[#dae0e2] dark:border-[#27272a] shadow-2xl overflow-hidden relative">
          <div className="absolute -right-20 -top-20 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl" />
          <div className="flex items-center gap-4 mb-10 border-b border-[#dae0e2] dark:border-[#27272a] pb-8">
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/20 shadow-sm">
              <Calendar className="w-7 h-7 text-emerald-500" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-[#343434]/40 dark:text-white/40 tracking-[0.4em] uppercase">Schedule Matrix</span>
              <span className="text-[9px] text-emerald-500/60 font-mono">NODE_ACTIVE</span>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-3 mb-8">
            {Array.from({ length: 14 }).map((_, i) => (
              <motion.div 
                key={i} 
                className={`aspect-square rounded-lg border shadow-sm ${i === 4 ? 'bg-emerald-500 border-emerald-500' : 'bg-[#f8f9fa] dark:bg-[#111] border-[#dae0e2] dark:border-[#27272a]'}`}
                animate={i === 4 ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              />
            ))}
          </div>
          <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-900/5 border border-emerald-100 dark:border-emerald-800/20 flex items-center gap-4 relative overflow-hidden">
             <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
             <div className="flex-1 h-2.5 bg-emerald-200/40 dark:bg-emerald-800/20 rounded-full relative overflow-hidden">
               <motion.div 
                 className="absolute inset-y-0 bg-emerald-500/30"
                 animate={{ left: ['-100%', '100%'] }}
                 transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
               />
             </div>
          </div>
        </div>
      );
    case 'social':
      return (
        <div className="flex flex-col h-full p-6 md:p-10 bg-white dark:bg-[#0a0a0a] rounded-2xl border border-[#dae0e2] dark:border-[#27272a] shadow-2xl relative">
          <div className="absolute inset-0 bg-gradient-to-t from-pink-500/5 to-transparent opacity-30" />
          <div className="flex items-center gap-4 mb-10 border-b border-[#dae0e2] dark:border-[#27272a] pb-8 relative z-10">
            <div className="p-3 rounded-2xl bg-pink-50 dark:bg-pink-900/10 border border-pink-100 dark:border-pink-800/20 shadow-sm">
              <Share2 className="w-7 h-7 text-pink-500" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-[#343434]/40 dark:text-white/40 tracking-[0.4em] uppercase">Social Synthesis</span>
              <span className="text-[9px] text-pink-500/60 font-mono">BROADCAST_READY</span>
            </div>
          </div>
          <div className="flex gap-6 items-center justify-center py-8 relative z-10">
            {[Instagram, Facebook, Twitter].map((Icon, idx) => (
              <React.Fragment key={idx}>
                <motion.div
                  animate={status === 'in-progress' ? { 
                    scale: [1, 1.2, 1],
                    y: [0, -10, 0]
                  } : {}}
                  transition={{ duration: 3, delay: idx * 0.5, repeat: Infinity }}
                  className="w-14 h-14 rounded-2xl bg-[#f8f9fa] dark:bg-[#111] border border-[#dae0e2] dark:border-[#27272a] flex items-center justify-center shadow-lg"
                >
                  <Icon className={`w-8 h-8 ${idx === 0 ? 'text-pink-500' : idx === 1 ? 'text-blue-500' : 'text-cyan-500'} opacity-40`} />
                </motion.div>
                {idx < 2 && <div className="w-8 h-1 bg-gradient-to-r from-[#dae0e2] to-pink-500/20 rounded-full" />}
              </React.Fragment>
            ))}
          </div>
          <motion.div 
            className="mt-6 p-5 rounded-2xl border border-[#dae0e2] dark:border-[#27272a] bg-[#f8f9fa] dark:bg-[#111] shadow-inner relative overflow-hidden"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="h-2.5 w-32 bg-pink-500/10 rounded-full mb-3" />
            <div className="h-1.5 w-full bg-[#dae0e2] dark:bg-[#27272a] rounded-full" />
            <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-pink-500/20 via-transparent to-pink-500/20" />
          </motion.div>
        </div>
      );
    default:
      return (
        <div className="flex flex-col h-full items-center justify-center p-6 md:p-12 text-center bg-white dark:bg-[#0a0a0a] rounded-2xl border border-[#dae0e2] dark:border-[#27272a] overflow-hidden shadow-2xl relative">
          <div className="absolute inset-0 overflow-hidden">
             {Array.from({ length: 20 }).map((_, i) => (
               <motion.div
                 key={i}
                 className="absolute w-1 h-1 bg-blue-500/10 rounded-full"
                 style={{ 
                   top: `${Math.random() * 100}%`, 
                   left: `${Math.random() * 100}%` 
                 }}
                 animate={{ 
                   y: [0, -100], 
                   opacity: [0, 1, 0] 
                 }}
                 transition={{ 
                   duration: 2 + Math.random() * 3, 
                   repeat: Infinity, 
                   delay: Math.random() * 2 
                 }}
               />
             ))}
          </div>
          <div className="relative">
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 90, 180, 270, 360],
              }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="w-32 h-32 md:w-48 md:h-48 bg-blue-50 dark:bg-blue-900/5 border border-blue-100 dark:border-blue-800/20 rounded-[35%] shadow-[0_0_80px_rgba(59,130,246,0.15)]"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Database className="w-12 h-12 md:w-16 md:h-16 text-blue-500/30" />
            </div>
          </div>
          <div className="mt-12 md:mt-16 space-y-6 relative z-10">
            <div className="h-1.5 w-40 md:w-64 bg-[#f0f2f5] dark:bg-[#1a1a1a] mx-auto rounded-full overflow-hidden shadow-inner">
              <motion.div 
                className="h-full bg-gradient-to-r from-blue-400 to-blue-600 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
            <p className="text-[10px] font-black text-[#343434]/40 dark:text-white/40 tracking-[0.5em] uppercase">Universal Core Logic</p>
          </div>
        </div>
      );
  }
}

interface Step {
  id: string;
  title: string;
  description: string;
  visualType: string;
  status: "completed" | "in-progress" | "pending";
}

interface CinematicThinkingProps {
  query: string;
  visible?: boolean;
}

export function CinematicThinking({ query, visible = true }: CinematicThinkingProps) {
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isIntro, setIsIntro] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const lowerQuery = query.toLowerCase();
    let generatedSteps: Step[] = [];

    // Infer context to make it adaptive
    if (lowerQuery.includes("mail") || lowerQuery.includes("gmail")) {
      generatedSteps = [
        { id: "1", title: "Channel Handshake", description: "Verifying secure connection to your communication nodes", visualType: 'auth', status: "pending" },
        { id: "2", title: "Scanning Context", description: "Retrieving relevant data from your recent communications", visualType: 'email', status: "pending" },
        { id: "3", title: "Neural Indexing", description: "Preparing search queries for global cloud context", visualType: 'search', status: "pending" },
        { id: "4", title: "Semantic Analysis", description: "Analyzing linguistic patterns to understand requested intent", visualType: 'analysis', status: "pending" },
        { id: "5", title: "Temporal Matrix", description: "Cross-referencing timeline data for context validation", visualType: 'calendar', status: "pending" },
        { id: "6", title: "Response Synthesis", description: "Compiling information into a professional drafted output", visualType: 'code', status: "pending" },
      ];
    } else if (lowerQuery.includes("meeting") || lowerQuery.includes("calendar")) {
      generatedSteps = [
        { id: "1", title: "Temporal Sync", description: "Synchronizing with your global scheduling infrastructure", visualType: 'auth', status: "pending" },
        { id: "2", title: "Slot Discovery", description: "Identifying optimal availability windows for your request", visualType: 'calendar', status: "pending" },
        { id: "3", title: "Integrity Audit", description: "Verifying code against security and style protocols", visualType: 'analysis', status: "pending" },
        { id: "4", title: "Channel Handshake", description: "Verifying secure connection to your communication nodes", visualType: 'auth', status: "pending" },
        { id: "5", title: "Overlap Audit", description: "Cross-referencing events to ensure zero conflicts", visualType: 'analysis', status: "pending" },
        { id: "6", title: "Committing Action", description: "Finalizing the scheduled event across your workspace", visualType: 'browser', status: "pending" },
      ];
    } else if (lowerQuery.includes("social") || lowerQuery.includes("instagram") || lowerQuery.includes("facebook") || lowerQuery.includes("twitter")) {
      generatedSteps = [
        { id: "1", title: "Audience Analysis", description: "Defining brand resonance and engagement patterns", visualType: 'analysis', status: "pending" },
        { id: "2", title: "Asset Pipeline", description: "Generating high-impact visual components for delivery", visualType: 'search', status: "pending" },
        { id: "3", title: "Knowledge Flow", description: "Structuring information into a coherent answer", visualType: 'code', status: "pending" },
        { id: "4", title: "Network Diffusion", description: "Optimizing content for multiple social platform nodes", visualType: 'social', status: "pending" },
        { id: "5", title: "Logic Alignment", description: "Calibrating the optimal toolsets for this objective", visualType: 'auth', status: "pending" },
        { id: "6", title: "Deployment Sync", description: "Scheduling automated delivery across active accounts", visualType: 'code', status: "pending" },
      ];
    } else if (lowerQuery.includes("github") || lowerQuery.includes("repo") || lowerQuery.includes("create")) {
      generatedSteps = [
        { id: "1", title: "Forge Connection", description: "Linking to secure development environment nodes", visualType: 'auth', status: "pending" },
        { id: "2", title: "Neural Indexing", description: "Preparing search queries for global cloud context", visualType: 'search', status: "pending" },
        { id: "3", title: "Structure Scan", description: "Mapping repository dependencies and logic flow", visualType: 'browser', status: "pending" },
        { id: "4", title: "Logic Generation", description: "Writing optimized source code based on specs", visualType: 'code', status: "pending" },
        { id: "5", title: "Fact Validation", description: "Cross-referencing data points for maximum precision", visualType: 'analysis', status: "pending" },
        { id: "6", title: "Integrity Audit", description: "Verifying code against security and style protocols", visualType: 'analysis', status: "pending" },
      ];
    } else if (lowerQuery.includes("google") || lowerQuery.includes("search") || lowerQuery.includes("web")) {
        generatedSteps = [
          { id: "1", title: "Neural Indexing", description: "Preparing search queries for global cloud context", visualType: 'search', status: "pending" },
          { id: "2", title: "Data Harvesting", description: "Gathering intel from multiple verified web sources", visualType: 'browser', status: "pending" },
          { id: "3", title: "Temporal Matrix", description: "Cross-referencing timeline data for context validation", visualType: 'calendar', status: "pending" },
          { id: "4", title: "Fact Validation", description: "Cross-referencing data points for maximum precision", visualType: 'analysis', status: "pending" },
          { id: "5", title: "Logic Alignment", description: "Calibrating the optimal toolsets for this objective", visualType: 'auth', status: "pending" },
          { id: "6", title: "Knowledge Flow", description: "Structuring information into a coherent answer", visualType: 'code', status: "pending" },
        ];
    } else {
      generatedSteps = [
        { id: "1", title: "Cognitive Parsing", description: "Deconstructing your request into executable tasks", visualType: 'analysis', status: "pending" },
        { id: "2", title: "Cloud Retrieval", description: "Accessing relevant knowledge from the global network", visualType: 'search', status: "pending" },
        { id: "3", title: "Neural Indexing", description: "Preparing search queries for global cloud context", visualType: 'search', status: "pending" },
        { id: "4", title: "Logic Alignment", description: "Calibrating the optimal toolsets for this objective", visualType: 'auth', status: "pending" },
        { id: "5", title: "Fact Validation", description: "Cross-referencing data points for maximum precision", visualType: 'analysis', status: "pending" },
        { id: "6", title: "Output Synthesis", description: "Crafting the final response for your requested goal", visualType: 'code', status: "pending" },
      ];
    }

    setSteps(generatedSteps);

    // Intro duration
    const introTimeout = setTimeout(() => setIsIntro(false), 800);

    // Progression logic
    let stepIdx = 0;
    const interval = setInterval(() => {
      setSteps(prev => {
        const newSteps = [...prev];
        if (stepIdx < newSteps.length) {
          if (newSteps[stepIdx].status === "pending") {
            newSteps[stepIdx].status = "in-progress";
            setCurrentStepIdx(stepIdx);
          } else if (newSteps[stepIdx].status === "in-progress") {
            newSteps[stepIdx].status = "completed";
            stepIdx++;
            if (stepIdx < newSteps.length) {
              newSteps[stepIdx].status = "in-progress";
              setCurrentStepIdx(stepIdx);
            }
          }
        } else {
          // If we reached the end, stay on the last step but in "completed" status
          if (newSteps.length > 0) {
            newSteps[newSteps.length - 1].status = "completed";
          }
          clearInterval(interval);
        }
          return newSteps;
        });
      }, 2200); // More deliberate for a smoother feel

    return () => {
      clearInterval(interval);
      clearTimeout(introTimeout);
    };
  }, [query]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePosition({ x, y });
  };

  const currentStep = steps[currentStepIdx];

  if (!currentStep) return null;

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="w-full h-full max-w-6xl mx-auto px-6 flex flex-col items-center justify-center [perspective:3000px]"
    >
      <AnimatePresence>
        {!visible ? (
          <motion.div
            key="outro"
            initial={{ opacity: 1, scale: 1 }}
            animate={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center gap-6"
          >
            <div className="w-20 h-20 rounded-3xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
               <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
              <h2 className="text-lg md:text-xl font-black tracking-[0.6em] uppercase text-green-500/40">Synthesis Complete</h2>
            </motion.div>
          ) : isIntro ? (
            <motion.div
              key="intro"
              initial={{ opacity: 0, scale: 0.8, filter: "blur(20px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center gap-6"
            >
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center animate-pulse">
                 <Sparkles className="w-8 h-8 text-blue-500" />
              </div>
              <h2 className="text-lg md:text-xl font-black tracking-[0.6em] uppercase text-[#343434]/20 dark:text-white/20">Initialising Core</h2>
            </motion.div>
          ) : (
            <motion.div 
              key="main"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="w-full relative flex flex-col items-center"
            >
              {/* Background 3D Elements */}
              <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
                 <motion.div 
                   className="absolute top-1/4 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-[120px]"
                   animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
                   transition={{ duration: 10, repeat: Infinity }}
                 />
                 <motion.div 
                   className="absolute bottom-1/4 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-[120px]"
                   animate={{ scale: [1.3, 1, 1.3], opacity: [0.2, 0.4, 0.2] }}
                   transition={{ duration: 10, repeat: Infinity }}
                 />
              </div>

                {/* The Cinematic 3D Frame - Scaled down as requested */}
                  <motion.div 
                    className="relative aspect-video w-full max-w-xl md:max-w-3xl mx-auto shadow-[0_40px_100px_rgba(0,0,0,0.2)] rounded-[32px] md:rounded-[48px] overflow-hidden border border-white/10"
                    style={{
                      rotateX: mousePosition.y * -8,
                      rotateY: mousePosition.x * 8,
                      transformStyle: "preserve-3d"
                    }}
                  >
                    {/* Scanline Effect */}
                    <div className="absolute inset-0 pointer-events-none z-30 opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
                    
                  <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep.id}
                  initial={{ opacity: 0, translateZ: -150, rotateX: 10 }}
                  animate={{ opacity: 1, translateZ: 0, rotateX: 0 }}
                  exit={{ opacity: 0, translateZ: 150, rotateX: -10 }}
                  transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full h-full relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none z-10 border border-white/20" />
                  <div className="w-full h-full bg-white dark:bg-[#0a0a0a] border border-[#dae0e2]/50 dark:border-[#27272a]/50 overflow-hidden relative">
                    <InfographicVisual type={currentStep.visualType} status={currentStep.status} />
                  </div>
                </motion.div>
              </AnimatePresence>
              
              {/* Progress Indicators (Dots) */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20">
                {steps.map((step, idx) => (
                  <motion.div 
                    key={step.id} 
                    className={`h-1.5 rounded-full transition-all duration-700 ${
                      idx === currentStepIdx 
                        ? "w-12 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)]" 
                        : step.status === "completed" 
                          ? "w-3 bg-blue-500/30" 
                          : "w-3 bg-[#dae0e2] dark:bg-[#1a1a1a]"
                    }`}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
