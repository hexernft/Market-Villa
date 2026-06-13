import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isValidPlanId } from "@/lib/plans";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY || "";

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
        { error: "You must be logged in to verify payment." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const reference = String(body.reference || "");

    if (!reference) {
      return NextResponse.json(
        { error: "Payment reference is required." },
        { status: 400 }
      );
    }

    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .select("*")
      .eq("reference", reference)
      .eq("owner_id", user.id)
      .single();

    if (paymentError || !payment) {
      return NextResponse.json(
        { error: "Payment record not found." },
        { status: 404 }
      );
    }

    const verifyResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
        },
      }
    );

    const verifyData = await verifyResponse.json();

    if (!verifyResponse.ok || !verifyData.status) {
      return NextResponse.json(
        {
          error:
            verifyData.message || "Unable to verify Paystack transaction.",
        },
        { status: 400 }
      );
    }

    const transaction = verifyData.data;
    const transactionStatus = transaction.status;

    if (transactionStatus !== "success") {
      await supabase
        .from("payments")
        .update({
          status: transactionStatus || "failed",
          raw_response: verifyData,
          updated_at: new Date().toISOString(),
        })
        .eq("reference", reference);

      return NextResponse.json({
        success: false,
        status: transactionStatus,
        message: "Payment was not successful.",
      });
    }

    const plan = String(payment.plan || "");

    if (!isValidPlanId(plan)) {
      return NextResponse.json(
        { error: "Invalid plan on payment record." },
        { status: 400 }
      );
    }

    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    const graceEndsAt = new Date(expiresAt);
    graceEndsAt.setDate(graceEndsAt.getDate() + 5);

    await supabase
      .from("payments")
      .update({
        status: "success",
        paid_at: now.toISOString(),
        raw_response: verifyData,
        updated_at: now.toISOString(),
      })
      .eq("reference", reference);

    await supabase
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
      .eq("id", payment.business_id);

    return NextResponse.json({
      success: true,
      status: "success",
      plan,
      businessId: payment.business_id,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unable to verify payment.";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
