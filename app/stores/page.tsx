"use client";

import { useEffect, useMemo, useState } from "react";
import { StoreSmartSearch } from "@/components/StoreSmartSearch";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Copy,
  Search,
  Store,
  Tag,
  Check,
} from "lucide-react";
import { PlatformFooter } from "@/components/PlatformFooter";
import { PlatformNavbar } from "@/components/PlatformNavbar";
import { supabase } from "@/lib/supabase";

type MarketStore = {
  id: string;
  name?: string | null;
  slug?: string | null;
  description?: string | null;
  business_type?: string | null;
  category?: string | null;
  location?: string | null;
  city?: string | null;
  whatsapp?: string | null;
  phone?: string | null;
  logo_url?: string | null;
  cover_image_url?: string | null;
  image_url?: string | null;
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

function getStoreCategory(store: MarketStore) {
  return store.business_type || store.category || "Business";
}

function getStoreLocation(store: MarketStore) {
  return store.location || store.city || "Online";
}

function getStoreImage(store: MarketStore) {
  return store.cover_image_url || store.image_url || store.logo_url || "";
}

function getWeekNumber() {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), 0, 1);
  const pastDays = Math.floor((now.getTime() - firstDay.getTime()) / 86400000);

  return Math.ceil((pastDays + firstDay.getDay() + 1) / 7);
}

function getFeaturedStores(stores: MarketStore[]) {
  const now = new Date();

  const paidFeatured = stores.filter((store) => {
    if (!store.is_featured) return false;
    if (!store.featured_until) return true;

    return new Date(store.featured_until) > now;
  });

  if (paidFeatured.length > 0) {
    return paidFeatured
      .sort((a, b) => Number(b.weekly_views || 0) - Number(a.weekly_views || 0))
      .slice(0, 6);
  }

  return [...stores]
    .sort((a, b) => Number(b.weekly_views || 0) - Number(a.weekly_views || 0))
    .slice(0, 6);
}

