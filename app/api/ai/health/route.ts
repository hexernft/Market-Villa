import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    openaiKeyConfigured: Boolean(process.env.OPENAI_API_KEY),
    openaiModel: process.env.OPENAI_MODEL || "gpt-5-mini",
  });
}