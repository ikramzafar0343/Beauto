"use client";

import Link from 'next/link';
import { Github, Youtube } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-white dark:bg-[#0a0a0a] pt-12 pb-12 sm:pt-20 sm:pb-16 border-t border-[#E5E5E5] dark:border-[#27272a]">
      <div className="container mx-auto px-4 flex flex-col items-center relative overflow-hidden max-w-[1280px]">
        <div className="relative w-full flex justify-center items-center pointer-events-none select-none mb-[-30px] sm:mb-[-50px] md:mb-[-60px] z-0">
          <span 
            className="font-[family-name:var(--font-display)] italic font-normal text-[22vw] sm:text-[180px] md:text-[240px] lg:text-[300px] xl:text-[340px] leading-[0.8] bg-gradient-to-b from-[#D4D4D4] dark:from-[#27272a] to-white/0 dark:to-[#0a0a0a]/0 bg-clip-text text-transparent opacity-60 dark:opacity-40 transform scale-y-105"
            aria-hidden="true"
          >
            Beauto
          </span>
        </div>

        <nav className="relative z-10 flex flex-wrap justify-center gap-x-6 gap-y-3 md:gap-x-8 mb-8 mt-4 sm:mt-10">
          {[
            { text: 'Enterprise', href: '#' },
            { text: 'Blog', href: '#' },
            { text: 'Building With Composio', href: '#' },
            { text: 'Terms of Service', href: '#' },
            { text: 'Privacy Policy', href: '#' },
            { text: 'Trust', href: '#' },
          ].map((link) => (
            <Link
              key={link.text}
              href={link.href}
              className="font-[family-name:var(--font-body)] text-sm sm:text-base font-medium text-[#666666] dark:text-white/60 hover:text-[#1A1A1A] dark:hover:text-white transition-colors duration-200"
            >
              {link.text}
            </Link>
          ))}
        </nav>

        <div className="relative z-10 flex items-center justify-center gap-6 mb-8">
          <Link
            href="#"
            className="text-[#666666] dark:text-white/60 hover:text-[#1A1A1A] dark:hover:text-white transition-colors duration-200"
            aria-label="X (Twitter)"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
              <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
            </svg>
          </Link>
          <Link
            href="#"
            className="text-[#666666] dark:text-white/60 hover:text-[#1A1A1A] dark:hover:text-white transition-colors duration-200"
            aria-label="GitHub"
          >
            <Github className="w-5 h-5" />
          </Link>
          <Link
            href="#"
            className="text-[#666666] dark:text-white/60 hover:text-[#1A1A1A] dark:hover:text-white transition-colors duration-200"
            aria-label="YouTube"
          >
            <Youtube className="w-6 h-6" />
          </Link>
        </div>

        <div className="relative z-10 text-center">
          <p className="font-[family-name:var(--font-body)] text-xs sm:text-sm text-[#999999] dark:text-white/40 opacity-90">
            © 2025 Beauto powered by Composio. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}