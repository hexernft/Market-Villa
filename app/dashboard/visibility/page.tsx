"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
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

function formatNumber(value?: number | null) {
  return Number(value || 0).toLocaleString();
}

function isFeaturedActive(business: BusinessVisibility) {
  if (!business.is_featured) return false;
  if (!business.featured_until) return true;

  return new Date(business.featured_until) > new Date();
}

export default function VisibilityPage() {
  const [businesses, setBusinesses] = useState<BusinessVisibility[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  const selectedBusiness = useMemo(() => {
    return businesses.find((business) => business.id === selectedBusinessId);
  }, [businesses, selectedBusinessId]);

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
      }
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

  useEffect(() => {
    loadBusinesses();
  }, []);

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
            Growth opportunity
          </p>

          <h3 className="mt-3 text-2xl font-semibold tracking-[-0.05em]">
            Get more eyes on your store.
          </h3>

          <p className="mt-3 text-sm leading-7 text-white/65">
            Featured stores appear higher in the discovery page and can be
            promoted in weekly Market Villa highlights.
          </p>

          <div className="mt-6 grid gap-3">
            {[
              "Store of the Week placement",
              "Verified badge for trust",
              "Higher category visibility",
              "Weekly performance insights",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 border border-white/10 bg-white/5 p-4"
              >
                <Sparkles size={16} className="text-[#ff6a00]" />
                <span className="text-sm text-white/75">{item}</span>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-orange-50"
          >
            Request featured placement
          </button>
        </aside>
      </section>
    </div>
  );
}