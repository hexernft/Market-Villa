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
  MessageCircle,
  Package,
  Settings,
  Sparkles,
  Store,
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
    label: "Store Details",
    href: "/dashboard/store-details",
    icon: Store,
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
  label: "Store", href: "/dashboard/store-details", icon: Store },
  {
  label: "More", href: "/dashboard/settings", icon: Settings },
];

const mobilePrimaryRoutes = new Set([
  "/dashboard",
  "/dashboard/products",
  "/dashboard/orders",
  "/dashboard/store-details",
]);

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
  const [businessName, setBusinessName] = useState("Market Villa");
  const [isBusinessPublished, setIsBusinessPublished] = useState(false);

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
          .select("name,business_mode,is_published")
          .order("created_at", {
  ascending: true })
          .limit(1);

        if (!mounted) return;
        const business = businesses?.[0];
        setBusinessMode(
          normalizeBusinessMode(business?.business_mode || "products")
        );
        setBusinessName(business?.name || "Market Villa");
        setIsBusinessPublished(Boolean(business?.is_published));
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
    <div className="mv-page-shell dashboard-mobile-light min-h-screen bg-[#fcfbff] text-[#171421] lg:pl-72">
      <aside data-dashboard-sidebar="true" className="dashboard-linear-sidebar dashboard-light-sidebar dashboard-sidebar fixed left-0 top-0 z-40 hidden h-screen overflow-hidden p-3 lg:block lg:w-72">
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
                <Link key={item.href} href={item.href} title={label} aria-current={isActive ? "page" : undefined} className={`group flex min-h-11 items-center justify-center gap-3 rounded-2xl px-2 py-2.5 text-[13px] font-semibold transition lg:justify-start lg:px-4 ${isActive ? "bg-[#7c3aed] text-white" : "text-[#241436]/68 hover:bg-[#f1eaff] hover:text-[#241436]"}`}>
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

      <header className="sticky top-0 z-30 border-b border-[#ece8f4] bg-[#fcfbff]/95 px-4 pb-3 pt-4 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-xl font-black tracking-[-0.04em] text-[#171421]">
              {businessName}
            </p>
            <span
              className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
                isBusinessPublished
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-amber-50 text-amber-700"
              }`}
            >
              {isBusinessPublished ? "Live" : "Draft"}
            </span>
          </div>

          <Link
            href="/dashboard/profile"
            className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-[#eee9f6] bg-white text-[#7c3aed]"
            aria-label="Open profile"
          >
            <UserRound size={22} />
          </Link>
        </div>
      </header>

      <main data-dashboard-main="true" className="min-h-screen min-w-0 pb-[calc(6rem+env(safe-area-inset-bottom))] lg:pb-0">
        <div className="mv-dashboard-content px-4 py-4 md:px-5 lg:px-5 lg:py-4">{children}</div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-[#e9e4f2] bg-white/96 px-2 pb-[calc(0.6rem+env(safe-area-inset-bottom))] pt-2 backdrop-blur lg:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
          {mobileNavItems.map((item) => {
            const Icon = item.modeAware ? InventoryIcon : item.icon;
            const label = item.modeAware ? modeMeta.inventoryLabel : item.label;
            const isMore = item.label === "More";
            const isActive = isMore
              ? !mobilePrimaryRoutes.has(pathname)
              : pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-h-[4.15rem] flex-col items-center justify-center gap-1 rounded-2xl text-[11px] font-bold transition ${
                  isActive
                    ? "bg-[#f1eaff] text-[#7c3aed]"
                    : "text-[#6f6a7a] hover:bg-[#faf7ff] hover:text-[#241436]"
                }`}
              >
                <Icon size={22} strokeWidth={2.2} />
                <span className="truncate">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}








