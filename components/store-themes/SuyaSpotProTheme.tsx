"use client";

import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { FormEvent, useMemo, useState , useEffect, useRef} from "react";
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
import { initializeStoreOrderPayment } from "@/lib/payment-actions";
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
  paystack_subaccount_code?: string | null;
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
  routeBase?: string;
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
    image_url: "/suya/suya-chicken.png",
    is_featured: true,
  },
  {
    id: "suya-ram",
    name: "Ram Suya",
    category: "Ram Suya",
    price: 4000,
    image_url: "/suya/suya-closeup.png",
  },
  {
    id: "suya-yaji",
    name: "Yaji Spice",
    category: "Spices / Yaji",
    price: 1200,
    image_url: "/suya/suya-onions.png",
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
    image_url: "/suya/suya-platter.png",
  },
  {
    id: "suya-bulk-order",
    name: "Bulk Party Order",
    category: "Party Pack",
    price: 0,
    image_url: "/suya/suya-party-pack.png",
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
  tagline: "Hot Suya.\nFresh Off The Grill.",
  description: "From single portions to party packs,\nS I S Suya Spot serves fresh grilled suya for every craving.",
  cover_image_url: "/suya/suya-hero.png",
  whatsapp: "2348036882822",
  location: "Gwarimpa, Abuja",
};

