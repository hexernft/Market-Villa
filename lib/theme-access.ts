import { getPlanRank, normalizePlanId } from "@/lib/plans";
import type { BusinessTheme } from "@/lib/themes";

export type ThemeAccessLevel = "free" | "starter" | "growth" | "pro" | "custom";

export type ThemeAccessBusiness = {
  id: string;
  subscription_plan?: string | null;
  subscription_status?: string | null;
  subscription_expires_at?: string | null;
  subscription_grace_until?: string | null;
  admin_override_active?: boolean | null;
};

export type ThemeAccessExtension = {
  business_id: string;
  theme_id: string;
  status?: string | null;
  expires_at?: string | null;
};

export type ThemeAccessDecision = {
  allowed: boolean;
  label: string;
  actionLabel: string;
  reason?: string;
  requiredLevel: ThemeAccessLevel;
  source: "included" | "purchase" | "admin_override" | "denied";
};

const freeThemeIds = new Set(["default-one-page"]);
const starterThemeIds = new Set(["simple-one-page"]);
const proThemeIds = new Set([
  "suya-spot-pro",
  "premium-treats",
  "apartment-stay",
  "car-showroom",
  "bush-market-pro",
]);

function hasActiveSubscription(status: string | null | undefined) {
  if (!status) return true;
  return ["trial", "active", "grace_period", "override_active"].includes(status);
}

function isExtensionActive(extension: ThemeAccessExtension) {
  if (extension.status !== "active") return false;
  if (!extension.expires_at) return true;

  return new Date(extension.expires_at).getTime() > Date.now();
}

export function getThemeRequiredAccess(theme: Pick<BusinessTheme, "id" | "priceLabel" | "pricingNote">): ThemeAccessLevel {
  if (freeThemeIds.has(theme.id)) return "free";
  if (starterThemeIds.has(theme.id)) return "starter";
  if (proThemeIds.has(theme.id)) return "pro";

  const pricingText = `${theme.priceLabel || ""} ${theme.pricingNote || ""}`.toLowerCase();

  if (
    pricingText.includes("pro") ||
    pricingText.includes("premium") ||
    pricingText.includes("set price")
  ) {
    return "pro";
  }

  return "growth";
}

export function getThemeAccessDecision({
  theme,
  business,
  extensions = [],
}: {
  theme: Pick<BusinessTheme, "id" | "priceLabel" | "pricingNote">;
  business: ThemeAccessBusiness | null | undefined;
  extensions?: ThemeAccessExtension[];
}): ThemeAccessDecision {
  const requiredLevel = getThemeRequiredAccess(theme);

  if (!business) {
    return {
      allowed: false,
      label: "Unavailable",
      actionLabel: "Create store",
      reason: "Create a business page first before choosing a theme.",
      requiredLevel,
      source: "denied",
    };
  }

  if (business.admin_override_active) {
    return {
      allowed: true,
      label: "Admin override",
      actionLabel: "Activate",
      requiredLevel,
      source: "admin_override",
    };
  }

  if (
    extensions.some(
      (extension) =>
        extension.business_id === business.id &&
        extension.theme_id === theme.id &&
        isExtensionActive(extension),
    )
  ) {
    return {
      allowed: true,
      label: "Purchased",
      actionLabel: "Activate",
      requiredLevel,
      source: "purchase",
    };
  }

  if (requiredLevel === "custom") {
    return {
      allowed: false,
      label: "Request access",
      actionLabel: "Request access",
      reason: "You do not have access to this theme.",
      requiredLevel,
      source: "denied",
    };
  }

  if (requiredLevel === "free") {
    return {
      allowed: true,
      label: "Included",
      actionLabel: "Activate",
      requiredLevel,
      source: "included",
    };
  }

  if (!hasActiveSubscription(business.subscription_status)) {
    return {
      allowed: false,
      label: "Subscription inactive",
      actionLabel: "Renew plan",
      reason: "Your subscription is not active.",
      requiredLevel,
      source: "denied",
    };
  }

  const currentRank = getPlanRank(business.subscription_plan);
  const requiredRank =
    requiredLevel === "pro" ? 3 : requiredLevel === "growth" ? 2 : 1;

  if (currentRank >= requiredRank) {
    return {
      allowed: true,
      label: "Included",
      actionLabel: "Activate",
      requiredLevel,
      source: "included",
    };
  }

  if (requiredLevel === "pro") {
    return {
      allowed: false,
      label: "Pro required",
      actionLabel: "Upgrade required",
      reason: "This theme requires Pro.",
      requiredLevel,
      source: "denied",
    };
  }

  return {
    allowed: false,
    label: "Upgrade required",
    actionLabel: "Upgrade required",
    reason: "Upgrade your plan to activate this theme.",
    requiredLevel,
    source: "denied",
  };
}

export function getThemeAccessSummary(theme: Pick<BusinessTheme, "id" | "priceLabel" | "pricingNote">) {
  const requiredLevel = getThemeRequiredAccess(theme);

  if (requiredLevel === "free") return "Free";
  if (requiredLevel === "starter") return "Starter included";
  if (requiredLevel === "growth") return "Growth required";
  if (requiredLevel === "pro") return "Pro required";

  return "Manual access";
}

export function formatThemePlan(plan: string | null | undefined) {
  return normalizePlanId(plan).replace("growth", "Grow");
}
