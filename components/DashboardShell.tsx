"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Boxes,
  Building2,
  ChevronRight,
  ClipboardList,
  Globe2,
  Home,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  Palette,
  Settings,
  Sparkles,
  Store,
  UserRoundCog,
  X,
} from "lucide-react";
import { BRAND } from "@/lib/brand";
import { signOut } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { getMyBusinesses } from "@/lib/business-actions";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { label: "Onboarding", href: "/dashboard/onboarding", icon: UserRoundCog },
  { label: "Business Profile", href: "/dashboard/profile", icon: Building2 },
  { label: "Products", href: "/dashboard/products", icon: Boxes },
  { label: "Services", href: "/dashboard/services", icon: Sparkles },
  { label: "Theme", href: "/dashboard/theme", icon: Palette },
  { label: "Orders", href: "/dashboard/orders", icon: ClipboardList },
  { label: "Custom Domain", href: "/dashboard/domain", icon: Globe2 },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

type DashboardBusiness = {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  logo_text: string | null;
  subscription_plan: string;
  subscription_status: string;
  is_published: boolean;
};

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [businesses, setBusinesses] = useState<DashboardBusiness[]>([]);
  const [previewSlug, setPreviewSlug] = useState("");

  const activeBusiness = useMemo(() => {
    return businesses[0];
  }, [businesses]);

  useEffect(() => {
    let mounted = true;

    async function loadUserBusiness() {
      try {
        const items = (await getMyBusinesses()) as DashboardBusiness[];

        if (!mounted) return;

        setBusinesses(items);

        if (items.length > 0) {
          setPreviewSlug(items[0].slug);
        }
      } catch {
        if (!mounted) return;

        setBusinesses([]);
        setPreviewSlug("");
      }
    }

    async function checkSession() {
      const { data, error } = await supabase.auth.getSession();

      if (!mounted) return;

      if (error || !data.session) {
        setIsLoggedIn(false);
        setIsCheckingAuth(false);
        return;
      }

      setIsLoggedIn(true);
      setIsCheckingAuth(false);

      await loadUserBusiness();
    }

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(Boolean(session));
      setIsCheckingAuth(false);

      if (session) {
        loadUserBusiness();
      } else {
        setBusinesses([]);
        setPreviewSlug("");
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      await signOut();
      router.push("/login");
    } catch {
      setIsLoggingOut(false);
    }
  }

  const previewHref = previewSlug
    ? `/store/${previewSlug}`
    : "/dashboard/onboarding";

  const previewLabel = previewSlug ? "Preview Store" : "Create Store";

  if (isCheckingAuth) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#eef5f8] px-5 py-12">
        <div className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-7 text-center shadow-soft">
          <div className="mx-auto mb-6 grid h-14 w-14 place-items-center rounded-2xl bg-slate-950 text-white">
            <Loader2 size={24} className="animate-spin" />
          </div>

          <h1 className="text-2xl font-semibold tracking-[-0.04em] text-slate-950">
            Checking your session
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            Please wait while Market Villa confirms your business dashboard
            access.
          </p>
        </div>
      </main>
    );
  }

  if (!isLoggedIn) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#eef5f8] px-5 py-12">
        <div className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-7 text-center shadow-soft">
          <div className="mx-auto mb-6 grid h-14 w-14 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
            <Store size={24} />
          </div>

          <h1 className="text-2xl font-semibold tracking-[-0.04em] text-slate-950">
            Login required
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            You need to login before managing a Market Villa business page.
          </p>

          <div className="mt-7 grid gap-3">
            <Link
              href="/login"
              className="rounded-full bg-slate-950 px-5 py-4 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Login to Dashboard
            </Link>

            <Link
              href="/signup"
              className="rounded-full border border-slate-200 px-5 py-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Create Business Account
            </Link>

            <Link href="/" className="text-sm font-medium text-slate-500">
              Back to website
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const sidebar = (
    <aside className="flex h-full flex-col bg-white">
      <div className="border-b border-slate-200 px-5 py-5">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center overflow-hidden bg-white/10"><Image src="/market-villa-logo.png" alt="Market Villa" width={40} height={40} className="h-10 w-10 object-contain" /></span>

          <span>
            <span className="block text-lg font-semibold leading-none tracking-[-0.04em] text-slate-950">
              Market Villa
            </span>
            <span className="mt-1 block text-xs font-medium text-slate-400">
              Mini websites for businesses
            </span>
          </span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5">
        <div className="mb-5 rounded-[1.5rem] border border-slate-200 bg-[#f7fbfc] p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-slate-950 text-sm font-semibold text-white">
              {activeBusiness?.logo_text || "MV"}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-950">
                {activeBusiness?.name || "Business setup"}
              </p>

              <p className="mt-1 truncate text-xs text-slate-500">
                {activeBusiness?.category || "Create your business page"}
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-2">
            <div className="flex items-center justify-between rounded-2xl bg-white px-3 py-2 text-xs">
              <span className="text-slate-500">Plan</span>
              <span className="font-semibold capitalize text-slate-950">
                {activeBusiness?.subscription_plan || "starter"}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-white px-3 py-2 text-xs">
              <span className="text-slate-500">Status</span>
              <span
                className={`font-semibold ${
                  activeBusiness?.is_published
                    ? "text-emerald-700"
                    : "text-amber-700"
                }`}
              >
                {activeBusiness?.is_published ? "Live" : "Draft"}
              </span>
            </div>
          </div>

          <Link
            href={previewHref}
            className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-500"
          >
            {previewLabel}
            <ChevronRight size={16} />
          </Link>
        </div>

        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          Menu
        </p>

        <nav className="grid gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center justify-between rounded-2xl px-3 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon size={18} />
                  {item.label}
                </span>

                {isActive ? <ChevronRight size={16} /> : null}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-slate-200 p-4">
        <div className="mb-3 rounded-[1.25rem] bg-slate-950 p-4 text-white">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <BarChart3 size={17} />
            Business tools
          </div>

          <p className="text-xs leading-5 text-slate-300">
            Manage your storefront, products, services, orders, and domain from
            one control center.
          </p>
        </div>

        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          <LogOut size={17} />
          {isLoggingOut ? "Logging out..." : "Logout"}
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-[#eef5f8]">
      <div className="fixed left-0 top-0 z-40 hidden h-screen w-72 border-r border-slate-200 lg:block">
        {sidebar}
      </div>

      {isMobileMenuOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(false)}
            className="absolute inset-0 bg-slate-950/50"
            aria-label="Close menu"
          />

          <div className="relative h-full w-80 max-w-[85vw] border-r border-slate-200 bg-white">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-700"
              aria-label="Close menu"
            >
              <X size={18} />
            </button>

            {sidebar}
          </div>
        </div>
      ) : null}

      <main className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 backdrop-blur-xl">
          <div className="flex items-center justify-between px-5 py-4 md:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(true)}
                className="grid h-11 w-11 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-700 lg:hidden"
              >
                <Menu size={20} />
              </button>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                  {BRAND.name} Dashboard
                </p>

                <h1 className="text-xl font-semibold tracking-tight text-slate-950">
                  Manage your business page
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 md:inline-flex"
              >
                <Home size={17} />
                Website
              </Link>

              <Link
                href={previewHref}
                className="hidden rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-500 md:inline-flex"
              >
                {previewLabel}
              </Link>

              <span className="grid h-11 w-11 place-items-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-950">
                {activeBusiness?.logo_text || "MV"}
              </span>
            </div>
          </div>
        </header>

        <div className="px-5 py-8 md:px-8">{children}</div>
      </main>
    </div>
  );
}
