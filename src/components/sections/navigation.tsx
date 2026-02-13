"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="sticky top-0 z-[200] w-full bg-white border-b border-transparent transition-colors duration-300">
      <div className="relative flex w-full items-center justify-between px-4 py-4 transition-all duration-300 lg:px-6">
        <div className="w-[125px]">
          <Link
            className="z-[200] flex h-fit w-max items-center gap-2 font-semibold lg:ml-0 text-neutral-900"
            href="/"
          >
            <svg
              width="39"
              height="25"
              viewBox="0 0 39 25"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-neutral-900"
            >
              <circle cx="6.5" cy="12.5" r="6" fill="currentColor" />
              <rect x="16" y="5" width="4.5" height="15" rx="2.25" fill="currentColor" />
              <rect x="23.5" y="2" width="4.5" height="21" rx="2.25" fill="currentColor" />
              <rect x="31" y="8" width="4.5" height="9" rx="2.25" fill="currentColor" />
            </svg>
          </Link>
        </div>

        <div className="z-[200] hidden h-fit w-max gap-3 font-semibold lg:flex">
          <div className="!important relative z-[200] flex gap-3 rounded-xl font-[family-name:var(--font-display)] text-xl text-neutral-500 font-medium h-[41px]">
              <Link
                className="cursor-pointer select-none rounded-xl px-5 py-2 transition-colors duration-300 hover:bg-neutral-100 hover:text-neutral-800 flex items-center whitespace-nowrap"
                href="/social-autopilot"
              >
                Autopilot
              </Link>
              <Link
                className="cursor-pointer select-none rounded-xl px-5 py-2 transition-colors duration-300 hover:bg-neutral-100 hover:text-neutral-800 flex items-center"
                href="/marketplace"
              >
                Marketplace
              </Link>
            <Link
              className="cursor-pointer select-none rounded-xl px-5 py-2 transition-colors duration-300 hover:bg-neutral-100 hover:text-neutral-800 flex items-center"
              href="/pricing"
            >
              Pricing
            </Link>
            <Link
              href="https://composio.dev/blog"
              className="cursor-pointer select-none rounded-xl px-5 py-2 transition-colors duration-300 hover:bg-neutral-100 hover:text-neutral-800 flex items-center"
            >
              Blog
            </Link>
          </div>
        </div>

        <div className="z-[200] hidden h-fit w-max gap-2 font-semibold lg:mr-0 lg:flex">
          <Link
            className="install relative z-10 flex cursor-pointer select-none items-center justify-center rounded-xl bg-neutral-800 p-2 px-4 font-[family-name:var(--font-display)] text-xl text-white transition-opacity duration-300 hover:opacity-90"
            href="/auth/sign-up"
          >
            Get Started
          </Link>
        </div>

        <div className="z-[200] flex items-center gap-2 lg:hidden">
          <Link
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-neutral-800 text-white shadow hover:bg-neutral-800/90 h-9 px-4 py-[8px] font-[family-name:var(--font-display)] font-semibold text-md transition-colors"
            href="/auth/sign-up"
          >
            Get Started
          </Link>
          <button
            className="p-2 text-neutral-600 hover:text-neutral-900 transition-colors focus:outline-none"
            aria-label="Toggle mobile menu"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      <div
        className={`absolute top-full left-0 w-full bg-white border-b border-neutral-100 shadow-sm lg:hidden transition-all duration-300 overflow-hidden ${
          isMobileMenuOpen ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="flex flex-col p-4 gap-2 font-[family-name:var(--font-display)] text-lg text-neutral-600 font-medium">
          <Link
            href="/marketplace"
            className="p-3 hover:bg-neutral-50 rounded-xl transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Marketplace
          </Link>
          <Link
            href="/pricing"
            className="p-3 hover:bg-neutral-50 rounded-xl transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Pricing
          </Link>
          <Link
            href="https://composio.dev/blog"
            className="p-3 hover:bg-neutral-50 rounded-xl transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Blog
          </Link>
        </div>
      </div>
    </div>
  );
}
