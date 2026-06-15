"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CreditCard, Globe2, Loader2, Store } from "lucide-react";
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

      <section className="grid gap-5 xl:grid-cols-[1fr_0.65fr]">
        <div className="grid content-start gap-4">
          <div className="grid gap-5 lg:grid-cols-3">
            {plans.map((plan) => {
              const isCurrent = plan.id === currentPlan?.id;
              const isPopular = plan.id === "growth";
              const planAmount = plan.amount;

              const features = [
                plan.productLimit
                  ? `Up to ${plan.productLimit} products`
                  : "Unlimited products",
                plan.storeLimit
                  ? `${plan.storeLimit} store${plan.storeLimit > 1 ? "s" : ""}`
                  : "Unlimited stores",
                "Beautiful business storefront",
                "WhatsApp order flow",
                "Dashboard management",
              ];

              return (
                <div
                  key={plan.id}
                  className={`relative flex min-h-[540px] flex-col overflow-hidden rounded-[2rem] border p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${
                    isPopular
                      ? "border-slate-950 bg-[#f7f3e8]"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  {isPopular ? (
                    <div className="absolute left-0 right-0 top-0 bg-slate-950 px-5 py-2 text-center text-xs font-semibold uppercase tracking-[0.18em] text-white">
                      Most popular
                    </div>
                  ) : null}

                  <div className={isPopular ? "pt-8" : ""}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-2xl font-semibold tracking-[-0.05em] text-slate-950">
                          {plan.name}
                        </p>

                        <p className="mt-2 min-h-[48px] text-sm leading-6 text-slate-600">
                          {plan.description}
                        </p>
                      </div>

                      {isCurrent ? (
                        <span className="shrink-0 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                          Current
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-8">
                      <p className="text-sm font-medium text-slate-500">
                        Monthly
                      </p>

                      <div className="mt-2">
                        <span className="block text-4xl font-semibold tracking-[-0.08em] text-slate-950">
                          {plan.priceLabel || formatNaira(planAmount)}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handlePayForPlan(plan.id)}
                      disabled={
                        isCurrent || Boolean(payingPlanId) || isVerifyingPayment
                      }
                      className={`mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3.5 text-sm font-semibold transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 ${
                        isCurrent
                          ? "bg-emerald-100 text-emerald-800"
                          : isPopular
                          ? "bg-slate-950 text-white hover:bg-slate-800"
                          : "bg-slate-100 text-slate-950 hover:bg-slate-200"
                      }`}
                    >
                      {payingPlanId === plan.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : null}

                      {isCurrent
                        ? "Current plan"
                        : payingPlanId === plan.id
                        ? "Opening payment..."
                        : `Choose ${plan.name}`}
                    </button>

                    <div className="mt-7 border-t border-slate-200 pt-6">
                      <p className="text-sm font-semibold text-slate-950">
                        What's included
                      </p>

                      <div className="mt-4 grid gap-3">
                        {features.map((feature) => (
                          <div
                            key={feature}
                            className="flex items-start gap-3 text-sm"
                          >
                            <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                              ✓
                            </span>

                            <span className="leading-6 text-slate-700">
                              {feature}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto pt-6">
                    <div className="rounded-2xl bg-white/70 p-3 text-xs leading-5 text-slate-600 ring-1 ring-slate-200">
                      Best for{" "}
                      <span className="font-semibold text-slate-950">
                        {plan.id === "starter"
                          ? "new businesses getting online."
                          : plan.id === "growth"
                          ? "growing businesses with more products."
                          : "businesses managing larger storefronts."}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <aside className="grid content-start gap-4">
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-50 text-slate-800">
                <CreditCard size={19} />
              </span>

              <div>
                <p className="font-semibold text-slate-950">Billing Details</p>
                <p className="text-sm text-slate-500">
                  {selectedBusiness?.subscription_status || "trial"}
                </p>
              </div>
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 p-3 text-sm">
                <span className="text-slate-500">Business</span>
                <span className="truncate font-semibold text-slate-950">
                  {selectedBusiness?.name}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 p-3 text-sm">
                <span className="text-slate-500">Current plan</span>
                <span className="font-semibold text-slate-950">
                  {currentPlan?.name || "No plan"}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 p-3 text-sm">
                <span className="text-slate-500">Monthly amount</span>
                <span className="font-semibold text-slate-950">
                  {formatNaira(currentPlanAmount)}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 p-3 text-sm">
                <span className="text-slate-500">Payment</span>
                <span className="font-semibold text-slate-950">Paystack</span>
              </div>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-amber-50 text-amber-700">
                <Globe2 size={19} />
              </span>

              <div>
                <p className="font-semibold text-slate-950">Custom Domain</p>
                <p className="text-sm text-slate-500">
                  {selectedBusiness?.custom_domain || "Not connected"}
                </p>
              </div>
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 p-3 text-sm">
                <span className="text-slate-500">Setup</span>
                <span className="font-semibold text-slate-950">
                  {formatNaira(25000)}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 p-3 text-sm">
                <span className="text-slate-500">Managed</span>
                <span className="font-semibold text-slate-950">
                  {formatNaira(45000)} - {formatNaira(75000)}
                </span>
              </div>
            </div>

            <Link
              href="/dashboard/domain"
              className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-amber-300 px-5 py-3 text-sm font-semibold text-amber-950 transition hover:-translate-y-0.5 hover:bg-amber-200"
            >
              Request Domain
            </Link>
          </div>

          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
                <Store size={19} />
              </span>

              <div>
                <p className="font-semibold text-slate-950">Store Visibility</p>
                <p className="text-sm text-slate-500">
                  /store/{selectedBusiness?.slug}
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-3 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-500">Current status</span>
                <span className="font-semibold text-slate-950">
                  {selectedBusiness?.is_published ? "Live" : "Draft"}
                </span>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}