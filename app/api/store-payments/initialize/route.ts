import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY || "";
const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000")
  .replace(/\/$/, "");
const platformFeePercent = Number(
  process.env.PAYSTACK_PLATFORM_FEE_PERCENT || "10",
);

type CheckoutItem = {
  id?: string | null;
  name?: string | null;
  price?: number | string | null;
  quantity?: number | string | null;
};

function createReference(businessId: string) {
  const safeBusinessId = businessId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 10);
  const randomPart =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().replace(/-/g, "").slice(0, 12)
      : Math.random().toString(36).slice(2, 14);

  return `mv-order-${safeBusinessId}-${Date.now()}-${randomPart}`;
}

async function readJsonSafely(response: Response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function normalizeItems(items: CheckoutItem[]) {
  return items
    .map((item) => ({
      id: String(item.id || "").trim(),
      name: String(item.name || "").trim(),
      price: Number(item.price || 0),
      quantity: Math.max(1, Math.round(Number(item.quantity || 1))),
    }))
    .filter((item) => item.name && item.price > 0 && item.quantity > 0);
}

export async function POST(request: Request) {
  try {
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Supabase service credentials are not configured." },
        { status: 500 },
      );
    }

    if (!paystackSecretKey) {
      return NextResponse.json(
        { error: "PAYSTACK_SECRET_KEY is not configured." },
        { status: 500 },
      );
    }

    const body = await request.json();
    const businessId = String(body.businessId || "").trim();
    const customerName = String(body.customerName || "").trim();
    const customerPhone = String(body.customerPhone || "").trim();
    const customerEmail = String(body.customerEmail || "").trim();
    const customerAddress = String(body.customerAddress || "").trim();
    const customerNote = String(body.customerNote || "").trim();
    const items = normalizeItems(Array.isArray(body.items) ? body.items : []);

    if (!businessId || !customerName || !customerPhone || !customerEmail) {
      return NextResponse.json(
        { error: "Customer and business details are required." },
        { status: 400 },
      );
    }

    if (!items.length) {
      return NextResponse.json(
        { error: "Add at least one priced item before payment." },
        { status: 400 },
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const { data: business, error: businessError } = await supabase
      .from("businesses")
      .select(
        "id,owner_id,name,slug,email,is_published,paystack_subaccount_code",
      )
      .eq("id", businessId)
      .maybeSingle();

    if (businessError || !business) {
      return NextResponse.json(
        { error: "Store not found." },
        { status: 404 },
      );
    }

    if (!business.is_published) {
      return NextResponse.json(
        { error: "This store is not accepting online payments yet." },
        { status: 400 },
      );
    }

    const subaccountCode = String(business.paystack_subaccount_code || "")
      .trim();

    if (!subaccountCode) {
      return NextResponse.json(
        { error: "This store has not connected online settlement yet." },
        { status: 400 },
      );
    }

    const productIds = items.map((item) => item.id).filter(isUuid);
    const productPriceMap = new Map<string, { name: string; price: number }>();

    if (productIds.length) {
      const { data: products, error: productsError } = await supabase
        .from("products")
        .select("id,name,price,business_id,is_available,is_published")
        .eq("business_id", businessId)
        .in("id", productIds);

      if (productsError) {
        throw productsError;
      }

      for (const product of products || []) {
        if (product.is_available === false || product.is_published === false) {
          continue;
        }

        productPriceMap.set(String(product.id), {
          name: String(product.name || ""),
          price: Number(product.price || 0),
        });
      }
    }

    const orderItems = items.map((item) => {
      const product = productPriceMap.get(item.id);
      const unitPrice = product?.price || item.price;

      return {
        product_id: isUuid(item.id) ? item.id : null,
        product_name: product?.name || item.name,
        quantity: item.quantity,
        unit_price: unitPrice,
        line_total: unitPrice * item.quantity,
      };
    });

    const totalAmount = orderItems.reduce(
      (sum, item) => sum + Number(item.line_total || 0),
      0,
    );

    if (totalAmount < 100) {
      return NextResponse.json(
        { error: "Order amount is too low for online payment." },
        { status: 400 },
      );
    }

    const reference = createReference(businessId);
    const safePlatformFee = Number.isFinite(platformFeePercent)
      ? Math.min(Math.max(platformFeePercent, 0), 90)
      : 10;
    const ownerShare = 100 - safePlatformFee;
    const platformFeeAmount = Math.round(totalAmount * safePlatformFee) / 100;
    const ownerSettlementAmount = totalAmount - platformFeeAmount;

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        business_id: businessId,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_address: customerAddress,
        customer_note: customerNote,
        total_amount: totalAmount,
        status: "pending_payment",
        payment_status: "pending",
        payment_channel: "paystack",
        payment_reference: reference,
        paystack_subaccount_code: subaccountCode,
        platform_fee_percent: safePlatformFee,
        platform_fee_amount: platformFeeAmount,
        owner_settlement_amount: ownerSettlementAmount,
      })
      .select("id")
      .single();

    if (orderError) {
      throw orderError;
    }

    const { error: orderItemsError } = await supabase
      .from("order_items")
      .insert(
        orderItems.map((item) => ({
          ...item,
          order_id: order.id,
        })),
      );

    if (orderItemsError) {
      throw orderItemsError;
    }

    const callbackUrl = `${appUrl}/store/${encodeURIComponent(
      String(business.slug || businessId),
    )}?order_reference=${encodeURIComponent(reference)}`;

    const paystackResponse = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: customerEmail,
          amount: Math.round(totalAmount * 100),
          currency: "NGN",
          reference,
          callback_url: callbackUrl,
          split: {
            type: "percentage",
            currency: "NGN",
            bearer_type: "account",
            subaccounts: [
              {
                subaccount: subaccountCode,
                share: ownerShare,
              },
            ],
          },
          metadata: {
            source: "market_villa_store_order",
            business_id: businessId,
            business_name: business.name,
            order_id: order.id,
            platform_fee_percent: safePlatformFee,
            owner_share_percent: ownerShare,
          },
        }),
      },
    );

    const paystackData = await readJsonSafely(paystackResponse);

    if (!paystackResponse.ok || !paystackData?.status) {
      await supabase
        .from("orders")
        .update({
          status: "payment_failed",
          payment_status: "failed",
          payment_raw_response: paystackData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id);

      return NextResponse.json(
        {
          error:
            paystackData?.message ||
            "Unable to initialize online payment.",
        },
        { status: 400 },
      );
    }

    const authorizationUrl = paystackData?.data?.authorization_url;

    if (!authorizationUrl) {
      return NextResponse.json(
        { error: "Paystack did not return a checkout link." },
        { status: 400 },
      );
    }

    await supabase
      .from("orders")
      .update({
        payment_raw_response: paystackData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id);

    return NextResponse.json({
      authorizationUrl,
      reference,
      orderId: order.id,
      amount: totalAmount,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to initialize online payment.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
