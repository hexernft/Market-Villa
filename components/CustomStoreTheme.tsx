"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Search,
  ShoppingBag,
  Store,
} from "lucide-react";
import { CartItem, WhatsAppCheckout } from "@/components/WhatsAppCheckout";
import {
  getEnabledStorePages,
  getStorePagePath,
  isStorePageEnabled,
} from "@/lib/store-pages";
import { getEnabledHomeSections } from "@/lib/home-builder";
import { StoreHomeBuilderSections } from "@/components/StoreHomeBuilderSections";
import type { StorePageId } from "@/lib/store-pages";
import type { HomeBuilderSection } from "@/lib/home-builder";
import { formatCurrency } from "@/lib/utils";

type ThemeSettings = {
  colorTheme?: "market-purple" | "warm-boutique" | "neon-rail" | "editorial" | "edge-blue" | "baby-bloom";
  heroStyle?: "split" | "edge" | "carousel" | "minimal" | "product-first" | "storefront-pro";
  heroSize?: "slim" | "medium" | "bold";
  productCardStyle?: "soft" | "bordered" | "shadow" | "dark" | "playful" | "editorial";
  navbarStyle?: "none" | "simple" | "centered" | "floating" | "pill";
  footerStyle?: "simple" | "dark" | "branded" | "compact" | "full";
  homeSections?: HomeBuilderSection[];
  toggles?: {
    showHero?: boolean;
    showNavbar?: boolean;
    showHomeLink?: boolean;
    showProductsLink?: boolean;
    showAboutLink?: boolean;
    showContactLink?: boolean;
    showHeroText?: boolean;
    showHeroButtons?: boolean;
    showPrices?: boolean;
    showProductWhatsapp?: boolean;
    showAboutSection?: boolean;
    showFooter?: boolean;
    showMarketVillaBadge?: boolean;
  };
};

type Product = {
  id: string;
  name: string;
  description?: string | null;
  price?: number | string | null;
  category?: string | null;
  image_url?: string | null;
  image?: string | null;
  is_available?: boolean | null;
  is_featured?: boolean | null;
};

type Business = {
  id: string;
  name: string;
  slug?: string | null;
  category?: string | null;
  tagline?: string | null;
  description?: string | null;
  logo_url?: string | null;
  cover_image_url?: string | null;
  whatsapp?: string | null;
  phone?: string | null;
  email?: string | null;
  location?: string | null;
  opening_hours?: string | null;
  theme_settings?: ThemeSettings | null;
  products?: Product[] | null;
};

const palettes = {
  "market-purple": {
    page: "#f7f1ff",
    surface: "#ffffff",
    brand: "#241436",
    accent: "#7c3aed",
    soft: "#efe5ff",
    text: "#241436",
    muted: "#6f6785",
    lightText: "#ffffff",
  },
  "warm-boutique": {
    page: "#fff7ed",
    surface: "#fffaf3",
    brand: "#431407",
    accent: "#9a3412",
    soft: "#fed7aa",
    text: "#32190d",
    muted: "#7c4a2d",
    lightText: "#ffffff",
  },
  "neon-rail": {
    page: "#050816",
    surface: "#08111f",
    brand: "#050816",
    accent: "#67e8f9",
    soft: "#0b1729",
    text: "#ecfeff",
    muted: "#a5f3fc",
    lightText: "#ffffff",
  },
  editorial: {
    page: "#f7f1e8",
    surface: "#fffaf2",
    brand: "#201711",
    accent: "#8b5e25",
    soft: "#f3e7d6",
    text: "#201711",
    muted: "#6f5847",
    lightText: "#ffffff",
  },
  "edge-blue": {
    page: "#eef6fb",
    surface: "#ffffff",
    brand: "#0f172a",
    accent: "#0284c7",
    soft: "#e0f2fe",
    text: "#0f172a",
    muted: "#536275",
    lightText: "#ffffff",
  },
  "baby-bloom": {
    page: "#fff1f8",
    surface: "#fffafd",
    brand: "#3b1020",
    accent: "#ec4899",
    soft: "#ffe4f1",
    text: "#3b1020",
    muted: "#885169",
    lightText: "#ffffff",
  },
};

