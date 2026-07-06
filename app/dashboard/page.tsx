"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  Globe2,
  Loader2,
  Package,
  Palette,
  Plus,
  ShoppingBag,
  Store,
  UsersRound,
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
  is_published?: boolean | null;
  subscription_plan?: string | null;
  subscription_status?: string | null;
  theme_id?: string | null;
  logo_url?: string | null;
  cover_image_url?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  location?: string | null;
  custom_domain?: string | null;
};

type DashboardProduct = {
  id: string;
  is_published?: boolean | null;
  is_available?: boolean | null;
};

type DashboardOrder = {
  id: string;
  customer_name?: string | null;
  customer_phone?: string | null;
  total_amount?: number | null;
  created_at?: string | null;
};

type DashboardMetrics = {
  products: number;
  orders: number;
  customers: number;
  revenue: number;
};

const emptyMetrics: DashboardMetrics = {
  products: 0,
  orders: 0,
  customers: 0,
  revenue: 0,
};

function titleCase(value?: string | null) {
  if (!value) return "Not set";

  return value
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getStoreUrl(business?: DashboardBusiness) {
  if (!business?.slug) return "";
  return business.custom_domain || `/store/${business.slug}`;
}

function getStoreHref(business?: DashboardBusiness) {
  if (!business?.slug) return "/dashboard/onboarding";
  if (business.custom_domain?.startsWith("http")) return business.custom_domain;
  if (business.custom_domain) return `https://${business.custom_domain}`;
  return `/store/${business.slug}`;
}

export default function DashboardPage() {
  const [businesses, setBusinesses] = useState<DashboardBusiness[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [metrics, setMetrics] = useState<DashboardMetrics>(emptyMetrics);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false);
  const [message, setMessage] = useState("");

  const selectedBusiness = useMemo(() => {
    return businesses.find((business) => business.id === selectedBusinessId);
  }, [businesses, selectedBusinessId]);

  const storeStatus = selectedBusiness?.is_published ? "Published" : "Unpublished";
  const storeUrl = getStoreUrl(selectedBusiness);
  const storeHref = getStoreHref(selectedBusiness);

  const setupItems = useMemo(() => {
    if (!selectedBusiness) return [];

    return [
      {
        label: "Business name added",
        href: "/dashboard/store-details",
        done: Boolean(selectedBusiness.name),
      },
      {
        label: "Logo added",
        href: "/dashboard/store-details",
        done: Boolean(selectedBusiness.logo_url),
      },
      {
        label: "Banner added",
        href: "/dashboard/store-details",
        done: Boolean(selectedBusiness.cover_image_url),
      },
      {
        label: "WhatsApp number added",
        href: "/dashboard/store-details",
        done: Boolean(selectedBusiness.whatsapp || selectedBusiness.phone),
      },
      {
        label: "At least one product/service added",
        href: "/dashboard/products",
        done: metrics.products > 0,
      },
      {
        label: "Theme selected",
        href: "/dashboard/theme-store",
        done: Boolean(selectedBusiness.theme_id),
      },
      {
        label: "Store published",
        href: "/dashboard/visibility",
        done: Boolean(selectedBusiness.is_published),
      },
    ];
  }, [metrics.products, selectedBusiness]);

  const completedSetupCount = setupItems.filter((item) => item.done).length;
  const setupProgress = setupItems.length
    ? Math.round((completedSetupCount / setupItems.length) * 100)
    : 0;

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
      const products = (await getProductsByBusinessId(
        businessId,
      )) as DashboardProduct[];

      const liveProducts = products.filter((product) => {
        return product.is_published !== false && product.is_available !== false;
      });

      let orders: DashboardOrder[] = [];

      const orderResponse = await supabase
        .from("orders")
        .select("id,customer_name,customer_phone,total_amount,created_at")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false })
        .limit(100);

      if (!orderResponse.error) {
        orders = (orderResponse.data || []) as DashboardOrder[];
      }

      const customerKeys = new Set(
        orders
          .map((order) => order.customer_phone || order.customer_name)
          .filter(Boolean),
      );

      setMetrics({
        products: liveProducts.length,
        orders: orders.length,
        customers: customerKeys.size,
        revenue: orders.reduce(
          (sum, order) => sum + Number(order.total_amount || 0),
          0,
        ),
      });
    } catch (error) {
      setMetrics(emptyMetrics);
      setMessage(
        error instanceof Error ? error.message : "Unable to load dashboard.",
      );
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
        setMessage(
          error instanceof Error
            ? error.message
            : "Unable to load your dashboard.",
        );
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    loadPage();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedBusinessId) {
      setMetrics(emptyMetrics);
      return;
    }

    loadMetrics(selectedBusinessId);
  }, [selectedBusinessId]);

  if (isLoading) {
    return (
      <main className="grid min-h-[60vh] place-items-center">
        <div className="rounded-3xl border border-[#eadfff] bg-white p-6">
          <Loader2 className="animate-spin text-[#7c3aed]" size={24} />
        </div>
      </main>
    );
  }

  if (businesses.length === 0) {
    return (
      <section className="mx-auto grid max-w-xl gap-4 rounded-3xl border border-[#eadfff] bg-white p-6 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#f1eaff] text-[#7c3aed]">
          <Store size={22} />
        </div>
        <h1 className="text-2xl font-black tracking-[-0.045em] text-[#241436]">
          Set up your first storefront.
        </h1>
        <Link
          href="/dashboard/onboarding"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-[#241436] px-5 text-sm font-black text-white"
        >
          Start Setup
          <ArrowRight size={16} />
        </Link>
      </section>
    );
  }

  const metricCards = [
    {
      label: "Active products/services",
      value: metrics.products,
      icon: Package,
    },
    {
      label: "Orders",
      value: metrics.orders,
      icon: ShoppingBag,
    },
    {
      label: "Customers",
      value: metrics.customers,
      icon: UsersRound,
    },
    {
      label: "Estimated revenue",
      value: formatCurrency(metrics.revenue),
      icon: CreditCard,
    },
  ];

  const quickActions = [
    {
      label: "Add Product/Service",
      href: "/dashboard/products",
      icon: Plus,
    },
    {
      label: "Edit Storefront",
      href: "/dashboard/store-details",
      icon: Store,
    },
    {
      label: "Customize Theme",
      href: "/dashboard/theme-store",
      icon: Palette,
    },
    {
      label: "View Storefront",
      href: storeHref,
      icon: ExternalLink,
      external: true,
    },
    {
      label: "Request Domain",
      href: "/dashboard/domain",
      icon: Globe2,
    },
    {
      label: "Billing",
      href: "/dashboard/billing",
      icon: CreditCard,
    },
  ];

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-4 text-[#241436]">
      <section className="grid gap-3 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-3xl border border-[#eadfff] bg-gradient-to-br from-white via-[#fffcf6] to-[#f5efff] p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#7c3aed]">
                Store control center
              </p>
              <h1 className="mt-2 truncate text-2xl font-black tracking-[-0.055em] text-[#241436] md:text-3xl">
                {selectedBusiness?.name || "Market Villa"}
              </h1>
              <div className="mt-3 flex flex-wrap gap-2">
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-black ${
                    selectedBusiness?.is_published
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-amber-200 bg-amber-50 text-amber-700"
                  }`}
                >
                  {storeStatus}
                </span>
                <span className="rounded-full border border-[#eadfff] bg-white px-3 py-1 text-xs font-black text-[#5f536f]">
                  {titleCase(selectedBusiness?.subscription_plan)}
                </span>
                <span className="rounded-full border border-[#eadfff] bg-white px-3 py-1 text-xs font-black text-[#5f536f]">
                  {titleCase(selectedBusiness?.subscription_status)}
                </span>
              </div>
            </div>

            {businesses.length > 1 ? (
              <select
                value={selectedBusinessId}
                onChange={(event) => setSelectedBusinessId(event.target.value)}
                className="min-h-11 rounded-2xl border border-[#eadfff] bg-white px-4 text-sm font-bold text-[#241436] outline-none focus:border-[#7c3aed] focus:ring-4 focus:ring-[#7c3aed]/10"
              >
                {businesses.map((business) => (
                  <option key={business.id} value={business.id}>
                    {business.name} - /store/{business.slug}
                  </option>
                ))}
              </select>
            ) : null}
          </div>

          <div className="mt-5 rounded-2xl border border-[#eadfff] bg-white/80 p-3">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#7c3aed]">
              Store URL
            </p>
            <p className="mt-1 break-all text-sm font-bold text-[#241436]">
              {storeUrl || "Not available"}
            </p>
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Link
              href={storeHref}
              target={selectedBusiness?.slug ? "_blank" : undefined}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-[#241436] px-5 text-sm font-black text-white"
            >
              View Storefront
              <ExternalLink size={16} />
            </Link>
            <Link
              href="/dashboard/storefront"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-[#d8c9f8] bg-white px-5 text-sm font-black text-[#241436]"
            >
              Edit Storefront
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-[#eadfff] bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#7c3aed]">
                Setup progress
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-[-0.05em]">
                {setupProgress}%
              </h2>
            </div>
            {isLoadingMetrics ? (
              <Loader2 className="animate-spin text-[#7c3aed]" size={20} />
            ) : null}
          </div>
          <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-[#eee6ff]">
            <div
              className="h-full rounded-full bg-[#7c3aed] transition-all"
              style={{ width: `${setupProgress}%` }}
            />
          </div>
          <p className="mt-3 text-sm font-bold text-[#6f627d]">
            {completedSetupCount}/{setupItems.length} complete
          </p>
        </div>
      </section>

      {message ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
          {message}
        </div>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((metric) => {
          const Icon = metric.icon;

          return (
            <div
              key={metric.label}
              className="rounded-3xl border border-[#eadfff] bg-white p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#f4edff] text-[#7c3aed]">
                  <Icon size={18} />
                </span>
              </div>
              <p className="mt-4 text-xs font-black uppercase tracking-[0.12em] text-[#7c3aed]">
                {metric.label}
              </p>
              <p className="mt-2 text-2xl font-black tracking-[-0.05em] text-[#241436]">
                {metric.value}
              </p>
            </div>
          );
        })}
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-3xl border border-[#eadfff] bg-white p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-black tracking-[-0.04em]">
              Store setup checklist
            </h2>
            <span className="rounded-full bg-[#f4edff] px-3 py-1 text-xs font-black text-[#7c3aed]">
              {setupProgress}%
            </span>
          </div>

          <div className="grid gap-2">
            {setupItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex min-h-11 items-center justify-between rounded-2xl border border-[#eadfff] bg-[#faf8ff] px-3 py-2 text-sm font-black text-[#241436]"
              >
                <span className="inline-flex min-w-0 items-center gap-2">
                  {item.done ? (
                    <CheckCircle2
                      size={17}
                      className="shrink-0 text-emerald-600"
                    />
                  ) : (
                    <span className="grid h-[17px] w-[17px] shrink-0 place-items-center rounded-full border border-[#c9b7ef] text-[#7c3aed]">
                      <Plus size={11} />
                    </span>
                  )}
                  <span className="truncate">{item.label}</span>
                </span>
                {!item.done ? (
                  <ArrowRight size={14} className="shrink-0 text-[#7c3aed]" />
                ) : null}
              </Link>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-3xl border border-[#eadfff] bg-white p-5">
            <h2 className="text-lg font-black tracking-[-0.04em]">
              Quick actions
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-3">
              {quickActions.map((action) => {
                const Icon = action.icon;

                return (
                  <Link
                    key={action.label}
                    href={action.href}
                    target={action.external && selectedBusiness?.slug ? "_blank" : undefined}
                    className="grid min-h-[5.8rem] place-items-center gap-2 rounded-2xl border border-[#eadfff] bg-[#faf8ff] p-3 text-center text-xs font-black text-[#241436] transition hover:border-[#d8c9f8] hover:bg-white"
                  >
                    <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-[#7c3aed]">
                      <Icon size={18} />
                    </span>
                    {action.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-[#eadfff] bg-white p-5">
            <h2 className="text-lg font-black tracking-[-0.04em]">
              Recent activity
            </h2>
            <div className="mt-4 rounded-2xl border border-dashed border-[#d8c9f8] bg-[#faf8ff] p-5 text-center">
              <p className="text-sm font-black text-[#241436]">
                No activity yet.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
