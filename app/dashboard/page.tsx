"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Boxes,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Globe2,
  Loader2,
  Palette,
  Settings,
  Sparkles,
  Store,
} from "lucide-react";
import {
  getMyBusinesses,
  getProductsByBusinessId,
  getServicesByBusinessId,
} from "@/lib/business-actions";

type DashboardBusiness = {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  location: string | null;
  theme_id: string;
  is_published: boolean;
  custom_domain: string | null;
  custom_domain_status: string;
  subscription_plan: string;
  subscription_status: string;
};

type DashboardProduct = {
  id: string;
};

type DashboardService = {
  id: string;
};

const plans = [
  {
    id: "starter",
    name: "Starter",
    price: "â‚¦10,000",
    note: "monthly",
  },
  {
    id: "growth",
    name: "Growth",
    price: "â‚¦20,000",
    note: "monthly",
  },
  {
    id: "pro",
    name: "Pro",
    price: "â‚¦30,000",
    note: "monthly",
  },
];

const managementRows = [
  {
    title: "Business Profile",
    description: "Edit business name, slug, contact info, cover image, and location.",
    href: "/dashboard/profile",
    icon: Store,
  },
  {
    title: "Products",
    description: "Add, edit, hide, delete, and upload compressed product images.",
    href: "/dashboard/products",
    icon: Boxes,
  },
  {
    title: "Services",
    description: "Manage bookings, service offers, consultations, and quote requests.",
    href: "/dashboard/services",
    icon: Sparkles,
  },
  {
    title: "Theme",
    description: "Choose the visual style for the public business page.",
    href: "/dashboard/theme",
    icon: Palette,
  },
  {
    title: "Orders",
    description: "View customer orders, order items, totals, and update order status.",
    href: "/dashboard/orders",
    icon: ClipboardList,
  },
  {
    title: "Custom Domain",
    description: "Request a professional domain name for this business.",
    href: "/dashboard/domain",
    icon: Globe2,
  },
  {
    title: "Settings",
    description: "View plan status, domain add-on, and subscription details.",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export default function DashboardPage() {
  const [businesses, setBusinesses] = useState<DashboardBusiness[]>([]);
  const [products, setProducts] = useState<DashboardProduct[]>([]);
  const [services, setServices] = useState<DashboardService[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [openRows, setOpenRows] = useState<Record<string, boolean>>({
    "Business Profile": true,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  const selectedBusiness = useMemo(() => {
    return businesses.find((business) => business.id === selectedBusinessId);
  }, [businesses, selectedBusinessId]);

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      try {
        setIsLoading(true);

        const businessItems = await getMyBusinesses();

        if (!mounted) return;

        setBusinesses(businessItems);

        if (businessItems.length > 0) {
          setSelectedBusinessId(businessItems[0].id);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unable to load dashboard.";
        setMessage(errorMessage);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadBusinessItems() {
      if (!selectedBusinessId) {
        setProducts([]);
        setServices([]);
        return;
      }

      try {
        const [productItems, serviceItems] = await Promise.all([
          getProductsByBusinessId(selectedBusinessId),
          getServicesByBusinessId(selectedBusinessId),
        ]);

        if (!mounted) return;

        setProducts(productItems);
        setServices(serviceItems);
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Unable to load business items.";
        setMessage(errorMessage);
      }
    }

    loadBusinessItems();

    return () => {
      mounted = false;
    };
  }, [selectedBusinessId]);

  function toggleRow(title: string) {
    setOpenRows((current) => ({
      ...current,
      [title]: !current[title],
    }));
  }

  const setupItems = [
    {
      label: "Business profile created",
      description: "Your business information has been saved.",
      done: Boolean(selectedBusiness),
      href: "/dashboard/profile",
    },
    {
      label: "Store theme selected",
      description: "Your business has a storefront style.",
      done: Boolean(selectedBusiness?.theme_id),
      href: "/dashboard/theme",
    },
    {
      label: "Products added",
      description: "Add at least one product customers can order.",
      done: products.length > 0,
      href: "/dashboard/products",
    },
    {
      label: "Services added",
      description: "Optional, but useful for bookings and inquiries.",
      done: services.length > 0,
      href: "/dashboard/services",
    },
    {
      label: "Custom domain requested",
      description: "Optional paid add-on for serious businesses.",
      done:
        Boolean(selectedBusiness?.custom_domain) ||
        selectedBusiness?.custom_domain_status === "pending",
      href: "/dashboard/domain",
    },
  ];

  const completedSetup = setupItems.filter((item) => item.done).length;
  const setupPercent = Math.round((completedSetup / setupItems.length) * 100);

  if (isLoading) {
    return (
      <main className="grid min-h-[60vh] place-items-center">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm">
          <Loader2 className="mx-auto animate-spin text-slate-950" size={28} />
          <p className="mt-4 text-sm text-slate-500">
            Loading your Market Villa dashboard...
          </p>
        </div>
      </main>
    );
  }

  if (businesses.length === 0) {
    return (
      <div className="grid gap-8">
        <section className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">
            Welcome to Market Villa
          </p>

          <h2 className="mt-3 max-w-3xl text-4xl font-semibold tracking-[-0.05em] text-slate-950">
            Create your first business page.
          </h2>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500">
            Set up your business details, choose a theme, add products and
            services, then share your Market Villa page with customers.
          </p>

          <div className="mt-7">
            <Link
              href="/dashboard/onboarding"
              className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-500"
            >
              Start Onboarding
              <ArrowRight size={17} />
            </Link>
          </div>
        </section>

        {message ? (
          <div className="rounded-2xl bg-white p-4 text-sm text-slate-700 shadow-sm">
            {message}
          </div>
        ) : null}
      </div>
    );
  }

  const currentPlan =
    plans.find((plan) => plan.id === selectedBusiness?.subscription_plan) ||
    plans[0];

  return (
    <div className="grid gap-6">
      <section className="grid gap-5 xl:grid-cols-[1fr_0.95fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">
                Market Villa
              </p>

              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-slate-950 md:text-4xl">
                Mini websites for businesses.
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
                Manage your storefront, products, services, orders, custom
                domain, and subscription from one simple dashboard.
              </p>
            </div>

            <Link
              href={
                selectedBusiness
                  ? `/store/${selectedBusiness.slug}`
                  : "/dashboard/onboarding"
              }
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-500"
            >
              Preview Store
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {plans.map((plan) => {
              const active = plan.id === currentPlan.id;

              return (
                <div
                  key={plan.id}
                  className={`rounded-[1.25rem] border p-4 ${
                    active
                      ? "border-slate-950 bg-slate-950 text-white"
                      : "border-slate-200 bg-[#f8fbfc] text-slate-950"
                  }`}
                >
                  <p
                    className={`text-sm font-semibold ${
                      active ? "text-white" : "text-slate-600"
                    }`}
                  >
                    {plan.name}
                  </p>

                  <p className="mt-3 text-2xl font-semibold tracking-[-0.05em]">
                    {plan.price}
                    <span
                      className={`ml-1 text-xs font-medium ${
                        active ? "text-slate-300" : "text-slate-400"
                      }`}
                    >
                      /{plan.note}
                    </span>
                  </p>

                  {active ? (
                    <p className="mt-3 rounded-full bg-emerald-300 px-3 py-1 text-center text-xs font-semibold text-slate-950">
                      Active plan
                    </p>
                  ) : (
                    <Link
                      href="/dashboard/settings"
                      className="mt-3 block rounded-full bg-white px-3 py-1 text-center text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                    >
                      View upgrade
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-5">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">
                Active Business
              </p>

              <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-950">
                {selectedBusiness?.name}
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                /store/{selectedBusiness?.slug}
              </p>
            </div>

            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                selectedBusiness?.is_published
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-amber-50 text-amber-700"
              }`}
            >
              {selectedBusiness?.is_published ? "Live" : "Draft"}
            </span>
          </div>

          <div className="mt-5">
            <select
              value={selectedBusinessId}
              onChange={(event) => setSelectedBusinessId(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-[#f8fbfc] px-4 py-4 text-sm outline-none focus:border-slate-950"
            >
              {businesses.map((business) => (
                <option key={business.id} value={business.id}>
                  {business.name} â€” /store/{business.slug}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <div className="rounded-[1.25rem] bg-[#f8fbfc] p-4">
              <p className="text-xs font-medium text-slate-500">Products</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">
                {products.length}
              </p>
            </div>

            <div className="rounded-[1.25rem] bg-[#f8fbfc] p-4">
              <p className="text-xs font-medium text-slate-500">Services</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">
                {services.length}
              </p>
            </div>

            <div className="rounded-[1.25rem] bg-[#f8fbfc] p-4">
              <p className="text-xs font-medium text-slate-500">Domain</p>
              <p className="mt-2 truncate text-sm font-semibold capitalize text-slate-950">
                {selectedBusiness?.custom_domain_status || "none"}
              </p>
            </div>
          </div>

          <Link
            href="/dashboard/profile"
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Manage Business
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {message ? (
        <div className="rounded-2xl bg-white p-4 text-sm text-slate-700 shadow-sm">
          {message}
        </div>
      ) : null}

      <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">
                Onboarding
              </p>

              <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-950">
                Business setup
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Complete these steps to make the business page feel ready for
                customers.
              </p>
            </div>

            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              {setupPercent}%
            </span>
          </div>

          <div className="mb-6 h-3 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-emerald-600"
              style={{ width: `${setupPercent}%` }}
            />
          </div>

          <div className="grid gap-3">
            {setupItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-start justify-between gap-4 rounded-[1.25rem] border border-slate-200 bg-[#f8fbfc] p-4 hover:bg-white"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-950">
                    {item.label}
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {item.description}
                  </p>
                </div>

                {item.done ? (
                  <CheckCircle2 size={19} className="mt-1 text-emerald-600" />
                ) : (
                  <span className="mt-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                    Pending
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">
                Building
              </p>

              <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-950">
                Storefront control center
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Open each module to manage a specific part of the business
                website.
              </p>
            </div>
          </div>

          <div className="grid gap-3">
            {managementRows.map((row) => {
              const Icon = row.icon;
              const isOpen = Boolean(openRows[row.title]);

              return (
                <div
                  key={row.title}
                  className="overflow-hidden rounded-[1.25rem] border border-slate-200 bg-[#f8fbfc]"
                >
                  <button
                    type="button"
                    onClick={() => toggleRow(row.title)}
                    className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left hover:bg-white"
                  >
                    <span className="flex items-center gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-slate-700 ring-1 ring-slate-200">
                        <Icon size={18} />
                      </span>

                      <span>
                        <span className="block text-sm font-semibold text-slate-950">
                          {row.title}
                        </span>

                        <span className="mt-1 block text-xs text-slate-500">
                          {row.description}
                        </span>
                      </span>
                    </span>

                    <ChevronDown
                      size={18}
                      className={`shrink-0 text-slate-400 transition ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isOpen ? (
                    <div className="border-t border-slate-200 bg-white px-4 py-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <p className="text-sm leading-6 text-slate-500">
                          Continue managing {row.title.toLowerCase()} for{" "}
                          {selectedBusiness?.name}.
                        </p>

                        <Link
                          href={row.href}
                          className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-500"
                        >
                          Open
                          <ArrowRight size={16} />
                        </Link>
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid items-center gap-5 md:grid-cols-[1fr_auto]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">
              Next recommended step
            </p>

            <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-950">
              Add payment and subscription enforcement.
            </h3>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
              Market Villa already has businesses, products, services, orders,
              image uploads, and admin controls. Paystack subscriptions will
              make the platform ready for real paying businesses.
            </p>
          </div>

          <Link
            href="/dashboard/settings"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-4 text-sm font-semibold text-white hover:bg-slate-800"
          >
            View Plans
            <ArrowRight size={17} />
          </Link>
        </div>
      </section>
    </div>
  );
}
