"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  CreditCard,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import {
  getMyBusinesses,
  updateBusinessPublishStatus,
} from "@/lib/business-actions";
import { initializePlanPayment, verifyPlanPayment } from "@/lib/payment-actions";
import { supabase } from "@/lib/supabase";
import {
  BILLING_CYCLES,
  MARKET_VILLA_PLANS,
  type BillingCycle,
  type MarketVillaPlanId,
  getMarketVillaPlan,
  getIntroBillingCycleForPlan,
  getIntroBillingCycleMessage,
  getPlanBillingAmount,
  getPlanPricingOverrideFromMetadata,
  isIntroBillingCycleAllowed,
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
  grace_period_ends_at?: string | null;
  subscription_override_until?: string | null;
  admin_override_active?: boolean | null;
  admin_override_note?: string | null;
};

type BillingPlan = {
  id: MarketVillaPlanId;
  name: string;
  description: string;
  introMonthlyAmount: number;
  regularMonthlyAmount: number;
  freeMonths: number;
  introPaidMonths: number;
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
    freeMonths: MARKET_VILLA_PLANS.starter.freeMonths,
    introPaidMonths: MARKET_VILLA_PLANS.starter.introPaidMonths,
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
    freeMonths: MARKET_VILLA_PLANS.growth.freeMonths,
    introPaidMonths: MARKET_VILLA_PLANS.growth.introPaidMonths,
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
    freeMonths: MARKET_VILLA_PLANS.pro.freeMonths,
    introPaidMonths: MARKET_VILLA_PLANS.pro.introPaidMonths,
    productLimit: 500,
    storeLimit: 1,
    sortOrder: 30,
  },
];

type PricingItem = {
  pricing_key: string;
  name: string | null;
  description: string | null;
  product_limit: number | null;
  store_limit: number | null;
  sort_order: number | null;
  metadata: Record<string, unknown> | null;
};

type PaymentHistoryItem = {
  id: string;
  business_id: string | null;
  plan: string;
  amount: number;
  currency: string | null;
  reference: string;
  status: string;
  paid_at: string | null;
  created_at: string | null;
  raw_response?: Record<string, any> | null;
};

function formatNaira(amount: number) {
  return `\u20A6${Number(amount || 0).toLocaleString("en-NG")}`;
}

function normalizeSubscriptionPlan(plan: string | null | undefined) {
  return normalizePlanId(plan);
}

function getPlanOverrideFromBillingPlan(plan: BillingPlan) {
  return {
    introMonthlyAmount: plan.introMonthlyAmount,
    regularMonthlyAmount: plan.regularMonthlyAmount,
    freeMonths: plan.freeMonths,
    introPaidMonths: plan.introPaidMonths,
  };
}

async function loadSubscriptionPricingPlans() {
  const { data, error } = await supabase
    .from("pricing_items")
    .select(
      "pricing_key,name,description,product_limit,store_limit,sort_order,metadata",
    )
    .eq("pricing_type", "subscription")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error || !data?.length) {
    return fallbackBillingPlans;
  }

  const mappedPlans = (data as PricingItem[])
    .map((item) => {
      const planId = normalizePlanId(item.pricing_key);
      const basePlan = getMarketVillaPlan(planId, {
        ...getPlanPricingOverrideFromMetadata(item.metadata),
        name: item.name || undefined,
        description: item.description || undefined,
      });

      return {
        id: planId,
        name: basePlan.name,
        description: basePlan.description,
        introMonthlyAmount: basePlan.introMonthlyAmount,
        regularMonthlyAmount: basePlan.regularMonthlyAmount,
        freeMonths: basePlan.freeMonths,
        introPaidMonths: basePlan.introPaidMonths,
        productLimit: item.product_limit,
        storeLimit: item.store_limit,
        sortOrder: item.sort_order,
      };
    })
    .filter(
      (plan, index, list) =>
        list.findIndex((candidate) => candidate.id === plan.id) === index,
    );

  return mappedPlans.length ? mappedPlans : fallbackBillingPlans;
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

function getGraceUntil(business: DashboardBusiness | undefined) {
  return (
    business?.subscription_grace_until ||
    business?.grace_period_ends_at ||
    null
  );
}

