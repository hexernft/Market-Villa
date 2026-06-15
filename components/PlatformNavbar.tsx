import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/brand";

export function PlatformNavbar() {
  return (
    <header className="fixed left-0 top-0 z-50 w-full border-b border-white/10 bg-[#09090f]/88 text-white shadow-[0_14px_36px_rgba(0,0,0,0.20)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-center px-5 py-3 md:px-8">
        <Link href="/" className="flex items-center justify-center gap-2">
          <Image
            src="/market-villa-logo.png"
            alt="Market Villa"
            width={72}
            height={72}
            className="market-villa-logo-float h-16 w-16 object-contain"
            priority
          />

          <span className="text-xl font-semibold leading-none tracking-[-0.04em] text-white">
            {BRAND.name}
          </span>
        </Link>
      </div>
    </header>
  );
}