function getHeroImage(business: SuyaBusiness) {
  return (
    business.theme_settings?.hero_image_url ||
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
  routeBase: inputRouteBase,
}: Props) {
  const business = { ...fallbackBusiness, ...inputBusiness };
  const whatsapp = getWhatsapp(business);
  const settings = business.theme_settings || {};
  const routeBase = inputRouteBase || (business.slug ? `/store/${business.slug}` : "/suya-spot");
  const grillHref = routeBase === "/suya-spot" ? "/suya-spot/grill" : `${routeBase}#products`;
  const galleryHref = `${routeBase}#grillary`;
  const loginHref = `${routeBase}/login`;
  const logoUrl = String(settings.logo_url || business.logo_url || "/suya/sis-suya-logo.png");
  const heroTitle = String(settings.hero_title || business.tagline || "Hot Suya.\nFresh Off The Grill.");
  const heroSubtitle = String(
    settings.hero_subtitle ||
      business.description ||
      "From single portions to party packs,\nS I S Suya Spot serves fresh grilled suya for every craving.",
  );
  const openingHours = String(settings.opening_hours || business.opening_hours || "Open from 11:00 AM daily");
  const showGallery = settings.show_gallery !== false;
  const showPartyPacks = settings.show_party_packs !== false;
  const showBulkCta = settings.show_bulk_cta !== false;
  const headingFont = String(settings.font_heading || "grill");
  const bodyFont = String(settings.font_body || "manrope");
  const themeStyle = {
    "--suya-primary": String(settings.primary_color || "#b45309"),
    "--suya-fire": String(settings.fire_color || "#f59e0b"),
    "--suya-dark": String(settings.dark_color || "#17120a"),
    "--font-store-heading":
      headingFont === "elegant"
        ? "var(--font-store-elegant)"
        : headingFont === "market"
          ? "var(--font-market)"
          : headingFont === "manrope"
            ? "var(--font-store-body)"
            : "var(--font-store-grill)",
  } as CSSProperties;
  const heroImage = getHeroImage(business);
  const announcementText = String(settings.announcement_text || settings.announcementText || "").trim();
  const instagramVideoUrl = String(settings.instagramVideoUrl || "").trim();
  const promoVideoUrl = String(settings.promoVideoUrl || "").trim();
  const instagramUrl =
    String(settings.instagramUrl || business.instagram_url || "").trim();

  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const [showSheetNav, setShowSheetNav] = useState(false);
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

    try {
      if (payOnline) {
        const payment = await initializeStoreOrderPayment({
          businessId: business.id,
          customerName: fields.name,
          customerPhone: fields.phone,
          customerEmail: fields.email,
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
        });

        window.location.href = payment.authorizationUrl;
        return;
      }

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
  useEffect(() => {
    if (mode !== "home") {
      setShowSheetNav(true);
      return;
    }

    function checkSheetPosition() {
      const sheet = sheetRef.current;
      if (!sheet) return;

      const top = sheet.getBoundingClientRect().top;
      setShowSheetNav(top <= 4);
    }

    checkSheetPosition();
    window.addEventListener("scroll", checkSheetPosition, { passive: true });
    window.addEventListener("resize", checkSheetPosition);

    return () => {
      window.removeEventListener("scroll", checkSheetPosition);
      window.removeEventListener("resize", checkSheetPosition);
    };
  }, [mode]);

  return (
    <main
      className={`min-h-screen bg-[#fffaf0] text-[#17120a] ${
        bodyFont === "market" ? "font-store-market" : "font-store-body"
      }`}
      style={themeStyle}
    >
      {mode === "home" ? (
        <Hero
          business={business}
          heroImage={heroImage}
          heroTitle={heroTitle}
          heroSubtitle={heroSubtitle}
          openingHours={openingHours}
          grillHref={grillHref}
          routeBase={routeBase}
          galleryHref={galleryHref}
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
          cartCount={cartCount}
          openCart={() => setCartOpen(true)}
          openQuote={() => setQuoteState({ type: "bulk" })}
          scrollOrQuote={scrollOrQuote}
          announcementText={announcementText}
          whatsapp={whatsapp}
          loginHref={loginHref}
        />
      ) : (
        <GrillBanner
          business={business}
          grillHeroImage={String(settings.grill_hero_image_url || "/suya/suya-grill-hero.png")}
          grillSubtitle={String(settings.grill_subtitle || "Browse fresh suya, party packs, event trays, and yaji.")}
          routeBase={routeBase}
          grillHref={grillHref}
          galleryHref={galleryHref}
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
          cartCount={cartCount}
          openCart={() => setCartOpen(true)}
          scrollOrQuote={scrollOrQuote}
          openQuote={() => setQuoteState({ type: "bulk" })}
          loginHref={loginHref}
        />
      )}

      {mode === "home" ? (
        <SheetArrivalNav
          visible={showSheetNav}
          business={business}
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
          cartCount={cartCount}
          openCart={() => setCartOpen(true)}
          openQuote={() => setQuoteState({ type: "bulk" })}
          loginHref={loginHref}
          logoUrl={logoUrl}
          logoSize={String(settings.navbar_logo_size || "medium")}
        />
      ) : null}

      {mode === "home" ? (
        <div ref={sheetRef} className="relative z-50 rounded-t-[2rem] border-t border-[#d8d2c5] bg-[#fffaf0]">
          <Favorites products={favorites} grillHref={grillHref} />
          <Process
            promoVideoUrl={promoVideoUrl}
            instagramVideoUrl={instagramVideoUrl}
            openGrillHref={grillHref}
          />
          {showPartyPacks ? <PartyPacks
            products={partyPacks}
            openQuote={() => setQuoteState({ type: "bulk" })}
          /> : null}
          {showGallery ? <Grillary /> : null}
          {showBulkCta ? <BulkCta openQuote={() => setQuoteState({ type: "bulk" })} /> : null}
          <DeliveryPickup business={business} />
          <Faq activeFaq={activeFaq} setActiveFaq={setActiveFaq} />
          <FinalCta business={business} whatsapp={whatsapp} grillHref={grillHref} />
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
                  <Search size={18} className="text-[#9a4b12]" />
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
          {showPartyPacks ? <PartyPacks
            products={partyPacks}
            openQuote={() => setQuoteState({ type: "bulk" })}
          /> : null}
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
      <style jsx global>{`
        .suya-main-nav,
        .suya-main-nav a,
        .suya-main-nav button {
          color: #ffffff !important;
        }

        .suya-main-nav a:hover,
        .suya-main-nav button:hover {
          color: #facc15 !important;
        }

        .suya-grill-hero-copy,
        .suya-grill-hero-copy *,
        .suya-grill-hero-copy p,
        .suya-grill-hero-copy h1 {
          color: #ffffff !important;
        }

        .suya-grill-hero-copy p,
        .suya-grill-hero-copy h1 {
          text-shadow: 0 3px 24px rgba(0, 0, 0, 0.85);
        }

        @keyframes suya-nav-slide-down {
          from {
            opacity: 0;
            transform: translateY(-18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .suya-scroll-nav {
          animation: suya-nav-slide-down 420ms ease-out both;
        }

        @supports (animation-timeline: view()) {
          .suya-scroll-nav {
            animation-name: suya-nav-slide-down;
            animation-duration: 1s;
            animation-fill-mode: both;
            animation-timing-function: ease-out;
            animation-timeline: view();
            animation-range: entry 0% entry 42%;
          }
        }
      `}</style>
    </main>
  );
}

function SheetArrivalNav({
  visible,
  business,
  menuOpen,
  setMenuOpen,
  cartCount,
  openCart,
  openQuote,
  routeBase,
  grillHref,
  galleryHref,
  loginHref,
  logoUrl,
  logoSize,
}: {
  visible: boolean;
  business: SuyaBusiness;
  menuOpen: boolean;
  setMenuOpen: (value: boolean) => void;
  cartCount: number;
  openCart: () => void;
  openQuote: () => void;
  routeBase: string;
  grillHref: string;
  galleryHref: string;
  loginHref: string;
  logoUrl: string;
  logoSize: string;
}) {
  const logoClass =
    logoSize === "large"
      ? "h-24 w-24 md:h-28 md:w-28"
      : logoSize === "small"
        ? "h-16 w-16 md:h-20 md:w-20"
        : "h-20 w-20 md:h-24 md:w-24";
  const logoPadding =
    logoSize === "large"
      ? "pl-24 md:pl-28"
      : logoSize === "small"
        ? "pl-16 md:pl-20"
        : "pl-20 md:pl-24";

  return (
    <div
      className={`fixed inset-x-0 top-0 z-[80] border-b border-[#8a3f0d] bg-[#b45309] px-4 py-3 shadow-[0_12px_40px_rgba(0,0,0,0.35)] transition duration-300 md:px-6 ${
        visible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"
      }`}
    >
      <Link
        href={routeBase}
        className={`absolute left-0 top-0 z-10 block overflow-visible ${logoClass}`}
        aria-label="S I S Suya Spot home"
      >
        <Image
          src={logoUrl}
          alt="S I S Suya Spot"
          width={96}
          height={96}
          className="h-full w-full object-contain"
          priority
        />
      </Link>

      <div className={`mx-auto flex max-w-7xl items-center justify-end gap-4 ${logoPadding}`}>

        <nav className="suya-main-nav hidden items-center gap-1 text-xs font-black text-white lg:flex">
          <Link href={routeBase} style={{ color: "#ffffff" }} className="rounded-full px-3 py-2 !text-white hover:bg-[#8a3f0d]">
            <span className="!text-white" style={{ color: "#ffffff" }}>Home</span>
          </Link>
          <Link href={grillHref} style={{ color: "#ffffff" }} className="rounded-full px-3 py-2 !text-white hover:bg-[#8a3f0d]">
            <span className="!text-white" style={{ color: "#ffffff" }}>The Grill</span>
          </Link>
          <Link href={galleryHref} style={{ color: "#ffffff" }} className="rounded-full px-3 py-2 !text-white hover:bg-[#8a3f0d]">
            <span className="!text-white" style={{ color: "#ffffff" }}>Gallery</span>
          </Link>
          <Link href={loginHref} style={{ color: "#ffffff" }} className="rounded-full px-3 py-2 !text-white hover:bg-[#8a3f0d]">
            <span className="!text-white" style={{ color: "#ffffff" }}>Login</span>
          </Link>
        </nav>

        <div className="flex items-center gap-2"><button
            type="button"
            onClick={openCart}
            className="relative grid h-10 w-10 place-items-center rounded-full bg-[#f59e0b] text-black"
            aria-label="Open cart"
          >
            <ShoppingCart size={18} />
            {cartCount ? (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#f59e0b] px-1 text-[10px] font-black text-black">
                {cartCount}
              </span>
            ) : null}
          </button>
        </div>
      </div>
    </div>
  );
}
function Hero({
  business,
  heroImage,
  heroTitle,
  heroSubtitle,
  openingHours,
  grillHref,
  menuOpen,
  setMenuOpen,
  cartCount,
  openCart,
  openQuote,
  scrollOrQuote,
  announcementText,
  whatsapp,
  routeBase,
  galleryHref,
  loginHref,
}: {
  business: SuyaBusiness;
  heroImage: string;
  heroTitle: string;
  heroSubtitle: string;
  openingHours: string;
  grillHref: string;
  menuOpen: boolean;
  setMenuOpen: (value: boolean) => void;
  cartCount: number;
  openCart: () => void;
  openQuote: () => void;
  scrollOrQuote: (target: string) => void;
  announcementText: string;
  whatsapp: string;
  routeBase: string;
  galleryHref: string;
  loginHref: string;
}) {
  const heroTitleLines = heroTitle.split("\n").filter(Boolean);
  const heroSubtitleLines = heroSubtitle.split("\n").filter(Boolean);

  return (
    <section className="sticky top-0 min-h-screen overflow-hidden bg-[#110d09] text-white">
      <Image src={heroImage} alt={business.name} fill priority sizes="100vw" className="object-cover" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.58),rgba(0,0,0,0.42)),radial-gradient(circle_at_50%_45%,rgba(245,158,11,0.14),transparent_34%)]" />
      {announcementText ? (
        <div className="absolute inset-x-0 top-0 z-20 bg-[#111]/80 px-4 py-2 text-center text-xs font-black text-[#f59e0b]">
          {announcementText}
        </div>
      ) : null}
      <TopControls
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        cartCount={cartCount}
        openCart={openCart}
        scrollOrQuote={scrollOrQuote}
        openQuote={openQuote}
        loginHref={loginHref}
      />
      <div className="relative z-10 grid min-h-screen max-w-5xl items-start px-5 pt-[24vh] text-left md:px-10 md:pt-[22vh] lg:ml-[4vw]">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-[#f59e0b]/35 bg-black/35 px-4 py-2 text-xs font-black text-[#f59e0b] backdrop-blur">
            <Flame size={15} />
            {openingHours}
          </span>
          <h1 className="font-store-heading mt-5 max-w-3xl text-[2.05rem] font-black leading-[1.02] tracking-[-0.055em] md:text-[4.15rem]">
            {(heroTitleLines.length ? heroTitleLines : ["Hot Suya.", "Fresh Off The Grill."]).map((line) => (
              <span key={line} className="block">{line}</span>
            ))}
          </h1>
          <p className="mt-5 max-w-2xl text-sm font-semibold leading-7 text-white/82 md:text-base">
            {(heroSubtitleLines.length ? heroSubtitleLines : ["From single portions to party packs,", "S I S Suya Spot serves fresh grilled suya for every craving."]).map((line) => (
              <span key={line} className="block">{line}</span>
            ))}
          </p>
          <div className="mt-8 flex flex-wrap justify-start gap-3">
            <Link href={grillHref} className="inline-flex h-12 items-center rounded-full bg-[#f59e0b] px-7 text-sm font-black text-black">
              Order Now
            </Link>
            <Link href={grillHref} className="inline-flex h-12 items-center rounded-full border border-white/35 px-7 text-sm font-black text-white">
              View Menu
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function TopControls(props: {
  menuOpen: boolean;
  setMenuOpen: (value: boolean) => void;
  cartCount: number;
  openCart: () => void;
  scrollOrQuote: (target: string) => void;
  openQuote: () => void;
  routeBase: string;
  grillHref: string;
  galleryHref: string;
  loginHref: string;
}) {
  return (
    <div className="absolute inset-x-0 top-0 z-40 pointer-events-none">
      <div className="pointer-events-auto absolute right-4 top-4 flex items-center gap-2">
        <div
          className="group relative"
          onMouseEnter={() => props.setMenuOpen(true)}
          onMouseLeave={() => props.setMenuOpen(false)}
        >
          <button
            type="button"
            onClick={() => props.setMenuOpen(!props.menuOpen)}
            className="inline-flex h-11 items-center gap-2 bg-transparent px-2 text-sm font-black text-white transition hover:text-[#f59e0b]"
          >
            <Menu size={18} />
            Menu
          </button>

          <div
            className={`${props.menuOpen ? "visible translate-y-0 opacity-100" : "invisible translate-y-2 opacity-0"} absolute right-0 mt-2 w-60 overflow-hidden rounded-2xl border border-[#8a3f0d] bg-[#b45309] p-2 text-sm font-bold text-white shadow-2xl transition duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100`}
          >
            <Link className="block rounded-xl px-3 py-2 text-[#fff8e1] hover:bg-[#8a3f0d] hover:text-[#facc15]" href={props.routeBase}>
              <span className="!text-white" style={{ color: "#ffffff" }}>Home</span>
            </Link>
            <Link className="block rounded-xl px-3 py-2 text-[#fff8e1] hover:bg-[#8a3f0d] hover:text-[#facc15]" href={props.grillHref}>
              <span className="!text-white" style={{ color: "#ffffff" }}>The Grill</span>
            </Link>
            <Link className="block rounded-xl px-3 py-2 text-[#fff8e1] hover:bg-[#8a3f0d] hover:text-[#facc15]" href={props.galleryHref}>
              Gallery
            </Link>
            <Link className="block rounded-xl px-3 py-2 text-[#fff8e1] hover:bg-[#8a3f0d] hover:text-[#facc15]" href={props.loginHref}>
              <span className="!text-white" style={{ color: "#ffffff" }}>Login</span>
            </Link>
          </div>
        </div>

        <button
          type="button"
          onClick={props.openCart}
          className="relative grid h-11 w-11 place-items-center bg-transparent text-white transition hover:text-[#f59e0b]"
          aria-label="Open cart"
        >
          <ShoppingCart size={19} />
          {props.cartCount ? (
            <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#f59e0b] px-1 text-[10px] font-black text-black">
              {props.cartCount}
            </span>
          ) : null}
        </button>
      </div>
    </div>
  );
}
function GrillBanner(props: {
  business: SuyaBusiness;
  grillHeroImage: string;
  grillSubtitle: string;
  menuOpen: boolean;
  setMenuOpen: (value: boolean) => void;
  cartCount: number;
  openCart: () => void;
  scrollOrQuote: (target: string) => void;
  openQuote: () => void;
  routeBase: string;
  grillHref: string;
  galleryHref: string;
  loginHref: string;
}) {
  return (
    <section className="relative overflow-hidden bg-[#17120a] px-4 py-12 text-white md:px-6 md:py-16">
      <Image
        src={props.grillHeroImage}
        alt="S I S Suya Spot grill"
        fill
        sizes="100vw"
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(23,18,10,0.92),rgba(23,18,10,0.54),rgba(23,18,10,0.36))]" />
      <TopControls {...props} />
      <div className="suya-grill-hero-copy relative z-10 mx-auto max-w-7xl pt-14">
        <p className="text-xs font-black uppercase tracking-[0.22em]" style={{ color: "#ffffff" }}>The Grill</p>
        <h1 className="font-store-heading mt-3 text-4xl font-black tracking-[-0.06em]" style={{ color: "#ffffff" }}>The Grill</h1>
        <p className="mt-3 max-w-xl text-sm font-semibold" style={{ color: "#ffffff" }}>{props.grillSubtitle}</p>
      </div>
    </section>
  );
}

function Favorites({ products, grillHref }: { products: SuyaProduct[]; grillHref: string }) {
  return (
    <section className="px-4 py-10 md:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-2xl font-black tracking-[-0.04em]">Customer Favorites</h2>
          <Link href={grillHref} className="rounded-full bg-[#17120a] px-5 py-2 text-sm font-black text-white">Explore The Grill</Link>
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
            <p className="mt-2 text-xs font-black uppercase tracking-[0.14em] text-[#9a4b12]">{product.category || "Suya"}</p>
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
          {promoVideoUrl ? <video src={promoVideoUrl} controls className="h-full w-full object-cover" /> : instagramVideoUrl ? <a href={instagramVideoUrl} target="_blank" rel="noreferrer" className="grid h-full place-items-center text-center text-white"><ImageIcon className="mx-auto mb-3 text-[#f59e0b]" /><span className="font-black">Open Instagram Preview</span></a> : <Image src="/suya/suya-grill.png" alt="Suya grill" fill sizes="50vw" className="object-cover" />}
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
          <button type="button" onClick={openQuote} className="rounded-full bg-[#f59e0b] px-5 py-2 text-sm font-black text-black">Plan Your Party Pack</button>
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
          {[
            "/suya/suya-gallery-1.png",
            "/suya/suya-gallery-2.png",
            "/suya/suya-grill.png",
            "/suya/suya-platter.png",
            "/suya/suya-chicken.png",
            "/suya/suya-onions.png",
            "/suya/suya-closeup.png",
          ].map((src) => (
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
        <button type="button" onClick={openQuote} className="mt-5 rounded-full bg-[#f59e0b] px-5 py-3 text-sm font-black text-black">Message Us For Bulk Orders & Events</button>
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
  ["Can I pay online?", "Yes. Online payment opens Paystack when the store has settlement connected."],
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

function FinalCta({ business, whatsapp, grillHref }: { business: SuyaBusiness; whatsapp: string; grillHref: string }) {
  return (
    <section className="px-4 py-8 md:px-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 rounded-[1.5rem] border border-[#e7dcc8] bg-white p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-[-0.04em]">Order From The Grill</h2>
          <p className="mt-2 text-sm font-semibold text-[#6f6252]">Fresh suya, party packs, and event trays are ready when you are.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={grillHref} className="rounded-full bg-[#17120a] px-5 py-3 text-sm font-black text-white">Explore The Grill</Link>
          {whatsapp ? <a href={buildWhatsAppLink(whatsapp, `Hello ${business.name}, I want to order from The Grill.`)} target="_blank" rel="noreferrer" className="rounded-full border border-[#17120a]/15 bg-white px-5 py-3 text-sm font-black text-[#17120a]">WhatsApp</a> : null}
        </div>
      </div>
    </section>
  );
}

function Footer({ business, whatsapp, instagramUrl, openQuote }: { business: SuyaBusiness; whatsapp: string; instagramUrl: string; openQuote: () => void }) {
  return (
    <footer id="contact" className="border-t-4 border-[#f59e0b] bg-[#17120a] px-4 py-8 text-white md:px-6">
      <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-3">
        <div>
          <Link href={storeHomeHref} className="text-lg font-black text-[#f59e0b]">{business.name}</Link>
          <p className="mt-3 text-sm font-semibold text-white/70">{business.location || "Gwarimpa, Abuja"}</p>
          <p className="mt-1 text-sm font-semibold text-white/70">{business.opening_hours || "Open from 11:00 AM daily"}</p>
        </div>
        <div>
          <h3 className="font-black text-[#f59e0b]">Quick Links</h3>
          <div className="mt-3 grid gap-2 text-sm font-semibold text-white/75">
            <Link href={grillHref}>The Grill</Link>
            <button className="text-left" type="button" onClick={openQuote}>Party Packs</button>
            <Link href={galleryHref}>Gallery</Link>
          </div>
        </div>
        <div>
          <h3 className="font-black text-[#f59e0b]">Contact</h3>
          <div className="mt-3 grid gap-2 text-sm font-semibold text-white/75">
            {whatsapp ? <a href={buildWhatsAppLink(whatsapp, `Hello ${business.name}, I want to order from The Grill.`)} target="_blank" rel="noreferrer" className="rounded-full border border-[#17120a]/15 bg-white px-5 py-3 text-sm font-black text-[#17120a]">WhatsApp</a> : null}
            {instagramUrl ? <a href={instagramUrl} target="_blank" rel="noreferrer">Instagram</a> : null}
            {footerText ? <span>{footerText}</span> : <Link href="/">Powered by Market Villa</Link>}
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
              <button type="submit" name="checkoutAction" value="pay-online" className="h-12 rounded-full bg-[#f59e0b] text-sm font-black text-black">Pay Online</button>
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





































