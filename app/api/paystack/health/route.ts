import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    appUrlConfigured: Boolean(process.env.NEXT_PUBLIC_APP_URL),
    supabaseUrlConfigured: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    supabaseAnonConfigured: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    supabaseServiceConfigured: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    paystackSecretConfigured: Boolean(process.env.PAYSTACK_SECRET_KEY),
    enforcementSecretConfigured: Boolean(
      process.env.SUBSCRIPTION_ENFORCEMENT_SECRET
    ),
  });
}

