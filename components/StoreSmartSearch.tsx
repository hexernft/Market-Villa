"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Loader2,
  MessageCircle,
  Search,
  Sparkles,
  Store,
  Tag,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type StoreRow = Record<string, any>;
type ProductRow = Record<string, any>;

type SearchResult = {
  id: string;
  type: "store" | "product";
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  href: string;
  whatsapp?: string;
  price?: string;
  category?: string;
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

function getImage(row: Record<string, any>) {
  return (
    row.cover_image_url ||
    row.image_url ||
    row.logo_url ||
    row.product_image_url ||
    row.thumbnail_url ||
    ""
  );
}

function formatPrice(row: Record<string, any>) {
  const raw =
    row.price ||
    row.amount ||
    row.base_price ||
    row.price_amount ||
    row.starting_price ||
    "";

  if (!raw) return "";

  const numberValue = Number(raw);

  if (!Number.isNaN(numberValue) && numberValue > 0) {
    return `₦${numberValue.toLocaleString("en-NG")}`;
  }

  return String(raw);
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
    message || "Hello, I found your business on Market Villa."
  )}`;
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
    store.description ||
    store.tagline ||
    store.bio ||
    store.about ||
    "View this business on Market Villa.";

  const score = scoreText(query, [
    title,
    category,
    location,
    description,
    store.products_summary,
    store.services_summary,
  ]);

  return {
    id: String(store.id || slug || title),
    type: "store",
    title: String(title),
    subtitle: [category, location].filter(Boolean).join(" • "),
    description: String(description),
    imageUrl: getImage(store),
    href: `/store/${slug}`,
    whatsapp: getWhatsAppLink(
      store.whatsapp ||
        store.whatsapp_number ||
        store.phone ||
        store.phone_number,
      `Hello ${title}, I found your store on Market Villa.`
    ),
    category: String(category || "Store"),
    score,
  };
}

function mapProductToResult(
  product: ProductRow,
  storeLookup: Map<string, StoreRow>,
  query: string
): SearchResult {
  const businessId = String(
    product.business_id || product.store_id || product.owner_business_id || ""
  );
  const store = storeLookup.get(businessId);

  const title = product.name || product.title || "Unnamed product";
  const category = product.category || product.product_category || "";
  const description =
    product.description ||
    product.details ||
    product.short_description ||
    "View this product on Market Villa.";

  const storeName = store?.name || store?.business_name || "Market Villa store";
  const storeSlug = store?.slug || store?.store_slug || businessId;

  const score = scoreText(query, [
    title,
    category,
    description,
    storeName,
    store?.category,
    store?.location,
  ]);

  return {
    id: String(product.id || `${businessId}-${title}`),
    type: "product",
    title: String(title),
    subtitle: String(storeName),
    description: String(description),
    imageUrl: getImage(product) || getImage(store || {}),
    href: storeSlug ? `/store/${storeSlug}` : "/stores",
    whatsapp: getWhatsAppLink(
      store?.whatsapp ||
        store?.whatsapp_number ||
        store?.phone ||
        store?.phone_number,
      `Hello ${storeName}, I found ${title} on Market Villa.`
    ),
    price: formatPrice(product),
    category: String(category || "Product"),
    score,
  };
}

type StoreSmartSearchProps = {
  variant?: "standalone" | "home";
};

export function StoreSmartSearch({ variant = "standalone" }: StoreSmartSearchProps) {
  const [query, setQuery] = useState("");
  const [stores, setStores] = useState<StoreRow[]>([]);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeType, setActiveType] = useState<"all" | "store" | "product">("all");

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      setIsLoading(true);

      const [businessResponse, productResponse] = await Promise.all([
        supabase.from("businesses").select("*"),
        supabase.from("products").select("*"),
      ]);

      if (!mounted) return;

      setStores(businessResponse.data || []);
      setProducts(productResponse.data || []);
      setIsLoading(false);
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, []);

  const results = useMemo(() => {
    const storeLookup = new Map<string, StoreRow>();

    stores.forEach((store) => {
      if (store.id) storeLookup.set(String(store.id), store);
    });

    const storeResults = stores.map((store) => mapStoreToResult(store, query));
    const productResults = products.map((product) =>
      mapProductToResult(product, storeLookup, query)
    );

    return [...storeResults, ...productResults]
      .filter((result) => {
        if (activeType !== "all" && result.type !== activeType) return false;
        if (!query.trim()) return false;
        return result.score > 0;
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 9);
  }, [stores, products, query, activeType]);

  const suggestedQueries = [
    "phone accessories",
    "fashion store",
    "cakes and pastries",
    "beauty products",
    "stores in Abuja",
    "WhatsApp orders",
  ];

  return (
    <section
      className={`store-smart-search px-4 pb-8 md:px-4 ${
        variant === "home" ? "pt-10 md:pt-12" : "pt-28 md:pt-32"
      }`}
    >
      <div className="mx-auto max-w-7xl rounded-[2.4rem] border border-white/12 bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.26),transparent_32%),linear-gradient(145deg,#050008,#12051f_55%,#241436)] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.34)] md:p-7">
        <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr] lg:items-center">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#c4b5fd]">
              <Sparkles size={15} />
              Smart discovery
            </div>

            <h2 className="max-w-xl text-3xl font-light leading-[1] tracking-[-0.065em] text-white md:text-4xl">
              Search stores and products in one place.
            </h2>

            <p className="mt-4 max-w-xl text-base leading-7 text-white/72">
              Type what you need naturally. Find businesses, products, and
              WhatsApp-ready sellers on Market Villa.
            </p>
          </div>

          <div className="rounded-[1.7rem] border border-white/22 bg-white/10 p-3 backdrop-blur-2xl">
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search
                  size={19}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#241436]/50"
                />

                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Try: phone accessories, cake vendor in Abuja, fashion stores..."
                  className="h-14 w-full rounded-[1.25rem] border border-white/80 bg-white/92 px-12 py-4 text-base text-[#241436] outline-none placeholder:text-[#241436]/42 focus:border-[#c4b5fd]"
                />
              </div>

              <div className="flex rounded-[1.25rem] border border-white/15 bg-black/18 p-1">
                {[
                  { id: "all", label: "All" },
                  { id: "store", label: "Stores" },
                  { id: "product", label: "Products" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveType(item.id as any)}
                    className={`rounded-[1rem] px-4 py-2.5 text-sm font-semibold transition ${
                      activeType === item.id
                        ? "bg-white text-[#241436]"
                        : "text-white/72 hover:text-white"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {suggestedQueries.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setQuery(item)}
                  className="rounded-full border border-white/18 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/82 transition hover:bg-white/18 hover:text-white"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>

        {query.trim() ? (
          <div className="mt-7">
            {isLoading ? (
              <div className="grid min-h-[170px] place-items-center rounded-[1.8rem] border border-white/12 bg-white/8 text-white/72">
                <div className="flex items-center gap-3">
                  <Loader2 size={20} className="animate-spin" />
                  Searching stores and products...
                </div>
              </div>
            ) : results.length === 0 ? (
              <div className="rounded-[1.8rem] border border-white/14 bg-white/8 p-6 text-center">
                <h3 className="text-2xl font-light tracking-[-0.05em] text-white">
                  No matching results yet.
                </h3>
                <p className="mx-auto mt-2 max-w-xl text-sm leading-7 text-white/70">
                  Try another search like &quot;fashion store&quot;, &quot;phone accessories&quot;,
                  &quot;cakes&quot;, or &quot;stores in Abuja&quot;.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {results.map((result) => (
                  <article
                    key={`${result.type}-${result.id}`}
                    className="group overflow-hidden rounded-[1.8rem] border border-white/14 bg-white/10 shadow-[0_22px_70px_rgba(0,0,0,0.26)] backdrop-blur-2xl transition hover:-translate-y-1 hover:bg-white/14"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-[#160b24]">
                      {result.imageUrl ? (
                        <img
                          src={result.imageUrl}
                          alt={result.title}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="grid h-full place-items-center bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.34),transparent_30%),linear-gradient(145deg,#050008,#241436)]">
                          {result.type === "store" ? (
                            <Store size={38} className="text-[#c4b5fd]" />
                          ) : (
                            <Tag size={38} className="text-[#c4b5fd]" />
                          )}
                        </div>
                      )}

                      <span className="absolute left-4 top-4 rounded-full border border-white/15 bg-black/36 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-white/82 backdrop-blur">
                        {result.type === "store" ? "Store" : "Product"}
                      </span>
                    </div>

                    <div className="p-5">
                      <h3 className="text-xl font-semibold tracking-[-0.04em] text-white">
                        {result.title}
                      </h3>

                      <p className="mt-1 text-sm text-[#c4b5fd]">
                        {result.subtitle || result.category}
                      </p>

                      <p className="mt-4 line-clamp-3 text-sm leading-7 text-white/66">
                        {result.description}
                      </p>

                      <div className="mt-5 flex flex-wrap gap-2">
                        <Link
                          href={result.href}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-bold text-[#241436] transition hover:bg-[#f4edff]"
                        >
                          View
                          <ArrowRight size={15} />
                        </Link>

                        {result.whatsapp ? (
                          <a
                            href={result.whatsapp}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/12 bg-white/8 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/12"
                          >
                            <MessageCircle size={15} />
                            WhatsApp
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}

