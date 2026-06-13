import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const enforcementSecret = process.env.SUBSCRIPTION_ENFORCEMENT_SECRET || "";

export async function POST(request: Request) {
  try {
    const incomingSecret = request.headers.get("x-enforcement-secret") || "";

    if (!enforcementSecret || incomingSecret !== enforcementSecret) {
      return NextResponse.json(
        { error: "Unauthorized enforcement request." },
        { status: 401 }
      );
    }

    if (!serviceRoleKey) {
      return NextResponse.json(
        { error: "SUPABASE_SERVICE_ROLE_KEY is not configured." },
        { status: 500 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const now = new Date().toISOString();

    const { data: businesses, error } = await supabaseAdmin
      .from("businesses")
      .select(
        `
        id,
        name,
        slug,
        is_published,
        subscription_status,
        subscription_expires_at,
        grace_period_ends_at,
        admin_override_active
      `
      )
      .eq("admin_override_active", false)
      .not("subscription_expires_at", "is", null);

    if (error) {
      throw error;
    }

    const expiredBusinesses =
      businesses?.filter((business) => {
        if (!business.grace_period_ends_at) return false;
        return new Date(business.grace_period_ends_at) < new Date(now);
      }) || [];

    const graceBusinesses =
      businesses?.filter((business) => {
        if (!business.subscription_expires_at || !business.grace_period_ends_at) {
          return false;
        }

        const expiresAt = new Date(business.subscription_expires_at);
        const graceEndsAt = new Date(business.grace_period_ends_at);
        const currentDate = new Date(now);

        return currentDate > expiresAt && currentDate <= graceEndsAt;
      }) || [];

    const activeBusinesses =
      businesses?.filter((business) => {
        if (!business.subscription_expires_at) return false;
        return new Date(business.subscription_expires_at) >= new Date(now);
      }) || [];

    if (expiredBusinesses.length > 0) {
      const expiredIds = expiredBusinesses.map((business) => business.id);

      const { error: expiredUpdateError } = await supabaseAdmin
        .from("businesses")
        .update({
          subscription_status: "expired",
          is_published: false,
          updated_at: now,
        })
        .in("id", expiredIds);

      if (expiredUpdateError) {
        throw expiredUpdateError;
      }
    }

    if (graceBusinesses.length > 0) {
      const graceIds = graceBusinesses.map((business) => business.id);

      const { error: graceUpdateError } = await supabaseAdmin
        .from("businesses")
        .update({
          subscription_status: "grace_period",
          is_published: true,
          updated_at: now,
        })
        .in("id", graceIds);

      if (graceUpdateError) {
        throw graceUpdateError;
      }
    }

    if (activeBusinesses.length > 0) {
      const activeIds = activeBusinesses.map((business) => business.id);

      const { error: activeUpdateError } = await supabaseAdmin
        .from("businesses")
        .update({
          subscription_status: "active",
          is_published: true,
          updated_at: now,
        })
        .in("id", activeIds);

      if (activeUpdateError) {
        throw activeUpdateError;
      }
    }

    return NextResponse.json({
      success: true,
      checked: businesses?.length || 0,
      active: activeBusinesses.length,
      gracePeriod: graceBusinesses.length,
      expired: expiredBusinesses.length,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Unable to enforce subscriptions.";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}