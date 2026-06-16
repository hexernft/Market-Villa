"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { createPortal } from "react-dom";
import {
  ArrowRight,
  Loader2,
  Menu,
  MessageCircle,
  Search,
  Store,
  Tag,
  X,
} from "lucide-react";
import { BRAND } from "@/lib/brand";
import { supabase } from "@/lib/supabase";

const navLinks = [
  { label: "How it works", href: "/#how" },
  { label: "Stores", href: "/stores" },
  { label: "Help", href: "/help" },
];

type StoreRow = Record<string, any>;
type ProductRow = Record<string, any>;

type SearchResult = {
  id: string;
  type: "store" | "product";
  title: string;
  subtitle: string;
  href: string;
  whatsapp?: string;
  score: number;
};

function cleanText(value: unknown) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9₦\s]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function splitTerms(query: string) {
  return cleanText(query)
    .split(" ")
    .map((term) => term.trim())
    .filter((term) => term.length > 1);
}

function scoreText(query: string, fields: unknown[]) {
  const terms = splitTerms(query);

  if (!terms.length) return 0;

  const haystack = cleanText(fields.filter(Boolean).join(" "));
  let score = 0;

  for (const term of terms) {
    if (haystack.includes(term)) score += 8;

    for (const field of fields) {
      const cleanField = cleanText(field);

      if (cleanField === term) score += 10;
      if (cleanField.startsWith(term)) score += 5;
    }
  }

  if (haystack.includes(cleanText(query))) score += 18;

  return score;
}

function getWhatsAppLink(phone?: string, message?: string) {
  if (!phone) return "";

  const cleanPhone = String(phone).replace(/\D/g, "");

  if (!cleanPhone) return "";

  const normalized = cleanPhone.startsWith("234")
    ? cleanPhone
    : cleanPhone.startsWith("0")
      ? `234${cleanPhone.slice(1)}`
      : cleanPhone;

  return `https://wa.me/${normalized}?text=${encodeURIComponent(
    message || "Hello, I found your business on Market Villa.",
  )}`;
}

function mapStoreToResult(store: StoreRow, query: string): SearchResult {
  const title = store.name || store.business_name || "Unnamed store";
  const slug = store.slug || store.store_slug || store.id;
  const category = store.category || store.business_type || store.industry || "";
  const location =
    store.location ||
    store.city ||
    store.state ||
    store.address ||
    store.business_location ||
    "";
  const description =
    store.description || store.tagline || store.bio || store.about || "";

  return {
    id: String(store.id || slug || title),
    type: "store",
    title: String(title),
    subtitle: [category, location].filter(Boolean).join(" • ") || "Store",
    href: `/store/${slug}`,
    whatsapp: getWhatsAppLink(
      store.whatsapp ||
        store.whatsapp_number ||
        store.phone ||
        store.phone_number,
      `Hello ${title}, I found your store on Market Villa.`,
    ),
    score: scoreText(query, [title, category, location, description]),
  };
}

function mapProductToResult(
  product: ProductRow,
  storeLookup: Map<string, StoreRow>,
  query: string,
): SearchResult {
  const businessId = String(
    product.business_id || product.store_id || product.owner_business_id || "",
  );
  const store = storeLookup.get(businessId);
  const title = product.name || product.title || "Unnamed product";
  const category = product.category || product.product_category || "";
  const description =
    product.description ||
    product.details ||
    product.short_description ||
    "";
  const storeName = store?.name || store?.business_name || "Market Villa store";
  const storeSlug = store?.slug || store?.store_slug || businessId;

  return {
    id: String(product.id || `${businessId}-${title}`),
    type: "product",
    title: String(title),
    subtitle: String(storeName),
    href: storeSlug ? `/store/${storeSlug}` : "/stores",
    whatsapp: getWhatsAppLink(
      store?.whatsapp ||
        store?.whatsapp_number ||
        store?.phone ||
        store?.phone_number,
      `Hello ${storeName}, I found ${title} on Market Villa.`,
    ),
    score: scoreText(query, [
      title,
      category,
      description,
      storeName,
      store?.category,
      store?.location,
    ]),
  };
}

