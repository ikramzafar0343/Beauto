'use client';

import React, { useEffect, useRef } from 'react';

/**
 * BackgroundEffects Component
 * 
 * Clones the animated background gradient effects using canvas blur.
 * Includes a fixed background layer with opacity 50 and blurs,
 * an absolute positioned canvas element with animated gradients,
 * and gradient overlays from white to transparent.
 */
export default function BackgroundEffects() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let t = 0;

    const render = () => {
      if (!canvas || !ctx) return;

      t += 0.002;
      const width = canvas.width;
      const height = canvas.height;

      // Clear the canvas
      ctx.clearRect(0, 0, width, height);

      // Draw animated gradient blobs
      // We use the brand colors with very low opacity to create soft, shifting background lights
      
      // Blob 1: Warm Red/Orange
      const x1 = width * 0.5 + Math.cos(t) * 200;
      const y1 = height * 0.4 + Math.sin(t * 0.5) * 100;
      const radius1 = 900;
      const gradient1 = ctx.createRadialGradient(x1, y1, 0, x1, y1, radius1);
      gradient1.addColorStop(0, 'rgba(240, 94, 75, 0.15)'); // #F05E4B
      gradient1.addColorStop(1, 'rgba(240, 94, 75, 0)');
      
      ctx.fillStyle = gradient1;
      ctx.beginPath();
      ctx.arc(x1, y1, radius1, 0, Math.PI * 2);
      ctx.fill();

      // Blob 2: Orange
      const x2 = width * 0.2 + Math.sin(t * 0.8) * 150;
      const y2 = height * 0.6 + Math.cos(t * 1.2) * 150;
      const radius2 = 800;
      const gradient2 = ctx.createRadialGradient(x2, y2, 0, x2, y2, radius2);
      gradient2.addColorStop(0, 'rgba(245, 111, 45, 0.12)'); // #F56F2D
      gradient2.addColorStop(1, 'rgba(245, 111, 45, 0)');

      ctx.fillStyle = gradient2;
      ctx.beginPath();
      ctx.arc(x2, y2, radius2, 0, Math.PI * 2);
      ctx.fill();

      // Blob 3: Pink/Magenta
      const x3 = width * 0.8 + Math.cos(t * 1.5) * 200;
      const y3 = height * 0.7 + Math.sin(t) * 150;
      const radius3 = 1000;
      const gradient3 = ctx.createRadialGradient(x3, y3, 0, x3, y3, radius3);
      gradient3.addColorStop(0, 'rgba(236, 78, 138, 0.12)'); // #EC4E8A
      gradient3.addColorStop(1, 'rgba(236, 78, 138, 0)');

      ctx.fillStyle = gradient3;
      ctx.beginPath();
      ctx.arc(x3, y3, radius3, 0, Math.PI * 2);
      ctx.fill();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <>
      {/* Fixed Background Layer with Animated Canvas */}
      <div className="fixed inset-0 z-0 h-[100lvh] w-[100vw]">
        <div className="absolute inset-0 z-0 opacity-50 blur-[12px] will-change-auto 2xl:blur-[48px]">
          <canvas
            ref={canvasRef}
            className="absolute inset-0 h-full w-full"
            width={1920}
            height={1080}
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Gradient Overlay: White to Transparent (Top of Page) */}
      <div className="absolute left-0 top-0 z-[1] h-[350px] w-full bg-gradient-to-b from-white to-transparent pointer-events-none" />
    </>
  );
}

/**
 * SectionBlurBackground Component
 * 
 * Reusable component for the "72px blur for rounded gradient backgrounds" 
 * found at multiple depths in the content (e.g., behind Hero text, behind Usecases section).
 */
export function SectionBlurBackground({
  variant = 'default',
  className = '',
}: {
  variant?: 'hero' | 'usecases' | 'default';
  className?: string;
}) {
  const baseClasses = "absolute z-[1] rounded-full bg-white blur-[72px] pointer-events-none";

  // Specific strict positioning matched from the original website's HTML structure
  const variantStyles = {
    hero: "inset-0 h-[calc(100%+256px)] w-[calc(100%+32px)] -translate-x-[16px] -translate-y-[96px]",
    usecases: "inset-0 h-[calc(80%)] w-[calc(100%+128px)] -translate-x-[64px] md:h-[calc(100%)] md:-translate-y-[96px]",
    default: "inset-0",
  };

  return (
    <div 
      className={`${baseClasses} ${variantStyles[variant]} ${className}`}
      aria-hidden="true"
    />
  );
}