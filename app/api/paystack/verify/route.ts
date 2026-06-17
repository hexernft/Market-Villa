import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  isValidPlanAlias,
  MARKET_VILLA_PLANS,
  MarketVillaPlanId,
  normalizePlanId,
} from "@/lib/plans";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY || "";

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

function addOneMonthWithGrace() {
  const now = new Date();

  const expiresAt = new Date(now);
  expiresAt.setMonth(expiresAt.getMonth() + 1);

  const graceEndsAt = new Date(expiresAt);
  graceEndsAt.setDate(graceEndsAt.getDate() + 5);

  return {
    now,
    expiresAt,
    graceEndsAt,
  };
}

export async function POST(request: Request) {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: "Supabase public environment variables are not configured." },
        { status: 500 }
      );
    }

    if (!supabaseServiceRoleKey) {
      return NextResponse.json(
        { error: "SUPABASE_SERVICE_ROLE_KEY is not configured." },
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

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    const serviceClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "You must be logged in to verify payment." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const reference = String(body.reference || "").trim();

    if (!reference) {
      return NextResponse.json(
        { error: "Payment reference is required." },
        { status: 400 }
      );
    }

    const { data: payment, error: paymentError } = await serviceClient
      .from("payments")
      .select("*")
      .eq("reference", reference)
      .single();

    if (paymentError || !payment) {
      return NextResponse.json(
        { error: "Payment record not found." },
        { status: 404 }
      );
    }

    if (payment.owner_id !== user.id) {
      return NextResponse.json(
        { error: "You cannot verify this payment." },
        { status: 403 }
      );
    }

    const rawPlan = String(payment.plan || "");

    if (!isValidPlanAlias(rawPlan)) {
      return NextResponse.json(
        { error: "Invalid plan on payment record." },
        { status: 400 }
      );
    }

    const plan = normalizePlanId(rawPlan) as MarketVillaPlanId;
    const expectedPlan = MARKET_VILLA_PLANS[plan];

    if (!expectedPlan?.amountInKobo) {
      return NextResponse.json(
        { error: "Selected plan amount is invalid." },
        { status: 400 }
      );
    }

    if (payment.status === "success") {
      return NextResponse.json({
        success: true,
        status: "success",
        message: "Payment already verified.",
        plan,
        businessId: payment.business_id,
        reference,
      });
    }

    const verifyResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(
        reference
      )}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
        },
      }
    );

    const verifyData = await readJsonSafely(verifyResponse);

    if (!verifyResponse.ok || !verifyData.status) {
      return NextResponse.json(
        {
          error:
            verifyData.message || "Unable to verify Paystack transaction.",
        },
        { status: 400 }
      );
    }

    const transaction = verifyData.data || {};
    const transactionStatus = String(transaction.status || "");
    const transactionCurrency = String(transaction.currency || "");
    const transactionAmount = Number(transaction.amount || 0);

    if (transactionStatus !== "success") {
      const failedStatus = transactionStatus || "failed";
      const now = new Date();

      await serviceClient
        .from("payments")
        .update({
          status: failedStatus,
          raw_response: verifyData,
          updated_at: now.toISOString(),
        })
        .eq("reference", reference);

      return NextResponse.json({
        success: false,
        status: failedStatus,
        message: "Payment was not successful.",
        reference,
      });
    }

    if (transactionCurrency !== "NGN") {
      return NextResponse.json(
        { error: "Payment currency does not match this subscription." },
        { status: 400 }
      );
    }

    if (transactionAmount !== expectedPlan.amountInKobo) {
      return NextResponse.json(
        { error: "Payment amount does not match the selected plan." },
        { status: 400 }
      );
    }

    const metadata = transaction.metadata || {};

    if (
      metadata.business_id &&
      String(metadata.business_id) !== String(payment.business_id)
    ) {
      return NextResponse.json(
        { error: "Payment business metadata does not match." },
        { status: 400 }
      );
    }

    if (metadata.owner_id && String(metadata.owner_id) !== String(user.id)) {
      return NextResponse.json(
        { error: "Payment owner metadata does not match." },
        { status: 400 }
      );
    }

    if (metadata.plan && normalizePlanId(String(metadata.plan)) !== plan) {
      return NextResponse.json(
        { error: "Payment plan metadata does not match." },
        { status: 400 }
      );
    }

    const { now, expiresAt, graceEndsAt } = addOneMonthWithGrace();

    const { error: updatePaymentError } = await serviceClient
      .from("payments")
      .update({
        status: "success",
        paid_at: now.toISOString(),
        raw_response: verifyData,
        updated_at: now.toISOString(),
      })
      .eq("reference", reference);

    if (updatePaymentError) {
      return NextResponse.json(
        { error: updatePaymentError.message },
        { status: 400 }
      );
    }

    const { error: updateBusinessError } = await serviceClient
      .from("businesses")
      .update({
        subscription_plan: plan,
        subscription_status: "active",
        subscription_started_at: now.toISOString(),
        subscription_expires_at: expiresAt.toISOString(),
        grace_period_ends_at: graceEndsAt.toISOString(),
        is_published: true,
        updated_at: now.toISOString(),
      })
      .eq("id", payment.business_id)
      .eq("owner_id", user.id);

    if (updateBusinessError) {
      return NextResponse.json(
        { error: updateBusinessError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      status: "success",
      message: "Payment verified successfully.",
      plan,
      businessId: payment.business_id,
      amount: expectedPlan.amount,
      paidAt: now.toISOString(),
      reference,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unable to verify payment.";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

