"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Search,
  ShoppingBag,
  ShoppingCart,
  Store,
} from "lucide-react";
import { WhatsAppCheckout, type CartItem } from "@/components/WhatsAppCheckout";
import { buildWhatsAppLink, formatCurrency } from "@/lib/utils";

type StoreProduct = {
  id: string;
  name: string;
  price?: number | string | null;
  category?: string | null;
  image_url?: string | null;
  image?: string | null;
  is_available?: boolean | null;
  is_published?: boolean | null;
};

type StoreBusiness = {
  id: string;
  name: string;
  slug?: string | null;
  tagline?: string | null;
  logo_url?: string | null;
  logo_text?: string | null;
  cover_image_url?: string | null;
  banner_url?: string | null;
  hero_image_url?: string | null;
  whatsapp?: string | null;
  phone?: string | null;
  email?: string | null;
  location?: string | null;
  instagram_url?: string | null;
  products?: StoreProduct[] | null;
  theme_settings?: {
    announcementText?: string | null;
    toggles?: {
      showPrices?: boolean;
      showFooter?: boolean;
      showMarketVillaBadge?: boolean;
    };
  } | null;
};

type Props = {
  business: StoreBusiness;
  products?: StoreProduct[] | null;
  services?: StoreProduct[] | null;
};

const brandPurple = "#241436";
const brandViolet = "#7c3aed";

function getHeroImage(business: StoreBusiness) {
  return business.cover_image_url || business.banner_url || business.hero_image_url || "";
}

function isVisibleItem(item: StoreProduct) {
  return item.is_available !== false && item.is_published !== false;
}

