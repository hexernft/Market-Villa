export type MarketVillaPlanId = "starter" | "growth" | "pro";
export type PlanGatedBusinessMode = "products" | "properties" | "cars";
export type LegacyMarketVillaPlanId =
  | MarketVillaPlanId
  | "basic"
  | "business"
  | "premium";

export const PLAN_THEME_LIMITS: Record<MarketVillaPlanId, number> = {
  starter: 5,
  growth: 10,
  pro: 22,
};

export const MARKET_VILLA_PLANS: Record<
  MarketVillaPlanId,
  {
    id: MarketVillaPlanId;
    name: string;
    displayName: string;
    amount: number;
    amountInKobo: number;
    description: string;
    themeLimit: number;
  }
> = {
  starter: {
    id: "starter",
    name: "Starter",
    displayName: "Starter",
    amount: 10000,
    amountInKobo: 1000000,
    description: "For new small businesses getting online.",
    themeLimit: PLAN_THEME_LIMITS.starter,
  },
  growth: {
    id: "growth",
    name: "Growth",
    displayName: "Growth",
    amount: 20000,
    amountInKobo: 2000000,
    description: "For growing businesses that need more tools.",
    themeLimit: PLAN_THEME_LIMITS.growth,
  },
  pro: {
    id: "pro",
    name: "Premium",
    displayName: "Premium",
    amount: 30000,
    amountInKobo: 3000000,
    description: "For serious sellers, teams, and service businesses.",
    themeLimit: PLAN_THEME_LIMITS.pro,
  },
};

export function normalizePlanId(
  plan: string | null | undefined,
): MarketVillaPlanId {
  const value = String(plan || "").toLowerCase().trim();

  if (value === "basic") return "starter";
  if (value === "business") return "growth";
  if (value === "premium") return "pro";
  if (value === "pro") return "pro";
  if (value === "growth") return "growth";

  return "starter";
}

export function isValidPlanId(plan: string): plan is MarketVillaPlanId {
  return plan === "starter" || plan === "growth" || plan === "pro";
}

export function isValidPlanAlias(
  plan: string,
): plan is LegacyMarketVillaPlanId {
  return ["starter", "growth", "pro", "basic", "business", "premium"].includes(
    plan,
  );
}

export function getThemeLimitForPlan(plan: string | null | undefined) {
  return PLAN_THEME_LIMITS[normalizePlanId(plan)];
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
  const cleanMode = String(mode || "products");

  if (cleanMode === "products") return true;

  const normalizedPlan = normalizePlanId(plan);

  return normalizedPlan === "growth" || normalizedPlan === "pro";
}

export function getBusinessModePlanMessage(mode: string | null | undefined) {
  const cleanMode = String(mode || "products");

  if (cleanMode === "cars") {
    return "Cars are available from the Growth plan.";
  }

  if (cleanMode === "properties") {
    return "Properties are available from the Growth plan.";
  }

  return "";
}
