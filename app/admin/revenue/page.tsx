"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BadgeCheck,
  Banknote,
  Eye,
  Flame,
  Loader2,
  ReceiptText,
  TrendingUp,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type SubscriptionPayment = {
  id: string;
  business_id?: string | null;
  owner_id?: string | null;
  plan?: string | null;
  amount?: number | null;
  currency?: string | null;
  reference?: string | null;
  status?: string | null;
  paid_at?: string | null;
  created_at?: string | null;
};

type VisibilityPurchase = {
  id: string;
  business_id?: string | null;
  request_type?: string | null;
  status?: string | null;
  amount?: number | null;
  currency?: string | null;
  payment_reference?: string | null;
  package_name?: string | null;
  package_price_label?: string | null;
  paid_at?: string | null;
  activated_at?: string | null;
  expires_at?: string | null;
  created_at?: string | null;
  businesses?: {
    name?: string | null;
    slug?: string | null;
  } | null;
};

type FeaturedBusiness = {
  id: string;
  name?: string | null;
  slug?: string | null;
  visibility_plan?: string | null;
  featured_until?: string | null;
  is_featured?: boolean | null;
  is_verified?: boolean | null;
};

function formatNaira(value?: number | null) {
  return `â‚¦${Number(value || 0).toLocaleString()}`;
}