function getPalette(settings?: ThemeSettings | null) {
  return palettes[settings?.colorTheme || "market-purple"] || palettes["market-purple"];
}

function getHeroHeight(size?: string) {
  if (size === "bold") return "min-h-[390px] md:min-h-[460px]";
  if (size === "medium") return "min-h-[300px] md:min-h-[360px]";
  return "min-h-[230px] md:min-h-[290px]";
}

function getCardClass(style?: string) {
  if (style === "bordered") return "border shadow-none";
  if (style === "shadow") return "border shadow-[0_18px_55px_rgba(36,20,54,0.14)]";
  if (style === "dark") return "border shadow-[0_18px_55px_rgba(36,20,54,0.18)]";
  if (style === "playful") return "border shadow-[0_16px_48px_rgba(236,72,153,0.12)] hover:-translate-y-1 hover:rotate-[-0.35deg]";
  if (style === "editorial") return "border shadow-sm";
  return "border shadow-[0_12px_35px_rgba(36,20,54,0.08)]";
}

export function CustomStoreTheme({
  business,
  page = "home",
}: {
  business: Business;
  page?: StorePageId;
}) {
  const settings = business.theme_settings || {};
  const palette = getPalette(settings);
  const toggles = settings.toggles || {};
  const [cart, setCart] = useState<CartItem[]>([]);
  const [query, setQuery] = useState("");

  const products = useMemo(() => {
    return (business.products || []).filter((product) => {
      if (product.is_available === false) return false;

      const search = query.trim().toLowerCase();

      if (!search) return true;

      return `${product.name} ${product.category || ""} ${product.description || ""}`
        .toLowerCase()
        .includes(search);
    });
  }, [business.products, query]);

  const categories = Array.from(
    new Set(
      (business.products || [])
        .map((product) => product.category || "Products")
        .filter(Boolean),
    ),
  ).slice(0, 6);

  const featuredProducts = products.slice(0, 3);

  const heroImage = business.cover_image_url || "/main-hero.png";

  function addToCart(product: Product) {
    const price = Number(product.price || 0);

    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);

      if (existing) {
        return current.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      return [
        ...current,
        {
          id: product.id,
          name: product.name,
          price,
          quantity: 1,
          image: product.image_url || product.image || "",
        },
      ];
    });
  }

  const navLinks = getEnabledStorePages(business).map((storePage) => ({
    ...storePage,
    href: getStorePagePath(business.slug, storePage.id),
  }));
  const isCurrentPageEnabled =
    page === "home" || isStorePageEnabled(business, page);
  const productsHref = getStorePagePath(business.slug, "products");
  const aboutHref = getStorePagePath(business.slug, "about");
  const contactHref = getStorePagePath(business.slug, "contact");

  const navbarStyle = settings.navbarStyle || "simple";
  const heroStyle = (settings.heroStyle || "split") as NonNullable<ThemeSettings["heroStyle"]>;
  const productCardStyle = settings.productCardStyle || "soft";
  const footerStyle = (settings.footerStyle || "dark") as NonNullable<ThemeSettings["footerStyle"]>;
  const darkCards = productCardStyle === "dark";
  const enabledHomeSections = getEnabledHomeSections(settings);
  const hasCustomHomeSections = page === "home" && enabledHomeSections.length > 0;

  return (
    <main
      className="market-villa-customized-store store-page-slim min-h-screen"
      style={{
        backgroundColor: palette.page,
        color: palette.text,
      }}
    >
      {toggles.showNavbar !== false && navbarStyle !== "none" ? (
        <header
          className={`mx-auto flex w-[min(1120px,calc(100%-2rem))] flex-wrap items-center justify-between gap-3 px-4 py-3 ${
            navbarStyle === "floating"
              ? "sticky top-4 z-40 mt-4 rounded-full shadow-[0_18px_50px_rgba(36,20,54,0.14)]"
              : navbarStyle === "pill"
                ? "mt-4 rounded-full"
                : "rounded-b-[1.25rem]"
          }`}
          style={{
            backgroundColor: palette.surface,
            color: palette.text,
            border: `1px solid ${palette.soft}`,
          }}
        >
          <Link href={getStorePagePath(business.slug, "home")} className="flex items-center gap-3">
            <span
              className="grid h-10 w-10 place-items-center rounded-2xl"
              style={{
                backgroundColor: palette.soft,
                color: palette.accent,
              }}
            >
              <Store size={18} />
            </span>
            <span>
              <span className="block text-sm font-black">{business.name}</span>
              <span className="block text-xs font-semibold opacity-60">
                {business.category || "Storefront"}
              </span>
            </span>
          </Link>

          {navLinks.length > 0 ? (
            <nav
              className={`flex flex-wrap gap-1 text-xs font-black uppercase tracking-[0.14em] ${
                navbarStyle === "centered" ? "mx-auto" : ""
              }`}
            >
              {navLinks.map((link) => (
                <Link
                  key={link.id}
                  href={link.href}
                  className={`px-3 py-2 ${
                    navbarStyle === "pill" ? "rounded-full" : "rounded-xl"
                  }`}
                  style={{
                    backgroundColor:
                      link.id === page || navbarStyle === "pill"
                        ? palette.soft
                        : "transparent",
                    color: palette.text,
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          ) : null}

          <a
            href={
              isStorePageEnabled(business, "contact")
                ? contactHref
                : `https://wa.me/${business.whatsapp || ""}`
            }
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-black"
            style={{
              backgroundColor: palette.accent,
              color: settings.colorTheme === "neon-rail" ? "#050816" : "#ffffff",
            }}
          >
            <MessageCircle size={15} />
            Contact Business
          </a>
        </header>
      ) : null}

      {!isCurrentPageEnabled ? (
        <section className="px-4 py-10">
          <div
            className="mx-auto max-w-3xl rounded-[1.35rem] p-6 text-center"
            style={{
              backgroundColor: palette.surface,
              border: `1px solid ${palette.soft}`,
            }}
          >
            <p
              className="text-xs font-black uppercase tracking-[0.18em]"
              style={{ color: palette.accent }}
            >
              Page unavailable
            </p>
            <h1 className="mt-3 text-2xl font-black tracking-[-0.04em]">
              This page is currently turned off.
            </h1>
            <Link
              href={getStorePagePath(business.slug, "home")}
              className="mt-5 inline-flex rounded-full px-5 py-3 text-sm font-black"
              style={{
                backgroundColor: palette.accent,
                color: settings.colorTheme === "neon-rail" ? "#050816" : "#ffffff",
              }}
            >
              Back to store
            </Link>
          </div>
        </section>
      ) : null}

      {isCurrentPageEnabled && hasCustomHomeSections ? (
        <StoreHomeBuilderSections
          business={business}
          sections={enabledHomeSections}
          palette={palette}
        />
      ) : null}

      {isCurrentPageEnabled && page === "home" && !hasCustomHomeSections && heroStyle === "storefront-pro" && toggles.showHero !== false ? (
        <section id="home" className="px-0 py-0">
          <div className="grid min-h-[420px] bg-white md:grid-cols-2">
            <div className="flex flex-col items-center justify-center px-5 py-12 text-center">
              <p className="text-sm font-black uppercase tracking-[0.18em]" style={{ color: palette.accent }}>
                {business.category || "Featured Store"}
              </p>

              <h1 className="mt-4 max-w-xl text-[2.6rem] font-black leading-[0.95] tracking-[-0.065em] md:text-[4.5rem]" style={{ color: palette.text }}>
                {business.name}
              </h1>

              {toggles.showPrices !== false && featuredProducts[0] ? (
                <div className="mt-5">
                  <p className="text-sm" style={{ color: palette.muted }}>From</p>
                  <p className="text-3xl font-black" style={{ color: palette.text }}>
                    {formatCurrency(Number(featuredProducts[0].price || 0))}
                  </p>
                </div>
              ) : null}

              {toggles.showHeroButtons !== false ? (
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <a
                    href={productsHref}
                    className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-black"
                    style={{
                      backgroundColor: palette.accent,
                      color: settings.colorTheme === "neon-rail" ? "#050816" : "#ffffff",
                    }}
                  >
                    <ShoppingBag size={16} />
                    Shop now
                  </a>

                  <a
                    href={aboutHref}
                    className="inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-black"
                    style={{
                      borderColor: palette.accent,
                      color: palette.accent,
                    }}
                  >
                    Learn more
                  </a>
                </div>
              ) : null}
            </div>

            <div className="relative min-h-[320px] bg-[#f6f6f6]">
              <Image
                src={heroImage}
                alt={business.name}
                fill
                sizes="50vw"
                className="object-cover"
                priority
              />
            </div>
          </div>

          {categories.length > 0 ? (
            <div className="mx-auto flex max-w-6xl gap-3 overflow-x-auto px-4 py-5">
              {categories.map((category) => (
                <a
                  key={category}
                  href={productsHref}
                  className="shrink-0 rounded-2xl border bg-white px-5 py-3 text-sm font-black shadow-sm"
                  style={{
                    borderColor: palette.soft,
                    color: palette.text,
                  }}
                >
                  {category}
                </a>
              ))}
            </div>
          ) : null}
        </section>
      ) : null}
      {isCurrentPageEnabled && page === "home" && !hasCustomHomeSections && heroStyle !== "storefront-pro" && toggles.showHero !== false ? (
        <section id="home" className="px-4 py-5">
        <div
          className={`mx-auto grid max-w-6xl overflow-hidden rounded-[1.5rem] ${
            heroStyle === "edge" ? "" : "lg:grid-cols-[0.9fr_1.1fr]"
          } ${getHeroHeight(settings.heroSize)}`}
          style={{
            backgroundColor: palette.brand,
            color: palette.lightText,
          }}
        >
          {heroStyle === "product-first" ? null : (
            <div className="relative min-h-[220px]">
              <Image
                src={heroImage}
                alt={business.name}
                fill
                sizes="100vw"
                className="object-cover opacity-85"
                priority
              />
              <div className="absolute inset-0 bg-black/25" />
            </div>
          )}

          {toggles.showHeroText !== false ? (
            <div className="flex flex-col justify-center p-5 md:p-8">
              <p
                className="text-xs font-black uppercase tracking-[0.2em]"
                style={{ color: palette.accent }}
              >
                {business.location || "Online Store"}
              </p>

              <h1 className="mt-4 max-w-xl text-[2.4rem] font-black leading-[0.95] tracking-[-0.065em] md:text-[4rem]">
                {business.name}
              </h1>

              <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold opacity-80">
                {business.opening_hours ? (
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-2">
                    <Clock size={14} />
                    {business.opening_hours}
                  </span>
                ) : null}

                {business.location ? (
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-2">
                    <MapPin size={14} />
                    {business.location}
                  </span>
                ) : null}
              </div>

              {toggles.showHeroButtons !== false ? (
                <div className="mt-6 flex flex-wrap gap-3">
                  <a
                    href={productsHref}
                    className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-black"
                    style={{
                      backgroundColor: palette.accent,
                      color: settings.colorTheme === "neon-rail" ? "#050816" : "#ffffff",
                    }}
                  >
                    <ShoppingBag size={16} />
                    View Products
                  </a>

                  <a
                    href={`https://wa.me/${business.whatsapp || ""}`}
                    className="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-3 text-sm font-black text-white ring-1 ring-white/20"
                  >
                    <MessageCircle size={16} />
                    Ask Now
                  </a>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
        </section>
      ) : null}

      {isCurrentPageEnabled && (page === "products" || (page === "home" && !hasCustomHomeSections)) ? (
      <section
        id="products"
        className={`px-4 ${
          toggles.showHero === false ? "py-5" : "pb-6"
        }`}
      >
        <div
          className="mx-auto max-w-6xl rounded-[1.35rem] p-4"
          style={{
            backgroundColor: settings.colorTheme === "neon-rail" ? palette.surface : "rgba(255,255,255,0.72)",
          }}
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p
                className="text-xs font-black uppercase tracking-[0.2em]"
                style={{ color: palette.accent }}
              >
                Products
              </p>
              <h2 className="mt-1 text-2xl font-black tracking-[-0.05em]">
                Available items
              </h2>
            </div>

            <label className="relative w-full max-w-sm">
              <Search
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 opacity-45"
              />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search products"
                className="h-12 w-full rounded-full border bg-white pl-11 pr-4 text-sm outline-none"
                style={{
                  borderColor: palette.soft,
                  color: palette.text,
                }}
              />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {products.map((product) => (
              <article
                key={product.id}
                className={`overflow-hidden rounded-[1.25rem] p-3 transition ${getCardClass(productCardStyle)}`}
                style={{
                  backgroundColor: darkCards ? palette.brand : palette.surface,
                  color: darkCards ? "#ffffff" : palette.text,
                  borderColor: palette.soft,
                }}
              >
                <div className="relative min-h-[170px] overflow-hidden rounded-[1rem]" style={{ backgroundColor: palette.soft }}>
                  {product.image_url || product.image ? (
                    <Image
                      src={product.image_url || product.image || ""}
                      alt={product.name}
                      fill
                      sizes="33vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="grid h-full min-h-[170px] place-items-center">
                      <ShoppingBag size={30} style={{ color: palette.accent }} />
                    </div>
                  )}
                </div>

                <div className="p-2">
                  <p className="text-xs font-black uppercase tracking-[0.16em] opacity-55">
                    {product.category || "Product"}
                  </p>
                  <h3 className="mt-2 text-base font-black tracking-[-0.03em]">
                    {product.name}
                  </h3>

                  {toggles.showPrices !== false ? (
                    <p
                      className="mt-3 text-lg font-black"
                      style={{ color: palette.accent }}
                    >
                      {formatCurrency(Number(product.price || 0))}
                    </p>
                  ) : null}

                  {toggles.showProductWhatsapp !== false ? (
                    <button
                      type="button"
                      onClick={() => addToCart(product)}
                      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black"
                      style={{
                        backgroundColor: palette.accent,
                        color: settings.colorTheme === "neon-rail" ? "#050816" : "#ffffff",
                      }}
                    >
                      <ShoppingBag size={16} />
                      Add to cart
                    </button>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      ) : null}

      {isCurrentPageEnabled && (page === "about" || (page === "home" && !hasCustomHomeSections && toggles.showAboutSection !== false)) ? (
        <section id="about" className="px-4 pb-6">
          <div
            className="mx-auto max-w-6xl rounded-[1.35rem] p-5"
            style={{
              backgroundColor: palette.surface,
              border: `1px solid ${palette.soft}`,
            }}
          >
            <p
              className="text-xs font-black uppercase tracking-[0.2em]"
              style={{ color: palette.accent }}
            >
              About
            </p>
          </div>
        </section>
      ) : null}

      {isCurrentPageEnabled && page === "contact" ? (
        <section id="contact-page" className="px-4 pb-6 pt-5">
          <div
            className="mx-auto grid max-w-6xl gap-5 rounded-[1.35rem] p-5 md:grid-cols-[1fr_0.9fr]"
            style={{
              backgroundColor: palette.surface,
              border: `1px solid ${palette.soft}`,
            }}
          >
            <div>
              <p
                className="text-xs font-black uppercase tracking-[0.2em]"
                style={{ color: palette.accent }}
              >
                Contact
              </p>
              <h1 className="mt-3 text-3xl font-black tracking-[-0.05em]">
                Contact {business.name}
              </h1>
            </div>

            <div className="grid gap-3 text-sm font-semibold">
              {business.whatsapp ? (
                <a
                  href={`https://wa.me/${business.whatsapp}`}
                  className="inline-flex items-center gap-3 rounded-2xl p-4"
                  style={{ backgroundColor: palette.soft, color: palette.text }}
                >
                  <MessageCircle size={17} />
                  WhatsApp: {business.whatsapp}
                </a>
              ) : null}
              {business.phone ? (
                <a
                  href={`tel:${business.phone}`}
                  className="inline-flex items-center gap-3 rounded-2xl p-4"
                  style={{ backgroundColor: palette.soft, color: palette.text }}
                >
                  <Phone size={17} />
                  Phone: {business.phone}
                </a>
              ) : null}
              {business.email ? (
                <a
                  href={`mailto:${business.email}`}
                  className="inline-flex items-center gap-3 rounded-2xl p-4"
                  style={{ backgroundColor: palette.soft, color: palette.text }}
                >
                  <Mail size={17} />
                  Email: {business.email}
                </a>
              ) : null}
              {business.location ? (
                <div
                  className="inline-flex items-center gap-3 rounded-2xl p-4"
                  style={{ backgroundColor: palette.soft, color: palette.text }}
                >
                  <MapPin size={17} />
                  {business.location}
                </div>
              ) : null}
              {business.opening_hours ? (
                <div
                  className="inline-flex items-center gap-3 rounded-2xl p-4"
                  style={{ backgroundColor: palette.soft, color: palette.text }}
                >
                  <Clock size={17} />
                  {business.opening_hours}
                </div>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {toggles.showFooter !== false && footerStyle === "full" ? (
        <footer
          id="contact"
          className="px-4 py-10"
          style={{
            backgroundColor: "#171717",
            color: "#ffffff",
          }}
        >
          <div className="mx-auto grid max-w-6xl gap-8 border-b border-white/15 pb-8 md:grid-cols-4">
            <div>
              <p className="text-lg font-black">{business.name}</p>
            </div>

            <div>
              <p className="text-sm font-black">Products</p>
              <div className="mt-3 grid gap-2 text-sm text-white/70">
                {categories.slice(0, 5).map((category) => (
                  <Link key={category} href={productsHref}>{category}</Link>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-black">Policies</p>
              <div className="mt-3 grid gap-2 text-sm text-white/70">
                <span>Terms of Service</span>
                <span>Refund Policy</span>
                <span>Delivery Policy</span>
                <span>Privacy Policy</span>
              </div>
            </div>

            <div>
              <p className="text-sm font-black">Contact</p>
              <div className="mt-3 grid gap-2 text-sm text-white/70">
                <span>{business.location || "Online"}</span>
                <span>{business.phone || business.whatsapp || "Contact business"}</span>
                <a href={`https://wa.me/${business.whatsapp || ""}`} className="mt-2 inline-flex w-fit rounded-full bg-white px-4 py-2 text-sm font-black text-black">
                  WhatsApp
                </a>
              </div>
            </div>
          </div>

          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 pt-5 text-xs text-white/50">
            <p>© {new Date().getFullYear()} {business.name}</p>
            {toggles.showMarketVillaBadge !== false ? <p>Powered by Market Villa</p> : null}
          </div>
        </footer>
      ) : toggles.showFooter !== false ? (
        <footer
          id="contact"
          className="px-4 py-5"
          style={{
            backgroundColor: footerStyle === "simple" ? palette.page : palette.brand,
            color: footerStyle === "simple" ? palette.text : "#ffffff",
          }}
        >
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black">{business.name}</p>
              <p className="mt-1 text-sm opacity-65">
                {business.location || "Online"} · {business.phone || business.whatsapp || "Contact business"}
              </p>
            </div>

            {toggles.showMarketVillaBadge !== false ? (
              <p className="text-xs font-semibold opacity-55">
                Powered by Market Villa
              </p>
            ) : null}
          </div>
        </footer>
      ) : null}

      <WhatsAppCheckout
        businessId={business.id}
        businessName={business.name}
        whatsapp={business.whatsapp || ""}
        cart={cart}
        setCart={setCart}
      />
    </main>
  );
}



