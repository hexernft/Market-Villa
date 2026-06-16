"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import {
  BarChart3,
  Boxes,
  ClipboardList,
  CreditCard,
  Globe2,
  LayoutDashboard,
  Loader2,
  LogOut,
  Megaphone,
  Menu,
  Package,
  Palette,
  Settings,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { BRAND } from "@/lib/brand";

const navItems = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { label: "Visibility", href: "/dashboard/visibility", icon: Megaphone },
  { label: "Onboarding", href: "/dashboard/onboarding", icon: Sparkles },
  { label: "Products", href: "/dashboard/products", icon: Package },
  { label: "Services", href: "/dashboard/services", icon: Boxes },
  { label: "Orders", href: "/dashboard/orders", icon: ClipboardList },
  { label: "Domain", href: "/dashboard/domain", icon: Globe2 },
  { label: "Profile", href: "/dashboard/profile", icon: UserRound },
  { label: "Theme", href: "/dashboard/theme", icon: Palette },
  { label: "Billing", href: "/dashboard/billing", icon: CreditCard },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function checkAuth() {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setIsCheckingAuth(false);
      if (!data.session) router.push("/login");
    }
    checkAuth();
    return () => { mounted = false; };
  }, [router]);

  async function handleLogout() {
    try {
      setIsLoggingOut(true);
      await supabase.auth.signOut();
      router.push("/login");
    } finally {
      setIsLoggingOut(false);
    }
  }

  if (isCheckingAuth) {
    return (
      <main className="mv-page-shell grid min-h-screen place-items-center px-5 py-12">
        <div className="mv-soft-panel rounded-[2rem] p-8 text-center">
          <Loader2 className="mx-auto animate-spin text-[#7c3aed]" size={30} />
          <p className="mt-4 text-sm text-[#241436]/60">Loading your dashboard...</p>
        </div>
      </main>
    );
  }

  return (
    <div className="mv-page-shell min-h-screen text-[#241436]">
      <button type="button" onClick={() => setIsSidebarOpen(true)} className="fixed left-4 top-4 z-50 grid h-12 w-12 place-items-center rounded-2xl bg-[#7c3aed] text-white shadow-lg lg:hidden" aria-label="Open menu">
        <Menu size={19} />
      </button>

      {isSidebarOpen ? (
        <button type="button" onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 z-40 bg-[#241436]/45 backdrop-blur-sm lg:hidden" aria-label="Close menu overlay" />
      ) : null}

      <aside className={`dashboard-sidebar fixed inset-y-0 left-0 z-50 w-72 p-3 transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-full flex-col overflow-hidden rounded-[1.8rem] border border-white/10 bg-[linear-gradient(160deg,#241436_0%,#2f174b_70%,#412064_100%)] text-white shadow-[0_26px_70px_rgba(36,20,54,0.22)]">
          <div className="flex items-center justify-between px-5 py-5">
            <Link href="/dashboard" className="flex items-center gap-3">
              <Image src="/market-villa-logo.png" alt="Market Villa" width={72} height={72} className="h-16 w-16 object-contain" priority />
              <div>
                <p className="text-sm font-semibold tracking-[-0.04em] text-white">{BRAND.name}</p>
                <p className="text-xs font-medium text-white/50">Brand studio</p>
              </div>
            </Link>

            <button type="button" onClick={() => setIsSidebarOpen(false)} className="grid h-9 w-9 place-items-center rounded-2xl bg-white/10 text-white lg:hidden" aria-label="Close menu">
              <X size={18} />
            </button>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-2.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
              return (
                <Link key={item.href} href={item.href} onClick={() => setIsSidebarOpen(false)} className={`group flex items-center gap-3 rounded-2xl px-4 py-2.5 text-[13px] font-semibold transition ${isActive ? "bg-[#7c3aed] text-white shadow-[0_14px_35px_rgba(124,58,237,0.35)]" : "text-white/68 hover:bg-white/10 hover:text-white"}`}>
                  <Icon size={17} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="p-4">
            <button type="button" onClick={handleLogout} disabled={isLoggingOut} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/8 px-4 py-2.5 text-sm font-semibold text-white/80 transition hover:bg-white/12 hover:text-white disabled:cursor-not-allowed disabled:opacity-60">
              {isLoggingOut ? <Loader2 size={17} className="animate-spin" /> : <LogOut size={17} />}
              {isLoggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>
      </aside>

      <main className="min-h-screen lg:pl-72">
        <div className="mv-dashboard-content px-4 py-5 md:px-4 lg:px-5">{children}</div>
      </main>
    </div>
  );
}


