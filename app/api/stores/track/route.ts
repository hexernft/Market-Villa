import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const allowedEvents = new Set([
  "store_view",
  "whatsapp_click",
  "copy_link",
  "share_click",
]);

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
    const source = String(body?.source || "web").trim();

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

    await supabaseAdmin.from("store_events").insert({
      business_id: businessId,
      event_type: eventType,
      source,
      metadata: body?.metadata || {},
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