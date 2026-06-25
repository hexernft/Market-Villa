import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { checkRateLimit, getClientIdentifier } from "@/lib/rate-limit";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const allowedEvents = new Set([
  "store_view",
  "whatsapp_click",
  "copy_link",
  "share_click",
]);

function sanitizeSource(value: unknown) {
  return (
    String(value || "web")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "")
      .slice(0, 32) || "web"
  );
}

function sanitizeMetadata(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const encoded = JSON.stringify(value);

  if (encoded.length > 2048) {
    return { truncated: true };
  }

  return value;
}

export async function POST(request: Request) {
  try {
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Supabase service credentials are not configured." },
        { status: 500 }
      );
    }

    const body = await request.json();

    const businessId = String(body?.business_id || "").trim();
    const eventType = String(body?.event_type || "").trim();
    const source = sanitizeSource(body?.source);
    const clientId = getClientIdentifier(request);
    const rateLimit = checkRateLimit({
      key: `store-track:${clientId}:${businessId || "missing"}`,
      limit: 60,
      windowMs: 60_000,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many tracking events. Please try again shortly." },
        { status: 429 }
      );
    }

    if (!businessId) {
      return NextResponse.json(
        { error: "business_id is required." },
        { status: 400 }
      );
    }

    if (!allowedEvents.has(eventType)) {
      return NextResponse.json(
        { error: "Invalid event_type." },
        { status: 400 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const { data: business, error: businessError } = await supabaseAdmin
      .from("businesses")
      .select("id,is_published")
      .eq("id", businessId)
      .single();

    if (businessError || !business) {
      return NextResponse.json({ error: "Store not found." }, { status: 404 });
    }

    if (!business.is_published) {
      return NextResponse.json(
        { error: "Store is not published." },
        { status: 403 }
      );
    }

    await supabaseAdmin.from("store_events").insert({
      business_id: businessId,
      event_type: eventType,
      source,
      metadata: sanitizeMetadata(body?.metadata),
    });

    if (eventType === "store_view") {
      await supabaseAdmin.rpc("increment_store_views", {
        target_business_id: businessId,
      });
    }

    if (eventType === "whatsapp_click") {
      await supabaseAdmin.rpc("increment_whatsapp_clicks", {
        target_business_id: businessId,
      });
    }

    if (eventType === "copy_link") {
      await supabaseAdmin.rpc("increment_copy_link_clicks", {
        target_business_id: businessId,
      });
    }

    if (eventType === "share_click") {
      await supabaseAdmin.rpc("increment_share_clicks", {
        target_business_id: businessId,
      });
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unable to track store event.";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

