import { supabase } from "@/lib/supabase";
import { MarketVillaPlanId } from "@/lib/plans";

export type BillingCycle = "monthly" | "yearly";

type InitializePlanPaymentResponse = {
  authorizationUrl: string;
  reference: string;
};

type VerifyPlanPaymentResponse = {
  success: boolean;
  message?: string;
  businessId?: string;
  plan?: MarketVillaPlanId;
  billingCycle?: BillingCycle;
  status?: string;
  amount?: number;
  paidAt?: string | null;
  reference?: string;
};

async function getAccessToken() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("You must be logged in.");
  }

  return session.access_token;
}

async function readResponseJson(response: Response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

export async function initializePlanPayment({
  businessId,
  plan,
  billingCycle = "monthly",
}: {
  businessId: string;
  plan: MarketVillaPlanId;
  billingCycle?: BillingCycle;
}) {
  const token = await getAccessToken();

  const response = await fetch("/api/paystack/initialize", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      businessId,
      plan,
      billingCycle,
    }),
  });

  const data = await readResponseJson(response);

  if (!response.ok) {
    throw new Error(data.error || "Unable to initialize payment.");
  }

  if (!data.authorizationUrl || !data.reference) {
    throw new Error(
      "Payment started, but Paystack did not return a checkout link."
    );
  }

  return data as InitializePlanPaymentResponse;
}

export async function verifyPlanPayment(reference: string) {
  const token = await getAccessToken();

  if (!reference) {
    throw new Error("Payment reference is missing.");
  }

  const response = await fetch("/api/paystack/verify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      reference,
    }),
  });

  const data = await readResponseJson(response);

  if (!response.ok) {
    throw new Error(data.error || "Unable to verify payment.");
  }

  return data as VerifyPlanPaymentResponse;
}
