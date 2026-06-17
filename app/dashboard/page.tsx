"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Copy,
  ExternalLink,
  Globe2,
  Loader2,
  Package,
  Palette,
  Plus,
  Send,
  ShoppingBag,
  Sparkles,
  UserRound,
  Wallet,
} from "lucide-react";
import {
  getMyBusinesses,
  getProductsByBusinessId,
} from "@/lib/business-actions";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";
import { AnimatedNumber } from "@/components/AnimatedNumber";

type DashboardBusiness = {
  id: string;
  name: string;
  slug: string;
  is_published?: boolean | null;
  subscription_plan?: string | null;
  subscription_status?: string | null;
  description?: string | null;
  logo_url?: string | null;
  cover_image_url?: string | null;
  whatsapp?: string | null;
  selected_theme?: string | null;
  created_at?: string | null;
};

type DashboardOrder = {
  id: string;
  business_id: string;
  customer_name?: string | null;
  status?: string | null;
  total_amount?: number | null;
  total?: number | null;
  order_total?: number | null;
  created_at?: string | null;
};

function getOrderAmount(order: DashboardOrder) {
  return Number(order.total_amount || order.total || order.order_total || 0);
}

function formatDate(value?: string | null) {
  if (!value) return "";

  return new Intl.DateTimeFormat("en-NG", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getStatusStyle(status?: string | null) {
  const cleanStatus = String(status || "pending").toLowerCase();

  if (
    ["completed", "complete", "delivered", "fulfilled"].includes(cleanStatus)
  ) {
    return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  }

  if (["cancelled", "failed", "rejected"].includes(cleanStatus)) {
    return "bg-red-50 text-red-700 ring-red-200";
  }

  return "bg-purple-50 text-purple-700 ring-purple-200";
}

function formatStatus(status?: string | null) {
  return String(status || "pending").replace(/_/g, " ");
}

export default function DashboardPage() {
  const [businesses, setBusinesses] = useState<DashboardBusiness[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [productsCount, setProductsCount] = useState(0);
  const [orders, setOrders] = useState<DashboardOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false);
  const [message, setMessage] = useState("");
  const [copyMessage, setCopyMessage] = useState("");

  const selectedBusiness = useMemo(() => {
    return businesses.find((business) => business.id === selectedBusinessId);
  }, [businesses, selectedBusinessId]);

  const metrics = useMemo(() => {
    const revenue = orders.reduce(
      (sum, order) => sum + getOrderAmount(order),
      0,
    );

    const pendingOrders = orders.filter((order) => {
      const status = String(order.status || "pending").toLowerCase();
      return ["pending", "new", "started", "processing", "confirmed"].includes(
        status,
      );
    }).length;

    return {
      revenue,
      orders: orders.length,
      pendingOrders,
      products: productsCount,
    };
  }, [orders, productsCount]);

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
        href: "/dashboard/profile",
        done: Boolean(
          selectedBusiness.name &&
            selectedBusiness.description &&
            selectedBusiness.whatsapp
        ),
      },
      {
        label: "Add logo or cover",
        href: "/dashboard/profile",
        done: Boolean(selectedBusiness.logo_url || selectedBusiness.cover_image_url),
      },
      {
        label: "Add your first product",
        href: "/dashboard/products",
        done: productsCount > 0,
      },
      {
        label: "Choose a theme",
        href: "/dashboard/theme",
        done: Boolean(selectedBusiness.selected_theme),
      },
      {
        label: "Publish your store",
        href: "/dashboard/profile",
        done: Boolean(selectedBusiness.is_published),
      },
    ];
  }, [productsCount, selectedBusiness]);

  const completedSetupCount = setupItems.filter((item) => item.done).length;
  const setupProgress =
    setupItems.length > 0
      ? Math.round((completedSetupCount / setupItems.length) * 100)
      : 0;

  async function loadBusinesses() {
    const items = await getMyBusinesses();

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
        getProductsByBusinessId(businessId),
        supabase
          .from("orders")
          .select("*")
          .eq("business_id", businessId)
          .order("created_at", { ascending: false })
          .limit(6),
      ]);

      if (orderResponse.error) {
        throw orderResponse.error;
      }

      setProductsCount(products.length);
      setOrders((orderResponse.data || []) as DashboardOrder[]);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unable to load dashboard.";

      setMessage(errorMessage);
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
      setCopyMessage("Copy failed. Open your store and copy the link.");
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

        const errorMessage =
          error instanceof Error
            ? error.message
            : "Unable to load your dashboard.";

        setMessage(errorMessage);
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
      setOrders([]);
      return;
    }

    loadMetrics(selectedBusinessId);
  }, [selectedBusinessId]);

  if (isLoading) {
    return (
      <main className="grid min-h-[60vh] place-items-center">
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 text-center shadow-sm">
          <Loader2 className="mx-auto animate-spin text-slate-950" size={24} />

          <p className="mt-3 text-sm text-slate-500">Loading dashboard...</p>
        </div>
      </main>
    );
  }

  if (businesses.length === 0) {
    return (
      <section className="mx-auto max-w-3xl rounded-[1.5rem] border border-slate-200 bg-white p-6 text-center shadow-sm">
        <div className="mx-auto grid h-10 w-12 place-items-center rounded-2xl bg-[#26143d] text-white">
          <Sparkles size={20} />
        </div>

        <h2 className="mt-5 text-xl font-semibold tracking-[-0.04em] text-slate-950">
          Create your first business page
        </h2>

        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
          Set up your storefront, add products, and publish your
          page.
        </p>

        <Link
          href="/dashboard/onboarding"
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-[#26143d] px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
        >
          Start Setup
          <ArrowRight size={16} />
        </Link>
      </section>
    );
  }

  const statCards = [
    {
      label: "Revenue",
      value: metrics.revenue,
      prefix: "₦",
      icon: Wallet,
    },
    {
      label: "Orders",
      value: metrics.orders,
      icon: ShoppingBag,
    },
    {
      label: "Pending",
      value: metrics.pendingOrders,
      icon: Clock3,
    },
    {
      label: "Products",
      value: metrics.products,
      icon: Package,
    },
  ];

  const quickActions = [
    {
      label: "Product",
      href: "/dashboard/products",
      icon: Package,
    },
    {
      label: "Theme",
      href: "/dashboard/theme",
      icon: Palette,
    },
    {
      label: "Profile",
      href: "/dashboard/profile",
      icon: UserRound,
    },
    {
      label: "Domain",
      href: "/dashboard/domain",
      icon: Globe2,
    },
  ];

  return (
    <div className="dashboard-overview-mobile grid gap-5">
      <section className="dashboard-hero-card rounded-[1.35rem] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
              Business Dashboard
            </p>

            <h1 className="mt-2 truncate text-2xl font-semibold tracking-[-0.04em] text-slate-950">
              Hi, {selectedBusiness?.name || "there"}
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              {selectedBusiness?.is_published
                ? "Your store is live. Keep it fresh."
                : "Finish setup and share your store link."}
            </p>
          </div>

          <span
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
              selectedBusiness?.is_published
                ? "bg-emerald-50 text-emerald-700"
                : "bg-amber-50 text-amber-700"
            }`}
          >
            {selectedBusiness?.is_published ? "Live" : "Draft"}
          </span>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto_auto] sm:items-center">
          <select
            value={selectedBusinessId}
            onChange={(event) => setSelectedBusinessId(event.target.value)}
            className="min-h-10 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50"
          >
            {businesses.map((business) => (
              <option key={business.id} value={business.id}>
                {business.name} - /store/{business.slug}
              </option>
            ))}
          </select>

          {storeUrl ? (
            <Link
              href={storeUrl}
              target="_blank"
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-2xl bg-[#06110f] px-4 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5"
            >
              Visit store
              <ExternalLink size={16} />
            </Link>
          ) : null}

          <button
            type="button"
            onClick={handleCopyStoreLink}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5"
          >
            <Copy size={16} />
            Share link
          </button>
        </div>

        {copyMessage ? (
          <p className="mt-3 text-sm font-medium text-emerald-700">
            {copyMessage}
          </p>
        ) : null}
      </section>

      {isLoadingMetrics ? (
        <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-medium text-slate-500 shadow-sm">
          <Loader2 size={13} className="animate-spin" />
          Updating dashboard
        </div>
      ) : null}

      {message ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {message}
        </div>
      ) : null}

      <section className="dashboard-setup-card rounded-[1.35rem] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Complete your setup</p>
            <h2 className="mt-1 text-lg font-semibold tracking-[-0.03em] text-slate-950">
              {completedSetupCount}/{setupItems.length} steps done
            </h2>
          </div>

          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            {setupProgress}%
          </span>
        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-emerald-600 transition-all"
            style={{ width: `${setupProgress}%` }}
          />
        </div>

        <div className="mt-4 grid gap-2">
          {setupItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-white"
            >
              <span className="inline-flex items-center gap-2">
                {item.done ? (
                  <CheckCircle2 size={17} className="text-emerald-600" />
                ) : (
                  <span className="grid h-[17px] w-[17px] place-items-center rounded-full border border-slate-300">
                    <Plus size={11} />
                  </span>
                )}
                {item.label}
              </span>

              <ArrowRight size={15} className="text-slate-400" />
            </Link>
          ))}
        </div>
      </section>

      <section className="dashboard-quick-actions">
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {quickActions.map((action) => {
            const Icon = action.icon;

            return (
              <Link
                key={action.href}
                href={action.href}
                className="grid min-h-[5.8rem] place-items-center gap-2 rounded-[1.2rem] border border-slate-200 bg-white p-3 text-center text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5"
              >
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
                  <Icon size={20} />
                </span>
                {action.label}
              </Link>
            );
          })}
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {statCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.label}
              className="dashboard-metric-card rounded-[1.2rem] border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-2xl bg-slate-50 text-slate-700">
                  <Icon size={17} />
                </span>

                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                  {card.label}
                </span>
              </div>

              <AnimatedNumber
                value={card.value}
                prefix={card.prefix || ""}
                compact={card.label === "Revenue"}
                className="mt-4 block truncate text-2xl font-semibold tracking-[-0.04em] text-slate-950"
              />
            </div>
          );
        })}
      </section>

      <section className="grid gap-5">
        <div className="rounded-[1.5rem] border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-4 border-b border-slate-200 p-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Recent Orders
              </p>

              <h3 className="mt-1 text-sm font-semibold tracking-[-0.03em] text-slate-950">
                Customer Activity
              </h3>
            </div>

            <Link
              href="/dashboard/orders"
              className="inline-flex items-center gap-2 rounded-full bg-[#26143d] px-4 py-2.5 text-xs font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
            >
              Orders
              <ArrowRight size={14} />
            </Link>
          </div>

          {orders.length > 0 ? (
            <div>
              {orders.map((order, index) => (
                <div
                  key={order.id}
                  className={`grid gap-3 p-4 md:grid-cols-[1fr_auto] md:items-center ${
                    index === 0 ? "" : "border-t border-slate-100"
                  }`}
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-950">
                      {order.customer_name || "Customer order"}
                    </p>

                    {order.created_at ? (
                      <p className="mt-1 text-xs text-slate-400">
                        {formatDate(order.created_at)}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-3 md:justify-end">
                    <span className="text-sm font-semibold text-slate-950">
                      {formatCurrency(getOrderAmount(order))}
                    </span>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ring-1 ${getStatusStyle(
                        order.status,
                      )}`}
                    >
                      {formatStatus(order.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
                <ShoppingBag size={18} />
              </div>

              <p className="mt-4 text-sm font-semibold text-slate-950">
                No customer activity yet
              </p>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                Share your store link and customer inquiries will become easier
                to track here.
              </p>

              <button
                type="button"
                onClick={handleCopyStoreLink}
                className="mt-5 inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5"
              >
                <Send size={16} />
                Share store link
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}


