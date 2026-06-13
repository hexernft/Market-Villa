import { supabase } from "@/lib/supabase";
import { MarketVillaPlanId } from "@/lib/plans";

async function getAccessToken() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("You must be logged in.");
  }

  return session.access_token;
}

export async function initializePlanPayment({
  businessId,
  plan,
}: {
  businessId: string;
  plan: MarketVillaPlanId;
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
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Unable to initialize payment.");
  }

  return data as {
    authorizationUrl: string;
    reference: string;
  };
}

export async function verifyPlanPayment(reference: string) {
  const token = await getAccessToken();

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

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Unable to verify payment.");
  }

  return data;
}