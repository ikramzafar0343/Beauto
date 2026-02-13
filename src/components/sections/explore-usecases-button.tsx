'use client';

import { ChevronDown } from 'lucide-react';

export default function ExploreUsecasesButton() {
  const scrollToUsecases = () => {
    const section = document.getElementById('usecases-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="pointer-events-none absolute left-0 right-0 z-[80] flex justify-center will-change-transform top-[93vh]">
      <button
        onClick={scrollToUsecases}
        className="pointer-events-auto flex cursor-pointer items-center gap-2 rounded-[18px] border border-neutral-100 bg-white py-[12px] pl-[12px] pr-[10px] font-[family-name:var(--font-body)] text-[16px] font-medium leading-[1] text-neutral-600 transition-colors hover:bg-neutral-50 focus:outline-none"
      >
        Explore Usecases
        <ChevronDown className="h-5 w-5 text-neutral-600" strokeWidth={2} />
      </button>
    </div>
  );
}
