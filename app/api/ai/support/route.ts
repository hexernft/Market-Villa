import { NextResponse } from "next/server";
import { checkRateLimit, getClientIdentifier } from "@/lib/rate-limit";

type SupportRequestBody = {
  message?: unknown;
};

function extractOutputText(result: any) {
  if (typeof result.output_text === "string" && result.output_text.trim()) {
    return result.output_text.trim();
  }

  const output = Array.isArray(result.output) ? result.output : [];

  return output
    .flatMap((item: any) => {
      const content = Array.isArray(item.content) ? item.content : [];

      return content.map((contentItem: any) => {
        if (typeof contentItem.text === "string") return contentItem.text;
        if (typeof contentItem.output_text === "string") return contentItem.output_text;
        return "";
      });
    })
    .join("")
    .trim();
}

export async function POST(request: Request) {
  try {
    const clientId = getClientIdentifier(request);
    const rateLimit = checkRateLimit({
      key: `support-chat:${clientId}`,
      limit: 10,
      windowMs: 60_000,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many support messages. Please try again shortly." },
        { status: 429 },
      );
    }

    const openaiApiKey = process.env.OPENAI_API_KEY || "";
    const model = process.env.OPENAI_MODEL || "gpt-5-mini";

    if (!openaiApiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not configured." },
        { status: 500 },
      );
    }

    let body: SupportRequestBody;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body. Please send a JSON message." },
        { status: 400 },
      );
    }

    const message = String(body.message || "").trim().slice(0, 1200);

    if (!message) {
      return NextResponse.json(
        { error: "Please enter a message." },
        { status: 400 },
      );
    }

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model,
        instructions:
          "You are Market Villa Support Assistant. Market Villa helps small businesses create professional WhatsApp-ready storefront pages. Answer clearly, briefly, and practically. Help users with signup, onboarding, products, orders, billing, Paystack payments, custom domains, store publishing, visibility, pricing, and AI assistant requests. If a question requires account-specific action, tell the user to check their dashboard or contact support. Do not invent payment status, subscription status, or private account data.",
        input: message,
        max_output_tokens: 260,
        reasoning: {
          effort: "minimal",
        },
        store: false,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error:
            result.error?.message ||
            "AI support is unavailable right now. Please try again shortly.",
        },
        { status: response.status },
      );
    }

    const reply =
      extractOutputText(result) ||
      "I can help with Market Villa setup, products, orders, billing, domains, publishing, visibility, and AI assistant requests. What would you like to do?";

    return NextResponse.json({
      success: true,
      reply,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unable to contact AI support.";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
