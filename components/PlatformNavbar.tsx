import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/brand";

export function PlatformNavbar() {
  return (
    <header className="fixed left-0 top-0 z-50 w-full border-b border-orange-300/40 bg-[#ff6a00] text-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-center px-5 py-3 md:px-8">
        <Link href="/" className="flex items-center justify-center gap-2">
          <Image
            src="/market-villa-logo.png"
            alt="Market Villa"
            width={72}
            height={72}
            className="market-villa-logo-float h-16 w-16 object-contain brightness-0 invert"
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