import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

type ProductRow = {
  name?: string | null;
  description?: string | null;
  price?: number | null;
  category?: string | null;
  is_available?: boolean | null;
};

function formatCurrency(value?: number | null) {
  if (!value) return "Price not provided";

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);
}

function normalize(value: unknown) {
  return String(value || "").toLowerCase();
}

function buildProductReply(message: string, products: ProductRow[]) {
  const availableProducts = products.filter((product) => product.is_available !== false);

  if (!availableProducts.length) {
    return "";
  }

  const lowerMessage = normalize(message);

  const matchedProduct = availableProducts.find((product) => {
    const name = normalize(product.name);
    const category = normalize(product.category);

    return Boolean(name && lowerMessage.includes(name)) || Boolean(category && lowerMessage.includes(category));
  });

  if (matchedProduct) {
    return `${matchedProduct.name} is available. ${matchedProduct.description || ""} Price: ${formatCurrency(
      matchedProduct.price,
    )}. Would you like to continue on WhatsApp?`;
  }

  if (
    lowerMessage.includes("price") ||
    lowerMessage.includes("cost") ||
    lowerMessage.includes("how much") ||
    lowerMessage.includes("products") ||
    lowerMessage.includes("what do you sell") ||
    lowerMessage.includes("available")
  ) {
    const productList = availableProducts
      .slice(0, 6)
      .map((product) => `${product.name} — ${formatCurrency(product.price)}`)
      .join("\n");

    return `Here are some available items:\n${productList}\n\nPlease continue on WhatsApp to confirm availability and place an order.`;
  }

  return "";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const businessId = String(body.businessId || "");
    const message = String(body.message || "");

    if (!businessId || !message.trim()) {
      return NextResponse.json(
        { error: "businessId and message are required." },
        { status: 400 },
      );
    }

    const { data: business, error: businessError } = await supabaseAdmin
      .from("businesses")
      .select(
        "id,name,description,tagline,location,phone,whatsapp,whatsapp_number,opening_hours,ai_assistant_enabled,ai_assistant_status,ai_assistant_notes",
      )
      .eq("id", businessId)
      .single();

    if (businessError || !business) {
      return NextResponse.json({ error: "Store not found." }, { status: 404 });
    }

    if (!business.ai_assistant_enabled || business.ai_assistant_status !== "active") {
      return NextResponse.json(
        { error: "AI assistant is not active for this store." },
        { status: 403 },
      );
    }

    const { data: products } = await supabaseAdmin
      .from("products")
      .select("name,description,price,category,is_available")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false })
      .limit(30);

    const lowerMessage = normalize(message);
    const productReply = buildProductReply(message, (products || []) as ProductRow[]);

    let reply = productReply;

    if (!reply && (lowerMessage.includes("location") || lowerMessage.includes("where"))) {
      reply = business.location
        ? `${business.name} is located at ${business.location}.`
        : `The store location has not been provided yet. Please contact ${business.name} directly on WhatsApp.`;
    }

    if (!reply && (lowerMessage.includes("open") || lowerMessage.includes("time") || lowerMessage.includes("hours"))) {
      reply = business.opening_hours
        ? `${business.name} opening hours: ${business.opening_hours}.`
        : "Opening hours have not been provided yet. Please contact the store directly on WhatsApp.";
    }

    if (!reply && (lowerMessage.includes("whatsapp") || lowerMessage.includes("contact") || lowerMessage.includes("order"))) {
      const whatsapp = business.whatsapp || business.whatsapp_number || business.phone;

      reply = whatsapp
        ? `You can contact ${business.name} on WhatsApp here: ${whatsapp}.`
        : `Please use the contact button on this store page to reach ${business.name}.`;
    }

    if (!reply) {
      const storeDescription = business.description || business.tagline;

      reply = storeDescription
        ? `${business.name}: ${storeDescription} Please ask about products, prices, availability, delivery, or how to order.`
        : `I can help with questions about ${business.name}. Please ask about products, prices, availability, delivery, or how to order.`;
    }

    return NextResponse.json({ reply });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unable to process AI message.";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}