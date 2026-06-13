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
  Menu,
  Package,
  Sparkles,
  X,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { BRAND } from "@/lib/brand";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
  },
  {
    label: "Onboarding",
    href: "/dashboard/onboarding",
    icon: Sparkles,
  },
  {
    label: "Products",
    href: "/dashboard/products",
    icon: Package,
  },
  {
    label: "Services",
    href: "/dashboard/services",
    icon: Boxes,
  },
  {
    label: "Orders",
    href: "/dashboard/orders",
    icon: ClipboardList,
  },
  {
    label: "Domain",
    href: "/dashboard/domain",
    icon: Globe2,
  },
  {
    label: "Billing",
    href: "/dashboard/settings",
    icon: CreditCard,
  },
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

      if (!data.session) {
        setIsCheckingAuth(false);
        return;
      }

      setIsCheckingAuth(false);
    }

    checkAuth();

    return () => {
      mounted = false;
    };
  }, []);

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
      <main className="grid min-h-screen place-items-center bg-[#eef5f8] px-5 py-12">
        <div className="rounded-[2rem] bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
          <Loader2 className="mx-auto animate-spin text-slate-950" size={30} />
          <p className="mt-4 text-sm text-slate-500">
            Loading your dashboard...
          </p>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#eef5f8] text-slate-950">
      <button
        type="button"
        onClick={() => setIsSidebarOpen(true)}
        className="fixed left-4 top-4 z-50 grid h-11 w-11 place-items-center rounded-full bg-slate-950 text-white shadow-lg lg:hidden"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      {isSidebarOpen ? (
        <button
          type="button"
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden"
          aria-label="Close menu overlay"
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-slate-200 bg-white transition-transform duration-300 lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-5">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Image
                src="/market-villa-logo.png"
                alt="Market Villa"
                width={58}
                height={58}
                className="market-villa-logo-float h-14 w-14 object-contain"
                priority
              />

              <div>
                <p className="text-lg font-semibold tracking-[-0.04em] text-slate-950">
                  {BRAND.name}
                </p>
                <p className="text-xs font-medium text-slate-500">
                  Business center
                </p>
              </div>
            </Link>

            <button
              type="button"
              onClick={() => setIsSidebarOpen(false)}
              className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-600 lg:hidden"
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    isActive
                      ? "bg-slate-950 text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-slate-200 p-4">
            <p className="text-xs leading-5 text-slate-400">
              Manage storefront, products, services, orders, billing, and domain
              settings from one dashboard.
            </p>
          </div>
        </div>
      </aside>

      <main className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
          <div className="flex min-h-[76px] items-center justify-between gap-4 px-5 py-4 md:px-8">
            <div className="pl-12 lg:pl-0">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">
                Dashboard
              </p>
              <h1 className="mt-1 text-xl font-semibold tracking-[-0.04em] text-slate-950 md:text-2xl">
                Manage your business
              </h1>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoggingOut ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <LogOut size={17} />
              )}
              {isLoggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        </header>

        <div className="px-5 py-8 md:px-8">{children}</div>
      </main>
    </div>
  );
}