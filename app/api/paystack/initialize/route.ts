import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isValidPlanId, MARKET_VILLA_PLANS } from "@/lib/plans";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY || "";
const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

function getBearerToken(request: Request) {
  const authHeader = request.headers.get("authorization") || "";

  if (!authHeader.startsWith("Bearer ")) {
    return "";
  }

  return authHeader.replace("Bearer ", "").trim();
}

export async function POST(request: Request) {
  try {
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

    const body = await request.json();

    const businessId = String(body.businessId || "");
    const planId = String(body.plan || "");

    if (!businessId || !isValidPlanId(planId)) {
      return NextResponse.json(
        { error: "Invalid business or plan." },
        { status: 400 }
      );
    }

    const plan = MARKET_VILLA_PLANS[planId];

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

    const reference = `mv-${planId}-${businessId.slice(0, 8)}-${Date.now()}`;

    const callbackUrl = `${appUrl}/dashboard/settings?payment_reference=${reference}`;

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
          amount: plan.amountInKobo,
          currency: "NGN",
          reference,
          callback_url: callbackUrl,
          metadata: {
            business_id: businessId,
            owner_id: user.id,
            plan: planId,
            business_name: business.name,
          },
        }),
      }
    );

    const paystackData = await paystackResponse.json();

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

    const { error: paymentError } = await supabase.from("payments").insert({
      business_id: businessId,
      owner_id: user.id,
      plan: planId,
      amount: plan.amount,
      currency: "NGN",
      reference,
      status: "pending",
      authorization_url: paystackData.data.authorization_url,
      raw_response: paystackData,
    });

    if (paymentError) {
      return NextResponse.json(
        { error: paymentError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      authorizationUrl: paystackData.data.authorization_url,
      reference,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unable to initialize payment.";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}