"use client";

import React, { useState } from 'react';
import Image from 'next/image';

type Usecase = {
  id: string;
  title: string;
  icons: string[];
  userCount: string;
};

const ASSETS = {
  gmail: "https://logos.composio.dev/api/gmail",
  slack: "https://logos.composio.dev/api/slack",
  twitter: "https://logos.composio.dev/api/twitter",
  notion: "https://logos.composio.dev/api/notion",
  calendar: "https://logos.composio.dev/api/googlecalendar",
  flash: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/705aa4fb-5553-4ee9-a14b-7097920424af-rube-app/assets/svgs/flash-1.svg"
};

const USECASES: Usecase[] = [
  {
    id: '1',
    title: "Summarize today's emails",
    icons: [ASSETS.gmail],
    userCount: "892+ Users"
  },
  {
    id: '2',
    title: "Catch up on Slack",
    icons: [ASSETS.slack],
    userCount: "923+ Users"
  },
  {
    id: '3',
    title: "Send a quick email",
    icons: [ASSETS.gmail],
    userCount: "923+ Users"
  },
  {
    id: '4',
    title: "Draft and post a tweet",
    icons: [ASSETS.twitter],
    userCount: "845+ Users"
  },
  {
    id: '5',
    title: "Create a task from latest email",
    icons: [ASSETS.gmail, ASSETS.notion],
    userCount: "778+ Users"
  },
  {
    id: '6',
    title: "Block time for deep work",
    icons: [ASSETS.calendar],
    userCount: "1.2k+ Users"
  }
];

const CATEGORIES = [
  "Featured",
  "Productivity",
  "Development",
  "Research",
  "Social Media"
];

export default function ExploreUsecasesSection() {
  const [activeCategory, setActiveCategory] = useState("Featured");

  return (
    <section id="usecases-section" className="relative z-[2] py-0 bg-white">
      <div className="mx-auto max-w-5xl px-4 md:mt-[26px]">
        <div className="absolute inset-0 z-[1] h-[calc(80%)] w-[calc(100%+128px)] -translate-x-[64px] rounded-full bg-white blur-[72px] md:h-[calc(100%)] md:-translate-y-[96px] pointer-events-none"></div>

        <div className="relative z-[2]">
          <h2 className="text-center font-[family-name:var(--font-display)] text-[32px] font-medium not-italic leading-[36px] tracking-[-0.96px] text-neutral-800 sm:text-[40px] sm:leading-[44px] md:text-[48px] md:leading-[48px]">
            Explore Usecases
          </h2>

          <div className="mt-6 sm:mt-8 md:mt-[31px] px-2 sm:px-0">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              {CATEGORIES.map((category) => {
                const isActive = activeCategory === category;
                return (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`
                      flex items-center justify-center gap-[10px] 
                      rounded-full px-3 py-2 
                      font-[family-name:var(--font-body)] text-[14px] font-medium 
                      leading-[14px] tracking-[-0.32px] 
                      transition-all duration-200 
                      sm:px-4 sm:py-3 sm:text-[16px] sm:leading-[16px]
                      ${isActive 
                        ? 'bg-neutral-900 text-white border border-neutral-900' 
                        : 'bg-white text-neutral-800 border border-neutral-200 hover:border-neutral-400'
                      }
                    `}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="md:max-w-auto mx-auto mt-8 max-w-5xl sm:mt-10 md:mt-[58px]">
            <div className="grid grid-cols-2 justify-center gap-3 pb-4 sm:flex sm:flex-wrap sm:gap-4 sm:px-0 sm:pb-0">
              {USECASES.map((usecase) => (
                <UsecaseCard key={usecase.id} usecase={usecase} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function UsecaseCard({ usecase }: { usecase: Usecase }) {
  return (
    <div 
      className="w-full sm:w-auto"
      role="button"
      tabIndex={0}
    >
      <div className="
        group flex h-[174px] flex-shrink-0 cursor-pointer flex-col overflow-hidden 
        rounded-[20px] border border-neutral-100 bg-white shadow-sm 
        transition-all duration-200 hover:border-neutral-200 hover:shadow-md 
        sm:h-[240px] sm:w-[260px] sm:rounded-[24px] md:h-[246px] md:w-[279px]
      ">
        <div className="flex flex-1 flex-col px-[16px] pt-[18px] sm:px-[20px] sm:pt-[24px]">
          <div className="flex gap-[7px] sm:gap-[9px]">
            {usecase.icons.map((icon, index) => (
              <div key={index}>
                <div className="relative h-[20px] w-[20px] sm:h-[30px] sm:w-[30px]">
                  <Image 
                    src={icon} 
                    alt="App icon" 
                    fill 
                    className="object-contain"
                    unoptimized
                  />
                </div>
              </div>
            ))}
          </div>
          
          <p className="mt-[8px] font-[family-name:var(--font-display)] text-[18px] font-medium not-italic leading-[1.25] text-[#282625] sm:mt-[10px] sm:text-[20px]">
            {usecase.title}
          </p>
        </div>

        <div className="flex max-h-[45px] min-h-[45px] items-center justify-between bg-[#FAFAFA] px-[12px] py-[9px] sm:max-h-[77px] sm:min-h-[77px] sm:py-[18px]">
          <button className="
            flex items-center gap-[6px] rounded-[8px] border border-neutral-100 bg-white 
            px-[11px] py-[7px] font-[family-name:var(--font-body)] text-[12px] font-semibold leading-[1.08] text-black 
            shadow transition-all duration-200 
            hover:scale-105 hover:bg-neutral-50 
            focus:outline-none focus:ring-neutral-200 active:scale-95 
            sm:px-4 sm:py-2 md:rounded-[12px] md:text-[14px]
          ">
            <Image 
              src={ASSETS.flash} 
              alt="Flash" 
              width={15} 
              height={15} 
              className="h-[10px] w-[10px] md:h-[15px] md:w-[15px]"
              unoptimized
            />
            <span className="hidden sm:inline">Try Prompt</span>
            <span className="sm:hidden">Try</span>
          </button>
          
          <span className="
            bg-gradient-to-r from-[#F05E4B] via-[#F56F2D] to-[#EC4E8A] 
            bg-[length:200%_100%] bg-clip-text font-[family-name:var(--font-body)] text-[12px] 
            font-semibold leading-[1.25] text-transparent sm:text-[16px]
          ">
            {usecase.userCount}
          </span>
        </div>
      </div>
    </div>
  );
}
