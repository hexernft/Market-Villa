"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  CreditCard,
  Globe2,
  Loader2,
  ShieldCheck,
  Store,
  Zap,
} from "lucide-react";
import {
  getMyBusinesses,
  updateBusinessPublishStatus,
} from "@/lib/business-actions";
import { initializePlanPayment, verifyPlanPayment } from "@/lib/payment-actions";
import {
  MARKET_VILLA_PLANS,
  MarketVillaPlanId,
} from "@/lib/plans";

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

const plans = [
  {
    id: "starter" as MarketVillaPlanId,
    name: "Starter",
    price: "â‚¦10,000/mo",
    description: "For new small businesses getting online.",
    features: [
      "Business mini website",
      "Products and services",
      "Market Villa store URL",
      "Basic page styling",
      "Customer inquiry flow",
    ],
  },
  {
    id: "growth" as MarketVillaPlanId,
    name: "Growth",
    price: "â‚¦20,000/mo",
    description: "For businesses that need more control and growth tools.",
    features: [
      "Everything in Starter",
      "More products and services",
      "Analytics-ready structure",
      "Custom domain request access",
      "Priority support",
    ],
  },
  {
    id: "pro" as MarketVillaPlanId,
    name: "Pro",
    price: "â‚¦30,000/mo",
    description: "For serious businesses, teams, and service providers.",
    features: [
      "Everything in Growth",
      "Advanced business profile",
      "Custom domain setup discount",
      "Team-ready structure",
      "Premium support",
    ],
  },
];

