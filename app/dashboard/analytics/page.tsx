"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Boxes,
  CheckCircle2,
  Clock3,
  Loader2,
  ShoppingBag,
  Wallet,
} from "lucide-react";
import {
  getMyBusinesses,
  getProductsByBusinessId,
} from "@/lib/business-actions";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";

type DashboardBusiness = {
  id: string;
  name: string;
  slug: string;
  subscription_plan?: string | null;
  subscription_status?: string | null;
  is_published?: boolean | null;
};

type DashboardOrder = {
  id: string;
  business_id: string;
  customer_name?: string | null;
  customer_phone?: string | null;
  customer_location?: string | null;
  status?: string | null;
  total_amount?: number | null;
  total?: number | null;
  order_total?: number | null;
  created_at?: string | null;
};

type DashboardProduct = {
  id: string;
};

function getOrderAmount(order: DashboardOrder) {
  return Number(order.total_amount || order.total || order.order_total || 0);
}

function isPendingStatus(status?: string | null) {
  const cleanStatus = String(status || "").toLowerCase();

  return (
    !cleanStatus ||
    cleanStatus === "pending" ||
    cleanStatus === "started" ||
    cleanStatus === "new"
  );
}

function isCompletedStatus(status?: string | null) {
  const cleanStatus = String(status || "").toLowerCase();

  return (
    cleanStatus === "delivered" ||
    cleanStatus === "completed" ||
    cleanStatus === "complete" ||
    cleanStatus === "fulfilled"
  );
}

