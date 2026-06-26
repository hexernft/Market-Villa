"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Check,
  Clock,
  Copy,
  Instagram,
  MapPin,
  MessageCircle,
  Phone,
  Search,
  Share2,
  ShoppingBag,
  Store,
} from "lucide-react";
import { CartItem, WhatsAppCheckout } from "@/components/WhatsAppCheckout";
import { StoreAiAssistant } from "@/components/StoreAiAssistant";
import { StoreThemeCustomizationStyles } from "@/components/StoreThemeCustomizationStyles";
import { CustomStoreTheme } from "@/components/CustomStoreTheme";
import {
  createPropertyInquiry,
  createVehicleInquiry,
  getPublicBusinessPageBySlug,
} from "@/lib/business-actions";
import {
  getBusinessTheme,
  normalizeThemeSections,
  ThemeSectionId,
} from "@/lib/themes";
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
  item_type?: string | null;
  vehicle_status?: string | null;
  vehicle_details?: Record<string, any> | null;
  property_status?: string | null;
  property_details?: Record<string, any> | null;
};

type PublicBusiness = {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  tagline: string | null;
  description: string | null;
  logo_text: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  whatsapp: string | null;
  phone: string | null;
  email: string | null;
  location: string | null;
  instagram_url: string | null;
  opening_hours: string | null;
  theme_id: string | null;
  theme_settings?: Record<string, any> | null;
  theme_sections: string[] | null;
  business_mode?: string | null;
  is_published: boolean;
  products: PublicProduct[];
};

const fallbackCover =
  "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=1600&auto=format&fit=crop";

function trackStoreEvent({
  businessId,
  eventType,
  source,
  metadata = {},
}: {
  businessId: string;
  eventType: "store_view" | "whatsapp_click" | "copy_link" | "share_click";
  source: string;
  metadata?: Record<string, string>;
}) {
  if (!businessId) return;

  fetch("/api/stores/track", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      business_id: businessId,
      event_type: eventType,
      source,
      metadata,
    }),
  }).catch(() => {});
}

const fallbackProductImage =
  "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1200&auto=format&fit=crop";

