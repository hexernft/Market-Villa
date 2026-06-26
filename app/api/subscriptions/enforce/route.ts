import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const enforcementSecret = process.env.SUBSCRIPTION_ENFORCEMENT_SECRET || "";

export async function POST(request: Request) {
  try {
    const incomingSecret = request.headers.get("x-enforcement-secret") || "";
    const cronSecret = request.headers.get("authorization") || "";
    const expectedCronSecret = `Bearer ${enforcementSecret}`;

    if (
      !enforcementSecret ||
      (incomingSecret !== enforcementSecret && cronSecret !== expectedCronSecret)
    ) {
      return NextResponse.json(
        { error: "Unauthorized enforcement request." },
        { status: 401 },
      );
    }

    if (!supabaseUrl) {
      return NextResponse.json(
        { error: "NEXT_PUBLIC_SUPABASE_URL is not configured." },
        { status: 500 },
      );
    }

    if (!serviceRoleKey) {
      return NextResponse.json(
        { error: "SUPABASE_SERVICE_ROLE_KEY is not configured." },
        { status: 500 },
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const now = new Date();
    const nowIso = now.toISOString();

    const { data: businesses, error } = await supabaseAdmin
      .from("businesses")
      .select(
        `
        id,
        name,
        slug,
        is_published,
        subscription_plan,
        subscription_status,
        subscription_expires_at,
        subscription_grace_until,
        subscription_override_until,
        admin_override_active
      `,
      )
      .not("subscription_expires_at", "is", null);

    if (error) {
      throw error;
    }

    const eligibleBusinesses =
      businesses?.filter((business) => {
        if (business.admin_override_active === true) {
          return false;
        }

        if (business.subscription_override_until) {
          return new Date(business.subscription_override_until) < now;
        }

        return true;
      }) || [];

    const expiredBusinesses = eligibleBusinesses.filter((business) => {
      if (!business.subscription_grace_until) return false;

      return new Date(business.subscription_grace_until) < now;
    });

    const graceBusinesses = eligibleBusinesses.filter((business) => {
      if (!business.subscription_expires_at || !business.subscription_grace_until) {
        return false;
      }

      const expiresAt = new Date(business.subscription_expires_at);
      const graceEndsAt = new Date(business.subscription_grace_until);

      return now > expiresAt && now <= graceEndsAt;
    });

    const activeBusinesses = eligibleBusinesses.filter((business) => {
      if (!business.subscription_expires_at) return false;

      return new Date(business.subscription_expires_at) >= now;
    });

    if (expiredBusinesses.length > 0) {
      const expiredIds = expiredBusinesses.map((business) => business.id);

      const { error: expiredUpdateError } = await supabaseAdmin
        .from("businesses")
        .update({
          subscription_status: "expired",
          is_published: false,
          updated_at: nowIso,
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
          updated_at: nowIso,
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
          updated_at: nowIso,
        })
        .in("id", activeIds);

      if (activeUpdateError) {
        throw activeUpdateError;
      }
    }

    return NextResponse.json({
      success: true,
      checked: businesses?.length || 0,
      enforced: eligibleBusinesses.length,
      skippedByAdminOverride:
        (businesses?.length || 0) - eligibleBusinesses.length,
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

