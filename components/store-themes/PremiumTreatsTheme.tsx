"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ChevronDown,
  Clock3,
  Gift,
  Mail,
  MapPin,
  MessageCircle,
  Search,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Star,
  Store,
  Truck,
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
  is_featured?: boolean | null;
};

type StoreBusiness = {
  id: string;
  name: string;
  slug?: string | null;
  tagline?: string | null;
  description?: string | null;
  logo_url?: string | null;
  cover_image_url?: string | null;
  banner_url?: string | null;
  hero_image_url?: string | null;
  whatsapp?: string | null;
  phone?: string | null;
  email?: string | null;
  location?: string | null;
  instagram_url?: string | null;
  opening_hours?: string | null;
  products?: StoreProduct[] | null;
  theme_settings?: Record<string, any> | null;
};

type Props = {
  business: StoreBusiness;
  products?: StoreProduct[] | null;
};

const extensionKeys = {
  about: ["about-section", "about", "pages"],
  countdown: ["countdown"],
  customCheckout: ["custom-checkout", "customCheckout"],
  faq: ["faq", "faq-builder"],
  featuredBrands: ["featured-brands", "featuredBrands"],
  gallery: ["photo-gallery", "gallery"],
  giftBox: ["gift-box", "giftBox"],
  newsletter: ["newsletter"],
  productAddons: ["product-addons", "productAddons"],
  productBundles: ["product-bundles", "productBundles", "bundles"],
  testimonials: ["testimonials", "reviews"],
  trustBadges: ["trust-badges", "trustBadges"],
};

function getHeroImage(business: StoreBusiness, products: StoreProduct[]) {
  return (
    business.cover_image_url ||
    business.banner_url ||
    business.hero_image_url ||
    products.find((product) => product.image_url || product.image)?.image_url ||
    products.find((product) => product.image_url || product.image)?.image ||
    ""
  );
}

function isVisibleItem(item: StoreProduct) {
  return item.is_available !== false && item.is_published !== false;
}

