import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getVisibilityPackage } from "@/lib/visibility-packages";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY || "";

function getActivationDates(durationDays: number | null) {
  const now = new Date();

  if (!durationDays) {
    return {
      now,
      expiresAt: null,
    };
  }

  const expiresAt = new Date(now);
  expiresAt.setDate(expiresAt.getDate() + durationDays);

  return {
    now,
    expiresAt,
  };
}

async function activateVisibilityPackage({
  supabaseAdmin,
  businessId,
  requestId,
  packageId,
  reference,
}: {
  supabaseAdmin: any;
  businessId: string;
  requestId: string;
  packageId: string;
  reference: string;
}) {
  const visibilityPackage = getVisibilityPackage(packageId);

  if (!visibilityPackage) {
    throw new Error("Invalid visibility package.");
  }

  const { now, expiresAt } = getActivationDates(visibilityPackage.durationDays);

  if (visibilityPackage.id === "verified_badge") {
    const { error: businessError } = await supabaseAdmin
      .from("businesses")
      .update({
        is_verified: true,
        visibility_plan: "verified",
        updated_at: now.toISOString(),
      })
      .eq("id", businessId);

    if (businessError) throw businessError;
  } else {
    const { error: businessError } = await supabaseAdmin
      .from("businesses")
      .update({
        is_featured: true,
        featured_until: expiresAt?.toISOString() || null,
        visibility_plan: visibilityPackage.id,
        updated_at: now.toISOString(),
      })
      .eq("id", businessId);

    if (businessError) throw businessError;
  }

  const { error: requestError } = await supabaseAdmin
    .from("visibility_requests")
    .update({
      status: "approved",
      paid_at: now.toISOString(),
      activated_at: now.toISOString(),
      expires_at: expiresAt?.toISOString() || null,
      admin_note: `Payment confirmed automatically via Paystack. Reference: ${reference}`,
      reviewed_at: now.toISOString(),
      updated_at: now.toISOString(),
    })
    .eq("id", requestId);

  if (requestError) throw requestError;
}

export async function POST(request: Request) {
  try {
    if (!supabaseUrl || !serviceRoleKey || !paystackSecretKey) {
      return NextResponse.json(
        { error: "Payment configuration is incomplete." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const reference = String(body?.reference || "").trim();

    if (!reference) {
      return NextResponse.json({ error: "Reference is required." }, { status: 400 });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    }) as any as any;

    const { data: visibilityRequest, error: requestError } = await supabaseAdmin
      .from("visibility_requests")
      .select("id,business_id,owner_id,request_type,status,amount,payment_reference")
      .eq("payment_reference", reference)
      .single();

    if (requestError || !visibilityRequest) {
      return NextResponse.json(
        { error: "Visibility request not found." },
        { status: 404 }
      );
    }

    if (visibilityRequest.status === "approved") {
      return NextResponse.json({
        success: true,
        message: "Visibility package already active.",
      });
    }

    const paystackResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
        },
      }
    );

    const paystackData = await paystackResponse.json();

    if (!paystackResponse.ok || !paystackData?.status) {
      throw new Error(paystackData?.message || "Unable to verify payment.");
    }

    const transaction = paystackData.data;

    if (transaction.status !== "success") {
      return NextResponse.json({
        success: false,
        message: "Payment was not successful.",
      });
    }

    const visibilityPackage = getVisibilityPackage(visibilityRequest.request_type);

    if (!visibilityPackage) {
      throw new Error("Invalid visibility package.");
    }

    if (transaction.amount !== visibilityPackage.amountInKobo) {
      throw new Error("Payment amount mismatch.");
    }

    if (transaction.currency !== "NGN") {
      throw new Error("Payment currency mismatch.");
    }

    await activateVisibilityPackage({
      supabaseAdmin,
      businessId: visibilityRequest.business_id,
      requestId: visibilityRequest.id,
      packageId: visibilityPackage.id,
      reference,
    });

    return NextResponse.json({
      success: true,
      message: "Payment verified. Visibility package activated automatically.",
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unable to verify payment.";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