export default function SettingsPage() {
  const searchParams = useSearchParams();

  const [businesses, setBusinesses] = useState<DashboardBusiness[]>([]);
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

  async function loadBusinesses() {
    const items = await getMyBusinesses();

    setBusinesses(items);

    if (items.length > 0 && !selectedBusinessId) {
      setSelectedBusinessId(items[0].id);
    }
  }

  useEffect(() => {
    let mounted = true;

    async function loadSettings() {
      try {
        setIsLoading(true);

        const items = await getMyBusinesses();

        if (!mounted) return;

        setBusinesses(items);

        if (items.length > 0) {
          setSelectedBusinessId(items[0].id);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unable to load settings.";
        setMessage(errorMessage);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadSettings();

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
          await loadBusinesses();
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

  const currentPlan =
    plans.find((plan) => plan.id === selectedBusiness?.subscription_plan) ||
    plans[0];

  async function handleTogglePublishStatus() {
    if (!selectedBusiness) return;

    setIsUpdatingPublishStatus(true);
    setMessage("");

    try {
      await updateBusinessPublishStatus({
        businessId: selectedBusiness.id,
        isPublished: !selectedBusiness.is_published,
      });

      await loadBusinesses();

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

  async function handlePayForPlan(planId: MarketVillaPlanId) {
    if (!selectedBusiness) {
      setMessage("Select a business before paying for a plan.");
      return;
    }

    setPayingPlanId(planId);
    setMessage("");

    try {
      const payment = await initializePlanPayment({
        businessId: selectedBusiness.id,
        plan: planId,
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
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm">
          <Loader2 className="mx-auto animate-spin text-slate-950" size={28} />
          <p className="mt-4 text-sm text-slate-500">Loading settings...</p>
        </div>
      </main>
    );
  }

  if (businesses.length === 0) {
    return (
      <div className="rounded-[2rem] border border-amber-200 bg-amber-50 p-8 text-center">
        <h2 className="text-2xl font-semibold tracking-[-0.04em] text-amber-950">
          Create your business page first
        </h2>

        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-amber-900">
          You need to complete onboarding before managing subscription settings.
        </p>

        <Link
          href="/dashboard/onboarding"
          className="mt-6 inline-flex rounded-full bg-amber-300 px-6 py-4 text-sm font-semibold text-amber-950 hover:bg-amber-200"
        >
          Start Onboarding
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8">
      <section className="rounded-[2rem] bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 p-7 text-white shadow-soft">
        <div className="grid items-end gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-200">
              Settings
            </p>

            <h2 className="mt-3 max-w-3xl text-4xl font-semibold tracking-[-0.05em]">
              Manage plan status, and business account settings.
            </h2>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
              View subscription details, custom domain status publishing
              status, and available Market Villa upgrades.
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-white/10 p-5 backdrop-blur-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
              Current Plan
            </p>

            <div className="mt-4 rounded-2xl bg-white p-4 text-slate-950">
              <p className="text-2xl font-semibold tracking-[-0.04em]">
                {currentPlan.name}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {currentPlan.price}
              </p>

              <p className="mt-3 text-xs leading-5 text-slate-500">
                Status: {selectedBusiness?.subscription_status || "trial"}
              </p>
            </div>

            <div className="mt-4 rounded-2xl bg-emerald-300/15 p-4 text-sm leading-6 text-emerald-100 ring-1 ring-emerald-200/20">
              Store is{" "}
              {selectedBusiness?.is_published ? "published" : "in draft"}.
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-700">
              Active Business
            </p>

            <h3 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-slate-950">
              Choose which business settings to view
            </h3>
          </div>

          <select
            value={selectedBusinessId}
            onChange={(event) => setSelectedBusinessId(event.target.value)}
            className="rounded-2xl border border-slate-200 px-4 py-4 text-sm outline-none focus:border-slate-950 md:min-w-80"
          >
            {businesses.map((business) => (
              <option key={business.id} value={business.id}>
                {business.name} â€” /store/{business.slug}
              </option>
            ))}
          </select>
        </div>
      </section>

      {isVerifyingPayment ? (
        <div className="rounded-2xl bg-blue-50 p-4 text-sm font-medium text-blue-700">
          Verifying your Paystack payment...
        </div>
      ) : null}

      {message ? (
        <div className="rounded-2xl bg-white p-4 text-sm text-slate-700 shadow-sm">
          {message}
        </div>
      ) : null}

      <section className="grid gap-5 md:grid-cols-4">
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
          <span className="mb-5 grid h-11 w-11 place-items-center rounded-2xl bg-teal-50 text-teal-700">
            <CreditCard size={20} />
          </span>

          <p className="text-sm text-slate-500">Plan</p>

          <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-950">
            {currentPlan.name}
          </p>

          <p className="mt-1 text-xs text-slate-400">{currentPlan.price}</p>
        </div>

        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
          <span className="mb-5 grid h-11 w-11 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
            <Store size={20} />
          </span>

          <p className="text-sm text-slate-500">Store Status</p>

          <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-950">
            {selectedBusiness?.is_published ? "Live" : "Draft"}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            /store/{selectedBusiness?.slug}
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
          <span className="mb-5 grid h-11 w-11 place-items-center rounded-2xl bg-amber-50 text-amber-700">
            <Globe2 size={20} />
          </span>

          <p className="text-sm text-slate-500">Custom Domain</p>

          <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-950">
            {selectedBusiness?.custom_domain_status || "none"}
          </p>

          <p className="mt-1 truncate text-xs text-slate-400">
            {selectedBusiness?.custom_domain || "Not connected"}
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
          <span className="mb-5 grid h-11 w-11 place-items-center rounded-2xl bg-slate-100 text-slate-800">
            <ShieldCheck size={20} />
          </span>

          <p className="text-sm text-slate-500">Account</p>

          <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-950">
            Active
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Business owner access
          </p>
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-700">
              Store Visibility
            </p>

            <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-950">
              {selectedBusiness?.is_published
                ? "Your store is live"
                : "Your store is unpublished"}
            </h3>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              When unpublished, customers will not be able to view this business
              page publicly. You can publish it again when ready.
            </p>
          </div>

          <button
            type="button"
            onClick={handleTogglePublishStatus}
            disabled={isUpdatingPublishStatus}
            className={`inline-flex items-center justify-center rounded-full px-6 py-4 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60 ${
              selectedBusiness?.is_published
                ? "bg-red-50 text-red-700 ring-1 ring-red-200 hover:bg-red-100"
                : "bg-slate-950 text-white hover:bg-slate-800"
            }`}
          >
            {isUpdatingPublishStatus
              ? "Updating..."
              : selectedBusiness?.is_published
              ? "Unpublish Store"
              : "Publish Store"}
          </button>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.75fr]">
        <div>
          <div className="mb-5">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-700">
              Plans
            </p>

            <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-950">
              Market Villa subscription tiers
            </h3>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {plans.map((plan) => {
              const isCurrent = plan.id === currentPlan.id;
              const planAmount = MARKET_VILLA_PLANS[plan.id].amount;

              return (
                <div
                  key={plan.id}
                  className={`rounded-[2rem] border p-6 shadow-sm ${
                    isCurrent
                      ? "border-slate-950 bg-slate-950 text-white"
                      : "border-slate-200 bg-white text-slate-950"
                  }`}
                >
                  <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                      <h4 className="text-xl font-semibold">{plan.name}</h4>
                      <p
                        className={`mt-2 text-sm leading-6 ${
                          isCurrent ? "text-slate-300" : "text-slate-500"
                        }`}
                      >
                        {plan.description}
                      </p>
                    </div>

                    {isCurrent ? (
                      <span className="rounded-full bg-emerald-300 px-3 py-1 text-xs font-semibold text-slate-950">
                        Current
                      </span>
                    ) : null}
                  </div>

                  <p className="text-3xl font-semibold tracking-[-0.05em]">
                    {plan.price}
                  </p>

                  <p
                    className={`mt-2 text-xs ${
                      isCurrent ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    Paystack checkout amount: â‚¦{planAmount.toLocaleString()}
                  </p>

                  <div className="mt-7 grid gap-3">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex gap-2">
                        <CheckCircle2
                          size={17}
                          className={
                            isCurrent ? "text-emerald-300" : "text-teal-700"
                          }
                        />
                        <span
                          className={`text-sm leading-5 ${
                            isCurrent ? "text-slate-200" : "text-slate-600"
                          }`}
                        >
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => handlePayForPlan(plan.id)}
                    disabled={
                      isCurrent ||
                      Boolean(payingPlanId) ||
                      isVerifyingPayment
                    }
                    className={`mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60 ${
                      isCurrent
                        ? "bg-white text-slate-950"
                        : "bg-slate-950 text-white hover:bg-slate-800"
                    }`}
                  >
                    {payingPlanId === plan.id ? (
                      <Loader2 size={17} className="animate-spin" />
                    ) : null}

                    {isCurrent
                      ? "Current Plan"
                      : payingPlanId === plan.id
                      ? "Opening Paystack..."
                      : `Pay for ${plan.name}`}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <aside className="grid gap-5">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-amber-50 text-amber-700">
                <Globe2 size={20} />
              </span>

              <div>
                <h3 className="font-semibold text-slate-950">
                  Custom Domain Add-on
                </h3>
                <p className="text-sm text-slate-500">
                  Professional domain setup
                </p>
              </div>
            </div>

            <p className="text-sm leading-6 text-slate-500">
              Businesses can request a custom domain as a paid add-on. This is a
              strong upsell for serious businesses that want a professional web
              address.
            </p>

            <div className="mt-5 grid gap-3 rounded-[1.5rem] bg-slate-50 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Setup fee</span>
                <span className="font-semibold text-slate-950">â‚¦25,000</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Managed domain</span>
                <span className="font-semibold text-slate-950">
                  â‚¦45k - â‚¦75k
                </span>
              </div>
            </div>

            <Link
              href="/dashboard/domain"
              className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-amber-300 px-5 py-3 text-sm font-semibold text-amber-950 hover:bg-amber-200"
            >
              Request Custom Domain
            </Link>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-slate-950">
                <Zap size={20} />
              </span>

              <div>
                <h3 className="font-semibold">Payment foundation active</h3>
                <p className="text-sm text-slate-300">Paystack checkout</p>
              </div>
            </div>

            <p className="text-sm leading-6 text-slate-300">
              This first version uses Paystack transaction checkout and
              verification. Recurring billing, grace periods, and automatic
              suspension come next.
            </p>
          </div>

          <div className="rounded-[2rem] border border-red-200 bg-red-50 p-6">
            <h3 className="text-lg font-semibold text-red-950">
              Revenue protection coming next
            </h3>

            <p className="mt-2 text-sm leading-6 text-red-900">
              After payment works, we will add renewal dates, grace periods,
              failed-payment handling, reminders, and automatic store
              suspension.
            </p>
          </div>
        </aside>
      </section>
    </div>
  );
}
