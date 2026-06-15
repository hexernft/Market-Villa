import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BRAND } from "@/lib/brand";

const navLinks = [
  { label: "Templates", href: "/stores" },
  { label: "Pricing", href: "/dashboard/billing" },
  { label: "Showcase", href: "/stores" },
  { label: "Resources", href: "/help" },
];

export function PlatformNavbar() {
  return (
    <header className="fixed left-0 top-0 z-50 w-full px-3 py-3 md:px-5">
      <div className="mx-auto flex max-w-7xl items-center justify-between rounded-[1.4rem] border border-white/70 bg-white/58 px-4 py-2 shadow-[0_18px_50px_rgba(55,31,83,0.10)] backdrop-blur-2xl md:px-5">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/market-villa-logo.png"
            alt="Market Villa"
            width={52}
            height={52}
            className="market-villa-logo-float h-10 w-10 object-contain"
            priority
          />
          <span className="text-base font-semibold tracking-[-0.04em] text-[#241436]">
            {BRAND.name}
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-[12px] font-semibold text-[#241436]/75 md:flex">
          {navLinks.map((link) => (
            <Link key={link.label} href={link.href} className="transition hover:text-[#7c3aed]">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/login" className="hidden rounded-2xl px-4 py-2 text-[12px] font-semibold text-[#241436] transition hover:bg-white/70 md:inline-flex">
            Login
          </Link>
          <Link href="/login" className="market-primary-button inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-[12px] font-semibold text-white">
            Start your store
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </header>
  );
}
