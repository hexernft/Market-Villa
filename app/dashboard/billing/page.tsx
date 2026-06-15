"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import {
  getMyBusinesses,
  updateBusinessPublishStatus,
} from "@/lib/business-actions";
import { initializePlanPayment, verifyPlanPayment } from "@/lib/payment-actions";
import { supabase } from "@/lib/supabase";

type DashboardBusiness = {
  id: string;
  name: string;
  slug: string;
  is_published: boolean;
  custom_domain: string | null;
  custom_domain_status: string;
  subscription_plan: string;
  subscription_status: string;
};

type BillingPlan = {
  id: string;
  name: string;
  description: string;
  amount: number;
  amountInKobo: number;
  priceLabel: string;
  productLimit?: number | null;
  storeLimit?: number | null;
  sortOrder?: number | null;
};

const fallbackBillingPlans: BillingPlan[] = [
  {
    id: "starter",
    name: "Starter",
    description: "For small businesses starting online.",
    amount: 10000,
    amountInKobo: 1000000,
    priceLabel: "₦10,000/month",
    productLimit: 20,
    storeLimit: 1,
    sortOrder: 10,
  },
  {
    id: "growth",
    name: "Growth",
    description: "For growing businesses ready to sell more products.",
    amount: 20000,
    amountInKobo: 2000000,
    priceLabel: "₦20,000/month",
    productLimit: 100,
    storeLimit: 3,
    sortOrder: 20,
  },
  {
    id: "premium",
    name: "Premium",
    description:
      "For established businesses that need more stores, more products, and stronger visibility.",
    amount: 30000,
    amountInKobo: 3000000,
    priceLabel: "₦30,000/month",
    productLimit: 500,
    storeLimit: 10,
    sortOrder: 30,
  },
];

function formatNaira(amount: number) {
  return `₦${amount.toLocaleString()}`;
}

function normalizeSubscriptionPlan(plan: string | null | undefined) {
  const value = String(plan || "").toLowerCase();

  if (value === "basic") return "starter";
  if (value === "business") return "growth";
  if (value === "pro") return "premium";

  return value;
}

