import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/brand";

const navItems = [
  {
    label: "How it works",
    href: "/#how",
  },
  {
    label: "FAQ",
    href: "/#faq",
  },
];

export function PlatformNavbar() {
  return (
    <header className="fixed left-0 top-0 z-50 w-full border-b border-white/10 bg-[#050505] text-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 md:px-8">
        <Link href="/" className="flex items-center gap-1.5">
          <Image
            src="/market-villa-logo.png"
            alt="Market Villa"
            width={78}
            height={78}
            className="market-villa-logo-float h-[68px] w-[68px] object-contain"
            priority
          />

          <span>
            <span className="block text-lg font-semibold leading-none tracking-[-0.04em] text-white">
              {BRAND.name}
            </span>
            <span className="mt-1 hidden text-xs font-medium text-white/55 sm:block">
              Mini websites for businesses
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-sm font-semibold text-white/70 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden px-4 py-2 text-sm font-semibold text-white/70 hover:text-white sm:inline-flex"
          >
            Login
          </Link>

          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_8px_24px_rgba(255,255,255,0.12)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(255,255,255,0.18)]"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}