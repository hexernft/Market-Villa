"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";
import { BRAND } from "@/lib/brand";

const navLinks = [
  { label: "How it works", href: "/#how" },
  { label: "Stores", href: "/stores" },
  { label: "Help", href: "/help" },
];

export function PlatformNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed left-0 top-0 z-50 w-full px-3 py-2.5 md:px-5">
      <div className="mx-auto max-w-7xl rounded-[1.4rem] border border-white/70 bg-white/58 px-4 py-2 shadow-[0_18px_50px_rgba(55,31,83,0.10)] backdrop-blur-2xl md:px-5">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5"
            onClick={() => setIsMenuOpen(false)}
          >
            <Image
              src="/market-villa-logo.png"
              alt="Market Villa"
              width={64}
              height={64}
              className="h-16 w-16 object-contain"
              priority
            />
            <span className="text-sm font-semibold tracking-[-0.04em] text-[#241436]">
              {BRAND.name}
            </span>
          </Link>

          <nav className="hidden items-center gap-7 text-[12px] font-semibold text-[#241436]/75 md:flex">
            {navLinks.map((link) => (
              <Link
                key={`${link.label}-${link.href}`}
                href={link.href}
                className="transition hover:text-[#7c3aed]"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden rounded-2xl px-4 py-2 text-[12px] font-semibold text-[#241436] transition hover:bg-white/70 md:inline-flex"
            >
              Login
            </Link>

            <Link
              href="/signup"
              className="market-primary-button hidden items-center gap-2 rounded-2xl px-4 py-2 text-[12px] font-semibold text-white sm:inline-flex"
            >
              Start your store
              <ArrowRight size={14} />
            </Link>

            <button
              type="button"
              className="grid h-10 w-10 place-items-center rounded-2xl border border-[#7c3aed]/15 bg-white/70 text-[#241436] md:hidden"
              aria-label={
                isMenuOpen ? "Close navigation menu" : "Open navigation menu"
              }
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen((current) => !current)}
            >
              {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {isMenuOpen ? (
          <nav
            className="grid gap-2 border-t border-[#7c3aed]/10 py-3 text-sm font-semibold text-[#241436] md:hidden"
            aria-label="Mobile navigation"
          >
            {navLinks.map((link) => (
              <Link
                key={`mobile-${link.label}-${link.href}`}
                href={link.href}
                className="rounded-2xl px-3 py-3 transition hover:bg-white/70"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            <div className="grid gap-2 pt-1">
              <Link
                href="/login"
                className="rounded-2xl px-3 py-3 transition hover:bg-white/70"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>

              <Link
                href="/signup"
                className="market-primary-button inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-white"
                onClick={() => setIsMenuOpen(false)}
              >
                Start your store
                <ArrowRight size={15} />
              </Link>
            </div>
          </nav>
        ) : null}
      </div>
    </header>
  );
}
