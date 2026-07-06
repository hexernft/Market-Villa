"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Search,
  ShoppingBag,
  ShoppingCart,
  Store,
  Truck,
} from "lucide-react";
import { WhatsAppCheckout, type CartItem } from "@/components/WhatsAppCheckout";
import { buildWhatsAppLink, formatCurrency } from "@/lib/utils";

type StoreProduct = {
  id: string;
  name: string;
  description?: string | null;
  short_description?: string | null;
  price?: number | string | null;
  category?: string | null;
  image_url?: string | null;
  image?: string | null;
  is_available?: boolean | null;
  is_published?: boolean | null;
  is_featured?: boolean | null;
  featured?: boolean | null;
  status?: string | null;
  stock_status?: string | null;
};

type ThemeSettings = {
  announcementText?: string | null;
  announcement_text?: string | null;
  deliveryNote?: string | null;
  delivery_note?: string | null;
  paymentInfo?: string | null;
  payment_info?: string | null;
  pickupNote?: string | null;
  pickup_note?: string | null;
  toggles?: {
    showPrices?: boolean;
    showFooter?: boolean;
    showMarketVillaBadge?: boolean;
  };
};

type StoreBusiness = {
  id: string;
  name: string;
  slug?: string | null;
  tagline?: string | null;
  description?: string | null;
  logo_url?: string | null;
  logo_text?: string | null;
  cover_image_url?: string | null;
  banner_url?: string | null;
  hero_image_url?: string | null;
  whatsapp?: string | null;
  phone?: string | null;
  email?: string | null;
  location?: string | null;
  address?: string | null;
  instagram_url?: string | null;
  instagramUrl?: string | null;
  opening_hours?: string | null;
  business_hours?: string | null;
  delivery_note?: string | null;
  payment_info?: string | null;
  pickup_note?: string | null;
  products?: StoreProduct[] | null;
  theme_settings?: ThemeSettings | null;
};

type Props = {
  business: StoreBusiness;
  products?: StoreProduct[] | null;
  services?: StoreProduct[] | null;
};

const brandPurple = "#241436";

function getHeroImage(business: StoreBusiness) {
  return business.cover_image_url || business.banner_url || business.hero_image_url || "";
}

function isVisibleItem(item: StoreProduct) {
  return item.is_available !== false && item.is_published !== false;
}

function getShortDescription(item: StoreProduct) {
  const text = item.short_description || item.description || "";
  return text.length > 92 ? `${text.slice(0, 89).trim()}...` : text;
}

function getItemStatus(item: StoreProduct) {
  if (item.status) return item.status;
  if (item.stock_status) return item.stock_status;
  if (item.is_available === false) return "Unavailable";
  return "Available";
}

