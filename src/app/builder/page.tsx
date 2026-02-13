"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import {
  Sparkles,
  Loader2,
  ArrowLeft,
  Smartphone,
  Monitor,
  Tablet,
  Code,
  Eye,
  Wand2,
  ArrowUp,
  PanelLeftClose,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SandpackProvider, SandpackLayout, SandpackPreview, SandpackFileExplorer, SandpackCodeEditor } from "@codesandbox/sandpack-react";
import { motion, AnimatePresence } from "framer-motion";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface BuildStep {
  title: string;
  status: "pending" | "current" | "completed";
  files?: string[];
}

const TEMPLATES = [
  { id: "landing", name: "Landing Page", icon: "🚀", description: "Modern landing page" },
  { id: "portfolio", name: "Portfolio", icon: "💼", description: "Showcase your work" },
  { id: "blog", name: "Blog", icon: "📝", description: "Clean blog layout" },
  { id: "ecommerce", name: "E-commerce", icon: "🛒", description: "Product showcase" },
  { id: "saas", name: "SaaS", icon: "☁️", description: "Software landing" },
  { id: "restaurant", name: "Restaurant", icon: "🍽️", description: "Menu & reservations" },
];

function BuilderContent() {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [projectTitle, setProjectTitle] = useState("Untitled Project");
  const [hasGenerated, setHasGenerated] = useState(false);
  const [files, setFiles] = useState<Record<string, string>>({
    "/src/App.tsx": `import "./styles.css";\n\nexport default function App() {\n  return (\n    <div className="min-h-screen bg-white flex items-center justify-center p-8 text-stone-400 font-sans">\n      <div className="text-center space-y-4">\n        <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto">\n           <div className="w-2 h-2 rounded-full bg-stone-300 animate-pulse" />\n        </div>\n        <p className="text-sm font-medium tracking-tight">Ready to build your vision</p>\n      </div>\n    </div>\n  );\n}`,
    "/src/styles.css": `
      @tailwind base;
      @tailwind components;
      @tailwind utilities;

      html, body, #root { 
        height: 100%; 
        margin: 0; 
        padding: 0; 
      }
      
      body {
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
    `
  });
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // Persistence
  useEffect(() => {
    const saved = localStorage.getItem("aura_builder_state");
    if (saved) {
      try {
        const { files: savedFiles, messages: savedMessages, title, hasGen } = JSON.parse(saved);
        if (savedFiles) {
          // Migration: Map old root paths to /src/
          const migratedFiles: Record<string, string> = {};
          Object.entries(savedFiles).forEach(([path, content]) => {
            const newPath = path.startsWith("/src/") ? path : `/src${path.startsWith("/") ? "" : "/"}${path}`;
            migratedFiles[newPath] = content as string;
          });
          setFiles(migratedFiles);
        }
        if (savedMessages) setChatMessages(savedMessages);
        if (title) setProjectTitle(title);
        if (hasGen) setHasGenerated(hasGen);
      } catch (e) {
        console.error("Failed to load saved state", e);
      }
    }
  }, []);

  useEffect(() => {
    if (hasGenerated) {
      localStorage.setItem("aura_builder_state", JSON.stringify({
        files,
        messages: chatMessages,
        title: projectTitle,
        hasGen: hasGenerated
      }));
    }
  }, [files, chatMessages, projectTitle, hasGenerated]);
  const [chatInput, setChatInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [viewMode, setViewMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [editMode, setEditMode] = useState<"preview" | "code">("preview");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTemplates, setShowTemplates] = useState(mode !== "redesign");
  const [sandpackKey, setSandpackKey] = useState(0);
  const [buildSteps, setBuildSteps] = useState<BuildStep[]>([]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, buildSteps]);

  const generateWebsite = async (userPrompt: string, template?: string) => {
    if (!userPrompt.trim() && !template) return;
    
    setIsGenerating(true);
    setShowTemplates(false);
    setBuildSteps([
      { title: "Analyzing your request", status: "current" },
      { title: "Creating project structure", status: "pending" },
      { title: "Generating React components", status: "pending" },
      { title: "Applying Tailwind styling", status: "pending" },
      { title: "Adding animations", status: "pending" },
    ]);
    
    // Animate through steps
    const stepTimings = [1500, 3000, 5000, 8000];
    stepTimings.forEach((time, idx) => {
      setTimeout(() => {
        setBuildSteps(prev => prev.map((s, i) => ({
          ...s,
          status: i < idx + 1 ? "completed" : i === idx + 1 ? "current" : "pending"
        })));
      }, time);
    });
    
    const userMessage: ChatMessage = { 
      role: "user", 
      content: template ? `Create a ${template} website: ${userPrompt || "Make it modern and professional"}` : userPrompt 
    };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput("");

    try {
      const response = await fetch("/api/builder/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: userMessage.content,
          messages: chatMessages,
          isModification: false,
        }),
      });

      const text = await response.text();
      if (!response.ok) throw new Error(text || "Generation failed");

      const data = JSON.parse(text);
      
      if (data.files) {
            const fileList = Object.keys(data.files);
            setBuildSteps([
              { title: "Analyzed request", status: "completed" },
              { title: "Created project structure", status: "completed" },
              { title: `Generated ${fileList.length} files`, status: "completed", files: fileList },
              { title: "Applied styling & animations", status: "completed" },
              { title: "Build complete!", status: "completed" },
            ]);
            
            // Map files to /src/ directory and ensure styles.css exists
            const mappedFiles: Record<string, string> = {
              "/src/styles.css": files["/src/styles.css"] || ""
            };

            Object.entries(data.files).forEach(([path, content]) => {
              const newPath = path.startsWith("/src/") ? path : `/src${path.startsWith("/") ? "" : "/"}${path}`;
              mappedFiles[newPath] = content as string;
            });
            
            setFiles(mappedFiles);
            setSandpackKey(prev => prev + 1);
            setProjectTitle(data.projectTitle || "Untitled Project");
            setHasGenerated(true);
            setChatMessages(prev => [...prev, {
              role: "assistant",
              content: data.description || "I've built your website! You can see it in the preview. Click 'Code' to see the files I created. What would you like to change?"
            }]);
          }
    } catch (error) {
      console.error("Generation failed:", error);
      setChatMessages(prev => [...prev, {
        role: "assistant",
        content: `Error: ${error instanceof Error ? error.message : "Unknown error"}. Please try again.`
      }]);
    } finally {
      setIsGenerating(false);
      setTimeout(() => setBuildSteps([]), 3000);
    }
  };

  const modifyWebsite = async (instruction: string) => {
    setIsGenerating(true);
    setBuildSteps([
      { title: "Processing instruction...", status: "current" },
      { title: "Modifying file structure", status: "pending" },
      { title: "Updating code & styling", status: "pending" },
    ]);

    const userMessage: ChatMessage = { role: "user", content: instruction };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput("");

    try {
      const response = await fetch("/api/builder/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: instruction,
          messages: chatMessages,
          isModification: true,
          currentFiles: files,
        }),
      });

      const text = await response.text();
      if (!response.ok) throw new Error(text || "Modification failed");

      const data = JSON.parse(text);
      
      if (data.files) {
          setBuildSteps(prev => prev.map(s => ({ ...s, status: "completed" })));
          
          // Map files to /src/ directory and ensure styles.css exists
          const mappedFiles: Record<string, string> = {
            "/src/styles.css": files["/src/styles.css"] || ""
          };

          Object.entries(data.files).forEach(([path, content]) => {
            const newPath = path.startsWith("/src/") ? path : `/src${path.startsWith("/") ? "" : "/"}${path}`;
            mappedFiles[newPath] = content as string;
          });
          
          setFiles(mappedFiles);
          setSandpackKey(prev => prev + 1);
          setChatMessages(prev => [...prev, {
            role: "assistant",
            content: "Changes applied successfully! I've updated the code and styling as requested."
          }]);
      } else if (data.error) {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Modification failed:", error);
      setChatMessages(prev => [...prev, {
        role: "assistant",
        content: `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      }]);
    } finally {
      setIsGenerating(false);
      setTimeout(() => setBuildSteps([]), 3000);
    }
  };

  const handleMagicWand = () => {
    modifyWebsite("Enhance the UI/UX with better spacing, refined typography, and subtle entrance animations using framer-motion.");
  };

  const handleChatSubmit = () => {
    if (!chatInput.trim()) return;
    if (!hasGenerated) {
      generateWebsite(chatInput);
    } else {
      modifyWebsite(chatInput);
    }
  };

  const getPreviewWidth = () => {
    if (isFullscreen) return "100%";
    switch (viewMode) {
      case "mobile": return "375px";
      case "tablet": return "768px";
      default: return "100%";
    }
  };

    return (
      <div className="h-screen flex flex-col bg-stone-50 overflow-hidden font-sans">
        {/* Header */}
        <header className="h-16 border-b border-stone-200 bg-white flex items-center justify-between px-4 md:px-6 z-30 shadow-sm">
          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 -ml-2 rounded-lg hover:bg-stone-100 transition-colors text-stone-500 md:hidden"
            >
              <PanelLeftClose className="w-5 h-5" />
            </button>
            <Link href="/chat" className="p-2 rounded-full hover:bg-stone-100 transition-colors text-stone-500 hidden md:block">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-[#343434] flex items-center justify-center shadow-lg">
                <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xs md:text-sm font-bold text-stone-900 leading-tight truncate max-w-[100px] md:max-w-none">{projectTitle}</h1>
                <p className="text-[9px] md:text-[10px] text-stone-400 font-medium uppercase tracking-wider">AI Builder</p>
              </div>
            </div>
          </div>
  
          <div className="flex items-center gap-2 md:gap-4">
            <div className="hidden lg:flex items-center bg-stone-100 rounded-xl p-1 border border-stone-200/50">
              <button
                onClick={() => setEditMode("preview")}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${editMode === "preview" ? "bg-white text-stone-900 shadow-sm" : "text-stone-400 hover:text-stone-600"}`}
              >
                <Eye className="w-3.5 h-3.5" /> Preview
              </button>
              <button
                onClick={() => setEditMode("code")}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${editMode === "code" ? "bg-white text-stone-900 shadow-sm" : "text-stone-400 hover:text-stone-600"}`}
              >
                <Code className="w-3.5 h-3.5" /> Code
              </button>
            </div>
  
              <button
                onClick={() => {
                  if (confirm("Start a new project?")) {
                    setFiles({
                      "/src/App.tsx": `import "./styles.css";\n\nexport default function App() {\n  return (\n    <div className="min-h-screen bg-white flex items-center justify-center p-8 text-stone-400 font-sans">\n      <div className="text-center space-y-4">\n        <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto">\n           <div className="w-2 h-2 rounded-full bg-stone-300 animate-pulse" />\n        </div>\n        <p className="text-sm font-medium tracking-tight">Ready to build your vision</p>\n      </div>\n    </div>\n  );\n}`,
                      "/src/styles.css": files["/src/styles.css"] || ""
                    });
                    setChatMessages([]);
                    setProjectTitle("Untitled Project");
                    setHasGenerated(false);
                    setShowTemplates(true);
                    setSandpackKey(prev => prev + 1);
                    localStorage.removeItem("aura_builder_state");
                  }
                }}

              className="p-2 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 transition-all sm:px-4 sm:py-2"
              title="New Project"
            >
              <RefreshCw className="w-4 h-4 sm:mr-2 sm:inline" />
              <span className="hidden sm:inline text-sm font-bold">New Project</span>
            </button>
  
            <button
              onClick={handleMagicWand}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 md:px-6 py-2 rounded-xl bg-[#343434] text-white text-sm font-bold hover:bg-stone-800 transition-all disabled:opacity-50 active:scale-95"
            >
              <Wand2 className="w-4 h-4" />
              <span className="hidden md:inline">Magic Wand</span>
            </button>
          </div>
        </header>
  
        <div className="flex-1 flex overflow-hidden relative">
          {/* Mobile Sidebar Overlay */}
          {sidebarOpen && (
            <div 
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-300"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sidebar */}
          <AnimatePresence initial={false}>
            {sidebarOpen && !isFullscreen && (
              <motion.aside
                initial={{ x: -400, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -400, opacity: 0 }}
                className="fixed inset-y-0 left-0 z-50 w-[85%] md:w-[400px] md:static border-r border-stone-200 bg-white flex flex-col shadow-xl"
              >

              <div className="p-6 border-b border-stone-100 flex items-center justify-between">
                <h2 className="text-base font-bold text-stone-800 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-stone-400" />
                  Design Assistant
                </h2>
                <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-stone-100 rounded-full text-stone-400">
                  <PanelLeftClose className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {chatMessages.length === 0 ? (
                  <div className="space-y-6">
                    <div className="p-5 rounded-3xl bg-stone-50 border border-stone-100">
                      <p className="text-sm text-stone-600 leading-relaxed">
                        Hey! I'm Aura. I build high-performance, responsive websites with a modern aesthetic. Tell me what you need, or start with a template.
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {TEMPLATES.map(template => (
                        <button
                          key={template.id}
                          onClick={() => generateWebsite("", template.id)}
                          className="p-5 rounded-3xl bg-white border border-stone-200 hover:border-stone-400 hover:shadow-lg transition-all text-left group"
                        >
                          <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">{template.icon}</div>
                          <p className="text-xs font-bold text-stone-800">{template.name}</p>
                          <p className="text-[10px] text-stone-400 mt-1 line-clamp-1">{template.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {chatMessages.map((msg, idx) => (
                      <div key={idx} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                        <div className={`max-w-[90%] py-1 text-sm ${
                          msg.role === "user" 
                            ? "text-stone-900 font-semibold" 
                            : "text-stone-600"
                        }`}>
                          <div className="flex items-center gap-2 mb-1">
                            <div className={`w-1.5 h-1.5 rounded-full ${msg.role === 'user' ? 'bg-stone-900' : 'bg-stone-300'}`} />
                            <span className="text-[10px] uppercase tracking-wider font-bold opacity-50">
                              {msg.role === 'user' ? 'You' : 'Aura'}
                            </span>
                          </div>
                          <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      </div>
                    ))}

                    {(isGenerating || buildSteps.length > 0) && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-2xl bg-gradient-to-br from-stone-50 to-stone-100 border border-stone-200"
                      >
                        <div className="flex items-center gap-3 text-stone-900 font-bold text-sm mb-4">
                          {isGenerating ? (
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 rounded-full bg-[#343434] flex items-center justify-center">
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                              </div>
                              <span className="animate-pulse bg-gradient-to-r from-stone-900 via-stone-400 to-stone-900 bg-clip-text text-transparent bg-[length:200%_auto] font-bold">
                                Beauto is thinking...
                              </span>
                            </div>
                          ) : (
                            <>
                              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                              </div>
                              Website built successfully!
                            </>
                          )}
                        </div>
                        <div className="space-y-2">
                          {buildSteps.map((step, i) => (
                            <motion.div
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.1 }}
                              key={i}
                              className="space-y-1"
                            >
                              <div className={`flex items-center gap-2.5 text-xs ${
                                step.status === "completed" ? "text-green-600" : 
                                step.status === "current" ? "text-stone-900 font-medium" : "text-stone-400"
                              }`}>
                                {step.status === "completed" ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                                ) : step.status === "current" ? (
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin flex-shrink-0" />
                                ) : (
                                  <div className="w-3.5 h-3.5 rounded-full border border-stone-300 flex-shrink-0" />
                                )}
                                {step.title}
                              </div>
                              {step.files && step.status === "completed" && (
                                <motion.div 
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  className="ml-6 space-y-1"
                                >
                                  {step.files.map((file, fi) => (
                                    <motion.div
                                      initial={{ opacity: 0, x: -5 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: fi * 0.05 }}
                                      key={file}
                                      className="flex items-center gap-2 text-[10px] text-stone-500 font-mono bg-white/50 px-2 py-1 rounded"
                                    >
                                      <Code className="w-3 h-3" />
                                      {file}
                                    </motion.div>
                                  ))}
                                </motion.div>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                    <div ref={chatEndRef} />
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-stone-100">
                <div className="relative group">
                  <textarea
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleChatSubmit();
                      }
                    }}
                    placeholder="Refine your design..."
                    rows={1}
                    className="w-full pl-5 pr-14 py-4 rounded-3xl border border-stone-200 bg-stone-50 text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-4 focus:ring-stone-900/5 focus:border-stone-400 text-sm shadow-sm resize-none transition-all"
                  />
                  <button
                    onClick={handleChatSubmit}
                    disabled={!chatInput.trim() || isGenerating}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-2xl bg-[#343434] text-white hover:bg-stone-800 disabled:opacity-30 transition-all shadow-lg shadow-stone-200"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

{/* Preview Panel */}
          <main className="flex-1 relative bg-stone-100 flex flex-col items-center overflow-hidden">
            <div className="flex-1 w-full h-full flex items-center justify-center p-8 overflow-hidden">
              <motion.div
                layout
                className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden transition-all duration-700 border border-stone-200 relative group/preview"
                style={{ width: getPreviewWidth(), height: "100%", maxHeight: "100%" }}
              >
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-7 bg-stone-50 rounded-full border border-stone-200 flex items-center justify-center z-20 opacity-0 group-hover/preview:opacity-100 transition-all pointer-events-none shadow-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-stone-200 mx-1.5" />
                      <div className="w-10 h-1.5 rounded-full bg-stone-200 mx-1.5" />
                  </div>

                  {!hasGenerated ? (
                    <div className="h-full flex flex-col">
                      <div className="bg-gradient-to-r from-[#343434] to-[#4a4a4a] px-6 py-4 flex items-center justify-center">
                        <h2 className="text-white text-lg font-semibold tracking-tight">Prompt in chat to begin</h2>
                      </div>
                      <div className="flex-1 overflow-hidden relative">
                        <iframe
                          src="/"
                          className="w-full h-full border-0 pointer-events-none"
                          style={{ transform: "scale(0.85)", transformOrigin: "top center", height: "118%" }}
                          title="Beauto Preview"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent pointer-events-none" />
                      </div>
                    </div>
                  ) : (
                    <SandpackProvider
                          key={`sandpack-${sandpackKey}`}
                          template="react-ts"
                          files={files}
                          theme="light"
                          options={{
                              externalResources: [
                                  "https://cdn.tailwindcss.com",
                              ],
                              visibleFiles: ["/src/App.tsx"],
                              activeFile: "/src/App.tsx",
                          }}
                          customSetup={{
                              entry: "/src/App.tsx",
                              dependencies: {
                                  "framer-motion": "^10.16.4",
                                  "lucide-react": "^0.292.0",
                                  "clsx": "^2.0.0",
                                  "tailwind-merge": "^2.0.0",
                              },
                          }}
                      >
                        <SandpackLayout className="!h-full !border-0 !rounded-none !bg-transparent !flex !flex-col">
                          {editMode === "code" ? (
                            <div className="flex-1 flex overflow-hidden">
                              <SandpackFileExplorer className="!h-full !border-r !border-stone-100 w-64" />
                              <SandpackCodeEditor 
                                showTabs 
                                showLineNumbers 
                                closableTabs
                                className="flex-1 !h-full"
                              />
                            </div>
                          ) : (
                            <SandpackPreview 
                              showNavigator={false}
                              showRefreshButton={false}
                              className="flex-1 !h-full"
                            />
                          )}
                        </SandpackLayout>
                      </SandpackProvider>
                  )}
              </motion.div>
            </div>
          </main>
      </div>
    </div>
  );
}

export default function BuilderPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center bg-stone-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#343434]" />
      </div>
    }>
      <BuilderContent />
    </Suspense>
  );
}
