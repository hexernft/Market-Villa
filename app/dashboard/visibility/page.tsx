"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Copy,
  Eye,
  Flame,
  Loader2,
  MessageCircle,
  Sparkles,
  Star,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getVisibilityPackageList } from "@/lib/visibility-packages";

type BusinessVisibility = {
  id: string;
  name: string;
  slug: string;
  is_published?: boolean | null;
  is_featured?: boolean | null;
  featured_until?: string | null;
  is_verified?: boolean | null;
  weekly_views?: number | null;
  total_views?: number | null;
  whatsapp_clicks?: number | null;
  copy_link_clicks?: number | null;
  visibility_plan?: string | null;
  created_at?: string | null;
};

type VisibilityPricingItem = {
  pricing_key: string;
  name: string;
  description: string | null;
  price_label: string | null;
  amount: number;
  amount_in_kobo: number;
  duration_days: number | null;
  is_active: boolean | null;
  sort_order: number | null;
};

type VisibilityPurchase = {
  id: string;
  business_id: string;
  request_type?: string | null;
  status?: string | null;
  payment_reference?: string | null;
  amount?: number | null;
  currency?: string | null;
  paid_at?: string | null;
  activated_at?: string | null;
  expires_at?: string | null;
  package_name?: string | null;
  package_price_label?: string | null;
  created_at?: string | null;
};

