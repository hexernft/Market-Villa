import Image from "next/image";
import Link from "next/link";
import { Store } from "lucide-react";
import { BRAND } from "@/lib/brand";

export function PlatformFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white px-5 py-10 md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 md:flex-row md:items-start">
        <div>
          <Link href="/" className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center overflow-hidden bg-white/10"><Image src="/market-villa-logo.png" alt="Market Villa" width={40} height={40} className="h-10 w-10 object-contain" /></span>

            <span>
              <span className="block text-lg font-semibold leading-none tracking-[-0.04em] text-slate-950">
                {BRAND.name}
              </span>
              <span className="mt-1 block text-xs font-medium text-slate-500">
                Mini websites for businesses
              </span>
            </span>
          </Link>

          <p className="mt-5 max-w-md text-sm leading-7 text-slate-500">
            Market Villa helps small businesses create professional mini websites,
            show products and services, and receive customer inquiries.
          </p>
        </div>

        <div className="text-sm">
          <p className="mb-4 font-semibold text-slate-950">Platform</p>

          <div className="grid grid-cols-2 gap-x-8 gap-y-3">
            <Link href="/#how" className="text-slate-500 hover:text-slate-950">
              How it works
            </Link>

            <Link href="/#pricing" className="text-slate-500 hover:text-slate-950">
              Pricing
            </Link>

            <Link href="/#faq" className="text-slate-500 hover:text-slate-950">
              FAQ
            </Link>

            <Link href="/help" className="text-slate-500 hover:text-slate-950">
              Help Center
            </Link>

            <Link href="/status" className="text-slate-500 hover:text-slate-950">
              Status
            </Link>

            <Link href="/login" className="text-slate-500 hover:text-slate-950">
              Login
            </Link>
          </div>
        </div>

        <div className="grid gap-3 text-sm">
          <p className="font-semibold text-slate-950">Legal</p>

          <Link href="/terms" className="text-slate-500 hover:text-slate-950">
            Terms of Service
          </Link>

          <Link href="/privacy" className="text-slate-500 hover:text-slate-950">
            Privacy Policy
          </Link>
        </div>
      </div>

      <div className="mx-auto mt-10 flex max-w-7xl flex-col justify-between gap-3 border-t border-slate-200 pt-6 text-xs text-slate-400 md:flex-row">
        <p>Â© 2026 {BRAND.name}. All rights reserved.</p>
        <p>Built for small businesses.</p>
      </div>
    </footer>
  );
}

