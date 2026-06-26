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
import {
  BILLING_CYCLES,
  MARKET_VILLA_PLANS,
  type BillingCycle,
  type MarketVillaPlanId,
  getPlanBillingAmount,
  isPlanDowngrade,
  isSubscriptionDateStillActive,
  normalizeBillingCycle,
  normalizePlanId,
} from "@/lib/plans";

type DashboardBusiness = {
  id: string;
  name: string;
  slug: string;
  is_published: boolean;
  custom_domain: string | null;
  custom_domain_status: string;
  subscription_plan: string | null;
  subscription_status: string | null;
  subscription_started_at?: string | null;
  subscription_expires_at?: string | null;
  subscription_grace_until?: string | null;
};

type BillingPlan = {
  id: MarketVillaPlanId;
  name: string;
  description: string;
  introMonthlyAmount: number;
  regularMonthlyAmount: number;
  productLimit?: number | null;
  storeLimit?: number | null;
  sortOrder?: number | null;
};

const fallbackBillingPlans: BillingPlan[] = [
  {
    id: "starter",
    name: MARKET_VILLA_PLANS.starter.name,
    description: MARKET_VILLA_PLANS.starter.description,
    introMonthlyAmount: MARKET_VILLA_PLANS.starter.introMonthlyAmount,
    regularMonthlyAmount: MARKET_VILLA_PLANS.starter.regularMonthlyAmount,
    productLimit: 20,
    storeLimit: 1,
    sortOrder: 10,
  },
  {
    id: "growth",
    name: MARKET_VILLA_PLANS.growth.name,
    description: MARKET_VILLA_PLANS.growth.description,
    introMonthlyAmount: MARKET_VILLA_PLANS.growth.introMonthlyAmount,
    regularMonthlyAmount: MARKET_VILLA_PLANS.growth.regularMonthlyAmount,
    productLimit: 100,
    storeLimit: 1,
    sortOrder: 20,
  },
  {
    id: "pro",
    name: MARKET_VILLA_PLANS.pro.name,
    description: MARKET_VILLA_PLANS.pro.description,
    introMonthlyAmount: MARKET_VILLA_PLANS.pro.introMonthlyAmount,
    regularMonthlyAmount: MARKET_VILLA_PLANS.pro.regularMonthlyAmount,
    productLimit: 500,
    storeLimit: 1,
    sortOrder: 30,
  },
];

function formatNaira(amount: number) {
  return `\u20A6${Number(amount || 0).toLocaleString("en-NG")}`;
}

function normalizeSubscriptionPlan(plan: string | null | undefined) {
  return normalizePlanId(plan);
}

function formatDate(value: string | null | undefined) {
  if (!value) return "Not set";

  try {
    return new Intl.DateTimeFormat("en-NG", {
      dateStyle: "medium",
    }).format(new Date(value));
  } catch {
    return "Not set";
  }
}

function isStarterFreeTrialActive(business: DashboardBusiness | undefined) {
  if (!business) return false;

  const plan = normalizePlanId(business.subscription_plan);
  const status = String(business.subscription_status || "").toLowerCase();

  if (plan !== "starter") return false;

  if (status === "trial" || status === "free_trial") {
    return true;
  }

  return false;
}

function isDowngradeBlockedForBusiness({
  business,
  targetPlan,
}: {
  business: DashboardBusiness | undefined;
  targetPlan: MarketVillaPlanId;
}) {
  if (!business) return false;

  return (
    isSubscriptionDateStillActive(business.subscription_expires_at) &&
    isPlanDowngrade({
      currentPlan: business.subscription_plan,
      targetPlan,
    })
  );
}