function formatNumber(value?: number | null) {
  return Number(value || 0).toLocaleString();
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

  const expiry = new Date(value).getTime();
  const now = new Date().getTime();
  const diff = expiry - now;

  if (diff <= 0) return 0;

  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function isFeaturedActive(business: BusinessVisibility) {
  if (!business.is_featured) return false;
  if (!business.featured_until) return true;

  return new Date(business.featured_until) > new Date();
}

const fallbackVisibilityPackages: VisibilityPricingItem[] = [];

export default function VisibilityPage() {
  const searchParams = useSearchParams();
  const [businesses, setBusinesses] = useState<BusinessVisibility[]>([]);
  const [visibilityPurchases, setVisibilityPurchases] = useState<
    VisibilityPurchase[]
  >([]);
  const [visibilityPricingItems, setVisibilityPricingItems] = useState<
    VisibilityPricingItem[]
  >([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [isRequestingFeature, setIsRequestingFeature] = useState(false);
  const [selectedVisibilityPackage, setSelectedVisibilityPackage] =
    useState("featured_store");

  const selectedBusiness = useMemo(() => {
    return businesses.find((business) => business.id === selectedBusinessId);
  }, [businesses, selectedBusinessId]);

  const selectedBusinessPurchases = useMemo(() => {
    return visibilityPurchases.filter(
      (purchase) => purchase.business_id === selectedBusinessId
    );
  }, [visibilityPurchases, selectedBusinessId]);

  const visibilityPackages = useMemo(() => {
    return visibilityPricingItems.length > 0
      ? visibilityPricingItems
      : fallbackVisibilityPackages;
  }, [visibilityPricingItems]);

  async function loadBusinesses() {
    setIsLoading(true);
    setMessage("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) throw new Error("No logged-in user found.");

      const { data, error } = await supabase
        .from("businesses")
        .select(
          "id,name,slug,is_published,is_featured,featured_until,is_verified,weekly_views,total_views,whatsapp_clicks,copy_link_clicks,visibility_plan,created_at"
        )
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const items = (data || []) as BusinessVisibility[];

      setBusinesses(items);

      if (items.length > 0) {
        setSelectedBusinessId((current) => current || items[0].id);

        const businessIds = items.map((business) => business.id);

        const { data: purchaseItems, error: purchaseError } = await supabase
          .from("visibility_requests")
          .select(
            "id,business_id,request_type,status,payment_reference,amount,currency,paid_at,activated_at,expires_at,package_name,package_price_label,created_at"
          )
          .in("business_id", businessIds)
          .order("created_at", { ascending: false });

        if (purchaseError) throw purchaseError;

        setVisibilityPurchases((purchaseItems || []) as VisibilityPurchase[]);
      } else {
        setVisibilityPurchases([]);
      }

      const { data: pricingItems, error: pricingError } = await supabase
        .from("pricing_items")
        .select(
          "pricing_key,name,description,price_label,amount,amount_in_kobo,duration_days,is_active,sort_order"
        )
        .eq("pricing_type", "visibility")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (pricingError) throw pricingError;

      setVisibilityPricingItems((pricingItems || []) as VisibilityPricingItem[]);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unable to load visibility dashboard.";

      setMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  async function copyStoreLink() {
    if (!selectedBusiness?.slug) return;

    const url = `${window.location.origin}/store/${selectedBusiness.slug}`;

    try {
      await navigator.clipboard.writeText(url);
      setMessage("Store link copied.");
    } catch {
      setMessage(url);
    }
  }

  async function requestFeaturedPlacement() {
    if (!selectedBusiness?.id) {
      setMessage("Select a business first.");
      return;
    }

    setIsRequestingFeature(true);
    setMessage("");

    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;

      if (!token) {
        throw new Error("Please login again to continue.");
      }

      const response = await fetch("/api/visibility/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          businessId: selectedBusiness.id,
          packageId: selectedVisibilityPackage,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || "Unable to start visibility payment.");
      }

      if (!result?.authorizationUrl) {
        throw new Error("Paystack checkout link was not returned.");
      }

      window.location.href = result.authorizationUrl;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unable to start visibility payment.";

      setMessage(errorMessage);
      setIsRequestingFeature(false);
    }
  }

  async function verifyVisibilityPayment(reference: string) {
    setMessage("Confirming visibility payment...");

    try {
      const response = await fetch("/api/visibility/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reference }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || "Unable to verify visibility payment.");
      }

      if (result.success) {
        setMessage(
          result.message ||
            "Payment verified. Visibility package activated automatically."
        );

        await loadBusinesses();

        window.history.replaceState({}, "", "/dashboard/visibility");
      } else {
        setMessage(result.message || "Payment was not successful.");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unable to verify visibility payment.";

      setMessage(errorMessage);
    }
  }

  useEffect(() => {
    loadBusinesses();
  }, []);

  useEffect(() => {
    const reference = searchParams.get("visibility_reference");

    if (reference) {
      verifyVisibilityPayment(reference);
    }
  }, [searchParams]);

  if (isLoading) {
    return (
      <main className="grid min-h-[55vh] place-items-center">
        <div className="border border-slate-200 bg-white p-8 text-center shadow-sm">
          <Loader2 className="mx-auto animate-spin text-slate-950" size={28} />
          <p className="mt-4 text-sm text-slate-500">
            Loading visibility dashboard...
          </p>
        </div>
      </main>
    );
  }

  if (businesses.length === 0) {
    return (
      <section className="mx-auto max-w-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto grid h-12 w-12 place-items-center bg-[#ff6a00] text-white">
          <Sparkles size={20} />
        </div>

        <h2 className="mt-5 text-2xl font-semibold tracking-[-0.04em] text-slate-950">
          Create a business page first
        </h2>

        <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-500">
          Once your store is published, visibility insights will appear here.
        </p>

        <Link
          href="/dashboard/onboarding"
          className="mt-7 inline-flex items-center justify-center gap-2 rounded-full bg-[#ff6a00] px-6 py-3.5 text-sm font-semibold text-white hover:bg-[#ff8126]"
        >
          Start setup
          <ArrowRight size={16} />
        </Link>
      </section>
    );
  }

  const featuredActive = selectedBusiness
    ? isFeaturedActive(selectedBusiness)
    : false;

  function renewVisibilityPackage(packageId?: string | null) {
    if (!packageId) return;

    setSelectedVisibilityPackage(packageId);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  const statCards = [
    {
      label: "Total views",
      value: formatNumber(selectedBusiness?.total_views),
      icon: Eye,
    },
    {
      label: "Weekly views",
      value: formatNumber(selectedBusiness?.weekly_views),
      icon: BarChart3,
    },
    {
      label: "WhatsApp clicks",
      value: formatNumber(selectedBusiness?.whatsapp_clicks),
      icon: MessageCircle,
    },
    {
      label: "Copied links",
      value: formatNumber(selectedBusiness?.copy_link_clicks),
      icon: Copy,
    },
  ];

  return (
    <div className="grid gap-5">
      <section className="border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#ff6a00]">
              Visibility
            </p>

            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-950">
              Store visibility dashboard
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Track how people discover your store, copy your link, and move to
              WhatsApp.
            </p>
          </div>

          <select
            value={selectedBusinessId}
            onChange={(event) => setSelectedBusinessId(event.target.value)}
            className="h-11 min-w-72 border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none focus:border-[#ff6a00]"
          >
            {businesses.map((business) => (
              <option key={business.id} value={business.id}>
                {business.name}
              </option>
            ))}
          </select>
        </div>
      </section>

      {message ? (
        <div className="border border-orange-200 bg-orange-50 p-4 text-sm text-slate-700">
          {message}
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.label}
              className="border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="grid h-10 w-10 place-items-center bg-[#ff6a00] text-white">
                  <Icon size={17} />
                </span>

                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                  {card.label}
                </span>
              </div>

              <p className="mt-8 text-3xl font-semibold tracking-[-0.05em] text-slate-950">
                {card.value}
              </p>
            </div>
          );
        })}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_0.85fr]">
        <div className="border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#ff6a00]">
                Discovery status
              </p>

              <h3 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-slate-950">
                {selectedBusiness?.name}
              </h3>
            </div>

            {selectedBusiness?.is_published ? (
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                Published
              </span>
            ) : (
              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
                Draft
              </span>
            )}
          </div>

          <div className="grid gap-3">
            <div className="flex items-center justify-between border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <BadgeCheck
                  size={18}
                  className={
                    selectedBusiness?.is_verified
                      ? "text-emerald-600"
                      : "text-slate-400"
                  }
                />
                <span className="text-sm font-semibold text-slate-700">
                  Verified badge
                </span>
              </div>

              <span className="text-sm font-semibold text-slate-500">
                {selectedBusiness?.is_verified ? "Active" : "Not active"}
              </span>
            </div>

            <div className="flex items-center justify-between border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <Star
                  size={18}
                  className={featuredActive ? "text-[#ff6a00]" : "text-slate-400"}
                />
                <span className="text-sm font-semibold text-slate-700">
                  Featured placement
                </span>
              </div>

              <span className="text-sm font-semibold text-slate-500">
                {featuredActive ? "Active" : "Standard"}
              </span>
            </div>

            <div className="flex items-center justify-between border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <Flame size={18} className="text-[#ff6a00]" />
                <span className="text-sm font-semibold text-slate-700">
                  Visibility plan
                </span>
              </div>

              <span className="text-sm font-semibold capitalize text-slate-500">
                {selectedBusiness?.visibility_plan || "standard"}
              </span>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            {selectedBusiness?.slug ? (
              <Link
                href={`/store/${selectedBusiness.slug}`}
                target="_blank"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#ff6a00] px-5 py-3 text-sm font-semibold text-white hover:bg-[#ff8126]"
              >
                View store
                <ArrowRight size={16} />
              </Link>
            ) : null}

            <button
              type="button"
              onClick={copyStoreLink}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:border-[#ff6a00]/40 hover:text-[#ff6a00]"
            >
              <Copy size={16} />
              Copy link
            </button>
          </div>
        </div>

        <aside className="border border-slate-200 bg-slate-950 p-5 text-white shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/40">
            Visibility products
          </p>

          <h3 className="mt-3 text-2xl font-semibold tracking-[-0.05em]">
            Get more eyes on your store.
          </h3>

          <p className="mt-3 text-sm leading-7 text-white/65">
            Choose a visibility package. We will review your store and confirm
            payment/setup details before placement goes live.
          </p>

          <div className="mt-6 grid gap-3">
            {visibilityPackages.map((item) => {
              const isSelected = selectedVisibilityPackage === item.pricing_key;

              return (
                <button
                  key={item.pricing_key}
                  type="button"
                  onClick={() => setSelectedVisibilityPackage(item.pricing_key)}
                  className={`text-left transition ${
                    isSelected
                      ? "border-[#ff6a00] bg-[#ff6a00]/15"
                      : "border-white/10 bg-white/5 hover:border-[#ff6a00]/50 hover:bg-white/10"
                  } border p-4`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {item.name}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-white/55">
                        {item.description}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold ${
                        isSelected
                          ? "bg-[#ff6a00] text-white"
                          : "bg-white/10 text-white/70"
                      }`}
                    >
                      {item.price_label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={requestFeaturedPlacement}
            disabled={isRequestingFeature}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isRequestingFeature ? (
              <Loader2 size={16} className="animate-spin" />
            ) : null}
            {isRequestingFeature
              ? "Opening Paystack..."
              : "Pay for selected package"}
          </button>

          <p className="mt-4 text-center text-xs leading-5 text-white/40">
            After successful Paystack payment, the selected visibility package is activated automatically.
          </p>
        </aside>
      </section>

      <section className="border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#ff6a00]">
              Purchase history
            </p>

            <h3 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-slate-950">
              Visibility package history
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Track paid visibility packages, activation status, and expiry dates.
            </p>
          </div>

          <span className="rounded-full bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-500 ring-1 ring-slate-200">
            {selectedBusinessPurchases.length} records
          </span>
        </div>

        {selectedBusinessPurchases.length > 0 ? (
          <div className="grid gap-3">
            {selectedBusinessPurchases.map((purchase) => (
              <article
                key={purchase.id}
                className="grid gap-4 border border-slate-200 bg-slate-50 p-4 md:grid-cols-[1fr_auto] md:items-center"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                      {purchase.package_name || purchase.request_type || "Visibility package"}
                    </span>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ring-1 ${
                        purchase.status === "approved"
                          ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                          : purchase.status === "pending_payment"
                          ? "bg-amber-50 text-amber-700 ring-amber-200"
                          : purchase.status === "rejected"
                          ? "bg-red-50 text-red-700 ring-red-200"
                          : "bg-slate-100 text-slate-600 ring-slate-200"
                      }`}
                    >
                      {purchase.status || "pending"}
                    </span>

                    <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-[#ff6a00] ring-1 ring-orange-100">
                      {purchase.package_price_label ||
                        `₦${Number(purchase.amount || 0).toLocaleString()}`}
                    </span>
                  </div>

                  <div className="mt-3 grid gap-2 text-xs text-slate-500 md:grid-cols-3">
                    <p>
                      <span className="font-semibold text-slate-700">Paid:</span>{" "}
                      {formatDate(purchase.paid_at)}
                    </p>

                    <p>
                      <span className="font-semibold text-slate-700">
                        Activated:
                      </span>{" "}
                      {formatDate(purchase.activated_at)}
                    </p>

                    <p>
                      <span className="font-semibold text-slate-700">Expires:</span>{" "}
                      {formatDate(purchase.expires_at)}
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 text-xs text-slate-400 md:text-right">
                  {(() => {
                    const daysRemaining = getDaysRemaining(purchase.expires_at);
                    const isExpired = daysRemaining === 0;
                    const isPermanent = daysRemaining === null;

                    return (
                      <div>
                        <p className="font-semibold text-slate-500">
                          {isPermanent ? "Duration" : "Days remaining"}
                        </p>

                        <p
                          className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            isPermanent
                              ? "bg-slate-100 text-slate-600"
                              : isExpired
                              ? "bg-red-50 text-red-700 ring-1 ring-red-200"
                              : daysRemaining <= 3
                              ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
                              : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                          }`}
                        >
                          {isPermanent
                            ? "Permanent"
                            : isExpired
                            ? "Expired"
                            : `${daysRemaining} day${daysRemaining === 1 ? "" : "s"}`}
                        </p>
                      </div>
                    );
                  })()}

                  <div>
                    <p className="font-semibold text-slate-500">Reference</p>
                    <p className="mt-1 max-w-[240px] truncate">
                      {purchase.payment_reference || "No reference"}
                    </p>
                  </div>

                  {purchase.request_type && purchase.request_type !== "verified_badge" ? (
                    <button
                      type="button"
                      onClick={() => renewVisibilityPackage(purchase.request_type)}
                      className="inline-flex items-center justify-center rounded-full bg-[#ff6a00] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#ff8126]"
                    >
                      Renew package
                    </button>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <p className="text-sm font-semibold text-slate-700">
              No visibility purchases yet
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Paid visibility packages will appear here after payment.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}