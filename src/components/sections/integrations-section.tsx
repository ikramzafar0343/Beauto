"use client";

import Image from "next/image";
import { Download } from "lucide-react";

const leftIcons = [
  {
    name: "Cursor",
    icon: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/705aa4fb-5553-4ee9-a14b-7097920424af-rube-app/assets/svgs/cursor-4.svg",
  },
  {
    name: "Whatsapp",
    icon: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/705aa4fb-5553-4ee9-a14b-7097920424af-rube-app/assets/svgs/whatsapp-5.svg",
  },
  {
    name: "Claude",
    icon: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/705aa4fb-5553-4ee9-a14b-7097920424af-rube-app/assets/svgs/claude-3.svg",
  },
];

const rightIcons = [
  {
    name: "N8N",
    icon: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/705aa4fb-5553-4ee9-a14b-7097920424af-rube-app/assets/svgs/n8n-6.svg",
  },
  {
    name: "MCP",
    icon: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/705aa4fb-5553-4ee9-a14b-7097920424af-rube-app/assets/svgs/mcp-7.svg",
  },
  {
    name: "VSCode",
    icon: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/705aa4fb-5553-4ee9-a14b-7097920424af-rube-app/assets/svgs/vscode-2.svg",
  },
];

export default function IntegrationsSection() {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex flex-col items-center justify-center gap-12 md:flex-row md:items-start md:gap-24 lg:gap-32">
          <div className="flex flex-col items-center gap-8 md:gap-10">
            <h2 className="font-[family-name:var(--font-display)] text-[32px] font-medium leading-[1.1] tracking-[-0.96px] text-neutral-900 md:text-[48px]">
              Works with
            </h2>
            <div className="flex flex-wrap justify-center gap-8 md:gap-12">
              {leftIcons.map((item) => (
                <div
                  key={item.name}
                  className="group flex flex-col items-center gap-3"
                >
                  <div className="relative flex h-16 w-16 items-center justify-center transition-transform duration-300 hover:scale-110 md:h-[72px] md:w-[72px]">
                    <Image
                      src={item.icon}
                      alt={`${item.name} logo`}
                      width={64}
                      height={64}
                      className="h-full w-full object-contain"
                      unoptimized
                    />
                  </div>
                  <span className="font-[family-name:var(--font-body)] text-xs font-medium text-neutral-500 md:text-sm">
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center gap-8 md:gap-10">
            <h2 className="font-[family-name:var(--font-display)] text-[32px] font-medium leading-[1.1] tracking-[-0.96px] text-neutral-900 md:text-[48px]">
              you use
            </h2>
            <div className="flex flex-wrap justify-center gap-8 md:gap-12">
              {rightIcons.map((item) => (
                <div
                  key={item.name}
                  className="group flex flex-col items-center gap-3"
                >
                  <div className="relative flex h-16 w-16 items-center justify-center transition-transform duration-300 hover:scale-110 md:h-[72px] md:w-[72px]">
                    <Image
                      src={item.icon}
                      alt={`${item.name} logo`}
                      width={64}
                      height={64}
                      className="h-full w-full object-contain"
                      unoptimized
                    />
                  </div>
                  <span className="font-[family-name:var(--font-body)] text-xs font-medium text-neutral-500 md:text-sm">
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-16 flex justify-center md:mt-20">
          <button className="bg-neutral-900 text-white hover:bg-neutral-800 inline-flex h-12 items-center justify-center gap-2 rounded-[18px] px-6 text-base font-semibold transition-all duration-300 hover:scale-105 active:scale-95">
            Install Beauto Anywhere
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}