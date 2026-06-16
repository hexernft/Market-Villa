import { NextResponse } from "next/server";
import OpenAI from "openai";

type SupportRequestBody = {
  message?: unknown;
};

export async function POST(request: Request) {
  try {
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

    const message = String(body?.message || "").trim();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required." },
        { status: 400 },
      );
    }

    const openai = new OpenAI({
      apiKey: openaiApiKey,
    });

    const response = await openai.responses.create({
      model,
      input: [
        {
          role: "system",
          content:
            "You are Market Villa Support Assistant. Market Villa helps small businesses create professional WhatsApp-ready business pages. Answer clearly, briefly, and practically. Help users with signup, onboarding, products, services, orders, billing, Paystack payments, custom domains, and store publishing. If a question requires account-specific action, tell the user to contact support or check their dashboard. Do not invent payment status, subscription status, or private account data.",
        },
        {
          role: "user",
          content: message,
        },
      ],
      max_output_tokens: 450,
    });

    const reply =
      response.output_text?.trim() || "I could not generate a response.";

    return NextResponse.json({
      success: true,
      reply,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unable to process AI request.";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