export function PlatformNavbar() {
  const [hasMounted, setHasMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [query, setQuery] = useState("");
  const [stores, setStores] = useState<StoreRow[]>([]);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 150);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadSearchData() {
      setIsLoadingSearch(true);

      const [businessResponse, productResponse] = await Promise.all([
        supabase.from("businesses").select("*"),
        supabase.from("products").select("*"),
      ]);

      if (!mounted) return;

      setStores(businessResponse.data || []);
      setProducts(productResponse.data || []);
      setIsLoadingSearch(false);
    }

    loadSearchData();

    return () => {
      mounted = false;
    };
  }, []);

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];

    const storeLookup = new Map<string, StoreRow>();

    stores.forEach((store) => {
      if (store.id) storeLookup.set(String(store.id), store);
    });

    return [
      ...stores.map((store) => mapStoreToResult(store, query)),
      ...products.map((product) =>
        mapProductToResult(product, storeLookup, query),
      ),
    ]
      .filter((result) => result.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }, [products, query, stores]);

  const isScrolledVisual = isScrolled;

  const navbar = (
    <header
      className="platform-navbar-shell fixed left-0 top-0 z-[1000] w-full px-0 py-0 transition-all duration-300 md:px-0"
      data-scrolled={isScrolledVisual ? "true" : "false"}
      style={{ position: "fixed", left: 0, right: 0, top: 0 }}
    >
      <div
        className={`platform-navbar-surface border px-4 py-2 backdrop-blur-2xl transition-all duration-300 md:px-5 ${
          isScrolledVisual
            ? "mx-0 w-full max-w-none rounded-none border-x-0 border-t-0 border-white/80 bg-white/92 shadow-[0_18px_58px_rgba(36,20,54,0.18)]"
            : "mx-0 w-full max-w-none rounded-b-[1.6rem] rounded-t-none border-x-0 border-t-0 border-white/70 bg-white/72 shadow-[0_18px_50px_rgba(55,31,83,0.10)]"
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/"
            className="flex items-center gap-2.5"
            onClick={() => setIsMenuOpen(false)}
          >
            <Image
              src="/market-villa-logo.png"
              alt="Market Villa"
              width={64}
              height={64}
              className="h-16 w-16 object-contain"
              priority
            />
            <span className="text-sm font-semibold tracking-[-0.04em] text-[#241436]">
              {BRAND.name}
            </span>
          </Link>

          <nav
            className="pointer-events-none hidden max-w-0 scale-95 items-center gap-7 text-[12px] font-semibold text-[#241436]/75 opacity-0 transition-all duration-300 md:flex"
          >
            {navLinks.map((link) => (
              <Link
                key={`${link.label}-${link.href}`}
                href={link.href}
                className="transition hover:text-[#7c3aed]"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div
            className="relative hidden min-w-0 max-w-xl flex-1 translate-y-0 opacity-100 transition-all duration-300 md:block"
          >
            <div className="relative">
              <Search
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7c3aed]"
              />
              <input
                value={query}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => {
                  window.setTimeout(() => setIsSearchFocused(false), 160);
                }}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Smart Search: stores, products, cakes..."
                className="h-11 w-full rounded-2xl border border-[#7c3aed]/14 bg-white/82 px-10 pr-4 text-sm font-semibold text-[#241436] outline-none placeholder:text-[#241436]/42 focus:border-[#7c3aed]/34"
              />
            </div>

            {isSearchFocused && query.trim() ? (
              <div className="absolute left-0 right-0 top-[calc(100%+0.6rem)] overflow-hidden rounded-[1.25rem] border border-white/70 bg-white/94 p-2 shadow-[0_24px_70px_rgba(36,20,54,0.22)] backdrop-blur-2xl">
                {isLoadingSearch ? (
                  <div className="flex items-center gap-2 px-3 py-3 text-sm font-semibold text-[#241436]/62">
                    <Loader2 size={16} className="animate-spin text-[#7c3aed]" />
                    Searching...
                  </div>
                ) : searchResults.length ? (
                  <div className="grid gap-1">
                    {searchResults.map((result) => {
                      const Icon = result.type === "store" ? Store : Tag;

                      return (
                        <div
                          key={`${result.type}-${result.id}`}
                          className="grid grid-cols-[1fr_auto] gap-2 rounded-2xl p-2 hover:bg-[#f8f4ff]"
                        >
                          <Link
                            href={result.href}
                            className="flex min-w-0 items-center gap-3"
                            onClick={() => {
                              setQuery("");
                              setIsSearchFocused(false);
                            }}
                          >
                            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-[#f0e7ff] text-[#7c3aed]">
                              <Icon size={16} />
                            </span>
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-bold text-[#241436]">
                                {result.title}
                              </span>
                              <span className="block truncate text-xs font-semibold text-[#241436]/52">
                                {result.subtitle}
                              </span>
                            </span>
                          </Link>

                          {result.whatsapp ? (
                            <a
                              href={result.whatsapp}
                              target="_blank"
                              rel="noreferrer"
                              className="grid h-9 w-9 place-items-center rounded-2xl bg-[#22c55e] text-white"
                              aria-label={`Message ${result.title} on WhatsApp`}
                            >
                              <MessageCircle size={15} />
                            </a>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="px-3 py-3 text-sm font-semibold text-[#241436]/62">
                    No matches yet. Try another store or product.
                  </div>
                )}
              </div>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden rounded-2xl px-4 py-2 text-[12px] font-semibold text-[#241436] transition hover:bg-white/70 md:hidden lg:inline-flex"
            >
              Login
            </Link>

            <Link
              href="/signup"
              className="market-primary-button hidden items-center gap-2 rounded-2xl px-4 py-2 text-[12px] font-semibold text-white sm:inline-flex"
            >
              Start your store
              <ArrowRight size={14} />
            </Link>

            <button
              type="button"
              className="grid h-10 w-10 place-items-center rounded-2xl border border-[#7c3aed]/15 bg-white/70 text-[#241436] md:hidden"
              aria-label={
                isMenuOpen ? "Close navigation menu" : "Open navigation menu"
              }
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen((current) => !current)}
            >
              {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        <div className="relative mt-2 md:hidden">
            <Search
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7c3aed]"
            />
            <input
              value={query}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => {
                window.setTimeout(() => setIsSearchFocused(false), 160);
              }}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Smart Search"
              className="h-11 w-full rounded-2xl border border-[#7c3aed]/14 bg-white/82 px-10 text-sm font-semibold text-[#241436] outline-none"
            />

            {isSearchFocused && query.trim() ? (
              <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] overflow-hidden rounded-[1.25rem] border border-white/70 bg-white/96 p-2 shadow-[0_24px_70px_rgba(36,20,54,0.22)] backdrop-blur-2xl">
                {searchResults.length ? (
                  <div className="grid gap-1">
                    {searchResults.slice(0, 4).map((result) => {
                      const Icon = result.type === "store" ? Store : Tag;

                      return (
                        <Link
                          key={`mobile-${result.type}-${result.id}`}
                          href={result.href}
                          className="flex min-w-0 items-center gap-3 rounded-2xl p-2 hover:bg-[#f8f4ff]"
                          onClick={() => {
                            setQuery("");
                            setIsSearchFocused(false);
                            setIsMenuOpen(false);
                          }}
                        >
                          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-[#f0e7ff] text-[#7c3aed]">
                            <Icon size={16} />
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-bold text-[#241436]">
                              {result.title}
                            </span>
                            <span className="block truncate text-xs font-semibold text-[#241436]/52">
                              {result.subtitle}
                            </span>
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div className="px-3 py-3 text-sm font-semibold text-[#241436]/62">
                    {isLoadingSearch ? "Searching..." : "No matches yet."}
                  </div>
                )}
              </div>
            ) : null}
          </div>

        {isMenuOpen ? (
          <nav
            className="grid gap-2 border-t border-[#7c3aed]/10 py-3 text-sm font-semibold text-[#241436] md:hidden"
            aria-label="Mobile navigation"
          >
            {navLinks.map((link) => (
              <Link
                key={`mobile-${link.label}-${link.href}`}
                href={link.href}
                className="rounded-2xl px-3 py-3 transition hover:bg-white/70"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            <div className="grid gap-2 pt-1">
              <Link
                href="/login"
                className="rounded-2xl px-3 py-3 transition hover:bg-white/70"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>

              <Link
                href="/signup"
                className="market-primary-button inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-white"
                onClick={() => setIsMenuOpen(false)}
              >
                Start your store
                <ArrowRight size={15} />
              </Link>
            </div>
          </nav>
        ) : null}
      </div>
    </header>
  );

  if (!hasMounted) {
    return navbar;
  }

  return createPortal(navbar, document.body);
}