export default function StoresPage() {
  const [stores, setStores] = useState<MarketStore[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [copiedSlug, setCopiedSlug] = useState("");
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    let mounted = true;

    async function loadStores() {
      setIsLoading(true);
      setMessage("");

      try {
        const { data, error } = await supabase
          .from("businesses")
          .select("*")
          .eq("is_published", true)
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }

        if (!mounted) return;

        setStores((data || []) as MarketStore[]);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unable to load stores.";

        setMessage(errorMessage);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadStores();

    return () => {
      mounted = false;
    };
  }, []);

  const categories = useMemo(() => {
    const items = stores.map((store) => getStoreCategory(store));
    return ["All", ...Array.from(new Set(items)).filter(Boolean)];
  }, [stores]);

  const filteredStores = useMemo(() => {
    const searchValue = query.trim().toLowerCase();

    return stores.filter((store) => {
      const category = getStoreCategory(store);
      const location = getStoreLocation(store);

      const matchesCategory =
        activeCategory === "All" || category === activeCategory;

      const text = [
        store.name,
        store.description,
        category,
        location,
        store.slug,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = !searchValue || text.includes(searchValue);

      return matchesCategory && matchesSearch;
    });
  }, [stores, query, activeCategory]);

  const featuredStores = useMemo(() => {
    return getFeaturedStores(stores);
  }, [stores]);

  async function copyStoreLink(slug?: string | null) {
    if (!slug) return;

    const url = `${window.location.origin}/store/${slug}`;

    try {
      await navigator.clipboard.writeText(url);

      const store = stores.find((item) => item.slug === slug);

      if (store?.id) {
        fetch("/api/stores/track", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            business_id: store.id,
            event_type: "copy_link",
            source: "stores_page",
          }),
        }).catch(() => {});
      }

      setCopiedSlug(slug);
      setMessage("Store link copied.");

      window.setTimeout(() => {
        setCopiedSlug((current) => (current === slug ? "" : current));
      }, 1400);
    } catch {
      setMessage(url);
    }
  }

  return (
    <main className="market-stores-page min-h-screen bg-[#f7f1ff] text-slate-950">
      <PlatformNavbar />
      <StoreSmartSearch />

      

      {message ? (
        <section className="px-5 pt-5 md:px-5">
          <div className="mx-auto max-w-7xl border border-purple-200 bg-purple-50 p-4 text-sm text-slate-700">
            {message}
          </div>
        </section>
      ) : null}

      <section className="market-featured-stores-section px-5 py-12 md:px-5">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold tracking-[0.18em] text-[#7c3aed]">
                Featured this week
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-950">
                Stores worth checking out
              </h2>
            </div>

            <span className="hidden rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-500 ring-1 ring-slate-200 md:inline-flex">
              {stores.length} live stores
            </span>
          </div>

          {isLoading ? (
            <StoreSkeletonGrid />
          ) : featuredStores.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {featuredStores.map((store, index) => (
                <StoreCard
                  key={store.id}
                  store={store}
                  onCopy={() => copyStoreLink(store.slug)}
                  isCopied={copiedSlug === store.slug}
                  featured
                  index={index}
                />
              ))}
            </div>
          ) : (
            <EmptyStores />
          )}
        </div>
      </section>

      <section className="market-store-directory-section border-t border-purple-100 bg-[#f6efff] px-5 py-12 md:px-5">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold tracking-[0.18em] text-[#7c3aed]">
                Store directory
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-950">
                Search all live stores
              </h2>
            </div>

            <p className="text-sm text-slate-500">
              Showing {filteredStores.length} of {stores.length}
            </p>
          </div>

          {filteredStores.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredStores.map((store, index) => (
                <StoreCard
                  key={store.id}
                  store={store}
                  onCopy={() => copyStoreLink(store.slug)}
                  isCopied={copiedSlug === store.slug}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <EmptyStores />
          )}
        </div>
      </section>

      <section className="bg-[#7c3aed] px-5 py-10 text-white md:px-5">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-[-0.04em]">
              Want your business featured?
            </h2>
            <p className="mt-2 text-sm leading-6 text-white/80">
              Create your Market Villa page and publish your store to join the
              directory.
            </p>
          </div>

          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-[#7c3aed] shadow-sm transition hover:bg-purple-50"
          >
            Create Business Page
            <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      <PlatformFooter />
    </main>
  );
}

function StoreCard({
  store,
  onCopy,
  isCopied = false,
  featured = false,
  index = 0,
}: {
  store: MarketStore;
  onCopy: () => void;
  isCopied?: boolean;
  featured?: boolean;
  index?: number;
}) {
  const image = getStoreImage(store);
  const category = getStoreCategory(store);
  const location = getStoreLocation(store);

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration: 0.55,
        delay: Math.min(index * 0.05, 0.25),
        ease: [0.22, 1, 0.36, 1],
      }}
      className="premium-card-hover group overflow-hidden border border-purple-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-[#7c3aed]/40 hover:shadow-md"
    >
      <div className="relative h-44 overflow-hidden bg-slate-100">
        {image ? (
          <img
            src={image}
            alt={store.name || "Market Villa store"}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full place-items-center bg-purple-50">
            <Store size={34} className="text-[#7c3aed]" />
          </div>
        )}

        {featured ? (
          <span className="absolute left-4 top-4 rounded-full bg-[#7c3aed] px-3 py-1 text-xs font-semibold text-white">
            Store of the Week
          </span>
        ) : null}
      </div>

      <div className="p-5">
        <div className="mb-4 flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-[#7c3aed]">
            <Tag size={13} />
            {category}
          </span>

          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            <CheckCircle2 size={13} />
            {store.is_verified ? "Verified" : "Live"}
          </span>
        </div>

        <h3 className="text-xl font-semibold tracking-[-0.04em] text-slate-950">
          {store.name || "Untitled store"}
        </h3>

        <p className="mt-2 line-clamp-2 min-h-[48px] text-sm leading-6 text-slate-500">
          {store.description ||
            `A Market Villa business page based in ${location}.`}
        </p>

        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
          {location}
        </p>

        <p className="mt-2 text-xs text-slate-400">
          {Number(store.weekly_views || 0).toLocaleString()} weekly views
        </p>

        <div className="mt-5 flex gap-2">
          {store.slug ? (
            <Link
              href={`/store/${store.slug}`}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#7c3aed] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#8b5cf6]"
            >
              View store
              <ArrowRight size={15} />
            </Link>
          ) : null}

          <button
            type="button"
            onClick={onCopy}
            className={`grid h-11 w-11 place-items-center rounded-full border transition ${
              isCopied
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-slate-200 bg-white text-slate-600 hover:border-[#7c3aed]/40 hover:text-[#7c3aed]"
            }`}
            aria-label={isCopied ? "Store link copied" : "Copy store link"}
            title={isCopied ? "Copied" : "Copy store link"}
          >
            {isCopied ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </div>
      </div>
    </motion.article>
  );
}

function StoreSkeletonGrid() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden border border-purple-100 bg-white shadow-sm"
        >
          <div className="mv-skeleton h-44" />
          <div className="space-y-3 p-5">
            <div className="mv-skeleton h-5 w-28 rounded-full" />
            <div className="mv-skeleton h-6 w-3/4 rounded" />
            <div className="mv-skeleton h-4 w-full rounded" />
            <div className="mv-skeleton h-4 w-2/3 rounded" />
            <div className="mv-skeleton h-11 w-full rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyStores() {
  return (
    <div className="border border-dashed border-purple-200 bg-white p-10 text-center">
      <Store className="mx-auto text-[#7c3aed]" size={34} />

      <h3 className="mt-4 text-xl font-semibold tracking-[-0.04em] text-slate-950">
        No stores found
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        Published stores will appear here. Try another search or check back
        later.
      </p>
    </div>
  );
}


