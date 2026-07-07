import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { businessThemes } from "@/lib/themes";
import { getThemeBusinessMode } from "@/lib/business-modes";
import { getThemeAccessDecision } from "@/lib/theme-access";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

function getBearerToken(request: Request) {
  const authHeader = request.headers.get("authorization") || "";

  if (!authHeader.startsWith("Bearer ")) return "";

  return authHeader.replace("Bearer ", "").trim();
}

function isMissingExtensionsTable(error: unknown) {
  const message = error instanceof Error ? error.message : String(error || "");

  return (
    message.includes("business_theme_extensions") ||
    message.includes("schema cache") ||
    message.includes("does not exist")
  );
}

export async function POST(request: Request) {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: "Supabase environment variables are not configured." },
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
        { error: "You must be logged in to activate a theme." },
        { status: 401 },
      );
    }

    const body = await request.json();
    const businessId = String(body.businessId || "").trim();
    const themeId = String(body.themeId || "").trim();

    if (!businessId || !themeId) {
      return NextResponse.json(
        { error: "Business and theme are required." },
        { status: 400 },
      );
    }

    const theme = businessThemes.find((item) => item.id === themeId);

    if (!theme) {
      return NextResponse.json(
        { error: "Selected theme does not exist." },
        { status: 404 },
      );
    }

    const { data: business, error: businessError } = await supabaseAdmin
      .from("businesses")
      .select(
        "id,owner_id,business_mode,subscription_plan,subscription_status,subscription_expires_at,subscription_grace_until,admin_override_active,theme_settings",
      )
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
        { error: "You can only activate themes for your own business." },
        { status: 403 },
      );
    }

    const themeMode = getThemeBusinessMode(themeId);
    const businessMode = String(business.business_mode || "products");

    if (themeMode !== businessMode) {
      return NextResponse.json(
        {
          error:
            themeMode === "cars"
              ? "Car themes are only available for car dealers."
              : themeMode === "properties"
                ? "Property themes are only available for property businesses."
                : "This theme is only available for product businesses.",
        },
        { status: 403 },
      );
    }

    const { data: extensions, error: extensionsError } = await supabaseAdmin
      .from("business_theme_extensions")
      .select("business_id,theme_id,status,expires_at")
      .eq("business_id", businessId);

    if (extensionsError && !isMissingExtensionsTable(extensionsError)) {
      return NextResponse.json(
        { error: "Unable to verify theme access." },
        { status: 500 },
      );
    }

    const decision = getThemeAccessDecision({
      theme,
      business,
      extensions: extensionsError ? [] : extensions || [],
    });

    if (!decision.allowed) {
      return NextResponse.json(
        { error: decision.reason || "You do not have access to this theme." },
        { status: 403 },
      );
    }

    const { data, error } = await supabaseAdmin
      .from("businesses")
      .update({
        theme_id: themeId,
        theme_settings: {
          ...(((business as any).theme_settings || {}) as Record<string, any>),
          themeId,
        },
        updated_at: new Date().toISOString(),
      })
      .eq("id", businessId)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Unable to activate theme." },
        { status: 500 },
      );
    }

    return NextResponse.json({ business: data, access: decision });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to activate theme.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
