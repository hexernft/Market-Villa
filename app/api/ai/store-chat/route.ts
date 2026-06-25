import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { checkRateLimit, getClientIdentifier } from "@/lib/rate-limit";

type ProductRow = {
  name?: string | null;
  description?: string | null;
  price?: number | null;
  category?: string | null;
  is_available?: boolean | null;
};

type ChatHistoryItem = {
  role?: "assistant" | "user";
  content?: string;
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
  const availableProducts = products.filter(
    (product) => product.is_available !== false,
  );

  if (!availableProducts.length) return "";

  const lowerMessage = normalize(message);

  const matchedProduct = availableProducts.find((product) => {
    const name = normalize(product.name);
    const category = normalize(product.category);

    return (
      Boolean(name && lowerMessage.includes(name)) ||
      Boolean(category && lowerMessage.includes(category))
    );
  });

  if (matchedProduct) {
    return `${matchedProduct.name} is available. ${
      matchedProduct.description || ""
    } Price: ${formatCurrency(
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

function buildStoreContext({
  business,
  products,
  aiRequest,
}: {
  business: any;
  products: ProductRow[];
  aiRequest: any;
}) {
  const productLines =
    products.length > 0
      ? products
          .filter((product) => product.is_available !== false)
          .slice(0, 30)
          .map((product) => {
            return `- ${product.name || "Unnamed item"} | ${
              product.category || "No category"
            } | ${formatCurrency(product.price)} | ${
              product.description || "No description"
            }`;
          })
          .join("\n")
      : "No products have been added yet.";

  return `
Store name: ${business.name || "Store"}
Description: ${business.description || business.tagline || "Not provided"}
Location: ${business.location || "Not provided"}
Opening hours: ${business.opening_hours || "Not provided"}
WhatsApp/contact: ${
    business.whatsapp ||
    business.whatsapp_number ||
    business.phone ||
    "Use the contact button on the store page"
  }

AI tone requested by business: ${aiRequest?.business_tone || "friendly"}
Business AI notes: ${
    business.ai_assistant_notes || aiRequest?.training_notes || "Not provided"
  }

Common customer questions:
${aiRequest?.common_questions || "Not provided"}

Products/services:
${productLines}
`.trim();
}

function buildPrompt({
  business,
  message,
  history,
  storeContext,
}: {
  business: any;
  message: string;
  history: ChatHistoryItem[];
  storeContext: string;
}) {
  const historyText =
    history.length > 0
      ? history
          .slice(-8)
          .map((item) => `${item.role || "user"}: ${item.content || ""}`)
          .join("\n")
      : "No previous messages.";

  return `
Store context:
${storeContext}

Recent chat history:
${historyText}

Customer message:
${message}
`.trim();
}

async function generateOpenAiReply({
  businessName,
  prompt,
}: {
  businessName: string;
  prompt: string;
}) {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";

  if (!apiKey) return "";

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      instructions: `
You are the AI assistant for ${businessName || "this store"} on Market Villa.

Your job:
- Help customers understand this store's products, prices, availability, delivery, location, and how to order.
- Keep replies short, friendly, and useful.
- Guide customers toward WhatsApp or the store contact button when they want to order.
- Do not answer as Market Villa's platform assistant. You are answering for this store only.

Important rules:
- Do not invent prices, locations, delivery promises, opening hours, or availability.
- If the information is not in the store context, say you are not fully sure and ask the customer to contact the store directly.
- Do not promise that an order is confirmed.
- Do not claim payment has been received.
- If a customer asks for something unrelated to the store, politely redirect them to store-related questions.
      `.trim(),
      input: prompt,
      max_output_tokens: 280,
      store: false,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error?.message || "OpenAI provider error.");
  }

  return String(result.output_text || "").trim();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const businessId = String(body.businessId || "").trim();
    const message = String(body.message || "").trim().slice(0, 1200);
    const history = Array.isArray(body.history)
      ? (body.history as ChatHistoryItem[]).slice(-8).map((item) => ({
          role: item.role === "assistant" ? ("assistant" as const) : ("user" as const),
          content: String(item.content || "").slice(0, 800),
        }))
      : [];
    const clientId = getClientIdentifier(request);
    const rateLimit = checkRateLimit({
      key: `store-chat:${clientId}:${businessId || "missing"}`,
      limit: 12,
      windowMs: 60_000,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many messages. Please try again shortly." },
        { status: 429 },
      );
    }

    if (!businessId || !message.trim()) {
      return NextResponse.json(
        { error: "businessId and message are required." },
        { status: 400 },
      );
    }

    const { data: business, error: businessError } = await supabaseAdmin
      .from("businesses")
      .select(
        "id,name,description,tagline,location,phone,whatsapp,whatsapp_number,opening_hours,is_published,ai_assistant_enabled,ai_assistant_status,ai_assistant_notes",
      )
      .eq("id", businessId)
      .single();

    if (businessError || !business) {
      return NextResponse.json({ error: "Store not found." }, { status: 404 });
    }

    if (!business.is_published) {
      return NextResponse.json(
        { error: "Store is not published." },
        { status: 403 },
      );
    }

    if (
      !business.ai_assistant_enabled ||
      business.ai_assistant_status !== "active"
    ) {
      return NextResponse.json(
        { error: "AI assistant is not active for this store." },
        { status: 403 },
      );
    }

    const [{ data: products }, { data: aiRequests }] = await Promise.all([
      supabaseAdmin
        .from("products")
        .select("name,description,price,category,is_available")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false })
        .limit(30),
      supabaseAdmin
        .from("ai_assistant_requests")
        .select(
          "business_tone,common_questions,training_notes,budget,priority,status,admin_note",
        )
        .eq("business_id", businessId)
        .order("created_at", { ascending: false })
        .limit(1),
    ]);

    const productItems = (products || []) as ProductRow[];
    const aiRequest = aiRequests?.[0] || null;

    const storeContext = buildStoreContext({
      business,
      products: productItems,
      aiRequest,
    });

    const prompt = buildPrompt({
      business,
      message,
      history,
      storeContext,
    });

    let reply = "";

    try {
      reply = await generateOpenAiReply({
        businessName: business.name || "this store",
        prompt,
      });
    } catch {
      reply = "";
    }

    if (!reply) {
      reply =
        buildProductReply(message, productItems) ||
        `I can help with questions about ${
          business.name || "this store"
        }. Please ask about products, prices, availability, delivery, or how to order.`;
    }

    return NextResponse.json({ reply });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unable to process AI message.";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
