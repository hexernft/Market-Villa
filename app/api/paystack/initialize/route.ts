import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  BILLING_CYCLES,
  getMarketVillaPlan,
  getPlanBillingAmount,
  getPlanBillingAmountInKobo,
  getPlanPricingOverrideFromMetadata,
  getIntroBillingCycleMessage,
  isIntroBillingCycleAllowed,
  isPlanDowngrade,
  isSubscriptionDateStillActive,
  isValidPlanAlias,
  normalizeBillingCycle,
  normalizePlanId,
  type BillingCycle,
} from "@/lib/plans";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY || "";
const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000")
  .replace(/\/$/, "");

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
        { status: 500 },
      );
    }

    if (!paystackSecretKey) {
      return NextResponse.json(
        { error: "PAYSTACK_SECRET_KEY is not configured." },
        { status: 500 },
      );
    }

    const token = getBearerToken(request);

    if (!token) {
      return NextResponse.json(
        { error: "Authentication token missing." },
        { status: 401 },
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
        { status: 401 },
      );
    }

    if (!user.email) {
      return NextResponse.json(
        { error: "Your account needs an email address before payment." },
        { status: 400 },
      );
    }

    const body = await request.json();

    const businessId = String(body.businessId || "").trim();
    const rawPlanId = String(body.plan || "").toLowerCase().trim();
    const billingCycle = normalizeBillingCycle(body.billingCycle);

    if (!businessId || !rawPlanId) {
      return NextResponse.json(
        { error: "Invalid business or plan." },
        { status: 400 },
      );
    }

    if (!isValidPlanAlias(rawPlanId)) {
      return NextResponse.json(
        { error: "Selected subscription plan is not available." },
        { status: 400 },
      );
    }

    const planId = normalizePlanId(rawPlanId);
    const selectedCycle = BILLING_CYCLES[billingCycle];

    const { data: pricingItem, error: pricingError } = await supabase
      .from("pricing_items")
      .select("pricing_key,name,description,metadata,is_active")
      .eq("pricing_type", "subscription")
      .eq("pricing_key", planId)
      .eq("is_active", true)
      .maybeSingle();

    if (pricingError || !pricingItem) {
      return NextResponse.json(
        { error: "Selected subscription plan is not available for payment." },
        { status: 400 },
      );
    }

    const pricingOverride = {
      ...getPlanPricingOverrideFromMetadata(
        pricingItem.metadata as Record<string, unknown> | null,
      ),
      name: pricingItem.name || undefined,
      description: pricingItem.description || undefined,
    };

    const selectedPlan = getMarketVillaPlan(planId, pricingOverride);

    const { data: business, error: businessError } = await supabase
      .from("businesses")
      .select("id, owner_id, name, subscription_plan, subscription_status, subscription_expires_at")
      .eq("id", businessId)
      .single();

    if (businessError || !business) {
      return NextResponse.json(
        { error: "Business not found." },
        { status: 404 },
      );
    }

    if (business.owner_id !== user.id) {
      return NextResponse.json(
        { error: "You cannot pay for this business." },
        { status: 403 },
      );
    }

    const { count: successfulPaymentCount, error: paymentCountError } =
      await supabase
        .from("payments")
        .select("id", { count: "exact", head: true })
        .eq("business_id", businessId)
        .eq("status", "success");

    if (paymentCountError) {
      return NextResponse.json(
        { error: paymentCountError.message },
        { status: 400 },
      );
    }

    const isIntroPayment = Number(successfulPaymentCount || 0) === 0;

    if (
      isIntroPayment &&
      !isIntroBillingCycleAllowed({ plan: planId, billingCycle })
    ) {
      return NextResponse.json(
        { error: getIntroBillingCycleMessage(planId) },
        { status: 400 },
      );
    }

    const payableAmount = getPlanBillingAmount({
      plan: planId,
      billingCycle,
      isIntro: isIntroPayment,
      override: pricingOverride,
    });

    const payableAmountInKobo = getPlanBillingAmountInKobo({
      plan: planId,
      billingCycle,
      isIntro: isIntroPayment,
      override: pricingOverride,
    });

    const regularRenewalAmount = getPlanBillingAmount({
      plan: planId,
      billingCycle,
      isIntro: false,
      override: pricingOverride,
    });

    const regularRenewalAmountInKobo = getPlanBillingAmountInKobo({
      plan: planId,
      billingCycle,
      isIntro: false,
      override: pricingOverride,
    });

    if (!payableAmountInKobo || payableAmountInKobo < 100) {
      return NextResponse.json(
        { error: "Selected plan has an invalid payment amount." },
        { status: 400 },
      );
    }

    const plan = {
      id: planId,
      name: selectedPlan.name,
      introMonthlyAmount: selectedPlan.introMonthlyAmount,
      regularMonthlyAmount: selectedPlan.regularMonthlyAmount,
      freeMonths: selectedPlan.freeMonths,
      introPaidMonths: selectedPlan.introPaidMonths,
      isIntroPayment,
      billingCycle,
      billingCycleLabel: selectedCycle.label,
      billingCycleMonths: selectedCycle.months,
      payableAmount,
      payableAmountInKobo,
      regularRenewalAmount,
      regularRenewalAmountInKobo,
    };

    const currentSubscriptionStillActive = isSubscriptionDateStillActive(
      business.subscription_expires_at,
    );

    const downgradeBlocked =
      currentSubscriptionStillActive &&
      isPlanDowngrade({
        currentPlan: business.subscription_plan,
        targetPlan: plan.id,
      });

    if (downgradeBlocked) {
      return NextResponse.json(
        {
          error:
            "This store already has a higher active plan. You can downgrade only after the current plan expires.",
        },
        { status: 400 },
      );
    }

    const reference = createPaymentReference({
      planId: plan.id,
      businessId,
      billingCycle,
    });

    const callbackUrl = `${appUrl}/dashboard/billing?payment_reference=${encodeURIComponent(
      reference,
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
            plan_name: plan.name,
            billing_cycle: billingCycle,
            billing_cycle_label: plan.billingCycleLabel,
            billing_cycle_months: plan.billingCycleMonths,
            intro_monthly_amount: plan.introMonthlyAmount,
            regular_monthly_amount: plan.regularMonthlyAmount,
            free_months: plan.freeMonths,
            intro_paid_months: plan.introPaidMonths,
            is_intro_payment: plan.isIntroPayment,
            payable_amount: plan.payableAmount,
            regular_renewal_amount: plan.regularRenewalAmount,
            business_name: business.name,
            source: "market_villa_subscription",
          },
        }),
      },
    );

    const paystackData = await readJsonSafely(paystackResponse);

    if (!paystackResponse.ok || !paystackData.status) {
      return NextResponse.json(
        {
          error:
            paystackData.message ||
            "Unable to initialize Paystack transaction.",
        },
        { status: 400 },
      );
    }

    const authorizationUrl = paystackData?.data?.authorization_url;
    const returnedReference = paystackData?.data?.reference || reference;

    if (!authorizationUrl) {
      return NextResponse.json(
        { error: "Paystack did not return a checkout link." },
        { status: 400 },
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
          plan_name: plan.name,
          billing_cycle: billingCycle,
          billing_cycle_label: plan.billingCycleLabel,
          billing_cycle_months: plan.billingCycleMonths,
          intro_monthly_amount: plan.introMonthlyAmount,
          regular_monthly_amount: plan.regularMonthlyAmount,
          free_months: plan.freeMonths,
          intro_paid_months: plan.introPaidMonths,
          is_intro_payment: plan.isIntroPayment,
          payable_amount: plan.payableAmount,
          payable_amount_in_kobo: plan.payableAmountInKobo,
          regular_renewal_amount: plan.regularRenewalAmount,
          regular_renewal_amount_in_kobo: plan.regularRenewalAmountInKobo,
        },
      },
    });

    if (paymentError) {
      return NextResponse.json(
        { error: paymentError.message },
        { status: 400 },
      );
    }

    return NextResponse.json({
      authorizationUrl,
      reference: returnedReference,
      billingCycle,
      amount: plan.payableAmount,
      amountInKobo: plan.payableAmountInKobo,
      regularRenewalAmount: plan.regularRenewalAmount,
      regularRenewalAmountInKobo: plan.regularRenewalAmountInKobo,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unable to initialize payment.";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

