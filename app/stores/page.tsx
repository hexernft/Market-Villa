"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Copy,
  Search,
  Store,
  Tag,
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
  const week = getWeekNumber();

  return [...stores]
    .sort((a, b) => {
      const aSeed = `${a.id}-${week}`;
      const bSeed = `${b.id}-${week}`;

      return aSeed.localeCompare(bSeed);
    })
    .slice(0, 6);
}

export default function StoresPage() {
  const [stores, setStores] = useState<MarketStore[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
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
      setMessage("Store link copied.");
    } catch {
      setMessage(url);
    }
  }

  return (
    <main className="min-h-screen bg-[#f3f4f6] text-slate-950">
      <PlatformNavbar />

      <section className="bg-[radial-gradient(circle_at_top_right,rgba(255,106,0,0.18),transparent_34%),linear-gradient(180deg,#f3f4f6_0%,#ffffff_100%)] px-5 pb-12 pt-32 md:px-8 md:pt-36">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <p className="text-sm font-semibold tracking-[0.18em] text-[#ff6a00]">
                Market Villa stores
              </p>

              <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-[1.05] tracking-[-0.05em] text-slate-950 md:text-5xl">
                Discover businesses built on Market Villa.
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">
                Explore featured stores, find businesses by category, and see
                how sellers are using simple pages to look professional online.
              </p>
            </div>

            <div className="border border-orange-200 bg-white p-5 shadow-sm">
              <div className="relative">
                <Search
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="h-14 w-full border border-slate-200 bg-white pl-12 pr-4 text-sm outline-none transition focus:border-[#ff6a00]"
                  placeholder="Search stores, categories, locations..."
                />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {categories.slice(0, 8).map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setActiveCategory(category)}
                    className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                      activeCategory === category
                        ? "bg-[#ff6a00] text-white"
                        : "bg-orange-50 text-slate-700 hover:bg-orange-100"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {message ? (
        <section className="px-5 pt-5 md:px-8">
          <div className="mx-auto max-w-7xl border border-orange-200 bg-orange-50 p-4 text-sm text-slate-700">
            {message}
          </div>
        </section>
      ) : null}

      <section className="px-5 py-12 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold tracking-[0.18em] text-[#ff6a00]">
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

      <section className="border-t border-orange-100 bg-[#fff3eb] px-5 py-12 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold tracking-[0.18em] text-[#ff6a00]">
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
                  index={index}
                />
              ))}
            </div>
          ) : (
            <EmptyStores />
          )}
        </div>
      </section>

      <section className="bg-[#ff6a00] px-5 py-10 text-white md:px-8">
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
            href="/signup"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-[#ff6a00] shadow-sm transition hover:bg-orange-50"
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
  featured = false,
  index = 0,
}: {
  store: MarketStore;
  onCopy: () => void;
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
      className="premium-card-hover group overflow-hidden border border-orange-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-[#ff6a00]/40 hover:shadow-md"
    >
      <div className="relative h-44 overflow-hidden bg-slate-100">
        {image ? (
          <img
            src={image}
            alt={store.name || "Market Villa store"}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full place-items-center bg-orange-50">
            <Store size={34} className="text-[#ff6a00]" />
          </div>
        )}

        {featured ? (
          <span className="absolute left-4 top-4 rounded-full bg-[#ff6a00] px-3 py-1 text-xs font-semibold text-white">
            Featured
          </span>
        ) : null}
      </div>

      <div className="p-5">
        <div className="mb-4 flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-[#ff6a00]">
            <Tag size={13} />
            {category}
          </span>

          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            <CheckCircle2 size={13} />
            Live
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

        <div className="mt-5 flex gap-2">
          {store.slug ? (
            <Link
              href={`/store/${store.slug}`}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#ff6a00] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#ff8126]"
            >
              View store
              <ArrowRight size={15} />
            </Link>
          ) : null}

          <button
            type="button"
            onClick={onCopy}
            className="grid h-11 w-11 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-[#ff6a00]/40 hover:text-[#ff6a00]"
            aria-label="Copy store link"
          >
            <Copy size={16} />
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
          className="overflow-hidden border border-orange-100 bg-white shadow-sm"
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
    <div className="border border-dashed border-orange-200 bg-white p-10 text-center">
      <Store className="mx-auto text-[#ff6a00]" size={34} />

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
