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
import { normalizePlanId } from "@/lib/plans";
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
    priceLabel: "\u20A610,000/month",
    productLimit: 20,
    storeLimit: 1,
    sortOrder: 10,
  },
  {
    id: "growth",
    name: "Growth",
    description: "For growing product businesses that need more room.",
    amount: 20000,
    amountInKobo: 2000000,
    priceLabel: "\u20A620,000/month",
    productLimit: 100,
    storeLimit: 3,
    sortOrder: 20,
  },
  {
    id: "pro",
    name: "Premium",
    description:
      "For established businesses that need more stores, inventory, and stronger visibility.",
    amount: 30000,
    amountInKobo: 3000000,
    priceLabel: "\u20A630,000/month",
    productLimit: 500,
    storeLimit: 10,
    sortOrder: 30,
  },
];

function formatNaira(amount: number) {
  return `\u20A6${Number(amount || 0).toLocaleString("en-NG")}`;
}

function normalizeSubscriptionPlan(plan: string | null | undefined) {
  return normalizePlanId(plan);
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
  const [isYearly, setIsYearly] = useState(false);

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

    const mappedPlansById = new Map<string, BillingPlan>();

    (pricingItems || [])
      .filter((item: any) =>
        ["starter", "growth", "pro", "premium"].includes(
          String(item.pricing_key),
        )
      )
      .forEach((item: any) => {
        const id = normalizePlanId(String(item.pricing_key));

        mappedPlansById.set(id, {
          id,
          name: String(item.name || ""),
          description: String(item.description || ""),
          amount: Number(item.amount || 0),
          amountInKobo: Number(item.amount_in_kobo || 0),
          priceLabel: String(item.price_label || ""),
          productLimit: item.product_limit,
          storeLimit: item.store_limit,
          sortOrder: item.sort_order,
        });
      });

    const mappedPlans = Array.from(mappedPlansById.values()).sort(
      (a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0),
    );

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
        billingCycle: isYearly ? "yearly" : "monthly",
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
      <div className="rounded-[1.5rem] border border-purple-200 bg-purple-50 p-6 text-center">
        <p className="text-xl font-semibold tracking-[-0.04em] text-purple-950">
          Create your business page first
        </p>

        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-purple-900">
          Complete onboarding before managing billing.
        </p>

        <Link
          href="/dashboard/onboarding"
          className="mt-5 inline-flex rounded-full bg-purple-300 px-5 py-2.5 text-sm font-semibold text-purple-950 transition hover:-translate-y-0.5 hover:bg-purple-200"
        >
          Start Onboarding
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-5">
      <section className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-4 xl:grid-cols-[1fr_auto] xl:items-center">
          <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
            <select
              value={selectedBusinessId}
              onChange={(event) => setSelectedBusinessId(event.target.value)}
              className="min-h-10 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 outline-none transition focus:border-[var(--mv-violet)] focus:ring-4 focus:ring-slate-100 md:min-w-72"
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
              className={`inline-flex min-h-10 items-center justify-center rounded-full px-5 text-sm font-semibold shadow-sm transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 ${
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

            <div className="rounded-2xl bg-purple-50 px-3 py-2.5">
              <p className="text-xs text-purple-700">Domain</p>
              <p className="mt-1 truncate text-sm font-semibold text-purple-950">
                {selectedBusiness?.custom_domain_status || "None"}
              </p>
            </div>

            <div className="rounded-2xl bg-[#26143d] px-3 py-2.5">
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

      <section className="rounded-[1.5rem] border border-[#d8c8ee] bg-white p-4 shadow-sm">
        <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7c3aed]">
              Pro Sections
            </p>
            <h2 className="mt-1 text-xl font-semibold tracking-[-0.04em] text-slate-950">
              Advanced business sections unlock on Premium.
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              After upgrading, open Profile and switch the business mode to
              Products, Properties, or other advanced sections. The dashboard, themes, and customer
              inquiry flow will adjust automatically.
            </p>
          </div>

          <Link
            href="/dashboard/profile"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-5 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-white"
          >
            Open Profile
          </Link>
        </div>
      </section>

      <section className="overflow-hidden rounded-[1.75rem] bg-[#06110f] p-4 text-white shadow-sm md:p-6">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <button
            type="button"
            onClick={() => setIsYearly((value) => !value)}
            className="flex w-fit items-center gap-3 rounded-full transition"
          >
            <span
              className={`relative inline-flex h-7 w-12 items-center rounded-xl border border-white/10 p-1 transition ${
                isYearly ? "bg-white/10" : "bg-white/5"
              }`}
            >
              <span
                className={`h-5 w-5 rounded-lg transition ${
                  isYearly ? "translate-x-5 bg-[#95bf47]" : "translate-x-0 bg-white/45"
                }`}
              />
            </span>

            <span className="text-sm font-semibold text-white">
              Pay yearly
            </span>

            {isYearly ? (
              <span className="rounded-full bg-[#95bf47]/15 px-2.5 py-1 text-xs font-semibold text-[#95bf47]">
                Save 20%
              </span>
            ) : null}
          </button>

          <a
            href="#plan-features"
            className="text-sm font-semibold text-white underline underline-offset-4 transition hover:text-[#95bf47]"
          >
            Compare all features
          </a>
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          {plans.map((plan) => {
            const isCurrent = plan.id === currentPlan?.id;
            const monthlyAmount = plan.amount;
            const yearlyAmount = Math.round(monthlyAmount * 12 * 0.8);
            const displayAmount = isYearly ? yearlyAmount : monthlyAmount;

            const subtitle =
              plan.id === "starter"
                ? "For solo entrepreneurs"
                : plan.id === "growth"
                ? "For multi-category sellers"
                : "For scaling businesses";

            const features =
              plan.id === "starter"
                ? [
                    "Launch a polished online storefront",
                    plan.productLimit
                      ? `Up to ${plan.productLimit} products`
                      : "Unlimited products",
                    "WhatsApp order flow",
                    "Dashboard management",
                    "Public store link",
                  ]
                : plan.id === "growth"
                ? [
                    "Everything in Starter",
                    plan.productLimit
                      ? `Up to ${plan.productLimit} inventory items`
                      : "Unlimited inventory items",
                    plan.storeLimit
                      ? `Up to ${plan.storeLimit} stores`
                      : "Unlimited stores",
                    "More product themes and inventory room",
                    "For product-heavy businesses",
                  ]
                : [
                    "Everything in Growth",
                    plan.productLimit
                      ? `Up to ${plan.productLimit} inventory items`
                      : "Unlimited inventory items",
                    plan.storeLimit
                      ? `Up to ${plan.storeLimit} stores`
                      : "Unlimited stores",
                    "Unlock Products, Properties, and advanced sections",
                    "Property listing and advanced business tools",
                    "More premium themes for every section",
                  ];

            return (
              <div
                key={plan.id}
                className="flex min-h-[470px] flex-col rounded-[1.65rem] bg-[#151b18] px-5 py-6 text-white ring-1 ring-white/5 transition hover:-translate-y-1 hover:ring-white/15"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[21px] font-semibold leading-none tracking-[-0.05em] text-white">
                      {plan.name}
                    </p>

                    <p className="mt-1.5 text-[14px] font-medium leading-5 text-[#95bf47]">
                      {subtitle}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="whitespace-nowrap text-[21px] font-semibold leading-none tracking-[-0.06em] text-white">
                      {formatNaira(displayAmount)}
                    </p>

                    <p className="mt-1 text-[11px] font-semibold text-white/70">
                      /{isYearly ? "yr" : "mo"}
                    </p>
                  </div>
                </div>

                {isYearly ? (
                  <p className="mt-4 text-xs font-medium text-white/45">
                    Billed yearly. You save {formatNaira(monthlyAmount * 12 - yearlyAmount)}.
                  </p>
                ) : (
                  <p className="mt-4 text-xs font-medium text-white/45">
                    Billed monthly. Switch to yearly to save 20%.
                  </p>
                )}

                <button
                  type="button"
                  onClick={() => handlePayForPlan(plan.id)}
                  disabled={
                    isCurrent || Boolean(payingPlanId) || isVerifyingPayment
                  }
                  className="mt-6 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-full border-2 border-white px-5 text-[15px] font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white hover:text-[#06110f] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {payingPlanId === plan.id ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : null}

                  {isCurrent
                    ? "Current plan"
                    : payingPlanId === plan.id
                    ? "Opening payment..."
                    : isYearly
                    ? `Choose ${plan.name} yearly`
                    : `Choose ${plan.name}`}
                </button>

                <div
                  id="plan-features"
                  className="mt-6 grid gap-0 text-[14px] font-semibold leading-5 text-white/60"
                >
                  {features.map((feature) => (
                    <div
                      key={feature}
                      className="border-t border-white/10 py-2.5 first:border-t-0"
                    >
                      {feature}
                    </div>
                  ))}
                </div>

                <div className="mt-auto pt-5">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                    <p className="text-xs font-semibold text-white/45">
                      Current store
                    </p>

                    <p className="mt-1 truncate text-sm font-semibold text-white">
                      {selectedBusiness?.name}
                    </p>

                    <p className="mt-2 text-xs font-medium text-white/45">
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




