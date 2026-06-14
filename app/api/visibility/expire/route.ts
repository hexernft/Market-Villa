import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const enforcementSecret = process.env.ENFORCEMENT_SECRET || "";

export async function GET(request: Request) {
  try {
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Supabase service credentials are not configured." },
        { status: 500 }
      );
    }

    const url = new URL(request.url);
    const secret = url.searchParams.get("secret") || "";
    const cronHeader = request.headers.get("x-vercel-cron");

    if (enforcementSecret && secret !== enforcementSecret && !cronHeader) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }) as any;

    const now = new Date().toISOString();

    const { data: expiredBusinesses, error: expiredBusinessesError } =
      await supabaseAdmin
        .from("businesses")
        .select("id,name,slug,featured_until,visibility_plan")
        .eq("is_featured", true)
        .not("featured_until", "is", null)
        .lt("featured_until", now);

    if (expiredBusinessesError) {
      throw expiredBusinessesError;
    }

    const expiredIds = (expiredBusinesses || []).map(
      (business: { id: string }) => business.id
    );

    if (expiredIds.length > 0) {
      const { error: businessUpdateError } = await supabaseAdmin
        .from("businesses")
        .update({
          is_featured: false,
          featured_until: null,
          visibility_plan: "standard",
          updated_at: now,
        })
        .in("id", expiredIds);

      if (businessUpdateError) {
        throw businessUpdateError;
      }

      const { error: requestUpdateError } = await supabaseAdmin
        .from("visibility_requests")
        .update({
          status: "expired",
          admin_note: "Visibility placement expired automatically.",
          updated_at: now,
        })
        .in("business_id", expiredIds)
        .eq("status", "approved")
        .not("expires_at", "is", null)
        .lt("expires_at", now);

      if (requestUpdateError) {
        throw requestUpdateError;
      }
    }

    return NextResponse.json({
      success: true,
      checkedAt: now,
      expiredCount: expiredIds.length,
      expiredBusinesses: expiredBusinesses || [],
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Unable to expire visibility placements.";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}