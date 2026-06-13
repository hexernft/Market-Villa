import Image from "next/image";
import Link from "next/link";
import { Store } from "lucide-react";
import { BRAND } from "@/lib/brand";

export function PlatformFooter() {
  return (
    <footer className="border-t border-white/10 bg-slate-950 px-5 py-10 md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 md:flex-row md:items-start">
        <div>
          <Link href="/" className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center overflow-hidden bg-white/10"><Image src="/market-villa-logo.png" alt="Market Villa" width={40} height={40} className="h-10 w-10 object-contain" /></span>

            <span>
              <span className="block text-lg font-semibold leading-none tracking-[-0.04em] text-white">
                {BRAND.name}
              </span>
              <span className="mt-1 block text-xs font-medium text-white/60">
                Mini websites for businesses
              </span>
            </span>
          </Link>

          <p className="mt-5 max-w-md text-sm leading-7 text-white/60">
            Market Villa helps small businesses create professional mini websites,
            show products and services, and receive customer inquiries.
          </p>
        </div>

        <div className="text-sm">
          <p className="mb-4 font-semibold text-white">Platform</p>

          <div className="grid grid-cols-2 gap-x-8 gap-y-3">
            <Link href="/#how" className="text-white/60 hover:text-white">
              How it works
            </Link>

            <Link href="/#pricing" className="text-white/60 hover:text-white">
              Pricing
            </Link>

            <Link href="/#faq" className="text-white/60 hover:text-white">
              FAQ
            </Link>

            <Link href="/help" className="text-white/60 hover:text-white">
              Help Center
            </Link>

            <Link href="/status" className="text-white/60 hover:text-white">
              Status
            </Link>

            <Link href="/login" className="text-white/60 hover:text-white">
              Login
            </Link>
          </div>
        </div>

        <div className="grid gap-3 text-sm">
          <p className="font-semibold text-white">Legal</p>

          <Link href="/terms" className="text-white/60 hover:text-white">
            Terms of Service
          </Link>

          <Link href="/privacy" className="text-white/60 hover:text-white">
            Privacy Policy
          </Link>
        </div>
      </div>

      <div className="mx-auto mt-10 flex max-w-7xl flex-col justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/40 md:flex-row">
        <p>Â© 2026 {BRAND.name}. All rights reserved.</p>
        <p>Built for small businesses.</p>
      </div>
    </footer>
  );
}

