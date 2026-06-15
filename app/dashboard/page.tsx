"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Boxes,
  Clock3,
  ExternalLink,
  Globe2,
  Loader2,
  Package,
  ShoppingBag,
  Sparkles,
  Store,
  UserRound,
  Wallet,
} from "lucide-react";
import {
  getMyBusinesses,
  getProductsByBusinessId,
  getServicesByBusinessId,
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
  const [servicesCount, setServicesCount] = useState(0);
  const [orders, setOrders] = useState<DashboardOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false);
  const [message, setMessage] = useState("");

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
      services: servicesCount,
    };
  }, [orders, productsCount, servicesCount]);

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
      const [products, services, orderResponse] = await Promise.all([
        getProductsByBusinessId(businessId),
        getServicesByBusinessId(businessId),
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
      setServicesCount(services.length);
      setOrders((orderResponse.data || []) as DashboardOrder[]);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unable to load dashboard.";

      setMessage(errorMessage);
    } finally {
      setIsLoadingMetrics(false);
    }
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
      setServicesCount(0);
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
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-slate-950 text-white">
          <Sparkles size={20} />
        </div>

        <h2 className="mt-5 text-xl font-semibold tracking-[-0.04em] text-slate-950">
          Create your first business page
        </h2>

        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
          Set up your storefront, add products or services, and publish your
          page.
        </p>

        <Link
          href="/dashboard/onboarding"
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
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
    {
      label: "Services",
      value: metrics.services,
      icon: Boxes,
    },
  ];

  const quickActions = [
    {
      label: "Add Products",
      href: "/dashboard/products",
      icon: Package,
    },
    {
      label: "Add Services",
      href: "/dashboard/services",
      icon: Boxes,
    },
    {
      label: "Edit Profile",
      href: "/dashboard/profile",
      icon: UserRound,
    },
    {
      label: "Billing",
      href: "/dashboard/billing",
      icon: Wallet,
    },
    {
      label: "Custom Domain",
      href: "/dashboard/domain",
      icon: Globe2,
    },
  ];

  return (
    <div className="grid gap-5">
      <section className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-4 xl:grid-cols-[1fr_auto] xl:items-center">
          <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
            <select
              value={selectedBusinessId}
              onChange={(event) => setSelectedBusinessId(event.target.value)}
              className="min-h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 outline-none transition focus:border-[#8b4dff] focus:ring-4 focus:ring-slate-100 md:min-w-72"
            >
              {businesses.map((business) => (
                <option key={business.id} value={business.id}>
                  {business.name} - /store/{business.slug}
                </option>
              ))}
            </select>

            {selectedBusiness?.slug ? (
              <Link
                href={`/store/${selectedBusiness.slug}`}
                target="_blank"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-slate-950 px-5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800"
              >
                View Store
                <ExternalLink size={16} />
              </Link>
            ) : null}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-2xl bg-slate-50 px-3 py-2.5">
              <p className="text-xs text-slate-500">Store</p>
              <p className="mt-1 text-sm font-semibold text-slate-950">
                {selectedBusiness?.is_published ? "Live" : "Draft"}
              </p>
            </div>

            <div className="rounded-2xl bg-teal-50 px-3 py-2.5">
              <p className="text-xs text-teal-700">Plan</p>
              <p className="mt-1 truncate text-sm font-semibold text-teal-950">
                {selectedBusiness?.subscription_plan || "Starter"}
              </p>
            </div>

            <div className="rounded-2xl bg-purple-50 px-3 py-2.5">
              <p className="text-xs text-purple-700">Status</p>
              <p className="mt-1 truncate text-sm font-semibold text-white">
                {selectedBusiness?.subscription_status || "Trial"}
              </p>
            </div>
          </div>
        </div>
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

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {statCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.label}
              className="premium-card-hover rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-950 text-white">
                  <Icon size={17} />
                </span>

                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                  {card.label}
                </span>
              </div>

              <AnimatedNumber
                value={card.value}
                prefix={card.prefix || ""}
                compact={card.label === "Revenue"}
                className="mt-5 block truncate text-2xl font-semibold tracking-[-0.04em] text-slate-950"
              />
            </div>
          );
        })}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[1.5rem] border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-4 border-b border-slate-200 p-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Recent Orders
              </p>

              <h3 className="mt-1 text-lg font-semibold tracking-[-0.03em] text-slate-950">
                Customer Activity
              </h3>
            </div>

            <Link
              href="/dashboard/orders"
              className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2.5 text-xs font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
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
              <div className="mx-auto grid h-11 w-11 place-items-center rounded-2xl bg-slate-100 text-slate-500">
                <ShoppingBag size={18} />
              </div>

              <p className="mt-4 text-sm font-semibold text-slate-950">
                No orders yet
              </p>
            </div>
          )}
        </div>

        <div className="grid content-start gap-5">
          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-950 p-4 text-white shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/40">
                  Store Status
                </p>

                <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em]">
                  {selectedBusiness?.name}
                </h3>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  selectedBusiness?.is_published
                    ? "bg-emerald-400/15 text-emerald-200 ring-1 ring-emerald-300/25"
                    : "bg-purple-400/15 text-purple-200 ring-1 ring-purple-300/25"
                }`}
              >
                {selectedBusiness?.is_published ? "Published" : "Draft"}
              </span>
            </div>

            <div className="mt-5 grid gap-2">
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3">
                <span className="text-sm text-white/55">Plan</span>
                <span className="text-sm font-semibold capitalize">
                  {selectedBusiness?.subscription_plan || "Starter"}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3">
                <span className="text-sm text-white/55">Subscription</span>
                <span className="text-sm font-semibold capitalize">
                  {selectedBusiness?.subscription_status || "Trial"}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
              Quick Actions
            </p>

            <div className="mt-4 grid gap-2">
              {quickActions.map((action) => {
                const Icon = action.icon;

                return (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-950 hover:text-slate-950"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Icon size={16} />
                      {action.label}
                    </span>

                    <ArrowRight size={15} />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
