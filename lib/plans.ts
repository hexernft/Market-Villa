export type MarketVillaPlanId = "starter" | "growth" | "pro";

export const MARKET_VILLA_PLANS: Record<
  MarketVillaPlanId,
  {
    id: MarketVillaPlanId;
    name: string;
    amount: number;
    amountInKobo: number;
    description: string;
  }
> = {
  starter: {
    id: "starter",
    name: "Starter",
    amount: 5000,
    amountInKobo: 500000,
    description: "For new small businesses getting online.",
  },
  growth: {
    id: "growth",
    name: "Growth",
    amount: 10000,
    amountInKobo: 1000000,
    description: "For growing businesses that need more tools.",
  },
  pro: {
    id: "pro",
    name: "Pro",
    amount: 20000,
    amountInKobo: 2000000,
    description: "For serious sellers, teams, and service businesses.",
  },
};

export function isValidPlanId(plan: string): plan is MarketVillaPlanId {
  return plan === "starter" || plan === "growth" || plan === "pro";
}
