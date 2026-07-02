"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  Flame,
  ImageIcon,
  MapPin,
  Menu,
  MessageCircle,
  Search,
  ShoppingCart,
  Store,
  Truck,
  Utensils,
  X,
} from "lucide-react";
import { createOrder } from "@/lib/business-actions";
import { buildWhatsAppLink, formatCurrency } from "@/lib/utils";

type SuyaProduct = {
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

type SuyaBusiness = {
  id: string;
  name: string;
  slug?: string | null;
  tagline?: string | null;
  description?: string | null;
  logo_url?: string | null;
  cover_image_url?: string | null;
  hero_image_url?: string | null;
  banner_url?: string | null;
  whatsapp?: string | null;
  phone?: string | null;
  email?: string | null;
  location?: string | null;
  instagram_url?: string | null;
  opening_hours?: string | null;
  products?: SuyaProduct[] | null;
  theme_settings?: Record<string, any> | null;
};

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

type QuoteState = {
  type: "bulk" | "product";
  product?: SuyaProduct | null;
} | null;

type Props = {
  business: SuyaBusiness;
  products?: SuyaProduct[] | null;
  mode?: "home" | "grill";
};

const fallbackProducts: SuyaProduct[] = [
  {
    id: "suya-beef",
    name: "Beef Suya",
    category: "Beef Suya",
    price: 2500,
    image_url: "/suya/suya-platter.png",
    is_featured: true,
  },
  {
    id: "suya-chicken",
    name: "Chicken Suya",
    category: "Chicken Suya",
    price: 3500,
    image_url: "/suya/suya-grill.png",
    is_featured: true,
  },
  {
    id: "suya-ram",
    name: "Ram Suya",
    category: "Ram Suya",
    price: 4000,
    image_url: "/suya/suya-gallery-1.png",
  },
  {
    id: "suya-yaji",
    name: "Yaji Spice",
    category: "Spices / Yaji",
    price: 1200,
    image_url: "/suya/suya-gallery-2.png",
  },
  {
    id: "suya-family-pack",
    name: "Family Pack",
    category: "Family Pack",
    price: 18000,
    image_url: "/suya/suya-party-pack.png",
    is_featured: true,
  },
  {
    id: "suya-event-tray",
    name: "Event Tray",
    category: "Event Tray",
    price: 0,
    image_url: "/suya/suya-party-pack.png",
  },
  {
    id: "suya-bulk-order",
    name: "Bulk Party Order",
    category: "Party Pack",
    price: 0,
    image_url: "/suya/suya-hero.png",
  },
];

const allowedCategories = [
  "All",
  "Beef Suya",
  "Chicken Suya",
  "Ram Suya",
  "Party Pack",
  "Family Pack",
  "Event Tray",
  "Spices / Yaji",
];

const fallbackBusiness: SuyaBusiness = {
  id: "suya-spot-demo",
  name: "S I S Suya Spot",
  slug: "suya-spot",
  tagline: "Hot Suya. Fresh Off The Grill.",
  description:
    "From single portions to party packs, S I S Suya Spot serves fresh grilled suya for every craving.",
  cover_image_url: "/suya/suya-hero.png",
  whatsapp: "2348036882822",
  location: "Gwarimpa, Abuja",
  opening_hours: "Open from 11:00 AM daily",
};

function getHeroImage(business: SuyaBusiness) {
  return (
    business.theme_settings?.heroImageUrl ||
    business.cover_image_url ||
    business.hero_image_url ||
    business.banner_url ||
    "/suya/suya-hero.png"
  );
}

function productImage(product: SuyaProduct) {
  return product.image_url || product.image || "/suya/suya-platter.png";
}

function isVisibleProduct(product: SuyaProduct) {
  return product.is_available !== false && product.is_published !== false;
}

function getWhatsapp(business: SuyaBusiness) {
  return business.whatsapp || business.phone || fallbackBusiness.whatsapp || "";
}

function isPriced(product: SuyaProduct) {
  return Number(product.price || 0) > 0;
}

export function SuyaSpotProTheme({
  business: inputBusiness,
  products,
  mode = "home",
}: Props) {
  const business = { ...fallbackBusiness, ...inputBusiness };
  const whatsapp = getWhatsapp(business);
  const settings = business.theme_settings || {};
  const heroImage = getHeroImage(business);
  const announcementText = String(settings.announcementText || "").trim();
  const instagramVideoUrl = String(settings.instagramVideoUrl || "").trim();
  const promoVideoUrl = String(settings.promoVideoUrl || "").trim();
  const instagramUrl =
    String(settings.instagramUrl || business.instagram_url || "").trim();

  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [quoteState, setQuoteState] = useState<QuoteState>(null);
  const [activeFaq, setActiveFaq] = useState(0);
  const [checkoutMessage, setCheckoutMessage] = useState("");

  const items = useMemo(() => {
    const source = products?.length ? products : business.products || fallbackProducts;
    return source
      .filter(isVisibleProduct)
      .filter((product) =>
        allowedCategories.includes(product.category || "") || !product.category,
      );
  }, [business.products, products]);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return items.filter((item) => {
      const matchesCategory = category === "All" || item.category === category;
      const matchesQuery =
        !normalizedQuery ||
        item.name.toLowerCase().includes(normalizedQuery) ||
        (item.category || "").toLowerCase().includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });
  }, [category, items, query]);

  const favorites = useMemo(() => {
    const featured = items.filter((item) => item.is_featured);
    return (featured.length ? featured : items).slice(0, 5);
  }, [items]);

  const partyPacks = useMemo(() => {
    const packs = items.filter((item) =>
      ["Party Pack", "Family Pack", "Event Tray"].includes(item.category || ""),
    );

    return (packs.length ? packs : fallbackProducts.slice(4, 7)).slice(0, 3);
  }, [items]);

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  function addToCart(product: SuyaProduct) {
    if (!isPriced(product)) {
      setQuoteState({ type: "product", product });
      return;
    }

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
        },
      ];
    });
    setCartOpen(true);
  }

  function scrollOrQuote(target: string) {
    setMenuOpen(false);

    if (target === "bulk") {
      setQuoteState({ type: "bulk" });
      return;
    }

    const element = document.querySelector(target);
    element?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function buildCartMessage(fields: {
    name: string;
    phone: string;
    email: string;
    fulfillment: string;
    area: string;
    address: string;
    note: string;
  }) {
    const lines = cart.map((item, index) => {
      return `${index + 1}. ${item.name} - ${formatCurrency(item.price)} x ${
        item.quantity
      } = ${formatCurrency(item.price * item.quantity)}`;
    });

    return [
      `Hello ${business.name}, I want to place this suya order.`,
      "",
      `Name: ${fields.name}`,
      `Phone: ${fields.phone}`,
      `Email: ${fields.email}`,
      `Option: ${fields.fulfillment}`,
      fields.fulfillment === "Delivery" ? `Area: ${fields.area}` : "",
      fields.fulfillment === "Delivery" ? `Address: ${fields.address}` : "",
      fields.note ? `Note: ${fields.note}` : "",
      "",
      "Items:",
      ...lines,
      "",
      `Total: ${formatCurrency(cartTotal)}`,
    ]
      .filter(Boolean)
      .join("\n");
  }

  async function submitCart(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCheckoutMessage("");
    const submitter = (event.nativeEvent as SubmitEvent)
      .submitter as HTMLButtonElement | null;
    const payOnline = submitter?.value === "pay-online";

    if (!whatsapp) {
      setCheckoutMessage("Business WhatsApp number is missing.");
      return;
    }

    const form = new FormData(event.currentTarget);
    const fields = {
      name: String(form.get("name") || "").trim(),
      phone: String(form.get("phone") || "").trim(),
      email: String(form.get("email") || "").trim(),
      fulfillment: String(form.get("fulfillment") || "Delivery"),
      area: String(form.get("area") || "").trim(),
      address: String(form.get("address") || "").trim(),
      note: String(form.get("note") || "").trim(),
    };

    if (!fields.name || !fields.phone || !fields.email) {
      setCheckoutMessage("Name, phone, and email are required.");
      return;
    }

    if (fields.fulfillment === "Delivery" && !fields.address) {
      setCheckoutMessage("Delivery address is required.");
      return;
    }

    if (payOnline) {
      setCheckoutMessage(
        "Online customer payment is being prepared. Please send this order on WhatsApp for now.",
      );
      return;
    }

    try {
      const order = await createOrder({
        businessId: business.id,
        customerName: fields.name,
        customerPhone: fields.phone,
        customerAddress:
          fields.fulfillment === "Delivery" ? fields.address : "Pickup",
        customerNote: `${fields.fulfillment}${
          fields.area ? ` - ${fields.area}` : ""
        }${fields.note ? ` | ${fields.note}` : ""}`,
        items: cart.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
      } as any);

      const message = `${buildCartMessage(fields)}\n\nOrder ID: ${order?.id || ""}`;
      window.open(buildWhatsAppLink(whatsapp, message), "_blank", "noopener,noreferrer");
      setCart([]);
      setCartOpen(false);
    } catch (error) {
      setCheckoutMessage(
        error instanceof Error ? error.message : "Unable to create order.",
      );
    }
  }

  return (
    <main className="min-h-screen bg-[#fffaf0] text-[#17120a]">
      {mode === "home" ? (
        <Hero
          business={business}
          heroImage={heroImage}
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
          cartCount={cartCount}
          openCart={() => setCartOpen(true)}
          openQuote={() => setQuoteState({ type: "bulk" })}
          scrollOrQuote={scrollOrQuote}
          announcementText={announcementText}
          whatsapp={whatsapp}
        />
      ) : (
        <GrillBanner
          business={business}
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
          cartCount={cartCount}
          openCart={() => setCartOpen(true)}
          scrollOrQuote={scrollOrQuote}
        />
      )}

      {mode === "home" ? (
        <div className="relative z-10 -mt-8 rounded-t-[2rem] border-t border-[#d8d2c5] bg-[#fffaf0]">
          <Favorites products={favorites} />
          <Process
            promoVideoUrl={promoVideoUrl}
            instagramVideoUrl={instagramVideoUrl}
            openGrillHref="/suya-spot/grill"
          />
          <PartyPacks
            products={partyPacks}
            openQuote={() => setQuoteState({ type: "bulk" })}
          />
          <Grillary />
          <BulkCta openQuote={() => setQuoteState({ type: "bulk" })} />
          <DeliveryPickup business={business} />
          <Faq activeFaq={activeFaq} setActiveFaq={setActiveFaq} />
          <FinalCta business={business} whatsapp={whatsapp} />
          <Footer
            business={business}
            whatsapp={whatsapp}
            instagramUrl={instagramUrl}
            openQuote={() => setQuoteState({ type: "bulk" })}
          />
        </div>
      ) : (
        <>
          <section className="px-4 py-6 md:px-6">
            <div className="mx-auto max-w-7xl">
              <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
                <label className="flex min-h-12 items-center gap-3 rounded-2xl border border-[#e7dcc8] bg-white px-4">
                  <Search size={18} className="text-[#8b6b2a]" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search the grill"
                    className="min-w-0 flex-1 bg-transparent text-sm font-bold outline-none"
                  />
                </label>
                <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
                  {allowedCategories.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setCategory(item)}
                      className={`whitespace-nowrap rounded-full border px-4 py-2 text-xs font-black ${
                        category === item
                          ? "border-[#17120a] bg-[#17120a] text-white"
                          : "border-[#e7dcc8] bg-white text-[#17120a]"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
              <ProductGrid products={filteredItems} onAction={addToCart} />
            </div>
          </section>
          <PartyPacks
            products={partyPacks}
            openQuote={() => setQuoteState({ type: "bulk" })}
          />
          <Footer
            business={business}
            whatsapp={whatsapp}
            instagramUrl={instagramUrl}
            openQuote={() => setQuoteState({ type: "bulk" })}
          />
        </>
      )}

      <CartDrawer
        open={cartOpen}
        cart={cart}
        setCart={setCart}
        total={cartTotal}
        close={() => setCartOpen(false)}
        submitCart={submitCart}
        message={checkoutMessage}
      />
      <QuoteDialog
        state={quoteState}
        business={business}
        whatsapp={whatsapp}
        close={() => setQuoteState(null)}
      />
    </main>
  );
}

function Hero({
  business,
  heroImage,
  menuOpen,
  setMenuOpen,
  cartCount,
  openCart,
  openQuote,
  scrollOrQuote,
  announcementText,
  whatsapp,
}: {
  business: SuyaBusiness;
  heroImage: string;
  menuOpen: boolean;
  setMenuOpen: (value: boolean) => void;
  cartCount: number;
  openCart: () => void;
  openQuote: () => void;
  scrollOrQuote: (target: string) => void;
  announcementText: string;
  whatsapp: string;
}) {
  return (
    <section className="sticky top-0 min-h-screen overflow-hidden bg-[#110d09] text-white">
      <Image src={heroImage} alt={business.name} fill priority sizes="100vw" className="object-cover" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.58),rgba(0,0,0,0.42)),radial-gradient(circle_at_50%_45%,rgba(245,158,11,0.14),transparent_34%)]" />
      {announcementText ? (
        <div className="absolute inset-x-0 top-0 z-20 bg-[#111]/80 px-4 py-2 text-center text-xs font-black text-[#facc15]">
          {announcementText}
        </div>
      ) : null}
      <TopControls
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        cartCount={cartCount}
        openCart={openCart}
        scrollOrQuote={scrollOrQuote}
      />
      <div className="relative z-10 mx-auto grid min-h-screen max-w-5xl place-items-center px-4 text-center">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-[#facc15]/35 bg-black/35 px-4 py-2 text-xs font-black text-[#facc15] backdrop-blur">
            <Flame size={15} />
            {business.opening_hours || "Open from 11:00 AM daily"}
          </span>
          <h1 className="mx-auto mt-5 max-w-4xl text-[3rem] font-black leading-[0.92] tracking-[-0.07em] md:text-[6rem]">
            Hot Suya. Fresh Off The Grill.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base font-semibold leading-7 text-white/82 md:text-lg">
            From single portions to party packs, S I S Suya Spot serves fresh grilled suya for every craving.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/suya-spot/grill" className="inline-flex h-12 items-center rounded-full bg-[#facc15] px-7 text-sm font-black text-black">
              Order Now
            </Link>
            <Link href="/suya-spot/grill" className="inline-flex h-12 items-center rounded-full border border-white/35 px-7 text-sm font-black text-white">
              View Menu
            </Link>
            {whatsapp ? (
              <a href={buildWhatsAppLink(whatsapp, `Hello ${business.name}, I want to order suya.`)} target="_blank" rel="noreferrer" className="inline-flex h-12 items-center gap-2 rounded-full bg-white/10 px-7 text-sm font-black text-white backdrop-blur">
                <MessageCircle size={17} />
                WhatsApp
              </a>
            ) : null}
          </div>
        </div>
      </div>
      <button type="button" onClick={openQuote} className="absolute bottom-10 left-1/2 z-20 -translate-x-1/2 rounded-full border border-[#facc15]/40 bg-black/30 px-5 py-2 text-xs font-black text-[#facc15] backdrop-blur">
        Bulk Orders
      </button>
    </section>
  );
}

function TopControls(props: {
  menuOpen: boolean;
  setMenuOpen: (value: boolean) => void;
  cartCount: number;
  openCart: () => void;
  scrollOrQuote: (target: string) => void;
}) {
  return (
    <div className="absolute right-4 top-4 z-40 flex items-center gap-2">
      <div className="relative">
        <button type="button" onClick={() => props.setMenuOpen(!props.menuOpen)} className="inline-flex h-11 items-center gap-2 rounded-full bg-white/12 px-4 text-sm font-black text-white backdrop-blur">
          <Menu size={18} />
          Menu
        </button>
        {props.menuOpen ? (
          <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-white/15 bg-[#17120a] p-2 text-sm font-bold text-white">
            <Link className="block rounded-xl px-3 py-2 hover:bg-white/10" href="/suya-spot/grill">The Grill</Link>
            <button className="block w-full rounded-xl px-3 py-2 text-left hover:bg-white/10" onClick={() => props.scrollOrQuote("#party-packs")}>Party Packs</button>
            <Link className="block rounded-xl px-3 py-2 hover:bg-white/10" href="/suya-spot#grillary">Gallery</Link>
            <button className="block w-full rounded-xl px-3 py-2 text-left hover:bg-white/10" onClick={() => props.scrollOrQuote("bulk")}>Bulk Orders</button>
            <button className="block w-full rounded-xl px-3 py-2 text-left hover:bg-white/10" onClick={() => props.scrollOrQuote("#contact")}>Contact</button>
            <Link className="block rounded-xl px-3 py-2 hover:bg-white/10" href="/login">Login</Link>
          </div>
        ) : null}
      </div>
      <button type="button" onClick={props.openCart} className="relative grid h-11 w-11 place-items-center rounded-full bg-white/12 text-white backdrop-blur" aria-label="Open cart">
        <ShoppingCart size={19} />
        {props.cartCount ? <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#facc15] px-1 text-[10px] font-black text-black">{props.cartCount}</span> : null}
      </button>
    </div>
  );
}

function GrillBanner(props: {
  business: SuyaBusiness;
  menuOpen: boolean;
  setMenuOpen: (value: boolean) => void;
  cartCount: number;
  openCart: () => void;
  scrollOrQuote: (target: string) => void;
}) {
  return (
    <section className="relative overflow-visible bg-[#17120a] px-4 py-8 text-white md:px-6">
      <TopControls {...props} />
      <div className="mx-auto max-w-7xl pt-14">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-[#facc15]">The Grill</p>
        <h1 className="mt-3 text-4xl font-black tracking-[-0.06em]">The Grill</h1>
        <p className="mt-3 max-w-xl text-sm font-semibold text-white/70">Browse fresh suya, party packs, event trays, and yaji.</p>
      </div>
    </section>
  );
}

function Favorites({ products }: { products: SuyaProduct[] }) {
  return (
    <section className="px-4 py-10 md:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-2xl font-black tracking-[-0.04em]">Customer Favorites</h2>
          <Link href="/suya-spot/grill" className="rounded-full bg-[#17120a] px-5 py-2 text-sm font-black text-white">Explore The Grill</Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {products.slice(0, 2).map((product) => <ShowcaseCard key={product.id} product={product} large />)}
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {products.slice(2, 5).map((product) => <ShowcaseCard key={product.id} product={product} />)}
        </div>
      </div>
    </section>
  );
}

function ShowcaseCard({ product, large = false }: { product: SuyaProduct; large?: boolean }) {
  return (
    <article className="overflow-hidden rounded-[1.5rem] border border-[#e7dcc8] bg-white">
      <div className={`relative ${large ? "aspect-[16/9]" : "aspect-[4/3]"} bg-[#17120a]`}>
        <Image src={productImage(product)} alt={product.name} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
      </div>
      <div className="p-4">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#b45309]">{product.category || "Suya"}</p>
        <h3 className="mt-2 text-lg font-black">{product.name}</h3>
        {isPriced(product) ? <p className="mt-2 text-xl font-black text-[#b91c1c]">{formatCurrency(Number(product.price || 0))}</p> : <p className="mt-2 text-sm font-black text-[#b45309]">Request quote</p>}
      </div>
    </article>
  );
}

function ProductGrid({ products, onAction }: { products: SuyaProduct[]; onAction: (product: SuyaProduct) => void }) {
  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {products.map((product) => (
        <article key={product.id} className="overflow-hidden rounded-[1.35rem] border border-[#e7dcc8] bg-white">
          <div className="relative aspect-[4/3] bg-[#17120a]">
            <Image src={productImage(product)} alt={product.name} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" />
          </div>
          <div className="p-4">
            <h3 className="text-sm font-black">{product.name}</h3>
            <p className="mt-2 text-xs font-black uppercase tracking-[0.14em] text-[#8b6b2a]">{product.category || "Suya"}</p>
            {isPriced(product) ? <p className="mt-3 text-xl font-black text-[#b91c1c]">{formatCurrency(Number(product.price || 0))}</p> : null}
            <button type="button" onClick={() => onAction(product)} className="mt-4 h-11 w-full rounded-full bg-[#17120a] text-sm font-black text-white">
              {isPriced(product) ? "Add to cart" : "Request Quote"}
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}

function Process({ promoVideoUrl, instagramVideoUrl, openGrillHref }: { promoVideoUrl: string; instagramVideoUrl: string; openGrillHref: string }) {
  return (
    <section className="px-4 py-8 md:px-6">
      <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-2 md:items-center">
        <div>
          <h2 className="text-2xl font-black tracking-[-0.04em]">See How We Make It</h2>
          <p className="mt-3 max-w-md text-sm font-semibold leading-6 text-[#6f6252]">From the grill to your doorstep, see how our suya is grilled fresh for every order.</p>
          <Link href={openGrillHref} className="mt-5 inline-flex rounded-full bg-[#17120a] px-5 py-3 text-sm font-black text-white">Explore The Grill</Link>
        </div>
        <div className="relative aspect-video overflow-hidden rounded-[1.5rem] border border-[#e7dcc8] bg-[#17120a]">
          {promoVideoUrl ? <video src={promoVideoUrl} controls className="h-full w-full object-cover" /> : instagramVideoUrl ? <a href={instagramVideoUrl} target="_blank" rel="noreferrer" className="grid h-full place-items-center text-center text-white"><ImageIcon className="mx-auto mb-3 text-[#facc15]" /><span className="font-black">Open Instagram Preview</span></a> : <Image src="/suya/suya-grill.png" alt="Suya grill" fill sizes="50vw" className="object-cover" />}
        </div>
      </div>
    </section>
  );
}

function PartyPacks({ products, openQuote }: { products: SuyaProduct[]; openQuote: () => void }) {
  return (
    <section id="party-packs" className="px-4 py-8 md:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-2xl font-black tracking-[-0.04em]">Party Packs</h2>
          <button type="button" onClick={openQuote} className="rounded-full bg-[#facc15] px-5 py-2 text-sm font-black text-black">Plan Your Party Pack</button>
        </div>
        <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
          {products.map((product, index) => <ShowcaseCard key={product.id} product={product} large={index === 0} />)}
        </div>
      </div>
    </section>
  );
}

function Grillary() {
  return (
    <section id="grillary" className="px-4 py-8 md:px-6">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-2xl font-black tracking-[-0.04em]">Grillary</h2>
        <p className="mt-2 text-sm font-semibold text-[#6f6252]">Real grill moments from S I S Suya Spot.</p>
        <div className="mt-5 flex gap-4 overflow-x-auto pb-2">
          {["/suya/suya-gallery-1.png", "/suya/suya-gallery-2.png", "/suya/suya-grill.png", "/suya/suya-platter.png"].map((src) => (
            <div key={src} className="relative h-64 min-w-[75vw] overflow-hidden rounded-[1.5rem] bg-[#17120a] md:min-w-[32rem]">
              <Image src={src} alt="S I S Suya Spot grillary" fill sizes="75vw" className="object-cover" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BulkCta({ openQuote }: { openQuote: () => void }) {
  return (
    <section className="px-4 py-8 md:px-6">
      <div className="mx-auto max-w-7xl rounded-[1.5rem] bg-[#17120a] p-6 text-white md:p-8">
        <h2 className="text-2xl font-black tracking-[-0.04em]">Bulk/Event Orders</h2>
        <button type="button" onClick={openQuote} className="mt-5 rounded-full bg-[#facc15] px-5 py-3 text-sm font-black text-black">Message Us For Bulk Orders & Events</button>
      </div>
    </section>
  );
}

function DeliveryPickup({ business }: { business: SuyaBusiness }) {
  return (
    <section className="px-4 py-8 md:px-6">
      <div className="mx-auto grid max-w-7xl gap-3 md:grid-cols-3">
        {[
          { label: "Delivery available", icon: Truck },
          {
            label: `Pickup available from ${business.location || "Gwarimpa, Abuja"}`,
            icon: MapPin,
          },
          {
            label: business.opening_hours || "Open from 11:00 AM daily",
            icon: CalendarDays,
          },
        ].map(({ label, icon: Icon }) => (
          <div
            key={label}
            className="rounded-2xl border border-[#e7dcc8] bg-white p-5 font-black"
          >
            <Icon className="mb-3 text-[#b45309]" />
            {label}
          </div>
        ))}
      </div>
    </section>
  );
}

const faqs = [
  ["How do I place an order?", "Open The Grill, add items, then checkout by WhatsApp."],
  ["Do you deliver?", "Yes. Delivery is available and fees depend on your area."],
  ["Can I order party packs?", "Yes. Use the bulk/event order form."],
  ["Can I pay online?", "Online customer payment is being prepared."],
  ["How do bulk/event orders work?", "Send your details and we confirm a quote on WhatsApp."],
  ["What time do you open?", "We open from 11:00 AM daily."],
  ["Do you offer pickup?", "Yes. Pickup is available from Gwarimpa, Abuja."],
  ["Can I request an event tray?", "Yes. Event trays are handled as quote requests."],
  ["How do I contact you?", "Use the WhatsApp button or contact details below."],
];

function Faq({ activeFaq, setActiveFaq }: { activeFaq: number; setActiveFaq: (index: number) => void }) {
  return (
    <section className="px-4 py-8 md:px-6">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-center text-2xl font-black tracking-[-0.04em]">Frequently Asked Questions</h2>
        <div className="mt-5 grid gap-2">
          {faqs.map(([question, answer], index) => (
            <button key={question} type="button" onClick={() => setActiveFaq(activeFaq === index ? -1 : index)} className="rounded-2xl border border-[#e7dcc8] bg-white p-4 text-left">
              <span className="flex items-center justify-between gap-3 text-sm font-black">{question}<ChevronDown size={16} /></span>
              {activeFaq === index ? <span className="mt-3 block text-sm font-semibold text-[#6f6252]">{answer}</span> : null}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta({ business, whatsapp }: { business: SuyaBusiness; whatsapp: string }) {
  return (
    <section className="px-4 py-8 md:px-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 rounded-[1.5rem] border border-[#e7dcc8] bg-white p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-[-0.04em]">Order From The Grill</h2>
          <p className="mt-2 text-sm font-semibold text-[#6f6252]">Fresh suya, party packs, and event trays are ready when you are.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/suya-spot/grill" className="rounded-full bg-[#17120a] px-5 py-3 text-sm font-black text-white">Explore The Grill</Link>
          {whatsapp ? <a href={buildWhatsAppLink(whatsapp, `Hello ${business.name}, I want to order suya.`)} target="_blank" rel="noreferrer" className="rounded-full bg-[#25d366] px-5 py-3 text-sm font-black text-white">WhatsApp</a> : null}
        </div>
      </div>
    </section>
  );
}

function Footer({ business, whatsapp, instagramUrl, openQuote }: { business: SuyaBusiness; whatsapp: string; instagramUrl: string; openQuote: () => void }) {
  return (
    <footer id="contact" className="border-t-4 border-[#facc15] bg-[#17120a] px-4 py-8 text-white md:px-6">
      <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-3">
        <div>
          <h3 className="text-lg font-black text-[#facc15]">{business.name}</h3>
          <p className="mt-3 text-sm font-semibold text-white/70">{business.location || "Gwarimpa, Abuja"}</p>
          <p className="mt-1 text-sm font-semibold text-white/70">{business.opening_hours || "Open from 11:00 AM daily"}</p>
        </div>
        <div>
          <h3 className="font-black text-[#facc15]">Quick Links</h3>
          <div className="mt-3 grid gap-2 text-sm font-semibold text-white/75">
            <Link href="/suya-spot/grill">The Grill</Link>
            <button className="text-left" type="button" onClick={openQuote}>Party Packs</button>
            <Link href="/suya-spot#grillary">Gallery</Link>
            <button className="text-left" type="button" onClick={openQuote}>Bulk Orders</button>
            <a href="#contact">Contact</a>
          </div>
        </div>
        <div>
          <h3 className="font-black text-[#facc15]">Contact</h3>
          <div className="mt-3 grid gap-2 text-sm font-semibold text-white/75">
            {whatsapp ? <a href={buildWhatsAppLink(whatsapp, `Hello ${business.name}`)} target="_blank" rel="noreferrer">WhatsApp</a> : null}
            {instagramUrl ? <a href={instagramUrl} target="_blank" rel="noreferrer">Instagram</a> : null}
            <Link href="/">Powered by Market Villa</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function CartDrawer(props: {
  open: boolean;
  cart: CartItem[];
  setCart: (items: CartItem[]) => void;
  total: number;
  close: () => void;
  submitCart: (event: FormEvent<HTMLFormElement>, payOnline?: boolean) => void;
  message: string;
}) {
  if (!props.open) return null;

  function updateQuantity(id: string, delta: number) {
    props.setCart(
      props.cart
        .map((item) => item.id === id ? { ...item, quantity: item.quantity + delta } : item)
        .filter((item) => item.quantity > 0),
    );
  }

  return (
    <div className="fixed inset-0 z-[90] bg-black/45 p-3 backdrop-blur">
      <div className="ml-auto flex h-full max-w-lg flex-col overflow-hidden rounded-[1.5rem] bg-white">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-black">Your Cart</h2>
          <button type="button" onClick={props.close} className="grid h-10 w-10 place-items-center rounded-full bg-slate-100"><X size={18} /></button>
        </div>
        <form onSubmit={props.submitCart} className="flex flex-1 flex-col overflow-y-auto p-4">
          <div className="grid gap-3">
            {props.cart.length ? props.cart.map((item) => (
              <div key={item.id} className="rounded-2xl border p-3">
                <div className="flex justify-between gap-3">
                  <span className="font-black">{item.name}</span>
                  <span className="font-black text-[#b91c1c]">{formatCurrency(item.price * item.quantity)}</span>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <button type="button" onClick={() => updateQuantity(item.id, -1)} className="h-8 w-8 rounded-full bg-slate-100">-</button>
                  <span className="font-black">{item.quantity}</span>
                  <button type="button" onClick={() => updateQuantity(item.id, 1)} className="h-8 w-8 rounded-full bg-[#17120a] text-white">+</button>
                </div>
              </div>
            )) : <p className="rounded-2xl border p-6 text-center font-black">Your cart is empty</p>}
          </div>
          {props.cart.length ? (
            <div className="mt-4 grid gap-2">
              <input name="name" required placeholder="Name" className="h-11 rounded-xl border px-3 text-sm" />
              <input name="phone" required placeholder="Phone" className="h-11 rounded-xl border px-3 text-sm" />
              <input name="email" required type="email" placeholder="Email" className="h-11 rounded-xl border px-3 text-sm" />
              <select name="fulfillment" className="h-11 rounded-xl border px-3 text-sm">
                <option>Delivery</option>
                <option>Pickup</option>
              </select>
              <select name="area" className="h-11 rounded-xl border px-3 text-sm">
                <option>Gwarimpa</option>
                <option>Wuse</option>
                <option>Jabi</option>
                <option>Other area</option>
              </select>
              <input name="address" placeholder="Delivery address" className="h-11 rounded-xl border px-3 text-sm" />
              <textarea name="note" placeholder="Delivery or pickup note optional" className="min-h-20 rounded-xl border px-3 py-2 text-sm" />
              {props.message ? <p className="rounded-xl bg-amber-50 p-3 text-xs font-bold text-amber-800">{props.message}</p> : null}
              <p className="text-lg font-black">Total: {formatCurrency(props.total)}</p>
              <button type="submit" name="checkoutAction" value="pay-online" className="h-12 rounded-full bg-[#facc15] text-sm font-black text-black">Pay Online</button>
              <button type="submit" name="checkoutAction" value="whatsapp" className="h-12 rounded-full bg-[#17120a] text-sm font-black text-white">Send to WhatsApp</button>
            </div>
          ) : null}
        </form>
      </div>
    </div>
  );
}

function QuoteDialog({ state, business, whatsapp, close }: { state: QuoteState; business: SuyaBusiness; whatsapp: string; close: () => void }) {
  const [message, setMessage] = useState("");

  if (!state) return null;

  async function submitQuote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "").trim();
    const phone = String(form.get("phone") || "").trim();
    const productName = String(form.get("productName") || state?.product?.name || "Bulk/Event Order").trim();
    const quantity = String(form.get("quantity") || "").trim();
    const eventDate = String(form.get("eventDate") || "").trim();
    const eventLocation = String(form.get("eventLocation") || "").trim();
    const preference = String(form.get("preference") || "").trim();
    const note = String(form.get("note") || "").trim();

    if (!name || !phone) {
      setMessage("Name and phone are required.");
      return;
    }

    try {
      const order = await createOrder({
        businessId: business.id,
        customerName: name,
        customerPhone: phone,
        customerAddress: eventLocation || preference,
        customerNote: `QUOTE REQUEST | Product/package: ${productName} | Quantity/guests: ${quantity} | Event date: ${eventDate} | Preference: ${preference} | Note: ${note}`,
        items: [
          {
            id: state?.product?.id || "quote-request",
            name: productName,
            price: 0,
            quantity: 1,
          },
        ],
      } as any);

      const text = [
        `Hello ${business.name}, I want a quote.`,
        `Quote ID: ${order?.id || ""}`,
        `Name: ${name}`,
        `Phone: ${phone}`,
        `Product/package: ${productName}`,
        `Quantity/guests: ${quantity}`,
        eventDate ? `Event date: ${eventDate}` : "",
        eventLocation ? `Location: ${eventLocation}` : "",
        preference ? `Delivery/pickup: ${preference}` : "",
        note ? `Note: ${note}` : "",
      ].filter(Boolean).join("\n");

      window.open(buildWhatsAppLink(whatsapp, text), "_blank", "noopener,noreferrer");
      close();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save quote.");
    }
  }

  return (
    <div className="fixed inset-0 z-[95] grid place-items-end bg-black/45 p-3 backdrop-blur md:place-items-center">
      <form onSubmit={submitQuote} className="w-full max-w-lg rounded-[1.5rem] bg-white p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black">Request Quote</h2>
          <button type="button" onClick={close} className="grid h-10 w-10 place-items-center rounded-full bg-slate-100"><X size={18} /></button>
        </div>
        <div className="mt-4 grid gap-2">
          <input name="name" required placeholder="Name" className="h-11 rounded-xl border px-3 text-sm" />
          <input name="phone" required placeholder="Phone/WhatsApp" className="h-11 rounded-xl border px-3 text-sm" />
          <input name="productName" defaultValue={state.product?.name || "Bulk/Event Order"} placeholder="Product/package name" className="h-11 rounded-xl border px-3 text-sm" />
          <input name="quantity" placeholder="Quantity or estimated servings" className="h-11 rounded-xl border px-3 text-sm" />
          <input name="eventDate" type="date" className="h-11 rounded-xl border px-3 text-sm" />
          <input name="eventLocation" placeholder="Event location" className="h-11 rounded-xl border px-3 text-sm" />
          <select name="preference" className="h-11 rounded-xl border px-3 text-sm">
            <option>Delivery</option>
            <option>Pickup</option>
          </select>
          <textarea name="note" placeholder="Note" className="min-h-20 rounded-xl border px-3 py-2 text-sm" />
          {message ? <p className="rounded-xl bg-red-50 p-3 text-xs font-bold text-red-700">{message}</p> : null}
          <button type="submit" className="h-12 rounded-full bg-[#17120a] text-sm font-black text-white">Send Quote Request</button>
        </div>
      </form>
    </div>
  );
}
