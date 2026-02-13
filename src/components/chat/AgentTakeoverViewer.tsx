"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Monitor, MousePointer2, Keyboard, Globe, CheckCircle2, AlertCircle, Send, MessageSquare, Bot, Volume2 } from "lucide-react";
import Image from "next/image";

interface AgentAction {
  type: string;
  description: string;
  timestamp: Date;
}

interface AgentTakeoverViewerProps {
  isOpen: boolean;
  onClose: () => void;
  prompt: string;
  url?: string;
  onComplete?: (response: string) => void;
  onSubmitToChat?: (message: string) => void;
}

export function AgentTakeoverViewer({
  isOpen,
  onClose,
  prompt,
  url = "https://www.google.com",
  onComplete,
  onSubmitToChat,
}: AgentTakeoverViewerProps) {
  const [status, setStatus] = useState<"idle" | "running" | "suggesting" | "completed" | "error">("idle");
  const [currentScreenshot, setCurrentScreenshot] = useState<string | null>(null);
  const [actions, setActions] = useState<AgentAction[]>([]);
  const [currentUrl, setCurrentUrl] = useState(url);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [finalResponse, setFinalResponse] = useState<string | null>(null);
  
  // Agent suggestion state
  const [suggestedPrompt, setSuggestedPrompt] = useState<string | null>(null);
  const [isWaitingForConfirmation, setIsWaitingForConfirmation] = useState(false);
  const [agentMessage, setAgentMessage] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const eventSourceRef = useRef<EventSource | null>(null);

  // Text-to-speech function
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    if (!isOpen || status !== "idle") return;

    const runTakeover = async () => {
      setStatus("running");
      setActions([{ type: "start", description: "Starting browser session...", timestamp: new Date() }]);

      try {
        const response = await fetch("/api/agent-takeover/stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt, url }),
        });

        if (!response.ok) {
          throw new Error("Failed to start agent takeover");
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                
                if (data.type === "screenshot") {
                  setCurrentScreenshot(data.image);
                } else if (data.type === "action") {
                  setActions(prev => [...prev, {
                    type: data.actionType,
                    description: data.description,
                    timestamp: new Date(),
                  }]);
                } else if (data.type === "url") {
                  setCurrentUrl(data.url);
                } else if (data.type === "suggestion") {
                  // Agent is suggesting a prompt for chat
                  setSuggestedPrompt(data.prompt);
                  setAgentMessage(data.message || "I'd like to run this command. Is that okay?");
                  setIsWaitingForConfirmation(true);
                  setStatus("suggesting");
                  speakText(data.message || "I'd like to run this command. Is that okay?");
                } else if (data.type === "complete") {
                  setFinalResponse(data.response);
                  setStatus("completed");
                  onComplete?.(data.response);
                  if (data.response) {
                    speakText(data.response);
                  }
                } else if (data.type === "error") {
                  setErrorMessage(data.message);
                  setStatus("error");
                }
              } catch {
                // Skip malformed JSON
              }
            }
          }
        }
      } catch (err) {
        console.error("Agent takeover error:", err);
        setErrorMessage(err instanceof Error ? err.message : "Unknown error");
        setStatus("error");
      }
    };

    runTakeover();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      window.speechSynthesis?.cancel();
    };
  }, [isOpen, prompt, url, onComplete, status]);

  const handleConfirmPrompt = () => {
    if (suggestedPrompt && onSubmitToChat) {
      onSubmitToChat(suggestedPrompt);
      setSuggestedPrompt(null);
      setIsWaitingForConfirmation(false);
      setAgentMessage(null);
      setStatus("running");
      setActions(prev => [...prev, {
        type: "submit",
        description: `Submitted to chat: "${suggestedPrompt.slice(0, 50)}..."`,
        timestamp: new Date(),
      }]);
      speakText("Okay, I'm sending that to the chat now.");
    }
  };

  const handleRejectPrompt = () => {
    setSuggestedPrompt(null);
    setIsWaitingForConfirmation(false);
    setAgentMessage(null);
    setStatus("running");
    speakText("Okay, I won't do that.");
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case "click": return <MousePointer2 className="w-3 h-3" />;
      case "type": return <Keyboard className="w-3 h-3" />;
      case "scroll": return <Monitor className="w-3 h-3" />;
      case "navigate": return <Globe className="w-3 h-3" />;
      case "submit": return <Send className="w-3 h-3" />;
      default: return <Monitor className="w-3 h-3" />;
    }
  };

  const handleClose = () => {
    setStatus("idle");
    setCurrentScreenshot(null);
    setActions([]);
    setErrorMessage(null);
    setFinalResponse(null);
    setSuggestedPrompt(null);
    setIsWaitingForConfirmation(false);
    setAgentMessage(null);
    window.speechSynthesis?.cancel();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] flex items-center justify-center p-6"
          onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-[#1a1a1a] rounded-3xl w-full max-w-5xl h-[80vh] flex flex-col overflow-hidden shadow-2xl border border-[#27272a]"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#27272a] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                  <Monitor className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-white font-bold">Agent Takeover</h2>
                  <p className="text-white/40 text-xs">{prompt}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {isSpeaking && (
                  <div className="px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 bg-purple-500/20 text-purple-400">
                    <Volume2 className="w-3 h-3 animate-pulse" />
                    Speaking...
                  </div>
                )}
                <div className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 ${
                  status === "running" ? "bg-blue-500/20 text-blue-400" :
                  status === "suggesting" ? "bg-yellow-500/20 text-yellow-400" :
                  status === "completed" ? "bg-green-500/20 text-green-400" :
                  status === "error" ? "bg-red-500/20 text-red-400" :
                  "bg-white/10 text-white/60"
                }`}>
                  {status === "running" && <Loader2 className="w-3 h-3 animate-spin" />}
                  {status === "suggesting" && <MessageSquare className="w-3 h-3" />}
                  {status === "completed" && <CheckCircle2 className="w-3 h-3" />}
                  {status === "error" && <AlertCircle className="w-3 h-3" />}
                  {status === "running" ? "Running" : 
                   status === "suggesting" ? "Waiting for approval" :
                   status === "completed" ? "Completed" : 
                   status === "error" ? "Error" : "Ready"}
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-white/60" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex overflow-hidden">
              {/* Screenshot View */}
              <div className="flex-1 p-4 flex items-center justify-center bg-black/50 relative">
                {currentScreenshot ? (
                  <div className="relative rounded-xl overflow-hidden border border-[#27272a] shadow-2xl">
                    <div className="absolute top-0 left-0 right-0 h-8 bg-[#27272a] flex items-center px-3 gap-2">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                      </div>
                      <div className="flex-1 mx-4">
                        <div className="bg-[#1a1a1a] rounded-md px-3 py-1 text-xs text-white/60 truncate max-w-md">
                          {currentUrl}
                        </div>
                      </div>
                    </div>
                    <Image
                      src={`data:image/png;base64,${currentScreenshot}`}
                      alt="Browser screenshot"
                      width={1024}
                      height={768}
                      className="mt-8 max-w-full max-h-[calc(80vh-200px)] object-contain"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="text-center">
                    {status === "running" ? (
                      <>
                        <Loader2 className="w-12 h-12 text-white/30 animate-spin mx-auto mb-4" />
                        <p className="text-white/40">Starting browser...</p>
                      </>
                    ) : status === "error" ? (
                      <>
                        <AlertCircle className="w-12 h-12 text-red-500/50 mx-auto mb-4" />
                        <p className="text-red-400">{errorMessage}</p>
                      </>
                    ) : (
                      <>
                        <Monitor className="w-12 h-12 text-white/20 mx-auto mb-4" />
                        <p className="text-white/30">Waiting to start...</p>
                      </>
                    )}
                  </div>
                )}

                {/* Agent Suggestion Overlay */}
                {isWaitingForConfirmation && suggestedPrompt && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute bottom-4 left-4 right-4 bg-[#1a1a1a] rounded-2xl border border-yellow-500/30 p-4 shadow-2xl"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shrink-0">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm mb-2">{agentMessage}</p>
                        <div className="bg-white/5 rounded-xl p-3 mb-3">
                          <code className="text-yellow-400 text-sm">{suggestedPrompt}</code>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={handleConfirmPrompt}
                            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-bold transition-colors flex items-center gap-2"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Yes, do it
                          </button>
                          <button
                            onClick={handleRejectPrompt}
                            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-medium transition-colors"
                          >
                            No, cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Actions Sidebar */}
              <div className="w-72 border-l border-[#27272a] flex flex-col">
                <div className="px-4 py-3 border-b border-[#27272a]">
                  <h3 className="text-white/60 text-xs font-bold uppercase tracking-wider">Actions</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {actions.map((action, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex items-start gap-2 p-2 rounded-lg ${
                        action.type === "submit" ? "bg-green-500/10" : "bg-white/5"
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                        action.type === "submit" ? "bg-green-500/20 text-green-400" : "bg-white/10 text-white/60"
                      }`}>
                        {getActionIcon(action.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white/80">{action.description}</p>
                        <p className="text-[10px] text-white/30 mt-0.5">
                          {action.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Final Response */}
                {finalResponse && (
                  <div className="p-3 border-t border-[#27272a] bg-green-500/10">
                    <p className="text-xs font-bold text-green-400 mb-1">Result</p>
                    <p className="text-xs text-white/80">{finalResponse}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