function getSubscriptionState(business: DashboardBusiness | undefined) {
  const status = String(business?.subscription_status || "trial").toLowerCase();
  const expiresAt = business?.subscription_expires_at
    ? new Date(business.subscription_expires_at)
    : null;
  const graceUntil = getGraceUntil(business) ? new Date(getGraceUntil(business)!) : null;
  const now = new Date();

  if (business?.admin_override_active) {
    return {
      key: "override",
      label: "Admin override",
      tone: "purple",
      message: "Admin override is active for this business.",
    };
  }

  if (status === "grace_period" || (expiresAt && graceUntil && now > expiresAt && now <= graceUntil)) {
    return {
      key: "grace",
      label: "Grace period",
      tone: "amber",
      message: "Your storefront is in grace period. Renew to avoid suspension.",
    };
  }

  if (status === "expired" || (expiresAt && now > expiresAt && (!graceUntil || now > graceUntil))) {
    return {
      key: "expired",
      label: "Expired",
      tone: "red",
      message: "Your storefront may be unpublished until payment is completed.",
    };
  }

  return {
    key: "active",
    label: status === "trial" || status === "free_trial" ? "Trial" : "Active",
    tone: "emerald",
    message: "Your storefront is active.",
  };
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
  const [successfulPaymentCounts, setSuccessfulPaymentCounts] = useState<
    Record<string, number>
  >({});
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryItem[]>([]);
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
  const subscriptionState = getSubscriptionState(selectedBusiness);
  const graceUntil = getGraceUntil(selectedBusiness);
  const selectedBusinessPayments = paymentHistory.filter(
    (payment) => payment.business_id === selectedBusiness?.id,
  );
  const selectedBusinessHasSuccessfulPayment =
    Boolean(selectedBusiness?.id) &&
    Number(successfulPaymentCounts[selectedBusiness?.id || ""] || 0) > 0;

  async function loadBillingData() {
    const [items, activePlans] = await Promise.all([
      getMyBusinesses() as Promise<DashboardBusiness[]>,
      loadSubscriptionPricingPlans(),
    ]);

    setBusinesses(items);

    if (items.length > 0) {
      const businessIds = items.map((item) => item.id);
      const { data: successfulPayments } = await supabase
        .from("payments")
        .select("id,business_id,plan,amount,currency,reference,status,paid_at,created_at,raw_response")
        .in("business_id", businessIds)
        .order("created_at", { ascending: false });

      const allPayments = (successfulPayments || []) as PaymentHistoryItem[];
      setPaymentHistory(allPayments);

      const paymentCounts = allPayments
        .filter((payment) => payment.status === "success")
        .reduce<
        Record<string, number>
      >((counts, payment) => {
        const businessId = String(payment.business_id || "");
        counts[businessId] = (counts[businessId] || 0) + 1;
        return counts;
      }, {});

      setSuccessfulPaymentCounts(paymentCounts);
    } else {
      setSuccessfulPaymentCounts({});
      setPaymentHistory([]);
    }

    if (items.length > 0) {
      setSelectedBusinessId((current) => current || items[0].id);
    }

    setPlans(activePlans);
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
        "Starter is already active on this store. You get 3 months free, then ₦1,500/month for the next 3 months. Regular billing resumes after 6 months.",
      );
      return;
    }

    if (
      !selectedBusinessHasSuccessfulPayment &&
      !isIntroBillingCycleAllowed({
        plan: planId,
        billingCycle: selectedBillingCycle,
      })
    ) {
      setMessage(getIntroBillingCycleMessage(planId));
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
      <section className="rounded-[1.5rem] border border-[#eadfff] bg-white p-4">
        <div className="grid gap-4 xl:grid-cols-[1fr_auto] xl:items-center">
          <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
            <select
              value={selectedBusinessId}
              onChange={(event) => setSelectedBusinessId(event.target.value)}
              className="min-h-11 rounded-2xl border border-[#eadfff] bg-[#faf8ff] px-4 text-sm font-bold text-[#241436] outline-none transition focus:border-[#7c3aed] focus:ring-4 focus:ring-[#7c3aed]/10 md:min-w-72"
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
              className={`inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-bold transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 ${
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

          <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-[#eadfff] bg-[#faf8ff] px-3 py-2.5">
              <p className="text-xs font-black uppercase tracking-[0.12em] text-[#7c3aed]">
                Plan
              </p>
              <p className="mt-1 truncate text-sm font-black text-[#241436]">
                {currentPlan?.name || "Starter"}
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-3 py-2.5">
              <p className="text-xs font-black uppercase tracking-[0.12em] text-emerald-700">Store</p>
              <p className="mt-1 text-sm font-black text-emerald-950">
                {selectedBusiness?.is_published ? "Live" : "Draft"}
              </p>
            </div>

            <div className="rounded-2xl border border-purple-100 bg-purple-50 px-3 py-2.5">
              <p className="text-xs font-black uppercase tracking-[0.12em] text-purple-700">Renewal</p>
              <p className="mt-1 truncate text-sm font-black text-purple-950">
                {formatDate(selectedBusiness?.subscription_expires_at)}
              </p>
            </div>

            <div className="rounded-2xl bg-[#241436] px-3 py-2.5">
              <p className="text-xs font-black uppercase tracking-[0.12em] text-white/65">Status</p>
              <p className="mt-1 truncate text-sm font-black text-white">
                {subscriptionState.label}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        className={`rounded-[1.5rem] border p-4 ${
          subscriptionState.tone === "red"
            ? "border-red-200 bg-red-50 text-red-900"
            : subscriptionState.tone === "amber"
              ? "border-amber-200 bg-amber-50 text-amber-900"
              : subscriptionState.tone === "purple"
                ? "border-[#d8c8ff] bg-[#f4edff] text-[#241436]"
                : "border-emerald-200 bg-emerald-50 text-emerald-950"
        }`}
      >
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="flex gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/70">
              {subscriptionState.tone === "red" ||
              subscriptionState.tone === "amber" ? (
                <AlertTriangle size={20} />
              ) : subscriptionState.tone === "purple" ? (
                <ShieldCheck size={20} />
              ) : (
                <CheckCircle2 size={20} />
              )}
            </div>
            <div>
              <p className="text-sm font-black">{subscriptionState.message}</p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs font-bold opacity-80">
                <span>Started: {formatDate(selectedBusiness?.subscription_started_at)}</span>
                <span>Expires: {formatDate(selectedBusiness?.subscription_expires_at)}</span>
                {graceUntil ? <span>Grace ends: {formatDate(graceUntil)}</span> : null}
                {selectedBusiness?.admin_override_active ? (
                  <span>Override active</span>
                ) : null}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handlePayForPlan(selectedBusinessPlanId)}
            disabled={
              payingPlanId === selectedBusinessPlanId ||
              isVerifyingPayment ||
              (selectedBusinessPlanId === "starter" && starterFreeTrialActive)
            }
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#241436] px-5 text-sm font-black text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {payingPlanId === selectedBusinessPlanId ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <CreditCard size={16} />
            )}
            Pay now
          </button>
        </div>
      </section>

      {isVerifyingPayment ? (
        <div className="rounded-2xl bg-blue-50 p-3 text-sm font-medium text-blue-700">
          Verifying Paystack payment...
        </div>
      ) : null}

      {message ? (
        <div className="rounded-2xl border border-[#eadfff] bg-white p-3 text-sm font-semibold text-slate-700">
          {message}
        </div>
      ) : null}

      <section className="overflow-hidden rounded-[1.75rem] bg-[#06110f] p-4 text-white md:p-6">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#95bf47]">
              Upgrade or renew
            </p>
            <h2 className="mt-1 text-2xl font-black tracking-[-0.05em]">
              Choose a plan
            </h2>
          </div>

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
            const isRecommended = plan.id === "growth";
            const cycle = BILLING_CYCLES[selectedBillingCycle];
            const introCycle =
              BILLING_CYCLES[getIntroBillingCycleForPlan(plan.id)];
            const planOverride = getPlanOverrideFromBillingPlan(plan);

            const firstBillingAmount =
              plan.id === "starter" && starterFreeTrialActive
                ? 0
                : getPlanBillingAmount({
                    plan: plan.id,
                    billingCycle: getIntroBillingCycleForPlan(plan.id),
                    isIntro: true,
                    override: planOverride,
                  });

            const regularBillingAmount = getPlanBillingAmount({
              plan: plan.id,
              billingCycle: selectedBillingCycle,
              isIntro: false,
              override: planOverride,
            });

            const displayedBillingAmount = selectedBusinessHasSuccessfulPayment
              ? regularBillingAmount
              : firstBillingAmount;
            const displayedCycleLabel = selectedBusinessHasSuccessfulPayment
              ? cycle.shortLabel
              : introCycle.shortLabel;

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
                    `First 3 months free`,
                    `${formatNaira(plan.introMonthlyAmount)}/month for the next ${plan.introPaidMonths} months`,
                    `Regular price: ${formatNaira(plan.regularMonthlyAmount)}/month`,
                  ]
                : plan.id === "growth"
                  ? [
                      "Everything in Starter",
                      plan.productLimit
                        ? `Up to ${plan.productLimit} inventory items`
                        : "Unlimited inventory items",
                      "More product themes and inventory room",
                      "For product-heavy businesses",
                      `50% off: ${formatNaira(plan.introMonthlyAmount)}/month equivalent`,
                      "Intro checkout: bi-annual only",
                      `Regular price: ${formatNaira(plan.regularMonthlyAmount)}/month`,
                    ]
                  : [
                      "Everything in Grow",
                      plan.productLimit
                        ? `Up to ${plan.productLimit} inventory items`
                        : "Unlimited inventory items",
                      "Unlock Products, Properties, and advanced sections",
                      "Property listing and advanced business tools",
                      "More premium themes for every section",
                      `50% off: ${formatNaira(plan.introMonthlyAmount)}/month equivalent`,
                      "Intro checkout: bi-annual only",
                      `Regular price: ${formatNaira(plan.regularMonthlyAmount)}/month`,
                    ];

            return (
              <div
                key={plan.id}
                className={`flex min-h-[470px] flex-col rounded-[1.65rem] px-5 py-6 text-white ring-1 transition hover:-translate-y-1 ${
                  isRecommended
                    ? "bg-[#3a1a5d] ring-[#95bf47]/60"
                    : "bg-[#2a1540] ring-white/5 hover:ring-white/15"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="mb-3 flex flex-wrap gap-2">
                      {isRecommended ? (
                        <span className="rounded-full bg-[#95bf47] px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-[#06110f]">
                          Recommended
                        </span>
                      ) : null}

                      {isCurrent ? (
                        <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-white">
                          Current
                        </span>
                      ) : null}
                    </div>

                    <p className="text-[21px] font-semibold leading-none tracking-[-0.05em] text-white">
                      {plan.name}
                    </p>

                    <p className="mt-1.5 text-[14px] font-medium leading-5 text-[#95bf47]">
                      {subtitle}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="whitespace-nowrap text-[21px] font-semibold leading-none tracking-[-0.06em] text-white">
                      {displayedBillingAmount === 0
                        ? "Free"
                        : formatNaira(displayedBillingAmount)}
                    </p>

                    <p className="mt-1 text-[11px] font-semibold text-white/70">
                      /{displayedCycleLabel}
                    </p>
                  </div>
                </div>

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
                        : isPlanDowngrade({
                            currentPlan: selectedBusiness?.subscription_plan,
                            targetPlan: plan.id,
                          })
                          ? `Downgrade to ${plan.name}`
                          : `Upgrade to ${plan.name}`}
                </button>

                <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-xs font-semibold leading-5 text-white/70">
                  Regular billing resumes after intro pricing. Quarterly,
                  bi-annual, and annual billing are supported after the intro
                  period.
                </div>

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
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-white/45">
                      Selected store
                    </p>
                    <p className="mt-1 truncate text-sm font-semibold text-white">
                      {selectedBusiness?.name}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-[1.5rem] border border-[#eadfff] bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#7c3aed]">
              Payment history
            </p>
            <h2 className="mt-1 text-xl font-black tracking-[-0.04em] text-[#241436]">
              Recent billing activity
            </h2>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full bg-[#faf8ff] px-3 py-2 text-xs font-black text-[#7c3aed]">
            <CalendarClock size={14} />
            {selectedBusinessPayments.length} payment
            {selectedBusinessPayments.length === 1 ? "" : "s"}
          </div>
        </div>

        <div className="mt-4 grid gap-2">
          {selectedBusinessPayments.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#d8c8ff] bg-[#faf8ff] p-6 text-center">
              <CreditCard className="mx-auto text-[#7c3aed]" size={26} />
              <p className="mt-3 text-sm font-black text-[#241436]">
                No payment history yet
              </p>
            </div>
          ) : null}

          {selectedBusinessPayments.slice(0, 8).map((payment) => {
            const metadata =
              (payment.raw_response?.metadata as Record<string, unknown> | undefined) ||
              (payment.raw_response?.data?.metadata as
                | Record<string, unknown>
                | undefined) ||
              {};
            const billingCycle = normalizeBillingCycle(
              String(metadata.billing_cycle || "quarterly"),
            );

            return (
              <div
                key={payment.id}
                className="grid gap-3 rounded-2xl border border-[#eadfff] bg-[#faf8ff] p-4 md:grid-cols-[1fr_auto] md:items-center"
              >
                <div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-black capitalize text-[#241436]">
                      {normalizePlanId(payment.plan)}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-black capitalize ${
                        payment.status === "success"
                          ? "bg-emerald-50 text-emerald-700"
                          : payment.status === "failed"
                            ? "bg-red-50 text-red-700"
                            : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {payment.status}
                    </span>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-[#6f6580]">
                      {BILLING_CYCLES[billingCycle].label}
                    </span>
                  </div>

                  <p className="mt-3 text-sm font-bold text-[#6f6580]">
                    Ref: {payment.reference}
                  </p>
                </div>

                <div className="text-left md:text-right">
                  <p className="text-lg font-black text-[#241436]">
                    {formatNaira(Number(payment.amount || 0) / 100)}
                  </p>
                  <p className="mt-1 text-xs font-bold text-[#6f6580]">
                    {formatDate(payment.paid_at || payment.created_at)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}




