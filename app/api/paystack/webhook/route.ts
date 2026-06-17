import crypto from "crypto";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getVisibilityPackage } from "@/lib/visibility-packages";
import {
  isValidPlanAlias,
  MARKET_VILLA_PLANS,
  normalizePlanId,
} from "@/lib/plans";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY || "";

function verifyPaystackSignature(rawBody: string, signature: string) {
  if (!paystackSecretKey || !signature) {
    return false;
  }

  const hash = crypto
    .createHmac("sha512", paystackSecretKey)
    .update(rawBody)
    .digest("hex");

  return hash === signature;
}

function getPlanFromMetadata(data: any) {
  const plan = String(data?.metadata?.plan || "");

  if (isValidPlanAlias(plan)) {
    return normalizePlanId(plan);
  }

  return "";
}

function getBusinessIdFromMetadata(data: any) {
  return String(data?.metadata?.business_id || "");
}

function getOwnerIdFromMetadata(data: any) {
  return String(data?.metadata?.owner_id || "");
}

function getReference(data: any) {
  return String(data?.reference || "");
}

function getAmountInNaira(data: any) {
  const amountInKobo = Number(data?.amount || 0);

  if (!amountInKobo) {
    return 0;
  }

  return Math.round(amountInKobo / 100);
}

function getSubscriptionDates() {
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


async function activatePaidVisibilityPackage({
  supabaseAdmin,
  reference,
  transaction,
}: {
  supabaseAdmin: any;
  reference: string;
  transaction: any;
}) {
  const { data: visibilityRequest, error: requestError } = await supabaseAdmin
    .from("visibility_requests")
    .select("id,business_id,request_type,status,payment_reference")
    .eq("payment_reference", reference)
    .maybeSingle();

  if (requestError || !visibilityRequest) {
    return false;
  }

  if (visibilityRequest.status === "approved") {
    return true;
  }

  const visibilityPackage = getVisibilityPackage(visibilityRequest.request_type);

  if (!visibilityPackage) {
    throw new Error("Invalid visibility package.");
  }

  if (transaction.amount !== visibilityPackage.amountInKobo) {
    throw new Error("Visibility payment amount mismatch.");
  }

  if (transaction.currency !== "NGN") {
    throw new Error("Visibility payment currency mismatch.");
  }

  const now = new Date();
  const expiresAt = visibilityPackage.durationDays ? new Date(now) : null;

  if (expiresAt && visibilityPackage.durationDays) {
    expiresAt.setDate(expiresAt.getDate() + visibilityPackage.durationDays);
  }

  if (visibilityPackage.id === "verified_badge") {
    const { error: businessError } = await supabaseAdmin
      .from("businesses")
      .update({
        is_verified: true,
        visibility_plan: "verified",
        updated_at: now.toISOString(),
      })
      .eq("id", visibilityRequest.business_id);

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
      .eq("id", visibilityRequest.business_id);

    if (businessError) throw businessError;
  }

  const { error: updateRequestError } = await supabaseAdmin
    .from("visibility_requests")
    .update({
      status: "approved",
      paid_at: now.toISOString(),
      activated_at: now.toISOString(),
      expires_at: expiresAt?.toISOString() || null,
      admin_note: `Payment confirmed automatically by Paystack webhook. Reference: ${reference}`,
      reviewed_at: now.toISOString(),
      updated_at: now.toISOString(),
    })
    .eq("id", visibilityRequest.id);

  if (updateRequestError) throw updateRequestError;

  return true;
}
export async function POST(request: Request) {
  try {
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Supabase service credentials are not configured." },
        { status: 500 }
      );
    }

    if (!paystackSecretKey) {
      return NextResponse.json(
        { error: "PAYSTACK_SECRET_KEY is not configured." },
        { status: 500 }
      );
    }

    const rawBody = await request.text();
    const signature = request.headers.get("x-paystack-signature") || "";

    const isValidSignature = verifyPaystackSignature(rawBody, signature);

    if (!isValidSignature) {
      return NextResponse.json(
        { error: "Invalid Paystack signature." },
        { status: 401 }
      );
    }

    const event = JSON.parse(rawBody);

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const eventName = String(event?.event || "");
    const data = event?.data || {};
    const reference = getReference(data);

    if (!reference) {
      return NextResponse.json({
        received: true,
        ignored: true,
        reason: "Missing reference.",
      });
    }

    if (eventName === "charge.success") {
      const businessId = getBusinessIdFromMetadata(data);
      const ownerId = getOwnerIdFromMetadata(data);
      const plan = getPlanFromMetadata(data);
      const amount = getAmountInNaira(data);
      const amountInKobo = Number(data?.amount || 0);
      const currency = String(data?.currency || "");

      if (!businessId || !plan) {
        await supabaseAdmin
          .from("payments")
          .update({
            status: "success_unmatched",
            raw_response: event,
            updated_at: new Date().toISOString(),
          })
          .eq("reference", reference);

        return NextResponse.json({
          received: true,
          ignored: true,
          reason: "Missing business_id or plan metadata.",
        });
      }

      const expectedPlan = MARKET_VILLA_PLANS[plan];

      if (!expectedPlan?.amountInKobo) {
        return NextResponse.json({
          received: true,
          ignored: true,
          reason: "Invalid plan amount.",
        });
      }

      if (currency !== "NGN") {
        await supabaseAdmin
          .from("payments")
          .update({
            status: "currency_mismatch",
            raw_response: event,
            updated_at: new Date().toISOString(),
          })
          .eq("reference", reference);

        return NextResponse.json({
          received: true,
          ignored: true,
          reason: "Currency mismatch.",
        });
      }

      if (amountInKobo !== expectedPlan.amountInKobo) {
        await supabaseAdmin
          .from("payments")
          .update({
            status: "amount_mismatch",
            raw_response: event,
            updated_at: new Date().toISOString(),
          })
          .eq("reference", reference);

        return NextResponse.json({
          received: true,
          ignored: true,
          reason: "Amount mismatch.",
        });
      }

      const { now, expiresAt, graceEndsAt } = getSubscriptionDates();

      const { data: existingPayment } = await supabaseAdmin
        .from("payments")
        .select("id, status, business_id, owner_id, plan")
        .eq("reference", reference)
        .maybeSingle();

      if (existingPayment?.status === "success") {
        return NextResponse.json({
          received: true,
          duplicate: true,
          reference,
        });
      }

      if (
        existingPayment?.business_id &&
        String(existingPayment.business_id) !== businessId
      ) {
        return NextResponse.json({
          received: true,
          ignored: true,
          reason: "Existing payment business does not match.",
        });
      }

      if (
        existingPayment?.owner_id &&
        ownerId &&
        String(existingPayment.owner_id) !== ownerId
      ) {
        return NextResponse.json({
          received: true,
          ignored: true,
          reason: "Existing payment owner does not match.",
        });
      }

      if (
        existingPayment?.plan &&
        normalizePlanId(String(existingPayment.plan)) !== String(plan)
      ) {
        return NextResponse.json({
          received: true,
          ignored: true,
          reason: "Existing payment plan does not match.",
        });
      }

      if (existingPayment) {
        const { error: paymentUpdateError } = await supabaseAdmin
          .from("payments")
          .update({
            plan,
            amount,
            currency: "NGN",
            status: "success",
            paid_at: now.toISOString(),
            raw_response: event,
            updated_at: now.toISOString(),
          })
          .eq("reference", reference);

        if (paymentUpdateError) {
          throw paymentUpdateError;
        }
      } else {
        const { error: paymentInsertError } = await supabaseAdmin
          .from("payments")
          .insert({
            business_id: businessId,
            owner_id: ownerId || null,
            plan,
            amount,
            currency: "NGN",
            reference,
            status: "success",
            paid_at: now.toISOString(),
            raw_response: event,
            updated_at: now.toISOString(),
          });

        if (paymentInsertError) {
          throw paymentInsertError;
        }
      }

      const { error: businessUpdateError } = await supabaseAdmin
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
        .eq("id", businessId);

      if (businessUpdateError) {
        throw businessUpdateError;
      }

      return NextResponse.json({
        received: true,
        processed: true,
        event: eventName,
        reference,
      });
    }

    if (eventName === "invoice.payment_failed") {
      const businessId = getBusinessIdFromMetadata(data);

      if (businessId) {
        const now = new Date();

        const graceEndsAt = new Date(now);
        graceEndsAt.setDate(graceEndsAt.getDate() + 5);

        const { error: failedUpdateError } = await supabaseAdmin
          .from("businesses")
          .update({
            subscription_status: "payment_failed",
            grace_period_ends_at: graceEndsAt.toISOString(),
            updated_at: now.toISOString(),
          })
          .eq("id", businessId);

        if (failedUpdateError) {
          throw failedUpdateError;
        }
      }

      return NextResponse.json({
        received: true,
        processed: true,
        event: eventName,
      });
    }

    return NextResponse.json({
      received: true,
      ignored: true,
      event: eventName,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unable to process webhook.";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

