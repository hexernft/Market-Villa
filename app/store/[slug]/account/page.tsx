"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, LogOut, ShoppingBag, Store } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Customer = {
  id: string;
  email: string | null;
  name: string | null;
};

export default function StoreCustomerAccountPage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const storeHome = `/store/${slug}`;
  const loginPath = `/store/${slug}/login?next=/store/${slug}/account`;

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkCustomer() {
      const { data } = await supabase.auth.getUser();

      if (!mounted) return;

      if (!data.user) {
        router.replace(loginPath);
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
  }, [loginPath, router]);

  async function handleSignOut() {
    setIsSigningOut(true);
    await supabase.auth.signOut();
    router.replace(storeHome);
    router.refresh();
  }

  if (isChecking) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#241436] px-4 text-white">
        <div className="inline-flex items-center gap-3 text-sm font-black">
          <Loader2 className="animate-spin text-purple-200" size={18} />
          Checking account...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,0.16),transparent_34%),linear-gradient(135deg,#faf5ff,#fff7ed)] px-4 py-8 text-[#241436]">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-2xl items-center">
        <section className="w-full rounded-[1.75rem] border border-[#eadfff] bg-white p-5 md:p-6">
          <Link
            href={storeHome}
            className="inline-flex items-center gap-2 text-sm font-black text-[#7c3aed]"
          >
            <ArrowLeft size={16} />
            Back to store
          </Link>

          <div className="mt-6">
            <p className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.22em] text-[#7c3aed]">
              <Store size={14} />
              Market Villa Store
            </p>

            <h1 className="mt-4 text-2xl font-black tracking-[-0.04em]">
              Customer Account
            </h1>
          </div>

          <div className="mt-5 grid gap-4">
            <section className="rounded-[1.35rem] border border-[#eadfff] bg-[#faf8ff] p-4">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#7c3aed]">
                Signed in as
              </p>
              <p className="mt-2 break-all text-base font-black text-[#241436]">
                {customer?.name || customer?.email || "Customer"}
              </p>
              {customer?.name && customer.email ? (
                <p className="mt-1 break-all text-sm font-semibold text-slate-600">
                  {customer.email}
                </p>
              ) : null}
            </section>

            <section className="rounded-[1.35rem] border border-dashed border-[#eadfff] bg-white p-4">
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#f4edff] text-[#7c3aed]">
                  <ShoppingBag size={20} />
                </span>
                <div>
                  <h2 className="text-sm font-black text-[#241436]">
                    Recent Orders
                  </h2>
                  <p className="mt-3 text-sm font-black text-[#241436]">
                    No orders yet.
                  </p>
                  <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
                    Your orders from this store will appear here after checkout.
                  </p>
                </div>
              </div>
            </section>

            <div className="grid gap-3 sm:grid-cols-2">
              <Link
                href={storeHome}
                className="inline-flex h-11 items-center justify-center rounded-full bg-[#7c3aed] px-5 text-sm font-black text-white"
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
