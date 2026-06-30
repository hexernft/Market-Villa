"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Copy,
  CreditCard,
  ExternalLink,
  Loader2,
  Package,
  Plus,
  ShoppingBag,
  Store,
  UserRound,
} from "lucide-react";
import {
  getMyBusinesses,
  getProductsByBusinessId,
} from "@/lib/business-actions";
import { supabase } from "@/lib/supabase";

type DashboardBusiness = {
  id: string;
  name: string;
  slug: string;
  is_published?: boolean | null;
  description?: string | null;
  tagline?: string | null;
  logo_url?: string | null;
  cover_image_url?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  location?: string | null;
};

type DashboardProduct = {
  id: string;
  is_published?: boolean | null;
  is_available?: boolean | null;
};

type DashboardOrder = {
  id: string;
  business_id: string;
  created_at?: string | null;
};

function isToday(value?: string | null) {
  if (!value) return false;

  const date = new Date(value);
  const today = new Date();

  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

export default function DashboardPage() {
  const [businesses, setBusinesses] = useState<DashboardBusiness[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [productsCount, setProductsCount] = useState(0);
  const [ordersTodayCount, setOrdersTodayCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false);
  const [message, setMessage] = useState("");
  const [copyMessage, setCopyMessage] = useState("");

  const selectedBusiness = useMemo(() => {
    return businesses.find((business) => business.id === selectedBusinessId);
  }, [businesses, selectedBusinessId]);

  const storeUrl = selectedBusiness?.slug
    ? `/store/${selectedBusiness.slug}`
    : "";

  const setupItems = useMemo(() => {
    if (!selectedBusiness) {
      return [];
    }

    return [
      {
        label: "Complete store profile",
        href: "/dashboard/store-details",
        done: Boolean(selectedBusiness.name && selectedBusiness.tagline),
      },
      {
        label: "Add logo or cover",
        href: "/dashboard/store-details",
        done: Boolean(
          selectedBusiness.logo_url || selectedBusiness.cover_image_url,
        ),
      },
      {
        label: "Add your first product",
        href: "/dashboard/products",
        done: productsCount > 0,
      },
      {
        label: "Set contact details",
        href: "/dashboard/store-details",
        done: Boolean(
          selectedBusiness.whatsapp ||
            selectedBusiness.phone ||
            selectedBusiness.email ||
            selectedBusiness.location,
        ),
      },
      {
        label: "Publish your store",
        href: "/dashboard/visibility",
        done: Boolean(selectedBusiness.is_published),
      },
    ];
  }, [productsCount, selectedBusiness]);

  const completedSetupCount = setupItems.filter((item) => item.done).length;
  const setupProgress =
    setupItems.length > 0
      ? Math.round((completedSetupCount / setupItems.length) * 100)
      : 0;
  const statusLabel = selectedBusiness?.is_published ? "Published" : "Draft";

  async function loadBusinesses() {
    const items = (await getMyBusinesses()) as DashboardBusiness[];

    setBusinesses(items);

    if (items.length > 0) {
      setSelectedBusinessId((current) => current || items[0].id);
    }
  }

  async function loadMetrics(businessId: string) {
    setIsLoadingMetrics(true);
    setMessage("");

    try {
      const [products, orderResponse] = await Promise.all([
        getProductsByBusinessId(businessId) as Promise<DashboardProduct[]>,
        supabase
          .from("orders")
          .select("id,business_id,created_at")
          .eq("business_id", businessId)
          .order("created_at", { ascending: false })
          .limit(50),
      ]);

      if (orderResponse.error) {
        throw orderResponse.error;
      }

      const liveProducts = products.filter((product) => {
        return product.is_published !== false && product.is_available !== false;
      });
      const todayOrders = ((orderResponse.data || []) as DashboardOrder[]).filter(
        (order) => isToday(order.created_at),
      );

      setProductsCount(liveProducts.length);
      setOrdersTodayCount(todayOrders.length);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to load dashboard.",
      );
    } finally {
      setIsLoadingMetrics(false);
    }
  }

  async function handleCopyStoreLink() {
    if (!selectedBusiness?.slug) return;

    const origin =
      typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/store/${selectedBusiness.slug}`;

    try {
      await navigator.clipboard.writeText(url);
      setCopyMessage("Store link copied.");
    } catch {
      setCopyMessage("Copy failed.");
    }

    window.setTimeout(() => setCopyMessage(""), 2200);
  }

  useEffect(() => {
    let mounted = true;

    async function loadPage() {
      try {
        setIsLoading(true);
        await loadBusinesses();
      } catch (error) {
        if (!mounted) return;

        setMessage(
          error instanceof Error
            ? error.message
            : "Unable to load your dashboard.",
        );
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadPage();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedBusinessId) {
      setProductsCount(0);
      setOrdersTodayCount(0);
      return;
    }

    loadMetrics(selectedBusinessId);
  }, [selectedBusinessId]);

  if (isLoading) {
    return (
      <main className="grid min-h-[60vh] place-items-center">
        <div className="rounded-[1.5rem] border border-[#eadfff] bg-white p-6 text-center">
          <Loader2 className="mx-auto animate-spin text-[#7c3aed]" size={24} />
        </div>
      </main>
    );
  }

  if (businesses.length === 0) {
    return (
      <section className="mx-auto grid max-w-2xl gap-5 rounded-[1.6rem] border border-[#eadfff] bg-white p-5 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#f1eaff] text-[#7c3aed]">
          <Store size={22} />
        </div>

        <h1 className="text-2xl font-black tracking-[-0.045em] text-[#241436]">
          Market Villa
        </h1>

        <Link
          href="/dashboard/onboarding"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#241436] to-[#7c3aed] px-5 text-sm font-black text-white"
        >
          Start Setup
          <ArrowRight size={16} />
        </Link>
      </section>
    );
  }

  const quickActions = [
    {
      label: "Products",
      href: "/dashboard/products",
      icon: Package,
    },
    {
      label: "Orders",
      href: "/dashboard/orders",
      icon: ShoppingBag,
    },
    {
      label: "Store details",
      href: "/dashboard/store-details",
      icon: Store,
    },
    {
      label: "Billing",
      href: "/dashboard/billing",
      icon: CreditCard,
    },
  ];

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-4 text-[#241436]">
      <header className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-[1.85rem] font-black tracking-[-0.055em] text-[#241436] md:text-4xl">
            Market Villa
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`rounded-full border px-3 py-1.5 text-xs font-black ${
              selectedBusiness?.is_published
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-[#eadfff] bg-[#f4edff] text-[#7c3aed]"
            }`}
          >
            {statusLabel}
          </span>

          <Link
            href="/dashboard/profile"
            aria-label="Open profile"
            className="grid h-11 w-11 place-items-center rounded-2xl border border-[#eadfff] bg-white text-[#7c3aed]"
          >
            <UserRound size={20} />
          </Link>
        </div>
      </header>

      {businesses.length > 1 ? (
        <select
          value={selectedBusinessId}
          onChange={(event) => setSelectedBusinessId(event.target.value)}
          className="min-h-12 rounded-2xl border border-[#eadfff] bg-white px-4 text-sm font-bold text-[#241436] outline-none focus:border-[#7c3aed] focus:ring-4 focus:ring-[#7c3aed]/10"
        >
          {businesses.map((business) => (
            <option key={business.id} value={business.id}>
              {business.name} - /store/{business.slug}
            </option>
          ))}
        </select>
      ) : null}

      {message ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
          {message}
        </div>
      ) : null}

      <section className="rounded-[1.6rem] border border-[#eadfff] bg-gradient-to-br from-white via-[#faf8ff] to-[#f4edff] p-4 md:p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          {storeUrl ? (
            <Link
              href={storeUrl}
              target="_blank"
              className="inline-flex min-h-13 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#241436] to-[#7c3aed] px-5 text-sm font-black text-white"
            >
              Visit store
              <ExternalLink size={17} />
            </Link>
          ) : (
            <Link
              href="/dashboard/onboarding"
              className="inline-flex min-h-13 items-center justify-center gap-2 rounded-2xl bg-[#d8c9f8] px-5 text-sm font-black text-[#241436]/60"
            >
              Visit store
              <ExternalLink size={17} />
            </Link>
          )}

          <button
            type="button"
            onClick={handleCopyStoreLink}
            disabled={!selectedBusiness?.slug}
            className="inline-flex min-h-13 items-center justify-center gap-2 rounded-2xl border border-[#d8c9f8] bg-white px-5 text-sm font-black text-[#241436] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Copy size={17} />
            Share link
          </button>
        </div>

        {copyMessage ? (
          <p className="mt-3 text-sm font-bold text-emerald-700">
            {copyMessage}
          </p>
        ) : null}
      </section>

      <section className="rounded-[1.6rem] border border-[#eadfff] bg-white p-4 md:p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-black tracking-[-0.045em] text-[#241436]">
              {completedSetupCount}/5 steps done
            </h2>
          </div>

          <span className="rounded-full border border-[#d8c9f8] bg-[#f4edff] px-3 py-1.5 text-xs font-black text-[#7c3aed]">
            {setupProgress}%
          </span>
        </div>

        <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-[#eee6ff]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#241436] to-[#7c3aed] transition-all"
            style={{ width: `${setupProgress}%` }}
          />
        </div>

        <div className="mt-4 grid gap-2">
          {setupItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex min-h-12 items-center justify-between rounded-2xl border border-[#eadfff] bg-[#faf8ff] px-3 py-2 text-sm font-black text-[#241436]"
            >
              <span className="inline-flex min-w-0 items-center gap-2">
                {item.done ? (
                  <CheckCircle2
                    size={18}
                    className="shrink-0 text-[#7c3aed]"
                  />
                ) : (
                  <span className="grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full border border-[#c9b7ef] text-[#7c3aed]">
                    <Plus size={12} />
                  </span>
                )}
                <span className="truncate">{item.label}</span>
              </span>

              {!item.done ? (
                <ArrowRight size={15} className="shrink-0 text-[#7c3aed]" />
              ) : null}
            </Link>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {quickActions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.href}
              href={action.href}
              className="grid min-h-[6.1rem] place-items-center gap-2 rounded-[1.35rem] border border-[#eadfff] bg-white p-3 text-center text-sm font-black text-[#241436]"
            >
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#f4edff] text-[#7c3aed]">
                <Icon size={20} />
              </span>
              {action.label}
            </Link>
          );
        })}
      </section>

      <section className="rounded-[1.6rem] border border-[#eadfff] bg-white p-4 md:p-5">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-xl font-black tracking-[-0.045em] text-[#241436]">
            Store status
          </h2>

          {isLoadingMetrics ? (
            <Loader2 size={18} className="animate-spin text-[#7c3aed]" />
          ) : null}
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#eadfff] bg-[#faf8ff] p-4">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-[#7c3aed]">
              Status
            </p>
            <p className="mt-3 text-2xl font-black tracking-[-0.055em] text-[#241436]">
              {statusLabel}
            </p>
          </div>

          <div className="rounded-2xl border border-[#eadfff] bg-[#faf8ff] p-4">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-[#7c3aed]">
              Products live
            </p>
            <p className="mt-3 text-2xl font-black tracking-[-0.055em] text-[#241436]">
              {productsCount}
            </p>
          </div>

          <div className="rounded-2xl border border-[#eadfff] bg-[#faf8ff] p-4">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-[#7c3aed]">
              Orders today
            </p>
            <p className="mt-3 text-2xl font-black tracking-[-0.055em] text-[#241436]">
              {ordersTodayCount}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
