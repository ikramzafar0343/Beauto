"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Loader2, MicOff, Zap, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface VoiceAssistantProps {
  onTranscript?: (text: string) => void;
  onSubmitPrompt?: (text: string) => void;
  onAssistantResponse?: (text: string) => void;
  onVoiceModeChange?: (enabled: boolean) => void;
  isProcessing?: boolean;
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
  language?: string; // Language code: 'en', 'sv', 'da', 'no', 'ar'
}

type Status = "idle" | "connecting" | "listening" | "speaking" | "error";

// Map language codes to Whisper language codes
const getWhisperLanguageCode = (lang?: string): string | undefined => {
  const langMap: Record<string, string> = {
    'en': 'en',
    'sv': 'sv',
    'da': 'da',
    'no': 'no',
    'ar': 'ar',
  };
  return lang ? langMap[lang] : undefined;
};

// Get language name for instructions
const getLanguageName = (lang?: string): string => {
  const langNames: Record<string, string> = {
    'en': 'English',
    'sv': 'Swedish',
    'da': 'Danish',
    'no': 'Norwegian',
    'ar': 'Arabic',
  };
  return lang ? langNames[lang] || 'the same language as the user' : 'the same language as the user';
};

export function VoiceAssistant({
  onTranscript,
  onSubmitPrompt,
  onAssistantResponse,
  onVoiceModeChange,
  isProcessing = false,
  isOpen,
  onClose,
  initialPrompt = "",
  language = "en",
}: VoiceAssistantProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [assistantText, setAssistantText] = useState("");
    const [dbLevel, setDbLevel] = useState(0);
    const pendingChatSubmitRef = useRef<string | null>(null);

    const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const activeSessionRef = useRef<string | null>(null);

  const cleanup = useCallback(() => {
    activeSessionRef.current = null;
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (dcRef.current) {
      dcRef.current.close();
      dcRef.current = null;
    }
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (audioElementRef.current) {
      audioElementRef.current.srcObject = null;
      audioElementRef.current = null;
    }
    setStatus("idle");
    setDbLevel(0);
  }, []);

    const handleFunctionCall = useCallback(async (name: string, args: Record<string, unknown>, callId: string) => {
      console.log("Function call received:", name, args);
      let result: unknown = { error: "Unknown function" };
  
      try {
        if (name === "submit_to_chat") {
          const { text } = args as { text: string };
          // Store it to be sent AFTER the assistant finishes its verbal confirmation/response
          pendingChatSubmitRef.current = text;
          result = { success: true, message: "Prompt queued. It will be sent to the chat after you finish speaking your confirmation." };
        }
      } catch (err: unknown) {
      console.error("Function execution error:", err);
      result = { error: err instanceof Error ? err.message : "Execution failed" };
    }

    // Send function call output back to the model
    if (dcRef.current && dcRef.current.readyState === "open") {
      dcRef.current.send(JSON.stringify({
        type: "conversation.item.create",
        item: {
          type: "function_call_output",
          call_id: callId,
          output: JSON.stringify(result),
        }
      }));
      dcRef.current.send(JSON.stringify({ type: "response.create" }));
    }
  }, [onTranscript]);

  const start = useCallback(async () => {
    const sessionId = Math.random().toString(36).substring(7);
    activeSessionRef.current = sessionId;

    setError(null);
    setAssistantText("");
    setStatus("connecting");

    try {
      // 1. Get ephemeral token from backend
      const tokenRes = await fetch("/api/voice-openai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const tokenData = await tokenRes.json();
      if (!tokenRes.ok) throw new Error(tokenData.error || "Could not start voice session");
      const ephemeralKey = tokenData.client_secret;

      // Check if we are still the active session
      if (activeSessionRef.current !== sessionId) return;

      // 2. Create peer connection
      const pc = new RTCPeerConnection();
      pcRef.current = pc;

      // 3. Set up audio playback
      const audioEl = document.createElement("audio");
      audioEl.autoplay = true;
      audioElementRef.current = audioEl;

      pc.ontrack = (e) => {
        if (audioEl) audioEl.srcObject = e.streams[0];
      };

      // 4. Get microphone and add to peer connection
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => {
        if (pc.signalingState !== "closed") pc.addTrack(track, stream);
      });

      // Set up audio visualizer
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const updateVisualizer = () => {
        if (!analyserRef.current) return;
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        const sum = dataArray.reduce((a, b) => a + b, 0);
        const average = sum / dataArray.length;
        setDbLevel(average);
        animationFrameRef.current = requestAnimationFrame(updateVisualizer);
      };
      updateVisualizer();

      // 5. Create data channel for events
      const dc = pc.createDataChannel("oai-events");
      dcRef.current = dc;

        dc.onopen = () => {
          if (pc.signalingState === "closed") return;
          // Send session update with tools and instructions
          dc.send(JSON.stringify({
            type: "session.update",
  
            session: {
              turn_detection: {
                type: "server_vad",
                threshold: 0.5,
                prefix_padding_ms: 300,
                silence_duration_ms: 1000
              },
              instructions: `Instructions for Voice Assistant:
1. You are Beauto, a powerful automation assistant.
2. ALWAYS respond in ${getLanguageName(language)}. Match the user's language preference.
3. BEFORE you do ANYTHING (submit_to_chat), you MUST ALWAYS ask for verbal confirmation.
   - Example (Swedish): "Ska jag hämta dina senaste mejl åt dig?"
   - Example (English): "Should I get your latest emails for you?"
   - Example (Danish): "Skal jeg hente dine seneste emails til dig?"
   - Example (Norwegian): "Skal jeg hente dine siste e-poster til deg?"
   - Example (Arabic): "هل تريد مني أن أحضر آخر رسائل البريد الإلكتروني الخاصة بك؟"
4. ONLY after the user confirms (e.g., "Ja", "Gör det", "Yes", "Sure", "Ja tak", "Ja", "نعم"), you call 'submit_to_chat'.
5. When you call 'submit_to_chat', verbally inform the user that you are doing it.
   - Example (Swedish): "Absolut, jag lägger in det i chatten nu."
   - Example (English): "Certainly, I'm putting that into the chat now."
   - Example (Danish): "Selvfølgelig, jeg lægger det i chatten nu."
   - Example (Norwegian): "Selvfølgelig, jeg legger det i chatten nå."
   - Example (Arabic): "بالتأكيد، سأضعه في الدردشة الآن."
6. The prompt you submit should be a CLEAR command for the main chat (e.g., "Hämta mina 5 senaste mejl från Gmail").

Be concise and natural. Use short sentences. Always use ${getLanguageName(language)}.
${initialPrompt}`,
              input_audio_transcription: {
                model: "whisper-1",
                ...(getWhisperLanguageCode(language) && { language: getWhisperLanguageCode(language) })
              },
                tools: [
                {
                  type: "function",
                  name: "submit_to_chat",
                  description: "Submit a message or prompt to the main chat window. Use this when the user wants to 'put this in the chat', 'send this prompt', or 'hämta senaste email' (by typing it for them).",
                  parameters: {
                    type: "object",
                    properties: {
                      text: { type: "string", description: "The text/prompt to submit to the chat" }
                    },
                    required: ["text"]
                  }
                }
              ],
            tool_choice: "auto",
          }
        }));
      };

      dc.onmessage = (e) => {
        try {
          const event = JSON.parse(e.data);

          switch (event.type) {
            case "response.audio_transcript.delta":
            case "response.output_audio_transcript.delta":
              setAssistantText(prev => (prev + (event.delta || "")).slice(-500));
              setStatus("speaking");
              break;

            case "conversation.item.input_audio_transcription.completed":
              if (event.transcript && onTranscript) {
                onTranscript(event.transcript.trim());
              }
              break;

            case "response.audio_transcript.done":
            case "response.output_audio_transcript.done":
              if (event.transcript && onAssistantResponse) {
                onAssistantResponse(event.transcript.trim());
              }
              break;

              case "response.done":
                setStatus("listening");
                // If we have a pending chat submission, trigger it now that the verbal response is done
                if (pendingChatSubmitRef.current && onSubmitPrompt) {
                  const text = pendingChatSubmitRef.current;
                  pendingChatSubmitRef.current = null;
                  onSubmitPrompt(text);
                }
                break;

            case "input_audio_buffer.speech_started":
              setStatus("listening");
              setAssistantText("");
              break;

            case "response.function_call_arguments.done":
              if (event.name && event.arguments) {
                try {
                  const args = JSON.parse(event.arguments);
                  handleFunctionCall(event.name, args, event.call_id);
                } catch (parseErr) {
                  console.error("Failed to parse function args:", parseErr);
                }
              }
              break;

            case "error":
              console.error("Realtime error:", event.error);
              setError(event.error?.message || "Connection error");
              setStatus("error");
              break;
          }
        } catch (parseErr) {
          // Non-JSON message, ignore
        }
      };

      // 6. Create and set local offer
      if ((pc.signalingState as string) === "closed") return;
      const offer = await pc.createOffer();
      if ((pc.signalingState as string) === "closed") return;
      await pc.setLocalDescription(offer);

      // 7. Send offer to OpenAI and get answer
      const sdpResponse = await fetch("https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ephemeralKey}`,
          "Content-Type": "application/sdp",
        },
        body: offer.sdp,
      });

      if (!sdpResponse.ok) {
        const errText = await sdpResponse.text();
        throw new Error(`WebRTC connection failed: ${errText}`);
      }

      const answerSdp = await sdpResponse.text();
      if (activeSessionRef.current === sessionId && pc.signalingState !== "closed") {
        await pc.setRemoteDescription({ type: "answer", sdp: answerSdp });
      }

      setStatus("listening");

    } catch (err: unknown) {
      console.error("Voice start error:", err);
      setError(err instanceof Error ? err.message : "Connection failed");
      setStatus("error");
      cleanup();
    }
  }, [initialPrompt, language, cleanup, handleFunctionCall]);

  useEffect(() => {
    if (isOpen) {
      start();
      onVoiceModeChange?.(true);
    } else {
      cleanup();
      onVoiceModeChange?.(false);
    }
    return () => cleanup();
  }, [isOpen, start, cleanup, onVoiceModeChange]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="fixed bottom-6 right-6 w-80 bg-white dark:bg-[#1a1a1a] rounded-[32px] shadow-2xl border border-[#dae0e2] dark:border-[#27272a] z-[60] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-4 flex items-center justify-between border-b border-[#dae0e2] dark:border-[#27272a]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#343434] dark:text-white">Beauto Live</p>
                <div className="flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${status === 'listening' ? 'bg-green-500 animate-pulse' : status === 'speaking' ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'}`} />
                  <p className="text-[10px] text-[#343434]/50 dark:text-white/50 uppercase font-bold tracking-wider">
                    {status === 'connecting' ? 'Connecting...' : status === 'listening' ? 'Listening' : status === 'speaking' ? 'Speaking' : status === 'error' ? 'Error' : 'Ready'}
                  </p>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-[#f8f9fa] dark:hover:bg-[#27272a] rounded-full transition-colors">
              <X className="w-4 h-4 text-[#343434]/40 dark:text-white/40" />
            </button>
          </div>

          {/* Visualizer Area */}
          <div className="h-48 flex items-center justify-center bg-gradient-to-b from-transparent to-[#f8f9fa]/50 dark:to-[#0a0a0a]/50 relative">
            <div className="flex items-end gap-1 h-20">
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    height: status === 'listening' || status === 'speaking' 
                      ? Math.max(8, (dbLevel * (0.5 + Math.random())) * (1 - Math.abs(i - 6) / 8)) 
                      : 8
                  }}
                  className={`w-1.5 rounded-full ${status === 'speaking' ? 'bg-blue-500' : 'bg-purple-500'}`}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                />
              ))}
            </div>
            
            {status === 'connecting' && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-sm">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            )}
          </div>

          {/* Transcript Area */}
          <div className="flex-1 p-4 bg-white dark:bg-[#1a1a1a] min-h-[100px] max-h-[150px] overflow-y-auto">
            {assistantText ? (
              <p className="text-sm text-[#343434] dark:text-white leading-relaxed italic">
                "{assistantText}..."
              </p>
            ) : (
              <p className="text-sm text-[#343434]/30 dark:text-white/30 text-center mt-4">
                {status === 'listening' ? "I'm listening, what's on your mind?" : 'Say something to start...'}
              </p>
            )}
          </div>

          {/* Footer Controls */}
          <div className="p-4 bg-[#f8f9fa] dark:bg-[#0a0a0a] flex items-center justify-center gap-4">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-full bg-[#343434] dark:bg-white text-white dark:text-[#0a0a0a] text-sm font-bold flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-lg"
            >
              <MicOff className="w-4 h-4" />
              End Call
            </button>
          </div>
          
          {error && (
            <div className="absolute top-0 left-0 right-0 bg-red-500 text-white text-[10px] py-1 px-3 text-center">
              {error}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