export default function StorePage({ params }: StorePageProps) {
  const { slug } = use(params);

  const [business, setBusiness] = useState<PublicBusiness | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [query, setQuery] = useState("");
  const [copiedStoreLink, setCopiedStoreLink] = useState(false);

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
      <>
        <main className="market-villa-customized-store store-page-slim grid min-h-screen place-items-center bg-slate-100 px-5 py-10 md:py-12">
          <div className="w-full max-w-sm rounded-[1.5rem] border border-slate-200 bg-white p-6 text-center shadow-soft">
            <div className="mx-auto mb-5 grid h-10 w-12 place-items-center rounded-2xl bg-[#26143d] text-white">
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
      </>
    );
  }

  if (!business) {
    return (
      <>
        <main className="market-villa-customized-store store-page-slim grid min-h-screen place-items-center bg-slate-100 px-5 py-10 md:py-12">
          <div className="w-full max-w-sm rounded-[1.5rem] border border-slate-200 bg-white p-6 text-center shadow-soft">
            <div className="mx-auto mb-5 grid h-10 w-12 place-items-center rounded-2xl bg-red-50 text-red-700">
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
              className="mt-6 inline-flex rounded-full bg-[#26143d] px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Back to Market Villa
            </Link>
          </div>
        </main>
      </>
    );
  }

  if (!business.is_published) {
    return (
      <>
        <main className="market-villa-customized-store store-page-slim grid min-h-screen place-items-center bg-slate-100 px-5 py-10 md:py-12">
          <div className="w-full max-w-sm rounded-[1.5rem] border border-slate-200 bg-white p-6 text-center shadow-soft">
            <div className="mx-auto mb-5 grid h-10 w-12 place-items-center rounded-2xl bg-purple-50 text-purple-700">
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
              className="mt-6 inline-flex rounded-full bg-[#26143d] px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Back to Market Villa
            </Link>
          </div>
        </main>
      </>
    );
  }

  const whatsapp = business.whatsapp || business.phone || "";
  const logoUrl = business.logo_url || "";
  const coverImage = business.cover_image_url || fallbackCover;
  const activeSectionIds = normalizeThemeSections(
    business.theme_sections,
    business.theme_id || "classic-commerce",
  );
  const hasSection = (sectionId: ThemeSectionId) =>
    activeSectionIds.includes(sectionId);
  const primaryCtaHref = hasSection("products")
    ? "#products"
    : hasSection("menu")
      ? "#menu"
      : hasSection("packages")
        ? "#packages"
    : hasSection("custom-order")
      ? "#custom-order"
      : hasSection("contact")
        ? "#contact"
        : "#";

  function handleWhatsAppClick(source: string) {
    if (!business?.id) return;

    trackStoreEvent({
      businessId: business.id,
      eventType: "whatsapp_click",
      source,
      metadata: {
        slug: business.slug || "",
      },
    });
  }

  function getVehicleSpecs(product: PublicProduct) {
    const details = product.vehicle_details || {};

    return [
      details.year,
      details.make,
      details.model,
      details.trim,
      details.mileage,
      details.transmission,
      details.fuelType,
      details.dutyStatus,
    ]
      .filter(Boolean)
      .map(String);
  }

  function getVehicleStatusLabel(status?: string | null) {
    const labels: Record<string, string> = {
      available: "Available",
      reserved: "Reserved",
      sold: "Sold",
      in_transit: "In transit",
      on_request: "On request",
    };

    return labels[status || "available"] || "Available";
  }

  function buildVehicleInquiryMessage(product: PublicProduct, intent: string) {
    const details = product.vehicle_details || {};
    const businessName = business?.name || "this dealership";

    return [
      `Hello ${businessName}, I want to ${intent}.`,
      "",
      `Vehicle: ${product.name}`,
      `Price: ${formatCurrency(Number(product.price || 0))}`,
      details.year ? `Year: ${details.year}` : "",
      details.make ? `Make: ${details.make}` : "",
      details.model ? `Model: ${details.model}` : "",
      details.mileage ? `Mileage: ${details.mileage}` : "",
      details.transmission ? `Transmission: ${details.transmission}` : "",
      details.dutyStatus ? `Duty/Documents: ${details.dutyStatus}` : "",
      details.vehicleLocation ? `Location: ${details.vehicleLocation}` : "",
      "",
      "Preferred inspection date:",
      "Can you send more photos/videos?",
    ]
      .filter(Boolean)
      .join("\n");
  }

  async function recordVehicleLead({
    product,
    intent,
    inquiryType = "inspection",
  }: {
    product?: PublicProduct;
    intent: string;
    inquiryType?: "inspection" | "test_drive" | "video_request" | "price_request" | "financing";
  }) {
    if (!business?.id) return;

    const details = product?.vehicle_details || {};

    try {
      await createVehicleInquiry({
        businessId: business.id,
        productId: product?.id || "",
        vehicleName: product?.name || "General vehicle inquiry",
        customerName: "WhatsApp visitor",
        customerPhone: "Not provided",
        preferredDate: "",
        preferredLocation: String(details.vehicleLocation || business.location || ""),
        inquiryType,
        message: product
          ? buildVehicleInquiryMessage(product, intent)
          : `Hello ${business.name}, I want to ${intent}.`,
      });
    } catch (error) {
      console.warn("Unable to record vehicle lead", error);
    }
  }

  function getPropertySpecs(product: PublicProduct) {
    const details = product.property_details || {};

    return [
      details.propertyType,
      details.bedrooms ? `${details.bedrooms} bed` : "",
      details.bathrooms ? `${details.bathrooms} bath` : "",
      details.toilets ? `${details.toilets} toilet` : "",
      details.parking ? `${details.parking} parking` : "",
      details.furnishedStatus,
      details.propertyLocation,
      details.pricePeriod,
    ]
      .filter(Boolean)
      .map(String);
  }

  function getPropertyStatusLabel(status?: string | null) {
    const labels: Record<string, string> = {
      available: "Available",
      reserved: "Reserved",
      rented: "Rented",
      sold: "Sold",
      unavailable: "Unavailable",
    };

    return labels[status || "available"] || "Available";
  }

  function buildPropertyInquiryMessage(product: PublicProduct, intent: string) {
    const details = product.property_details || {};
    const businessName = business?.name || "this property business";

    return [
      `Hello ${businessName}, I want to ${intent}.`,
      "",
      `Listing: ${product.name}`,
      `Price: ${formatCurrency(Number(product.price || 0))}`,
      details.propertyType ? `Type: ${details.propertyType}` : "",
      details.bedrooms ? `Bedrooms: ${details.bedrooms}` : "",
      details.bathrooms ? `Bathrooms: ${details.bathrooms}` : "",
      details.propertyLocation ? `Location: ${details.propertyLocation}` : "",
      details.pricePeriod ? `Price period: ${details.pricePeriod}` : "",
      details.inspectionFee ? `Inspection fee: ${details.inspectionFee}` : "",
      details.titleDocument ? `Title/Document: ${details.titleDocument}` : "",
      "",
      "Preferred inspection date:",
      "Can you confirm availability?",
    ]
      .filter(Boolean)
      .join("\n");
  }

  async function recordPropertyLead({
    product,
    intent,
    inquiryType = "inspection",
  }: {
    product?: PublicProduct;
    intent: string;
    inquiryType?: "inspection" | "availability" | "price_request" | "document_request";
  }) {
    if (!business?.id) return;

    const details = product?.property_details || {};

    try {
      await createPropertyInquiry({
        businessId: business.id,
        productId: product?.id || "",
        propertyName: product?.name || "General property inquiry",
        customerName: "WhatsApp visitor",
        customerPhone: "Not provided",
        preferredDate: "",
        preferredLocation: String(details.propertyLocation || business.location || ""),
        inquiryType,
        message: product
          ? buildPropertyInquiryMessage(product, intent)
          : `Hello ${business.name}, I want to ${intent}.`,
      });
    } catch (error) {
      console.warn("Unable to record property lead", error);
    }
  }

  async function handleCopyStoreLink() {
    if (!business?.id || !business.slug) return;

    const url = `${window.location.origin}/store/${business.slug}`;

    try {
      await navigator.clipboard.writeText(url);

      trackStoreEvent({
        businessId: business.id,
        eventType: "copy_link",
        source: "store_page",
        metadata: {
          slug: business.slug,
        },
      });

      setCopiedStoreLink(true);

      window.setTimeout(() => {
        setCopiedStoreLink(false);
      }, 1400);
    } catch {
      setCopiedStoreLink(false);
    }
  }

  function handleShareStore() {
    if (!business?.id || !business.slug) return;

    const storeUrl = `${window.location.origin}/store/${business.slug}`;
    const shareText = `Check out ${business.name} on Market Villa: ${storeUrl}`;
    const shareUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

    trackStoreEvent({
      businessId: business.id,
      eventType: "share_click",
      source: "store_page_whatsapp_share",
      metadata: {
        slug: business.slug,
      },
    });

    window.open(shareUrl, "_blank", "noopener,noreferrer");
  }

  const featuredProducts = visibleProducts.filter((product) => product.is_featured);
  const runwayProducts = featuredProducts.length
    ? featuredProducts
    : visibleProducts.slice(0, 4);
  const lookbookProducts = visibleProducts.slice(0, 3);
  const monoCategories = categories.length
    ? categories.slice(0, 4)
    : ["New Arrivals", "Capsule", "Custom"];
  const foodCategories = categories.length
    ? categories.slice(0, 5)
    : ["Meals", "Small Chops", "Drinks"];
  const featuredMenuItems = featuredProducts.length
    ? featuredProducts
    : visibleProducts.slice(0, 3);
  const packageItems = visibleProducts.filter((product) => {
    const text = `${product.name} ${product.category || ""} ${
      product.description || ""
    }`.toLowerCase();

    return (
      text.includes("tray") ||
      text.includes("pack") ||
      text.includes("box") ||
      text.includes("bundle") ||
      text.includes("catering")
    );
  });
  const visiblePackageItems = packageItems.length
    ? packageItems.slice(0, 3)
    : visibleProducts.slice(0, 3);
  const beautyCategories = categories.length
    ? categories.slice(0, 5)
    : ["Skincare", "Hair", "Fragrance", "Makeup"];
  const beautyBestSellers = featuredProducts.length
    ? featuredProducts
    : visibleProducts.slice(0, 4);
  const bundleItems = visibleProducts.filter((product) => {
    const text = `${product.name} ${product.category || ""} ${
      product.description || ""
    }`.toLowerCase();

    return (
      text.includes("bundle") ||
      text.includes("set") ||
      text.includes("kit") ||
      text.includes("combo") ||
      text.includes("routine")
    );
  });
  const visibleBundleItems = bundleItems.length
    ? bundleItems.slice(0, 3)
    : visibleProducts.slice(0, 3);
  const techCategories = categories.length
    ? categories.slice(0, 5)
    : ["Phones", "Laptops", "Accessories", "Audio"];
  const techFeaturedDeals = featuredProducts.length
    ? featuredProducts
    : visibleProducts.slice(0, 4);
  const techSpecItems = visibleProducts.slice(0, 3);
  const homeCategories = categories.length
    ? categories.slice(0, 6)
    : ["Sofas", "Beds", "Dining", "Decor", "Lighting", "Kitchen"];
  const roomProducts = featuredProducts.length
    ? featuredProducts
    : visibleProducts.slice(0, 3);
  const detailProducts = visibleProducts.slice(0, 3);
  const kidsAgeGroups = categories.length
    ? categories.slice(0, 4)
    : ["Newborn", "Toddlers", "Kids", "Teens"];
  const kidsGiftPicks = featuredProducts.length
    ? featuredProducts
    : visibleProducts.slice(0, 4);
  const kidsBestSellers = featuredProducts.length
    ? featuredProducts
    : visibleProducts.slice(0, 4);
  const kidsBundleItems = visibleProducts.filter((product) => {
    const text = `${product.name} ${product.category || ""} ${
      product.description || ""
    }`.toLowerCase();

    return (
      text.includes("bundle") ||
      text.includes("set") ||
      text.includes("pack") ||
      text.includes("gift") ||
      text.includes("school")
    );
  });
  const visibleKidsBundleItems = kidsBundleItems.length
    ? kidsBundleItems.slice(0, 3)
    : visibleProducts.slice(0, 3);
  const groceryCategories = categories.length
    ? categories.slice(0, 6)
    : ["Grains", "Oil", "Spices", "Fruits", "Drinks", "Proteins"];
  const groceryFreshPicks = featuredProducts.length
    ? featuredProducts
    : visibleProducts.slice(0, 4);
  const groceryBulkItems = visibleProducts.filter((product) => {
    const text = `${product.name} ${product.category || ""} ${
      product.description || ""
    }`.toLowerCase();

    return (
      text.includes("bulk") ||
      text.includes("bag") ||
      text.includes("carton") ||
      text.includes("pack") ||
      text.includes("crate") ||
      text.includes("dozen") ||
      text.includes("wholesale")
    );
  });
  const visibleGroceryBulkItems = groceryBulkItems.length
    ? groceryBulkItems.slice(0, 3)
    : visibleProducts.slice(0, 3);
  const pharmacyCategories = categories.length
    ? categories.slice(0, 6)
    : ["Medicines", "Wellness", "Baby Care", "Skincare", "Supplements", "First Aid"];
  const pharmacyEssentials = featuredProducts.length
    ? featuredProducts
    : visibleProducts.slice(0, 4);
  const pharmacyBundleItems = visibleProducts.filter((product) => {
    const text = `${product.name} ${product.category || ""} ${
      product.description || ""
    }`.toLowerCase();

    return (
      text.includes("kit") ||
      text.includes("pack") ||
      text.includes("bundle") ||
      text.includes("set") ||
      text.includes("routine") ||
      text.includes("wellness")
    );
  });
  const visiblePharmacyBundleItems = pharmacyBundleItems.length
    ? pharmacyBundleItems.slice(0, 3)
    : visibleProducts.slice(0, 3);
  const jewelryCollections = categories.length
    ? categories.slice(0, 5)
    : ["Rings", "Necklaces", "Watches", "Perfume", "Gifts"];
  const jewelryFeaturedPieces = featuredProducts.length
    ? featuredProducts
    : visibleProducts.slice(0, 4);
  const jewelryGiftItems = visibleProducts.filter((product) => {
    const text = `${product.name} ${product.category || ""} ${
      product.description || ""
    }`.toLowerCase();

    return (
      text.includes("gift") ||
      text.includes("birthday") ||
      text.includes("anniversary") ||
      text.includes("wedding") ||
      text.includes("box") ||
      text.includes("set")
    );
  });
  const visibleJewelryGiftItems = jewelryGiftItems.length
    ? jewelryGiftItems.slice(0, 3)
    : visibleProducts.slice(0, 3);
  const eventCategories = categories.length
    ? categories.slice(0, 6)
    : ["Small Chops", "Cakes", "Trays", "Decor", "Rentals", "Drinks"];
  const eventFeaturedPackages = featuredProducts.length
    ? featuredProducts
    : visibleProducts.slice(0, 4);
  const eventPackageItems = visibleProducts.filter((product) => {
    const text = `${product.name} ${product.category || ""} ${
      product.description || ""
    }`.toLowerCase();

    return (
      text.includes("package") ||
      text.includes("tray") ||
      text.includes("event") ||
      text.includes("catering") ||
      text.includes("cake") ||
      text.includes("rental") ||
      text.includes("decor") ||
      text.includes("guest")
    );
  });
  const visibleEventPackageItems = eventPackageItems.length
    ? eventPackageItems.slice(0, 4)
    : visibleProducts.slice(0, 4);
  const eventDetailItems = visibleProducts.slice(0, 3);
  const carCategories = categories.length
    ? categories.slice(0, 6)
    : ["SUVs", "Sedans", "Trucks", "Buses", "Tokunbo", "Brand New"];
  const featuredCars = featuredProducts.length
    ? featuredProducts
    : visibleProducts.slice(0, 4);
  const specCars = visibleProducts.slice(0, 4);
  const inspectionCars = visibleProducts.slice(0, 3);

  const storeCustomizationStyles = (
    <StoreThemeCustomizationStyles settings={(business as any).theme_settings} />
  );

  const storeAiAssistant =
    (business as any).ai_assistant_enabled && (business as any).ai_assistant_status === "active" ? (
      <StoreAiAssistant businessId={business.id} businessName={business.name} />
    ) : null;

  const hasCustomThemeSettings = Boolean((business as any).theme_settings?.colorTheme);

  if (hasCustomThemeSettings) {
    return (
      <>
        <CustomStoreTheme business={business as any} />
        {storeAiAssistant}
      </>
    );
  }

  if (theme.layout === "kids-play") {
    return (
      <>
        <main className="market-villa-customized-store store-page-slim min-h-screen bg-[#fff7fb] pt-24 text-[#25112f] md:pt-28">
          <section className="px-4 py-4 md:px-5">
            <div className="mx-auto overflow-hidden rounded-[1.25rem] bg-[#2b1245] text-white shadow-[0_24px_80px_rgba(43,18,69,0.2)] md:max-w-7xl">
              <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
                <Link href="/" className="flex items-center gap-3">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt={`${business.name} logo`}
                      className="h-11 w-11 rounded-2xl bg-white object-cover"
                    />
                  ) : (
                    <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#facc15] text-sm font-bold text-[#25112f]">
                      {business.name.slice(0, 1)}
                    </span>
                  )}

                  <span>
                    <span className="block text-sm font-semibold">
                      {business.name}
                    </span>
                    <span className="block text-xs text-fuchsia-100/65">
                      {business.category || "Kids & Baby Store"}
                    </span>
                  </span>
                </Link>

                <nav className="hidden items-center gap-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-fuchsia-100/60 lg:flex">
                  {hasSection("age-groups") ? (
                    <a href="#age-groups" className="transition hover:text-white">
                      Age Groups
                    </a>
                  ) : null}
                  {hasSection("gift-picks") ? (
                    <a href="#gift-picks" className="transition hover:text-white">
                      Gift Picks
                    </a>
                  ) : null}
                  {hasSection("best-sellers") ? (
                    <a href="#best-sellers" className="transition hover:text-white">
                      Best Sellers
                    </a>
                  ) : null}
                  {hasSection("bundles") ? (
                    <a href="#bundles" className="transition hover:text-white">
                      Bundles
                    </a>
                  ) : null}
                  {hasSection("products") ? (
                    <a href="#products" className="transition hover:text-white">
                      Products
                    </a>
                  ) : null}
                </nav>

                <button
                  type="button"
                  onClick={handleShareStore}
                  className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white ring-1 ring-white/15 transition hover:bg-white hover:text-[#25112f]"
                >
                  <Share2 size={15} />
                  Share
                </button>
              </header>

              <div className="grid gap-6 p-5 md:grid-cols-[0.9fr_1.1fr] md:items-stretch md:p-7 lg:p-9">
                <div className="flex flex-col justify-between gap-8">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#fde047]">
                      Kids & Baby Store
                    </p>
                    <h1 className="mt-4 max-w-2xl text-5xl font-semibold leading-[0.95] tracking-[-0.06em] text-white drop-shadow-[0_5px_18px_rgba(0,0,0,0.85)] md:text-7xl">
                      {business.name}
                    </h1>

                    {business.tagline ? (
                      <p className="mt-5 max-w-xl text-lg leading-8 text-fuchsia-50/82">
                        {business.tagline}
                      </p>
                    ) : null}

                    <p className="mt-4 max-w-xl text-sm leading-7 text-fuchsia-50/62">
                      {business.description ||
                        "Shop baby essentials, toys, kidswear, school items, gift packs, and parent-friendly product picks."}
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <a
                      href={
                        hasSection("products")
                          ? "#products"
                          : hasSection("age-groups")
                            ? "#age-groups"
                            : hasSection("gift-picks")
                              ? "#gift-picks"
                              : primaryCtaHref
                      }
                      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#facc15] px-5 text-sm font-semibold text-[#25112f] transition hover:bg-[#fde047]"
                    >
                      <ShoppingBag size={17} />
                      Shop Kids
                    </a>

                    {whatsapp ? (
                      <a
                        href={buildWhatsAppLink(
                          whatsapp,
                          `Hello ${business.name}, I want to order kids or baby products.`
                        )}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => handleWhatsAppClick("kids_play_whatsapp_order")}
                        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-[#25112f]"
                      >
                        <MessageCircle size={17} />
                        WhatsApp
                      </a>
                    ) : null}
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-[1fr_0.55fr]">
                  <div
                    className="min-h-72 rounded-[1.25rem] bg-cover bg-center ring-1 ring-white/10 md:min-h-[28rem]"
                    style={{ backgroundImage: `url(${coverImage})` }}
                  />

                  <div className="grid gap-3">
                    <div className="rounded-[1.25rem] bg-white p-4 text-[#25112f]">
                      <p className="text-3xl font-semibold">
                        {visibleProducts.length}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">Products</p>
                    </div>
                    <div className="rounded-[1.25rem] bg-[#7c3aed] p-4 text-white">
                      <p className="text-3xl font-semibold">
                        {kidsAgeGroups.length}
                      </p>
                      <p className="mt-1 text-xs text-fuchsia-100/70">
                        Groups
                      </p>
                    </div>
                    <div className="rounded-[1.25rem] bg-[#facc15] p-4 text-[#25112f]">
                      <p className="text-3xl font-semibold">WA</p>
                      <p className="mt-1 text-xs opacity-70">Orders</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {hasSection("age-groups") ? (
            <section id="age-groups" className="px-4 py-4 md:px-5">
              <div className="mx-auto grid gap-3 md:max-w-7xl md:grid-cols-4">
                {kidsAgeGroups.map((group, index) => (
                  <a
                    key={group}
                    href={hasSection("products") ? "#products" : "#contact"}
                    className={`rounded-[1.25rem] border p-5 shadow-sm transition hover:-translate-y-0.5 ${
                      index === 0
                        ? "border-[#7c3aed] bg-[#7c3aed] text-white"
                        : "border-fuchsia-100 bg-white text-[#25112f]"
                    }`}
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-60">
                      Age Group
                    </p>
                    <h2 className="mt-3 text-lg font-semibold">{group}</h2>
                  </a>
                ))}
              </div>
            </section>
          ) : null}

          {hasSection("gift-picks") ? (
            <section id="gift-picks" className="px-4 py-4 md:px-5">
              <div className="mx-auto md:max-w-7xl">
                <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7c3aed]">
                      Gift Picks
                    </p>
                    <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">
                      Easy ideas for birthdays, showers, and school.
                    </h2>
                  </div>
                  <p className="max-w-sm text-sm leading-6 text-[#6f587d]">
                    Feature products that make fast gift decisions easier for parents and friends.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {(kidsGiftPicks.length ? kidsGiftPicks : visibleProducts)
                    .slice(0, 4)
                    .map((product) => (
                      <article
                        key={product.id}
                        className="overflow-hidden rounded-[1.25rem] bg-white shadow-sm"
                      >
                        <div
                          className="h-52 bg-cover bg-center"
                          style={{
                            backgroundImage: `url(${
                              product.image_url || fallbackProductImage
                            })`,
                          }}
                        />
                        <div className="p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7c3aed]">
                            {product.category || "Gift"}
                          </p>
                          <h3 className="mt-2 text-sm font-semibold">
                            {product.name}
                          </h3>
                          <p className="mt-2 text-sm font-bold">
                            {formatCurrency(Number(product.price || 0))}
                          </p>
                        </div>
                      </article>
                    ))}
                </div>
              </div>
            </section>
          ) : null}

          {hasSection("best-sellers") ? (
            <section id="best-sellers" className="px-4 py-4 md:px-5">
              <div className="mx-auto rounded-[1.25rem] bg-white p-5 shadow-sm md:max-w-7xl md:p-6">
                <div className="mb-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7c3aed]">
                    Best Sellers
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">
                    Parent-approved favorites.
                  </h2>
                </div>

                <div className="grid gap-3 md:grid-cols-4">
                  {(kidsBestSellers.length ? kidsBestSellers : visibleProducts)
                    .slice(0, 4)
                    .map((product) => (
                      <article
                        key={product.id}
                        className="rounded-[1rem] border border-fuchsia-100 bg-[#fff7fb] p-4"
                      >
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7c3aed]">
                          {product.category || "Favorite"}
                        </p>
                        <h3 className="mt-2 text-base font-semibold">
                          {product.name}
                        </h3>
                        <p className="mt-3 text-sm font-bold">
                          {formatCurrency(Number(product.price || 0))}
                        </p>
                      </article>
                    ))}
                </div>
              </div>
            </section>
          ) : null}

          {hasSection("bundles") ? (
            <section id="bundles" className="px-4 py-4 md:px-5">
              <div className="mx-auto rounded-[1.25rem] bg-[#25112f] p-5 text-white md:max-w-7xl md:p-6">
                <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#fde047]">
                      Bundles
                    </p>
                    <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">
                      Sets, packs, and ready-to-gift combos.
                    </h2>
                  </div>
                  <p className="max-w-sm text-sm leading-6 text-white/62">
                    Use this for baby sets, toy packs, school packs, and themed gift bundles.
                  </p>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  {visibleKidsBundleItems.map((product) => (
                    <article
                      key={product.id}
                      className="rounded-[1rem] bg-white p-4 text-[#25112f]"
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7c3aed]">
                        {product.category || "Bundle"}
                      </p>
                      <h3 className="mt-2 text-lg font-semibold">
                        {product.name}
                      </h3>
                      {product.description ? (
                        <p className="mt-2 text-sm leading-6 text-[#6f587d]">
                          {product.description}
                        </p>
                      ) : null}
                      <div className="mt-4 flex items-center justify-between gap-3">
                        <span className="text-sm font-bold">
                          {formatCurrency(Number(product.price || 0))}
                        </span>
                        <button
                          type="button"
                          onClick={() => addToCart(product)}
                          className="rounded-full bg-[#7c3aed] px-4 py-2 text-xs font-semibold text-white"
                        >
                          Add
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          ) : null}

          {hasSection("products") ? (
            <section id="products" className="px-4 py-5 md:px-5">
              <div className="mx-auto md:max-w-7xl">
                <div className="mb-5 grid gap-4 rounded-[1.25rem] bg-white p-4 shadow-sm md:grid-cols-[1fr_auto] md:items-center">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7c3aed]">
                      Products
                    </p>
                    <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em]">
                      Kids & Baby Catalogue
                    </h2>
                  </div>

                  <div className="relative md:w-80">
                    <Search
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-fuchsia-300"
                      size={17}
                    />
                    <input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Search toys, clothes, baby items"
                      className="min-h-11 w-full rounded-full border border-fuchsia-100 bg-[#fff7fb] px-11 text-sm text-[#25112f] outline-none focus:border-[#7c3aed]"
                    />
                  </div>
                </div>

                {visibleProducts.length ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {visibleProducts.map((product) => (
                      <article
                        key={product.id}
                        className="overflow-hidden rounded-[1.25rem] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-soft"
                      >
                        <div
                          className="h-52 bg-cover bg-center"
                          style={{
                            backgroundImage: `url(${
                              product.image_url || fallbackProductImage
                            })`,
                          }}
                        />
                        <div className="p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7c3aed]">
                            {product.category || "Kids"}
                          </p>
                          <h3 className="mt-2 text-base font-semibold">
                            {product.name}
                          </h3>
                          {product.description ? (
                            <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#6f587d]">
                              {product.description}
                            </p>
                          ) : null}
                          <div className="mt-4 flex items-center justify-between gap-3">
                            <span className="text-sm font-bold">
                              {formatCurrency(Number(product.price || 0))}
                            </span>
                            <button
                              type="button"
                              onClick={() => addToCart(product)}
                              className="rounded-full bg-[#7c3aed] px-4 py-2 text-xs font-semibold text-white"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-[1.25rem] bg-white p-8 text-center shadow-sm">
                    <p className="text-sm text-[#6f587d]">
                      No kids products are available right now.
                    </p>
                  </div>
                )}
              </div>
            </section>
          ) : null}

          {hasSection("contact") ? (
            <footer id="contact" className="px-4 pb-8 pt-4 md:px-5">
              <div className="mx-auto rounded-[1.25rem] bg-[#25112f] p-5 text-white shadow-sm md:max-w-7xl">
                <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
                  <div>
                    <h2 className="text-xl font-semibold">{business.name}</h2>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-white/65">
                      {business.tagline ||
                        "Contact this kids and baby store directly for sizes, gift ideas, availability, and orders."}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {whatsapp ? (
                      <a
                        href={buildWhatsAppLink(
                          whatsapp,
                          `Hello ${business.name}, I want to order kids or baby products.`
                        )}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => handleWhatsAppClick("kids_play_whatsapp_order")}
                        className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#25112f]"
                      >
                        <Phone size={16} />
                        WhatsApp
                      </a>
                    ) : null}

                    <button
                      type="button"
                      onClick={handleCopyStoreLink}
                      className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/15"
                    >
                      <Copy size={16} />
                      {copiedStoreLink ? "Copied" : "Copy link"}
                    </button>
                  </div>
                </div>
              </div>
            </footer>
          ) : null}

          {hasSection("products") || hasSection("bundles") ? (
            <WhatsAppCheckout
              businessId={business.id}
              businessName={business.name}
              whatsapp={whatsapp}
              cart={cart}
              setCart={setCart}
            />
          ) : null}
          {storeCustomizationStyles}
          {storeAiAssistant}
        </main>
      </>
    );
  }

  if (theme.layout === "grocery-fresh") {
    return (
      <>
        <main className="market-villa-customized-store store-page-slim min-h-screen bg-[#fbfff7] pt-24 text-[#102315] md:pt-28">
          <section className="px-4 py-4 md:px-5">
            <div className="mx-auto overflow-hidden rounded-[1.25rem] border border-lime-100 bg-white shadow-[0_20px_70px_rgba(16,35,21,0.1)] md:max-w-7xl">
              <header className="flex flex-wrap items-center justify-between gap-4 border-b border-lime-100 px-5 py-4">
                <Link href="/" className="flex items-center gap-3">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt={`${business.name} logo`}
                      className="h-11 w-11 rounded-2xl bg-lime-50 object-cover"
                    />
                  ) : (
                    <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#d9f99d] text-sm font-bold text-[#102315]">
                      {business.name.slice(0, 1)}
                    </span>
                  )}

                  <span>
                    <span className="block text-sm font-semibold">
                      {business.name}
                    </span>
                    <span className="block text-xs text-[#5f765d]">
                      {business.category || "Grocery Store"}
                    </span>
                  </span>
                </Link>

                <nav className="hidden items-center gap-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5f765d] lg:flex">
                  {hasSection("fresh-picks") ? (
                    <a href="#fresh-picks" className="transition hover:text-[#15803d]">
                      Fresh Picks
                    </a>
                  ) : null}
                  {hasSection("collections") ? (
                    <a href="#collections" className="transition hover:text-[#15803d]">
                      Categories
                    </a>
                  ) : null}
                  {hasSection("bulk-deals") ? (
                    <a href="#bulk-deals" className="transition hover:text-[#15803d]">
                      Bulk Deals
                    </a>
                  ) : null}
                  {hasSection("delivery") ? (
                    <a href="#delivery" className="transition hover:text-[#15803d]">
                      Delivery
                    </a>
                  ) : null}
                  {hasSection("products") ? (
                    <a href="#products" className="transition hover:text-[#15803d]">
                      Products
                    </a>
                  ) : null}
                </nav>

                <button
                  type="button"
                  onClick={handleShareStore}
                  className="inline-flex items-center gap-2 rounded-full border border-lime-200 bg-lime-50 px-4 py-2 text-xs font-semibold text-[#15803d] transition hover:bg-[#15803d] hover:text-white"
                >
                  <Share2 size={15} />
                  Share
                </button>
              </header>

              <div className="grid gap-5 p-5 md:grid-cols-[0.86fr_1.14fr] md:items-stretch md:p-7 lg:p-9">
                <div className="flex flex-col justify-between gap-7">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#15803d]">
                      Fresh Market
                    </p>
                    <h1 className="mt-4 max-w-2xl text-5xl font-semibold leading-[0.95] tracking-[-0.06em] text-white drop-shadow-[0_5px_18px_rgba(0,0,0,0.85)] md:text-7xl">
                      {business.name}
                    </h1>
                    {business.tagline ? (
                      <p className="mt-5 max-w-xl text-lg leading-8 text-[#415340]">
                        {business.tagline}
                      </p>
                    ) : null}
                    <p className="mt-4 max-w-xl text-sm leading-7 text-[#637562]">
                      {business.description ||
                        "Order groceries, foodstuff, fresh produce, drinks, household essentials, and market packs in one clean catalogue."}
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <a
                      href={
                        hasSection("products")
                          ? "#products"
                          : hasSection("fresh-picks")
                            ? "#fresh-picks"
                            : primaryCtaHref
                      }
                      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#15803d] px-5 text-sm font-semibold text-white transition hover:bg-[#166534]"
                    >
                      <ShoppingBag size={17} />
                      Shop Groceries
                    </a>
                    {whatsapp ? (
                      <a
                        href={buildWhatsAppLink(
                          whatsapp,
                          `Hello ${business.name}, I want to order groceries.`
                        )}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => handleWhatsAppClick("grocery_fresh_whatsapp_order")}
                        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-lime-200 bg-white px-5 text-sm font-semibold text-[#102315]"
                      >
                        <MessageCircle size={17} />
                        WhatsApp
                      </a>
                    ) : null}
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-[1fr_0.58fr]">
                  <div
                    className="min-h-72 rounded-[1.15rem] bg-cover bg-center md:min-h-[28rem]"
                    style={{ backgroundImage: `url(${coverImage})` }}
                  />
                  <div className="grid gap-3">
                    <div className="rounded-[1.15rem] bg-[#102315] p-4 text-white">
                      <p className="text-3xl font-semibold">{visibleProducts.length}</p>
                      <p className="mt-1 text-xs text-lime-100/70">Items</p>
                    </div>
                    <div className="rounded-[1.15rem] bg-[#d9f99d] p-4 text-[#102315]">
                      <p className="text-3xl font-semibold">{groceryCategories.length}</p>
                      <p className="mt-1 text-xs opacity-70">Categories</p>
                    </div>
                    <div className="rounded-[1.15rem] bg-lime-50 p-4 text-[#102315] ring-1 ring-lime-100">
                      <p className="text-3xl font-semibold">WA</p>
                      <p className="mt-1 text-xs text-[#637562]">Checkout</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {hasSection("fresh-picks") ? (
            <section id="fresh-picks" className="px-4 py-4 md:px-5">
              <div className="mx-auto md:max-w-7xl">
                <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#15803d]">
                      Fresh Picks
                    </p>
                    <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">
                      Daily essentials customers can grab fast.
                    </h2>
                  </div>
                  <p className="max-w-sm text-sm leading-6 text-[#637562]">
                    Feature products here for fresh arrivals, fast-moving staples,
                    or today&apos;s best market prices.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {(groceryFreshPicks.length ? groceryFreshPicks : visibleProducts)
                    .slice(0, 4)
                    .map((product) => (
                      <article
                        key={product.id}
                        className="overflow-hidden rounded-[1.15rem] bg-white shadow-sm ring-1 ring-lime-100"
                      >
                        <div
                          className="h-48 bg-cover bg-center"
                          style={{
                            backgroundImage: `url(${product.image_url || fallbackProductImage})`,
                          }}
                        />
                        <div className="p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#15803d]">
                            {product.category || "Fresh"}
                          </p>
                          <h3 className="mt-2 text-sm font-semibold">{product.name}</h3>
                          <p className="mt-2 text-sm font-bold">
                            {formatCurrency(Number(product.price || 0))}
                          </p>
                        </div>
                      </article>
                    ))}
                </div>
              </div>
            </section>
          ) : null}

          {hasSection("collections") ? (
            <section id="collections" className="px-4 py-4 md:px-5">
              <div className="mx-auto grid gap-3 md:max-w-7xl md:grid-cols-6">
                {groceryCategories.map((category, index) => (
                  <a
                    key={category}
                    href={hasSection("products") ? "#products" : "#contact"}
                    className={`rounded-[1rem] border p-4 shadow-sm transition hover:-translate-y-0.5 ${
                      index === 0
                        ? "border-[#15803d] bg-[#15803d] text-white"
                        : "border-lime-100 bg-white text-[#102315]"
                    }`}
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-60">
                      Category
                    </p>
                    <h2 className="mt-2 text-sm font-semibold">{category}</h2>
                  </a>
                ))}
              </div>
            </section>
          ) : null}

          {hasSection("bulk-deals") ? (
            <section id="bulk-deals" className="px-4 py-4 md:px-5">
              <div className="mx-auto rounded-[1.25rem] bg-[#102315] p-5 text-white shadow-sm md:max-w-7xl md:p-6">
                <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#bef264]">
                      Bulk Deals
                    </p>
                    <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">
                      Packs, bags, cartons, and market bundles.
                    </h2>
                  </div>
                  <p className="max-w-sm text-sm leading-6 text-lime-50/65">
                    Use this section for wholesale-friendly items, party shopping,
                    family packs, or weekly restock deals.
                  </p>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  {visibleGroceryBulkItems.map((product) => (
                    <article
                      key={product.id}
                      className="rounded-[1rem] bg-white p-4 text-[#102315]"
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#15803d]">
                        {product.category || "Market Pack"}
                      </p>
                      <h3 className="mt-2 text-lg font-semibold">{product.name}</h3>
                      {product.description ? (
                        <p className="mt-2 text-sm leading-6 text-[#637562]">
                          {product.description}
                        </p>
                      ) : null}
                      <div className="mt-4 flex items-center justify-between gap-3">
                        <span className="text-sm font-bold">
                          {formatCurrency(Number(product.price || 0))}
                        </span>
                        <button
                          type="button"
                          onClick={() => addToCart(product)}
                          className="rounded-full bg-[#15803d] px-4 py-2 text-xs font-semibold text-white"
                        >
                          Add
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          ) : null}

          {hasSection("delivery") ? (
            <section id="delivery" className="px-4 py-4 md:px-5">
              <div className="mx-auto grid gap-3 md:max-w-7xl md:grid-cols-3">
                {[
                  ["Order Window", "Confirm availability before payment."],
                  ["Delivery", "Share your address for dispatch fee and timing."],
                  ["Pickup", "Ask for pickup location if you prefer self-collection."],
                ].map(([title, text]) => (
                  <div
                    key={title}
                    className="rounded-[1rem] border border-lime-100 bg-white p-5 shadow-sm"
                  >
                    <Check className="text-[#15803d]" size={20} />
                    <h3 className="mt-4 text-base font-semibold">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#637562]">{text}</p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {hasSection("products") ? (
            <section id="products" className="px-4 py-5 md:px-5">
              <div className="mx-auto md:max-w-7xl">
                <div className="mb-5 grid gap-4 rounded-[1.15rem] bg-white p-4 shadow-sm ring-1 ring-lime-100 md:grid-cols-[1fr_auto] md:items-center">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#15803d]">
                      Products
                    </p>
                    <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em]">
                      Grocery Catalogue
                    </h2>
                  </div>
                  <div className="relative md:w-80">
                    <Search
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-lime-500"
                      size={17}
                    />
                    <input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Search rice, oil, drinks"
                      className="min-h-11 w-full rounded-full border border-lime-100 bg-[#fbfff7] px-11 text-sm text-[#102315] outline-none focus:border-[#15803d]"
                    />
                  </div>
                </div>

                {visibleProducts.length ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {visibleProducts.map((product) => (
                      <article
                        key={product.id}
                        className="overflow-hidden rounded-[1.15rem] bg-white shadow-sm ring-1 ring-lime-100 transition hover:-translate-y-1 hover:shadow-soft"
                      >
                        <div
                          className="h-48 bg-cover bg-center"
                          style={{
                            backgroundImage: `url(${product.image_url || fallbackProductImage})`,
                          }}
                        />
                        <div className="p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#15803d]">
                            {product.category || "Grocery"}
                          </p>
                          <h3 className="mt-2 text-base font-semibold">
                            {product.name}
                          </h3>
                          {product.description ? (
                            <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#637562]">
                              {product.description}
                            </p>
                          ) : null}
                          <div className="mt-4 flex items-center justify-between gap-3">
                            <span className="text-sm font-bold">
                              {formatCurrency(Number(product.price || 0))}
                            </span>
                            <button
                              type="button"
                              onClick={() => addToCart(product)}
                              className="rounded-full bg-[#15803d] px-4 py-2 text-xs font-semibold text-white"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-[1.15rem] bg-white p-8 text-center shadow-sm ring-1 ring-lime-100">
                    <p className="text-sm text-[#637562]">
                      No grocery products are available right now.
                    </p>
                  </div>
                )}
              </div>
            </section>
          ) : null}

          {hasSection("contact") ? (
            <footer id="contact" className="px-4 pb-8 pt-4 md:px-5">
              <div className="mx-auto rounded-[1.25rem] bg-white p-5 text-[#102315] shadow-sm ring-1 ring-lime-100 md:max-w-7xl">
                <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
                  <div>
                    <h2 className="text-xl font-semibold">{business.name}</h2>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-[#637562]">
                      {business.tagline ||
                        "Contact this grocery store directly for stock, delivery, pickup, and order confirmation."}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {whatsapp ? (
                      <a
                        href={buildWhatsAppLink(
                          whatsapp,
                          `Hello ${business.name}, I want to order groceries.`
                        )}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => handleWhatsAppClick("grocery_fresh_whatsapp_order")}
                        className="inline-flex items-center gap-2 rounded-full bg-[#15803d] px-4 py-2 text-sm font-semibold text-white"
                      >
                        <Phone size={16} />
                        WhatsApp
                      </a>
                    ) : null}

                    <button
                      type="button"
                      onClick={handleCopyStoreLink}
                      className="inline-flex items-center gap-2 rounded-full border border-lime-200 bg-lime-50 px-4 py-2 text-sm font-semibold text-[#15803d]"
                    >
                      <Copy size={16} />
                      {copiedStoreLink ? "Copied" : "Copy link"}
                    </button>
                  </div>
                </div>
              </div>
            </footer>
          ) : null}

          {hasSection("products") || hasSection("bulk-deals") ? (
            <WhatsAppCheckout
              businessId={business.id}
              businessName={business.name}
              whatsapp={whatsapp}
              cart={cart}
              setCart={setCart}
            />
          ) : null}
          {storeCustomizationStyles}
          {storeAiAssistant}
        </main>
      </>
    );
  }

  if (theme.layout === "pharmacy-care") {
    return (
      <>
        <main className="market-villa-customized-store store-page-slim min-h-screen bg-[#f7ffff] pt-24 text-[#0f2530] md:pt-28">
          <section className="px-4 py-4 md:px-5">
            <div className="mx-auto overflow-hidden rounded-[1.25rem] border border-cyan-100 bg-white shadow-[0_20px_70px_rgba(15,37,48,0.1)] md:max-w-7xl">
              <header className="flex flex-wrap items-center justify-between gap-4 border-b border-cyan-100 px-5 py-4">
                <Link href="/" className="flex items-center gap-3">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt={`${business.name} logo`}
                      className="h-11 w-11 rounded-2xl bg-cyan-50 object-cover"
                    />
                  ) : (
                    <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#ccfbf1] text-sm font-bold text-[#0f2530]">
                      {business.name.slice(0, 1)}
                    </span>
                  )}

                  <span>
                    <span className="block text-sm font-semibold">
                      {business.name}
                    </span>
                    <span className="block text-xs text-[#58727a]">
                      {business.category || "Pharmacy & Wellness"}
                    </span>
                  </span>
                </Link>

                <nav className="hidden items-center gap-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#58727a] lg:flex">
                  {hasSection("health-categories") ? (
                    <a href="#health-categories" className="transition hover:text-[#0f766e]">
                      Categories
                    </a>
                  ) : null}
                  {hasSection("essentials") ? (
                    <a href="#essentials" className="transition hover:text-[#0f766e]">
                      Essentials
                    </a>
                  ) : null}
                  {hasSection("restock-request") ? (
                    <a href="#restock-request" className="transition hover:text-[#0f766e]">
                      Request
                    </a>
                  ) : null}
                  {hasSection("bundles") ? (
                    <a href="#bundles" className="transition hover:text-[#0f766e]">
                      Bundles
                    </a>
                  ) : null}
                  {hasSection("products") ? (
                    <a href="#products" className="transition hover:text-[#0f766e]">
                      Products
                    </a>
                  ) : null}
                </nav>

                <button
                  type="button"
                  onClick={handleShareStore}
                  className="inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50 px-4 py-2 text-xs font-semibold text-[#0f766e] transition hover:bg-[#0f766e] hover:text-white"
                >
                  <Share2 size={15} />
                  Share
                </button>
              </header>

              <div className="grid gap-5 p-5 md:grid-cols-[0.9fr_1.1fr] md:items-stretch md:p-7 lg:p-9">
                <div className="flex flex-col justify-between gap-7">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#0f766e]">
                      Care Retail
                    </p>
                    <h1 className="mt-4 max-w-2xl text-5xl font-semibold leading-[0.95] tracking-[-0.06em] text-white drop-shadow-[0_5px_18px_rgba(0,0,0,0.85)] md:text-7xl">
                      {business.name}
                    </h1>
                    {business.tagline ? (
                      <p className="mt-5 max-w-xl text-lg leading-8 text-[#415d64]">
                        {business.tagline}
                      </p>
                    ) : null}
                    <p className="mt-4 max-w-xl text-sm leading-7 text-[#58727a]">
                      {business.description ||
                        "Shop medicines, wellness essentials, baby care, skincare, supplements, and personal care items with quick stock confirmation."}
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <a
                      href={hasSection("products") ? "#products" : primaryCtaHref}
                      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#0f766e] px-5 text-sm font-semibold text-white transition hover:bg-[#115e59]"
                    >
                      <ShoppingBag size={17} />
                      Shop Products
                    </a>
                    {whatsapp ? (
                      <a
                        href={buildWhatsAppLink(
                          whatsapp,
                          `Hello ${business.name}, I want to confirm availability for a health or wellness product.`
                        )}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => handleWhatsAppClick("pharmacy_care_consultation")}
                        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-cyan-100 bg-white px-5 text-sm font-semibold text-[#0f2530]"
                      >
                        <MessageCircle size={17} />
                        Ask on WhatsApp
                      </a>
                    ) : null}
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-[1fr_0.58fr]">
                  <div
                    className="min-h-72 rounded-[1.15rem] bg-cover bg-center md:min-h-[28rem]"
                    style={{ backgroundImage: `url(${coverImage})` }}
                  />
                  <div className="grid gap-3">
                    <div className="rounded-[1.15rem] bg-[#0f2530] p-4 text-white">
                      <p className="text-3xl font-semibold">{visibleProducts.length}</p>
                      <p className="mt-1 text-xs text-cyan-100/70">Products</p>
                    </div>
                    <div className="rounded-[1.15rem] bg-[#ccfbf1] p-4 text-[#0f2530]">
                      <p className="text-3xl font-semibold">{pharmacyCategories.length}</p>
                      <p className="mt-1 text-xs opacity-70">Care groups</p>
                    </div>
                    <div className="rounded-[1.15rem] bg-cyan-50 p-4 text-[#0f2530] ring-1 ring-cyan-100">
                      <p className="text-3xl font-semibold">WA</p>
                      <p className="mt-1 text-xs text-[#58727a]">Consultation</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {hasSection("health-categories") ? (
            <section id="health-categories" className="px-4 py-4 md:px-5">
              <div className="mx-auto grid gap-3 md:max-w-7xl md:grid-cols-6">
                {pharmacyCategories.map((category, index) => (
                  <a
                    key={category}
                    href={hasSection("products") ? "#products" : "#contact"}
                    className={`rounded-[1rem] border p-4 shadow-sm transition hover:-translate-y-0.5 ${
                      index === 0
                        ? "border-[#0f766e] bg-[#0f766e] text-white"
                        : "border-cyan-100 bg-white text-[#0f2530]"
                    }`}
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-60">
                      Category
                    </p>
                    <h2 className="mt-2 text-sm font-semibold">{category}</h2>
                  </a>
                ))}
              </div>
            </section>
          ) : null}

          {hasSection("essentials") ? (
            <section id="essentials" className="px-4 py-4 md:px-5">
              <div className="mx-auto md:max-w-7xl">
                <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#0f766e]">
                      Featured Essentials
                    </p>
                    <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">
                      Important care items customers can find quickly.
                    </h2>
                  </div>
                  <p className="max-w-sm text-sm leading-6 text-[#58727a]">
                    Highlight fast-moving products, first-aid items, baby care,
                    supplements, or seasonal wellness picks.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {(pharmacyEssentials.length ? pharmacyEssentials : visibleProducts)
                    .slice(0, 4)
                    .map((product) => (
                      <article
                        key={product.id}
                        className="overflow-hidden rounded-[1.15rem] bg-white shadow-sm ring-1 ring-cyan-100"
                      >
                        <div
                          className="h-48 bg-cover bg-center"
                          style={{
                            backgroundImage: `url(${product.image_url || fallbackProductImage})`,
                          }}
                        />
                        <div className="p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0f766e]">
                            {product.category || "Essential"}
                          </p>
                          <h3 className="mt-2 text-sm font-semibold">{product.name}</h3>
                          <p className="mt-2 text-sm font-bold">
                            {formatCurrency(Number(product.price || 0))}
                          </p>
                        </div>
                      </article>
                    ))}
                </div>
              </div>
            </section>
          ) : null}

          {hasSection("restock-request") ? (
            <section id="restock-request" className="px-4 py-4 md:px-5">
              <div className="mx-auto grid gap-4 rounded-[1.25rem] bg-[#0f2530] p-5 text-white shadow-sm md:max-w-7xl md:grid-cols-[1fr_auto] md:items-center md:p-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#5eead4]">
                    Restock Request
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">
                    Let customers ask before they buy.
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-cyan-50/65">
                    Useful for prescriptions, product availability, preferred brands,
                    special requests, and items that need confirmation.
                  </p>
                </div>
                {whatsapp ? (
                  <a
                    href={buildWhatsAppLink(
                      whatsapp,
                      `Hello ${business.name}, I want to request or confirm a product.`
                    )}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => handleWhatsAppClick("pharmacy_care_restock_request")}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-[#0f2530]"
                  >
                    <MessageCircle size={17} />
                    Request Item
                  </a>
                ) : null}
              </div>
            </section>
          ) : null}

          {hasSection("bundles") ? (
            <section id="bundles" className="px-4 py-4 md:px-5">
              <div className="mx-auto rounded-[1.25rem] bg-white p-5 shadow-sm ring-1 ring-cyan-100 md:max-w-7xl md:p-6">
                <div className="mb-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#0f766e]">
                    Wellness Bundles
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">
                    Kits, packs, routines, and care combos.
                  </h2>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  {visiblePharmacyBundleItems.map((product) => (
                    <article
                      key={product.id}
                      className="rounded-[1rem] bg-cyan-50 p-4 text-[#0f2530] ring-1 ring-cyan-100"
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0f766e]">
                        {product.category || "Care Pack"}
                      </p>
                      <h3 className="mt-2 text-lg font-semibold">{product.name}</h3>
                      {product.description ? (
                        <p className="mt-2 text-sm leading-6 text-[#58727a]">
                          {product.description}
                        </p>
                      ) : null}
                      <div className="mt-4 flex items-center justify-between gap-3">
                        <span className="text-sm font-bold">
                          {formatCurrency(Number(product.price || 0))}
                        </span>
                        <button
                          type="button"
                          onClick={() => addToCart(product)}
                          className="rounded-full bg-[#0f766e] px-4 py-2 text-xs font-semibold text-white"
                        >
                          Add
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          ) : null}

          {hasSection("availability-notes") ? (
            <section id="availability-notes" className="px-4 py-4 md:px-5">
              <div className="mx-auto grid gap-3 md:max-w-7xl md:grid-cols-3">
                {[
                  ["Stock Check", "Confirm availability, variant, or preferred brand before payment."],
                  ["Pickup & Delivery", "Ask for pickup location, delivery area, and dispatch timing."],
                  ["Care Guidance", "Use WhatsApp for product questions and usage clarification."],
                ].map(([title, text]) => (
                  <div
                    key={title}
                    className="rounded-[1rem] border border-cyan-100 bg-white p-5 shadow-sm"
                  >
                    <Check className="text-[#0f766e]" size={20} />
                    <h3 className="mt-4 text-base font-semibold">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#58727a]">{text}</p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {hasSection("products") ? (
            <section id="products" className="px-4 py-5 md:px-5">
              <div className="mx-auto md:max-w-7xl">
                <div className="mb-5 grid gap-4 rounded-[1.15rem] bg-white p-4 shadow-sm ring-1 ring-cyan-100 md:grid-cols-[1fr_auto] md:items-center">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#0f766e]">
                      Products
                    </p>
                    <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em]">
                      Pharmacy Catalogue
                    </h2>
                  </div>
                  <div className="relative md:w-80">
                    <Search
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-500"
                      size={17}
                    />
                    <input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Search medicines, care items"
                      className="min-h-11 w-full rounded-full border border-cyan-100 bg-[#f7ffff] px-11 text-sm text-[#0f2530] outline-none focus:border-[#0f766e]"
                    />
                  </div>
                </div>

                {visibleProducts.length ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {visibleProducts.map((product) => (
                      <article
                        key={product.id}
                        className="overflow-hidden rounded-[1.15rem] bg-white shadow-sm ring-1 ring-cyan-100 transition hover:-translate-y-1 hover:shadow-soft"
                      >
                        <div
                          className="h-48 bg-cover bg-center"
                          style={{
                            backgroundImage: `url(${product.image_url || fallbackProductImage})`,
                          }}
                        />
                        <div className="p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0f766e]">
                            {product.category || "Care"}
                          </p>
                          <h3 className="mt-2 text-base font-semibold">
                            {product.name}
                          </h3>
                          {product.description ? (
                            <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#58727a]">
                              {product.description}
                            </p>
                          ) : null}
                          <div className="mt-4 flex items-center justify-between gap-3">
                            <span className="text-sm font-bold">
                              {formatCurrency(Number(product.price || 0))}
                            </span>
                            <button
                              type="button"
                              onClick={() => addToCart(product)}
                              className="rounded-full bg-[#0f766e] px-4 py-2 text-xs font-semibold text-white"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-[1.15rem] bg-white p-8 text-center shadow-sm ring-1 ring-cyan-100">
                    <p className="text-sm text-[#58727a]">
                      No pharmacy products are available right now.
                    </p>
                  </div>
                )}
              </div>
            </section>
          ) : null}

          {hasSection("contact") ? (
            <footer id="contact" className="px-4 pb-8 pt-4 md:px-5">
              <div className="mx-auto rounded-[1.25rem] bg-white p-5 text-[#0f2530] shadow-sm ring-1 ring-cyan-100 md:max-w-7xl">
                <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
                  <div>
                    <h2 className="text-xl font-semibold">{business.name}</h2>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-[#58727a]">
                      {business.tagline ||
                        "Contact this pharmacy or wellness store directly for availability, delivery, pickup, and product questions."}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {whatsapp ? (
                      <a
                        href={buildWhatsAppLink(
                          whatsapp,
                          `Hello ${business.name}, I want to ask about a pharmacy or wellness product.`
                        )}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => handleWhatsAppClick("pharmacy_care_contact")}
                        className="inline-flex items-center gap-2 rounded-full bg-[#0f766e] px-4 py-2 text-sm font-semibold text-white"
                      >
                        <Phone size={16} />
                        WhatsApp
                      </a>
                    ) : null}

                    <button
                      type="button"
                      onClick={handleCopyStoreLink}
                      className="inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50 px-4 py-2 text-sm font-semibold text-[#0f766e]"
                    >
                      <Copy size={16} />
                      {copiedStoreLink ? "Copied" : "Copy link"}
                    </button>
                  </div>
                </div>
              </div>
            </footer>
          ) : null}

          {hasSection("products") || hasSection("bundles") ? (
            <WhatsAppCheckout
              businessId={business.id}
              businessName={business.name}
              whatsapp={whatsapp}
              cart={cart}
              setCart={setCart}
            />
          ) : null}
          {storeCustomizationStyles}
          {storeAiAssistant}
        </main>
      </>
    );
  }

  if (theme.layout === "jewelry-gallery") {
    return (
      <>
        <main className="market-villa-customized-store store-page-slim min-h-screen bg-[#fbf7ef] pt-24 text-[#21190f] md:pt-28">
          <section className="px-4 py-4 md:px-5">
            <div className="mx-auto overflow-hidden bg-[#21190f] text-[#fffaf0] shadow-[0_24px_80px_rgba(33,25,15,0.18)] md:max-w-7xl">
              <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
                <Link href="/" className="flex items-center gap-3">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt={`${business.name} logo`}
                      className="h-11 w-11 bg-[#fffaf0] object-cover"
                    />
                  ) : (
                    <span className="grid h-11 w-11 place-items-center bg-[#fbbf24] text-sm font-bold text-[#21190f]">
                      {business.name.slice(0, 1)}
                    </span>
                  )}

                  <span>
                    <span className="block text-sm font-semibold">
                      {business.name}
                    </span>
                    <span className="block text-xs text-amber-100/65">
                      {business.category || "Jewelry Gallery"}
                    </span>
                  </span>
                </Link>

                <nav className="hidden items-center gap-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-100/60 lg:flex">
                  {hasSection("collections") ? (
                    <a href="#collections" className="transition hover:text-white">
                      Collections
                    </a>
                  ) : null}
                  {hasSection("featured-deals") ? (
                    <a href="#featured-pieces" className="transition hover:text-white">
                      Featured
                    </a>
                  ) : null}
                  {hasSection("gift-picks") ? (
                    <a href="#gift-picks" className="transition hover:text-white">
                      Gifts
                    </a>
                  ) : null}
                  {hasSection("details") ? (
                    <a href="#details" className="transition hover:text-white">
                      Care
                    </a>
                  ) : null}
                  {hasSection("products") ? (
                    <a href="#products" className="transition hover:text-white">
                      Gallery
                    </a>
                  ) : null}
                </nav>

                <button
                  type="button"
                  onClick={handleShareStore}
                  className="inline-flex items-center gap-2 border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white hover:text-[#21190f]"
                >
                  <Share2 size={15} />
                  Share
                </button>
              </header>

              <div className="grid gap-6 p-5 md:grid-cols-[0.82fr_1.18fr] md:items-stretch md:p-8 lg:p-10">
                <div className="flex flex-col justify-between gap-8">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#fbbf24]">
                      Curated Pieces
                    </p>
                    <h1 className="mt-4 max-w-2xl text-5xl font-semibold leading-[0.95] tracking-[-0.06em] text-white drop-shadow-[0_5px_18px_rgba(0,0,0,0.85)] md:text-7xl">
                      {business.name}
                    </h1>
                    {business.tagline ? (
                      <p className="mt-5 max-w-xl text-lg leading-8 text-amber-50/82">
                        {business.tagline}
                      </p>
                    ) : null}
                    <p className="mt-4 max-w-xl text-sm leading-7 text-amber-50/62">
                      {business.description ||
                        "Browse jewelry, perfume, watches, accessories, gift pieces, and premium finds with concierge-style WhatsApp ordering."}
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <a
                      href={hasSection("products") ? "#products" : primaryCtaHref}
                      className="inline-flex min-h-12 items-center justify-center gap-2 bg-[#fbbf24] px-5 text-sm font-semibold text-[#21190f] transition hover:bg-[#fde68a]"
                    >
                      <ShoppingBag size={17} />
                      View Gallery
                    </a>
                    {whatsapp ? (
                      <a
                        href={buildWhatsAppLink(
                          whatsapp,
                          `Hello ${business.name}, I want help choosing a piece.`
                        )}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => handleWhatsAppClick("jewelry_gallery_concierge")}
                        className="inline-flex min-h-12 items-center justify-center gap-2 bg-white px-5 text-sm font-semibold text-[#21190f]"
                      >
                        <MessageCircle size={17} />
                        Concierge
                      </a>
                    ) : null}
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-[1fr_0.52fr]">
                  <div
                    className="min-h-80 bg-cover bg-center md:min-h-[30rem]"
                    style={{ backgroundImage: `url(${coverImage})` }}
                  />
                  <div className="grid gap-3">
                    {(jewelryFeaturedPieces.length
                      ? jewelryFeaturedPieces
                      : visibleProducts
                    )
                      .slice(0, 2)
                      .map((product) => (
                        <div
                          key={product.id}
                          className="min-h-36 bg-cover bg-center"
                          style={{
                            backgroundImage: `url(${product.image_url || fallbackProductImage})`,
                          }}
                        />
                      ))}
                    <div className="bg-[#fbbf24] p-4 text-[#21190f]">
                      <p className="text-3xl font-semibold">{visibleProducts.length}</p>
                      <p className="mt-1 text-xs opacity-70">Pieces</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {hasSection("collections") ? (
            <section id="collections" className="px-4 py-4 md:px-5">
              <div className="mx-auto grid gap-3 md:max-w-7xl md:grid-cols-5">
                {jewelryCollections.map((collection, index) => (
                  <a
                    key={collection}
                    href={hasSection("products") ? "#products" : "#contact"}
                    className={`border p-5 shadow-sm transition hover:-translate-y-0.5 ${
                      index === 0
                        ? "border-[#21190f] bg-[#21190f] text-[#fffaf0]"
                        : "border-amber-200 bg-[#fffaf0] text-[#21190f]"
                    }`}
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-60">
                      Collection
                    </p>
                    <h2 className="mt-3 text-sm font-semibold">{collection}</h2>
                  </a>
                ))}
              </div>
            </section>
          ) : null}

          {hasSection("featured-deals") ? (
            <section id="featured-pieces" className="px-4 py-4 md:px-5">
              <div className="mx-auto md:max-w-7xl">
                <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#a16207]">
                      Featured Pieces
                    </p>
                    <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">
                      Curated pieces worth pausing for.
                    </h2>
                  </div>
                  <p className="max-w-sm text-sm leading-6 text-[#6f5b3d]">
                    Use this section for premium drops, limited items, signature
                    pieces, or high-interest products.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {(jewelryFeaturedPieces.length
                    ? jewelryFeaturedPieces
                    : visibleProducts
                  )
                    .slice(0, 4)
                    .map((product) => (
                      <article
                        key={product.id}
                        className="overflow-hidden bg-[#fffaf0] shadow-sm ring-1 ring-amber-200"
                      >
                        <div
                          className="h-64 bg-cover bg-center"
                          style={{
                            backgroundImage: `url(${product.image_url || fallbackProductImage})`,
                          }}
                        />
                        <div className="p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a16207]">
                            {product.category || "Featured"}
                          </p>
                          <h3 className="mt-2 text-sm font-semibold">{product.name}</h3>
                          <p className="mt-2 text-sm font-bold">
                            {formatCurrency(Number(product.price || 0))}
                          </p>
                        </div>
                      </article>
                    ))}
                </div>
              </div>
            </section>
          ) : null}

          {hasSection("gift-picks") ? (
            <section id="gift-picks" className="px-4 py-4 md:px-5">
              <div className="mx-auto bg-white p-5 shadow-sm ring-1 ring-amber-100 md:max-w-7xl md:p-6">
                <div className="mb-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#a16207]">
                    Gift Picks
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">
                    Ready for birthdays, weddings, and celebrations.
                  </h2>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  {visibleJewelryGiftItems.map((product) => (
                    <article
                      key={product.id}
                      className="grid gap-4 border border-amber-100 bg-[#fbf7ef] p-4 md:grid-cols-[7rem_1fr] md:items-center"
                    >
                      <div
                        className="h-32 bg-cover bg-center md:h-28"
                        style={{
                          backgroundImage: `url(${product.image_url || fallbackProductImage})`,
                        }}
                      />
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a16207]">
                          {product.category || "Gift"}
                        </p>
                        <h3 className="mt-2 text-base font-semibold">{product.name}</h3>
                        <div className="mt-3 flex items-center justify-between gap-3">
                          <span className="text-sm font-bold">
                            {formatCurrency(Number(product.price || 0))}
                          </span>
                          <button
                            type="button"
                            onClick={() => addToCart(product)}
                            className="bg-[#21190f] px-4 py-2 text-xs font-semibold text-[#fffaf0]"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          ) : null}

          {hasSection("details") ? (
            <section id="details" className="px-4 py-4 md:px-5">
              <div className="mx-auto grid gap-3 md:max-w-7xl md:grid-cols-3">
                {[
                  ["Material", "Mention metal type, plating, stones, scent notes, size, or finish in product descriptions."],
                  ["Care", "Guide customers on storage, water contact, cleaning, and handling."],
                  ["Packaging", "Use WhatsApp to confirm gift box, wrapping, delivery, and pickup options."],
                ].map(([title, text], index) => (
                  <div
                    key={title}
                    className={`border p-5 shadow-sm ${
                      index === 1
                        ? "border-[#21190f] bg-[#21190f] text-[#fffaf0]"
                        : "border-amber-200 bg-[#fffaf0] text-[#21190f]"
                    }`}
                  >
                    <Check className={index === 1 ? "text-[#fbbf24]" : "text-[#a16207]"} size={20} />
                    <h3 className="mt-4 text-base font-semibold">{title}</h3>
                    <p className={`mt-2 text-sm leading-6 ${index === 1 ? "text-amber-50/70" : "text-[#6f5b3d]"}`}>
                      {text}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {hasSection("products") ? (
            <section id="products" className="px-4 py-5 md:px-5">
              <div className="mx-auto md:max-w-7xl">
                <div className="mb-5 grid gap-4 bg-[#fffaf0] p-4 shadow-sm ring-1 ring-amber-200 md:grid-cols-[1fr_auto] md:items-center">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#a16207]">
                      Gallery
                    </p>
                    <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em]">
                      Product Gallery
                    </h2>
                  </div>
                  <div className="relative md:w-80">
                    <Search
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-600"
                      size={17}
                    />
                    <input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Search rings, perfume, gifts"
                      className="min-h-11 w-full border border-amber-200 bg-white px-11 text-sm text-[#21190f] outline-none focus:border-[#a16207]"
                    />
                  </div>
                </div>

                {visibleProducts.length ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {visibleProducts.map((product) => (
                      <article
                        key={product.id}
                        className="overflow-hidden bg-[#fffaf0] shadow-sm ring-1 ring-amber-200 transition hover:-translate-y-1 hover:shadow-soft"
                      >
                        <div
                          className="h-64 bg-cover bg-center"
                          style={{
                            backgroundImage: `url(${product.image_url || fallbackProductImage})`,
                          }}
                        />
                        <div className="p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a16207]">
                            {product.category || "Piece"}
                          </p>
                          <h3 className="mt-2 text-base font-semibold">
                            {product.name}
                          </h3>
                          {product.description ? (
                            <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#6f5b3d]">
                              {product.description}
                            </p>
                          ) : null}
                          <div className="mt-4 flex items-center justify-between gap-3">
                            <span className="text-sm font-bold">
                              {formatCurrency(Number(product.price || 0))}
                            </span>
                            <button
                              type="button"
                              onClick={() => addToCart(product)}
                              className="bg-[#21190f] px-4 py-2 text-xs font-semibold text-[#fffaf0]"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="bg-[#fffaf0] p-8 text-center shadow-sm ring-1 ring-amber-200">
                    <p className="text-sm text-[#6f5b3d]">
                      No gallery products are available right now.
                    </p>
                  </div>
                )}
              </div>
            </section>
          ) : null}

          {hasSection("custom-order") ? (
            <section id="custom-order" className="px-4 py-4 md:px-5">
              <div className="mx-auto grid gap-4 bg-[#21190f] p-5 text-[#fffaf0] shadow-sm md:max-w-7xl md:grid-cols-[1fr_auto] md:items-center md:p-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#fbbf24]">
                    Concierge Request
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">
                    Need a size, gift idea, scent, or custom piece?
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-amber-50/65">
                    Let customers ask for recommendations, sourcing help, custom
                    requests, wrapping, or delivery details before ordering.
                  </p>
                </div>
                {whatsapp ? (
                  <a
                    href={buildWhatsAppLink(
                      whatsapp,
                      `Hello ${business.name}, I want a concierge recommendation or custom request.`
                    )}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => handleWhatsAppClick("jewelry_gallery_custom_request")}
                    className="inline-flex min-h-12 items-center justify-center gap-2 bg-[#fbbf24] px-5 text-sm font-semibold text-[#21190f]"
                  >
                    <MessageCircle size={17} />
                    Request Help
                  </a>
                ) : null}
              </div>
            </section>
          ) : null}

          {hasSection("contact") ? (
            <footer id="contact" className="px-4 pb-8 pt-4 md:px-5">
              <div className="mx-auto bg-[#fffaf0] p-5 text-[#21190f] shadow-sm ring-1 ring-amber-200 md:max-w-7xl">
                <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
                  <div>
                    <h2 className="text-xl font-semibold">{business.name}</h2>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-[#6f5b3d]">
                      {business.tagline ||
                        "Contact this gallery directly for availability, sizing, gift packaging, custom orders, and delivery."}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {whatsapp ? (
                      <a
                        href={buildWhatsAppLink(
                          whatsapp,
                          `Hello ${business.name}, I want to ask about a piece.`
                        )}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => handleWhatsAppClick("jewelry_gallery_contact")}
                        className="inline-flex items-center gap-2 bg-[#21190f] px-4 py-2 text-sm font-semibold text-[#fffaf0]"
                      >
                        <Phone size={16} />
                        WhatsApp
                      </a>
                    ) : null}

                    <button
                      type="button"
                      onClick={handleCopyStoreLink}
                      className="inline-flex items-center gap-2 border border-amber-200 bg-white px-4 py-2 text-sm font-semibold text-[#21190f]"
                    >
                      <Copy size={16} />
                      {copiedStoreLink ? "Copied" : "Copy link"}
                    </button>
                  </div>
                </div>
              </div>
            </footer>
          ) : null}

          {hasSection("products") || hasSection("custom-order") ? (
            <WhatsAppCheckout
              businessId={business.id}
              businessName={business.name}
              whatsapp={whatsapp}
              cart={cart}
              setCart={setCart}
            />
          ) : null}
          {storeCustomizationStyles}
          {storeAiAssistant}
        </main>
      </>
    );
  }

  if (theme.layout === "event-catering") {
    return (
      <>
        <main className="market-villa-customized-store store-page-slim min-h-screen bg-[#fff8f1] pt-24 text-[#2c1608] md:pt-28">
          <section className="px-4 py-4 md:px-5">
            <div className="mx-auto overflow-hidden rounded-[1.25rem] bg-[#2c1608] text-white shadow-[0_24px_80px_rgba(44,22,8,0.18)] md:max-w-7xl">
              <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
                <Link href="/" className="flex items-center gap-3">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt={`${business.name} logo`}
                      className="h-11 w-11 rounded-2xl bg-white object-cover"
                    />
                  ) : (
                    <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#fed7aa] text-sm font-bold text-[#2c1608]">
                      {business.name.slice(0, 1)}
                    </span>
                  )}

                  <span>
                    <span className="block text-sm font-semibold">
                      {business.name}
                    </span>
                    <span className="block text-xs text-orange-100/65">
                      {business.category || "Event Catering"}
                    </span>
                  </span>
                </Link>

                <nav className="hidden items-center gap-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-100/60 lg:flex">
                  {hasSection("packages") ? (
                    <a href="#packages" className="transition hover:text-white">
                      Packages
                    </a>
                  ) : null}
                  {hasSection("menu") ? (
                    <a href="#menu" className="transition hover:text-white">
                      Categories
                    </a>
                  ) : null}
                  {hasSection("featured-deals") ? (
                    <a href="#featured-packages" className="transition hover:text-white">
                      Featured
                    </a>
                  ) : null}
                  {hasSection("custom-order") ? (
                    <a href="#quote" className="transition hover:text-white">
                      Quote
                    </a>
                  ) : null}
                  {hasSection("products") ? (
                    <a href="#products" className="transition hover:text-white">
                      Gallery
                    </a>
                  ) : null}
                </nav>

                <button
                  type="button"
                  onClick={handleShareStore}
                  className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white ring-1 ring-white/15 transition hover:bg-white hover:text-[#2c1608]"
                >
                  <Share2 size={15} />
                  Share
                </button>
              </header>

              <div className="grid gap-6 p-5 md:grid-cols-[0.85fr_1.15fr] md:items-stretch md:p-7 lg:p-9">
                <div className="flex flex-col justify-between gap-8">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#fdba74]">
                      Events & Packages
                    </p>
                    <h1 className="mt-4 max-w-2xl text-5xl font-semibold leading-[0.95] tracking-[-0.06em] text-white drop-shadow-[0_5px_18px_rgba(0,0,0,0.85)] md:text-7xl">
                      {business.name}
                    </h1>
                    {business.tagline ? (
                      <p className="mt-5 max-w-xl text-lg leading-8 text-orange-50/82">
                        {business.tagline}
                      </p>
                    ) : null}
                    <p className="mt-4 max-w-xl text-sm leading-7 text-orange-50/62">
                      {business.description ||
                        "Browse catering trays, cakes, rentals, decor packages, small chops, drinks, and event-ready bundles before requesting a quote."}
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {whatsapp ? (
                      <a
                        href={buildWhatsAppLink(
                          whatsapp,
                          `Hello ${business.name}, I want a quote for an event. Date: . Guest count: . Location: .`
                        )}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => handleWhatsAppClick("event_catering_quote_request")}
                        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#fed7aa] px-5 text-sm font-semibold text-[#2c1608] transition hover:bg-[#fdba74]"
                      >
                        <MessageCircle size={17} />
                        Request Quote
                      </a>
                    ) : null}
                    <a
                      href={hasSection("products") ? "#products" : primaryCtaHref}
                      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-[#2c1608]"
                    >
                      <ShoppingBag size={17} />
                      View Packages
                    </a>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-[1fr_0.55fr]">
                  <div
                    className="min-h-72 rounded-[1.25rem] bg-cover bg-center md:min-h-[28rem]"
                    style={{ backgroundImage: `url(${coverImage})` }}
                  />
                  <div className="grid gap-3">
                    <div className="rounded-[1.25rem] bg-white p-4 text-[#2c1608]">
                      <p className="text-3xl font-semibold">{visibleProducts.length}</p>
                      <p className="mt-1 text-xs text-[#7c4b2c]">Packages</p>
                    </div>
                    <div className="rounded-[1.25rem] bg-[#fed7aa] p-4 text-[#2c1608]">
                      <p className="text-3xl font-semibold">{eventCategories.length}</p>
                      <p className="mt-1 text-xs opacity-70">Categories</p>
                    </div>
                    <div className="rounded-[1.25rem] bg-white/10 p-4 text-white ring-1 ring-white/15">
                      <p className="text-3xl font-semibold">WA</p>
                      <p className="mt-1 text-xs text-orange-100/65">Quotes</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {hasSection("packages") ? (
            <section id="packages" className="px-4 py-4 md:px-5">
              <div className="mx-auto md:max-w-7xl">
                <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#c2410c]">
                      Event Packages
                    </p>
                    <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">
                      Trays, rentals, cakes, decor, and bundles.
                    </h2>
                  </div>
                  <p className="max-w-sm text-sm leading-6 text-[#7c4b2c]">
                    Lead with package items that customers can compare before
                    asking for guest-count and date confirmation.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {visibleEventPackageItems.map((product) => (
                    <article
                      key={product.id}
                      className="overflow-hidden rounded-[1.25rem] bg-white shadow-sm ring-1 ring-orange-100"
                    >
                      <div
                        className="h-52 bg-cover bg-center"
                        style={{
                          backgroundImage: `url(${product.image_url || fallbackProductImage})`,
                        }}
                      />
                      <div className="p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#c2410c]">
                          {product.category || "Package"}
                        </p>
                        <h3 className="mt-2 text-sm font-semibold">{product.name}</h3>
                        <p className="mt-2 text-sm font-bold">
                          {formatCurrency(Number(product.price || 0))}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          ) : null}

          {hasSection("menu") ? (
            <section id="menu" className="px-4 py-4 md:px-5">
              <div className="mx-auto grid gap-3 md:max-w-7xl md:grid-cols-6">
                {eventCategories.map((category, index) => (
                  <a
                    key={category}
                    href={hasSection("products") ? "#products" : "#contact"}
                    className={`rounded-[1rem] border p-4 shadow-sm transition hover:-translate-y-0.5 ${
                      index === 0
                        ? "border-[#9a3412] bg-[#9a3412] text-white"
                        : "border-orange-100 bg-white text-[#2c1608]"
                    }`}
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-60">
                      Category
                    </p>
                    <h2 className="mt-2 text-sm font-semibold">{category}</h2>
                  </a>
                ))}
              </div>
            </section>
          ) : null}

          {hasSection("featured-deals") ? (
            <section id="featured-packages" className="px-4 py-4 md:px-5">
              <div className="mx-auto rounded-[1.25rem] bg-white p-5 shadow-sm ring-1 ring-orange-100 md:max-w-7xl md:p-6">
                <div className="mb-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#c2410c]">
                    Featured Packages
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">
                    Easy choices for common events.
                  </h2>
                </div>

                <div className="grid gap-3 md:grid-cols-4">
                  {(eventFeaturedPackages.length
                    ? eventFeaturedPackages
                    : visibleProducts
                  )
                    .slice(0, 4)
                    .map((product) => (
                      <article
                        key={product.id}
                        className="rounded-[1rem] bg-[#fff8f1] p-4 ring-1 ring-orange-100"
                      >
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#c2410c]">
                          {product.category || "Featured"}
                        </p>
                        <h3 className="mt-2 text-base font-semibold">{product.name}</h3>
                        <div className="mt-4 flex items-center justify-between gap-3">
                          <span className="text-sm font-bold">
                            {formatCurrency(Number(product.price || 0))}
                          </span>
                          <button
                            type="button"
                            onClick={() => addToCart(product)}
                            className="rounded-full bg-[#9a3412] px-4 py-2 text-xs font-semibold text-white"
                          >
                            Add
                          </button>
                        </div>
                      </article>
                    ))}
                </div>
              </div>
            </section>
          ) : null}

          {hasSection("details") ? (
            <section id="details" className="px-4 py-4 md:px-5">
              <div className="mx-auto grid gap-3 md:max-w-7xl md:grid-cols-3">
                {(eventDetailItems.length
                  ? eventDetailItems.map((product) => [
                      product.name,
                      product.description ||
                        "Add guest count, tray size, setup, or serving notes in the product description.",
                    ])
                  : [
                      ["Guest Count", "Tell customers what each package can serve."],
                      ["Setup", "Mention whether setup, stands, tables, or decor are included."],
                      ["Lead Time", "Share how early customers should book before the event date."],
                    ]
                ).map(([title, text], index) => (
                  <div
                    key={title}
                    className={`rounded-[1rem] border p-5 shadow-sm ${
                      index === 1
                        ? "border-[#2c1608] bg-[#2c1608] text-white"
                        : "border-orange-100 bg-white text-[#2c1608]"
                    }`}
                  >
                    <Check
                      className={index === 1 ? "text-[#fdba74]" : "text-[#c2410c]"}
                      size={20}
                    />
                    <h3 className="mt-4 text-base font-semibold">{title}</h3>
                    <p
                      className={`mt-2 text-sm leading-6 ${
                        index === 1 ? "text-orange-50/70" : "text-[#7c4b2c]"
                      }`}
                    >
                      {text}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {hasSection("custom-order") ? (
            <section id="quote" className="px-4 py-4 md:px-5">
              <div className="mx-auto grid gap-4 rounded-[1.25rem] bg-[#9a3412] p-5 text-white shadow-sm md:max-w-7xl md:grid-cols-[1fr_auto] md:items-center md:p-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#fed7aa]">
                    Date & Quote Request
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">
                    Collect the details every event order needs.
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-orange-50/72">
                    Ask customers for event date, guest count, delivery location,
                    setup needs, and preferred package before pricing is finalized.
                  </p>
                </div>
                {whatsapp ? (
                  <a
                    href={buildWhatsAppLink(
                      whatsapp,
                      `Hello ${business.name}, I want an event quote. Date: . Guest count: . Package: . Location: .`
                    )}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => handleWhatsAppClick("event_catering_quote_request")}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-[#2c1608]"
                  >
                    <MessageCircle size={17} />
                    Request Quote
                  </a>
                ) : null}
              </div>
            </section>
          ) : null}

          {hasSection("delivery") ? (
            <section id="delivery" className="px-4 py-4 md:px-5">
              <div className="mx-auto grid gap-3 md:max-w-7xl md:grid-cols-3">
                {[
                  ["Delivery", "Confirm dispatch fee, event location, and timing."],
                  ["Setup", "Ask whether setup, serving, stands, or decorators are included."],
                  ["Booking", "Confirm deposit, lead time, and final payment schedule."],
                ].map(([title, text]) => (
                  <div
                    key={title}
                    className="rounded-[1rem] border border-orange-100 bg-white p-5 shadow-sm"
                  >
                    <Check className="text-[#c2410c]" size={20} />
                    <h3 className="mt-4 text-base font-semibold">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#7c4b2c]">{text}</p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {hasSection("products") ? (
            <section id="products" className="px-4 py-5 md:px-5">
              <div className="mx-auto md:max-w-7xl">
                <div className="mb-5 grid gap-4 rounded-[1.15rem] bg-white p-4 shadow-sm ring-1 ring-orange-100 md:grid-cols-[1fr_auto] md:items-center">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#c2410c]">
                      Gallery
                    </p>
                    <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em]">
                      Package Gallery
                    </h2>
                  </div>
                  <div className="relative md:w-80">
                    <Search
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500"
                      size={17}
                    />
                    <input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Search trays, cakes, rentals"
                      className="min-h-11 w-full rounded-full border border-orange-100 bg-[#fff8f1] px-11 text-sm text-[#2c1608] outline-none focus:border-[#c2410c]"
                    />
                  </div>
                </div>

                {visibleProducts.length ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {visibleProducts.map((product) => (
                      <article
                        key={product.id}
                        className="overflow-hidden rounded-[1.25rem] bg-white shadow-sm ring-1 ring-orange-100 transition hover:-translate-y-1 hover:shadow-soft"
                      >
                        <div
                          className="h-52 bg-cover bg-center"
                          style={{
                            backgroundImage: `url(${product.image_url || fallbackProductImage})`,
                          }}
                        />
                        <div className="p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#c2410c]">
                            {product.category || "Event"}
                          </p>
                          <h3 className="mt-2 text-base font-semibold">
                            {product.name}
                          </h3>
                          {product.description ? (
                            <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#7c4b2c]">
                              {product.description}
                            </p>
                          ) : null}
                          <div className="mt-4 flex items-center justify-between gap-3">
                            <span className="text-sm font-bold">
                              {formatCurrency(Number(product.price || 0))}
                            </span>
                            <button
                              type="button"
                              onClick={() => addToCart(product)}
                              className="rounded-full bg-[#9a3412] px-4 py-2 text-xs font-semibold text-white"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-[1.15rem] bg-white p-8 text-center shadow-sm ring-1 ring-orange-100">
                    <p className="text-sm text-[#7c4b2c]">
                      No event packages are available right now.
                    </p>
                  </div>
                )}
              </div>
            </section>
          ) : null}

          {hasSection("contact") ? (
            <footer id="contact" className="px-4 pb-8 pt-4 md:px-5">
              <div className="mx-auto rounded-[1.25rem] bg-white p-5 text-[#2c1608] shadow-sm ring-1 ring-orange-100 md:max-w-7xl">
                <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
                  <div>
                    <h2 className="text-xl font-semibold">{business.name}</h2>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-[#7c4b2c]">
                      {business.tagline ||
                        "Contact this event vendor directly for date availability, guest count, delivery, setup, and quote confirmation."}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {whatsapp ? (
                      <a
                        href={buildWhatsAppLink(
                          whatsapp,
                          `Hello ${business.name}, I want to ask about an event package.`
                        )}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => handleWhatsAppClick("event_catering_contact")}
                        className="inline-flex items-center gap-2 rounded-full bg-[#9a3412] px-4 py-2 text-sm font-semibold text-white"
                      >
                        <Phone size={16} />
                        WhatsApp
                      </a>
                    ) : null}

                    <button
                      type="button"
                      onClick={handleCopyStoreLink}
                      className="inline-flex items-center gap-2 rounded-full border border-orange-100 bg-[#fff8f1] px-4 py-2 text-sm font-semibold text-[#9a3412]"
                    >
                      <Copy size={16} />
                      {copiedStoreLink ? "Copied" : "Copy link"}
                    </button>
                  </div>
                </div>
              </div>
            </footer>
          ) : null}

          {hasSection("products") || hasSection("packages") ? (
            <WhatsAppCheckout
              businessId={business.id}
              businessName={business.name}
              whatsapp={whatsapp}
              cart={cart}
              setCart={setCart}
            />
          ) : null}
          {storeCustomizationStyles}
          {storeAiAssistant}
        </main>
      </>
    );
  }

  if (theme.layout === "apartment-stay") {
    return (
      <>
        <main className="market-villa-customized-store store-page-slim min-h-screen bg-[#f8f4ef] pt-24 text-[#201713] md:pt-28">
          <section className="px-4 py-4 md:px-5">
            <div className="mx-auto grid overflow-hidden rounded-[1.25rem] bg-[#201713] text-white shadow-[0_24px_80px_rgba(32,23,19,0.18)] md:max-w-7xl lg:grid-cols-[0.95fr_1.05fr]">
              <div className="flex flex-col justify-between gap-10 p-5 md:p-8">
                <header className="flex items-center justify-between gap-4">
                  <Link href="/" className="flex items-center gap-3">
                    {logoUrl ? (
                      <img
                        src={logoUrl}
                        alt={`${business.name} logo`}
                        className="h-11 w-11 rounded-xl bg-white object-cover"
                      />
                    ) : (
                      <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#f4c06a] text-sm font-bold text-[#201713]">
                        {business.name.slice(0, 1)}
                      </span>
                    )}

                    <span>
                      <span className="block text-sm font-semibold">
                        {business.name}
                      </span>
                      <span className="block text-xs text-white/55">
                        {business.category || "Property Listings"}
                      </span>
                    </span>
                  </Link>

                  {whatsapp ? (
                    <a
                      href={buildWhatsAppLink(
                        whatsapp,
                        `Hello ${business.name}, I want to ask about your property listings.`
                      )}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => handleWhatsAppClick("property_header_contact")}
                      className="hidden rounded-full bg-white px-4 py-2 text-xs font-semibold text-[#201713] md:inline-flex"
                    >
                      Contact
                    </a>
                  ) : null}
                </header>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#f4c06a]">
                    {business.location || "Available Spaces"}
                  </p>
                  <h1 className="mt-4 max-w-xl text-4xl font-semibold leading-none tracking-[-0.06em] md:text-6xl">
                    {business.tagline || business.name}
                  </h1>
                  <p className="mt-5 max-w-xl text-sm leading-7 text-white/70">
                    {business.description ||
                      "Browse available homes, shortlets, land, and commercial spaces with clear inspection details."}
                  </p>
                  <div className="mt-7 flex flex-wrap gap-3">
                    <a
                      href="#listings"
                      className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#f4c06a] px-5 text-sm font-semibold text-[#201713]"
                    >
                      View Listings
                    </a>
                    {whatsapp ? (
                      <a
                        href={buildWhatsAppLink(
                          whatsapp,
                          `Hello ${business.name}, I want to schedule a property inspection.`
                        )}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => {
                          void recordPropertyLead({
                            intent: "schedule a property inspection",
                            inquiryType: "inspection",
                          });
                          handleWhatsAppClick("property_hero_inspection");
                        }}
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/20 px-5 text-sm font-semibold text-white"
                      >
                        <MessageCircle size={17} />
                        Book Inspection
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>

              <div
                className="min-h-[21rem] bg-cover bg-center lg:min-h-[34rem]"
                style={{ backgroundImage: `url(${coverImage})` }}
              />
            </div>
          </section>

          {hasSection("feature-strip") ? (
          <section className="px-4 py-3 md:px-5">
            <div className="mx-auto grid gap-3 md:max-w-7xl md:grid-cols-3">
              {[
                ["Inspections", "Let customers ask for a viewing date before visiting."],
                ["Documents", "Show title, fees, and availability notes clearly."],
                ["Direct Contact", "Every listing can start a WhatsApp conversation."],
              ].map(([title, text]) => (
                <div
                  key={title}
                  className="rounded-[1rem] bg-white p-5 shadow-sm ring-1 ring-[#eadfd6]"
                >
                  <Check className="text-[#a86d20]" size={18} />
                  <h2 className="mt-4 text-sm font-semibold text-[#201713]">
                    {title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[#6f625d]">{text}</p>
                </div>
              ))}
            </div>
          </section>
          ) : null}

          {hasSection("products") ? (
          <section id="listings" className="px-4 py-5 md:px-5">
            <div className="mx-auto md:max-w-7xl">
              <div className="mb-5 grid gap-4 rounded-[1rem] bg-white p-4 shadow-sm ring-1 ring-[#eadfd6] md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#a86d20]">
                    Property Listings
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-[#201713]">
                    Available spaces
                  </h2>
                </div>
                <div className="relative md:w-80">
                  <Search
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a86d20]"
                    size={17}
                  />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search location, type, price"
                    className="min-h-11 w-full rounded-full border border-[#eadfd6] bg-[#fbf8f5] px-11 text-sm text-[#201713] outline-none focus:border-[#a86d20]"
                  />
                </div>
              </div>

              {visibleProducts.length ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {visibleProducts.map((product) => {
                    const details = product.property_details || {};
                    const specs = getPropertySpecs(product);
                    const status = getPropertyStatusLabel(product.property_status);
                    const feeDetails = [
                      details.inspectionFee
                        ? `Inspection: ${details.inspectionFee}`
                        : "",
                      details.agencyFee ? `Agency: ${details.agencyFee}` : "",
                      details.cautionFee ? `Caution: ${details.cautionFee}` : "",
                      details.titleDocument
                        ? `Docs: ${details.titleDocument}`
                        : "",
                    ].filter(Boolean);

                    return (
                      <article
                        key={product.id}
                        className="overflow-hidden rounded-[1.1rem] bg-white shadow-sm ring-1 ring-[#eadfd6] transition hover:-translate-y-1 hover:shadow-soft"
                      >
                        <div
                          className="h-56 bg-cover bg-center"
                          style={{
                            backgroundImage: `url(${product.image_url || fallbackProductImage})`,
                          }}
                        />
                        <div className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a86d20]">
                                {product.category || "Property"}
                              </p>
                              <h3 className="mt-2 text-lg font-semibold tracking-[-0.04em] text-[#201713]">
                                {product.name}
                              </h3>
                            </div>
                            <span className="rounded-full bg-[#f4c06a]/25 px-3 py-1 text-xs font-semibold text-[#6f4510]">
                              {status}
                            </span>
                          </div>

                          <p className="mt-3 text-lg font-bold text-[#201713]">
                            {formatCurrency(Number(product.price || 0))}
                            {details.pricePeriod ? (
                              <span className="text-sm font-semibold text-[#6f625d]">
                                {" "}
                                / {String(details.pricePeriod)}
                              </span>
                            ) : null}
                          </p>

                          {product.description ? (
                            <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#6f625d]">
                              {product.description}
                            </p>
                          ) : null}

                          {specs.length ? (
                            <div className="mt-4 flex flex-wrap gap-2">
                              {specs.slice(0, 7).map((spec) => (
                                <span
                                  key={spec}
                                  className="rounded-full bg-[#fbf8f5] px-3 py-1 text-xs font-semibold text-[#6f625d]"
                                >
                                  {spec}
                                </span>
                              ))}
                            </div>
                          ) : null}

                          {details.amenities ? (
                            <p className="mt-4 text-xs leading-5 text-[#8a7a73]">
                              {String(details.amenities)}
                            </p>
                          ) : null}

                          {hasSection("details") && feeDetails.length ? (
                            <div className="mt-4 grid gap-2 rounded-[0.9rem] bg-[#fbf8f5] p-3 text-xs font-semibold text-[#6f625d]">
                              {feeDetails.map((item) => (
                                <span key={String(item)}>{String(item)}</span>
                              ))}
                            </div>
                          ) : null}

                          <div className="mt-5 grid gap-2 sm:grid-cols-2">
                            {whatsapp ? (
                              <>
                                <a
                                  href={buildWhatsAppLink(
                                    whatsapp,
                                    buildPropertyInquiryMessage(
                                      product,
                                      "schedule an inspection"
                                    )
                                  )}
                                  target="_blank"
                                  rel="noreferrer"
                                  onClick={() => {
                                    void recordPropertyLead({
                                      product,
                                      intent: "schedule an inspection",
                                      inquiryType: "inspection",
                                    });
                                    handleWhatsAppClick("property_inspection");
                                  }}
                                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#201713] px-4 text-sm font-semibold text-white"
                                >
                                  <MessageCircle size={16} />
                                  Inspect
                                </a>
                                <a
                                  href={buildWhatsAppLink(
                                    whatsapp,
                                    buildPropertyInquiryMessage(
                                      product,
                                      "confirm availability"
                                    )
                                  )}
                                  target="_blank"
                                  rel="noreferrer"
                                  onClick={() => {
                                    void recordPropertyLead({
                                      product,
                                      intent: "confirm availability",
                                      inquiryType: "availability",
                                    });
                                    handleWhatsAppClick("property_availability");
                                  }}
                                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#eadfd6] px-4 text-sm font-semibold text-[#201713]"
                                >
                                  Availability
                                </a>
                              </>
                            ) : null}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-[1rem] bg-white p-8 text-center shadow-sm ring-1 ring-[#eadfd6]">
                  <p className="text-sm text-[#6f625d]">
                    No property listings are available right now.
                  </p>
                </div>
              )}
            </div>
          </section>
          ) : null}

          {hasSection("contact") ? (
          <footer className="px-4 pb-8 pt-2 md:px-5">
            <div className="mx-auto rounded-[1rem] bg-white p-5 text-[#201713] shadow-sm ring-1 ring-[#eadfd6] md:max-w-7xl">
              <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <h2 className="text-xl font-semibold">{business.name}</h2>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-[#6f625d]">
                    {business.location ||
                      "Contact this business directly for inspections, documents, and availability."}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {whatsapp ? (
                    <a
                      href={buildWhatsAppLink(
                        whatsapp,
                        `Hello ${business.name}, I want to ask about your available properties.`
                      )}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => handleWhatsAppClick("property_footer_contact")}
                      className="inline-flex items-center gap-2 rounded-full bg-[#201713] px-4 py-2 text-sm font-semibold text-white"
                    >
                      <Phone size={16} />
                      WhatsApp
                    </a>
                  ) : null}
                  <button
                    type="button"
                    onClick={handleCopyStoreLink}
                    className="inline-flex items-center gap-2 rounded-full border border-[#eadfd6] bg-[#fbf8f5] px-4 py-2 text-sm font-semibold text-[#201713]"
                  >
                    <Copy size={16} />
                    {copiedStoreLink ? "Copied" : "Copy link"}
                  </button>
                </div>
              </div>
            </div>
          </footer>
          ) : null}
          {storeCustomizationStyles}
          {storeAiAssistant}
        </main>
      </>
    );
  }

  if (theme.layout === "car-showroom") {
    return (
      <>
        <main className="market-villa-customized-store store-page-slim min-h-screen bg-[#f6f7f5] pt-24 text-[#101714] md:pt-28">
          <section className="px-4 py-4 md:px-5">
            <div className="mx-auto overflow-hidden rounded-[1.25rem] bg-[#101714] text-white shadow-[0_24px_80px_rgba(16,23,20,0.18)] md:max-w-7xl">
              <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
                <Link href="/" className="flex items-center gap-3">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt={`${business.name} logo`}
                      className="h-11 w-11 rounded-xl bg-white object-cover"
                    />
                  ) : (
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#22c55e] text-sm font-bold text-[#101714]">
                      {business.name.slice(0, 1)}
                    </span>
                  )}

                  <span>
                    <span className="block text-sm font-semibold">
                      {business.name}
                    </span>
                    <span className="block text-xs text-slate-200/65">
                      {business.category || "Car Showroom"}
                    </span>
                  </span>
                </Link>

                <nav className="hidden items-center gap-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-200/60 lg:flex">
                  {hasSection("collections") ? (
                    <a href="#collections" className="transition hover:text-white">
                      Stock
                    </a>
                  ) : null}
                  {hasSection("featured-deals") ? (
                    <a href="#featured-cars" className="transition hover:text-white">
                      Featured
                    </a>
                  ) : null}
                  {hasSection("specs") ? (
                    <a href="#specs" className="transition hover:text-white">
                      Specs
                    </a>
                  ) : null}
                  {hasSection("test-drive") ? (
                    <a href="#test-drive" className="transition hover:text-white">
                      Test Drive
                    </a>
                  ) : null}
                  {hasSection("products") ? (
                    <a href="#products" className="transition hover:text-white">
                      Gallery
                    </a>
                  ) : null}
                </nav>

                <button
                  type="button"
                  onClick={handleShareStore}
                  className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white ring-1 ring-white/15 transition hover:bg-white hover:text-[#101714]"
                >
                  <Share2 size={15} />
                  Share
                </button>
              </header>

              <div className="grid gap-6 p-5 md:grid-cols-[0.82fr_1.18fr] md:items-stretch md:p-7 lg:p-9">
                <div className="flex flex-col justify-between gap-8">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#86efac]">
                      Vehicle Showroom
                    </p>
                    <h1 className="mt-4 max-w-2xl text-5xl font-semibold leading-[0.95] tracking-[-0.06em] text-white drop-shadow-[0_5px_18px_rgba(0,0,0,0.85)] md:text-7xl">
                      {business.name}
                    </h1>
                    {business.tagline ? (
                      <p className="mt-5 max-w-xl text-lg leading-8 text-slate-100/82">
                        {business.tagline}
                      </p>
                    ) : null}
                    <p className="mt-4 max-w-xl text-sm leading-7 text-slate-100/62">
                      {business.description ||
                        "Browse available vehicles, compare specs, confirm inspection details, and request a test drive or price confirmation on WhatsApp."}
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {whatsapp ? (
                      <a
                        href={buildWhatsAppLink(
                          whatsapp,
                          `Hello ${business.name}, I want to inspect or test drive a vehicle. Vehicle: . Preferred date: .`
                        )}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => {
                          void recordVehicleLead({
                            intent: "inspect or test drive a vehicle",
                            inquiryType: "test_drive",
                          });
                          handleWhatsAppClick("car_showroom_test_drive");
                        }}
                        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#22c55e] px-5 text-sm font-semibold text-[#101714] transition hover:bg-[#86efac]"
                      >
                        <MessageCircle size={17} />
                        Book Test Drive
                      </a>
                    ) : null}
                    <a
                      href={hasSection("products") ? "#products" : primaryCtaHref}
                      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-[#101714]"
                    >
                      <ShoppingBag size={17} />
                      View Cars
                    </a>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-[1fr_0.55fr]">
                  <div
                    className="min-h-72 rounded-[1.25rem] bg-cover bg-center md:min-h-[28rem]"
                    style={{ backgroundImage: `url(${coverImage})` }}
                  />
                  <div className="grid gap-3">
                    <div className="rounded-[1.25rem] bg-white p-4 text-[#101714]">
                      <p className="text-3xl font-semibold">{visibleProducts.length}</p>
                      <p className="mt-1 text-xs text-slate-500">Vehicles</p>
                    </div>
                    <div className="rounded-[1.25rem] bg-[#22c55e] p-4 text-[#101714]">
                      <p className="text-3xl font-semibold">{carCategories.length}</p>
                      <p className="mt-1 text-xs opacity-70">Stock groups</p>
                    </div>
                    <div className="rounded-[1.25rem] bg-white/10 p-4 text-white ring-1 ring-white/15">
                      <p className="text-3xl font-semibold">WA</p>
                      <p className="mt-1 text-xs text-slate-200/65">Inspection</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {hasSection("collections") ? (
            <section id="collections" className="px-4 py-4 md:px-5">
              <div className="mx-auto grid gap-3 md:max-w-7xl md:grid-cols-6">
                {carCategories.map((category, index) => (
                  <a
                    key={category}
                    href={hasSection("products") ? "#products" : "#contact"}
                    className={`rounded-[1rem] border p-4 shadow-sm transition hover:-translate-y-0.5 ${
                      index === 0
                        ? "border-[#101714] bg-[#101714] text-white"
                        : "border-[#d7ded8] bg-white text-[#101714]"
                    }`}
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-60">
                      Stock
                    </p>
                    <h2 className="mt-2 text-sm font-semibold">{category}</h2>
                  </a>
                ))}
              </div>
            </section>
          ) : null}

          {hasSection("featured-deals") ? (
            <section id="featured-cars" className="px-4 py-4 md:px-5">
              <div className="mx-auto md:max-w-7xl">
                <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#15803d]">
                      Featured Cars
                    </p>
                    <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">
                      Fresh stock customers can inspect first.
                    </h2>
                  </div>
                  <p className="max-w-sm text-sm leading-6 text-slate-600">
                    Use featured products for clean cars, urgent sales, new arrivals,
                    or vehicles with strong specs and complete documents.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {(featuredCars.length ? featuredCars : visibleProducts)
                    .slice(0, 4)
                    .map((product) => (
                      <article
                        key={product.id}
                        className="overflow-hidden rounded-[1.15rem] bg-white shadow-sm ring-1 ring-[#d7ded8]"
                      >
                        <div
                          className="h-52 bg-cover bg-center"
                          style={{
                            backgroundImage: `url(${product.image_url || fallbackProductImage})`,
                          }}
                        />
                        <div className="p-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#15803d]">
                              {product.category || "Featured"}
                            </p>
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                              {getVehicleStatusLabel(product.vehicle_status)}
                            </span>
                          </div>
                          <h3 className="mt-2 text-sm font-semibold">{product.name}</h3>
                          {getVehicleSpecs(product).length ? (
                            <p className="mt-2 line-clamp-1 text-xs text-slate-500">
                              {getVehicleSpecs(product).slice(0, 4).join(" / ")}
                            </p>
                          ) : null}
                          <p className="mt-2 text-sm font-bold">
                            {formatCurrency(Number(product.price || 0))}
                          </p>
                        </div>
                      </article>
                    ))}
                </div>
              </div>
            </section>
          ) : null}

          {hasSection("specs") ? (
            <section id="specs" className="px-4 py-4 md:px-5">
              <div className="mx-auto rounded-[1.25rem] bg-white p-5 shadow-sm ring-1 ring-[#d7ded8] md:max-w-7xl md:p-6">
                <div className="mb-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#15803d]">
                    Vehicle Specs
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">
                    Make the important car details easy to scan.
                  </h2>
                </div>

                <div className="grid gap-3 md:grid-cols-4">
                  {(specCars.length ? specCars : visibleProducts).slice(0, 4).map((product) => (
                    <article
                      key={product.id}
                      className="rounded-[1rem] bg-[#f6f7f5] p-4 ring-1 ring-[#d7ded8]"
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#15803d]">
                        {product.category || "Vehicle"}
                      </p>
                      <h3 className="mt-2 text-base font-semibold">{product.name}</h3>
                      {getVehicleSpecs(product).length ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {getVehicleSpecs(product).slice(0, 5).map((spec) => (
                            <span
                              key={spec}
                              className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600"
                            >
                              {spec}
                            </span>
                          ))}
                        </div>
                      ) : null}
                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
                        {product.description ||
                          "Add year, mileage, engine, transmission, duty status, trim, and condition in the vehicle description."}
                      </p>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          ) : null}

          {hasSection("inspection") || hasSection("financing") ? (
            <section className="px-4 py-4 md:px-5">
              <div className="mx-auto grid gap-3 md:max-w-7xl md:grid-cols-2">
                {hasSection("inspection") ? (
                  <div id="inspection" className="rounded-[1.25rem] bg-[#101714] p-5 text-white shadow-sm md:p-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#86efac]">
                      Inspection Notes
                    </p>
                    <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">
                      Help buyers know what to verify.
                    </h2>
                    <div className="mt-5 grid gap-3">
                      {[
                        "Confirm mileage, accident history, duty and document status.",
                        "Invite buyers to request more photos, videos, or inspection date.",
                        inspectionCars[0]?.description ||
                          "Add inspection and condition details in each vehicle description.",
                      ].map((note) => (
                        <p key={note} className="rounded-xl bg-white/10 p-4 text-sm leading-6 text-slate-100/72">
                          {note}
                        </p>
                      ))}
                    </div>
                  </div>
                ) : null}

                {hasSection("financing") ? (
                  <div id="financing" className="rounded-[1.25rem] bg-white p-5 text-[#101714] shadow-sm ring-1 ring-[#d7ded8] md:p-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#15803d]">
                      Financing Notes
                    </p>
                    <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">
                      Price, deposit, swap, or instalment guidance.
                    </h2>
                    <div className="mt-5 grid gap-3">
                      {[
                        "Show whether payment plans, vehicle swap, or deposit are available.",
                        "Ask buyers to confirm final price and payment terms directly.",
                        "Mention documentation and transfer process before payment.",
                      ].map((note) => (
                        <p key={note} className="rounded-xl bg-[#f6f7f5] p-4 text-sm leading-6 text-slate-600">
                          {note}
                        </p>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </section>
          ) : null}

          {hasSection("test-drive") ? (
            <section id="test-drive" className="px-4 py-4 md:px-5">
              <div className="mx-auto grid gap-4 rounded-[1.25rem] bg-[#1f352b] p-5 text-white shadow-sm md:max-w-7xl md:grid-cols-[1fr_auto] md:items-center md:p-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#86efac]">
                    Test Drive Request
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">
                    Turn interest into inspection bookings.
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-100/72">
                    Customers can send vehicle name, preferred inspection date,
                    location, and questions directly on WhatsApp.
                  </p>
                </div>
                {whatsapp ? (
                  <a
                    href={buildWhatsAppLink(
                      whatsapp,
                      `Hello ${business.name}, I want to book a test drive/inspection. Vehicle: . Date: . Location: .`
                    )}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => {
                      void recordVehicleLead({
                        intent: "book a test drive or inspection",
                        inquiryType: "test_drive",
                      });
                      handleWhatsAppClick("car_showroom_test_drive");
                    }}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-[#101714]"
                  >
                    <MessageCircle size={17} />
                    Book Inspection
                  </a>
                ) : null}
              </div>
            </section>
          ) : null}

          {hasSection("products") ? (
            <section id="products" className="px-4 py-5 md:px-5">
              <div className="mx-auto md:max-w-7xl">
                <div className="mb-5 grid gap-4 rounded-[1.15rem] bg-white p-4 shadow-sm ring-1 ring-[#d7ded8] md:grid-cols-[1fr_auto] md:items-center">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#15803d]">
                      Vehicle Gallery
                    </p>
                    <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em]">
                      Available Cars
                    </h2>
                  </div>
                  <div className="relative md:w-80">
                    <Search
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600"
                      size={17}
                    />
                    <input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Search Toyota, SUV, sedan"
                      className="min-h-11 w-full rounded-full border border-[#d7ded8] bg-[#f6f7f5] px-11 text-sm text-[#101714] outline-none focus:border-[#15803d]"
                    />
                  </div>
                </div>

                {visibleProducts.length ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {visibleProducts.map((product) => (
                      <article
                        key={product.id}
                        className="overflow-hidden rounded-[1.15rem] bg-white shadow-sm ring-1 ring-[#d7ded8] transition hover:-translate-y-1 hover:shadow-soft"
                      >
                        <div
                          className="h-52 bg-cover bg-center"
                          style={{
                            backgroundImage: `url(${product.image_url || fallbackProductImage})`,
                          }}
                        />
                        <div className="p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#15803d]">
                            {product.category || "Vehicle"}
                          </p>
                          <h3 className="mt-2 text-base font-semibold">
                            {product.name}
                          </h3>
                          {getVehicleSpecs(product).length ? (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {getVehicleSpecs(product).slice(0, 5).map((spec) => (
                                <span
                                  key={spec}
                                  className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
                                >
                                  {spec}
                                </span>
                              ))}
                            </div>
                          ) : null}
                          {product.description ? (
                            <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                              {product.description}
                            </p>
                          ) : null}
                          <div className="mt-4 flex items-center justify-between gap-3">
                            <span className="text-sm font-bold">
                              {formatCurrency(Number(product.price || 0))}
                            </span>
                            {whatsapp ? (
                            <a
                              href={buildWhatsAppLink(
                                whatsapp,
                                buildVehicleInquiryMessage(
                                  product,
                                  "confirm details and book an inspection"
                                )
                              )}
                              target="_blank"
                              rel="noreferrer"
                              onClick={() => {
                                void recordVehicleLead({
                                  product,
                                  intent: "confirm details and book an inspection",
                                  inquiryType: "inspection",
                                });
                                handleWhatsAppClick("car_showroom_vehicle_inquiry");
                              }}
                              className="rounded-full bg-[#101714] px-4 py-2 text-xs font-semibold text-white"
                            >
                              Confirm
                            </a>
                            ) : null}
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-[1.15rem] bg-white p-8 text-center shadow-sm ring-1 ring-[#d7ded8]">
                    <p className="text-sm text-slate-600">
                      No vehicles are available right now.
                    </p>
                  </div>
                )}
              </div>
            </section>
          ) : null}

          {hasSection("contact") ? (
            <footer id="contact" className="px-4 pb-8 pt-4 md:px-5">
              <div className="mx-auto rounded-[1.25rem] bg-white p-5 text-[#101714] shadow-sm ring-1 ring-[#d7ded8] md:max-w-7xl">
                <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
                  <div>
                    <h2 className="text-xl font-semibold">{business.name}</h2>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
                      {business.tagline ||
                        "Contact this car seller directly for vehicle availability, inspection, documents, final price, and test drive bookings."}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {whatsapp ? (
                      <a
                        href={buildWhatsAppLink(
                          whatsapp,
                          `Hello ${business.name}, I want to ask about a vehicle.`
                        )}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => handleWhatsAppClick("car_showroom_contact")}
                        className="inline-flex items-center gap-2 rounded-full bg-[#101714] px-4 py-2 text-sm font-semibold text-white"
                      >
                        <Phone size={16} />
                        WhatsApp
                      </a>
                    ) : null}

                    <button
                      type="button"
                      onClick={handleCopyStoreLink}
                      className="inline-flex items-center gap-2 rounded-full border border-[#d7ded8] bg-[#f6f7f5] px-4 py-2 text-sm font-semibold text-[#101714]"
                    >
                      <Copy size={16} />
                      {copiedStoreLink ? "Copied" : "Copy link"}
                    </button>
                  </div>
                </div>
              </div>
            </footer>
          ) : null}

          {storeCustomizationStyles}
          {storeAiAssistant}
        </main>
      </>
    );
  }

  if (theme.layout === "home-furniture") {
    return (
      <>
        <main className="market-villa-customized-store store-page-slim min-h-screen bg-[#f5f2ec] pt-24 text-[#201a14] md:pt-28">
          <section className="px-4 py-4 md:px-5">
            <div className="mx-auto overflow-hidden rounded-[1.25rem] bg-[#201a14] text-white shadow-[0_24px_80px_rgba(32,26,20,0.2)] md:max-w-7xl">
              <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
                <Link href="/" className="flex items-center gap-3">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt={`${business.name} logo`}
                      className="h-11 w-11 rounded-xl bg-white object-cover"
                    />
                  ) : (
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#d8c2a4] text-sm font-bold text-[#201a14]">
                      {business.name.slice(0, 1)}
                    </span>
                  )}

                  <span>
                    <span className="block text-sm font-semibold">
                      {business.name}
                    </span>
                    <span className="block text-xs text-stone-200/65">
                      {business.category || "Home Store"}
                    </span>
                  </span>
                </Link>

                <nav className="hidden items-center gap-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-200/60 lg:flex">
                  {hasSection("collections") ? (
                    <a href="#collections" className="transition hover:text-white">
                      Collections
                    </a>
                  ) : null}
                  {hasSection("rooms") ? (
                    <a href="#rooms" className="transition hover:text-white">
                      Rooms
                    </a>
                  ) : null}
                  {hasSection("details") ? (
                    <a href="#details" className="transition hover:text-white">
                      Details
                    </a>
                  ) : null}
                  {hasSection("delivery") ? (
                    <a href="#delivery" className="transition hover:text-white">
                      Delivery
                    </a>
                  ) : null}
                  {hasSection("products") ? (
                    <a href="#products" className="transition hover:text-white">
                      Products
                    </a>
                  ) : null}
                </nav>

                <button
                  type="button"
                  onClick={handleShareStore}
                  className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white ring-1 ring-white/15 transition hover:bg-white hover:text-[#201a14]"
                >
                  <Share2 size={15} />
                  Share
                </button>
              </header>

              <div className="grid gap-6 p-5 md:grid-cols-[0.82fr_1.18fr] md:items-stretch md:p-7 lg:p-9">
                <div className="flex flex-col justify-between gap-8">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#f1dfc6]">
                      Home & Furniture
                    </p>
                    <h1 className="mt-4 max-w-2xl text-5xl font-semibold leading-[0.95] tracking-[-0.06em] text-white drop-shadow-[0_5px_18px_rgba(0,0,0,0.85)] md:text-7xl">
                      {business.name}
                    </h1>

                    {business.tagline ? (
                      <p className="mt-5 max-w-xl text-lg leading-8 text-stone-100/82">
                        {business.tagline}
                      </p>
                    ) : null}

                    <p className="mt-4 max-w-xl text-sm leading-7 text-stone-100/62">
                      {business.description ||
                        "Browse furniture, decor, dimensions, room ideas, and delivery notes before starting a WhatsApp order."}
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <a
                      href={
                        hasSection("products")
                          ? "#products"
                          : hasSection("rooms")
                            ? "#rooms"
                            : hasSection("collections")
                              ? "#collections"
                              : primaryCtaHref
                      }
                      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#d8c2a4] px-5 text-sm font-semibold text-[#201a14] transition hover:bg-[#f1dfc6]"
                    >
                      <ShoppingBag size={17} />
                      View Pieces
                    </a>

                    {whatsapp ? (
                      <a
                        href={buildWhatsAppLink(
                          whatsapp,
                          `Hello ${business.name}, I want to ask about a home product.`
                        )}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => handleWhatsAppClick("home_furniture_whatsapp_order")}
                        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-[#201a14]"
                      >
                        <MessageCircle size={17} />
                        WhatsApp
                      </a>
                    ) : null}
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-[1fr_0.48fr]">
                  <div
                    className="min-h-80 rounded-[1.25rem] bg-cover bg-center ring-1 ring-white/10 md:min-h-[30rem]"
                    style={{ backgroundImage: `url(${coverImage})` }}
                  />

                  <div className="grid gap-3">
                    <div className="rounded-[1.25rem] bg-white p-4 text-[#201a14]">
                      <p className="text-3xl font-semibold">
                        {visibleProducts.length}
                      </p>
                      <p className="mt-1 text-xs text-stone-500">Products</p>
                    </div>
                    <div className="rounded-[1.25rem] bg-[#5a4635] p-4 text-white">
                      <p className="text-3xl font-semibold">
                        {homeCategories.length}
                      </p>
                      <p className="mt-1 text-xs text-stone-200/65">
                        Collections
                      </p>
                    </div>
                    <div className="rounded-[1.25rem] bg-[#d8c2a4] p-4 text-[#201a14]">
                      <p className="text-3xl font-semibold">WA</p>
                      <p className="mt-1 text-xs opacity-70">Inquiries</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {hasSection("collections") ? (
            <section id="collections" className="px-4 py-4 md:px-5">
              <div className="mx-auto grid gap-3 md:max-w-7xl md:grid-cols-6">
                {homeCategories.map((category, index) => (
                  <a
                    key={category}
                    href={hasSection("products") ? "#products" : "#contact"}
                    className={`rounded-[1rem] border p-5 shadow-sm transition hover:-translate-y-0.5 ${
                      index === 0
                        ? "border-[#201a14] bg-[#201a14] text-white"
                        : "border-[#ded3c4] bg-white text-[#201a14]"
                    }`}
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-60">
                      Collection
                    </p>
                    <h2 className="mt-3 text-base font-semibold">{category}</h2>
                  </a>
                ))}
              </div>
            </section>
          ) : null}

          {hasSection("rooms") ? (
            <section id="rooms" className="px-4 py-4 md:px-5">
              <div className="mx-auto md:max-w-7xl">
                <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8a6a46]">
                      Featured Rooms
                    </p>
                    <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">
                      Shop by room, mood, or setup.
                    </h2>
                  </div>
                  <p className="max-w-sm text-sm leading-6 text-stone-500">
                    Use featured products to show complete room ideas or high-impact pieces.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  {(roomProducts.length ? roomProducts : visibleProducts)
                    .slice(0, 3)
                    .map((product) => (
                      <article
                        key={product.id}
                        className="overflow-hidden rounded-[1rem] bg-white shadow-sm"
                      >
                        <div
                          className="h-72 bg-cover bg-center"
                          style={{
                            backgroundImage: `url(${
                              product.image_url || fallbackProductImage
                            })`,
                          }}
                        />
                        <div className="p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8a6a46]">
                            {product.category || "Room"}
                          </p>
                          <h3 className="mt-2 text-lg font-semibold">
                            {product.name}
                          </h3>
                          <p className="mt-2 text-sm font-bold">
                            {formatCurrency(Number(product.price || 0))}
                          </p>
                        </div>
                      </article>
                    ))}
                </div>
              </div>
            </section>
          ) : null}

          {hasSection("details") ? (
            <section id="details" className="px-4 py-4 md:px-5">
              <div className="mx-auto rounded-[1.25rem] bg-white p-5 shadow-sm md:max-w-7xl md:p-6">
                <div className="mb-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8a6a46]">
                    Measurements / Details
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">
                    Help customers understand fit, finish, and materials.
                  </h2>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  {(detailProducts.length ? detailProducts : visibleProducts)
                    .slice(0, 3)
                    .map((product) => (
                      <article
                        key={product.id}
                        className="rounded-[1rem] border border-[#ded3c4] bg-[#fbf8f3] p-4"
                      >
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8a6a46]">
                          {product.category || "Details"}
                        </p>
                        <h3 className="mt-2 text-lg font-semibold">
                          {product.name}
                        </h3>
                        <div className="mt-4 grid gap-2 text-xs font-semibold text-stone-600">
                          <span className="rounded-xl bg-white px-3 py-2">
                            Dimensions: Confirm on WhatsApp
                          </span>
                          <span className="rounded-xl bg-white px-3 py-2">
                            Material: See product notes
                          </span>
                          <span className="rounded-xl bg-white px-3 py-2">
                            Price: {formatCurrency(Number(product.price || 0))}
                          </span>
                        </div>
                      </article>
                    ))}
                </div>
              </div>
            </section>
          ) : null}

          {hasSection("delivery") ? (
            <section id="delivery" className="px-4 py-4 md:px-5">
              <div className="mx-auto grid gap-3 md:max-w-7xl md:grid-cols-3">
                {[
                  {
                    title: "Delivery Area",
                    body:
                      business.location ||
                      "Confirm delivery area, pickup option, or dispatch fee with the seller.",
                  },
                  {
                    title: "Installation",
                    body:
                      "For furniture and fittings, ask if assembly, installation, or setup is included.",
                  },
                  {
                    title: "Lead Time",
                    body:
                      business.opening_hours ||
                      "Confirm stock, production time, and delivery schedule before payment.",
                  },
                ].map((note) => (
                  <div
                    key={note.title}
                    className="rounded-[1rem] border border-[#ded3c4] bg-white p-5 shadow-sm"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8a6a46]">
                      {note.title}
                    </p>
                    <p className="mt-3 text-sm leading-7 text-stone-500">
                      {note.body}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {hasSection("products") ? (
            <section id="products" className="px-4 py-5 md:px-5">
              <div className="mx-auto md:max-w-7xl">
                <div className="mb-5 grid gap-4 rounded-[1rem] bg-white p-4 shadow-sm md:grid-cols-[1fr_auto] md:items-center">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8a6a46]">
                      Products
                    </p>
                    <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em]">
                      Home Catalogue
                    </h2>
                  </div>

                  <div className="relative md:w-80">
                    <Search
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
                      size={17}
                    />
                    <input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Search furniture, decor, lighting"
                      className="min-h-11 w-full rounded-full border border-[#ded3c4] bg-[#fbf8f3] px-11 text-sm text-[#201a14] outline-none focus:border-[#8a6a46]"
                    />
                  </div>
                </div>

                {visibleProducts.length ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {visibleProducts.map((product) => (
                      <article
                        key={product.id}
                        className="overflow-hidden rounded-[1rem] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-soft"
                      >
                        <div
                          className="h-56 bg-cover bg-center"
                          style={{
                            backgroundImage: `url(${
                              product.image_url || fallbackProductImage
                            })`,
                          }}
                        />
                        <div className="p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8a6a46]">
                            {product.category || "Home"}
                          </p>
                          <h3 className="mt-2 text-base font-semibold">
                            {product.name}
                          </h3>
                          {product.description ? (
                            <p className="mt-2 line-clamp-2 text-sm leading-6 text-stone-500">
                              {product.description}
                            </p>
                          ) : null}
                          <div className="mt-4 flex items-center justify-between gap-3">
                            <span className="text-sm font-bold">
                              {formatCurrency(Number(product.price || 0))}
                            </span>
                            <button
                              type="button"
                              onClick={() => addToCart(product)}
                              className="rounded-full bg-[#201a14] px-4 py-2 text-xs font-semibold text-white"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-[1rem] bg-white p-8 text-center shadow-sm">
                    <p className="text-sm text-stone-500">
                      No home products are available right now.
                    </p>
                  </div>
                )}
              </div>
            </section>
          ) : null}

          {hasSection("contact") ? (
            <footer id="contact" className="px-4 pb-8 pt-4 md:px-5">
              <div className="mx-auto rounded-[1.25rem] bg-[#201a14] p-5 text-white shadow-sm md:max-w-7xl">
                <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
                  <div>
                    <h2 className="text-xl font-semibold">{business.name}</h2>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-stone-100/65">
                      {business.tagline ||
                        "Contact this home store directly for dimensions, delivery, installation, and availability."}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {whatsapp ? (
                      <a
                        href={buildWhatsAppLink(
                          whatsapp,
                          `Hello ${business.name}, I want to ask about a home product.`
                        )}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => handleWhatsAppClick("home_furniture_whatsapp_order")}
                        className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#201a14]"
                      >
                        <Phone size={16} />
                        WhatsApp
                      </a>
                    ) : null}

                    <button
                      type="button"
                      onClick={handleCopyStoreLink}
                      className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/15"
                    >
                      <Copy size={16} />
                      {copiedStoreLink ? "Copied" : "Copy link"}
                    </button>
                  </div>
                </div>
              </div>
            </footer>
          ) : null}

          {hasSection("products") ? (
            <WhatsAppCheckout
              businessId={business.id}
              businessName={business.name}
              whatsapp={whatsapp}
              cart={cart}
              setCart={setCart}
            />
          ) : null}
          {storeCustomizationStyles}
          {storeAiAssistant}
        </main>
      </>
    );
  }

  if (theme.layout === "tech-catalog") {
    return (
      <>
        <main className="market-villa-customized-store store-page-slim min-h-screen bg-[#eef6ff] pt-24 text-[#08111f] md:pt-28">
          <section className="px-4 py-4 md:px-5">
            <div className="mx-auto overflow-hidden rounded-[1.25rem] bg-[#031124] text-white shadow-[0_24px_80px_rgba(3,17,36,0.22)] md:max-w-7xl">
              <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
                <Link href="/" className="flex items-center gap-3">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt={`${business.name} logo`}
                      className="h-11 w-11 rounded-xl bg-white object-cover"
                    />
                  ) : (
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#38bdf8] text-sm font-bold text-[#031124]">
                      {business.name.slice(0, 1)}
                    </span>
                  )}

                  <span>
                    <span className="block text-sm font-semibold">
                      {business.name}
                    </span>
                    <span className="block text-xs text-sky-100/60">
                      {business.category || "Tech Store"}
                    </span>
                  </span>
                </Link>

                <nav className="hidden items-center gap-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-100/55 lg:flex">
                  {hasSection("collections") ? (
                    <a href="#collections" className="transition hover:text-white">
                      Collections
                    </a>
                  ) : null}
                  {hasSection("featured-deals") ? (
                    <a href="#featured-deals" className="transition hover:text-white">
                      Deals
                    </a>
                  ) : null}
                  {hasSection("specs") ? (
                    <a href="#specs" className="transition hover:text-white">
                      Specs
                    </a>
                  ) : null}
                  {hasSection("warranty") ? (
                    <a href="#warranty" className="transition hover:text-white">
                      Warranty
                    </a>
                  ) : null}
                  {hasSection("products") ? (
                    <a href="#products" className="transition hover:text-white">
                      Products
                    </a>
                  ) : null}
                </nav>

                <button
                  type="button"
                  onClick={handleShareStore}
                  className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white ring-1 ring-white/15 transition hover:bg-white hover:text-[#031124]"
                >
                  <Share2 size={15} />
                  Share
                </button>
              </header>

              <div className="grid gap-6 p-5 md:grid-cols-[0.9fr_1.1fr] md:items-stretch md:p-7 lg:p-9">
                <div className="flex flex-col justify-between gap-8">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7dd3fc]">
                      Tech Catalog
                    </p>
                    <h1 className="mt-4 max-w-2xl text-5xl font-semibold leading-[0.95] tracking-[-0.06em] text-white drop-shadow-[0_5px_18px_rgba(0,0,0,0.85)] md:text-7xl">
                      {business.name}
                    </h1>

                    {business.tagline ? (
                      <p className="mt-5 max-w-xl text-lg leading-8 text-sky-50/80">
                        {business.tagline}
                      </p>
                    ) : null}

                    <p className="mt-4 max-w-xl text-sm leading-7 text-sky-50/58">
                      {business.description ||
                        "Browse gadgets, accessories, specs, warranty notes, and availability before starting a WhatsApp order."}
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <a
                      href={
                        hasSection("products")
                          ? "#products"
                          : hasSection("featured-deals")
                            ? "#featured-deals"
                            : hasSection("collections")
                              ? "#collections"
                              : primaryCtaHref
                      }
                      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#38bdf8] px-5 text-sm font-semibold text-[#031124] transition hover:bg-[#7dd3fc]"
                    >
                      <ShoppingBag size={17} />
                      Shop Devices
                    </a>

                    {whatsapp ? (
                      <a
                        href={buildWhatsAppLink(
                          whatsapp,
                          `Hello ${business.name}, I want to order a tech product.`
                        )}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => handleWhatsAppClick("tech_catalog_whatsapp_order")}
                        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-[#031124]"
                      >
                        <MessageCircle size={17} />
                        WhatsApp
                      </a>
                    ) : null}
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-[1fr_0.55fr]">
                  <div
                    className="min-h-72 rounded-[1.25rem] bg-cover bg-center ring-1 ring-white/10 md:min-h-[28rem]"
                    style={{ backgroundImage: `url(${coverImage})` }}
                  />

                  <div className="grid gap-3">
                    <div className="rounded-[1.25rem] bg-white p-4 text-[#08111f]">
                      <p className="text-3xl font-semibold">
                        {visibleProducts.length}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">Products</p>
                    </div>
                    <div className="rounded-[1.25rem] bg-[#0f2d56] p-4 text-white">
                      <p className="text-3xl font-semibold">
                        {techCategories.length}
                      </p>
                      <p className="mt-1 text-xs text-sky-100/60">
                        Categories
                      </p>
                    </div>
                    <div className="rounded-[1.25rem] bg-[#38bdf8] p-4 text-[#031124]">
                      <p className="text-3xl font-semibold">WA</p>
                      <p className="mt-1 text-xs opacity-70">Orders</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {hasSection("collections") ? (
            <section id="collections" className="px-4 py-4 md:px-5">
              <div className="mx-auto grid gap-3 md:max-w-7xl md:grid-cols-5">
                {techCategories.map((category, index) => (
                  <a
                    key={category}
                    href={hasSection("products") ? "#products" : "#contact"}
                    className={`rounded-[1rem] border p-5 shadow-sm transition hover:-translate-y-0.5 ${
                      index === 0
                        ? "border-[#031124] bg-[#031124] text-white"
                        : "border-sky-100 bg-white text-[#08111f]"
                    }`}
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-60">
                      Category
                    </p>
                    <h2 className="mt-3 text-lg font-semibold">{category}</h2>
                  </a>
                ))}
              </div>
            </section>
          ) : null}

          {hasSection("featured-deals") ? (
            <section id="featured-deals" className="px-4 py-4 md:px-5">
              <div className="mx-auto md:max-w-7xl">
                <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#0369a1]">
                      Featured Deals
                    </p>
                    <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">
                      Best offers and high-demand products.
                    </h2>
                  </div>
                  <p className="max-w-sm text-sm leading-6 text-slate-500">
                    Feature fast-moving gadgets, new arrivals, or products with
                    strong availability.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {(techFeaturedDeals.length ? techFeaturedDeals : visibleProducts)
                    .slice(0, 4)
                    .map((product) => (
                      <article
                        key={product.id}
                        className="overflow-hidden rounded-[1rem] bg-white shadow-sm"
                      >
                        <div
                          className="h-48 bg-cover bg-center"
                          style={{
                            backgroundImage: `url(${
                              product.image_url || fallbackProductImage
                            })`,
                          }}
                        />
                        <div className="p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0369a1]">
                            {product.category || "Device"}
                          </p>
                          <h3 className="mt-2 text-sm font-semibold">
                            {product.name}
                          </h3>
                          <p className="mt-2 text-sm font-bold">
                            {formatCurrency(Number(product.price || 0))}
                          </p>
                        </div>
                      </article>
                    ))}
                </div>
              </div>
            </section>
          ) : null}

          {hasSection("specs") ? (
            <section id="specs" className="px-4 py-4 md:px-5">
              <div className="mx-auto rounded-[1.25rem] bg-white p-5 shadow-sm md:max-w-7xl md:p-6">
                <div className="mb-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#0369a1]">
                    Specs / Highlights
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">
                    Give buyers the details they scan for.
                  </h2>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  {(techSpecItems.length ? techSpecItems : visibleProducts)
                    .slice(0, 3)
                    .map((product) => (
                      <article
                        key={product.id}
                        className="rounded-[1rem] border border-sky-100 bg-[#f8fbff] p-4"
                      >
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0369a1]">
                          {product.category || "Spec Sheet"}
                        </p>
                        <h3 className="mt-2 text-lg font-semibold">
                          {product.name}
                        </h3>
                        <div className="mt-4 grid gap-2 text-xs font-semibold text-slate-600">
                          <span className="rounded-xl bg-white px-3 py-2">
                            Availability: Confirm on WhatsApp
                          </span>
                          <span className="rounded-xl bg-white px-3 py-2">
                            Warranty: Ask seller
                          </span>
                          <span className="rounded-xl bg-white px-3 py-2">
                            Price: {formatCurrency(Number(product.price || 0))}
                          </span>
                        </div>
                      </article>
                    ))}
                </div>
              </div>
            </section>
          ) : null}

          {hasSection("warranty") ? (
            <section id="warranty" className="px-4 py-4 md:px-5">
              <div className="mx-auto grid gap-3 md:max-w-7xl md:grid-cols-3">
                {[
                  {
                    title: "Warranty",
                    body:
                      "Add product-specific warranty notes, testing details, or return windows in the product description.",
                  },
                  {
                    title: "Pickup / Delivery",
                    body:
                      business.location ||
                      "Confirm delivery or pickup location directly with the seller.",
                  },
                  {
                    title: "Availability",
                    body:
                      business.opening_hours ||
                      "Confirm stock and variants before making payment.",
                  },
                ].map((note) => (
                  <div
                    key={note.title}
                    className="rounded-[1rem] border border-sky-100 bg-white p-5 shadow-sm"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0369a1]">
                      {note.title}
                    </p>
                    <p className="mt-3 text-sm leading-7 text-slate-500">
                      {note.body}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {hasSection("products") ? (
            <section id="products" className="px-4 py-5 md:px-5">
              <div className="mx-auto md:max-w-7xl">
                <div className="mb-5 grid gap-4 rounded-[1rem] bg-white p-4 shadow-sm md:grid-cols-[1fr_auto] md:items-center">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#0369a1]">
                      Products
                    </p>
                    <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em]">
                      Tech Catalogue
                    </h2>
                  </div>

                  <div className="relative md:w-80">
                    <Search
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      size={17}
                    />
                    <input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Search phones, laptops, accessories"
                      className="min-h-11 w-full rounded-full border border-sky-100 bg-[#f8fbff] px-11 text-sm text-[#08111f] outline-none focus:border-[#0369a1]"
                    />
                  </div>
                </div>

                {visibleProducts.length ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {visibleProducts.map((product) => (
                      <article
                        key={product.id}
                        className="overflow-hidden rounded-[1rem] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-soft"
                      >
                        <div
                          className="h-48 bg-cover bg-center"
                          style={{
                            backgroundImage: `url(${
                              product.image_url || fallbackProductImage
                            })`,
                          }}
                        />
                        <div className="p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0369a1]">
                            {product.category || "Tech"}
                          </p>
                          <h3 className="mt-2 text-base font-semibold">
                            {product.name}
                          </h3>
                          {product.description ? (
                            <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                              {product.description}
                            </p>
                          ) : null}
                          <div className="mt-4 flex items-center justify-between gap-3">
                            <span className="text-sm font-bold">
                              {formatCurrency(Number(product.price || 0))}
                            </span>
                            <button
                              type="button"
                              onClick={() => addToCart(product)}
                              className="rounded-full bg-[#031124] px-4 py-2 text-xs font-semibold text-white"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-[1rem] bg-white p-8 text-center shadow-sm">
                    <p className="text-sm text-slate-500">
                      No tech products are available right now.
                    </p>
                  </div>
                )}
              </div>
            </section>
          ) : null}

          {hasSection("contact") ? (
            <footer id="contact" className="px-4 pb-8 pt-4 md:px-5">
              <div className="mx-auto rounded-[1.25rem] bg-[#031124] p-5 text-white shadow-sm md:max-w-7xl">
                <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
                  <div>
                    <h2 className="text-xl font-semibold">{business.name}</h2>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-sky-50/65">
                      {business.tagline ||
                        "Contact this tech store directly for stock, specs, warranty, and ordering."}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {whatsapp ? (
                      <a
                        href={buildWhatsAppLink(
                          whatsapp,
                          `Hello ${business.name}, I want to order a tech product.`
                        )}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => handleWhatsAppClick("tech_catalog_whatsapp_order")}
                        className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#031124]"
                      >
                        <Phone size={16} />
                        WhatsApp
                      </a>
                    ) : null}

                    <button
                      type="button"
                      onClick={handleCopyStoreLink}
                      className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/15"
                    >
                      <Copy size={16} />
                      {copiedStoreLink ? "Copied" : "Copy link"}
                    </button>
                  </div>
                </div>
              </div>
            </footer>
          ) : null}

          {hasSection("products") ? (
            <WhatsAppCheckout
              businessId={business.id}
              businessName={business.name}
              whatsapp={whatsapp}
              cart={cart}
              setCart={setCart}
            />
          ) : null}
          {storeCustomizationStyles}
          {storeAiAssistant}
        </main>
      </>
    );
  }

  if (theme.layout === "beauty-shop") {
    return (
      <>
        <main className="market-villa-customized-store store-page-slim min-h-screen bg-[#fff7fb] pt-24 text-[#2c1020] md:pt-28">
          <section className="px-4 py-4 md:px-5">
            <div className="mx-auto overflow-hidden rounded-[1.25rem] border border-[#f5c8d7] bg-white shadow-[0_24px_80px_rgba(59,16,32,0.16)] md:max-w-7xl">
              <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#f5c8d7] px-5 py-4">
                <Link href="/" className="flex items-center gap-3">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt={`${business.name} logo`}
                      className="h-11 w-11 rounded-full object-cover ring-1 ring-[#f5c8d7]"
                    />
                  ) : (
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-[#3b1020] text-sm font-bold text-white">
                      {business.name.slice(0, 1)}
                    </span>
                  )}

                  <span>
                    <span className="block text-sm font-semibold">
                      {business.name}
                    </span>
                    <span className="block text-xs text-[#8d6574]">
                      {business.category || "Beauty Store"}
                    </span>
                  </span>
                </Link>

                <nav className="hidden items-center gap-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8d6574] lg:flex">
                  {hasSection("collections") ? (
                    <a href="#collections" className="transition hover:text-[#3b1020]">
                      Collections
                    </a>
                  ) : null}
                  {hasSection("best-sellers") ? (
                    <a href="#best-sellers" className="transition hover:text-[#3b1020]">
                      Best Sellers
                    </a>
                  ) : null}
                  {hasSection("routine") ? (
                    <a href="#routine" className="transition hover:text-[#3b1020]">
                      Routine
                    </a>
                  ) : null}
                  {hasSection("bundles") ? (
                    <a href="#bundles" className="transition hover:text-[#3b1020]">
                      Bundles
                    </a>
                  ) : null}
                  {hasSection("products") ? (
                    <a href="#products" className="transition hover:text-[#3b1020]">
                      Products
                    </a>
                  ) : null}
                </nav>

                <button
                  type="button"
                  onClick={handleShareStore}
                  className="inline-flex items-center gap-2 rounded-full bg-[#fff1f6] px-4 py-2 text-xs font-semibold text-[#3b1020] ring-1 ring-[#f5c8d7]"
                >
                  <Share2 size={15} />
                  Share
                </button>
              </header>

              <div className="grid gap-6 p-5 md:grid-cols-[0.9fr_1.1fr] md:items-stretch md:p-7 lg:p-9">
                <div className="flex flex-col justify-between gap-8">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#be496b]">
                      Beauty Shop
                    </p>
                    <h1 className="mt-4 max-w-2xl text-5xl font-semibold leading-[0.95] tracking-[-0.06em] text-[#3b1020] md:text-7xl">
                      {business.name}
                    </h1>

                    {business.tagline ? (
                      <p className="mt-5 max-w-xl text-lg leading-8 text-[#6f4658]">
                        {business.tagline}
                      </p>
                    ) : null}

                    <p className="mt-4 max-w-xl text-sm leading-7 text-[#8d6574]">
                      {business.description ||
                        "Shop beauty products, routines, bundles, and customer favorites in one clean storefront."}
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <a
                      href={
                        hasSection("products")
                          ? "#products"
                          : hasSection("best-sellers")
                            ? "#best-sellers"
                            : hasSection("collections")
                              ? "#collections"
                              : primaryCtaHref
                      }
                      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#3b1020] px-5 text-sm font-semibold text-white transition hover:bg-[#5a1830]"
                    >
                      <ShoppingBag size={17} />
                      Shop Products
                    </a>

                    {whatsapp ? (
                      <a
                        href={buildWhatsAppLink(
                          whatsapp,
                          `Hello ${business.name}, I want to order beauty products.`
                        )}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => handleWhatsAppClick("beauty_shop_whatsapp_order")}
                        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#fff1f6] px-5 text-sm font-semibold text-[#3b1020] ring-1 ring-[#f5c8d7]"
                      >
                        <MessageCircle size={17} />
                        WhatsApp
                      </a>
                    ) : null}
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-[1fr_0.55fr]">
                  <div
                    className="min-h-72 rounded-[1.25rem] bg-cover bg-center md:min-h-[28rem]"
                    style={{ backgroundImage: `url(${coverImage})` }}
                  />

                  <div className="grid gap-3">
                    <div className="rounded-[1.25rem] bg-[#3b1020] p-4 text-white">
                      <p className="text-3xl font-semibold">
                        {visibleProducts.length}
                      </p>
                      <p className="mt-1 text-xs text-white/60">
                        Beauty products
                      </p>
                    </div>
                    <div className="rounded-[1.25rem] bg-[#fff1f6] p-4">
                      <p className="text-3xl font-semibold">
                        {beautyCategories.length}
                      </p>
                      <p className="mt-1 text-xs text-[#8d6574]">
                        Collections
                      </p>
                    </div>
                    <div className="rounded-[1.25rem] bg-[#f8b4c8] p-4 text-[#3b1020]">
                      <p className="text-3xl font-semibold">WA</p>
                      <p className="mt-1 text-xs opacity-70">Orders</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {hasSection("collections") ? (
            <section id="collections" className="px-4 py-4 md:px-5">
              <div className="mx-auto grid gap-3 md:max-w-7xl md:grid-cols-5">
                {beautyCategories.map((category, index) => (
                  <a
                    key={category}
                    href={hasSection("products") ? "#products" : "#contact"}
                    className={`rounded-[1.25rem] border p-5 shadow-sm transition hover:-translate-y-0.5 ${
                      index === 0
                        ? "border-[#3b1020] bg-[#3b1020] text-white"
                        : "border-[#f5c8d7] bg-white text-[#3b1020]"
                    }`}
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-60">
                      Collection
                    </p>
                    <h2 className="mt-3 text-lg font-semibold">{category}</h2>
                  </a>
                ))}
              </div>
            </section>
          ) : null}

          {hasSection("best-sellers") ? (
            <section id="best-sellers" className="px-4 py-4 md:px-5">
              <div className="mx-auto md:max-w-7xl">
                <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#be496b]">
                      Best Sellers
                    </p>
                    <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">
                      Customer favorites up front.
                    </h2>
                  </div>
                  <p className="max-w-sm text-sm leading-6 text-[#8d6574]">
                    Use featured products to highlight the items customers ask
                    about most.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {(beautyBestSellers.length ? beautyBestSellers : visibleProducts)
                    .slice(0, 4)
                    .map((product) => (
                      <article
                        key={product.id}
                        className="overflow-hidden rounded-[1.25rem] bg-white shadow-sm"
                      >
                        <div
                          className="h-56 bg-cover bg-center"
                          style={{
                            backgroundImage: `url(${
                              product.image_url || fallbackProductImage
                            })`,
                          }}
                        />
                        <div className="p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#be496b]">
                            {product.category || "Beauty"}
                          </p>
                          <h3 className="mt-2 text-sm font-semibold">
                            {product.name}
                          </h3>
                          <p className="mt-2 text-sm font-bold">
                            {formatCurrency(Number(product.price || 0))}
                          </p>
                        </div>
                      </article>
                    ))}
                </div>
              </div>
            </section>
          ) : null}

          {hasSection("routine") ? (
            <section id="routine" className="px-4 py-4 md:px-5">
              <div className="mx-auto grid gap-4 rounded-[1.25rem] bg-[#3b1020] p-5 text-white md:max-w-7xl md:grid-cols-[0.8fr_1fr] md:p-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#ffd7e3]">
                    Routine / How to Use
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">
                    Help customers choose the right product.
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-white/65">
                    This section works for skincare steps, hair-care routines,
                    fragrance layering, product use notes, or bundle guidance.
                  </p>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  {["Cleanse", "Treat", "Glow"].map((step, index) => (
                    <div
                      key={step}
                      className="rounded-[1rem] bg-white/10 p-4 ring-1 ring-white/12"
                    >
                      <p className="text-3xl font-semibold">
                        {String(index + 1).padStart(2, "0")}
                      </p>
                      <h3 className="mt-4 text-sm font-semibold">{step}</h3>
                      <p className="mt-2 text-xs leading-5 text-white/60">
                        Add simple usage guidance for products in this routine.
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ) : null}

          {hasSection("bundles") ? (
            <section id="bundles" className="px-4 py-4 md:px-5">
              <div className="mx-auto md:max-w-7xl">
                <div className="mb-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#be496b]">
                    Bundles
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">
                    Kits, sets, and product combos.
                  </h2>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  {visibleBundleItems.map((product) => (
                    <article
                      key={product.id}
                      className="rounded-[1.25rem] border border-[#f5c8d7] bg-white p-4 shadow-sm"
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#be496b]">
                        {product.category || "Bundle"}
                      </p>
                      <h3 className="mt-2 text-lg font-semibold">
                        {product.name}
                      </h3>
                      {product.description ? (
                        <p className="mt-2 text-sm leading-6 text-[#8d6574]">
                          {product.description}
                        </p>
                      ) : null}
                      <div className="mt-4 flex items-center justify-between gap-3">
                        <span className="text-sm font-bold">
                          {formatCurrency(Number(product.price || 0))}
                        </span>
                        <button
                          type="button"
                          onClick={() => addToCart(product)}
                          className="rounded-full bg-[#3b1020] px-4 py-2 text-xs font-semibold text-white"
                        >
                          Add
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          ) : null}

          {hasSection("products") ? (
            <section id="products" className="px-4 py-5 md:px-5">
              <div className="mx-auto md:max-w-7xl">
                <div className="mb-5 grid gap-4 rounded-[1.25rem] bg-white p-4 shadow-sm md:grid-cols-[1fr_auto] md:items-center">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#be496b]">
                      Products
                    </p>
                    <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em]">
                      Shop Beauty
                    </h2>
                  </div>

                  <div className="relative md:w-80">
                    <Search
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#c89bab]"
                      size={17}
                    />
                    <input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Search beauty products"
                      className="min-h-11 w-full rounded-full border border-[#f5c8d7] bg-[#fff7fb] px-11 text-sm text-[#2c1020] outline-none focus:border-[#be496b]"
                    />
                  </div>
                </div>

                {visibleProducts.length ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {visibleProducts.map((product) => (
                      <article
                        key={product.id}
                        className="overflow-hidden rounded-[1.25rem] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-soft"
                      >
                        <div
                          className="h-56 bg-cover bg-center"
                          style={{
                            backgroundImage: `url(${
                              product.image_url || fallbackProductImage
                            })`,
                          }}
                        />
                        <div className="p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#be496b]">
                            {product.category || "Beauty"}
                          </p>
                          <h3 className="mt-2 text-base font-semibold">
                            {product.name}
                          </h3>
                          {product.description ? (
                            <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#8d6574]">
                              {product.description}
                            </p>
                          ) : null}
                          <div className="mt-4 flex items-center justify-between gap-3">
                            <span className="text-sm font-bold">
                              {formatCurrency(Number(product.price || 0))}
                            </span>
                            <button
                              type="button"
                              onClick={() => addToCart(product)}
                              className="rounded-full bg-[#3b1020] px-4 py-2 text-xs font-semibold text-white"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-[1.25rem] bg-white p-8 text-center shadow-sm">
                    <p className="text-sm text-[#8d6574]">
                      No beauty products are available right now.
                    </p>
                  </div>
                )}
              </div>
            </section>
          ) : null}

          {hasSection("contact") ? (
            <footer id="contact" className="px-4 pb-8 pt-4 md:px-5">
              <div className="mx-auto rounded-[1.25rem] bg-[#3b1020] p-5 text-white shadow-sm md:max-w-7xl">
                <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
                  <div>
                    <h2 className="text-xl font-semibold">{business.name}</h2>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-white/65">
                      {business.tagline ||
                        "Contact this beauty store directly for orders, product questions, and availability."}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {whatsapp ? (
                      <a
                        href={buildWhatsAppLink(
                          whatsapp,
                          `Hello ${business.name}, I want to order beauty products.`
                        )}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => handleWhatsAppClick("beauty_shop_whatsapp_order")}
                        className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#3b1020]"
                      >
                        <Phone size={16} />
                        WhatsApp
                      </a>
                    ) : null}

                    <button
                      type="button"
                      onClick={handleCopyStoreLink}
                      className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/15"
                    >
                      <Copy size={16} />
                      {copiedStoreLink ? "Copied" : "Copy link"}
                    </button>
                  </div>
                </div>
              </div>
            </footer>
          ) : null}

          {hasSection("products") || hasSection("bundles") ? (
            <WhatsAppCheckout
              businessId={business.id}
              businessName={business.name}
              whatsapp={whatsapp}
              cart={cart}
              setCart={setCart}
            />
          ) : null}
          {storeCustomizationStyles}
          {storeAiAssistant}
        </main>
      </>
    );
  }

  if (theme.layout === "daily-menu") {
    return (
      <>
        <main className="market-villa-customized-store store-page-slim min-h-screen bg-[#fff8f0] pt-24 text-[#221207] md:pt-28">
          <section className="px-4 py-4 md:px-5">
            <div className="mx-auto overflow-hidden rounded-[1.25rem] bg-[#2b1206] text-white shadow-[0_24px_80px_rgba(43,18,6,0.2)] md:max-w-7xl">
              <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
                <Link href="/" className="flex items-center gap-3">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt={`${business.name} logo`}
                      className="h-11 w-11 rounded-2xl bg-white object-cover"
                    />
                  ) : (
                    <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#fbbf24] text-sm font-bold text-[#2b1206]">
                      {business.name.slice(0, 1)}
                    </span>
                  )}

                  <span>
                    <span className="block text-sm font-semibold">
                      {business.name}
                    </span>
                    <span className="block text-xs text-white/55">
                      {business.category || "Food Vendor"}
                    </span>
                  </span>
                </Link>

                <nav className="hidden items-center gap-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55 lg:flex">
                  {hasSection("menu") ? (
                    <a href="#menu" className="transition hover:text-white">
                      Menu
                    </a>
                  ) : null}
                  {hasSection("packages") ? (
                    <a href="#packages" className="transition hover:text-white">
                      Packages
                    </a>
                  ) : null}
                  {hasSection("delivery") ? (
                    <a href="#delivery" className="transition hover:text-white">
                      Delivery
                    </a>
                  ) : null}
                  {hasSection("products") ? (
                    <a href="#products" className="transition hover:text-white">
                      Order
                    </a>
                  ) : null}
                  {hasSection("contact") ? (
                    <a href="#contact" className="transition hover:text-white">
                      Contact
                    </a>
                  ) : null}
                </nav>

                <button
                  type="button"
                  onClick={handleShareStore}
                  className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white ring-1 ring-white/15 transition hover:bg-white hover:text-[#2b1206]"
                >
                  <Share2 size={15} />
                  Share
                </button>
              </header>

              <div className="grid gap-6 p-5 md:grid-cols-[1fr_0.9fr] md:items-stretch md:p-7 lg:p-9">
                <div className="flex flex-col justify-between gap-8">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.24em] text-white drop-shadow-[0_3px_10px_rgba(0,0,0,0.75)]">
                      Daily Menu
                    </p>
                    <h1 className="mt-4 max-w-2xl text-5xl font-semibold leading-[0.95] tracking-[-0.06em] text-white drop-shadow-[0_5px_18px_rgba(0,0,0,0.85)] md:text-7xl">
                      {business.name}
                    </h1>

                    {business.tagline ? (
                      <p className="mt-5 max-w-xl text-lg font-medium leading-8 text-white drop-shadow-[0_4px_14px_rgba(0,0,0,0.75)]">
                        {business.tagline}
                      </p>
                    ) : null}

                    <p className="mt-4 max-w-xl text-sm font-medium leading-7 text-white/90 drop-shadow-[0_4px_12px_rgba(0,0,0,0.65)]">
                      {business.description ||
                        "Browse today's meals, trays, packs, drinks, and delivery notes before placing a WhatsApp order."}
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <a
                      href={
                        hasSection("products")
                          ? "#products"
                          : hasSection("menu")
                            ? "#menu"
                            : primaryCtaHref
                      }
                      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#fbbf24] px-5 text-sm font-semibold text-[#2b1206] transition hover:bg-[#fed7aa]"
                    >
                      <ShoppingBag size={17} />
                      Order Food
                    </a>

                    {whatsapp ? (
                      <a
                        href={buildWhatsAppLink(
                          whatsapp,
                          `Hello ${business.name}, I want to place a food order.`
                        )}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => handleWhatsAppClick("daily_menu_whatsapp_order")}
                        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-[#2b1206]"
                      >
                        <MessageCircle size={17} />
                        WhatsApp
                      </a>
                    ) : null}
                  </div>
                </div>

                <div className="grid gap-3 rounded-[1.25rem] bg-white p-3 text-[#221207]">
                  <div
                    className="min-h-60 rounded-[1rem] bg-cover bg-center md:min-h-[22rem]"
                    style={{ backgroundImage: `url(${coverImage})` }}
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-2xl bg-[#fff3e4] p-3">
                      <p className="text-2xl font-semibold">
                        {visibleProducts.length}
                      </p>
                      <p className="mt-1 text-xs text-[#8a5a35]">Items</p>
                    </div>
                    <div className="rounded-2xl bg-[#2b1206] p-3 text-white">
                      <p className="text-2xl font-semibold">
                        {foodCategories.length}
                      </p>
                      <p className="mt-1 text-xs text-white/60">Groups</p>
                    </div>
                    <div className="rounded-2xl bg-[#fbbf24] p-3 text-[#2b1206]">
                      <p className="text-2xl font-semibold">WA</p>
                      <p className="mt-1 text-xs opacity-70">Orders</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {hasSection("menu") ? (
            <section id="menu" className="px-4 py-4 md:px-5">
              <div className="mx-auto grid gap-4 md:max-w-7xl lg:grid-cols-[0.75fr_1fr]">
                <div className="rounded-[1.25rem] bg-white p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#c2410c]">
                    Menu Groups
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">
                    Fast scan for hungry customers.
                  </h2>
                  <div className="mt-5 grid gap-2">
                    {foodCategories.map((category, index) => (
                      <a
                        key={category}
                        href={hasSection("products") ? "#products" : "#contact"}
                        className="flex items-center justify-between rounded-2xl bg-[#fff3e4] px-4 py-3 text-sm font-semibold text-[#2b1206]"
                      >
                        <span>{category}</span>
                        <span className="text-xs text-[#8a5a35]">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  {(featuredMenuItems.length ? featuredMenuItems : visibleProducts)
                    .slice(0, 3)
                    .map((product) => (
                      <article
                        key={product.id}
                        className="overflow-hidden rounded-[1.25rem] bg-white shadow-sm"
                      >
                        <div
                          className="h-44 bg-cover bg-center"
                          style={{
                            backgroundImage: `url(${
                              product.image_url || fallbackProductImage
                            })`,
                          }}
                        />
                        <div className="p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#c2410c]">
                            {product.category || "Menu"}
                          </p>
                          <h3 className="mt-2 text-sm font-semibold">
                            {product.name}
                          </h3>
                          <p className="mt-2 text-sm font-bold">
                            {formatCurrency(Number(product.price || 0))}
                          </p>
                        </div>
                      </article>
                    ))}
                </div>
              </div>
            </section>
          ) : null}

          {hasSection("packages") ? (
            <section id="packages" className="px-4 py-4 md:px-5">
              <div className="mx-auto rounded-[1.25rem] bg-[#2b1206] p-5 text-white md:max-w-7xl md:p-6">
                <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#fed7aa]">
                      Trays & Packages
                    </p>
                    <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">
                      Built for office orders, parties, and weekend trays.
                    </h2>
                  </div>
                  <p className="max-w-sm text-sm leading-6 text-white/60">
                    Highlight bundles customers can order quickly without
                    scrolling through the full menu.
                  </p>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  {visiblePackageItems.map((product) => (
                    <article
                      key={product.id}
                      className="rounded-[1rem] bg-white p-4 text-[#221207]"
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#c2410c]">
                        {product.category || "Package"}
                      </p>
                      <h3 className="mt-2 text-lg font-semibold">
                        {product.name}
                      </h3>
                      {product.description ? (
                        <p className="mt-2 text-sm leading-6 text-[#8a5a35]">
                          {product.description}
                        </p>
                      ) : null}
                      <div className="mt-4 flex items-center justify-between gap-3">
                        <span className="text-sm font-bold">
                          {formatCurrency(Number(product.price || 0))}
                        </span>
                        <button
                          type="button"
                          onClick={() => addToCart(product)}
                          className="rounded-full bg-[#2b1206] px-4 py-2 text-xs font-semibold text-white"
                        >
                          Add
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          ) : null}

          {hasSection("delivery") ? (
            <section id="delivery" className="px-4 py-4 md:px-5">
              <div className="mx-auto grid gap-3 md:max-w-7xl md:grid-cols-3">
                {[
                  {
                    title: "Order window",
                    body:
                      business.opening_hours ||
                      "Confirm daily availability before placing an order.",
                  },
                  {
                    title: "Delivery area",
                    body:
                      business.location ||
                      "Share your address on WhatsApp for delivery confirmation.",
                  },
                  {
                    title: "Fresh prep",
                    body:
                      "Meals and trays can include preparation notes, pickup timing, and custom requests.",
                  },
                ].map((note) => (
                  <div
                    key={note.title}
                    className="rounded-[1.25rem] border border-[#f2d8bd] bg-white p-5 shadow-sm"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#c2410c]">
                      {note.title}
                    </p>
                    <p className="mt-3 text-sm leading-7 text-[#6b4227]">
                      {note.body}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {hasSection("products") ? (
            <section id="products" className="px-4 py-5 md:px-5">
              <div className="mx-auto md:max-w-7xl">
                <div className="mb-5 grid gap-4 rounded-[1.25rem] bg-white p-4 shadow-sm md:grid-cols-[1fr_auto] md:items-center">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#c2410c]">
                      Order Items
                    </p>
                    <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em]">
                      Full Menu
                    </h2>
                  </div>

                  <div className="relative md:w-80">
                    <Search
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b48a68]"
                      size={17}
                    />
                    <input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Search meals, trays, drinks"
                      className="min-h-11 w-full rounded-full border border-[#f2d8bd] bg-[#fff8f0] px-11 text-sm text-[#221207] outline-none focus:border-[#c2410c]"
                    />
                  </div>
                </div>

                {visibleProducts.length ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {visibleProducts.map((product) => (
                      <article
                        key={product.id}
                        className="overflow-hidden rounded-[1.25rem] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-soft"
                      >
                        <div
                          className="h-44 bg-cover bg-center"
                          style={{
                            backgroundImage: `url(${
                              product.image_url || fallbackProductImage
                            })`,
                          }}
                        />
                        <div className="p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#c2410c]">
                            {product.category || "Food"}
                          </p>
                          <h3 className="mt-2 text-base font-semibold">
                            {product.name}
                          </h3>
                          {product.description ? (
                            <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#8a5a35]">
                              {product.description}
                            </p>
                          ) : null}
                          <div className="mt-4 flex items-center justify-between gap-3">
                            <span className="text-sm font-bold">
                              {formatCurrency(Number(product.price || 0))}
                            </span>
                            <button
                              type="button"
                              onClick={() => addToCart(product)}
                              className="rounded-full bg-[#2b1206] px-4 py-2 text-xs font-semibold text-white"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-[1.25rem] bg-white p-8 text-center shadow-sm">
                    <p className="text-sm text-[#8a5a35]">
                      No menu items are available right now.
                    </p>
                  </div>
                )}
              </div>
            </section>
          ) : null}

          {hasSection("contact") ? (
            <footer id="contact" className="px-4 pb-8 pt-4 md:px-5">
              <div className="mx-auto rounded-[1.25rem] bg-white p-5 shadow-sm md:max-w-7xl">
                <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
                  <div>
                    <h2 className="text-xl font-semibold">{business.name}</h2>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-[#8a5a35]">
                      {business.tagline ||
                        "Contact this food business directly for availability, delivery, and orders."}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {whatsapp ? (
                      <a
                        href={buildWhatsAppLink(
                          whatsapp,
                          `Hello ${business.name}, I want to place an order.`
                        )}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => handleWhatsAppClick("daily_menu_whatsapp_order")}
                        className="inline-flex items-center gap-2 rounded-full bg-[#2b1206] px-4 py-2 text-sm font-semibold text-white"
                      >
                        <Phone size={16} />
                        WhatsApp
                      </a>
                    ) : null}

                    <button
                      type="button"
                      onClick={handleCopyStoreLink}
                      className="inline-flex items-center gap-2 rounded-full bg-[#fff3e4] px-4 py-2 text-sm font-semibold text-[#2b1206]"
                    >
                      <Copy size={16} />
                      {copiedStoreLink ? "Copied" : "Copy link"}
                    </button>
                  </div>
                </div>
              </div>
            </footer>
          ) : null}

          {hasSection("products") || hasSection("packages") ? (
            <WhatsAppCheckout
              businessId={business.id}
              businessName={business.name}
              whatsapp={whatsapp}
              cart={cart}
              setCart={setCart}
            />
          ) : null}
          {storeCustomizationStyles}
          {storeAiAssistant}
        </main>
      </>
    );
  }

  if (theme.layout === "mono-runway") {
    return (
      <>
        <main className="market-villa-customized-store store-page-slim min-h-screen bg-[#f4f5f7] pt-24 text-[#0c0e13] md:pt-28">
          <section className="px-4 py-4 md:px-5">
            <div className="mx-auto overflow-hidden rounded-[1.25rem] border border-[#d8dce2] bg-[#0c0e13] text-white shadow-[0_24px_80px_rgba(12,14,19,0.22)] md:max-w-7xl">
              <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
                <Link href="/" className="flex items-center gap-3">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt={`${business.name} logo`}
                      className="h-10 w-10 rounded-full object-cover ring-1 ring-white/20"
                    />
                  ) : (
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-sm font-semibold text-[#0c0e13]">
                      {business.name.slice(0, 1)}
                    </span>
                  )}

                  <span className="text-sm font-semibold tracking-[0.18em]">
                    {business.name}
                  </span>
                </Link>

                <nav className="hidden items-center gap-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55 lg:flex">
                  {hasSection("collections") ? (
                    <a href="#collections" className="transition hover:text-white">
                      Collections
                    </a>
                  ) : null}
                  {hasSection("lookbook") ? (
                    <a href="#lookbook" className="transition hover:text-white">
                      Lookbook
                    </a>
                  ) : null}
                  {hasSection("products") ? (
                    <a href="#products" className="transition hover:text-white">
                      Shop
                    </a>
                  ) : null}
                  {hasSection("custom-order") ? (
                    <a href="#custom-order" className="transition hover:text-white">
                      Custom Order
                    </a>
                  ) : null}
                  {hasSection("contact") ? (
                    <a href="#contact" className="transition hover:text-white">
                      Contact
                    </a>
                  ) : null}
                </nav>

                <button
                  type="button"
                  onClick={handleShareStore}
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-white/80 transition hover:bg-white hover:text-[#0c0e13]"
                >
                  <Share2 size={15} />
                  Share
                </button>
              </header>

              <div className="grid gap-8 p-5 md:grid-cols-[0.95fr_1.05fr] md:p-7 lg:p-9">
                <div className="flex min-h-[28rem] flex-col justify-between gap-10">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/45">
                      {business.category || "Fashion Storefront"}
                    </p>

                    <h1 className="mt-5 max-w-2xl text-5xl font-semibold leading-[0.95] tracking-[-0.06em] md:text-7xl">
                      {business.name}
                    </h1>

                    {business.tagline ? (
                      <p className="mt-5 max-w-xl text-lg leading-8 text-white/72">
                        {business.tagline}
                      </p>
                    ) : null}

                    <p className="mt-4 max-w-xl text-sm leading-7 text-white/55">
                      {business.description ||
                        "A sharp product page for drops, capsule collections, measurements, and WhatsApp orders."}
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <a
                      href={primaryCtaHref}
                      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-[#0c0e13] transition hover:bg-[#eef0f3]"
                    >
                      <ShoppingBag size={17} />
                      {hasSection("products") ? "View Collection" : "Explore Store"}
                    </a>

                    {whatsapp && hasSection("custom-order") ? (
                      <a
                        href={buildWhatsAppLink(
                          whatsapp,
                          `Hello ${business.name}, I want to make a fashion order.`
                        )}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => handleWhatsAppClick("mono_runway_custom_order")}
                        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/18 px-5 text-sm font-semibold text-white transition hover:bg-white hover:text-[#0c0e13]"
                      >
                        <MessageCircle size={17} />
                        Custom Order
                      </a>
                    ) : null}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-[1fr_0.52fr]">
                  <div
                    className="min-h-[28rem] rounded-[1rem] bg-cover bg-center"
                    style={{ backgroundImage: `url(${coverImage})` }}
                  />

                  <div className="grid gap-4">
                    {(runwayProducts.length ? runwayProducts : visibleProducts)
                      .slice(0, 2)
                      .map((product) => (
                        <article
                          key={product.id}
                          className="rounded-[1rem] border border-white/10 bg-white/8 p-3"
                        >
                          <div
                            className="h-32 rounded-xl bg-cover bg-center"
                            style={{
                              backgroundImage: `url(${
                                product.image_url || fallbackProductImage
                              })`,
                            }}
                          />
                          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
                            {product.category || "Piece"}
                          </p>
                          <h2 className="mt-1 text-sm font-semibold">
                            {product.name}
                          </h2>
                          <p className="mt-1 text-xs text-white/55">
                            {formatCurrency(Number(product.price || 0))}
                          </p>
                        </article>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {hasSection("collections") ? (
            <section id="collections" className="px-4 py-4 md:px-5">
              <div className="mx-auto grid gap-3 md:max-w-7xl md:grid-cols-4">
                {monoCategories.map((category, index) => (
                  <a
                    key={category}
                    href={hasSection("products") ? "#products" : primaryCtaHref}
                    className={`rounded-[1rem] border border-[#d8dce2] p-5 shadow-sm transition hover:-translate-y-0.5 ${
                      index === 0
                        ? "bg-[#0c0e13] text-white"
                        : "bg-white text-[#0c0e13]"
                    }`}
                  >
                    <p className="text-3xl font-semibold">
                      {String(index + 1).padStart(2, "0")}
                    </p>
                    <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] opacity-55">
                      Collection
                    </p>
                    <h2 className="mt-2 text-lg font-semibold">{category}</h2>
                  </a>
                ))}
              </div>
            </section>
          ) : null}

          {hasSection("lookbook") ? (
          <section id="lookbook" className="px-4 py-4 md:px-5">
            <div className="mx-auto grid gap-5 md:max-w-7xl md:grid-cols-[0.55fr_1fr] md:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6e7682]">
                  Lookbook
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em] md:text-5xl">
                  Styled pieces, ready to order.
                </h2>
                <p className="mt-4 text-sm leading-7 text-[#6e7682]">
                  Use the lookbook area to frame best sellers, new arrivals, and
                  outfits customers can request directly on WhatsApp.
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                {(lookbookProducts.length ? lookbookProducts : visibleProducts)
                  .slice(0, 3)
                  .map((product) => (
                    <article
                      key={product.id}
                      className="overflow-hidden rounded-[1rem] bg-white shadow-sm"
                    >
                      <div
                        className="h-64 bg-cover bg-center"
                        style={{
                          backgroundImage: `url(${
                            product.image_url || fallbackProductImage
                          })`,
                        }}
                      />
                      <div className="p-4">
                        <h3 className="text-sm font-semibold">{product.name}</h3>
                        <p className="mt-1 text-xs text-[#6e7682]">
                          {product.category || "Lookbook"}
                        </p>
                      </div>
                    </article>
                  ))}
              </div>
            </div>
          </section>
          ) : null}

          {hasSection("products") ? (
          <section id="products" className="px-4 py-5 md:px-5">
            <div className="mx-auto md:max-w-7xl">
              <div className="mb-5 grid gap-4 rounded-[1rem] border border-[#d8dce2] bg-white p-4 shadow-sm md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6e7682]">
                    Shop
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em]">
                    Available Pieces
                  </h2>
                </div>

                <div className="relative md:w-80">
                  <Search
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8a929e]"
                    size={17}
                  />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search collection"
                    className="min-h-11 w-full rounded-full border border-[#d8dce2] bg-[#f4f5f7] px-11 text-sm text-[#0c0e13] outline-none focus:border-[#0c0e13]"
                  />
                </div>
              </div>

              {visibleProducts.length ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {visibleProducts.map((product) => (
                    <article
                      key={product.id}
                      className="overflow-hidden rounded-[1rem] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-soft"
                    >
                      <div
                        className="h-56 bg-cover bg-center"
                        style={{
                          backgroundImage: `url(${
                            product.image_url || fallbackProductImage
                          })`,
                        }}
                      />

                      <div className="p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8a929e]">
                          {product.category || "Piece"}
                        </p>
                        <h3 className="mt-2 text-base font-semibold">
                          {product.name}
                        </h3>
                        {product.description ? (
                          <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#6e7682]">
                            {product.description}
                          </p>
                        ) : null}

                        <div className="mt-4 flex items-center justify-between gap-3">
                          <span className="text-sm font-bold">
                            {formatCurrency(Number(product.price || 0))}
                          </span>
                          <button
                            type="button"
                            onClick={() => addToCart(product)}
                            className="rounded-full bg-[#0c0e13] px-4 py-2 text-xs font-semibold text-white"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="rounded-[1rem] border border-[#d8dce2] bg-white p-8 text-center shadow-sm">
                  <p className="text-sm text-[#6e7682]">
                    No products are available right now.
                  </p>
                </div>
              )}
            </div>
          </section>
          ) : null}

          {hasSection("custom-order") ? (
          <section id="custom-order" className="px-4 py-5 md:px-5">
            <div className="mx-auto grid gap-4 rounded-[1rem] bg-[#0c0e13] p-5 text-white md:max-w-7xl md:grid-cols-[1fr_0.7fr] md:items-center md:p-7">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/45">
                  Custom Order
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">
                  Ask for sizing, fabric, styling, or availability.
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-white/60">
                  This section gives fashion businesses a premium contact path
                  for measurements, bespoke pieces, delivery notes, and order
                  questions.
                </p>
              </div>

              {whatsapp ? (
                <a
                  href={buildWhatsAppLink(
                    whatsapp,
                    `Hello ${business.name}, I want to place a custom fashion order.`
                  )}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => handleWhatsAppClick("mono_runway_custom_order")}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-[#0c0e13]"
                >
                  <MessageCircle size={17} />
                  Chat on WhatsApp
                </a>
              ) : null}
            </div>
          </section>
          ) : null}

          {hasSection("contact") ? (
          <footer id="contact" className="px-4 pb-8 pt-4 md:px-5">
            <div className="mx-auto grid gap-5 border-t border-[#d8dce2] pt-5 md:max-w-7xl md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <h2 className="text-lg font-semibold">{business.name}</h2>
                <p className="mt-2 text-sm text-[#6e7682]">
                  {business.location || business.tagline || "Market Villa storefront"}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {whatsapp ? (
                  <a
                    href={buildWhatsAppLink(
                      whatsapp,
                      `Hello ${business.name}, I need more information.`
                    )}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => handleWhatsAppClick("store_whatsapp_link")}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#0c0e13] ring-1 ring-[#d8dce2]"
                  >
                    <Phone size={16} />
                    {whatsapp}
                  </a>
                ) : null}

                <button
                  type="button"
                  onClick={handleCopyStoreLink}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#0c0e13] ring-1 ring-[#d8dce2]"
                >
                  <Copy size={16} />
                  {copiedStoreLink ? "Copied" : "Copy link"}
                </button>
              </div>
            </div>
          </footer>
          ) : null}

          {hasSection("products") ? (
            <WhatsAppCheckout
              businessId={business.id}
              businessName={business.name}
              whatsapp={whatsapp}
              cart={cart}
              setCart={setCart}
            />
          ) : null}
          {storeCustomizationStyles}
          {storeAiAssistant}
        </main>
      </>
    );
  }

  if (theme.layout === "simple-one-page") {
    return (
      <>
        <main className={`store-page-slim min-h-screen  ${theme.page}`}>
          <section className="px-5 py-6 md:px-5">
            <div className="mx-auto grid max-w-5xl gap-6">
              <div className="grid gap-5 rounded-[1.5rem] bg-white p-5 shadow-sm md:grid-cols-[1fr_0.9fr] md:items-center md:p-6">
                <div>
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt={`${business.name} logo`}
                      className="mb-5 h-14 w-14 rounded-2xl object-cover"
                    />
                  ) : null}

                  <p className={`mb-3 text-xs font-semibold uppercase tracking-[0.2em] ${theme.sectionLabel}`}>
                    {business.category || "Business"}
                  </p>

                  <h1 className="max-w-2xl text-4xl font-semibold leading-tight tracking-[-0.05em] text-[#211331] md:text-5xl">
                    {business.name}
                  </h1>

                  {business.tagline ? (
                    <p className="mt-3 text-base font-medium leading-7 text-[#6f637d]">
                      {business.tagline}
                    </p>
                  ) : null}

                  <p className="mt-4 max-w-xl text-sm leading-7 text-[#6f637d]">
                    {business.description ||
                      "Browse products and contact the business directly."}
                  </p>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <a
                      href="#products"
                      className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold ${theme.button}`}
                    >
                      <ShoppingBag size={17} />
                      View Products
                    </a>

                    {whatsapp ? (
                      <a
                        href={buildWhatsAppLink(
                          whatsapp,
                          `Hello ${business.name}, I need more information.`
                        )}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => handleWhatsAppClick("store_whatsapp_link")}
                        className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold ${theme.secondaryButton}`}
                      >
                        <Phone size={17} />
                        Contact
                      </a>
                    ) : null}
                  </div>
                </div>

                <div className="overflow-hidden rounded-[1.25rem] border border-[#e6d9f2] bg-[#f7f2fb] p-3">
                  <div
                    className="aspect-[4/3] rounded-[1rem] bg-cover bg-center"
                    style={{ backgroundImage: `url(${coverImage})` }}
                  />
                </div>
              </div>

              {hasSection("products") ? (
              <section id="products">
                <div className="mb-4 flex items-end justify-between gap-4">
                  <div>
                    <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${theme.sectionLabel}`}>
                      Products
                    </p>
                    <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-[#211331]">
                      Product preview
                    </h2>
                  </div>

                  <p className="text-sm text-[#6f637d]">
                    {visibleProducts.length} item
                    {visibleProducts.length === 1 ? "" : "s"}
                  </p>
                </div>

                {visibleProducts.length ? (
                  <div className="grid gap-4 md:grid-cols-3">
                    {visibleProducts.map((product) => (
                      <article
                        key={product.id}
                        className={`${theme.productCard} overflow-hidden border border-[#e6d9f2]`}
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
                          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#8b7b99]">
                            {product.category || "Product"}
                          </p>

                          <h3 className="text-sm font-semibold text-[#211331]">
                            {product.name}
                          </h3>

                          {product.description ? (
                            <p className="mt-2 text-sm leading-6 text-[#6f637d]">
                              {product.description}
                            </p>
                          ) : null}

                          <div className="mt-4 flex items-center justify-between gap-3">
                            <span className="text-sm font-bold text-[#211331]">
                              {formatCurrency(Number(product.price || 0))}
                            </span>

                            <button
                              onClick={() => addToCart(product)}
                              className="rounded-full bg-[#211331] px-4 py-2 text-xs font-semibold text-white"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className={`${theme.card} rounded-[1.25rem] p-6 text-center shadow-sm`}>
                    <p className="text-sm text-[#6f637d]">
                      No products are available right now.
                    </p>
                  </div>
                )}
              </section>
              ) : null}

              {hasSection("contact") ? (
              <footer className="rounded-[1.5rem] bg-[#211331] p-5 text-white shadow-sm">
                <div className="grid gap-5 md:grid-cols-[1fr_1fr] md:items-start">
                  <div>
                    <h3 className="text-base font-semibold">{business.name}</h3>
                    <p className="mt-2 max-w-lg text-sm leading-6 text-white/70">
                      {business.tagline ||
                        "Contact this business directly for orders and inquiries."}
                    </p>
                  </div>

                  <div className="grid gap-2 text-sm">
                    {whatsapp ? (
                      <a
                        href={buildWhatsAppLink(
                          whatsapp,
                          `Hello ${business.name}, I need more information.`
                        )}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => handleWhatsAppClick("store_whatsapp_link")}
                        className="store-dark-chip flex items-center gap-3 rounded-2xl p-3 ring-1 ring-white/10"
                      >
                        <Phone size={16} />
                        {whatsapp}
                      </a>
                    ) : null}

                    {business.location ? (
                      <div className="store-dark-chip flex items-center gap-3 rounded-2xl p-3 ring-1 ring-white/10">
                        <MapPin size={16} />
                        {business.location}
                      </div>
                    ) : null}

                    {business.opening_hours ? (
                      <div className="store-dark-chip flex items-center gap-3 rounded-2xl p-3 ring-1 ring-white/10">
                        <Clock size={16} />
                        {business.opening_hours}
                      </div>
                    ) : null}
                  </div>
                </div>
              </footer>
              ) : null}
            </div>
          </section>

          {hasSection("products") ? (
            <WhatsAppCheckout
              businessId={business.id}
              businessName={business.name}
              whatsapp={whatsapp}
              cart={cart}
              setCart={setCart}
            />
          ) : null}
          {storeCustomizationStyles}
          {storeAiAssistant}
        </main>
      </>
    );
  }

  return (
    <>
      <main className={`store-page-slim min-h-screen  ${theme.page}`}>
      <section
        className={`store-pattern bg-gradient-to-br ${theme.hero} bg-cover bg-center px-5 py-8 md:px-5`}
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(36, 20, 54, 0.88), rgba(36, 20, 54, 0.58), rgba(6, 17, 15, 0.78)), url(${coverImage})`,
        }}
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
                onClick={() => handleWhatsAppClick("store_whatsapp_link")}
                className={`hidden rounded-full px-5 py-2.5 text-sm font-semibold md:inline-flex ${theme.button}`}
              >
                Contact Business
              </a>
            ) : null}
          </header>

          <div className="grid items-end gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={`${business.name} logo`}
                  className="mb-5 h-16 w-16 rounded-[1.25rem] bg-white object-cover shadow-soft"
                />
              ) : null}

              <p
                className={`mb-3 text-xs font-semibold uppercase tracking-[0.22em] ${theme.accentText}`}
              >
                {business.location || "Business"}
              </p>

              <h1 className="max-w-4xl text-2xl font-semibold leading-tight tracking-[-0.05em] text-white md:text-2xl">
                {business.name}
              </h1>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-white/80">
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
                  className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold ${theme.button}`}
                >
                  <ShoppingBag size={17} />
                  View Products
                </a>

              </div>
            </div>

            <div className="overflow-hidden rounded-[2rem] border border-white/18 bg-white/12 p-3 shadow-[0_28px_90px_rgba(0,0,0,0.32)] backdrop-blur-xl">
              <div
                className="h-80 rounded-[1.5rem] bg-cover bg-center md:h-[24rem]"
                style={{ backgroundImage: `url(${coverImage})` }}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-8 md:px-5">
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
                  className="min-h-10 w-full rounded-full border border-slate-200 bg-white px-11 text-sm text-slate-950 outline-none focus:border-[var(--mv-violet)]"
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

          {hasSection("feature-strip") && theme.storefrontSections?.length ? (
            <section
              className={`${theme.card} grid gap-3 rounded-[1.5rem] p-4 shadow-sm md:grid-cols-3`}
            >
              {theme.storefrontSections.map((section) => (
                <div
                  key={section}
                  className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3"
                >
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-950 text-white">
                    <Check size={16} />
                  </span>

                  <span className="text-sm font-semibold text-slate-800">
                    {section}
                  </span>
                </div>
              ))}
            </section>
          ) : null}

          {hasSection("products") ? (
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

                          <h3 className="text-sm font-semibold tracking-[-0.03em]">
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
                        className={`mt-4 flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold ${theme.button}`}
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
          ) : null}

          {hasSection("contact") ? (
          <footer className={`${theme.mutedCard} rounded-[1.5rem] p-5 shadow-sm`}>
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr_0.8fr]">
              <div>
                <h3 className="text-sm font-semibold tracking-[-0.03em]">
                  {business.name}
                </h3>

                <p className="mt-2 max-w-md text-sm leading-6 opacity-70">
                  {business.tagline ||
                    "Browse products and contact the business directly."}
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
                onClick={() => handleWhatsAppClick("store_whatsapp_link")}
                      className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-slate-950"
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
                      className="store-dark-chip inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold ring-1 ring-white/10"
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
                    <div className="store-dark-chip flex items-center gap-3 rounded-2xl p-3 ring-1 ring-white/10">
                      <Clock size={17} className="opacity-70" />
                      <span className="text-sm font-medium">
                        {business.opening_hours}
                      </span>
                    </div>
                  ) : null}

                  {business.location ? (
                    <div className="store-dark-chip flex items-center gap-3 rounded-2xl p-3 ring-1 ring-white/10">
                      <MapPin size={17} className="opacity-70" />
                      <span className="text-sm font-medium">
                        {business.location}
                      </span>
                    </div>
                  ) : null}

                  {business.phone ? (
                    <div className="store-dark-chip flex items-center gap-3 rounded-2xl p-3 ring-1 ring-white/10">
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
                  <div className="store-dark-chip flex items-center gap-3 rounded-2xl p-3 ring-1 ring-white/10">
                    <Store size={17} className="opacity-70" />
                    <span className="text-sm font-medium">
                      
                    </span>
                  </div>

                  <a
                    href="#products"
                    className="store-dark-chip flex items-center gap-3 rounded-2xl p-3 text-sm font-semibold ring-1 ring-white/10"
                  >
                    <ShoppingBag size={17} className="opacity-70" />
                    View Products
                  </a>

                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-white/10 pt-4">
              <p className="text-xs opacity-60">
                Â© {new Date().getFullYear()} {business.name}. Powered by Market
                Villa.
              </p>
            </div>
          </footer>
          ) : null}
        </div>
      </section>

      {hasSection("products") ? (
        <WhatsAppCheckout
          businessId={business.id}
          businessName={business.name}
          whatsapp={whatsapp}
          cart={cart}
          setCart={setCart}
        />
      ) : null}
        {storeCustomizationStyles}
          {storeAiAssistant}
      </main>
    </>
  );
}

