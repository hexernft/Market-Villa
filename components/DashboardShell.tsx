"use client";

import Image from "next/image";
import Link from "next/link";
import {
  usePathname, useRouter } from "next/navigation";
import {
  ReactNode, useEffect, useState } from "react";
import {
  BarChart3,  ClipboardList,
  CreditCard,
  Globe2,
  LayoutDashboard,
  Loader2,
  LogOut,
  Megaphone,
  Package,
  Palette,
  Settings,
  Sparkles,
  UserRound
} from "lucide-react";
import {
  supabase } from "@/lib/supabase";
import {
  BRAND } from "@/lib/brand";
import {
  getBusinessModeMeta, normalizeBusinessMode } from "@/lib/business-modes";

const navItems = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
  },
  {
    label: "Visibility",
    href: "/dashboard/visibility",
    icon: Megaphone,
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
    modeAware: true,
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
    label: "Profile",
    href: "/dashboard/profile",
    icon: UserRound,
  },
  {
    label: "Themes",
    href: "/dashboard/theme-store",
    icon: Sparkles,
  },
  {
    label: "Home Builder",
    href: "/dashboard/home-builder",
    icon: LayoutDashboard,
  },
  {
    label: "Customize Store",
    href: "/dashboard/customize",
    icon: Palette,
  },
  {
    label: "Custom Requests",
    href: "/dashboard/custom-requests",
    icon: Sparkles,
  },
  {
    label: "Billing",
    href: "/dashboard/billing",
    icon: CreditCard,
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

const mobileNavItems = [
  {
  label: "Home", href: "/dashboard", icon: LayoutDashboard },
  {
  label: "Products", href: "/dashboard/products", icon: Package, modeAware: true },
  {
  label: "Orders", href: "/dashboard/orders", icon: ClipboardList },
  {
  label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  {
  label: "More", href: "/dashboard/settings", icon: Settings },
];

function getInventoryIcon() {
  return Package;
}

export function DashboardShell({
  children }: {
  children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [businessMode, setBusinessMode] = useState("products");

  const modeMeta = getBusinessModeMeta(businessMode);
  const InventoryIcon = getInventoryIcon();

  useEffect(() => {
  let mounted = true;
    async function checkAuth() {
  const {
  data } = await supabase.auth.getSession();
      if (!mounted) return;
      setIsCheckingAuth(false);
      if (!data.session) router.push("/login");

      if (data.session) {
  const {
  data: businesses } = await supabase
          .from("businesses")
          .select("business_mode")
          .order("created_at", {
  ascending: true })
          .limit(1);

        if (!mounted) return;
        setBusinessMode(
          normalizeBusinessMode(businesses?.[0]?.business_mode || "products")
        );
      }
    }
    checkAuth();
    return () => {
  mounted = false; };
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
      <main data-dashboard-main="true" className="mv-page-shell grid min-h-screen place-items-center px-5 py-12">
        <div className="mv-soft-panel rounded-[2rem] p-8 text-center">
          <Loader2 className="mx-auto animate-spin text-[#7c3aed]" size={30} />
          <p className="mt-4 text-sm text-[#241436]/60">Loading your dashboard...</p>
        </div>
      </main>
    );
  }

  return (
    <div className="mv-page-shell dashboard-mobile-light min-h-screen bg-[#fbf8ff] pl-20 text-[#241436] lg:pl-72">
      <aside data-dashboard-sidebar="true" className="dashboard-linear-sidebar dashboard-light-sidebar dashboard-sidebar fixed left-0 top-0 z-40 block h-screen w-20 overflow-hidden p-2 lg:w-72 lg:p-3">
        <div className="flex h-full flex-col overflow-hidden rounded-[1.2rem] border border-[#e7e5ee] bg-[#f7f7fb] text-[#171421] lg:rounded-[1.8rem]">
          <div className="flex items-center justify-center px-2 py-4 lg:justify-start lg:px-5 lg:py-5">
            <Link href="/dashboard" className="flex items-center justify-center gap-3 lg:justify-start">
              <Image src="/market-villa-logo.png" alt="Market Villa" width={72} height={72} className="h-11 w-11 object-contain lg:h-16 lg:w-16" priority />
              <div className="hidden lg:block">
                <p className="text-sm font-semibold tracking-[-0.04em] text-[#241436]">{BRAND.name}</p>
                <p className="text-xs font-medium text-[#241436]/50">Brand studio</p>
              </div>
            </Link>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-2 lg:px-4 lg:py-2.5">
            {navItems.map((item) => {
  const Icon = item.modeAware ? InventoryIcon : item.icon;
              const label = item.modeAware ? modeMeta.inventoryLabel : item.label;
              const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
              return (
                <Link key={item.href} href={item.href} title={label} className={`group flex min-h-11 items-center justify-center gap-3 rounded-2xl px-2 py-2.5 text-[13px] font-semibold transition lg:justify-start lg:px-4 ${isActive ? "bg-[#7c3aed] text-white" : "text-[#241436]/68 hover:bg-[#f1eaff] hover:text-[#241436]"}`}>
                  <Icon size={17} />
                  <span className="hidden lg:inline">{label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-2 lg:p-4">
            <button type="button" onClick={handleLogout} disabled={isLoggingOut} title="Logout" className="flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border border-[#e8e1f4] bg-white px-2 py-2.5 text-sm font-semibold text-[#241436]/80 transition hover:bg-[#f1eaff] hover:text-[#241436] disabled:cursor-not-allowed disabled:opacity-60 lg:px-4">
              {isLoggingOut ? <Loader2 size={17} className="animate-spin" /> : <LogOut size={17} />}
              <span className="hidden lg:inline">{isLoggingOut ? "Logging out..." : "Logout"}</span>
            </button>
          </div>
        </div>
      </aside>

      <main data-dashboard-main="true" className="min-h-screen min-w-0">
        <div className="mv-dashboard-content px-4 py-4 md:px-5 lg:px-5 lg:py-4">{children}</div>
      </main>
    </div>
  );
}




