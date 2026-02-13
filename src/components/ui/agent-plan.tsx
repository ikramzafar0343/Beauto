"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import {
  CheckCircle2,
  Circle,
  CircleAlert,
  CircleDotDashed,
  CircleX,
  ChevronDown,
  ChevronRight,
  Zap,
  Layout,
  Code as CodeIcon,
  Search,
  Mail,
  Lock,
  BarChart3,
  Globe,
  Fingerprint,
  Share2,
  Terminal,
  Cpu,
} from "lucide-react";

// Type definitions
interface Subtask {
  id: string;
  title: string;
  description: string;
  status: "completed" | "in-progress" | "pending" | "need-help" | "failed";
  priority: "high" | "medium" | "low";
  tools?: string[];
  visualType?: 'browser' | 'code' | 'analysis' | 'auth' | 'search' | 'email' | 'social' | 'terminal';
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: "completed" | "in-progress" | "pending" | "need-help" | "failed";
  priority: "high" | "medium" | "low";
  level: number;
  dependencies: string[];
  subtasks: Subtask[];
  visualType?: 'browser' | 'code' | 'analysis' | 'auth' | 'search' | 'email' | 'social' | 'terminal';
}

function InfographicVisual({ type, status, title }: { type?: Subtask['visualType'], status: Subtask['status'], title: string }) {
  if (!type) return null;

  const containerVariants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
  };

  const renderContent = () => {
    switch (type) {
      case 'browser':
        return (
          <div className="flex flex-col h-full bg-background/50">
            <div className="flex items-center gap-2 p-2 border-b border-border/50 bg-muted/20">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500/50" />
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/50" />
                <div className="w-1.5 h-1.5 rounded-full bg-green-500/50" />
              </div>
              <div className="flex-1 bg-background/80 rounded px-2 py-0.5 text-[6px] text-muted-foreground truncate font-mono">
                https://beauto.ai/browsing...
              </div>
            </div>
            <div className="flex-1 p-4 relative overflow-hidden">
              <motion.div 
                className="grid grid-cols-2 gap-2"
                animate={status === 'in-progress' ? { y: [0, -20, 0] } : {}}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              >
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-12 rounded bg-muted/30 border border-border/20 flex items-center justify-center">
                    <Layout className="w-4 h-4 text-muted-foreground/20" />
                  </div>
                ))}
              </motion.div>
              {status === 'in-progress' && (
                <motion.div 
                  className="absolute top-4 left-4"
                  animate={{ x: [0, 100, 50, 150, 0], y: [0, 50, 100, 20, 0] }}
                  transition={{ duration: 5, repeat: Infinity }}
                >
                  <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                </motion.div>
              )}
            </div>
          </div>
        );
      case 'code':
        return (
          <div className="flex flex-col h-full bg-[#1e1e1e] font-mono text-[8px] p-4 text-blue-300">
            <div className="flex items-center gap-2 mb-2 opacity-50">
              <CodeIcon className="w-3 h-3" />
              <span>refactor.ts</span>
            </div>
            <div className="space-y-1">
              {[
                'export function processData(input: any) {',
                '  const results = input.map(item => {',
                '    return validate(item);',
                '  });',
                '  return optimize(results);',
                '}',
              ].map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="whitespace-pre"
                >
                  <span className="text-gray-500 mr-2">{i + 1}</span>
                  {line}
                </motion.div>
              ))}
              {status === 'in-progress' && (
                <motion.div
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ repeat: Infinity, duration: 0.8 }}
                  className="w-1.5 h-3 bg-blue-400 inline-block"
                />
              )}
            </div>
          </div>
        );
      case 'analysis':
        return (
          <div className="flex flex-col h-full items-center justify-center p-6 bg-gradient-to-br from-blue-500/5 to-purple-500/5">
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                className="w-20 h-20 rounded-full border-2 border-dashed border-blue-500/30 flex items-center justify-center"
              >
                <BarChart3 className="w-8 h-8 text-blue-500/50" />
              </motion.div>
              <AnimatePresence>
                {status === 'in-progress' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <div className="w-12 h-12 rounded-full bg-blue-500/10 animate-pulse" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="mt-4 flex gap-1 h-8 items-end">
              {[0.4, 0.7, 0.5, 0.9, 0.6].map((h, i) => (
                <motion.div
                  key={i}
                  className="w-2 bg-blue-500/40 rounded-t"
                  animate={status === 'in-progress' ? { height: [`${h * 100}%`, `${(1 - h) * 100}%`, `${h * 100}%`] } : { height: `${h * 100}%` }}
                  transition={{ repeat: Infinity, duration: 1 + i * 0.2 }}
                />
              ))}
            </div>
          </div>
        );
      case 'auth':
        return (
          <div className="flex flex-col h-full items-center justify-center bg-muted/10">
            <div className="flex items-center gap-8 relative">
              <div className="w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center">
                <Cpu className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="w-16 h-0.5 bg-border relative">
                {status === 'in-progress' && (
                  <motion.div 
                    className="absolute inset-0 bg-blue-500"
                    animate={{ left: ['0%', '100%'], width: ['0%', '30%', '0%'] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  />
                )}
              </div>
              <motion.div 
                className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center"
                animate={status === 'in-progress' ? { scale: [1, 1.1, 1] } : {}}
              >
                <Lock className="w-5 h-5 text-blue-500" />
              </motion.div>
            </div>
            <div className="mt-4 text-[8px] font-mono text-muted-foreground flex gap-2">
              <span className="text-green-500">TOK_SECURE</span>
              <span className="opacity-50">AUTH_PASS</span>
            </div>
          </div>
        );
      case 'search':
        return (
          <div className="flex flex-col h-full p-4 bg-background">
            <div className="flex items-center gap-2 mb-4">
              <Search className="w-4 h-4 text-blue-500" />
              <div className="h-2 w-32 bg-muted rounded animate-pulse" />
            </div>
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.2 }}
                  className="p-2 border border-border/50 rounded bg-muted/10"
                >
                  <div className="h-1.5 w-24 bg-blue-500/30 rounded mb-1" />
                  <div className="h-1 w-full bg-muted rounded" />
                </motion.div>
              ))}
            </div>
          </div>
        );
      case 'email':
        return (
          <div className="flex flex-col h-full p-4 bg-muted/5">
            <div className="flex items-center gap-2 mb-4 border-b border-border pb-2">
              <Mail className="w-4 h-4 text-orange-500" />
              <span className="text-[8px] font-bold text-muted-foreground">INBOX ANALYSIS</span>
            </div>
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-2 items-center">
                  <div className="w-6 h-6 rounded bg-orange-500/10 flex items-center justify-center">
                    <Mail className="w-3 h-3 text-orange-500/50" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="h-1.5 w-16 bg-muted rounded" />
                    <div className="h-1 w-full bg-muted/50 rounded" />
                  </div>
                </div>
              ))}
              {status === 'in-progress' && (
                <motion.div
                  className="absolute inset-0 bg-orange-500/5"
                  animate={{ opacity: [0, 0.2, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </div>
          </div>
        );
      default:
        return (
          <div className="flex flex-col h-full items-center justify-center p-6 text-center">
            <div className="relative">
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360]
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 rounded-3xl bg-blue-500/5 border border-blue-500/10"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Zap className="w-6 h-6 text-blue-500/40" />
              </div>
            </div>
            <p className="mt-4 text-[8px] uppercase tracking-tighter text-muted-foreground font-bold">
              Processing Intelligence
            </p>
          </div>
        );
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="mt-4 rounded-xl border border-border overflow-hidden bg-muted/20 relative group/screen aspect-video shadow-2xl"
    >
      {/* Video UI Overlay */}
      <div className="absolute inset-0 pointer-events-none z-20">
        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
          <motion.div 
            className="h-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"
            animate={status === 'in-progress' ? { width: ['0%', '100%'] } : { width: status === 'completed' ? '100%' : '0%' }}
            transition={status === 'in-progress' ? { duration: 3, repeat: Infinity } : { duration: 0.5 }}
          />
        </div>

        {/* Recording Indicator */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2 py-1 rounded border border-white/10">
          <motion.div 
            animate={{ opacity: [1, 0, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"
          />
          <span className="text-[8px] font-bold text-white tracking-widest uppercase">LIVE FEED</span>
        </div>

        {/* Step Badge */}
        <div className="absolute top-3 right-3 bg-blue-500/20 backdrop-blur-md px-2 py-1 rounded border border-blue-500/40">
           <span className="text-[8px] font-mono text-blue-400 font-bold uppercase">{title.split(' ')[0]}</span>
        </div>

        {/* Corner Brackets */}
        <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-white/20" />
        <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-white/20" />
        <div className="absolute bottom-4 left-2 w-4 h-4 border-b border-l border-white/20" />
        <div className="absolute bottom-4 right-2 w-4 h-4 border-b border-r border-white/20" />
      </div>

      <div className="w-full h-full relative">
        {renderContent()}
        
        {/* Glitch Overlay */}
        {status === 'in-progress' && (
          <motion.div 
            className="absolute inset-0 bg-blue-500/5 mix-blend-overlay pointer-events-none"
            animate={{ 
              opacity: [0, 0.1, 0, 0.2, 0],
              x: [0, 1, -1, 0] 
            }}
            transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 2 }}
          />
        )}

        {/* Scanline Effect */}
        {status === 'in-progress' && (
          <motion.div 
            className="absolute inset-x-0 h-[1px] bg-blue-400/30 shadow-[0_0_10px_rgba(59,130,246,0.3)] z-10 pointer-events-none"
            animate={{ top: ["0%", "100%", "0%"] }}
            transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
          />
        )}
      </div>
    </motion.div>
  );
}


interface PlanProps {
  query?: string;
}

export default function Plan({ query }: PlanProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [expandedTasks, setExpandedTasks] = useState<string[]>([]);
  const [expandedSubtasks, setExpandedSubtasks] = useState<{
    [key: string]: boolean;
  }>({});

  useEffect(() => {
    // Dynamically generate tasks based on query
    const lowerQuery = (query || "").toLowerCase();
    
    let generatedTasks: Task[] = [];
    
      if (lowerQuery.includes("mail") || lowerQuery.includes("gmail") || lowerQuery.includes("mejl")) {
        generatedTasks = [
          {
            id: "1",
            title: "Email Intelligence Workflow",
            description: "Connecting and orchestrating secure mail actions",
            status: "pending",
            priority: "high",
            level: 0,
            dependencies: [],
            subtasks: [
              { 
                id: "1.1", 
                title: "Secure Authentication", 
                description: "Verifying credentials and establishing encrypted tunnel", 
                status: "pending", 
                priority: "high", 
                tools: ["auth-provider", "tls-secure"],
                visualType: 'auth'
              },
              { 
                id: "1.2", 
                title: "Contextual Harvesting", 
                description: "Retrieving relevant communication history and attachments", 
                status: "pending", 
                priority: "medium", 
                tools: ["gmail-api"],
                visualType: 'email'
              },
              { 
                id: "1.3", 
                title: "Semantic Mapping", 
                description: "Analyzing message intent and urgency patterns", 
                status: "pending", 
                priority: "medium", 
                tools: ["beauto-nlp"],
                visualType: 'analysis'
              },
            ],
          },
          {
            id: "2",
            title: "Response Synthesis",
            description: "Generating high-fidelity automated drafts",
            status: "pending",
            priority: "medium",
            level: 0,
            dependencies: ["1"],
            subtasks: [
              { 
                id: "2.1", 
                title: "Draft Composition", 
                description: "Applying brand voice and tone parameters", 
                status: "pending", 
                priority: "medium", 
                tools: ["content-engine"],
                visualType: 'code'
              },
              { 
                id: "2.2", 
                title: "Protocol Validation", 
                description: "Final safety check before execution queue", 
                status: "pending", 
                priority: "high",
                visualType: 'browser'
              },
            ],
          }
        ];
      } else if (lowerQuery.includes("github") || lowerQuery.includes("kod") || lowerQuery.includes("repo") || lowerQuery.includes("skapa")) {
        generatedTasks = [
          {
            id: "1",
            title: "System Architecture Mapping",
            description: "Analyzing codebase structure and logic flows",
            status: "pending",
            priority: "high",
            level: 0,
            dependencies: [],
            subtasks: [
              { 
                id: "1.1", 
                title: "Repository Sync", 
                description: "Establishing link to version control system", 
                status: "pending", 
                priority: "high", 
                tools: ["github", "git-mcp"],
                visualType: 'auth'
              },
              { 
                id: "1.2", 
                title: "Dependency Graphing", 
                description: "Mapping internal modules and external libraries", 
                status: "pending", 
                priority: "medium", 
                visualType: 'browser'
              },
              { 
                id: "1.3", 
                title: "Logic Extraction", 
                description: "Deconstructing core algorithms and patterns", 
                status: "pending", 
                priority: "medium", 
                tools: ["beauto-parser"],
                visualType: 'code'
              },
            ],
          },
          {
            id: "2",
            title: "Implementation Strategy",
            description: "Drafting structural changes and optimizations",
            status: "pending",
            priority: "medium",
            level: 0,
            dependencies: ["1"],
            subtasks: [
              { 
                id: "2.1", 
                title: "Code Generation", 
                description: "Synthesizing new components and logic", 
                status: "pending", 
                priority: "high", 
                tools: ["code-engine"],
                visualType: 'code'
              },
              { 
                id: "2.2", 
                title: "Verification Loop", 
                description: "Running static analysis and safety checks", 
                status: "pending", 
                priority: "medium",
                visualType: 'analysis'
              },
            ],
          }
        ];
      } else if (lowerQuery.includes("bild") || lowerQuery.includes("image") || lowerQuery.includes("design") || lowerQuery.includes("snygg")) {
        generatedTasks = [
          {
            id: "1",
            title: "Visual Concept Exploration",
            description: "Deconstructing visual requirements and aesthetic goals",
            status: "pending",
            priority: "high",
            level: 0,
            dependencies: [],
            subtasks: [
              { 
                id: "1.1", 
                title: "Style Analysis", 
                description: "Identifying target color palettes and typography", 
                status: "pending", 
                priority: "high", 
                visualType: 'analysis'
              },
              { 
                id: "1.2", 
                title: "Asset Selection", 
                description: "Sourcing high-quality base images and textures", 
                status: "pending", 
                priority: "medium", 
                visualType: 'search'
              },
              { 
                id: "1.3", 
                title: "Layout Composition", 
                description: "Defining structural hierarchy and focus points", 
                status: "pending", 
                priority: "medium", 
                visualType: 'browser'
              },
            ],
          },
          {
            id: "2",
            title: "Creative Synthesis",
            description: "Generating final visual assets and styles",
            status: "pending",
            priority: "medium",
            level: 0,
            dependencies: ["1"],
            subtasks: [
              { 
                id: "2.1", 
                title: "Rendering Engine", 
                description: "Processing visual data through neural filters", 
                status: "pending", 
                priority: "high", 
                visualType: 'code'
              },
              { 
                id: "2.2", 
                title: "Final Polishing", 
                description: "Refining details for professional output", 
                status: "pending", 
                priority: "medium",
                visualType: 'analysis'
              },
            ],
          }
        ];
      } else {
        // Dynamic General Assistant tasks
        generatedTasks = [
          {
            id: "1",
            title: "Cognitive Processing",
            description: "Analyzing intent and constructing mental model",
            status: "pending",
            priority: "high",
            level: 0,
            dependencies: [],
            subtasks: [
              { 
                id: "1.1", 
                title: "Deep Intent Extraction", 
                description: "Deciphering core objectives from input", 
                status: "pending", 
                priority: "high", 
                visualType: 'analysis'
              },
              { 
                id: "1.2", 
                title: "Knowledge Retrieval", 
                description: "Accessing relevant databases and web context", 
                status: "pending", 
                priority: "medium", 
                visualType: 'search'
              },
              { 
                id: "1.3", 
                title: "Capability Alignment", 
                description: "Selecting optimal toolsets for execution", 
                status: "pending", 
                priority: "medium",
                visualType: 'auth'
              },
            ],
          },
          {
            id: "2",
            title: "Logical Structuring",
            description: "Synthesizing data into actionable output",
            status: "pending",
            priority: "medium",
            level: 0,
            dependencies: ["1"],
            subtasks: [
              { 
                id: "2.1", 
                title: "Solution Drafting", 
                description: "Generating coherent response structure", 
                status: "pending", 
                priority: "high",
                visualType: 'code'
              },
              { 
                id: "2.2", 
                title: "Validation Check", 
                description: "Ensuring accuracy and safety parameters", 
                status: "pending", 
                priority: "medium",
                visualType: 'browser'
              },
            ],
          }
        ];
      }

    
    setTasks(generatedTasks);
    // Expand the first task by default
    if (generatedTasks.length > 0) {
      setExpandedTasks([generatedTasks[0].id]);
    }

    // Simulate real-time progression
    let currentTaskIdx = 0;
    let currentSubtaskIdx = 0;

    const interval = setInterval(() => {
      setTasks(prev => {
        const newTasks = [...prev];
        const task = newTasks[currentTaskIdx];
        if (!task) {
          clearInterval(interval);
          return prev;
        }

        if (task.status === "pending") {
          task.status = "in-progress";
        }

        const subtask = task.subtasks[currentSubtaskIdx];
        if (subtask) {
          if (subtask.status === "pending") {
            subtask.status = "in-progress";
          } else if (subtask.status === "in-progress") {
            subtask.status = "completed";
            currentSubtaskIdx++;
            if (currentSubtaskIdx >= task.subtasks.length) {
              task.status = "completed";
              currentTaskIdx++;
              currentSubtaskIdx = 0;
              if (currentTaskIdx < newTasks.length) {
                setExpandedTasks(prevExp => [...prevExp, newTasks[currentTaskIdx].id]);
              }
            }
          }
        }

        return newTasks;
      });
    }, 800);

    return () => clearInterval(interval);
  }, [query]);

  const toggleTaskExpansion = (taskId: string) => {
    setExpandedTasks((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId]
    );
  };

  const toggleSubtaskExpansion = (taskId: string, subtaskId: string) => {
    const key = `${taskId}-${subtaskId}`;
    setExpandedSubtasks((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const getStatusIcon = (status: Task["status"], size: string = "h-4 w-4") => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className={`${size} text-green-500`} />;
      case "in-progress":
        return (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          >
            <CircleDotDashed className={`${size} text-blue-500`} />
          </motion.div>
        );
      case "need-help":
        return <CircleAlert className={`${size} text-yellow-500`} />;
      case "failed":
        return <CircleX className={`${size} text-red-500`} />;
      default:
        return <Circle className={`${size} text-muted-foreground/40`} />;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto my-4">
      <motion.div
        className="bg-white/50 dark:bg-black/20 backdrop-blur-md border border-border/50 rounded-2xl overflow-hidden shadow-sm"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="p-4 border-b border-border/50 bg-muted/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
               <motion.div 
                className="absolute inset-0 bg-blue-500/20 rounded-full"
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
              <Zap className="h-4 w-4 text-blue-500 relative z-10" />
            </div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Beauto is working.
            </h3>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-blue-500/80 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500"></span>
            </span>
            PROCESSING
          </div>
        </div>

        <div className="p-2">
          <LayoutGroup>
            <div className="space-y-1">
              {tasks.map((task) => {
                const isExpanded = expandedTasks.includes(task.id);
                return (
                  <motion.div
                    layout
                    key={task.id}
                    className="rounded-xl transition-colors"
                  >
                    <div
                      className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 rounded-xl"
                      onClick={() => toggleTaskExpansion(task.id)}
                    >
                      <div className="shrink-0">
                        {getStatusIcon(task.status, "h-5 w-5")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className={`text-sm font-medium ${task.status === "completed" ? "text-muted-foreground line-through" : ""}`}>
                            {task.title}
                          </h4>
                          {task.status === "in-progress" && (
                             <motion.span 
                               initial={{ opacity: 0 }}
                               animate={{ opacity: [0, 1, 0] }}
                               transition={{ repeat: Infinity, duration: 1.5 }}
                               className="text-[10px] text-blue-500 font-bold"
                             >
                               WORKING...
                             </motion.span>
                          )}
                        </div>
                      </div>
                      <div className="shrink-0 flex items-center gap-2">
                        {task.subtasks.length > 0 && (
                          <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded-md text-muted-foreground font-mono">
                            {task.subtasks.filter(s => s.status === "completed").length}/{task.subtasks.length}
                          </span>
                        )}
                        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
                      </div>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-3 pb-3 pt-1 space-y-1">
                            <p className="text-xs text-muted-foreground mb-3 px-8">
                              {task.description}
                            </p>
                            <div className="relative pl-8">
                              {/* Connector line */}
                              <div className="absolute left-5 top-0 bottom-4 w-[1px] bg-border" />
                              
                              <div className="space-y-2">
                                {task.subtasks.map((subtask) => {
                                  const subKey = `${task.id}-${subtask.id}`;
                                  const isSubExpanded = expandedSubtasks[subKey];
                                  return (
                                    <div key={subtask.id} className="relative">
                                      {/* Node circle on line */}
                                      <div className={`absolute -left-[13px] top-2.5 w-1.5 h-1.5 rounded-full border border-background z-10 ${subtask.status === "completed" ? "bg-green-500" : subtask.status === "in-progress" ? "bg-blue-500" : "bg-muted-foreground/30"}`} />
                                      
                                      <div 
                                        className="group cursor-pointer"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleSubtaskExpansion(task.id, subtask.id);
                                        }}
                                      >
                                        <div className="flex items-center justify-between p-2 hover:bg-muted/30 rounded-lg transition-colors">
                                          <div className="flex items-center gap-2">
                                            {getStatusIcon(subtask.status, "h-3.5 w-3.5")}
                                            <span className={`text-xs ${subtask.status === "completed" ? "text-muted-foreground line-through" : ""}`}>
                                              {subtask.title}
                                            </span>
                                          </div>
                                          <ChevronRight className={`h-3 w-3 text-muted-foreground/50 transition-transform ${isSubExpanded ? "rotate-90" : ""}`} />
                                        </div>

                                        <AnimatePresence>
                                          {isSubExpanded && (
                                            <motion.div
                                              initial={{ height: 0, opacity: 0 }}
                                              animate={{ height: "auto", opacity: 1 }}
                                              exit={{ height: 0, opacity: 0 }}
                                              className="overflow-hidden"
                                            >
                                              <div className="pl-6 pr-2 py-1 space-y-2">
                                                <p className="text-[11px] text-muted-foreground leading-relaxed">
                                                  {subtask.description}
                                                </p>
                                                {subtask.tools && (
                                                  <div className="flex flex-wrap gap-1">
                                                    {subtask.tools.map(tool => (
                                                      <span key={tool} className="text-[9px] bg-blue-500/10 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/20 font-mono">
                                                        @{tool}
                                                      </span>
                                                    ))}
                                                  </div>
                                                )}
                                                  <InfographicVisual 
                                                    type={subtask.visualType} 
                                                    status={subtask.status} 
                                                    title={subtask.title} 
                                                  />

                                                </div>
                                              </motion.div>
                                            )}
                                          </AnimatePresence>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </LayoutGroup>
        </div>
      </motion.div>
    </div>
  );
}
