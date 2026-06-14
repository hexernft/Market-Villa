export type VisibilityPackageId =
  | "featured_store"
  | "category_boost"
  | "store_of_the_week"
  | "launch_promotion"
  | "verified_badge";

export type VisibilityPackage = {
  id: VisibilityPackageId;
  name: string;
  priceLabel: string;
  amount: number;
  amountInKobo: number;
  durationDays: number | null;
  description: string;
};

export const VISIBILITY_PACKAGES: Record<VisibilityPackageId, VisibilityPackage> = {
  featured_store: {
    id: "featured_store",
    name: "Featured Store",
    priceLabel: "₦5,000/week",
    amount: 5000,
    amountInKobo: 500000,
    durationDays: 7,
    description: "Appear inside the Featured Stores section on the stores page.",
  },
  category_boost: {
    id: "category_boost",
    name: "Category Boost",
    priceLabel: "₦7,500/week",
    amount: 7500,
    amountInKobo: 750000,
    durationDays: 7,
    description: "Get higher visibility inside your business category.",
  },
  store_of_the_week: {
    id: "store_of_the_week",
    name: "Store of the Week",
    priceLabel: "₦15,000/week",
    amount: 15000,
    amountInKobo: 1500000,
    durationDays: 7,
    description: "Get premium weekly placement as a highlighted store.",
  },
  launch_promotion: {
    id: "launch_promotion",
    name: "Launch Promotion",
    priceLabel: "₦20,000 one-time",
    amount: 20000,
    amountInKobo: 2000000,
    durationDays: 14,
    description: "Promote a newly launched store across Market Villa discovery areas.",
  },
  verified_badge: {
    id: "verified_badge",
    name: "Verified Badge",
    priceLabel: "₦10,000 one-time",
    amount: 10000,
    amountInKobo: 1000000,
    durationDays: null,
    description: "Build trust with a verified business badge on discovery pages.",
  },
};

export function getVisibilityPackage(packageId: string) {
  return VISIBILITY_PACKAGES[packageId as VisibilityPackageId] || null;
}

export function getVisibilityPackageList() {
  return Object.values(VISIBILITY_PACKAGES);
}