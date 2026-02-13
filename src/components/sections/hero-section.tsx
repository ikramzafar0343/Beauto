"use client";

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ArrowUp, Loader2 } from 'lucide-react';

const ASSETS = {
  supabase: "https://logos.composio.dev/api/supabase",
  gmail: "https://logos.composio.dev/api/gmail",
  calendar: "https://logos.composio.dev/api/googlecalendar"
};

export default function HeroSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let t = 0;

    const resize = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      t += 0.005;
      const width = canvas.width;
      const height = canvas.height;
      
      ctx.clearRect(0, 0, width, height);
      
      const x1 = width * 0.7 + Math.sin(t * 0.5) * (width * 0.1);
      const y1 = height * 0.5 + Math.cos(t * 0.3) * (height * 0.1);
      const r1 = Math.min(width, height) * 0.6;
      
      const g1 = ctx.createRadialGradient(x1, y1, 0, x1, y1, r1);
      g1.addColorStop(0, 'rgba(236, 78, 138, 0.15)');
      g1.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, width, height);

      const x2 = width * 0.3 - Math.sin(t * 0.4) * (width * 0.1);
      const y2 = height * 0.4 + Math.sin(t * 0.6) * (height * 0.1);
      const r2 = Math.min(width, height) * 0.7;

      const g2 = ctx.createRadialGradient(x2, y2, 0, x2, y2, r2);
      g2.addColorStop(0, 'rgba(240, 94, 75, 0.1)');
      g2.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, width, height);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const handleSubmit = async () => {
    if (!inputValue.trim() || isLoading) return;
    
    setIsLoading(true);
    setResponse(null);
    
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: inputValue }),
      });
      
      const data = await res.json();
      
      if (data.response) {
        setResponse(data.response);
      } else if (data.error) {
        setResponse(`Error: ${data.error}`);
      }
    } catch {
      setResponse("Failed to connect to Beauto. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (text: string) => {
    setInputValue(text);
    setResponse(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden bg-white">
      <div className="fixed inset-0 z-0 h-[100lvh] w-[100vw] pointer-events-none">
        <div className="absolute inset-0 z-0 opacity-50 blur-[12px] will-change-auto 2xl:blur-[48px]">
          <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
        </div>
      </div>

      <div className="relative mx-auto mt-[10vh] w-full max-w-5xl px-4 md:mt-[12vh]">
        <div className="absolute left-0 top-0 z-[1] h-[350px] w-full bg-gradient-to-b from-white to-transparent -mt-[10vh] pointer-events-none"></div>
        <div className="absolute inset-0 z-[1] h-[calc(100%+256px)] w-[calc(100%+32px)] -translate-x-[16px] -translate-y-[96px] rounded-full bg-white blur-[72px] pointer-events-none"></div>

        <div className="relative z-30 flex flex-col items-center justify-center text-center">
          <h1 className="font-[family-name:var(--font-display)] text-4xl font-medium tracking-tight text-neutral-800 sm:text-5xl sm:leading-[64px] lg:text-6xl">
            Now your AI can
          </h1>
          
          <div className="-mt-2 flex flex-col items-center gap-2">
            <div className="flex items-center justify-center">
              <span className="whitespace-nowrap font-[family-name:var(--font-display)] text-4xl font-medium tracking-tight text-neutral-800 transition-opacity opacity-100 sm:text-5xl lg:text-6xl">
                Manage databases
              </span>
            </div>
            
            <div className="mt-4 flex items-center justify-center gap-2 font-[family-name:var(--font-display)] text-2xl tracking-tight text-neutral-500 sm:gap-3 sm:text-3xl lg:text-5xl">
              <span className="whitespace-nowrap transition-opacity opacity-100">with</span>
              <div className="inline-flex h-[32px] w-[32px] flex-shrink-0 items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white shadow-sm transition-all scale-100 opacity-100 sm:h-[48px] sm:w-[48px] sm:rounded-xl">
                 <div className="relative h-[20px] w-[20px] sm:h-[32px] sm:w-[32px]">
                   <Image 
                     src={ASSETS.supabase} 
                     alt="Supabase" 
                     fill 
                     className="object-contain"
                     unoptimized
                   />
                 </div>
              </div>
              <span className="whitespace-nowrap transition-opacity opacity-100">Supabase</span>
            </div>
          </div>
        </div>

        <div className="relative z-30 mt-12 sm:mt-16">
          <div className="mx-auto flex w-full max-w-2xl flex-col rounded-[32px] bg-white px-4 py-4 shadow-lg outline outline-1 outline-neutral-100">
            <div className="flex-1 p-1">
              <textarea 
                className="h-[100px] w-full resize-none text-base text-neutral-700 placeholder:font-medium placeholder:text-neutral-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:h-[80px] sm:text-lg font-[family-name:var(--font-body)] bg-transparent"
                placeholder="Ask Beauto to do anything"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
              />
            </div>
            <div className="flex w-full items-center justify-end">
              <button 
                onClick={handleSubmit}
                disabled={isLoading || !inputValue.trim()}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-400 transition-all duration-300 hover:bg-neutral-800 hover:text-white disabled:bg-neutral-100 disabled:text-neutral-400 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <ArrowUp className="h-5 w-5 md:h-6 md:w-6" />
                )}
              </button>
            </div>
          </div>
          
          {response && (
            <div className="mx-auto mt-4 w-full max-w-2xl rounded-[24px] bg-neutral-50 p-4 border border-neutral-100">
              <p className="text-sm text-neutral-700 font-[family-name:var(--font-body)] whitespace-pre-wrap">
                {response}
              </p>
            </div>
          )}
        </div>

        <div className="relative z-30 mt-6 flex h-[60px] items-start justify-center">
          <div className="flex flex-wrap justify-center gap-3">
            <QuickActionButton 
              icon={ASSETS.gmail} 
              text="Summarize Today's Emails" 
              onClick={() => handleQuickAction("Summarize Today's Emails")}
            />
            <QuickActionButton 
              icon={ASSETS.gmail} 
              text="Send email" 
              onClick={() => handleQuickAction("Send email")}
            />
            <QuickActionButton 
              icon={ASSETS.calendar} 
              text="Block Deep Work Time" 
              onClick={() => handleQuickAction("Block Deep Work Time")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickActionButton({ icon, text, onClick }: { icon: string, text: string, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="group flex cursor-pointer items-center gap-2 rounded-[18px] border border-neutral-100 bg-white px-4 py-2.5 font-[family-name:var(--font-body)] text-[16px] font-medium leading-[1] text-neutral-600 transition-colors hover:border-neutral-200 hover:bg-neutral-50 focus:outline-none"
    >
      <div className="flex h-5 w-5 items-center justify-center relative">
        <Image 
          src={icon} 
          alt={text} 
          fill 
          className="object-contain"
          unoptimized
        />
      </div>
      <span className="text-sm font-medium text-neutral-700 group-hover:text-neutral-900">
        {text}
      </span>
    </button>
  );
}