function formatDate(value?: string | null) {
  if (!value) return "Not available";

  return new Intl.DateTimeFormat("en-NG", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function getDaysRemaining(value?: string | null) {
  if (!value) return null;

  const diff = new Date(value).getTime() - Date.now();

  if (diff <= 0) return 0;

  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function AdminRevenuePage() {
  const [payments, setPayments] = useState<SubscriptionPayment[]>([]);
  const [visibilityPurchases, setVisibilityPurchases] = useState<
    VisibilityPurchase[]
  >([]);
  const [featuredBusinesses, setFeaturedBusinesses] = useState<
    FeaturedBusiness[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function loadRevenueData() {
    setIsLoading(true);
    setMessage("");

    try {
      const [paymentsResult, visibilityResult, featuredResult] =
        await Promise.all([
          supabase
            .from("payments")
            .select(
              "id,business_id,owner_id,plan,amount,currency,reference,status,paid_at,created_at"
            )
            .order("created_at", { ascending: false }),
          supabase
            .from("visibility_requests")
            .select(
              `
              id,
              business_id,
              request_type,
              status,
              amount,
              currency,
              payment_reference,
              package_name,
              package_price_label,
              paid_at,
              activated_at,
              expires_at,
              created_at,
              businesses (
                name,
                slug
              )
            `
            )
            .order("created_at", { ascending: false }),
          supabase
            .from("businesses")
            .select(
              "id,name,slug,visibility_plan,featured_until,is_featured,is_verified"
            )
            .or("is_featured.eq.true,is_verified.eq.true")
            .order("updated_at", { ascending: false }),
        ]);

      if (paymentsResult.error) throw paymentsResult.error;
      if (visibilityResult.error) throw visibilityResult.error;
      if (featuredResult.error) throw featuredResult.error;

      setPayments((paymentsResult.data || []) as SubscriptionPayment[]);
      setVisibilityPurchases(
        (visibilityResult.data || []) as VisibilityPurchase[]
      );
      setFeaturedBusinesses((featuredResult.data || []) as FeaturedBusiness[]);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unable to load revenue data.";

      setMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadRevenueData();
  }, []);

  const metrics = useMemo(() => {
    const successfulSubscriptionPayments = payments.filter(
      (payment) => payment.status === "success"
    );

    const subscriptionRevenue = successfulSubscriptionPayments.reduce(
      (sum, payment) => sum + Number(payment.amount || 0),
      0
    );

    const approvedVisibilityPurchases = visibilityPurchases.filter(
      (purchase) => purchase.status === "approved"
    );

    const visibilityRevenue = approvedVisibilityPurchases.reduce(
      (sum, purchase) => sum + Number(purchase.amount || 0),
      0
    );

    const pendingVisibilityPayments = visibilityPurchases.filter(
      (purchase) => purchase.status === "pending_payment"
    ).length;

    const activeFeaturedStores = featuredBusinesses.filter(
      (business) => business.is_featured
    ).length;

    const verifiedStores = featuredBusinesses.filter(
      (business) => business.is_verified
    ).length;

    return {
      subscriptionRevenue,
      visibilityRevenue,
      totalRevenue: subscriptionRevenue + visibilityRevenue,
      successfulSubscriptionPayments: successfulSubscriptionPayments.length,
      approvedVisibilityPurchases: approvedVisibilityPurchases.length,
      pendingVisibilityPayments,
      activeFeaturedStores,
      verifiedStores,
    };
  }, [payments, visibilityPurchases, featuredBusinesses]);

  const statCards = [
    {
      label: "Total revenue",
      value: formatNaira(metrics.totalRevenue),
      icon: Banknote,
      detail: "Subscriptions + visibility",
    },
    {
      label: "Subscription revenue",
      value: formatNaira(metrics.subscriptionRevenue),
      icon: ReceiptText,
      detail: `${metrics.successfulSubscriptionPayments} successful payments`,
    },
    {
      label: "Visibility revenue",
      value: formatNaira(metrics.visibilityRevenue),
      icon: TrendingUp,
      detail: `${metrics.approvedVisibilityPurchases} approved purchases`,
    },
    {
      label: "Pending visibility",
      value: String(metrics.pendingVisibilityPayments),
      icon: Eye,
      detail: "Awaiting payment completion",
    },
    {
      label: "Active featured stores",
      value: String(metrics.activeFeaturedStores),
      icon: Flame,
      detail: `${metrics.verifiedStores} verified stores`,
    },
  ];

  if (isLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f7f1ff] px-5">
        <div className="border border-slate-200 bg-white p-8 text-center shadow-sm">
          <Loader2 className="mx-auto animate-spin text-[#7c3aed]" size={28} />
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
            onClick={loadRevenueData}
            className="inline-flex items-center rounded-full bg-[#7c3aed] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#8b5cf6]"
          >
            Refresh data
          </button>
        </div>

        <section className="border border-slate-200 bg-[#26143d] p-6 text-white shadow-sm md:p-8">

          <h1 className="mt-3 max-w-3xl text-2xl font-semibold tracking-[-0.06em]">
            Market Villa monetisation dashboard
          </h1>
        </section>

        {message ? (
          <div className="mt-5 border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {message}
          </div>
        ) : null}

        <section className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {statCards.map((card) => {
            const Icon = card.icon;

            return (
              <article
                key={card.label}
                className="border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="grid h-10 w-10 place-items-center bg-[#7c3aed] text-white">
                    <Icon size={18} />
                  </span>

                  <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    {card.label}
                  </span>
                </div>

                <p className="mt-7 text-2xl font-semibold tracking-[-0.05em] text-slate-950">
                  {card.value}
                </p>
              </article>
            );
          })}
        </section>

        <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_0.9fr]">
          <div className="border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-end justify-between gap-3">
              <div>

                <h2 className="mt-2 text-xl font-semibold tracking-[-0.04em]">
                  Visibility package purchases
                </h2>
              </div>

              <span className="rounded-full bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-500 ring-1 ring-slate-200">
                {visibilityPurchases.length} records
              </span>
            </div>

            <div className="grid gap-3">
              {visibilityPurchases.slice(0, 10).map((purchase) => {
                const daysRemaining = getDaysRemaining(purchase.expires_at);

                return (
                  <article
                    key={purchase.id}
                    className="border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap gap-2">
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                            {purchase.package_name ||
                              purchase.request_type ||
                              "Visibility package"}
                          </span>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ring-1 ${
                              purchase.status === "approved"
                                ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                                : purchase.status === "pending_payment"
                                ? "bg-purple-50 text-purple-700 ring-purple-200"
                                : purchase.status === "expired"
                                ? "bg-slate-100 text-slate-600 ring-slate-200"
                                : "bg-red-50 text-red-700 ring-red-200"
                            }`}
                          >
                            {purchase.status || "pending"}
                          </span>
                        </div>

                        <p className="mt-3 text-sm font-semibold text-slate-950">
                          {purchase.businesses?.name || "Unknown business"}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          /store/{purchase.businesses?.slug || "no-slug"}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-950">
                          {purchase.package_price_label ||
                            formatNaira(purchase.amount)}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Paid: {formatDate(purchase.paid_at)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-3 text-xs text-slate-500">
                      <span>
                        Ref:{" "}
                        <span className="font-semibold">
                          {purchase.payment_reference || "No reference"}
                        </span>
                      </span>

                      <span>
                        {daysRemaining === null
                          ? "Permanent"
                          : daysRemaining === 0
                          ? "Expired"
                          : `${daysRemaining} days left`}
                      </span>
                    </div>
                  </article>
                );
              })}

              {null}
            </div>
          </div>

          <div className="grid gap-5">
            <div className="border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-end justify-between gap-3">
                <div>

                  <h2 className="mt-2 text-xl font-semibold tracking-[-0.04em]">
                    Latest subscription payments
                  </h2>
                </div>
              </div>

              <div className="grid gap-3">
                {payments.slice(0, 8).map((payment) => (
                  <article
                    key={payment.id}
                    className="flex items-center justify-between gap-4 border border-slate-200 bg-slate-50 p-4"
                  >
                    <div>
                      <p className="text-sm font-semibold capitalize text-slate-950">
                        {payment.plan || "Unknown plan"}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {payment.reference || "No reference"}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-950">
                        {formatNaira(payment.amount)}
                      </p>

                      <p
                        className={`mt-1 text-xs font-semibold capitalize ${
                          payment.status === "success"
                            ? "text-emerald-600"
                            : payment.status === "pending"
                            ? "text-purple-600"
                            : "text-red-600"
                        }`}
                      >
                        {payment.status || "unknown"}
                      </p>
                    </div>
                  </article>
                ))}

                {null}
              </div>
            </div>

            <div className="border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-end justify-between gap-3">
                <div>

                  <h2 className="mt-2 text-xl font-semibold tracking-[-0.04em]">
                    Featured and verified stores
                  </h2>
                </div>
              </div>

              <div className="grid gap-3">
                {featuredBusinesses.slice(0, 8).map((business) => {
                  const daysRemaining = getDaysRemaining(business.featured_until);

                  return (
                    <article
                      key={business.id}
                      className="flex items-center justify-between gap-4 border border-slate-200 bg-slate-50 p-4"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-950">
                          {business.name || "Untitled business"}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          /store/{business.slug || "no-slug"}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        {business.is_featured ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-[#7c3aed] ring-1 ring-purple-100">
                            <Flame size={13} />
                            {daysRemaining === null
                              ? "Featured"
                              : daysRemaining === 0
                              ? "Expired"
                              : `${daysRemaining}d left`}
                          </span>
                        ) : null}

                        {business.is_verified ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
                            <BadgeCheck size={13} />
                            Verified
                          </span>
                        ) : null}
                      </div>
                    </article>
                  );
                })}

                {null}
              </div>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}







