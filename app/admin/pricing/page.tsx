"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BadgeDollarSign,
  Eye,
  Loader2,
  Package,
  RefreshCcw,
  Save,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  getMarketVillaPlan,
  getPlanPricingOverrideFromMetadata,
  normalizePlanId,
} from "@/lib/plans";

type PricingItem = {
  id: string;
  pricing_key: string;
  pricing_type: string;
  name: string;
  description: string | null;
  price_label: string | null;
  amount: number;
  amount_in_kobo: number;
  duration_days: number | null;
  product_limit: number | null;
  store_limit: number | null;
  is_active: boolean | null;
  sort_order: number | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

function formatNaira(value?: number | null) {
  return `₦${Number(value || 0).toLocaleString("en-NG")}`;
}

function getMetadataNumber(
  metadata: Record<string, unknown> | null,
  key: string,
  fallback: number,
) {
  const value = Number(metadata?.[key]);

  return Number.isFinite(value) && value >= 0 ? value : fallback;
}

function getSubscriptionPlanForItem(item: PricingItem) {
  return getMarketVillaPlan(
    normalizePlanId(item.pricing_key),
    getPlanPricingOverrideFromMetadata(item.metadata),
  );
}

function getSubscriptionAmountLabel(item: PricingItem) {
  if (item.pricing_type !== "subscription") {
    return formatNaira(item.amount);
  }

  const plan = getSubscriptionPlanForItem(item);

  return `Intro ${formatNaira(plan.introMonthlyAmount)}/mo`;
}

export default function AdminPricingPage() {
  const [items, setItems] = useState<PricingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [message, setMessage] = useState("");
  const [activeType, setActiveType] = useState<"subscription" | "visibility">(
    "subscription"
  );

  async function loadPricing() {
    setIsLoading(true);
    setMessage("");

    try {
      const { data, error } = await supabase
        .from("pricing_items")
        .select("*")
        .order("pricing_type", { ascending: true })
        .order("sort_order", { ascending: true });

      if (error) throw error;

      setItems((data || []) as PricingItem[]);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unable to load pricing.";
      setMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  async function updatePricingItem(
    event: FormEvent<HTMLFormElement>,
    item: PricingItem
  ) {
    event.preventDefault();
    setSavingId(item.id);
    setMessage("");

    const formData = new FormData(event.currentTarget);

    const formAmount = Number(formData.get("amount") || 0);
    const durationDaysValue = String(formData.get("durationDays") || "").trim();
    const productLimitValue = String(formData.get("productLimit") || "").trim();
    const storeLimitValue = String(formData.get("storeLimit") || "").trim();
    const introMonthlyAmount = Number(formData.get("introMonthlyAmount") || 0);
    const regularMonthlyAmount = Number(
      formData.get("regularMonthlyAmount") || 0,
    );
    const freeMonths = Number(formData.get("freeMonths") || 0);
    const introPaidMonths = Number(formData.get("introPaidMonths") || 0);

    try {
      if (formAmount < 0) {
        throw new Error("Amount cannot be negative.");
      }

      if (
        item.pricing_type === "subscription" &&
        (introMonthlyAmount < 0 ||
          regularMonthlyAmount < 0 ||
          freeMonths < 0 ||
          introPaidMonths < 0)
      ) {
        throw new Error("Subscription pricing values cannot be negative.");
      }

      const metadata =
        item.pricing_type === "subscription"
          ? {
              ...(item.metadata || {}),
              intro_monthly_amount: introMonthlyAmount,
              regular_monthly_amount: regularMonthlyAmount,
              free_months: freeMonths,
              intro_paid_months: introPaidMonths,
            }
          : item.metadata;

      const amount =
        item.pricing_type === "subscription" ? introMonthlyAmount : formAmount;

      const { error } = await supabase
        .from("pricing_items")
        .update({
          name: String(formData.get("name") || "").trim(),
          description: String(formData.get("description") || "").trim(),
          price_label: String(formData.get("priceLabel") || "").trim(),
          amount,
          amount_in_kobo: amount * 100,
          duration_days: durationDaysValue ? Number(durationDaysValue) : null,
          product_limit: productLimitValue ? Number(productLimitValue) : null,
          store_limit: storeLimitValue ? Number(storeLimitValue) : null,
          is_active: formData.get("isActive") === "on",
          sort_order: Number(formData.get("sortOrder") || 0),
          metadata,
          updated_at: new Date().toISOString(),
        })
        .eq("id", item.id);

      if (error) throw error;

      setMessage(`${item.name} pricing updated.`);
      await loadPricing();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unable to update pricing.";
      setMessage(errorMessage);
    } finally {
      setSavingId("");
    }
  }

  useEffect(() => {
    loadPricing();
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter((item) => item.pricing_type === activeType);
  }, [items, activeType]);

  const subscriptionCount = items.filter(
    (item) => item.pricing_type === "subscription"
  ).length;

  const visibilityCount = items.filter(
    (item) => item.pricing_type === "visibility"
  ).length;

  if (isLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f7f1ff] px-5">
        <div className="border border-slate-200 bg-white p-8 text-center shadow-sm">
          <Loader2 className="mx-auto animate-spin text-[#7c3aed]" size={28} />
          <p className="mt-4 text-sm text-slate-500">Loading pricing...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f1ff] px-5 py-8 text-slate-950 md:px-5">
      <section className="mx-auto max-w-7xl">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-[#7c3aed]/40 hover:text-[#7c3aed]"
          >
            <ArrowLeft size={16} />
            Back to Admin
          </Link>

          <button
            type="button"
            onClick={loadPricing}
            className="inline-flex items-center gap-2 rounded-full bg-[#7c3aed] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#8b5cf6]"
          >
            <RefreshCcw size={16} />
            Refresh
          </button>
        </div>

        <section className="border border-slate-200 bg-[#26143d] p-6 text-white shadow-sm md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7c3aed]">
            Admin Pricing
          </p>

          <h1 className="mt-3 max-w-3xl text-2xl font-semibold tracking-[-0.06em]">
            Manage Market Villa pricing from one place.
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/60">
            Update subscription plans, visibility packages, pricing labels,
            durations, limits, and availability without changing code.
          </p>

          <div className="mt-5 max-w-3xl border border-white/15 bg-white/10 p-4 text-sm font-semibold leading-6 text-white">
            Starter rule: no billing at all for the first month. Quarterly
            billing starts from month 2, currently ₦2,000/month for the next 3
            months.
          </div>
        </section>

        {message ? (
          <div className="mt-5 border border-purple-200 bg-purple-50 p-4 text-sm text-slate-700">
            {message}
          </div>
        ) : null}

        <section className="mt-5 grid gap-4 md:grid-cols-3">
          <button
            type="button"
            onClick={() => setActiveType("subscription")}
            className={`border p-5 text-left shadow-sm transition ${
              activeType === "subscription"
                ? "border-[#7c3aed] bg-white"
                : "border-slate-200 bg-white/70 hover:bg-white"
            }`}
          >
            <span className="grid h-10 w-10 place-items-center bg-[#7c3aed] text-white">
              <Package size={18} />
            </span>

            <p className="mt-4 text-xl font-semibold tracking-[-0.04em]">
              Subscription Plans
            </p>

            <p className="mt-2 text-sm text-slate-500">
              {subscriptionCount} plan records
            </p>
          </button>

          <button
            type="button"
            onClick={() => setActiveType("visibility")}
            className={`border p-5 text-left shadow-sm transition ${
              activeType === "visibility"
                ? "border-[#7c3aed] bg-white"
                : "border-slate-200 bg-white/70 hover:bg-white"
            }`}
          >
            <span className="grid h-10 w-10 place-items-center bg-[#7c3aed] text-white">
              <Eye size={18} />
            </span>

            <p className="mt-4 text-xl font-semibold tracking-[-0.04em]">
              Visibility Packages
            </p>

            <p className="mt-2 text-sm text-slate-500">
              {visibilityCount} package records
            </p>
          </button>

          <div className="border border-slate-200 bg-white p-5 shadow-sm">
            <span className="grid h-10 w-10 place-items-center bg-[#26143d] text-white">
              <BadgeDollarSign size={18} />
            </span>

            <p className="mt-4 text-xl font-semibold tracking-[-0.04em]">
              Pricing Source
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Billing, Paystack checkout, and payment verification use these
              active subscription prices.
            </p>
          </div>
        </section>

        <section className="mt-5 grid gap-4">
          {filteredItems.map((item) => (
            <form
              key={item.id}
              onSubmit={(event) => updatePricingItem(event, item)}
              className="border border-slate-200 bg-white p-5 shadow-sm"
            >
              {(() => {
                const subscriptionPlan = getSubscriptionPlanForItem(item);
                const isSubscription = item.pricing_type === "subscription";
                const introMonthlyAmount = getMetadataNumber(
                  item.metadata,
                  "intro_monthly_amount",
                  subscriptionPlan.introMonthlyAmount,
                );
                const regularMonthlyAmount = getMetadataNumber(
                  item.metadata,
                  "regular_monthly_amount",
                  subscriptionPlan.regularMonthlyAmount,
                );
                const freeMonths = getMetadataNumber(
                  item.metadata,
                  "free_months",
                  subscriptionPlan.freeMonths,
                );
                const introPaidMonths = getMetadataNumber(
                  item.metadata,
                  "intro_paid_months",
                  subscriptionPlan.introPaidMonths,
                );

                return (
              <div className="grid gap-5 xl:grid-cols-[1fr_0.8fr]">
                <div>
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-[#7c3aed] ring-1 ring-purple-100">
                      {item.pricing_key}
                    </span>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${
                        item.is_active
                          ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                          : "bg-slate-100 text-slate-500 ring-slate-200"
                      }`}
                    >
                      {item.is_active ? "Active" : "Inactive"}
                    </span>

                    <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500 ring-1 ring-slate-200">
                      {getSubscriptionAmountLabel(item)}
                    </span>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="grid gap-2 text-sm font-semibold text-slate-700">
                      Name
                      <input
                        name="name"
                        defaultValue={item.name}
                        className="min-h-10 border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 outline-none focus:border-[#7c3aed]"
                        required
                      />
                    </label>

                    <label className="grid gap-2 text-sm font-semibold text-slate-700">
                      Price label
                      <input
                        name="priceLabel"
                        defaultValue={item.price_label || ""}
                        className="min-h-10 border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 outline-none focus:border-[#7c3aed]"
                        required
                      />
                    </label>
                  </div>

                  <label className="mt-4 grid gap-2 text-sm font-semibold text-slate-700">
                    Description
                    <textarea
                      name="description"
                      defaultValue={item.description || ""}
                      rows={3}
                      className="border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 outline-none focus:border-[#7c3aed]"
                    />
                  </label>
                </div>

                <div className="grid gap-4">
                  {isSubscription ? (
                    <input
                      type="hidden"
                      name="amount"
                      value={introMonthlyAmount}
                    />
                  ) : null}

                  {isSubscription ? (
                    <div className="grid gap-4 rounded-[1rem] border border-purple-100 bg-purple-50/60 p-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7c3aed]">
                          Subscription price model
                        </p>
                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          These fields are used by the billing page and Paystack
                          checkout. The free month is treated as the trial
                          period before paid quarterly billing starts.
                        </p>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <label className="grid gap-2 text-sm font-semibold text-slate-700">
                          Intro monthly amount
                          <input
                            name="introMonthlyAmount"
                            type="number"
                            min="0"
                            defaultValue={introMonthlyAmount}
                            className="min-h-10 border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 outline-none focus:border-[#7c3aed]"
                            required
                          />
                        </label>

                        <label className="grid gap-2 text-sm font-semibold text-slate-700">
                          Regular monthly amount
                          <input
                            name="regularMonthlyAmount"
                            type="number"
                            min="0"
                            defaultValue={regularMonthlyAmount}
                            className="min-h-10 border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 outline-none focus:border-[#7c3aed]"
                            required
                          />
                        </label>

                        <label className="grid gap-2 text-sm font-semibold text-slate-700">
                          Free months
                          <input
                            name="freeMonths"
                            type="number"
                            min="0"
                            defaultValue={freeMonths}
                            className="min-h-10 border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 outline-none focus:border-[#7c3aed]"
                            required
                          />
                        </label>

                        <label className="grid gap-2 text-sm font-semibold text-slate-700">
                          Intro paid months
                          <input
                            name="introPaidMonths"
                            type="number"
                            min="0"
                            defaultValue={introPaidMonths}
                            className="min-h-10 border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 outline-none focus:border-[#7c3aed]"
                            required
                          />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="grid gap-2 text-sm font-semibold text-slate-700">
                        Amount
                        <input
                          name="amount"
                          type="number"
                          min="0"
                          defaultValue={item.amount}
                          className="min-h-10 border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 outline-none focus:border-[#7c3aed]"
                          required
                        />
                      </label>

                      <label className="grid gap-2 text-sm font-semibold text-slate-700">
                        Duration days
                        <input
                          name="durationDays"
                          type="number"
                          min="0"
                          defaultValue={item.duration_days || ""}
                          className="min-h-10 border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 outline-none focus:border-[#7c3aed]"
                          placeholder="Empty for permanent"
                        />
                      </label>
                    </div>
                  )}

                  {isSubscription ? (
                    <input
                      type="hidden"
                      name="durationDays"
                      value={item.duration_days || ""}
                    />
                  ) : null}

                  <div className="grid gap-4 md:grid-cols-3">
                    <label className="grid gap-2 text-sm font-semibold text-slate-700">
                      Product limit
                      <input
                        name="productLimit"
                        type="number"
                        min="0"
                        defaultValue={item.product_limit || ""}
                        className="min-h-10 border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 outline-none focus:border-[#7c3aed]"
                        placeholder="Unlimited"
                      />
                    </label>

                    <label className="grid gap-2 text-sm font-semibold text-slate-700">
                      Store limit
                      <input
                        name="storeLimit"
                        type="number"
                        min="0"
                        defaultValue={item.store_limit || ""}
                        className="min-h-10 border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 outline-none focus:border-[#7c3aed]"
                        placeholder="Unlimited"
                      />
                    </label>

                    <label className="grid gap-2 text-sm font-semibold text-slate-700">
                      Sort order
                      <input
                        name="sortOrder"
                        type="number"
                        defaultValue={item.sort_order || 0}
                        className="min-h-10 border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 outline-none focus:border-[#7c3aed]"
                      />
                    </label>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 border border-slate-200 bg-slate-50 p-4">
                    <label className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                      <input
                        name="isActive"
                        type="checkbox"
                        defaultChecked={Boolean(item.is_active)}
                        className="h-4 w-4 accent-[#7c3aed]"
                      />
                      Active pricing item
                    </label>

                    <button
                      type="submit"
                      disabled={savingId === item.id}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-[#7c3aed] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#8b5cf6] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {savingId === item.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Save size={16} />
                      )}
                      {savingId === item.id ? "Saving..." : "Save pricing"}
                    </button>
                  </div>
                </div>
              </div>
                );
              })()}
            </form>
          ))}

          {filteredItems.length === 0 ? (
            <div className="border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
              No pricing items found for this section.
            </div>
          ) : null}
        </section>
      </section>
    </main>
  );
}

