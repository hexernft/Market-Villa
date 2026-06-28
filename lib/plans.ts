export type MarketVillaPlanId = "starter" | "growth" | "pro";
export type BillingCycle = "quarterly" | "biannually" | "annually";
export type PlanGatedBusinessMode = "products";

export type LegacyMarketVillaPlanId =
  | MarketVillaPlanId
  | "grow"
  | "basic"
  | "business"
  | "premium";

export const PLAN_THEME_LIMITS: Record<MarketVillaPlanId, number> = {
  starter: 5,
  growth: 10,
  pro: 22,
};

export const BILLING_CYCLES: Record<
  BillingCycle,
  {
    id: BillingCycle;
    label: string;
    shortLabel: string;
    months: number;
  }
> = {
  quarterly: {
    id: "quarterly",
    label: "Quarterly",
    shortLabel: "3 months",
    months: 3,
  },
  biannually: {
    id: "biannually",
    label: "Bi-annually",
    shortLabel: "6 months",
    months: 6,
  },
  annually: {
    id: "annually",
    label: "Annually",
    shortLabel: "12 months",
    months: 12,
  },
};

export const MARKET_VILLA_PLANS: Record<
  MarketVillaPlanId,
  {
    id: MarketVillaPlanId;
    name: string;
    displayName: string;
    introMonthlyAmount: number;
    regularMonthlyAmount: number;
    freeMonths: number;
    introPaidMonths: number;
    description: string;
    themeLimit: number;
  }
> = {
  starter: {
    id: "starter",
    name: "Starter",
    displayName: "Starter",
    introMonthlyAmount: 2000,
    regularMonthlyAmount: 3000,
    freeMonths: 1,
    introPaidMonths: 3,
    description:
      "For new small businesses getting online with a polished storefront.",
    themeLimit: PLAN_THEME_LIMITS.starter,
  },
  growth: {
    id: "growth",
    name: "Grow",
    displayName: "Grow",
    introMonthlyAmount: 3000,
    regularMonthlyAmount: 5000,
    freeMonths: 0,
    introPaidMonths: 3,
    description: "For growing businesses that need more room and sales tools.",
    themeLimit: PLAN_THEME_LIMITS.growth,
  },
  pro: {
    id: "pro",
    name: "Pro",
    displayName: "Pro",
    introMonthlyAmount: 7000,
    regularMonthlyAmount: 10000,
    freeMonths: 0,
    introPaidMonths: 3,
    description:
      "For serious sellers, growing teams, and premium storefronts.",
    themeLimit: PLAN_THEME_LIMITS.pro,
  },
};

export type PlanPricingOverride = {
  name?: string | null;
  displayName?: string | null;
  description?: string | null;
  introMonthlyAmount?: number | string | null;
  regularMonthlyAmount?: number | string | null;
  freeMonths?: number | string | null;
  introPaidMonths?: number | string | null;
  themeLimit?: number | string | null;
};

function readPositiveNumber(value: unknown, fallback: number) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue) || numberValue < 0) {
    return fallback;
  }

  return numberValue;
}

function readMetadataOverrideValue(
  metadata: Record<string, unknown> | null | undefined,
  key: string,
) {
  const value = metadata?.[key];

  return typeof value === "string" || typeof value === "number" || value === null
    ? value
    : undefined;
}

export function getMarketVillaPlan(
  plan: string | null | undefined,
  override?: PlanPricingOverride | null,
) {
  const planId = normalizePlanId(plan);
  const basePlan = MARKET_VILLA_PLANS[planId];

  if (!override) return basePlan;

  return {
    ...basePlan,
    name: String(override.name || basePlan.name),
    displayName: String(override.displayName || basePlan.displayName),
    description: String(override.description || basePlan.description),
    introMonthlyAmount: readPositiveNumber(
      override.introMonthlyAmount,
      basePlan.introMonthlyAmount,
    ),
    regularMonthlyAmount: readPositiveNumber(
      override.regularMonthlyAmount,
      basePlan.regularMonthlyAmount,
    ),
    freeMonths: readPositiveNumber(override.freeMonths, basePlan.freeMonths),
    introPaidMonths: readPositiveNumber(
      override.introPaidMonths,
      basePlan.introPaidMonths,
    ),
    themeLimit: readPositiveNumber(override.themeLimit, basePlan.themeLimit),
  };
}

export function getPlanPricingOverrideFromMetadata(
  metadata: Record<string, unknown> | null | undefined,
): PlanPricingOverride {
  return {
    introMonthlyAmount: readMetadataOverrideValue(
      metadata,
      "intro_monthly_amount",
    ),
    regularMonthlyAmount: readMetadataOverrideValue(
      metadata,
      "regular_monthly_amount",
    ),
    freeMonths: readMetadataOverrideValue(metadata, "free_months"),
    introPaidMonths: readMetadataOverrideValue(metadata, "intro_paid_months"),
    themeLimit: readMetadataOverrideValue(metadata, "theme_limit"),
  };
}

