export type StorePageId = "home" | "products" | "about" | "contact";

type StorePageBusiness = {
  slug?: string | null;
  tagline?: string | null;
  description?: string | null;
  whatsapp?: string | null;
  phone?: string | null;
  email?: string | null;
  location?: string | null;
  opening_hours?: string | null;
  theme_settings?: {
    toggles?: {
      showHomeLink?: boolean;
      showProductsLink?: boolean;
      showAboutLink?: boolean;
      showContactLink?: boolean;
    } | null;
  } | null;
  products?: Array<{
    is_available?: boolean | null;
  }> | null;
};

export const storePages: Array<{ id: StorePageId; label: string }> = [
  { id: "home", label: "Home" },
  { id: "products", label: "Products" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
];

export function getStorePagePath(slug: string | null | undefined, pageId: StorePageId) {
  const safeSlug = slug || "";

  if (pageId === "home") {
    return `/store/${safeSlug}`;
  }

  return `/store/${safeSlug}/${pageId}`;
}

export function hasStorePageContent(
  business: StorePageBusiness,
  pageId: StorePageId,
) {
  if (pageId === "home") return true;

  if (pageId === "products") {
    return Boolean(
      business.products?.some((product) => product.is_available !== false),
    );
  }

  if (pageId === "about") {
    return Boolean(business.description || business.tagline);
  }

  return Boolean(
    business.whatsapp ||
      business.phone ||
      business.email ||
      business.location ||
      business.opening_hours,
  );
}

export function isStorePageEnabled(
  business: StorePageBusiness,
  pageId: StorePageId,
) {
  const toggles = business.theme_settings?.toggles || {};

  if (pageId === "home") {
    return true;
  }

  if (pageId === "products") {
    return toggles.showProductsLink !== false && hasStorePageContent(business, pageId);
  }

  if (pageId === "about") {
    return toggles.showAboutLink !== false && hasStorePageContent(business, pageId);
  }

  return toggles.showContactLink !== false && hasStorePageContent(business, pageId);
}

export function getEnabledStorePages(business: StorePageBusiness) {
  const toggles = business.theme_settings?.toggles || {};

  return storePages.filter((page) => {
    if (page.id === "home") {
      return toggles.showHomeLink !== false;
    }

    return isStorePageEnabled(business, page.id);
  });
}
