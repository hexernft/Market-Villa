import { supabase } from "@/lib/supabase";
import type { BillingCycle, MarketVillaPlanId } from "@/lib/plans";

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

type StoreCheckoutItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

type InitializeStorePaymentResponse = {
  authorizationUrl: string;
  reference: string;
  orderId: string;
  amount: number;
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
  billingCycle = "quarterly",
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
      "Payment started, but Paystack did not return a checkout link.",
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

export async function initializeStoreOrderPayment(input: {
  businessId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;
  customerNote: string;
  items: StoreCheckoutItem[];
}) {
  const response = await fetch("/api/store-payments/initialize", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const data = await readResponseJson(response);

  if (!response.ok) {
    throw new Error(data.error || "Unable to initialize store payment.");
  }

  if (!data.authorizationUrl || !data.reference) {
    throw new Error("Paystack checkout link was not returned.");
  }

  return data as InitializeStorePaymentResponse;
}
