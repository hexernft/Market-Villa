"use client";

import Link from "next/link";
import {
  ExternalLink,
  Globe2,
  Megaphone,
  Palette,
  Store,
} from "lucide-react";

const storefrontItems = [
  {
    title: "Store Details",
    href: "/dashboard/store-details",
    icon: Store,
  },
  {
    title: "Publish & Visibility",
    href: "/dashboard/visibility",
    icon: Megaphone,
  },
  {
    title: "Themes",
    href: "/dashboard/theme-store",
    icon: Palette,
  },
  {
    title: "Domain",
    href: "/dashboard/domain",
    icon: Globe2,
  },
];

export default function StorefrontPage() {
  return (
    <div className="grid gap-4">
      <section className="rounded-3xl border border-[#ebe7f3] bg-white p-5">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#7c3aed]">
          Storefront
        </p>
        <h1 className="mt-2 text-2xl font-black tracking-[-0.05em] text-[#241436]">
          Manage your public store.
        </h1>
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        {storefrontItems.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center justify-between rounded-3xl border border-[#ebe7f3] bg-white p-4 transition hover:border-[#d8c8ff] hover:bg-[#fcfbff]"
            >
              <span className="inline-flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#f1eaff] text-[#7c3aed]">
                  <Icon size={19} />
                </span>
                <span className="text-sm font-black text-[#241436]">
                  {item.title}
                </span>
              </span>
              <ExternalLink size={16} className="text-[#8b849b]" />
            </Link>
          );
        })}
      </section>
    </div>
  );
}
