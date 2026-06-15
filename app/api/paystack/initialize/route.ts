import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY || "";
const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000")
  .replace(/\/$/, "");

type BillingCycle = "monthly" | "yearly";

function getBearerToken(request: Request) {
  const authHeader = request.headers.get("authorization") || "";

  if (!authHeader.startsWith("Bearer ")) {
    return "";
  }

  return authHeader.replace("Bearer ", "").trim();
}

async function readJsonSafely(response: Response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

function normalizeBillingCycle(value: unknown): BillingCycle {
  return value === "yearly" ? "yearly" : "monthly";
}

function calculatePayableAmountInKobo({
  monthlyAmountInKobo,
  billingCycle,
}: {
  monthlyAmountInKobo: number;
  billingCycle: BillingCycle;
}) {
  if (billingCycle === "yearly") {
    return Math.round(monthlyAmountInKobo * 12 * 0.8);
  }

  return monthlyAmountInKobo;
}

function createPaymentReference({
  planId,
  businessId,
  billingCycle,
}: {
  planId: string;
  businessId: string;
  billingCycle: BillingCycle;
}) {
  const safeBusinessId = businessId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 10);
  const randomPart =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().replace(/-/g, "").slice(0, 10)
      : Math.random().toString(36).slice(2, 12);

  return `mv-${planId}-${billingCycle}-${safeBusinessId}-${Date.now()}-${randomPart}`;
}

export async function POST(request: Request) {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: "Supabase environment variables are not configured." },
        { status: 500 }
      );
    }

    if (!paystackSecretKey) {
      return NextResponse.json(
        { error: "PAYSTACK_SECRET_KEY is not configured." },
        { status: 500 }
      );
    }

    const token = getBearerToken(request);

    if (!token) {
      return NextResponse.json(
        { error: "Authentication token missing." },
        { status: 401 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "You must be logged in to make payment." },
        { status: 401 }
      );
    }

    if (!user.email) {
      return NextResponse.json(
        { error: "Your account needs an email address before payment." },
        { status: 400 }
      );
    }

    const body = await request.json();

    const businessId = String(body.businessId || "").trim();
    const planId = String(body.plan || "").trim();
    const billingCycle = normalizeBillingCycle(body.billingCycle);

    if (!businessId || !planId) {
      return NextResponse.json(
        { error: "Invalid business or plan." },
        { status: 400 }
      );
    }

    const { data: pricingItem, error: pricingError } = await supabase
      .from("pricing_items")
      .select("pricing_key,name,amount,amount_in_kobo,price_label,is_active")
      .eq("pricing_type", "subscription")
      .eq("pricing_key", planId)
      .eq("is_active", true)
      .single();

    if (pricingError || !pricingItem) {
      return NextResponse.json(
        { error: "Selected subscription plan is not available." },
        { status: 400 }
      );
    }

    const monthlyAmount = Number(pricingItem.amount || 0);
    const monthlyAmountInKobo = Number(pricingItem.amount_in_kobo || 0);

    if (!monthlyAmountInKobo || monthlyAmountInKobo < 100) {
      return NextResponse.json(
        { error: "Selected plan has an invalid payment amount." },
        { status: 400 }
      );
    }

    const payableAmountInKobo = calculatePayableAmountInKobo({
      monthlyAmountInKobo,
      billingCycle,
    });

    const payableAmount = Math.round(payableAmountInKobo / 100);

    const plan = {
      id: String(pricingItem.pricing_key),
      name: String(pricingItem.name),
      monthlyAmount,
      monthlyAmountInKobo,
      payableAmount,
      payableAmountInKobo,
      priceLabel: String(pricingItem.price_label || ""),
    };

    const { data: business, error: businessError } = await supabase
      .from("businesses")
      .select("id, owner_id, name")
      .eq("id", businessId)
      .single();

    if (businessError || !business) {
      return NextResponse.json(
        { error: "Business not found." },
        { status: 404 }
      );
    }

    if (business.owner_id !== user.id) {
      return NextResponse.json(
        { error: "You cannot pay for this business." },
        { status: 403 }
      );
    }

    const reference = createPaymentReference({
      planId,
      businessId,
      billingCycle,
    });

    const callbackUrl = `${appUrl}/dashboard/billing?payment_reference=${encodeURIComponent(
      reference
    )}`;

    const paystackResponse = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
          amount: plan.payableAmountInKobo,
          currency: "NGN",
          reference,
          callback_url: callbackUrl,
          metadata: {
            business_id: businessId,
            owner_id: user.id,
            plan: plan.id,
            billing_cycle: billingCycle,
            monthly_amount: plan.monthlyAmount,
            payable_amount: plan.payableAmount,
            yearly_discount_percent: billingCycle === "yearly" ? 20 : 0,
            business_name: business.name,
            source: "market_villa_subscription",
          },
        }),
      }
    );

    const paystackData = await readJsonSafely(paystackResponse);

    if (!paystackResponse.ok || !paystackData.status) {
      return NextResponse.json(
        {
          error:
            paystackData.message ||
            "Unable to initialize Paystack transaction.",
        },
        { status: 400 }
      );
    }

    const authorizationUrl = paystackData?.data?.authorization_url;
    const returnedReference = paystackData?.data?.reference || reference;

    if (!authorizationUrl) {
      return NextResponse.json(
        { error: "Paystack did not return a checkout link." },
        { status: 400 }
      );
    }

    const { error: paymentError } = await supabase.from("payments").insert({
      business_id: businessId,
      owner_id: user.id,
      plan: plan.id,
      amount: plan.payableAmount,
      currency: "NGN",
      reference: returnedReference,
      status: "pending",
      authorization_url: authorizationUrl,
      raw_response: {
        ...paystackData,
        market_villa: {
          plan: plan.id,
          billing_cycle: billingCycle,
          monthly_amount: plan.monthlyAmount,
          payable_amount: plan.payableAmount,
          payable_amount_in_kobo: plan.payableAmountInKobo,
          yearly_discount_percent: billingCycle === "yearly" ? 20 : 0,
        },
      },
    });

    if (paymentError) {
      return NextResponse.json(
        { error: paymentError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      authorizationUrl,
      reference: returnedReference,
      billingCycle,
      amount: plan.payableAmount,
      amountInKobo: plan.payableAmountInKobo,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unable to initialize payment.";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
