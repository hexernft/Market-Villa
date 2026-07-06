"use client";

import Link from "next/link";
import { MessageCircle, ShoppingBag, UsersRound } from "lucide-react";

export default function CustomersPage() {
  return (
    <div className="grid gap-4">
      <section className="rounded-3xl border border-[#ebe7f3] bg-white p-5">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#7c3aed]">
          Customers
        </p>
        <h1 className="mt-2 text-2xl font-black tracking-[-0.05em] text-[#241436]">
          Customer records are coming soon.
        </h1>
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        <Link
          href="/dashboard/orders"
          className="rounded-3xl border border-[#ebe7f3] bg-white p-4 transition hover:border-[#d8c8ff] hover:bg-[#fcfbff]"
        >
          <ShoppingBag className="text-[#7c3aed]" size={22} />
          <h2 className="mt-4 text-sm font-black text-[#241436]">Orders</h2>
        </Link>

        <Link
          href="/dashboard/leads"
          className="rounded-3xl border border-[#ebe7f3] bg-white p-4 transition hover:border-[#d8c8ff] hover:bg-[#fcfbff]"
        >
          <MessageCircle className="text-[#7c3aed]" size={22} />
          <h2 className="mt-4 text-sm font-black text-[#241436]">Messages</h2>
        </Link>

        <div className="rounded-3xl border border-dashed border-[#d8c8ff] bg-[#faf8ff] p-4 md:col-span-2">
          <UsersRound className="text-[#7c3aed]" size={22} />
          <h2 className="mt-4 text-sm font-black text-[#241436]">
            Customer profiles
          </h2>
        </div>
      </section>
    </div>
  );
}