function formatDate(value?: string | null) {
  if (!value) return "No date";

  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function AnalyticsPage() {
  const [businesses, setBusinesses] = useState<DashboardBusiness[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState("");

  const [orders, setOrders] = useState<DashboardOrder[]>([]);
  const [products, setProducts] = useState<DashboardProduct[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false);
  const [message, setMessage] = useState("");

  const selectedBusiness = useMemo(() => {
    return businesses.find((business) => business.id === selectedBusinessId);
  }, [businesses, selectedBusinessId]);

  const metrics = useMemo(() => {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter((order) =>
      isPendingStatus(order.status)
    ).length;
    const completedOrders = orders.filter((order) =>
      isCompletedStatus(order.status)
    ).length;
    const revenue = orders.reduce((sum, order) => sum + getOrderAmount(order), 0);

    return {
      totalOrders,
      pendingOrders,
      completedOrders,
      revenue,
      products: products.length,
    };
  }, [orders, products.length]);

  async function loadBusinesses() {
    const businessItems = await getMyBusinesses();

    setBusinesses(businessItems);

    if (businessItems.length > 0) {
      setSelectedBusinessId((current) => current || businessItems[0].id);
    }
  }

  async function loadMetrics(businessId: string) {
    setIsLoadingMetrics(true);
    setMessage("");

    try {
      const [productItems, orderResponse] = await Promise.all([
        getProductsByBusinessId(businessId),
        supabase
          .from("orders")
          .select("*")
          .eq("business_id", businessId)
          .order("created_at", { ascending: false }),
      ]);

      if (orderResponse.error) {
        throw orderResponse.error;
      }

      setProducts(productItems);
      setOrders((orderResponse.data || []) as DashboardOrder[]);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unable to load analytics.";

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
            : "Unable to load your businesses.";

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
      setOrders([]);
      setProducts([]);
      return;
    }

    loadMetrics(selectedBusinessId);
  }, [selectedBusinessId]);

  if (isLoading) {
    return (
      <main className="grid min-h-[60vh] place-items-center">
        <div className="border border-slate-200 bg-white p-8 text-center shadow-sm">
          <Loader2 className="mx-auto animate-spin text-slate-950" size={28} />
          <p className="mt-4 text-sm text-slate-500">
            Loading analytics...
          </p>
        </div>
      </main>
    );
  }

  if (businesses.length === 0) {
    return (
      <section className="border border-purple-200 bg-purple-50 p-8 text-center">
        <h2 className="text-2xl font-semibold tracking-[-0.04em] text-purple-950">
          Create your business page first
        </h2>

        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-purple-900">
          Analytics will become available once you create and publish a business
          page.
        </p>

        <Link
          href="/dashboard/onboarding"
          className="mt-6 inline-flex bg-purple-300 px-4 py-2.5 text-sm font-semibold text-purple-950 hover:bg-purple-200"
        >
          Start Onboarding
        </Link>
      </section>
    );
  }

  const statCards = [
    {
      label: "Revenue tracked",
      value: formatCurrency(metrics.revenue),
      icon: Wallet,
    },
    {
      label: "Total orders",
      value: metrics.totalOrders.toString(),
      icon: ShoppingBag,
    },
    {
      label: "Pending orders",
      value: metrics.pendingOrders.toString(),
      icon: Clock3,
    },
    {
      label: "Completed orders",
      value: metrics.completedOrders.toString(),
      icon: CheckCircle2,
    },
    {
      label: "Products",
      value: metrics.products.toString(),
      icon: Boxes,
    },
  ];

  return (
    <div className="grid gap-6">
      <section className="border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
              Analytics
            </p>

            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-950">
              Business performance
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
              Track orders, revenue, products and recent customer activity.
            </p>
          </div>

          <select
            value={selectedBusinessId}
            onChange={(event) => setSelectedBusinessId(event.target.value)}
            className="border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[var(--mv-violet)] md:min-w-80"
          >
            {businesses.map((business) => (
              <option key={business.id} value={business.id}>
                  {business.name} — /store/{business.slug}
              </option>
            ))}
          </select>
        </div>
      </section>

      {message ? (
        <div className="border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {message}
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {statCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.label}
              className="border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="mb-8 flex items-center justify-between">
                <span className="grid h-11 w-11 place-items-center bg-[#26143d] text-white">
                  <Icon size={19} />
                </span>

                {isLoadingMetrics ? (
                  <Loader2 size={17} className="animate-spin text-slate-400" />
                ) : null}
              </div>

              <p className="text-sm text-slate-500">{card.label}</p>

              <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-950">
                {card.value}
              </p>
            </div>
          );
        })}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_0.85fr]">
        <div className="border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
                Recent orders
              </p>

              <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-950">
                Latest customer activity
              </h3>
            </div>

            <Link
              href="/dashboard/orders"
              className="inline-flex items-center gap-2 bg-[#26143d] px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
            >
              View orders
              <ArrowRight size={16} />
            </Link>
          </div>

          {orders.length > 0 ? (
            <div className="overflow-hidden border border-slate-200">
              {orders.slice(0, 8).map((order, index) => (
                <div
                  key={order.id}
                  className={`grid gap-3 p-4 md:grid-cols-[1fr_auto] md:items-center ${
                    index === 0 ? "" : "border-t border-slate-200"
                  }`}
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-950">
                      {order.customer_name || "Customer"}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {formatDate(order.created_at)}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 md:justify-end">
                    <span className="text-sm font-semibold text-slate-950">
                      {formatCurrency(getOrderAmount(order))}
                    </span>

                    <span className="bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-600">
                      {order.status || "pending"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <BarChart3 className="mx-auto text-slate-400" size={28} />
              <p className="mt-3 text-sm font-semibold text-slate-950">
                No orders yet
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Once customers start ordering, recent activity will appear here.
              </p>
            </div>
          )}
        </div>

        <aside className="border border-slate-200 bg-[#26143d] p-6 text-white shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
            Quick insight
          </p>

          <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">
            {selectedBusiness?.name || "Your business"}
          </h3>

          <div className="mt-6 grid gap-3">
            <div className="bg-white/5 p-4 ring-1 ring-white/10">
              <p className="text-xs text-white/50">Store status</p>
              <p className="mt-1 text-sm font-semibold">
                {selectedBusiness?.is_published ? "Published" : "Draft"}
              </p>
            </div>

            <div className="bg-white/5 p-4 ring-1 ring-white/10">
              <p className="text-xs text-white/50">Current plan</p>
              <p className="mt-1 text-sm font-semibold capitalize">
                {selectedBusiness?.subscription_plan || "starter"}
              </p>
            </div>

            <div className="bg-white/5 p-4 ring-1 ring-white/10">
              <p className="text-xs text-white/50">Subscription</p>
              <p className="mt-1 text-sm font-semibold capitalize">
                {selectedBusiness?.subscription_status || "trial"}
              </p>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}

