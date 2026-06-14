"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarCheck,
  Clock,
  Instagram,
  MapPin,
  MessageCircle,
  Phone,
  Search,
  ShoppingBag,
  Store,
} from "lucide-react";
import { CartItem, WhatsAppCheckout } from "@/components/WhatsAppCheckout";
import { getPublicBusinessPageBySlug } from "@/lib/business-actions";
import { getBusinessTheme } from "@/lib/themes";
import { buildWhatsAppLink, formatCurrency } from "@/lib/utils";

type StorePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

type PublicProduct = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string | null;
  image_url: string | null;
  is_available: boolean;
  is_featured: boolean;
};

type PublicService = {
  id: string;
  name: string;
  description: string | null;
  service_type: string | null;
  price_label: string | null;
  availability_note: string | null;
  button_label: string | null;
  is_visible: boolean;
  is_featured: boolean;
};

type PublicBusiness = {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  tagline: string | null;
  description: string | null;
  logo_text: string | null;
  cover_image_url: string | null;
  whatsapp: string | null;
  phone: string | null;
  email: string | null;
  location: string | null;
  instagram_url: string | null;
  opening_hours: string | null;
  theme_id: string | null;
  is_published: boolean;
  products: PublicProduct[];
  services: PublicService[];
};

const fallbackCover =
  "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=1600&auto=format&fit=crop";

const fallbackProductImage =
  "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1200&auto=format&fit=crop";

