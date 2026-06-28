"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
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
    <main className="market-stores-page mv-page-shell min-h-screen text-[#241436]">
      <PlatformNavbar />

      <section className="px-4 pb-10 pt-28 md:px-4 md:pt-32">
        <div className="home-showcase-card home-light-panel mx-auto grid max-w-7xl gap-6 overflow-hidden rounded-[2rem] border border-white/75 bg-white/76 p-5 shadow-[0_30px_90px_rgba(36,20,54,0.18)] backdrop-blur-2xl lg:grid-cols-[0.9fr_1.1fr] lg:p-7">
          <div className="flex flex-col justify-between gap-8 p-1 md:p-2">
            <div>
              <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-[#7c3aed]">
                <Store size={15} />
                Market Villa stores
              </p>

              <h1 className="mt-4 max-w-2xl text-4xl font-semibold leading-[1.02] text-[#241436] md:text-6xl">
                Discover businesses ready to sell.
              </h1>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="home-mini-card rounded-[1.25rem] border border-[#7c3aed]/12 bg-[#f8f4ff] p-4">
                <p className="text-2xl font-semibold text-[#241436]">
                  {stores.length}
                </p>
              </div>

              <div className="home-mini-card rounded-[1.25rem] border border-[#7c3aed]/12 bg-white/78 p-4">
                <p className="text-2xl font-semibold text-[#241436]">
                  {featuredStores.length}
                </p>
              </div>

              <div className="home-mini-card rounded-[1.25rem] border border-[#7c3aed]/12 bg-[#fff5f7] p-4">
                <p className="text-2xl font-semibold text-[#241436]">
                  {categories.length}
                </p>
              </div>
            </div>
          </div>

          <div className="relative min-h-[430px] overflow-hidden rounded-[1.65rem] bg-[#241436]">
            <Image
              src="/phone-hub.png"
              alt="Market Villa store discovery preview"
              fill
              sizes="(min-width: 1024px) 52vw, 100vw"
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(36,20,54,0.68))]" />
            <div className="home-dark-panel absolute bottom-4 left-4 right-4 rounded-[1.35rem] border border-white/18 bg-black/40 p-4 text-white shadow-[0_18px_55px_rgba(0,0,0,0.24)] backdrop-blur-xl">
            </div>
          </div>
        </div>
      </section>

      {message ? (
        <section className="px-4 py-4 md:px-4">
          <div className="home-light-panel mx-auto max-w-7xl rounded-[1.35rem] border border-[#7c3aed]/12 bg-white/76 p-4 text-sm font-semibold text-[#241436]/70 shadow-[0_18px_50px_rgba(36,20,54,0.10)] backdrop-blur-2xl">
            {message}
          </div>
        </section>
      ) : null}

      <section className="market-featured-stores-section px-4 py-10 md:px-4">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>

              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#241436] md:text-5xl">
                Stores worth checking out
              </h2>
            </div>

            <span className="hidden rounded-2xl border border-[#7c3aed]/12 bg-white/76 px-4 py-2 text-xs font-bold text-[#241436]/58 shadow-sm md:inline-flex">
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

      <section className="market-store-directory-section px-4 py-10 md:px-4">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 grid gap-5 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>

              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#241436] md:text-5xl">
                Search all live stores
              </h2>
            </div>

            <div className="home-light-panel rounded-[1.6rem] border border-white/70 bg-white/74 p-3 shadow-[0_20px_60px_rgba(36,20,54,0.12)] backdrop-blur-2xl">
              <div className="relative">
                <Search
                  size={17}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7c3aed]"
                />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search stores, cities, products..."
                  className="h-12 w-full rounded-2xl border border-[#7c3aed]/12 bg-white/80 px-10 text-sm font-semibold text-[#241436] outline-none placeholder:text-[#241436]/42 focus:border-[#7c3aed]/34"
                />
              </div>

              <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setActiveCategory(category)}
                    className={`shrink-0 rounded-2xl border px-3 py-2 text-xs font-bold transition ${
                      activeCategory === category
                        ? "border-[#7c3aed]/26 bg-[#241436] text-white"
                        : "border-[#7c3aed]/12 bg-white/72 text-[#241436]/68 hover:bg-white"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              <p className="mt-2 px-1 text-xs font-semibold text-[#241436]/52">
                Showing {filteredStores.length} of {stores.length}
              </p>
            </div>
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

      <section className="px-4 py-10 md:px-4">
        <div className="mv-why-panel home-showcase-card mx-auto flex max-w-7xl flex-col gap-5 rounded-[2rem] p-6 text-white shadow-[0_28px_70px_rgba(36,20,54,0.22)] md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">
              Want your business featured?
            </h2>
          </div>

          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-[#241436] shadow-sm transition hover:bg-[#f8f4ff]"
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
      className="home-lift-card group overflow-hidden rounded-[1.6rem] border border-white/70 bg-white/76 text-[#241436] shadow-[0_20px_60px_rgba(36,20,54,0.12)] backdrop-blur-2xl transition hover:-translate-y-1 hover:border-[#7c3aed]/26"
    >
      <div className="relative h-48 overflow-hidden bg-[#f8f4ff]">
        {image ? (
          <img
            src={image}
            alt={store.name || "Market Villa store"}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full place-items-center bg-[#f8f4ff]">
            <Store size={34} className="text-[#7c3aed]" />
          </div>
        )}

        {featured ? (
          <span className="absolute left-4 top-4 rounded-2xl bg-[#241436] px-3 py-1.5 text-xs font-bold text-white shadow-[0_14px_35px_rgba(36,20,54,0.24)]">
            Store of the Week
          </span>
        ) : null}
      </div>

      <div className="p-5">
        <div className="mb-4 flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-2xl border border-[#7c3aed]/20 bg-[#f8f4ff] px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] text-[#5b21b6]">
            <Tag size={13} />
            {category}
          </span>

          <span className="inline-flex items-center gap-1 rounded-2xl border border-emerald-200/70 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
            <CheckCircle2 size={13} />
            {store.is_verified ? "Verified" : "Live"}
          </span>
        </div>

        <h3 className="text-xl font-semibold tracking-[-0.04em] text-[#241436]">
          {store.name || "Untitled store"}
        </h3>

        <p className="mt-3 text-xs font-black uppercase tracking-[0.16em] text-[#5b21b6]">
          {location}
        </p>

        <p className="mt-2 text-xs font-semibold text-[#241436]/45">
          {Number(store.weekly_views || 0).toLocaleString()} weekly views
        </p>

        <div className="mt-5 flex gap-2">
          {store.slug ? (
            <Link
              href={`/store/${store.slug}`}
              className="market-primary-button inline-flex flex-1 items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold text-white"
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
                : "border-[#7c3aed]/12 bg-white/76 text-[#241436]/64 hover:border-[#7c3aed]/34 hover:text-[#7c3aed]"
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
          className="overflow-hidden rounded-[1.6rem] border border-white/70 bg-white/76 shadow-[0_20px_60px_rgba(36,20,54,0.10)] backdrop-blur-2xl"
        >
          <div className="mv-skeleton h-44" />
          <div className="space-y-3 p-5">
            <div className="mv-skeleton h-5 w-28 rounded-full" />
            <div className="mv-skeleton h-6 w-3/4 rounded" />
            <div className="mv-skeleton h-4 w-full rounded" />
            <div className="mv-skeleton h-4 w-2/3 rounded" />
            <div className="mv-skeleton h-11 w-full rounded-2xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyStores() {
  return (
    <div className="home-light-panel rounded-[1.6rem] border border-dashed border-[#7c3aed]/22 bg-white/76 p-10 text-center shadow-[0_20px_60px_rgba(36,20,54,0.10)] backdrop-blur-2xl">
      <Store className="mx-auto text-[#7c3aed]" size={34} />

      <h3 className="mt-4 text-xl font-semibold tracking-[-0.04em] text-[#241436]">
        No stores found
      </h3>
    </div>
  );
}