export default function BillingPage() {
  const searchParams = useSearchParams();

  const [businesses, setBusinesses] = useState<DashboardBusiness[]>([]);
  const [plans, setPlans] = useState<BillingPlan[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingPublishStatus, setIsUpdatingPublishStatus] = useState(false);
  const [payingPlanId, setPayingPlanId] = useState("");
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [verifiedReference, setVerifiedReference] = useState("");
  const [message, setMessage] = useState("");

  const selectedBusiness = useMemo(() => {
    return businesses.find((business) => business.id === selectedBusinessId);
  }, [businesses, selectedBusinessId]);

  const selectedBusinessPlanId = normalizeSubscriptionPlan(
    selectedBusiness?.subscription_plan
  );

  const currentPlan =
    plans.find((plan) => plan.id === selectedBusinessPlanId) ||
    plans.find((plan) => plan.id === "starter") ||
    plans[0] ||
    null;

  async function loadBillingData() {
    const items = await getMyBusinesses();

    setBusinesses(items);

    if (items.length > 0) {
      setSelectedBusinessId((current) => current || items[0].id);
    }

    const { data: pricingItems, error: pricingError } = await supabase
      .from("pricing_items")
      .select(
        "pricing_key,name,description,price_label,amount,amount_in_kobo,product_limit,store_limit,sort_order"
      )
      .eq("pricing_type", "subscription")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (pricingError) {
      console.error("Unable to load pricing items:", pricingError);
      setPlans(fallbackBillingPlans);
      return;
    }

    const mappedPlans: BillingPlan[] = (pricingItems || [])
      .filter((item: any) =>
        ["starter", "growth", "premium"].includes(String(item.pricing_key))
      )
      .map((item: any) => ({
        id: String(item.pricing_key),
        name: String(item.name || ""),
        description: String(item.description || ""),
        amount: Number(item.amount || 0),
        amountInKobo: Number(item.amount_in_kobo || 0),
        priceLabel: String(item.price_label || ""),
        productLimit: item.product_limit,
        storeLimit: item.store_limit,
        sortOrder: item.sort_order,
      }));

    setPlans(mappedPlans.length > 0 ? mappedPlans : fallbackBillingPlans);
  }

  useEffect(() => {
    let mounted = true;

    async function loadPage() {
      try {
        setIsLoading(true);
        setMessage("");

        await loadBillingData();

        if (!mounted) return;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unable to load billing.";

        if (mounted) {
          setMessage(errorMessage);
          setPlans(fallbackBillingPlans);
        }
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
    const reference = searchParams.get("payment_reference");

    if (!reference || verifiedReference === reference) {
      return;
    }

    const paymentReference = reference;

    async function verifyReturnedPayment() {
      setIsVerifyingPayment(true);
      setMessage("");

      try {
        const result = await verifyPlanPayment(paymentReference);

        setVerifiedReference(paymentReference);

        if (result.success) {
          await loadBillingData();
          setMessage("Payment verified successfully. Your plan is now active.");
        } else {
          setMessage(result.message || "Payment was not successful.");
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unable to verify payment.";

        setMessage(errorMessage);
      } finally {
        setIsVerifyingPayment(false);
      }
    }

    verifyReturnedPayment();
  }, [searchParams, verifiedReference]);

  async function handleTogglePublishStatus() {
    if (!selectedBusiness) return;

    setIsUpdatingPublishStatus(true);
    setMessage("");

    try {
      await updateBusinessPublishStatus({
        businessId: selectedBusiness.id,
        isPublished: !selectedBusiness.is_published,
      });

      await loadBillingData();

      setMessage(
        selectedBusiness.is_published
          ? "Business page unpublished successfully."
          : "Business page published successfully."
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unable to update publish status.";

      setMessage(errorMessage);
    } finally {
      setIsUpdatingPublishStatus(false);
    }
  }

  async function handlePayForPlan(planId: string) {
    if (!selectedBusiness) {
      setMessage("Select a business before paying for a plan.");
      return;
    }

    setPayingPlanId(planId);
    setMessage("");

    try {
      const payment = await initializePlanPayment({
        businessId: selectedBusiness.id,
        plan: planId as any,
      });

      window.location.href = payment.authorizationUrl;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unable to start payment.";

      setMessage(errorMessage);
    } finally {
      setPayingPlanId("");
    }
  }

  if (isLoading) {
    return (
      <main className="grid min-h-[60vh] place-items-center">
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 text-center shadow-sm">
          <Loader2 className="mx-auto animate-spin text-slate-950" size={24} />
          <p className="mt-3 text-sm text-slate-500">Loading billing...</p>
        </div>
      </main>
    );
  }

  if (businesses.length === 0) {
    return (
      <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-6 text-center">
        <p className="text-xl font-semibold tracking-[-0.04em] text-amber-950">
          Create your business page first
        </p>

        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-amber-900">
          Complete onboarding before managing billing.
        </p>

        <Link
          href="/dashboard/onboarding"
          className="mt-5 inline-flex rounded-full bg-amber-300 px-5 py-3 text-sm font-semibold text-amber-950 transition hover:-translate-y-0.5 hover:bg-amber-200"
        >
          Start Onboarding
        </Link>
      </div>
    );
  }

  const currentPlanAmount = currentPlan?.amount || 0;

  return (
    <div className="grid gap-5">
      <section className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-4 xl:grid-cols-[1fr_auto] xl:items-center">
          <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
            <select
              value={selectedBusinessId}
              onChange={(event) => setSelectedBusinessId(event.target.value)}
              className="min-h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 outline-none transition focus:border-[var(--mv-orange)] focus:ring-4 focus:ring-slate-100 md:min-w-72"
            >
              {businesses.map((business) => (
                <option key={business.id} value={business.id}>
                  {business.name} - /store/{business.slug}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleTogglePublishStatus}
              disabled={isUpdatingPublishStatus}
              className={`inline-flex min-h-12 items-center justify-center rounded-full px-5 text-sm font-semibold shadow-sm transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 ${
                selectedBusiness?.is_published
                  ? "whitespace-nowrap bg-red-600 text-white hover:bg-red-700"
                  : "whitespace-nowrap bg-emerald-600 text-white hover:bg-emerald-700"
              }`}
            >
              {isUpdatingPublishStatus
                ? "Updating..."
                : selectedBusiness?.is_published
                ? "Unpublish Store"
                : "Publish Store"}
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <div className="rounded-2xl bg-slate-50 px-3 py-2.5">
              <p className="text-xs text-slate-500">Plan</p>
              <p className="mt-1 truncate text-sm font-semibold text-slate-950">
                {currentPlan?.name || "No plan"}
              </p>
            </div>

            <div className="rounded-2xl bg-emerald-50 px-3 py-2.5">
              <p className="text-xs text-emerald-700">Store</p>
              <p className="mt-1 text-sm font-semibold text-emerald-950">
                {selectedBusiness?.is_published ? "Live" : "Draft"}
              </p>
            </div>

            <div className="rounded-2xl bg-amber-50 px-3 py-2.5">
              <p className="text-xs text-amber-700">Domain</p>
              <p className="mt-1 truncate text-sm font-semibold text-amber-950">
                {selectedBusiness?.custom_domain_status || "None"}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-950 px-3 py-2.5">
              <p className="text-xs text-slate-300">Status</p>
              <p className="mt-1 truncate text-sm font-semibold text-white">
                {selectedBusiness?.subscription_status || "trial"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {isVerifyingPayment ? (
        <div className="rounded-2xl bg-blue-50 p-3 text-sm font-medium text-blue-700">
          Verifying Paystack payment...
        </div>
      ) : null}

      {message ? (
        <div className="rounded-2xl bg-white p-3 text-sm text-slate-700 shadow-sm">
          {message}
        </div>
      ) : null}

      <section className="overflow-hidden rounded-[2rem] bg-[#06110f] p-5 text-white shadow-sm md:p-7">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <span className="relative inline-flex h-8 w-14 items-center rounded-xl border border-white/10 bg-white/10 p-1">
              <span className="h-5 w-8 rounded-lg bg-[#95bf47]" />
            </span>

            <span className="text-base font-semibold text-white">
              Pay yearly
            </span>
          </div>

          <a
            href="#plan-features"
            className="text-sm font-semibold text-white underline underline-offset-4 transition hover:text-[#95bf47]"
          >
            Compare all features
          </a>
        </div>

        <div className="grid gap-5 xl:grid-cols-3">
          {plans.map((plan) => {
            const isCurrent = plan.id === currentPlan?.id;
            const planAmount = plan.amount;

            const subtitle =
              plan.id === "starter"
                ? "For solo entrepreneurs"
                : plan.id === "growth"
                ? "For small teams"
                : "For growing businesses";

            const features =
              plan.id === "starter"
                ? [
                    "Launch a polished online storefront",
                    plan.productLimit
                      ? `Up to ${plan.productLimit} products`
                      : "Unlimited products",
                    "WhatsApp order flow",
                    "Basic dashboard management",
                    "Public store link",
                  ]
                : plan.id === "growth"
                ? [
                    "Everything in Starter",
                    plan.productLimit
                      ? `Up to ${plan.productLimit} products`
                      : "Unlimited products",
                    plan.storeLimit
                      ? `Up to ${plan.storeLimit} stores`
                      : "Unlimited stores",
                    "Better store management tools",
                    "Great for product-heavy businesses",
                  ]
                : [
                    "Everything in Growth",
                    plan.productLimit
                      ? `Up to ${plan.productLimit} products`
                      : "Unlimited products",
                    plan.storeLimit
                      ? `Up to ${plan.storeLimit} stores`
                      : "Unlimited stores",
                    "Built for larger storefronts",
                    "Premium business visibility",
                  ];

            return (
              <div
                key={plan.id}
                className="flex min-h-[610px] flex-col rounded-[2rem] bg-[#151b18] px-6 py-7 text-white ring-1 ring-white/5 transition hover:-translate-y-1 hover:ring-white/15 md:px-7"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[25px] font-semibold leading-none tracking-[-0.05em] text-white">
                      {plan.name}
                    </p>

                    <p className="mt-2 text-[17px] font-medium leading-6 text-[#95bf47]">
                      {subtitle}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="whitespace-nowrap text-[25px] font-semibold leading-none tracking-[-0.06em] text-white">
                      {plan.priceLabel || formatNaira(planAmount)}
                    </p>

                    <p className="mt-1 text-xs font-semibold text-white/80">
                      /mo
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handlePayForPlan(plan.id)}
                  disabled={
                    isCurrent || Boolean(payingPlanId) || isVerifyingPayment
                  }
                  className="mt-12 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full border-2 border-white px-5 text-[17px] font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white hover:text-[#06110f] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {payingPlanId === plan.id ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : null}

                  {isCurrent
                    ? "Current plan"
                    : payingPlanId === plan.id
                    ? "Opening payment..."
                    : `Choose ${plan.name}`}
                </button>

                <div
                  id="plan-features"
                  className="mt-8 grid gap-0 text-[16px] font-semibold leading-6 text-white/65"
                >
                  {features.map((feature) => (
                    <div
                      key={feature}
                      className="border-t border-white/10 py-4 first:border-t-0"
                    >
                      {feature}
                    </div>
                  ))}
                </div>

                <div className="mt-auto pt-8">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-sm font-semibold text-white/50">
                      Current store
                    </p>

                    <p className="mt-1 truncate text-base font-semibold text-white">
                      {selectedBusiness?.name}
                    </p>

                    <p className="mt-3 text-sm font-medium text-white/50">
                      Status:{" "}
                      <span className="text-white">
                        {selectedBusiness?.subscription_status || "trial"}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}