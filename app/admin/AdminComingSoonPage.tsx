"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, ShieldCheck } from "lucide-react";
import { requireSuperAdmin } from "@/lib/business-actions";

export function AdminComingSoonPage({ title }: { title: string }) {
  const [isChecking, setIsChecking] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    async function checkAccess() {
      try {
        await requireSuperAdmin();
      } catch (error) {
        if (!mounted) return;
        setMessage(
          error instanceof Error
            ? error.message
            : "You do not have permission to access the Admin Center.",
        );
      } finally {
        if (mounted) setIsChecking(false);
      }
    }

    checkAccess();

    return () => {
      mounted = false;
    };
  }, []);

  if (isChecking) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-100 px-5">
        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <Loader2 className="animate-spin text-[#26143d]" size={24} />
        </div>
      </main>
    );
  }

  if (message) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-100 px-5">
        <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 text-center">
          <ShieldCheck className="mx-auto text-red-600" size={26} />
          <h1 className="mt-3 text-xl font-semibold tracking-tight text-slate-950">
            Admin access required
          </h1>
          <p className="mt-3 text-sm text-red-700">{message}</p>
          <Link
            href="/admin-login"
            className="mt-5 inline-flex rounded-full bg-[#26143d] px-5 py-2.5 text-sm font-semibold text-white"
          >
            Login as Admin
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 px-5 py-6">
      <section className="mx-auto grid max-w-3xl gap-4">
        <Link href="/admin" className="text-sm font-semibold text-[#26143d]">
          Back to Admin
        </Link>
        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7c3aed]">
            Admin Center
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            {title}
          </h1>
        </div>
      </section>
    </main>
  );
}