export default function StorePage({ params }: StorePageProps) {
  const { slug } = use(params);

  const [business, setBusiness] = useState<PublicBusiness | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadBusiness() {
      setIsLoading(true);

      const data = await getPublicBusinessPageBySlug(slug);

      if (!mounted) return;

      setBusiness(data);
      setIsLoading(false);
    }

    loadBusiness();

    return () => {
      mounted = false;
    };
  }, [slug]);

  const theme = getBusinessTheme(business?.theme_id || "classic-commerce");

  const visibleProducts = useMemo(() => {
    return (business?.products || []).filter((product) => {
      const search = query.toLowerCase().trim();

      return (
        product.is_available &&
        (product.name.toLowerCase().includes(search) ||
          (product.category || "").toLowerCase().includes(search) ||
          (product.description || "").toLowerCase().includes(search))
      );
    });
  }, [business?.products, query]);

  const visibleServices = useMemo(() => {
    return (business?.services || []).filter((service) => service.is_visible);
  }, [business?.services]);

  const categories = Array.from(
    new Set(visibleProducts.map((product) => product.category || "Products"))
  );

  function addToCart(product: PublicProduct) {
    setCart((items) => {
      const existing = items.find((item) => item.id === product.id);

      if (existing) {
        return items.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [
        ...items,
        {
          id: product.id,
          name: product.name,
          price: Number(product.price || 0),
          quantity: 1,
        },
      ];
    });
  }

  if (isLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-100 px-5 py-12">
        <div className="w-full max-w-sm rounded-[1.5rem] border border-slate-200 bg-white p-6 text-center shadow-soft">
          <div className="mx-auto mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-slate-950 text-white">
            <Store size={22} />
          </div>

          <h1 className="text-xl font-semibold tracking-[-0.04em] text-slate-950">
            Loading store
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Please wait while this business page loads.
          </p>
        </div>
      </main>
    );
  }

  if (!business) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-100 px-5 py-12">
        <div className="w-full max-w-sm rounded-[1.5rem] border border-slate-200 bg-white p-6 text-center shadow-soft">
          <div className="mx-auto mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-red-50 text-red-700">
            <Store size={22} />
          </div>

          <h1 className="text-xl font-semibold tracking-[-0.04em] text-slate-950">
            Store not found
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            This store does not exist or the link may be incorrect.
          </p>

          <Link
            href="/"
            className="mt-6 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Back to Market Villa
          </Link>
        </div>
      </main>
    );
  }

  if (!business.is_published) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-100 px-5 py-12">
        <div className="w-full max-w-sm rounded-[1.5rem] border border-slate-200 bg-white p-6 text-center shadow-soft">
          <div className="mx-auto mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-amber-50 text-amber-700">
            <Store size={22} />
          </div>

          <h1 className="text-xl font-semibold tracking-[-0.04em] text-slate-950">
            Store currently unavailable
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {business.name} is not currently available to the public.
          </p>

          <Link
            href="/"
            className="mt-6 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Back to Market Villa
          </Link>
        </div>
      </main>
    );
  }

  const whatsapp = business.whatsapp || business.phone || "";
  const logoText = business.logo_text || business.name.slice(0, 2).toUpperCase();
  const coverImage = business.cover_image_url || fallbackCover;

  return (
    <main className={`min-h-screen ${theme.page}`}>
      <section
        className={`store-pattern bg-gradient-to-br ${theme.hero} px-5 py-8 md:px-8`}
      >
        <div className="mx-auto max-w-7xl">
          <header className="mb-12 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 text-white">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-sm font-semibold text-slate-950">
                <Store size={19} />
              </span>

              <span className="text-sm font-semibold">
                
              </span>
            </Link>

            {whatsapp ? (
              <a
                href={buildWhatsAppLink(
                  whatsapp,
                  `Hello ${business.name}, I am interested in your business.`
                )}
                target="_blank"
                rel="noreferrer"
                className={`hidden rounded-full px-5 py-3 text-sm font-semibold md:inline-flex ${theme.button}`}
              >
                Contact Business
              </a>
            ) : null}
          </header>

          <div className="grid items-end gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <div className="mb-5 grid h-16 w-16 place-items-center rounded-[1.25rem] bg-white text-xl font-semibold text-slate-950 shadow-soft">
                {logoText}
              </div>

              <p
                className={`mb-3 text-xs font-semibold uppercase tracking-[0.22em] ${theme.accentText}`}
              >
                {business.location || "Business"}
              </p>

              <h1 className="max-w-4xl text-4xl font-semibold leading-tight tracking-[-0.05em] text-white md:text-5xl">
                {business.name}
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-7 text-white/80">
                {business.description ||
                  business.tagline ||
                  "Welcome to our Market Villa business page."}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                {business.opening_hours ? (
                  <span
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm ${theme.chip}`}
                  >
                    <Clock size={16} />
                    {business.opening_hours}
                  </span>
                ) : null}

                {business.location ? (
                  <span
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm ${theme.chip}`}
                  >
                    <MapPin size={16} />
                    {business.location}
                  </span>
                ) : null}
              </div>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#products"
                  className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold ${theme.button}`}
                >
                  <ShoppingBag size={17} />
                  View Products
                </a>

                {visibleServices.length ? (
                  <a
                    href="#services"
                    className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold ${theme.secondaryButton}`}
                  >
                    <CalendarCheck size={17} />
                    Quick Requests
                  </a>
                ) : null}
              </div>
            </div>

            <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 p-3 backdrop-blur-xl">
              <div
                className="h-80 rounded-[1.5rem] bg-cover bg-center md:h-[24rem]"
                style={{ backgroundImage: `url(${coverImage})` }}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-8 md:px-8">
        <div className="mx-auto grid max-w-7xl gap-10">
          {business.products?.length ? (
            <div
              className={`${theme.card} grid gap-3 rounded-[1.5rem] p-4 shadow-sm md:grid-cols-[1fr_auto] md:items-center`}
            >
              <div className="relative">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={17}
                />

                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search products"
                  className="min-h-12 w-full rounded-full border border-slate-200 bg-white px-11 text-sm text-slate-950 outline-none focus:border-[var(--mv-orange)]"
                />
              </div>

              <div className="flex gap-2 overflow-x-auto">
                {categories.map((category) => (
                  <span
                    key={category}
                    className="whitespace-nowrap rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <section id="products">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p
                  className={`text-xs font-semibold uppercase tracking-[0.22em] ${theme.sectionLabel}`}
                >
                  Catalogue
                </p>

                <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em]">
                  Products
                </h2>
              </div>

              <p className="text-sm opacity-60">
                {visibleProducts.length} item
                {visibleProducts.length === 1 ? "" : "s"}
              </p>
            </div>

            {visibleProducts.length ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {visibleProducts.map((product) => (
                  <article
                    key={product.id}
                    className={`${theme.productCard} overflow-hidden rounded-[1.5rem] transition hover:-translate-y-1 hover:shadow-soft`}
                  >
                    <div
                      className="h-40 bg-cover bg-center"
                      style={{
                        backgroundImage: `url(${
                          product.image_url || fallbackProductImage
                        })`,
                      }}
                    />

                    <div className="p-4">
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div>
                          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                            {product.category || "Product"}
                          </p>

                          <h3 className="text-base font-semibold tracking-[-0.03em]">
                            {product.name}
                          </h3>
                        </div>

                        <span className="whitespace-nowrap rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">
                          {formatCurrency(Number(product.price || 0))}
                        </span>
                      </div>

                      {product.description ? (
                        <p className="text-sm leading-6 text-slate-500">
                          {product.description}
                        </p>
                      ) : null}

                      <button
                        onClick={() => addToCart(product)}
                        className={`mt-4 flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold ${theme.button}`}
                      >
                        <ShoppingBag size={16} />
                        Add to order
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div
                className={`${theme.card} rounded-[1.5rem] p-6 text-center shadow-sm`}
              >
                <p className="text-sm opacity-70">
                  No products are available right now.
                </p>
              </div>
            )}
          </section>

          {visibleServices.length ? (
            <section id="services">
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <p
                    className={`text-xs font-semibold uppercase tracking-[0.22em] ${theme.sectionLabel}`}
                  >
                    Services
                  </p>

                  <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em]">
                    Quick Requests
                  </h2>
                </div>

                <p className="text-sm opacity-60">
                  {visibleServices.length} option
                  {visibleServices.length === 1 ? "" : "s"}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                {visibleServices.map((service) =>
                  whatsapp ? (
                    <a
                      key={service.id}
                      href={buildWhatsAppLink(
                        whatsapp,
                        `Hello ${business.name}, I want to ask about ${service.name}.`
                      )}
                      target="_blank"
                      rel="noreferrer"
                      title={service.description || service.service_type || service.name}
                      className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold shadow-sm transition hover:-translate-y-0.5 ${theme.button}`}
                    >
                      <CalendarCheck size={16} />
                      {service.button_label || service.name || "Request Service"}
                    </a>
                  ) : (
                    <span
                      key={service.id}
                      title={service.description || service.service_type || service.name}
                      className={`${theme.card} inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold shadow-sm`}
                    >
                      <CalendarCheck size={16} />
                      {service.button_label || service.name || "Request Service"}
                    </span>
                  )
                )}
              </div>
            </section>
          ) : null}

          <footer className={`${theme.mutedCard} rounded-[1.5rem] p-5 shadow-sm`}>
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr_0.8fr]">
              <div>
                <h3 className="text-lg font-semibold tracking-[-0.03em]">
                  {business.name}
                </h3>

                <p className="mt-2 max-w-md text-sm leading-6 opacity-70">
                  {business.tagline ||
                    "Browse products, request services, and contact the business directly."}
                </p>

                <div className="mt-5 flex flex-wrap gap-3">
                  {whatsapp ? (
                    <a
                      href={buildWhatsAppLink(
                        whatsapp,
                        `Hello ${business.name}, I need more information.`
                      )}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-semibold text-slate-950"
                    >
                      <Phone size={16} />
                      Contact Business
                    </a>
                  ) : null}

                  {business.instagram_url ? (
                    <a
                      href={business.instagram_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-3 text-sm font-semibold ring-1 ring-white/10"
                    >
                      <Instagram size={16} />
                      Instagram
                    </a>
                  ) : null}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] opacity-60">
                  Business Info
                </p>

                <div className="mt-4 grid gap-2">
                  {business.opening_hours ? (
                    <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-3 ring-1 ring-white/10">
                      <Clock size={17} className="opacity-70" />
                      <span className="text-sm font-medium">
                        {business.opening_hours}
                      </span>
                    </div>
                  ) : null}

                  {business.location ? (
                    <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-3 ring-1 ring-white/10">
                      <MapPin size={17} className="opacity-70" />
                      <span className="text-sm font-medium">
                        {business.location}
                      </span>
                    </div>
                  ) : null}

                  {business.phone ? (
                    <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-3 ring-1 ring-white/10">
                      <Phone size={17} className="opacity-70" />
                      <span className="text-sm font-medium">
                        {business.phone}
                      </span>
                    </div>
                  ) : null}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] opacity-60">
                  Store
                </p>

                <div className="mt-4 grid gap-2">
                  <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-3 ring-1 ring-white/10">
                    <Store size={17} className="opacity-70" />
                    <span className="text-sm font-medium">
                      
                    </span>
                  </div>

                  <a
                    href="#products"
                    className="flex items-center gap-3 rounded-2xl bg-white/10 p-3 text-sm font-semibold ring-1 ring-white/10"
                  >
                    <ShoppingBag size={17} className="opacity-70" />
                    View Products
                  </a>

                  {visibleServices.length ? (
                    <a
                      href="#services"
                      className="flex items-center gap-3 rounded-2xl bg-white/10 p-3 text-sm font-semibold ring-1 ring-white/10"
                    >
                      <CalendarCheck size={17} className="opacity-70" />
                      Quick Requests
                    </a>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-white/10 pt-4">
              <p className="text-xs opacity-60">
                © {new Date().getFullYear()} {business.name}. Powered by Market
                Villa.
              </p>
            </div>
          </footer>
        </div>
      </section>

      <WhatsAppCheckout
        businessId={business.id}
        businessName={business.name}
        whatsapp={whatsapp}
        cart={cart}
        setCart={setCart}
      />
    </main>
  );
}