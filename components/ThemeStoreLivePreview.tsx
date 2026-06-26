"use client";

import {
  MessageCircle,
  Search,
  ShoppingBag,
  Sparkles,
  Star,
  Store,
} from "lucide-react";

type ThemeLike = {
  id: string;
  name: string;
  description?: string | null;
  bestFor?: string | null;
};

type Palette = {
  page: string;
  surface: string;
  brand: string;
  brandSoft: string;
  accent: string;
  text: string;
  muted: string;
  footer: string;
  footerText: string;
};

const products = [
  {
    name: "Signature Product",
    category: "Featured",
    price: "₦12,500",
    description: "A clean product card for best-selling items.",
  },
  {
    name: "Premium Bundle",
    category: "Bundle",
    price: "₦25,000",
    description: "Perfect for showcasing package offers.",
  },
  {
    name: "Customer Favorite",
    category: "Popular",
    price: "₦8,000",
    description: "A simple item preview for everyday sales.",
  },
];

function getPalette(themeId: string): Palette {
  const id = themeId.toLowerCase();

  if (id.includes("baby") || id.includes("pink")) {
    return {
      page: "#fff1f8",
      surface: "#fffafd",
      brand: "#3b1020",
      brandSoft: "#ffe4f1",
      accent: "#ec4899",
      text: "#3b1020",
      muted: "#885169",
      footer: "#3b1020",
      footerText: "#fff7fb",
    };
  }

  if (id.includes("neon") || id.includes("rail")) {
    return {
      page: "#050816",
      surface: "#08111f",
      brand: "#050816",
      brandSoft: "#0f1b31",
      accent: "#67e8f9",
      text: "#ecfeff",
      muted: "#a5f3fc",
      footer: "#020617",
      footerText: "#ecfeff",
    };
  }

  if (id.includes("bush-market") || id.includes("local-market")) {
    return {
      page: "#f8f1df",
      surface: "#fffaf0",
      brand: "#24160a",
      brandSoft: "#ead6a8",
      accent: "#d89a2b",
      text: "#24160a",
      muted: "#76512b",
      footer: "#24160a",
      footerText: "#fff8e8",
    };
  }

  if (id.includes("warm") || id.includes("boutique") || id.includes("food")) {
    return {
      page: "#fff7ed",
      surface: "#fffaf3",
      brand: "#431407",
      brandSoft: "#fed7aa",
      accent: "#ea580c",
      text: "#32190d",
      muted: "#7c4a2d",
      footer: "#431407",
      footerText: "#fff7ed",
    };
  }

  if (id.includes("edge") || id.includes("blue")) {
    return {
      page: "#eef6fb",
      surface: "#ffffff",
      brand: "#0f172a",
      brandSoft: "#e0f2fe",
      accent: "#0284c7",
      text: "#0f172a",
      muted: "#536275",
      footer: "#0f172a",
      footerText: "#eff6ff",
    };
  }

  if (id.includes("editorial") || id.includes("classic")) {
    return {
      page: "#f7f1e8",
      surface: "#fffaf2",
      brand: "#201711",
      brandSoft: "#f3e7d6",
      accent: "#8b5e25",
      text: "#201711",
      muted: "#6f5847",
      footer: "#201711",
      footerText: "#fffaf2",
    };
  }

  return {
    page: "#f7f1ff",
    surface: "#ffffff",
    brand: "#241436",
    brandSoft: "#efe5ff",
    accent: "#7c3aed",
    text: "#241436",
    muted: "#6f6785",
    footer: "#241436",
    footerText: "#ffffff",
  };
}

function getLayout(themeId: string) {
  const id = themeId.toLowerCase();

  if (id.includes("carousel")) return "carousel";
  if (id.includes("compact")) return "compact";
  if (id.includes("grid") || id.includes("premium")) return "grid";
  if (id.includes("edge")) return "edge";
  if (id.includes("storefront") || id.includes("pro")) return "storefront";
  return "classic";
}