export function DefaultOnePageTheme({ business, products, services }: Props) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [announcementIndex, setAnnouncementIndex] = useState(0);

  const settings = business.theme_settings || {};
  const whatsapp = business.whatsapp || business.phone || "";
  const heroImage = getHeroImage(business);
  const location = business.location || business.address || "";
  const openingHours = business.opening_hours || business.business_hours || "";
  const showPrices = settings.toggles?.showPrices !== false;
  const showFooter = settings.toggles?.showFooter !== false;
  const showMarketVillaBadge = settings.toggles?.showMarketVillaBadge !== false;
  const announcement =
    settings.announcementText?.trim() ||
    settings.announcement_text?.trim() ||
    `Welcome to ${business.name}`;
  const deliveryNote =
    business.delivery_note ||
    settings.deliveryNote ||
    settings.delivery_note ||
    "";
  const paymentInfo =
    business.payment_info ||
    settings.paymentInfo ||
    settings.payment_info ||
    "";
  const pickupNote =
    business.pickup_note ||
    settings.pickupNote ||
    settings.pickup_note ||
    "";

  const announcementItems = useMemo(() => {
    const items = announcement
      .split(/\r?\n|\s*\|\s*/)
      .map((item) => item.trim())
      .filter(Boolean);

    return items.length ? items : [`Welcome to ${business.name}`];
  }, [announcement, business.name]);

  useEffect(() => {
    if (announcementItems.length <= 1) return;

    const timer = window.setInterval(() => {
      setAnnouncementIndex((current) => (current + 1) % announcementItems.length);
    }, 2500);

    return () => window.clearInterval(timer);
  }, [announcementItems.length]);

  const currentAnnouncement =
    announcementItems[announcementIndex % announcementItems.length] || announcement;

  const items = useMemo(() => {
    return [...(products || business.products || []), ...(services || [])].filter(
      isVisibleItem,
    );
  }, [business.products, products, services]);

  const categories = useMemo(() => {
    const unique = new Set(
      items.map((item) => item.category).filter(Boolean) as string[],
    );

    return ["All", ...Array.from(unique)];
  }, [items]);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return items.filter((item) => {
      const matchesCategory =
        activeCategory === "All" || item.category === activeCategory;
      const matchesQuery =
        !normalizedQuery ||
        item.name.toLowerCase().includes(normalizedQuery) ||
        (item.category || "").toLowerCase().includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, items, query]);

  const featuredItems = useMemo(() => {
    const explicit = items.filter((item) => item.is_featured || item.featured);
    return (explicit.length ? explicit : items).slice(0, 4);
  }, [items]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  function addToCart(item: StoreProduct) {
    const price = Number(item.price || 0);

    setCart((current) => {
      const existing = current.find((cartItem) => cartItem.id === item.id);

      if (existing) {
        return current.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem,
        );
      }

      return [
        ...current,
        {
          id: item.id,
          name: item.name,
          price,
          quantity: 1,
          image: item.image_url || item.image || "",
        },
      ];
    });
    setIsCartOpen(true);
  }

  return (
    <main className="market-villa-customized-store min-h-screen bg-[#fffaf5] text-[#17111f]">
      <div
        className="px-4 py-2 text-[0.68rem] font-black uppercase tracking-[0.08em] text-white"
        style={{ backgroundColor: brandPurple }}
      >
        <div className="mx-auto flex h-5 max-w-7xl items-center justify-center overflow-hidden text-center">
          <span
            key={`${currentAnnouncement}-${announcementIndex}`}
            className="mv-announcement-flip block whitespace-nowrap"
          >
            {currentAnnouncement}
          </span>
        </div>

        <style jsx>{`
          .mv-announcement-flip {
            animation: mv-announcement-flip-up 620ms ease both;
          }

          @keyframes mv-announcement-flip-up {
            0% {
              opacity: 0;
              transform: translateY(120%);
            }

            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>

      <header className="sticky top-0 z-40 border-b border-[#eadfff] bg-white/95 backdrop-blur">
        <div className="mx-auto grid max-w-7xl gap-3 px-4 py-3 md:grid-cols-[auto_minmax(220px,480px)_auto] md:items-center md:px-6">
          <div className="flex min-w-0 items-center justify-between gap-3">
            <Link
              href={`/store/${business.slug || ""}`}
              className="flex min-w-0 items-center gap-3"
              aria-label={business.name}
            >
              {business.logo_url ? (
                <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-2xl border border-[#eadfff] bg-white">
                  <Image
                    src={business.logo_url}
                    alt={business.name}
                    width={44}
                    height={44}
                    priority
                    className="h-full w-full object-contain p-1"
                  />
                </span>
              ) : (
                <span
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-white"
                  style={{ backgroundColor: brandPurple }}
                >
                  <Store size={20} />
                </span>
              )}

              <span className="min-w-0">
                <span className="block truncate text-base font-black leading-tight text-[#17111f] md:text-lg">
                  {business.name}
                </span>
                {location ? (
                  <span className="mt-0.5 hidden max-w-52 truncate text-xs font-bold text-slate-500 sm:block">
                    {location}
                  </span>
                ) : null}
              </span>
            </Link>

            <div className="flex shrink-0 items-center gap-2 md:hidden">
              {whatsapp ? (
                <a
                  href={buildWhatsAppLink(whatsapp, `Hello ${business.name}`)}
                  target="_blank"
                  rel="noreferrer"
                  className="grid h-10 w-10 place-items-center rounded-full border border-[#eadfff] bg-white text-[#241436]"
                  aria-label="WhatsApp"
                >
                  <MessageCircle size={19} />
                </a>
              ) : null}
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                aria-label="Open cart"
                className="relative grid h-10 w-10 place-items-center rounded-full border border-[#eadfff] bg-white text-[#241436]"
              >
                <ShoppingCart size={20} />
                {cartCount > 0 ? (
                  <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#7c3aed] px-1 text-[0.68rem] font-black text-white">
                    {cartCount}
                  </span>
                ) : null}
              </button>
            </div>
          </div>

          <label className="relative block">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-11 w-full rounded-2xl border border-[#eadfff] bg-[#fbf8ff] pl-11 pr-4 text-sm font-semibold outline-none transition focus:border-[#7c3aed] focus:bg-white"
              placeholder="Search products"
            />
          </label>

          <div className="hidden items-center justify-end gap-3 text-sm font-bold text-slate-700 md:flex">
            {whatsapp ? (
              <a
                href={buildWhatsAppLink(whatsapp, `Hello ${business.name}`)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 items-center gap-2 rounded-full bg-[#241436] px-4 text-white transition hover:-translate-y-0.5"
              >
                <MessageCircle size={16} />
                WhatsApp
              </a>
            ) : null}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              aria-label="Open cart"
              className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#eadfff] bg-white text-[#241436] transition hover:-translate-y-0.5 hover:border-[#7c3aed]"
            >
              <ShoppingCart size={20} />
              {cartCount > 0 ? (
                <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#7c3aed] px-1 text-[0.68rem] font-black text-white">
                  {cartCount}
                </span>
              ) : null}
            </button>
          </div>
        </div>
      </header>

      <section className="relative isolate overflow-hidden bg-[#1d102c]">
        <div className="absolute inset-0">
          {heroImage ? (
            <Image
              src={heroImage}
              alt={business.name}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          ) : (
            <div className="h-full w-full bg-[radial-gradient(circle_at_20%_20%,rgba(124,58,237,0.45),transparent_32%),linear-gradient(135deg,#241436,#3f1b66_48%,#13091f)]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-[#12091d]/92 via-[#241436]/72 to-[#12091d]/45" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#fffaf5] to-transparent" />
        </div>

        <div className="relative mx-auto grid min-h-[25rem] max-w-7xl content-center gap-5 px-4 py-14 md:min-h-[31rem] md:px-6">
          <div className="max-w-2xl">
            {business.logo_url ? (
              <span className="mb-5 grid h-16 w-16 place-items-center overflow-hidden rounded-3xl border border-white/25 bg-white/95">
                <Image
                  src={business.logo_url}
                  alt={business.name}
                  width={64}
                  height={64}
                  className="h-full w-full object-contain p-1.5"
                />
              </span>
            ) : null}

            <h1 className="max-w-3xl text-3xl font-black leading-[1.04] tracking-[-0.04em] text-white md:text-5xl">
              {business.name}
            </h1>

            {business.tagline || business.description ? (
              <p className="mt-4 max-w-xl text-sm font-semibold leading-6 text-white/86 md:text-base md:leading-7">
                {business.tagline || business.description}
              </p>
            ) : null}

            <div className="mt-5 flex flex-wrap gap-2 text-xs font-bold text-white/88">
              {location ? (
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 backdrop-blur">
                  <MapPin size={14} />
                  {location}
                </span>
              ) : null}
              {openingHours ? (
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 backdrop-blur">
                  <Clock size={14} />
                  {openingHours}
                </span>
              ) : null}
              {business.phone ? (
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 backdrop-blur">
                  <Phone size={14} />
                  {business.phone}
                </span>
              ) : null}
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="#products"
                className="inline-flex h-11 items-center justify-center rounded-full bg-white px-5 text-sm font-black text-[#241436] transition hover:-translate-y-0.5"
              >
                View Products
              </a>
              {whatsapp ? (
                <a
                  href={buildWhatsAppLink(whatsapp, `Hello ${business.name}`)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/30 bg-white/10 px-5 text-sm font-black text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/18"
                >
                  <MessageCircle size={16} />
                  Order on WhatsApp
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {categories.length > 1 ? (
        <section className="border-y border-[#eadfff] bg-white">
          <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-3 md:px-6">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`shrink-0 rounded-full border px-4 py-2 text-xs font-black transition ${
                  activeCategory === category
                    ? "border-[#241436] text-white"
                    : "border-[#eadfff] bg-white text-slate-600 hover:border-[#7c3aed] hover:text-[#241436]"
                }`}
                style={
                  activeCategory === category
                    ? { backgroundColor: brandPurple }
                    : undefined
                }
              >
                {category}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {featuredItems.length ? (
        <section className="mx-auto max-w-7xl px-4 pt-8 md:px-6 md:pt-12">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#7c3aed]">
                Featured
              </p>
              <h2 className="mt-1 text-xl font-black tracking-[-0.03em] text-[#241436] md:text-2xl">
                Bestsellers
              </h2>
            </div>
            <a
              href="#products"
              className="hidden rounded-full border border-[#eadfff] bg-white px-4 py-2 text-xs font-black text-[#241436] md:inline-flex"
            >
              View all
            </a>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {featuredItems.map((item) => (
              <FeaturedProductCard
                key={item.id}
                item={item}
                showPrices={showPrices}
                whatsapp={whatsapp}
                businessName={business.name}
              />
            ))}
          </div>
        </section>
      ) : null}

      <section
        id="products"
        className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12"
      >
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#7c3aed]">
              Shop
            </p>
            <h2 className="mt-1 text-xl font-black tracking-[-0.03em] text-[#241436] md:text-2xl">
              Products & Services
            </h2>
          </div>
          <span className="rounded-full border border-[#eadfff] bg-white px-3 py-1.5 text-xs font-black text-slate-500">
            {filteredItems.length}
          </span>
        </div>

        {filteredItems.length ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredItems.map((item) => (
              <ProductCard
                key={item.id}
                item={item}
                showPrices={showPrices}
                whatsapp={whatsapp}
                businessName={business.name}
                onAddToCart={addToCart}
              />
            ))}
          </div>
        ) : (
          <div className="grid min-h-64 place-items-center rounded-[1.75rem] border border-[#eadfff] bg-white px-6 text-center">
            <div>
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#fbf8ff] text-[#7c3aed]">
                <ShoppingBag size={26} />
              </div>
              <h3 className="mt-4 text-lg font-black text-[#241436]">
                No products yet
              </h3>
            </div>
          </div>
        )}
      </section>

      <section className="border-y border-[#eadfff] bg-white">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-8 md:grid-cols-[1.2fr_0.8fr] md:px-6 md:py-10">
          <div className="rounded-[1.75rem] border border-[#eadfff] bg-[#fffaf5] p-5 md:p-6">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#7c3aed]">
              About
            </p>
            <h2 className="mt-2 text-xl font-black tracking-[-0.03em] text-[#241436]">
              {business.name}
            </h2>
            {business.description ? (
              <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">
                {business.description}
              </p>
            ) : null}

            <div className="mt-5 grid gap-3 text-sm font-bold text-slate-700 sm:grid-cols-2">
              {location ? (
                <InfoRow icon={<MapPin size={17} />} label="Location" value={location} />
              ) : null}
              {openingHours ? (
                <InfoRow
                  icon={<Clock size={17} />}
                  label="Business Hours"
                  value={openingHours}
                />
              ) : null}
            </div>
          </div>

          {(deliveryNote || paymentInfo || pickupNote) ? (
            <div className="rounded-[1.75rem] border border-[#eadfff] bg-[#fbf8ff] p-5 md:p-6">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#7c3aed]">
                Orders
              </p>
              <div className="mt-4 grid gap-3">
                {deliveryNote ? (
                  <InfoRow
                    icon={<Truck size={17} />}
                    label="Delivery"
                    value={deliveryNote}
                  />
                ) : null}
                {pickupNote ? (
                  <InfoRow
                    icon={<ShoppingBag size={17} />}
                    label="Pickup"
                    value={pickupNote}
                  />
                ) : null}
                {paymentInfo ? (
                  <InfoRow
                    icon={<ShoppingCart size={17} />}
                    label="Payment"
                    value={paymentInfo}
                  />
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {showFooter ? (
        <Footer
          business={business}
          whatsapp={whatsapp}
          location={location}
          openingHours={openingHours}
          showMarketVillaBadge={showMarketVillaBadge}
        />
      ) : null}

      <WhatsAppCheckout
        businessId={business.id}
        businessName={business.name}
        whatsapp={whatsapp}
        cart={cart}
        setCart={setCart}
        hideTrigger
        isOpen={isCartOpen}
        setIsOpen={setIsCartOpen}
      />
    </main>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3 rounded-2xl border border-[#eadfff] bg-white p-4">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#f4edff] text-[#7c3aed]">
        {icon}
      </span>
      <span>
        <span className="block text-xs font-black uppercase tracking-[0.1em] text-slate-400">
          {label}
        </span>
        <span className="mt-1 block text-sm font-bold leading-5 text-[#241436]">
          {value}
        </span>
      </span>
    </div>
  );
}

function FeaturedProductCard({
  item,
  showPrices,
  whatsapp,
  businessName,
}: {
  item: StoreProduct;
  showPrices: boolean;
  whatsapp: string;
  businessName: string;
}) {
  const image = item.image_url || item.image || "";
  const price = formatCurrency(Number(item.price || 0));

  return (
    <article className="grid grid-cols-[88px_1fr] gap-3 rounded-[1.5rem] border border-[#eadfff] bg-white p-3">
      <div className="relative aspect-square overflow-hidden rounded-[1.1rem] bg-[#f4edff]">
        {image ? (
          <Image
            src={image}
            alt={item.name}
            fill
            sizes="100px"
            className="object-cover"
          />
        ) : (
          <div className="grid h-full place-items-center text-[#7c3aed]">
            <ShoppingBag size={24} />
          </div>
        )}
      </div>
      <div className="min-w-0 py-1">
        <h3 className="line-clamp-2 text-sm font-black leading-5 text-[#241436]">
          {item.name}
        </h3>
        {item.category ? (
          <p className="mt-1 truncate text-xs font-bold text-slate-500">
            {item.category}
          </p>
        ) : null}
        {showPrices ? (
          <p className="mt-2 text-base font-black text-[#dc2626]">{price}</p>
        ) : null}
        {whatsapp ? (
          <a
            href={buildWhatsAppLink(whatsapp, `Hello ${businessName}, I want to order ${item.name}`)}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex rounded-full bg-[#f4edff] px-3 py-1.5 text-[0.68rem] font-black text-[#241436]"
          >
            WhatsApp
          </a>
        ) : null}
      </div>
    </article>
  );
}

function ProductCard({
  item,
  showPrices,
  whatsapp,
  businessName,
  onAddToCart,
}: {
  item: StoreProduct;
  showPrices: boolean;
  whatsapp: string;
  businessName: string;
  onAddToCart: (item: StoreProduct) => void;
}) {
  const price = formatCurrency(Number(item.price || 0));
  const image = item.image_url || item.image || "";
  const description = getShortDescription(item);
  const status = getItemStatus(item);

  return (
    <article className="group overflow-hidden rounded-[1.75rem] border border-[#eadfff] bg-white transition-transform duration-300 hover:-translate-y-1">
      <div className="relative aspect-[1.05] overflow-hidden bg-[#f4edff]">
        {image ? (
          <Image
            src={image}
            alt={item.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 100vw"
            className="object-cover transition duration-300 group-hover:scale-[1.025]"
          />
        ) : (
          <div className="grid h-full place-items-center text-[#7c3aed]">
            <ShoppingBag size={34} />
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-white/92 px-3 py-1 text-[0.65rem] font-black uppercase tracking-[0.08em] text-[#241436] backdrop-blur">
          {status}
        </span>
      </div>

      <div className="p-5">
        {showPrices ? (
          <p className="text-2xl font-black tracking-[-0.05em] text-[#dc2626]">
            {price}
          </p>
        ) : null}

        <h3 className="mt-3 line-clamp-2 text-sm font-black uppercase leading-5 text-[#241436] md:text-base">
          {item.name}
        </h3>

        {item.category ? (
          <p className="mt-2 text-sm font-bold text-[#7d748f]">{item.category}</p>
        ) : null}

        {description ? (
          <p className="mt-3 line-clamp-2 text-sm font-semibold leading-5 text-slate-500">
            {description}
          </p>
        ) : null}

        <div className="mt-5 grid gap-2">
          <button
            type="button"
            onClick={() => onAddToCart(item)}
            className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-[#241436] bg-white px-3 text-sm font-black text-[#241436] transition hover:-translate-y-0.5 hover:bg-[#241436] hover:text-white"
          >
            Add to cart
          </button>

          {whatsapp ? (
            <a
              href={buildWhatsAppLink(whatsapp, `Hello ${businessName}, I want to order ${item.name}`)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#f4edff] px-3 text-sm font-black text-[#241436] transition hover:-translate-y-0.5"
            >
              <MessageCircle size={16} />
              WhatsApp order
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function Footer({
  business,
  whatsapp,
  location,
  openingHours,
  showMarketVillaBadge,
}: {
  business: StoreBusiness;
  whatsapp: string;
  location: string;
  openingHours: string;
  showMarketVillaBadge: boolean;
}) {
  const instagram = business.instagram_url || business.instagramUrl || "";

  return (
    <footer className="bg-[#1f0f35] px-4 py-8 text-white md:px-6 md:py-10">
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1.2fr_1fr_1fr_0.8fr]">
        <div>
          <div className="flex items-center gap-3">
            {business.logo_url ? (
              <span className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-2xl border border-white/15 bg-white">
                <Image
                  src={business.logo_url}
                  alt={business.name}
                  width={56}
                  height={56}
                  className="h-full w-full object-contain p-1"
                />
              </span>
            ) : (
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-white/15 bg-white/10 text-xs font-black">
                {business.name.slice(0, 2).toUpperCase()}
              </span>
            )}
            <div>
              <h2 className="text-base font-black">{business.name}</h2>
              {business.tagline ? (
                <p className="mt-1 text-sm font-semibold text-white/65">
                  {business.tagline}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-black uppercase tracking-[0.14em] text-[#d9c2ff]">
            Contact
          </h3>
          <div className="mt-3 grid gap-2 text-sm font-semibold text-white/78">
            {business.phone ? (
              <a href={`tel:${business.phone}`} className="inline-flex gap-2">
                <Phone size={16} />
                {business.phone}
              </a>
            ) : null}
            {whatsapp ? (
              <a
                href={buildWhatsAppLink(whatsapp, `Hello ${business.name}`)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex gap-2"
              >
                <MessageCircle size={16} />
                {whatsapp}
              </a>
            ) : null}
            {business.email ? (
              <a href={`mailto:${business.email}`} className="inline-flex gap-2">
                <Mail size={16} />
                {business.email}
              </a>
            ) : null}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-black uppercase tracking-[0.14em] text-[#d9c2ff]">
            Store
          </h3>
          <div className="mt-3 grid gap-2 text-sm font-semibold text-white/78">
            {location ? (
              <span className="inline-flex gap-2">
                <MapPin size={16} />
                {location}
              </span>
            ) : null}
            {openingHours ? (
              <span className="inline-flex gap-2">
                <Clock size={16} />
                {openingHours}
              </span>
            ) : null}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-black uppercase tracking-[0.14em] text-[#d9c2ff]">
            Social
          </h3>
          <div className="mt-3 flex gap-2">
            {instagram ? (
              <a
                href={instagram}
                target="_blank"
                rel="noreferrer"
                className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-xs font-black text-white"
              >
                IG
              </a>
            ) : null}
            {whatsapp ? (
              <a
                href={buildWhatsAppLink(whatsapp, `Hello ${business.name}`)}
                target="_blank"
                rel="noreferrer"
                className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-white"
                aria-label="WhatsApp"
              >
                <MessageCircle size={17} />
              </a>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mx-auto mt-8 flex max-w-7xl flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4 text-xs font-semibold text-white/55">
        <span>
          © {new Date().getFullYear()} {business.name}. All rights reserved.
        </span>
        {showMarketVillaBadge ? <span>Powered by Market Villa</span> : null}
      </div>
    </footer>
  );
}
