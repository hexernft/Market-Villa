"use client";

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
} from "lucide-react";
import {
  getMyBusinesses,
  updateBusinessPublishStatus,
} from "@/lib/business-actions";
import { initializePlanPayment, verifyPlanPayment } from "@/lib/payment-actions";
import { MARKET_VILLA_PLANS, MarketVillaPlanId } from "@/lib/plans";

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
    price: "\u20A610,000/mo",
    description: "For new businesses getting online.",
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
    price: "\u20A620,000/mo",
    description: "More control and growth tools.",
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
    price: "\u20A630,000/mo",
    description: "For serious businesses and teams.",
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

  const currentPlan =
    plans.find((plan) => plan.id === selectedBusiness?.subscription_plan) ||
    plans[0];

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
          Complete onboarding before managing billing and subscription settings.
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

  return (
    <div className="grid gap-5">
      <section className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-4 xl:grid-cols-[1fr_auto] xl:items-center">
          <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
            <select
              value={selectedBusinessId}
              onChange={(event) => setSelectedBusinessId(event.target.value)}
              className="min-h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 outline-none transition focus:border-slate-950 focus:ring-4 focus:ring-slate-100 md:min-w-72"
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

          <div className="grid grid-cols-4 gap-2">
            <div className="rounded-2xl bg-slate-50 px-3 py-2.5">
              <p className="text-xs text-slate-500">Plan</p>
              <p className="mt-1 truncate text-sm font-semibold text-slate-950">
                {currentPlan.name}
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

      <section className="grid gap-5 xl:grid-cols-[1fr_0.75fr]">
        <div className="grid content-start gap-4">
          <div className="grid gap-4 lg:grid-cols-3">
            {plans.map((plan) => {
              const isCurrent = plan.id === currentPlan.id;
              const planAmount = MARKET_VILLA_PLANS[plan.id].amount;

              return (
                <div
                  key={plan.id}
                  className={`rounded-[1.5rem] border p-4 shadow-sm transition ${
                    isCurrent
                      ? "border-slate-950 bg-slate-950 text-white"
                      : "border-slate-200 bg-white text-slate-950 hover:-translate-y-0.5 hover:shadow-md"
                  }`}
                >
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold">{plan.name}</p>
                      <p
                        className={`mt-1 text-xs leading-5 ${
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

                  <p className="whitespace-nowrap text-2xl font-semibold tracking-[-0.04em]">
                    {plan.price}
                  </p>

                  <p
                    className={`mt-1 text-xs ${
                      isCurrent ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    Paystack: {"\u20A6"}
                    {planAmount.toLocaleString()}
                  </p>

                  <div className="mt-5 grid gap-2.5">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex gap-2">
                        <CheckCircle2
                          size={15}
                          className={
                            isCurrent ? "text-emerald-300" : "text-teal-700"
                          }
                        />

                        <span
                          className={`text-xs leading-5 ${
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
                      isCurrent || Boolean(payingPlanId) || isVerifyingPayment
                    }
                    className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 ${
                      isCurrent
                        ? "bg-white text-slate-950"
                        : "bg-slate-950 text-white hover:bg-slate-800"
                    }`}
                  >
                    {payingPlanId === plan.id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : null}

                    {isCurrent
                      ? "Current Plan"
                      : payingPlanId === plan.id
                      ? "Opening..."
                      : `Pay ${plan.name}`}
                  </button>
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
                  {currentPlan.name}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 p-3 text-sm">
                <span className="text-slate-500">Amount</span>
                <span className="font-semibold text-slate-950">
                  {currentPlan.price}
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
                  {"\u20A6"}25,000
                </span>
              </div>

              <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 p-3 text-sm">
                <span className="text-slate-500">Managed</span>
                <span className="font-semibold text-slate-950">
                  {"\u20A6"}45k - {"\u20A6"}75k
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