export function ThemeStoreLivePreview({ theme }: { theme: ThemeLike }) {
  const palette = getPalette(theme.id);
  const layout = getLayout(theme.id);
  const isDark = palette.page === "#050816";

  return (
    <div
      className="w-full overflow-hidden"
      style={{ backgroundColor: palette.page, color: palette.text }}
    >
      <header
        className={`mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3 ${
          layout === "storefront" ? "border-b" : ""
        }`}
        style={{
          borderColor: isDark ? "rgba(255,255,255,0.12)" : palette.brandSoft,
        }}
      >
        <div className="flex items-center gap-3">
          <span
            className="grid h-11 w-11 place-items-center rounded-2xl"
            style={{
              backgroundColor: palette.brandSoft,
              color: palette.accent,
            }}
          >
            <Store size={19} />
          </span>

          <div>
            <p className="text-base font-black tracking-[-0.04em]">
              MarketVilla Store
            </p>
            <p style={{ color: palette.muted }} className="text-xs font-semibold">
              {theme.name}
            </p>
          </div>
        </div>

        <nav className="hidden items-center gap-2 text-xs font-black uppercase tracking-[0.14em] md:flex">
          {["Home", "Products", "About", "Contact"].map((item) => (
            <span
              key={item}
              className="rounded-full px-3 py-2"
              style={{
                backgroundColor: item === "Products" ? palette.brandSoft : "transparent",
                color: item === "Products" ? palette.accent : palette.text,
              }}
            >
              {item}
            </span>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <span
            className="grid h-10 w-10 place-items-center rounded-full"
            style={{
              backgroundColor: palette.surface,
              color: palette.text,
            }}
          >
            <Search size={17} />
          </span>

          <span
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-black"
            style={{
              backgroundColor: palette.accent,
              color: isDark ? "#020617" : "#ffffff",
            }}
          >
            <ShoppingBag size={16} />
            Cart
          </span>
        </div>
      </header>

      {layout === "compact" ? (
        <section className="mx-auto grid max-w-6xl gap-4 px-5 py-5 lg:grid-cols-[0.75fr_1.25fr]">
          <div
            className="rounded-[1.75rem] p-6"
            style={{ backgroundColor: palette.surface }}
          >
            <p
              className="text-xs font-black uppercase tracking-[0.2em]"
              style={{ color: palette.accent }}
            >
              WhatsApp-first commerce
            </p>

            <h1 className="mt-4 text-4xl font-black leading-[0.95] tracking-[-0.07em]">
              Simple store. Fast orders.
            </h1>

            <p className="mt-4 text-sm leading-7" style={{ color: palette.muted }}>
              A compact storefront layout for businesses that want products visible immediately.
            </p>
          </div>

          <ProductGrid palette={palette} compact />
        </section>
      ) : (
        <section
          className={`mx-auto grid max-w-6xl gap-4 px-5 py-4 ${
            layout === "edge" || layout === "storefront"
              ? "lg:grid-cols-[0.9fr_1.1fr]"
              : "lg:grid-cols-[1.05fr_0.95fr]"
          }`}
        >
          <div
            className="flex min-h-[250px] flex-col justify-center rounded-[1.6rem] p-6"
            style={{
              backgroundColor: layout === "storefront" ? palette.surface : palette.brand,
              color: layout === "storefront" ? palette.text : "#ffffff",
            }}
          >
            <p
              className="text-xs font-black uppercase tracking-[0.22em]"
              style={{ color: layout === "storefront" ? palette.accent : palette.accent }}
            >
              Premium storefront preview
            </p>

            <h1 className="mt-3 max-w-xl text-[2.35rem] font-black leading-[0.9] tracking-[-0.07em]">
              Your brand, ready to sell.
            </h1>

            <p
              className="mt-3 max-w-lg text-xs leading-6"
              style={{
                color:
                  layout === "storefront"
                    ? palette.muted
                    : "rgba(255,255,255,0.74)",
              }}
            >
              This preview uses Market Villa placeholder hero, products, cart actions and footer so the theme feels like a real store.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <span
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-black"
                style={{
                  backgroundColor: palette.accent,
                  color: isDark ? "#020617" : "#ffffff",
                }}
              >
                <ShoppingBag size={16} />
                Shop products
              </span>

              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-3 text-sm font-black">
                <MessageCircle size={16} />
                WhatsApp
              </span>
            </div>
          </div>

          <div className="relative min-h-[250px] overflow-hidden rounded-[1.6rem] bg-slate-100">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: 'url("/main-hero.png")' }}
            />

            <div className="absolute inset-0 bg-black/20" />

            <div
              className="absolute bottom-5 left-5 right-5 rounded-[1.5rem] p-4 backdrop-blur-xl"
              style={{
                backgroundColor: isDark
                  ? "rgba(8,17,31,0.76)"
                  : "rgba(255,255,255,0.82)",
                color: isDark ? palette.text : palette.text,
              }}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em]" style={{ color: palette.accent }}>
                    Featured item
                  </p>
                  <p className="mt-1 text-lg font-black">MarketVilla Hero Product</p>
                </div>

                <p className="text-xl font-black">₦15,000</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {layout !== "compact" ? (
        <section className="mx-auto max-w-6xl px-5 pb-4">
          <div className="mb-3 flex items-end justify-between gap-4">
            <div>
              <p
                className="text-xs font-black uppercase tracking-[0.18em]"
                style={{ color: palette.accent }}
              >
                Products
              </p>
              <h2 className="mt-1 text-xl font-black tracking-[-0.05em]">
                Placeholder products
              </h2>
            </div>

            <span
              className="hidden rounded-full px-4 py-2 text-xs font-black md:inline-flex"
              style={{
                backgroundColor: palette.brandSoft,
                color: palette.accent,
              }}
            >
              3 items
            </span>
          </div>

          <ProductGrid palette={palette} />
        </section>
      ) : null}

      <footer
        className="mt-0 px-5 py-5"
        style={{
          backgroundColor: palette.footer,
          color: palette.footerText,
        }}
      >
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-4">
          <div className="md:col-span-2">
            <p className="text-base font-black">MarketVilla Store</p>
            <p className="mt-2 max-w-md text-sm leading-6 opacity-70">
              Footer preview with business details, product links, contact and Market Villa badge.
            </p>
          </div>

          <div>
            <p className="text-sm font-black">Products</p>
            <div className="mt-3 grid gap-2 text-sm opacity-70">
              <span>Featured</span>
              <span>Bundles</span>
              <span>New arrivals</span>
            </div>
          </div>

          <div>
            <p className="text-sm font-black">Contact</p>
            <div className="mt-3 grid gap-2 text-sm opacity-70">
              <span>Abuja, Nigeria</span>
              <span>WhatsApp orders</span>
              <span>Powered by Market Villa</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ProductGrid({
  palette,
  compact = false,
}: {
  palette: Palette;
  compact?: boolean;
}) {
  return (
    <div className={`grid gap-4 ${compact ? "md:grid-cols-1" : "md:grid-cols-3"}`}>
      {products.map((product, index) => (
        <article
          key={product.name}
          className="overflow-hidden rounded-[1.15rem] border p-2"
          style={{
            backgroundColor: palette.surface,
            borderColor: palette.brandSoft,
            color: palette.text,
          }}
        >
          <div
            className="grid min-h-[100px] place-items-center rounded-[1rem]"
            style={{ backgroundColor: palette.brandSoft }}
          >
            <div
              className="grid h-12 w-12 place-items-center rounded-xl"
              style={{
                backgroundColor: palette.surface,
                color: palette.accent,
              }}
            >
              {index === 0 ? <Sparkles size={26} /> : index === 1 ? <ShoppingBag size={26} /> : <Star size={26} />}
            </div>
          </div>

          <div className="p-2">
            <p
              className="text-xs font-black uppercase tracking-[0.16em]"
              style={{ color: palette.accent }}
            >
              {product.category}
            </p>

            <h3 className="mt-2 text-base font-black tracking-[-0.03em]">
              {product.name}
            </h3>

            <p className="mt-1 text-xs leading-5" style={{ color: palette.muted }}>
              {product.description}
            </p>

            <div className="mt-2 flex items-center justify-between gap-3">
              <p className="text-base font-black">{product.price}</p>

              <span
                className="rounded-full px-4 py-2 text-xs font-black"
                style={{
                  backgroundColor: palette.accent,
                  color: palette.page === "#050816" ? "#020617" : "#ffffff",
                }}
              >
                Add
              </span>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
