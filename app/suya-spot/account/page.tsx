"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Flame, Loader2, LogOut, ShoppingBag } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Customer = {
  id: string;
  email: string | null;
  name: string | null;
};

export default function SuyaSpotAccountPage() {
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkCustomer() {
      const { data } = await supabase.auth.getUser();

      if (!mounted) return;

      if (!data.user) {
        router.replace("/suya-spot/login?next=/suya-spot/account");
        return;
      }

      setCustomer({
        id: data.user.id,
        email: data.user.email ?? null,
        name:
          String(data.user.user_metadata?.full_name || "").trim() ||
          String(data.user.user_metadata?.name || "").trim() ||
          null,
      });
      setIsChecking(false);
    }

    checkCustomer();

    return () => {
      mounted = false;
    };
  }, [router]);

  async function handleSignOut() {
    setIsSigningOut(true);
    await supabase.auth.signOut();
    router.replace("/suya-spot");
    router.refresh();
  }

  if (isChecking) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#17100b] px-4 text-[#fff8e1]">
        <div className="inline-flex items-center gap-3 text-sm font-black">
          <Loader2 className="animate-spin text-[#f59e0b]" size={18} />
          Checking account...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.18),transparent_34%),linear-gradient(135deg,#fff7ed,#f7efe3_45%,#efe7ff)] px-4 py-8 text-[#17120a]">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-2xl items-center">
        <section className="w-full overflow-hidden rounded-[1.75rem] border border-[#6f3009]/15 bg-white">
          <div className="bg-[#17100b] px-5 py-5 text-[#fff8e1]">
            <Link
              href="/suya-spot"
              className="inline-flex items-center gap-2 text-sm font-black text-[#f59e0b]"
            >
              <ArrowLeft size={16} />
              Back to store
            </Link>

            <p className="mt-6 inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.22em] text-[#f59e0b]">
              <Flame size={14} />
              S I S Suya Spot
            </p>

            <h1 className="mt-3 text-2xl font-black tracking-[-0.04em]">
              Customer Account
            </h1>
          </div>

          <div className="grid gap-4 p-5 md:p-6">
            <section className="rounded-[1.35rem] border border-[#e7dcc8] bg-[#fffaf0] p-4">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#b45309]">
                Signed in as
              </p>
              <p className="mt-2 break-all text-base font-black text-[#17120a]">
                {customer?.name || customer?.email || "Customer"}
              </p>
              {customer?.name && customer.email ? (
                <p className="mt-1 break-all text-sm font-semibold text-[#6f6252]">
                  {customer.email}
                </p>
              ) : null}
            </section>

            <section className="rounded-[1.35rem] border border-dashed border-[#e7dcc8] bg-white p-4">
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#fff4d6] text-[#b45309]">
                  <ShoppingBag size={20} />
                </span>
                <div>
                  <h2 className="text-sm font-black text-[#17120a]">
                    Recent Orders
                  </h2>
                  <p className="mt-3 text-sm font-black text-[#17120a]">
                    No orders yet.
                  </p>
                  <p className="mt-1 text-sm font-semibold leading-6 text-[#6f6252]">
                    Your S I S Suya Spot orders will appear here after checkout.
                  </p>
                </div>
              </div>
            </section>

            <div className="grid gap-3 sm:grid-cols-3">
              <Link
                href="/suya-spot/grill"
                className="inline-flex h-11 items-center justify-center rounded-full bg-[#17120a] px-5 text-sm font-black text-white"
              >
                The Grill
              </Link>

              <Link
                href="/suya-spot"
                className="inline-flex h-11 items-center justify-center rounded-full border border-[#e7dcc8] px-5 text-sm font-black text-[#17120a]"
              >
                Back to Store
              </Link>

              <button
                type="button"
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-red-200 px-5 text-sm font-black text-red-700 disabled:opacity-60"
              >
                <LogOut size={16} />
                {isSigningOut ? "Signing out..." : "Sign Out"}
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