function readAddon(settings: Record<string, any> | null | undefined, keys: string[]) {
  const addons = settings?.addons || settings?.extensions || {};
  const entitlements =
    settings?.addonEntitlements || settings?.extensionEntitlements || {};
  const activeList = settings?.activeAddons || settings?.activeExtensions || [];

  return keys.some((key) => {
    return (
      addons?.[key] === true ||
      entitlements?.[key] === true ||
      (Array.isArray(activeList) && activeList.includes(key))
    );
  });
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function PremiumTreatsTheme({ business, products }: Props) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const settings = business.theme_settings || {};
  const whatsapp = business.whatsapp || business.phone || "";
  const announcement =
    String(settings.announcementText || "").trim() ||
    `Welcome to ${business.name}`;

  const items = useMemo(() => {
    return [...(products || business.products || [])].filter(isVisibleItem);
  }, [business.products, products]);

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

  const heroImage = getHeroImage(business, items);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const extension = {
    about: readAddon(settings, extensionKeys.about),
    countdown: readAddon(settings, extensionKeys.countdown),
    faq: readAddon(settings, extensionKeys.faq),
    gallery: readAddon(settings, extensionKeys.gallery),
    newsletter: readAddon(settings, extensionKeys.newsletter),
    testimonials: readAddon(settings, extensionKeys.testimonials),
    trustBadges: readAddon(settings, extensionKeys.trustBadges),
  };

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

  const galleryImages = [
    heroImage,
    ...items.map((item) => item.image_url || item.image || ""),
  ]
    .filter(Boolean)
    .slice(0, 4);

  return (
    <main className="market-villa-customized-store min-h-screen bg-[#fffaf0] text-[#1f180d]">
      <section className="border-b border-[#d7bd82] bg-[#06261c] px-4 py-2 text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-4 gap-y-1 text-center text-xs font-semibold">
          <span className="inline-flex items-center gap-2">
            <Gift size={14} className="text-[#d9ad54]" />
            {announcement}
          </span>

          {extension.countdown ? (
            <span className="rounded-full border border-[#d9ad54]/50 px-3 py-1 text-[#f8e6b8]">
              Limited offer
            </span>
          ) : null}
        </div>
      </section>

      <header className="sticky top-0 z-40 border-b border-[#eadbb8] bg-[#fffaf0]/95 backdrop-blur">
        <div className="mx-auto grid max-w-7xl gap-3 px-4 py-4 lg:grid-cols-[auto_1fr_auto] lg:items-center">
          <div className="flex items-center justify-between gap-3">
            <Link
              href={`/store/${business.slug || ""}`}
              className="flex min-w-0 items-center gap-3"
              aria-label={business.name}
            >
              {business.logo_url ? (
                <span className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-full border border-[#d7bd82] bg-white">
                  <Image
                    src={business.logo_url}
                    alt={business.name}
                    width={56}
                    height={56}
                    priority
                    className="h-full w-full object-contain p-1"
                  />
                </span>
              ) : (
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-[#d7bd82] bg-white text-lg font-black text-[#9b6f21]">
                  {getInitials(business.name)}
                </span>
              )}

              <span className="min-w-0">
                <span className="block truncate text-lg font-black leading-tight text-[#1f180d]">
                  {business.name}
                </span>
                {business.tagline ? (
                  <span className="block truncate text-xs font-semibold text-[#7c6b4d]">
                    {business.tagline}
                  </span>
                ) : null}
              </span>
            </Link>

            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative grid h-11 w-11 place-items-center rounded-full border border-[#d7bd82] bg-white text-[#1f180d] lg:hidden"
              aria-label="Open cart"
            >
              <ShoppingCart size={20} />
              {cartCount > 0 ? (
                <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#b8892f] px-1 text-[10px] font-black text-white">
                  {cartCount}
                </span>
              ) : null}
            </button>
          </div>

          <nav className="hidden items-center justify-center gap-7 text-sm font-bold text-[#2f2618] lg:flex">
            <a href="#shop">Shop</a>
            {extension.about ? <a href="#about">About</a> : null}
            {extension.gallery ? <a href="#gallery">Gallery</a> : null}
            {extension.testimonials ? <a href="#reviews">Reviews</a> : null}
            {extension.faq ? <a href="#faq">FAQ</a> : null}
            <a href="#contact">Contact</a>
          </nav>

          <div className="grid gap-2 sm:grid-cols-[1fr_auto] lg:min-w-[360px]">
            <label className="flex h-11 items-center gap-2 rounded-full border border-[#e4d2a7] bg-white px-4 text-sm">
              <Search size={17} className="text-[#8c7a5b]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search"
                className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-[#1f180d] outline-none placeholder:text-[#a99978]"
              />
            </label>

            <div className="hidden items-center gap-2 lg:flex">
              {business.opening_hours ? (
                <span className="inline-flex h-11 items-center gap-2 rounded-full border border-[#e4d2a7] bg-white px-4 text-xs font-bold text-[#2f2618]">
                  <span className="h-2 w-2 rounded-full bg-emerald-600" />
                  {business.opening_hours}
                </span>
              ) : null}

              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="relative grid h-11 w-11 place-items-center rounded-full border border-[#e4d2a7] bg-white text-[#1f180d]"
                aria-label="Open cart"
              >
                <ShoppingCart size={19} />
                {cartCount > 0 ? (
                  <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#b8892f] px-1 text-[10px] font-black text-white">
                    {cartCount}
                  </span>
                ) : null}
              </button>

              {whatsapp ? (
                <a
                  href={buildWhatsAppLink(whatsapp, `Hello ${business.name}`)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#06261c] px-4 text-xs font-black text-white"
                >
                  <MessageCircle size={16} />
                  WhatsApp Order
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-[#06261c]">
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
            <div className="h-full w-full bg-[radial-gradient(circle_at_70%_35%,rgba(184,137,47,0.38),transparent_34%),linear-gradient(135deg,#06261c,#0b3a2b_52%,#1f180d)]" />
          )}
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(6,38,28,0.94),rgba(6,38,28,0.48),rgba(6,38,28,0.2))]" />
        </div>

        <div className="relative mx-auto grid min-h-[430px] max-w-7xl items-center gap-8 px-4 py-12 lg:grid-cols-[0.92fr_0.48fr] lg:px-6">
          <div className="max-w-2xl text-white">
            {business.tagline ? (
              <p className="font-serif text-lg italic text-[#d9ad54]">
                {business.tagline}
              </p>
            ) : null}

            <h1 className="mt-3 max-w-xl font-serif text-[2.7rem] font-black leading-[0.92] tracking-[-0.04em] md:text-[4.4rem]">
              {business.name}
            </h1>

            {business.description ? (
              <p className="mt-5 max-w-lg text-sm font-medium leading-6 text-white/82 md:text-base">
                {business.description}
              </p>
            ) : null}

            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="#shop"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-[#b8892f] px-6 text-sm font-black text-white"
              >
                Shop Now
                <ShoppingBag size={16} />
              </a>

              {whatsapp ? (
                <a
                  href={buildWhatsAppLink(whatsapp, `Hello ${business.name}`)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-white/45 px-6 text-sm font-black text-white"
                >
                  Order on WhatsApp
                  <MessageCircle size={16} />
                </a>
              ) : null}
            </div>
          </div>

          {extension.trustBadges ? (
            <div className="grid gap-3">
              {[
                {
                  title: "Open Now",
                  label: business.opening_hours || "Available today",
                  icon: Clock3,
                },
                {
                  title: "WhatsApp Ready",
                  label: "Quick replies and orders",
                  icon: MessageCircle,
                },
                {
                  title: "Trusted Business",
                  label: "Verified Market Villa seller",
                  icon: ShieldCheck,
                },
              ].map(({ title, label, icon: Icon }) => (
                <div
                  key={String(title)}
                  className="rounded-xl border border-white/20 bg-white/92 p-4 text-[#1f180d]"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-full border border-[#e4d2a7] bg-[#fffaf0] text-[#9b6f21]">
                      <Icon size={18} />
                    </span>
                    <span>
                      <span className="block text-sm font-black">{title}</span>
                      <span className="block text-xs font-semibold text-[#776746]">
                        {label}
                      </span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className="border-b border-[#eadbb8] bg-white">
        <div className="mx-auto grid max-w-7xl gap-0 divide-y divide-[#eadbb8] px-4 py-5 md:grid-cols-4 md:divide-x md:divide-y-0 md:px-6">
          {[
            { title: "Fast Delivery", label: "Quick delivery", icon: Truck },
            {
              title: "Premium Quality",
              label: "Curated products",
              icon: ShieldCheck,
            },
            {
              title: "Easy WhatsApp Orders",
              label: "Order in minutes",
              icon: MessageCircle,
            },
            {
              title: "Perfect for Gifting",
              label: "Beautifully packaged",
              icon: Gift,
            },
          ].map(({ title, label, icon: Icon }) => (
            <div key={String(title)} className="flex items-center gap-3 px-2 py-3">
              <Icon size={27} className="text-[#9b6f21]" />
              <span>
                <span className="block text-sm font-black">{title}</span>
                <span className="block text-xs font-semibold text-[#776746]">
                  {label}
                </span>
              </span>
            </div>
          ))}
        </div>
      </section>

      <section id="shop" className="px-4 py-8 md:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-serif text-2xl font-black text-[#1f180d]">
              Featured Products
            </h2>

            <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`whitespace-nowrap rounded-full border px-4 py-2 text-xs font-black transition ${
                    activeCategory === category
                      ? "border-[#06261c] bg-[#06261c] text-white"
                      : "border-[#eadbb8] bg-white text-[#3d321f]"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {filteredItems.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {filteredItems.map((item) => {
                const image = item.image_url || item.image || "";

                return (
                  <article
                    key={item.id}
                    className="group overflow-hidden rounded-xl border border-[#eadbb8] bg-white transition duration-200 hover:-translate-y-1"
                  >
                    <div className="relative aspect-[4/3] bg-[#f4ead2]">
                      {image ? (
                        <Image
                          src={image}
                          alt={item.name}
                          fill
                          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                          className="object-cover transition duration-300 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="grid h-full place-items-center text-[#9b6f21]">
                          <Store size={30} />
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[#9b6f21]">
                        {item.category || "Product"}
                      </p>
                      <h3 className="mt-2 min-h-10 text-sm font-black leading-5 text-[#1f180d]">
                        {item.name}
                      </h3>
                      <p className="mt-3 text-lg font-black text-[#b91c1c]">
                        {formatCurrency(Number(item.price || 0))}
                      </p>

                      <button
                        type="button"
                        onClick={() => addToCart(item)}
                        className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[#06261c] px-4 text-xs font-black text-white"
                      >
                        <ShoppingCart size={15} />
                        Add to Cart
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-[#eadbb8] bg-white p-8 text-center">
              <p className="text-sm font-black text-[#1f180d]">
                No products available
              </p>
            </div>
          )}
        </div>
      </section>

      {extension.about && business.description ? (
        <section id="about" className="px-4 pb-8 md:px-6">
          <div className="mx-auto grid max-w-7xl gap-4 rounded-xl border border-[#eadbb8] bg-white p-5 lg:grid-cols-[0.8fr_1fr]">
            <div>
              <h2 className="font-serif text-2xl font-black">Our Story</h2>
              <p className="mt-3 text-sm font-medium leading-6 text-[#5f5034]">
                {business.description}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-4">
              {["Premium", "Hygienic", "Made With Love", "Customer Care"].map(
                (item) => (
                  <div
                    key={item}
                    className="rounded-lg border border-[#eadbb8] bg-[#fffaf0] p-3 text-center text-xs font-black"
                  >
                    <Star className="mx-auto mb-2 text-[#9b6f21]" size={18} />
                    {item}
                  </div>
                ),
              )}
            </div>
          </div>
        </section>
      ) : null}

      {extension.gallery && galleryImages.length > 0 ? (
        <section id="gallery" className="px-4 pb-8 md:px-6">
          <div className="mx-auto max-w-7xl rounded-xl border border-[#eadbb8] bg-white p-5">
            <h2 className="mb-4 font-serif text-2xl font-black">Gallery</h2>
            <div className="grid gap-3 sm:grid-cols-4">
              {galleryImages.map((image, index) => (
                <div
                  key={`${image}-${index}`}
                  className="relative aspect-[4/3] overflow-hidden rounded-lg bg-[#f4ead2]"
                >
                  <Image
                    src={image}
                    alt={`${business.name} gallery ${index + 1}`}
                    fill
                    sizes="(min-width: 768px) 25vw, 100vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {extension.testimonials ? (
        <section id="reviews" className="px-4 pb-8 md:px-6">
          <div className="mx-auto max-w-7xl">
            <h2 className="mb-4 text-center font-serif text-2xl font-black">
              Customer Reviews
            </h2>
            <div className="grid gap-3 md:grid-cols-3">
              {["Beautiful packaging", "Fast response", "Quality products"].map(
                (item) => (
                  <div
                    key={item}
                    className="rounded-xl border border-[#eadbb8] bg-white p-4"
                  >
                    <div className="mb-2 flex gap-0.5 text-[#d9a21b]">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star key={index} size={14} fill="currentColor" />
                      ))}
                    </div>
                    <p className="text-sm font-bold text-[#1f180d]">{item}</p>
                  </div>
                ),
              )}
            </div>
          </div>
        </section>
      ) : null}

      {extension.newsletter ? (
        <section className="bg-[#06261c] px-4 py-7 text-white md:px-6">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h2 className="font-serif text-2xl font-black">
              Get exclusive offers
            </h2>
            <div className="flex gap-2">
              <input
                placeholder="WhatsApp number"
                className="h-11 min-w-0 rounded-md border border-white/15 bg-white/10 px-4 text-sm font-semibold outline-none placeholder:text-white/55"
              />
              <button className="h-11 rounded-md bg-[#b8892f] px-5 text-sm font-black text-white">
                Join Now
              </button>
            </div>
          </div>
        </section>
      ) : null}

      {extension.faq ? (
        <section id="faq" className="px-4 py-8 md:px-6">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-4 text-center font-serif text-2xl font-black">
              Frequently Asked Questions
            </h2>
            <div className="grid gap-3 md:grid-cols-2">
              {[
                "How do I place an order?",
                "Do you offer delivery?",
                "Can I make a custom order?",
                "What payment methods do you accept?",
              ].map((question) => (
                <details
                  key={question}
                  className="rounded-lg border border-[#eadbb8] bg-white p-4"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-black">
                    {question}
                    <ChevronDown size={16} />
                  </summary>
                </details>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <footer id="contact" className="bg-[#06261c] px-4 py-8 text-white md:px-6">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-[1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-full border border-[#d7bd82] text-sm font-black text-[#d9ad54]">
                {getInitials(business.name)}
              </span>
              <div>
                <p className="font-black">{business.name}</p>
                {business.tagline ? (
                  <p className="text-xs font-semibold text-white/60">
                    {business.tagline}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="grid gap-3 text-sm font-semibold text-white/78 sm:grid-cols-2">
            {whatsapp ? (
              <a
                href={buildWhatsAppLink(whatsapp, `Hello ${business.name}`)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 p-3"
              >
                <MessageCircle size={17} />
                {whatsapp}
              </a>
            ) : null}
            {business.email ? (
              <span className="inline-flex items-center gap-2 rounded-lg border border-white/10 p-3">
                <Mail size={17} />
                {business.email}
              </span>
            ) : null}
            {business.location ? (
              <span className="inline-flex items-center gap-2 rounded-lg border border-white/10 p-3">
                <MapPin size={17} />
                {business.location}
              </span>
            ) : null}
            {business.opening_hours ? (
              <span className="inline-flex items-center gap-2 rounded-lg border border-white/10 p-3">
                <Clock3 size={17} />
                {business.opening_hours}
              </span>
            ) : null}
          </div>
        </div>

        <div className="mx-auto mt-6 flex max-w-7xl flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5 text-xs font-semibold text-white/48">
          <span>© {new Date().getFullYear()} {business.name}</span>
          <span>Powered by Market Villa</span>
        </div>
      </footer>

      {extension.trustBadges && whatsapp ? (
        <a
          href={buildWhatsAppLink(whatsapp, `Hello ${business.name}`)}
          target="_blank"
          rel="noreferrer"
          className="fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-emerald-600 text-white lg:bottom-7 lg:right-7"
          aria-label="Chat on WhatsApp"
        >
          <MessageCircle size={25} />
        </a>
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
