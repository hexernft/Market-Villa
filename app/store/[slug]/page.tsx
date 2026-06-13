"use client";

import Image from "next/image";
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
      const search = query.toLowerCase();

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
        <div className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-7 text-center shadow-soft">
          <div className="mx-auto mb-6 grid h-14 w-14 place-items-center rounded-2xl bg-slate-950 text-white">
            <Store size={24} />
          </div>

          <h1 className="text-2xl font-semibold tracking-[-0.04em] text-slate-950">
            Loading store
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            Please wait while Market Villa loads this business page.
          </p>
        </div>
      </main>
    );
  }

  if (!business) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-100 px-5 py-12">
        <div className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-7 text-center shadow-soft">
          <div className="mx-auto mb-6 grid h-14 w-14 place-items-center rounded-2xl bg-red-50 text-red-700">
            <Store size={24} />
          </div>

          <h1 className="text-2xl font-semibold tracking-[-0.04em] text-slate-950">
            Store not found
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            This Market Villa store does not exist or the link may be incorrect.
          </p>

          <Link
            href="/"
            className="mt-7 inline-flex rounded-full bg-slate-950 px-6 py-4 text-sm font-semibold text-white hover:bg-slate-800"
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
        <div className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-7 text-center shadow-soft">
          <div className="mx-auto mb-6 grid h-14 w-14 place-items-center rounded-2xl bg-amber-50 text-amber-700">
            <Store size={24} />
          </div>

          <h1 className="text-2xl font-semibold tracking-[-0.04em] text-slate-950">
            Store currently unavailable
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            {business.name} is not currently available to the public. Please
            check back later or contact the business directly if you already
            have their contact details.
          </p>

          <Link
            href="/"
            className="mt-7 inline-flex rounded-full bg-slate-950 px-6 py-4 text-sm font-semibold text-white hover:bg-slate-800"
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
                Powered by Market Villa
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

              <p className={`mb-3 text-xs font-semibold uppercase tracking-[0.22em] ${theme.accentText}`}>
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
                  <span className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm ${theme.chip}`}>
                    <Clock size={16} />
                    {business.opening_hours}
                  </span>
                ) : null}

                {business.location ? (
                  <span className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm ${theme.chip}`}>
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

                <a
                  href="#services"
                  className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold ${theme.secondaryButton}`}
                >
                  <CalendarCheck size={17} />
                  View Services
                </a>
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

      <section className="px-5 py-10 md:px-8">
        <div className="mx-auto max-w-7xl">
          {business.products?.length ? (
            <div className={`mb-10 grid gap-4 ${theme.card} rounded-[2rem] p-5 shadow-soft md:grid-cols-[1fr_auto] md:items-center`}>
              <div className="relative">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />

                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search products or categories"
                  className="w-full rounded-full border border-slate-200 bg-white px-12 py-4 text-sm text-slate-950 outline-none focus:border-slate-950"
                />
              </div>

              <div className="flex gap-2 overflow-x-auto">
                {categories.map((category) => (
                  <span
                    key={category}
                    className="whitespace-nowrap rounded-full bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <section id="products">
            <div className="mb-8 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <p className={`text-sm font-semibold uppercase tracking-[0.28em] ${theme.sectionLabel}`}>
                  Catalogue
                </p>

                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
                  Products
                </h2>
              </div>

              <p className="text-sm leading-7 opacity-70">
                {visibleProducts.length} item
                {visibleProducts.length === 1 ? "" : "s"} available
              </p>
            </div>

            {visibleProducts.length ? (
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                {visibleProducts.map((product) => (
                  <article
                    key={product.id}
                    className={`${theme.productCard} overflow-hidden transition hover:-translate-y-1 hover:shadow-soft`}
                  >
                    <div
                      className="h-48 bg-cover bg-center"
                      style={{
                        backgroundImage: `url(${
                          product.image_url || fallbackProductImage
                        })`,
                      }}
                    />

                    <div className="p-5">
                      <div className="mb-3 flex items-start justify-between gap-4">
                        <div>
                          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                            {product.category || "Product"}
                          </p>

                          <h3 className="text-lg font-semibold tracking-[-0.03em]">
                            {product.name}
                          </h3>
                        </div>

                        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold">
                          {formatCurrency(Number(product.price || 0))}
                        </span>
                      </div>

                      <p className="min-h-12 text-sm leading-6 text-slate-500">
                        {product.description || "No description added."}
                      </p>

                      <button
                        onClick={() => addToCart(product)}
                        className={`mt-5 flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold ${theme.button}`}
                      >
                        <ShoppingBag size={17} />
                        Add to order
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className={`${theme.card} rounded-[2rem] p-8 text-center`}>
                <p className="text-sm opacity-70">
                  No products are available right now.
                </p>
              </div>
            )}
          </section>

          {visibleServices.length ? (
            <section id="services" className="mt-20">
              <div className="mb-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
                <div>
                  <p className={`text-sm font-semibold uppercase tracking-[0.28em] ${theme.sectionLabel}`}>
                    Services
                  </p>

                  <h2 className="mt-2 max-w-xl text-3xl font-semibold tracking-[-0.04em]">
                    Bookings, inquiries, and service requests
                  </h2>
                </div>

                <p className="text-sm leading-7 opacity-70">
                  Customers can request bookings, appointments, custom quotes,
                  reservations, or consultations directly from this page.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                {visibleServices.map((service) => (
                  <div
                    key={service.id}
                    className={`${theme.card} overflow-hidden rounded-[2rem] shadow-sm ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-soft`}
                  >
                    <div className="p-6">
                      <div className="mb-8 flex items-center justify-between gap-4">
                        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-950 text-white">
                          <CalendarCheck size={21} />
                        </span>

                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                          {service.service_type || "Service"}
                        </span>
                      </div>

                      <h3 className="text-xl font-semibold tracking-[-0.03em]">
                        {service.name}
                      </h3>

                      <p className="mt-3 min-h-20 text-sm leading-6 opacity-70">
                        {service.description || "No description added."}
                      </p>

                      <div className="mt-6 rounded-2xl bg-slate-100 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                          Pricing
                        </p>

                        <p className="mt-1 text-lg font-semibold text-slate-950">
                          {service.price_label || "Request quote"}
                        </p>
                      </div>

                      {whatsapp ? (
                        <a
                          href={buildWhatsAppLink(
                            whatsapp,
                            `Hello ${business.name}, I want to ask about ${service.name}.`
                          )}
                          target="_blank"
                          rel="noreferrer"
                          className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-4 text-sm font-semibold ${theme.button}`}
                        >
                          <MessageCircle size={17} />
                          {service.button_label || "Request Service"}
                        </a>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <section className="mt-20 grid gap-5 lg:grid-cols-[1fr_0.85fr]">
            <div className={`${theme.mutedCard} rounded-[2rem] p-7 shadow-sm`}>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] opacity-70">
                Contact
              </p>

              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">
                Need help before ordering?
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-7 opacity-70">
                Contact {business.name} directly for product questions,
                bookings, availability, delivery, custom requests, or service
                inquiries.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                {whatsapp ? (
                  <a
                    href={buildWhatsAppLink(
                      whatsapp,
                      `Hello ${business.name}, I need more information.`
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950"
                  >
                    <Phone size={17} />
                    Contact Business
                  </a>
                ) : null}

                {business.instagram_url ? (
                  <a
                    href={business.instagram_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-3 text-sm font-semibold ring-1 ring-white/10"
                  >
                    <Instagram size={17} />
                    Instagram
                  </a>
                ) : null}
              </div>
            </div>

            <div className={`${theme.card} rounded-[2rem] p-7 shadow-sm`}>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] opacity-50">
                Business Details
              </p>

              <div className="mt-5 grid gap-3">
                {business.opening_hours ? (
                  <div className="flex items-center gap-3 rounded-2xl bg-slate-100 p-4">
                    <Clock size={18} className="text-slate-500" />
                    <span className="text-sm font-medium">
                      {business.opening_hours}
                    </span>
                  </div>
                ) : null}

                {business.location ? (
                  <div className="flex items-center gap-3 rounded-2xl bg-slate-100 p-4">
                    <MapPin size={18} className="text-slate-500" />
                    <span className="text-sm font-medium">
                      {business.location}
                    </span>
                  </div>
                ) : null}

                <div className="flex items-center gap-3 rounded-2xl bg-slate-100 p-4">
                  <Store size={18} className="text-slate-500" />
                  <span className="text-sm font-medium">
                    Powered by Market Villa
                  </span>
                </div>
              </div>
            </div>
          </section>

          <footer className={`${theme.mutedCard} mt-16 rounded-[2rem] p-6`}>
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
              <div>
                <h3 className="text-xl font-semibold">{business.name}</h3>

                <p className="mt-2 text-sm opacity-70">
                  {business.tagline || "Powered by Market Villa"}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                {business.instagram_url ? (
                  <a
                    href={business.instagram_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-3 text-sm font-semibold ring-1 ring-white/10"
                  >
                    <Instagram size={17} />
                    Instagram
                  </a>
                ) : null}

                {whatsapp ? (
                  <a
                    href={buildWhatsAppLink(whatsapp, `Hello ${business.name}`)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950"
                  >
                    <MessageCircle size={17} />
                    Contact
                  </a>
                ) : null}
              </div>
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