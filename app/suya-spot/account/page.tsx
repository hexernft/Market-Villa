"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Flame, Loader2, LogOut, ShoppingBag } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Customer = {
  id: string;
  email: string | null;
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
          <Loader2 className="animate-spin text-[#facc15]" size={18} />
          Checking account...
        </div>
      </main>
    );
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[linear-gradient(135deg,#fff7ed,#ede9fe)] px-4 text-[#17120a]">
      <section className="w-full max-w-xl rounded-[2rem] border border-[#e7dcc8] bg-white/90 p-6 shadow-xl backdrop-blur md:p-8">
        <Link
          href="/suya-spot"
          className="inline-flex items-center gap-2 text-sm font-black text-[#8a3f0d]"
        >
          <ArrowLeft size={16} />
          Back to store
        </Link>

        <div className="mt-7">
          <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em] text-[#b45309]">
            <Flame size={14} />
            S I S Suya Spot
          </p>

          <h1 className="mt-4 text-3xl font-black tracking-[-0.05em]">
            Customer Account
          </h1>

          <p className="mt-3 text-sm font-semibold leading-6 text-[#6f6252]">
            Manage your customer access and return to the store whenever you are ready to order.
          </p>
        </div>

        <div className="mt-6 rounded-[1.5rem] border border-[#e7dcc8] bg-[#fffaf0] p-4">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#b45309]">
            Signed in as
          </p>
          <p className="mt-2 break-all text-base font-black text-[#17120a]">
            {customer?.email || "Customer"}
          </p>
        </div>

        <div className="mt-4 rounded-[1.5rem] border border-dashed border-[#e7dcc8] bg-white p-4">
          <ShoppingBag className="text-[#b45309]" size={24} />
          <p className="mt-3 text-sm font-black text-[#17120a]">
            Order History
          </p>
          <p className="mt-2 text-sm font-semibold leading-6 text-[#6f6252]">
            Your order history will appear here when customer orders are connected to your account.
          </p>
        </div>

        <div className="mt-7 grid gap-3">
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
            {isSigningOut ? "Signing out..." : "Sign out"}
          </button>
        </div>
      </section>
    </main>
  );
}
