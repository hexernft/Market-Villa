import { supabase } from "@/lib/supabase";
import { normalizePlanId } from "@/lib/plans";
import { businessThemes, getBusinessTheme } from "@/lib/themes";

export type ThemeExtensionStatus = "active" | "inactive" | "expired" | "revoked";

export type BusinessThemeExtension = {
  id: string;
  business_id: string;
  theme_id: string;
  status: ThemeExtensionStatus;
  purchased_at?: string | null;
  expires_at?: string | null;
};

export type ThemeEditorBusiness = {
  id: string;
  name: string;
  slug: string;
  theme_id?: string | null;
  subscription_plan?: string | null;
  admin_override_active?: boolean | null;
  logo_url?: string | null;
  cover_image_url?: string | null;
  opening_hours?: string | null;
  instagram_url?: string | null;
  theme_settings?: Record<string, any> | null;
};

const proThemeIds = new Set(["suya-spot-pro", "premium-treats"]);

function isMissingExtensionsTable(error: unknown) {
  const message = error instanceof Error ? error.message : String(error || "");

  return (
    message.includes("business_theme_extensions") ||
    message.includes("schema cache") ||
    message.includes("does not exist")
  );
}

export function isProTheme(themeId: string) {
  return proThemeIds.has(themeId);
}

export function canEditProTheme({
  business,
  themeId,
  extensions,
}: {
  business: ThemeEditorBusiness | null | undefined;
  themeId: string;
  extensions: BusinessThemeExtension[];
}) {
  if (!business) return false;
  if (!isProTheme(themeId)) return true;
  if (business.admin_override_active) return true;

  const planId = normalizePlanId(business.subscription_plan);
  if (planId === "pro") return true;

  return extensions.some(
    (extension) =>
      extension.business_id === business.id &&
      extension.theme_id === themeId &&
      extension.status === "active",
  );
}

export async function getPurchasedThemeExtensions(businessId: string) {
  const { data, error } = await supabase
    .from("business_theme_extensions")
    .select("*")
    .eq("business_id", businessId);

  if (error) {
    if (isMissingExtensionsTable(error)) return [];
    throw error;
  }

  return (data || []) as BusinessThemeExtension[];
}

export async function getBusinessThemeEditorData() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) throw new Error("You must be logged in.");

  const { data: businesses, error } = await supabase
    .from("businesses")
    .select(
      "id,name,slug,theme_id,subscription_plan,admin_override_active,logo_url,cover_image_url,opening_hours,instagram_url,theme_settings",
    )
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;

  const firstBusiness = (businesses || [])[0] as ThemeEditorBusiness | undefined;
  const extensions = firstBusiness
    ? await getPurchasedThemeExtensions(firstBusiness.id)
    : [];

  return {
    businesses: (businesses || []) as ThemeEditorBusiness[],
    extensions,
    themes: businessThemes.filter((theme) =>
      ["default-one-page", "suya-spot-pro", "premium-treats"].includes(theme.id),
    ),
  };
}

export async function updateBusinessThemeSettings({
  businessId,
  themeId,
  settings,
}: {
  businessId: string;
  themeId: string;
  settings: Record<string, any>;
}) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) throw new Error("You must be logged in.");

  const { data: business, error: businessError } = await supabase
    .from("businesses")
    .select(
      "id,owner_id,name,slug,theme_id,subscription_plan,admin_override_active,theme_settings",
    )
    .eq("id", businessId)
    .single();

  if (businessError) throw businessError;
  if (!business || business.owner_id !== user.id) {
    throw new Error("You can only edit themes for your own business.");
  }

  const extensions = await getPurchasedThemeExtensions(businessId);
  const allowed = canEditProTheme({
    business: business as ThemeEditorBusiness,
    themeId,
    extensions,
  });

  if (!allowed) {
    throw new Error("Purchase or upgrade to edit this Pro theme.");
  }

  getBusinessTheme(themeId);

  const currentSettings = ((business as any).theme_settings || {}) as Record<
    string,
    any
  >;
  const nextSettings = {
    ...currentSettings,
    ...settings,
    themeId,
  };

  const { data, error } = await supabase
    .from("businesses")
    .update({
      theme_id: themeId,
      theme_settings: nextSettings,
      updated_at: new Date().toISOString(),
    })
    .eq("id", businessId)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function resetBusinessThemeSettings({
  businessId,
  themeId,
}: {
  businessId: string;
  themeId: string;
}) {
  return updateBusinessThemeSettings({
    businessId,
    themeId,
    settings: {
      themeId,
      logo_url: null,
      hero_image_url: null,
      grill_hero_image_url: null,
      announcement_text: "",
      opening_hours: "",
      hero_title: "",
      hero_subtitle: "",
      primary_color: "",
      fire_color: "",
      dark_color: "",
      show_gallery: true,
      show_party_packs: true,
      show_bulk_cta: true,
      navbar_logo_size: "medium",
      navbar_style: "sticky",
      font_heading: "grill",
      font_body: "manrope",
      whatsapp_cta_text: "",
      footer_text: "",
    },
  });
}
