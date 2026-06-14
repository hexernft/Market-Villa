import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getVisibilityPackage } from "@/lib/visibility-packages";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY || "";
const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "http://localhost:3000";

function createReference() {
  return `MV-VIS-${Date.now()}-${Math.random().toString(36).slice(2, 9).toUpperCase()}`;
}

export async function POST(request: Request) {
  try {
    if (!supabaseUrl || !serviceRoleKey || !paystackSecretKey) {
      return NextResponse.json(
        { error: "Payment configuration is incomplete." },
        { status: 500 }
      );
    }

    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.replace("Bearer ", "").trim();

    if (!token) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const body = await request.json();

    const businessId = String(body?.businessId || "").trim();
    const packageId = String(body?.packageId || "").trim();

    const visibilityPackage = getVisibilityPackage(packageId);

    if (!businessId || !visibilityPackage) {
      return NextResponse.json(
        { error: "Valid businessId and packageId are required." },
        { status: 400 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const { data: userResult, error: userError } =
      await supabaseAdmin.auth.getUser(token);

    if (userError || !userResult.user) {
      return NextResponse.json({ error: "Invalid session." }, { status: 401 });
    }

    const user = userResult.user;

    const { data: business, error: businessError } = await supabaseAdmin
      .from("businesses")
      .select("id, owner_id, name, slug")
      .eq("id", businessId)
      .single();

    if (businessError || !business) {
      return NextResponse.json({ error: "Business not found." }, { status: 404 });
    }

    if (business.owner_id !== user.id) {
      return NextResponse.json({ error: "You do not own this business." }, { status: 403 });
    }

    const reference = createReference();

    const { error: requestError } = await supabaseAdmin
      .from("visibility_requests")
      .insert({
        business_id: business.id,
        owner_id: user.id,
        request_type: visibilityPackage.id,
        status: "pending_payment",
        requested_days: visibilityPackage.durationDays || 0,
        payment_reference: reference,
        amount: visibilityPackage.amount,
        currency: "NGN",
        package_name: visibilityPackage.name,
        package_price_label: visibilityPackage.priceLabel,
        message: `Paid visibility package selected: ${visibilityPackage.name}.`,
      });

    if (requestError) {
      throw requestError;
    }

    const paystackResponse = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: user.email,
        amount: visibilityPackage.amountInKobo,
        currency: "NGN",
        reference,
        callback_url: `${appUrl}/dashboard/visibility?visibility_reference=${reference}`,
        metadata: {
          payment_type: "visibility_package",
          business_id: business.id,
          owner_id: user.id,
          package_id: visibilityPackage.id,
          package_name: visibilityPackage.name,
        },
      }),
    });

    const paystackData = await paystackResponse.json();

    if (!paystackResponse.ok || !paystackData?.status) {
      throw new Error(paystackData?.message || "Unable to initialize visibility payment.");
    }

    return NextResponse.json({
      success: true,
      reference,
      authorizationUrl: paystackData.data.authorization_url,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unable to initialize payment.";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}