export function DefaultOnePageTheme({
  business,
  products,
  services,
}: Props) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [announcementIndex, setAnnouncementIndex] = useState(0);

  const settings = business.theme_settings || {};
  const whatsapp = business.whatsapp || business.phone || "";
  const heroImage = getHeroImage(business);
  const showPrices = settings.toggles?.showPrices !== false;
  const showFooter = settings.toggles?.showFooter !== false;
  const showMarketVillaBadge = settings.toggles?.showMarketVillaBadge !== false;
  const announcement =
    settings.announcementText?.trim() || `Welcome to ${business.name}`;

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
      setAnnouncementIndex((current) => {
        return (current + 1) % announcementItems.length;
      });
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
    <main className="market-villa-customized-store min-h-screen bg-[#faf8ff] text-[#17111f]">
      
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
<header className="sticky top-0 z-40 border-b border-slate-100 bg-white">
        <div className="mx-auto grid max-w-7xl gap-3 px-4 py-3 md:grid-cols-[auto_minmax(220px,460px)_auto] md:items-center md:px-6">
          <div className="flex min-w-0 items-center justify-between gap-3">
            <Link
              href={`/store/${business.slug || ""}`}
              className="flex min-w-0 items-center gap-3"
              aria-label={business.name}
            >
              {business.logo_url ? (
                <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl border border-slate-100 bg-white">
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
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-white"
                  style={{ backgroundColor: brandPurple }}
                >
                  <Store size={20} />
                </span>
              )}

              <span className="min-w-0"><span className="block truncate text-base font-black uppercase leading-tight text-[#17111f] md:text-lg">{business.name}</span></span>
            </Link>

            <div className="flex shrink-0 items-center gap-2 md:hidden">
              {whatsapp ? (
                <a
                  href={buildWhatsAppLink(whatsapp, `Hello ${business.name}`)}
                  target="_blank"
                  rel="noreferrer"
                  className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white text-[#241436]"
                  aria-label="WhatsApp"
                >
                  <MessageCircle size={19} />
                </a>
              ) : null}
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                aria-label="Open cart"
                className="relative grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white text-[#241436]"
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
              className="h-10 w-full rounded-md border border-slate-100 bg-slate-50 pl-11 pr-4 text-sm font-semibold outline-none transition focus:border-[#7c3aed] focus:bg-white"
              placeholder="Search"
            />
          </label>

          <div className="hidden items-center justify-end gap-3 text-sm font-bold text-slate-700 md:flex">
            {business.location ? (
              <span className="inline-flex max-w-40 items-center gap-2 truncate">
                <MapPin size={16} className="text-[#7c3aed]" />
                <span className="truncate">{business.location}</span>
              </span>
            ) : null}
            {whatsapp ? (
              <a
                href={buildWhatsAppLink(whatsapp, `Hello ${business.name}`)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-[#241436]"
              >
                <MessageCircle size={16} />
                Contact
              </a>
            ) : null}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              aria-label="Open cart"
              className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full border border-slate-200 bg-white text-[#241436] transition hover:-translate-y-0.5 hover:border-[#7c3aed]"
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

      <section className="bg-[#faf8ff]">
        <div className="relative grid min-h-[10.5rem] overflow-hidden bg-[#f6f0ff] md:min-h-[15.5rem]">
          {heroImage ? (
            <Image
              src={heroImage}
              alt={business.name}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          ) : null}
          <div className="absolute inset-0 bg-black/10" />
        </div>
      </section>

      <section className="border-y border-[#eee7f7] bg-[#faf8ff]">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-3 md:px-6">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={`shrink-0 rounded-md px-4 py-2 text-[0.68rem] font-black transition ${
                activeCategory === category
                  ? "text-white"
                  : "bg-white text-slate-600"
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

      <section className="mx-auto max-w-7xl bg-[#faf8ff] px-4 py-7 md:px-6 md:py-10">
        {filteredItems.length ? (
          <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:gap-x-9">
            {filteredItems.map((item) => (
              <ProductCard
                key={item.id}
                item={item}
                showPrices={showPrices}
                onAddToCart={addToCart}
              />
            ))}
          </div>
        ) : (
          <div className="grid min-h-64 place-items-center rounded-2xl border border-slate-100 bg-slate-50">
            <h2 className="text-lg font-black text-slate-700">Products</h2>
          </div>
        )}
      </section>
      {showFooter ? (
        <footer className="bg-[#1f0f35] px-4 py-4 text-white md:px-6 md:py-6">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-5 md:grid-cols-[1.25fr_auto_1fr_1fr_auto_1fr] md:items-start md:gap-6">
              <div className="flex flex-col items-center text-center md:flex-row md:items-center md:gap-4 md:text-left">
                {business.logo_url ? (
                  <span className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-full border border-[#d3a334] bg-white/5 md:h-[76px] md:w-[76px]">
                    <Image
                      src={business.logo_url}
                      alt={business.name}
                      width={76}
                      height={76}
                      className="h-full w-full object-contain p-1.5"
                    />
                  </span>
                ) : (
                  <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full border border-[#d3a334] bg-white/5 text-xs font-black text-[#f4c76b] md:h-[76px] md:w-[76px] md:text-sm">
                    {business.name.slice(0, 2).toUpperCase()}
                  </span>
                )}

                <div className="mt-2 md:mt-0">
                  <h2 className="text-sm font-black text-white md:text-base">
                    {business.name}
                  </h2>
                  {business.tagline ? (
                    <p className="mt-0.5 max-w-56 text-xs font-semibold leading-4 text-white/80 md:mt-1 md:max-w-48 md:text-sm md:leading-5">
                      {business.tagline}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="hidden h-[72px] w-px bg-white/35 md:block" />

              <div className="grid grid-cols-2 gap-4 md:contents">
                <div className="text-center md:text-left">
                  <h3 className="text-[0.68rem] font-black uppercase tracking-[0.12em] text-[#f4c76b] md:text-xs">
                    Contact
                  </h3>

                  <div
                    className="mt-1 flex flex-col items-center text-xs font-semibold text-white/85 md:items-start md:text-sm"
                    style={{ gap: "8px", lineHeight: 1 }}
                  >
                    {business.phone ? (
                      <a
                        href={`tel:${business.phone}`}
                        className="inline-flex items-center justify-center gap-1.5 md:justify-start"
                        style={{ minHeight: "16px", lineHeight: 1 }}
                      >
                        <Phone size={13} />
                        <span>{business.phone}</span>
                      </a>
                    ) : null}

                    {whatsapp ? (
                      <a
                        href={buildWhatsAppLink(whatsapp, `Hello ${business.name}`)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 md:justify-start"
                        style={{ minHeight: "16px", lineHeight: 1 }}
                      >
                        <MessageCircle size={13} />
                        <span>{whatsapp}</span>
                      </a>
                    ) : null}
                  </div>
                </div>

                <div className="text-center md:text-left">
                  <h3 className="text-[0.68rem] font-black uppercase tracking-[0.12em] text-[#f4c76b] md:text-xs">
                    Location
                  </h3>
                  <div className="mt-2 grid gap-1 text-xs font-semibold text-white/85 md:mt-2 md:gap-1.5 md:text-sm">
                    {business.location ? (
                      <span className="inline-flex items-center justify-center gap-1.5 md:justify-start">
                        <MapPin size={14} />
                        {business.location}
                      </span>
                    ) : null}

                    <span className="inline-flex items-center justify-center gap-1.5 md:justify-start">
                      We deliver smiles!
                      <span className="text-[#f4c76b]">♥</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="hidden h-[72px] w-px bg-white/35 md:block" />

              {business.instagram_url || whatsapp ? (
                <div className="text-center md:text-left">
                  <h3 className="text-[0.68rem] font-black uppercase tracking-[0.12em] text-[#f4c76b] md:text-xs">
                    Follow us
                  </h3>
                  <div className="mt-2 flex items-center justify-center gap-2 md:mt-3 md:justify-start md:gap-3">

                  {business.instagram_url ? (
                    <a
                      href={business.instagram_url}
                      target="_blank"
                      rel="noreferrer"
                      className="grid h-8 w-8 place-items-center rounded-full border border-[#f4c76b]/55 text-[0.68rem] font-black text-white transition hover:border-[#f4c76b] hover:bg-white/10 md:h-9 md:w-9 md:text-xs"
                      aria-label="Instagram"
                    >
                      IG
                    </a>
                  ) : null}

                  {whatsapp ? (
                    <a
                      href={buildWhatsAppLink(whatsapp, `Hello ${business.name}`)}
                      target="_blank"
                      rel="noreferrer"
                      className="grid h-8 w-8 place-items-center rounded-full border border-[#f4c76b]/55 text-[0.68rem] font-black text-white transition hover:border-[#f4c76b] hover:bg-white/10 md:h-9 md:w-9 md:text-xs"
                      aria-label="WhatsApp"
                    >
                      <svg
                      viewBox="0 0 24 24"
                      className="h-4 w-4"
                      aria-hidden="true"
                    >
                      <path
                        fill="currentColor"
                        d="M12.04 2a9.86 9.86 0 0 0-8.46 14.9L2.3 22l5.23-1.24A9.94 9.94 0 1 0 12.04 2Zm0 2a7.94 7.94 0 1 1 0 15.88 7.85 7.85 0 0 1-4.02-1.1l-.38-.23-2.32.55.56-2.25-.25-.4A7.94 7.94 0 0 1 12.04 4Zm-3.5 4.3c.17-.38.35-.39.52-.39h.45c.15 0 .38.06.58.29.2.23.76.74.76 1.8s-.78 2.09-.89 2.24c-.11.15-.15.28-.04.5.11.23.48.79 1.02 1.28.7.62 1.29.82 1.52.91.23.08.36.07.5-.08.15-.17.58-.68.74-.91.15-.23.31-.19.52-.11.21.08 1.36.64 1.59.76.23.11.39.17.45.26.06.1.06.57-.13 1.12-.19.55-1.12 1.06-1.55 1.1-.4.04-.92.06-1.48-.09-.34-.09-.78-.25-1.34-.49-2.36-1.02-3.9-3.39-4.02-3.55-.11-.15-.96-1.28-.96-2.45s.61-1.74.83-1.97c.21-.23.46-.29.61-.29h.34Z"
                      />
                    </svg>
                    </a>
                  ) : null}
                
                  </div>
                </div>
              ) : null}
            </div>

            <div className="mt-4 border-t border-white/25 pt-2 text-center text-[0.68rem] font-semibold text-white/80 md:mt-5 md:pt-3 md:text-xs">
              © {new Date().getFullYear()} {business.name}. All rights reserved.
              {showMarketVillaBadge ? (
                <span className="ml-2 text-white/45">
                  Powered by Market Villa
                </span>
              ) : null}
            </div>
          </div>
        </footer>
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

function ProductCard({
  item,
  showPrices,
  onAddToCart,
}: {
  item: StoreProduct;
  showPrices: boolean;
  onAddToCart: (item: StoreProduct) => void;
}) {
  const price = formatCurrency(Number(item.price || 0));
  const image = item.image_url || item.image || "";

  return (
    <article
      className="group overflow-hidden rounded-[2rem] bg-[#fbfaff] transition-transform duration-300 hover:-translate-y-1"
      style={{ boxShadow: "none" }}
    >
      <div
        className="relative aspect-[1.02] overflow-hidden rounded-t-[2rem] bg-[#f1f2f3]"
        style={{ boxShadow: "none" }}
      >

        {image ? (
          <Image
            src={image}
            alt={item.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
            className="object-cover transition duration-300 group-hover:scale-[1.025]"
          />
        ) : (
          <div className="grid h-full place-items-center text-slate-300">
            <ShoppingBag size={34} />
          </div>
        )}
      </div>

      <div className="px-5 pb-6 pt-5" style={{ boxShadow: "none" }}>
        {showPrices ? (
          <p className="mb-5 text-3xl font-black tracking-[-0.06em] text-[#dc2626] md:text-[2.15rem]">
            {price}
          </p>
        ) : null}

        <div className="grid grid-cols-[1fr_auto] items-center gap-3">
          <h2 className="line-clamp-2 min-h-10 text-sm font-semibold uppercase leading-5 text-[#241436] md:text-base">
            {item.name}
          </h2>
          <span className="h-1 w-1 rounded-full bg-[#dc2626]" />
        </div>

        {item.category ? (
          <p className="mt-5 text-base font-semibold text-[#7d748f]">
            {item.category}
          </p>
        ) : null}

        <button
          type="button"
          onClick={() => onAddToCart(item)}
          className="mt-7 inline-flex min-h-14 w-full items-center justify-center rounded-[1.35rem] border border-[#241436] bg-white px-3 text-sm font-black text-[#241436] transition hover:-translate-y-0.5 hover:bg-[#241436] hover:text-white md:text-base"
        >
          Add to cart
        </button>
      </div>
    </article>
  );
}

