export default function BillingPage() {
  const searchParams = useSearchParams();

  const [businesses, setBusinesses] = useState<DashboardBusiness[]>([]);
  const [plans, setPlans] = useState<BillingPlan[]>(fallbackBillingPlans);
  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [selectedBillingCycle, setSelectedBillingCycle] =
    useState<BillingCycle>("quarterly");
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
    selectedBusiness?.subscription_plan,
  );

  const currentPlan =
    plans.find((plan) => plan.id === selectedBusinessPlanId) ||
    plans.find((plan) => plan.id === "starter") ||
    plans[0] ||
    null;

  const starterFreeTrialActive = isStarterFreeTrialActive(selectedBusiness);

  async function loadBillingData() {
    const items = (await getMyBusinesses()) as DashboardBusiness[];

    setBusinesses(items);

    if (items.length > 0) {
      setSelectedBusinessId((current) => current || items[0].id);
    }

    setPlans(fallbackBillingPlans);
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
          : "Business page published successfully.",
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

  async function handlePayForPlan(planId: MarketVillaPlanId) {
    if (!selectedBusiness) {
      setMessage("Select a business before paying for a plan.");
      return;
    }

    if (planId === "starter" && starterFreeTrialActive) {
      setMessage(
        "Starter is already active on this store. Billing starts after the free trial and grace period.",
      );
      return;
    }

    if (
      isDowngradeBlockedForBusiness({
        business: selectedBusiness,
        targetPlan: planId,
      })
    ) {
      setMessage(
        "This store already has a higher active plan. You can downgrade only after the current plan expires.",
      );
      return;
    }

    setPayingPlanId(planId);
    setMessage("");

    try {
      const payment = await initializePlanPayment({
        businessId: selectedBusiness.id,
        plan: planId,
        billingCycle: selectedBillingCycle,
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
                {currentPlan?.name || "Starter"}
              </p>
            </div>

            <div className="rounded-2xl bg-emerald-50 px-3 py-2.5">
              <p className="text-xs text-emerald-700">Store</p>
              <p className="mt-1 text-sm font-semibold text-emerald-950">
                {selectedBusiness?.is_published ? "Live" : "Draft"}
              </p>
            </div>

            <div className="rounded-2xl bg-purple-50 px-3 py-2.5">
              <p className="text-xs text-purple-700">Trial ends</p>
              <p className="mt-1 truncate text-sm font-semibold text-purple-950">
                {formatDate(selectedBusiness?.subscription_expires_at)}
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

      {starterFreeTrialActive ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium leading-6 text-emerald-900">
          Starter is active for free on this store. Billing starts only after
          the free month and grace period ends, unless you upgrade to Grow or
          Pro before then.
        </div>
      ) : null}

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
              Premium sections
            </p>
            <h2 className="mt-1 text-xl font-semibold tracking-[-0.04em] text-slate-950">
              Advanced business sections unlock on Pro.
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              After upgrading, open Profile and switch the business mode to
              Products, Properties, or other advanced sections. The dashboard,
              themes, and customer inquiry flow will adjust automatically.
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
          <div className="inline-flex w-fit flex-wrap rounded-full border border-white/10 bg-white/5 p-1">
            {Object.values(BILLING_CYCLES).map((cycle) => {
              const isActive = selectedBillingCycle === cycle.id;

              return (
                <button
                  key={cycle.id}
                  type="button"
                  onClick={() =>
                    setSelectedBillingCycle(normalizeBillingCycle(cycle.id))
                  }
                  className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                    isActive
                      ? "bg-white text-[#06110f]"
                      : "text-white/65 hover:text-white"
                  }`}
                >
                  {cycle.label}
                </button>
              );
            })}
          </div>

          <a
            href="#plan-features"
            className="text-sm font-semibold text-white underline underline-offset-4 transition hover:text-[#95bf47]"
          >
            Compare plan features
          </a>
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          {plans.map((plan) => {
            const isCurrent = plan.id === currentPlan?.id;
            const cycle = BILLING_CYCLES[selectedBillingCycle];

            const firstBillingAmount =
              plan.id === "starter" && starterFreeTrialActive
                ? 0
                : getPlanBillingAmount({
                    plan: plan.id,
                    billingCycle: selectedBillingCycle,
                    isIntro: true,
                  });

            const regularBillingAmount = getPlanBillingAmount({
              plan: plan.id,
              billingCycle: selectedBillingCycle,
              isIntro: false,
            });

            const downgradeBlocked = isDowngradeBlockedForBusiness({
              business: selectedBusiness,
              targetPlan: plan.id,
            });

            const subtitle =
              plan.id === "starter"
                ? "For solo entrepreneurs"
                : plan.id === "growth"
                  ? "For growing sellers"
                  : "For scaling businesses";

            const introText =
              plan.id === "starter"
                ? starterFreeTrialActive
                  ? "Free for the first month. Grace period included after expiry."
                  : "First month free, then \u20A62k/month for 3 months."
                : plan.id === "growth"
                  ? "Intro: \u20A63k/month for the first 3 months."
                  : "Intro: \u20A67k/month for the first 3 months.";

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
                    "Regular price: \u20A63k/month",
                  ]
                : plan.id === "growth"
                  ? [
                      "Everything in Starter",
                      plan.productLimit
                        ? `Up to ${plan.productLimit} inventory items`
                        : "Unlimited inventory items",
                      "More product themes and inventory room",
                      "For product-heavy businesses",
                      "Regular price: \u20A65k/month",
                    ]
                  : [
                      "Everything in Grow",
                      plan.productLimit
                        ? `Up to ${plan.productLimit} inventory items`
                        : "Unlimited inventory items",
                      "Unlock Products, Properties, and advanced sections",
                      "Property listing and advanced business tools",
                      "More premium themes for every section",
                      "Regular price: \u20A610k/month",
                    ];

            return (
              <div
                key={plan.id}
                className="flex min-h-[470px] flex-col rounded-[1.65rem] bg-[#2a1540] px-5 py-6 text-white ring-1 ring-white/5 transition hover:-translate-y-1 hover:ring-white/15"
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
                      {firstBillingAmount === 0
                        ? "Free"
                        : formatNaira(firstBillingAmount)}
                    </p>

                    <p className="mt-1 text-[11px] font-semibold text-white/70">
                      /{cycle.shortLabel}
                    </p>
                  </div>
                </div>

                <p className="mt-4 text-xs font-medium text-white/55">
                  {introText}
                </p>

                <p className="mt-2 text-xs font-medium text-white/55">
                  Regular renewal: {formatNaira(regularBillingAmount)} every{" "}
                  {cycle.shortLabel}.
                </p>

                <button
                  type="button"
                  onClick={() => handlePayForPlan(plan.id)}
                  disabled={
                    isCurrent ||
                    downgradeBlocked ||
                    Boolean(payingPlanId) ||
                    isVerifyingPayment
                  }
                  className="mt-6 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-full border-2 border-white px-5 text-[15px] font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white hover:text-[#06110f] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {payingPlanId === plan.id ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : null}

                  {isCurrent
                    ? plan.id === "starter" && starterFreeTrialActive
                      ? "Free trial active"
                      : "Current plan"
                    : downgradeBlocked
                      ? "Available after current plan expires"
                      : payingPlanId === plan.id
                        ? "Opening payment..."
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