export function normalizePlanId(
  plan: string | null | undefined,
): MarketVillaPlanId {
  const value = String(plan || "").toLowerCase().trim();

  if (value === "basic") return "starter";
  if (value === "business") return "growth";
  if (value === "premium") return "pro";
  if (value === "grow") return "growth";
  if (value === "growth") return "growth";
  if (value === "pro") return "pro";

  return "starter";
}

export function isValidPlanId(plan: string): plan is MarketVillaPlanId {
  return plan === "starter" || plan === "growth" || plan === "pro";
}

export function isValidPlanAlias(
  plan: string,
): plan is LegacyMarketVillaPlanId {
  return [
    "starter",
    "growth",
    "grow",
    "pro",
    "basic",
    "business",
    "premium",
  ].includes(plan);
}

export function isValidBillingCycle(cycle: string): cycle is BillingCycle {
  return cycle === "quarterly" || cycle === "biannually" || cycle === "annually";
}

export function normalizeBillingCycle(
  cycle: string | null | undefined,
): BillingCycle {
  const value = String(cycle || "").toLowerCase().trim();

  if (value === "bi-annual" || value === "biannual" || value === "semiannual") {
    return "biannually";
  }

  if (value === "annual" || value === "yearly" || value === "year") {
    return "annually";
  }

  if (value === "monthly") {
    return "quarterly";
  }

  if (isValidBillingCycle(value)) {
    return value;
  }

  return "quarterly";
}

export function getThemeLimitForPlan(plan: string | null | undefined) {
  return PLAN_THEME_LIMITS[normalizePlanId(plan)];
}

export function getPlanMonthlyPrice({
  plan,
  isIntro = true,
}: {
  plan: string | null | undefined;
  isIntro?: boolean;
}) {
  const planId = normalizePlanId(plan);
  const selectedPlan = MARKET_VILLA_PLANS[planId];

  return isIntro
    ? selectedPlan.introMonthlyAmount
    : selectedPlan.regularMonthlyAmount;
}

export function getPlanBillingAmount({
  plan,
  billingCycle,
  isIntro = true,
  override,
}: {
  plan: string | null | undefined;
  billingCycle: string | null | undefined;
  isIntro?: boolean;
  override?: PlanPricingOverride | null;
}) {
  const planId = normalizePlanId(plan);
  const cycleId = normalizeBillingCycle(billingCycle);
  const selectedPlan = getMarketVillaPlan(planId, override);
  const selectedCycle = BILLING_CYCLES[cycleId];

  if (!isIntro) {
    return selectedPlan.regularMonthlyAmount * selectedCycle.months;
  }

  let total = 0;

  for (let month = 1; month <= selectedCycle.months; month += 1) {
    if (month <= selectedPlan.introPaidMonths) {
      total += selectedPlan.introMonthlyAmount;
      continue;
    }

    total += selectedPlan.regularMonthlyAmount;
  }

  return total;
}

export function getPlanBillingAmountInKobo({
  plan,
  billingCycle,
  isIntro = true,
  override,
}: {
  plan: string | null | undefined;
  billingCycle: string | null | undefined;
  isIntro?: boolean;
  override?: PlanPricingOverride | null;
}) {
  return getPlanBillingAmount({ plan, billingCycle, isIntro, override }) * 100;
}

export function canUseThemeForPlan({
  plan,
  themeIndex,
}: {
  plan: string | null | undefined;
  themeIndex: number;
}) {
  return themeIndex >= 0 && themeIndex < getThemeLimitForPlan(plan);
}

export function canUseBusinessModeForPlan({
  mode,
  plan,
}: {
  mode: PlanGatedBusinessMode | string | null | undefined;
  plan: string | null | undefined;
}) {
  return true;
}

export function getBusinessModePlanMessage(mode: string | null | undefined) {
  return "";
}

export const PLAN_RANKS: Record<MarketVillaPlanId, number> = {
  starter: 1,
  growth: 2,
  pro: 3,
};

export function getPlanRank(plan: string | null | undefined) {
  return PLAN_RANKS[normalizePlanId(plan)];
}

export function isPlanDowngrade({
  currentPlan,
  targetPlan,
}: {
  currentPlan: string | null | undefined;
  targetPlan: string | null | undefined;
}) {
  return getPlanRank(targetPlan) < getPlanRank(currentPlan);
}

export function isSubscriptionDateStillActive(
  expiresAt: string | null | undefined,
) {
  if (!expiresAt) return false;

  return new Date(expiresAt) > new Date();
}
