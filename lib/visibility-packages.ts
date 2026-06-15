export type VisibilityPackageId =
  | "featured_store"
  | "category_boost"
  | "store_of_the_week"
  | "new_store_boost"
  | "visibility_pack"
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
    name: "Homepage Featured",
    priceLabel: "â‚¦5,000/week",
    amount: 5000,
    amountInKobo: 500000,
    durationDays: 7,
    description: "Appear inside the Featured Stores section on the stores page.",
  },
  category_boost: {
    id: "category_boost",
    name: "Category Top Spot",
    priceLabel: "â‚¦3,000/week",
    amount: 3000,
    amountInKobo: 300000,
    durationDays: 7,
    description: "Get higher visibility inside your business category.",
  },
  store_of_the_week: {
    id: "store_of_the_week",
    name: "Store of the Week",
    priceLabel: "â‚¦10,000/week",
    amount: 10000,
    amountInKobo: 1000000,
    durationDays: 7,
    description: "Get premium weekly placement as a highlighted store.",
  },
  new_store_boost: {
    id: "new_store_boost",
    name: "New Store Boost",
    priceLabel: "â‚¦1,500/3 days",
    amount: 1500,
    amountInKobo: 150000,
    durationDays: 3,
    description: "Give a newly launched store a short discovery boost.",
  },
  visibility_pack: {
    id: "visibility_pack",
    name: "Visibility Pack",
    priceLabel: "â‚¦15,000/month",
    amount: 15000,
    amountInKobo: 1500000,
    durationDays: 30,
    description: "Includes featured visibility, category boost, verified badge, and launch promotion support.",
  },
  verified_badge: {
    id: "verified_badge",
    name: "Verified Badge",
    priceLabel: "â‚¦2,000/month",
    amount: 2000,
    amountInKobo: 200000,
    durationDays: 30,
    description: "Build trust with a verified business badge on discovery pages.",
  },
};

export function getVisibilityPackage(packageId: string) {
  return VISIBILITY_PACKAGES[packageId as VisibilityPackageId] || null;
}

export function getVisibilityPackageList() {
  return Object.values(VISIBILITY_PACKAGES);
}
