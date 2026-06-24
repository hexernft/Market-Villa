"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Eye,
  LayoutTemplate,
  Loader2,
  Palette,
  Save,
  Sparkles,
} from "lucide-react";
import { getMyBusinesses } from "@/lib/business-actions";
import { supabase } from "@/lib/supabase";

type ThemeSettings = {
  colorTheme?: "market-purple" | "warm-boutique" | "neon-rail" | "editorial" | "edge-blue" | "baby-bloom";
  heroStyle?: "split" | "edge" | "carousel" | "minimal" | "product-first" | "storefront-pro";
  heroSize?: "slim" | "medium" | "bold";
  productCardStyle?: "soft" | "bordered" | "shadow" | "dark" | "playful" | "editorial" | "retail-grid";
  navbarStyle?: "none" | "simple" | "centered" | "floating" | "pill" | "ecommerce";
  footerStyle?: "simple" | "dark" | "branded" | "compact" | "full";
  toggles?: {
    showHero?: boolean;
    showNavbar?: boolean;
    showHomeLink?: boolean;
    showProductsLink?: boolean;
    showAboutLink?: boolean;
    showContactLink?: boolean;
    showHeroText?: boolean;
    showHeroButtons?: boolean;
    showPrices?: boolean;
    showProductWhatsapp?: boolean;
    showAboutSection?: boolean;
    showFooter?: boolean;
    showMarketVillaBadge?: boolean;
  };
};

type DashboardBusiness = {
  id: string;
  name: string;
  slug: string;
  theme_settings?: ThemeSettings | null;
};

const defaultSettings: ThemeSettings = {
  colorTheme: "market-purple",
  heroStyle: "split",
  heroSize: "slim",
  productCardStyle: "soft",
  navbarStyle: "simple",
  footerStyle: "dark",
  toggles: {
    showHero: true,
    showNavbar: true,
    showHomeLink: true,
    showProductsLink: true,
    showAboutLink: true,
    showContactLink: true,
    showHeroText: true,
    showHeroButtons: true,
    showPrices: true,
    showProductWhatsapp: true,
    showAboutSection: true,
    showFooter: true,
    showMarketVillaBadge: true,
  },
};

const colorThemes = [
  {
    id: "market-purple",
    name: "Market Purple",
    description: "Clean lavender, deep purple, and premium white.",
    swatches: ["#241436", "#7c3aed", "#f7f1ff"],
  },
  {
    id: "warm-boutique",
    name: "Warm Boutique",
    description: "Cream, terracotta, and soft brown.",
    swatches: ["#431407", "#9a3412", "#fff7ed"],
  },
  {
    id: "neon-rail",
    name: "Neon Rail",
    description: "Dark modern style with cyan and lime accents.",
    swatches: ["#050816", "#67e8f9", "#bef264"],
  },
  {
    id: "editorial",
    name: "Editorial Gold",
    description: "Ivory, charcoal, and muted gold.",
    swatches: ["#201711", "#8b5e25", "#fffaf2"],
  },
  {
    id: "edge-blue",
    name: "Edge Blue",
    description: "Slate, sky blue, and clean white.",
    swatches: ["#0f172a", "#0284c7", "#eef6fb"],
  },
  {
    id: "baby-bloom",
    name: "Baby Bloom",
    description: "Cute pink, cream, and lavender.",
    swatches: ["#3b1020", "#ec4899", "#fff1f8"],
  },
] as const;

const heroStyles = [
  { id: "split", name: "Split Hero", description: "Text and image side by side." },
  { id: "edge", name: "End-to-End Hero", description: "Wide banner image, not too tall." },
  { id: "carousel", name: "Carousel Hero", description: "Rotating image/offer section." },
  { id: "minimal", name: "Minimal Hero", description: "Small intro with products pushed up." },
  { id: "product-first", name: "Product First", description: "Products appear immediately." },
  { id: "storefront-pro", name: "Storefront Pro", description: "Ecommerce-style hero with shop structure." },
] as const;

const productCardStyles = [
  { id: "soft", name: "Soft Cards" },
  { id: "bordered", name: "Bordered Cards" },
  { id: "shadow", name: "Premium Shadow" },
  { id: "dark", name: "Dark Cards" },
  { id: "playful", name: "Playful Cards" },
  { id: "editorial", name: "Editorial Cards" },
  { id: "retail-grid", name: "Retail Grid" },
] as const;

const navbarStyles = [
  { id: "none", name: "No Navbar" },
  { id: "simple", name: "Simple" },
  { id: "centered", name: "Centered" },
  { id: "floating", name: "Floating" },
  { id: "pill", name: "Pill Navbar" },
  { id: "ecommerce", name: "Ecommerce Navbar" },
] as const;

const footerStyles = [
  { id: "simple", name: "Simple Footer" },
  { id: "dark", name: "Dark Footer" },
  { id: "branded", name: "Branded Footer" },
  { id: "compact", name: "Compact Footer" },
  { id: "full", name: "Full Footer" },
] as const;

function mergeSettings(settings?: ThemeSettings | null): ThemeSettings {
  return {
    ...defaultSettings,
    ...(settings || {}),
    toggles: {
      ...defaultSettings.toggles,
      ...(settings?.toggles || {}),
    },
  };
}

function OptionCard({
  active,
  title,
  description,
  onClick,
  children,
}: {
  active: boolean;
  title: string;
  description?: string;
  onClick: () => void;
  children?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[1.2rem] border p-4 text-left transition hover:-translate-y-0.5 ${
        active
          ? "border-[#7c3aed] bg-[#f7f1ff] shadow-[0_14px_35px_rgba(124,58,237,0.13)]"
          : "border-slate-200 bg-white hover:border-[#7c3aed]/35"
      }`}
    >
      {children}
      <p className="mt-3 text-sm font-black text-slate-950">{title}</p>
      {description ? (
        <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
      ) : null}
    </button>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
    </label>
  );
}

export default function CustomizeStorePage() {
  const [businesses, setBusinesses] = useState<DashboardBusiness[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [settings, setSettings] = useState<ThemeSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  const selectedBusiness = useMemo(() => {
    return businesses.find((business) => business.id === selectedBusinessId);
  }, [businesses, selectedBusinessId]);

  const selectedColorTheme = colorThemes.find(
    (theme) => theme.id === settings.colorTheme,
  ) || colorThemes[0];

  async function loadBusinesses() {
    setIsLoading(true);
    setMessage("");

    try {
      const items = (await getMyBusinesses()) as DashboardBusiness[];

      const { data, error } = await supabase
        .from("businesses")
        .select("id,name,slug,theme_settings")
        .in(
          "id",
          items.map((item) => item.id),
        );

      if (error) throw error;

      const loadedBusinesses = (data || []) as DashboardBusiness[];
      setBusinesses(loadedBusinesses);

      if (loadedBusinesses.length > 0) {
        setSelectedBusinessId(loadedBusinesses[0].id);
        setSettings(mergeSettings(loadedBusinesses[0].theme_settings));
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to load stores.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadBusinesses();
  }, []);

  function handleBusinessChange(businessId: string) {
    const business = businesses.find((item) => item.id === businessId);

    setSelectedBusinessId(businessId);
    setSettings(mergeSettings(business?.theme_settings));
  }

  function updateSettings(update: Partial<ThemeSettings>) {
    setSettings((current) => ({
      ...current,
      ...update,
    }));
  }

  function updateToggle(key: keyof NonNullable<ThemeSettings["toggles"]>, value: boolean) {
    setSettings((current) => ({
      ...current,
      toggles: {
        ...(current.toggles || {}),
        [key]: value,
      },
    }));
  }

  async function saveSettings() {
    if (!selectedBusinessId) {
      setMessage("Select a store first.");
      return;
    }

    setIsSaving(true);
    setMessage("");

    try {
      const { error } = await supabase
        .from("businesses")
        .update({
          theme_settings: settings,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedBusinessId);

      if (error) throw error;

      setMessage("Customization saved.");

      setBusinesses((current) =>
        current.map((business) =>
          business.id === selectedBusinessId
            ? { ...business, theme_settings: settings }
            : business,
        ),
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save settings.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <main className="grid min-h-[60vh] place-items-center">
        <Loader2 className="animate-spin text-[#7c3aed]" size={30} />
      </main>
    );
  }

  return (
    <div className="grid gap-5">
      <section className="rounded-[1.75rem] border border-[#e6d9f2] bg-[#211331] p-5 text-white shadow-[0_24px_70px_rgba(36,20,54,0.18)] md:p-7">
        <div className="grid gap-5 xl:grid-cols-[1fr_0.7fr] xl:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-white/75">
              <Palette size={14} />
              Controlled Store Customizer
            </span>

            <h1 className="mt-5 max-w-2xl text-4xl font-semibold leading-tight tracking-[-0.055em] md:text-5xl">
              Build a custom-looking store from premium blocks.
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70">
              Choose a color theme, hero style, product cards, navbar style,
              footer style, and section toggles. No messy manual color picking.
            </p>
          </div>

          <div className="rounded-[1.35rem] border border-white/12 bg-white/10 p-4">
            <p className="text-sm font-semibold">Selected store</p>

            <select
              value={selectedBusinessId}
              onChange={(event) => handleBusinessChange(event.target.value)}
              className="mt-3 min-h-11 w-full rounded-2xl border border-white/15 bg-white px-4 text-sm font-semibold text-slate-900 outline-none"
            >
              {businesses.map((business) => (
                <option key={business.id} value={business.id}>
                  {business.name} — /store/{business.slug}
                </option>
              ))}
            </select>

            {selectedBusiness ? (
              <a
                href={`/store/${selectedBusiness.slug}`}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-2 text-xs font-semibold text-white hover:bg-white/18"
              >
                <Eye size={14} />
                Preview live store
              </a>
            ) : null}
          </div>
        </div>
      </section>

      {message ? (
        <div className="rounded-2xl bg-white p-3 text-sm text-slate-700 shadow-sm">
          {message}
        </div>
      ) : null}

      <section className="grid gap-5 xl:grid-cols-[1fr_0.8fr]">
        <div className="grid gap-5">
          <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="flex items-center gap-2 text-xl font-black tracking-[-0.04em] text-slate-950">
              <Palette size={20} className="text-[#7c3aed]" />
              1. Choose color theme
            </h2>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {colorThemes.map((theme) => (
                <OptionCard
                  key={theme.id}
                  active={settings.colorTheme === theme.id}
                  title={theme.name}
                  description={theme.description}
                  onClick={() =>
                    updateSettings({
                      colorTheme: theme.id,
                    })
                  }
                >
                  <div className="flex gap-2">
                    {theme.swatches.map((color) => (
                      <span
                        key={color}
                        className="h-8 w-8 rounded-full border border-white shadow-sm ring-1 ring-slate-200"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </OptionCard>
              ))}
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="flex items-center gap-2 text-xl font-black tracking-[-0.04em] text-slate-950">
              <LayoutTemplate size={20} className="text-[#7c3aed]" />
              2. Choose layout blocks
            </h2>

            <div className="mt-5 grid gap-5">
              <div>
                <p className="text-sm font-black text-slate-900">Hero style</p>
                <div className="mt-3 grid gap-3 md:grid-cols-3">
                  {heroStyles.map((style) => (
                    <OptionCard
                      key={style.id}
                      active={settings.heroStyle === style.id}
                      title={style.name}
                      description={style.description}
                      onClick={() => updateSettings({ heroStyle: style.id })}
                    />
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-black text-slate-900">Hero size</p>
                <div className="mt-3 grid gap-3 md:grid-cols-3">
                  {["slim", "medium", "bold"].map((size) => (
                    <OptionCard
                      key={size}
                      active={settings.heroSize === size}
                      title={size}
                      onClick={() =>
                        updateSettings({
                          heroSize: size as ThemeSettings["heroSize"],
                        })
                      }
                    />
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-black text-slate-900">
                  Product card style
                </p>
                <div className="mt-3 grid gap-3 md:grid-cols-3">
                  {productCardStyles.map((style) => (
                    <OptionCard
                      key={style.id}
                      active={settings.productCardStyle === style.id}
                      title={style.name}
                      onClick={() =>
                        updateSettings({ productCardStyle: style.id })
                      }
                    />
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-black text-slate-900">Navbar style</p>
                <div className="mt-3 grid gap-3 md:grid-cols-3">
                  {navbarStyles.map((style) => (
                    <OptionCard
                      key={style.id}
                      active={settings.navbarStyle === style.id}
                      title={style.name}
                      onClick={() =>
                        updateSettings({
                          navbarStyle: style.id,
                          toggles: {
                            ...settings.toggles,
                            showNavbar: style.id !== "none",
                          },
                        })
                      }
                    />
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-black text-slate-900">Footer style</p>
                <div className="mt-3 grid gap-3 md:grid-cols-4">
                  {footerStyles.map((style) => (
                    <OptionCard
                      key={style.id}
                      active={settings.footerStyle === style.id}
                      title={style.name}
                      onClick={() => updateSettings({ footerStyle: style.id })}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-black tracking-[-0.04em] text-slate-950">
              3. Show / hide items
            </h2>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <ToggleRow
                label="Show hero section"
                checked={settings.toggles?.showHero !== false}
                onChange={(value) => updateToggle("showHero", value)}
              />
              <ToggleRow
                label="Show navbar"
                checked={settings.toggles?.showNavbar !== false}
                onChange={(value) => updateToggle("showNavbar", value)}
              />
              <ToggleRow
                label="Navbar: Home"
                checked={settings.toggles?.showHomeLink !== false}
                onChange={(value) => updateToggle("showHomeLink", value)}
              />
              <ToggleRow
                label="Navbar: Products"
                checked={settings.toggles?.showProductsLink !== false}
                onChange={(value) => updateToggle("showProductsLink", value)}
              />
              <ToggleRow
                label="Navbar: About"
                checked={settings.toggles?.showAboutLink !== false}
                onChange={(value) => updateToggle("showAboutLink", value)}
              />
              <ToggleRow
                label="Navbar: Contact"
                checked={settings.toggles?.showContactLink !== false}
                onChange={(value) => updateToggle("showContactLink", value)}
              />
              <ToggleRow
                label="Show hero text"
                checked={settings.toggles?.showHeroText !== false}
                onChange={(value) => updateToggle("showHeroText", value)}
              />
              <ToggleRow
                label="Show hero buttons"
                checked={settings.toggles?.showHeroButtons !== false}
                onChange={(value) => updateToggle("showHeroButtons", value)}
              />
              <ToggleRow
                label="Show product prices"
                checked={settings.toggles?.showPrices !== false}
                onChange={(value) => updateToggle("showPrices", value)}
              />
              <ToggleRow
                label="Show product WhatsApp buttons"
                checked={settings.toggles?.showProductWhatsapp !== false}
                onChange={(value) => updateToggle("showProductWhatsapp", value)}
              />
              <ToggleRow
                label="Show about section"
                checked={settings.toggles?.showAboutSection !== false}
                onChange={(value) => updateToggle("showAboutSection", value)}
              />
              <ToggleRow
                label="Show footer"
                checked={settings.toggles?.showFooter !== false}
                onChange={(value) => updateToggle("showFooter", value)}
              />
              <ToggleRow
                label="Show Market Villa badge"
                checked={settings.toggles?.showMarketVillaBadge !== false}
                onChange={(value) => updateToggle("showMarketVillaBadge", value)}
              />
            </div>
          </section>
        </div>

        <aside className="sticky top-5 h-fit rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-purple-50 text-[#7c3aed]">
              <Sparkles size={18} />
            </span>

            <div>
              <h2 className="text-lg font-black tracking-[-0.04em] text-slate-950">
                Style summary
              </h2>
              <p className="text-sm text-slate-500">
                What this store will use.
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-[1.25rem] border border-slate-200 bg-slate-50">
            <div
              className="p-4 text-white"
              style={{ backgroundColor: selectedColorTheme.swatches[0] }}
            >
              <p className="text-xs font-black uppercase tracking-[0.18em] opacity-75">
                {selectedColorTheme.name}
              </p>
              <h3 className="mt-2 text-2xl font-black leading-tight">
                {settings.heroStyle} hero
              </h3>
              <p className="mt-2 text-sm opacity-75">
                {settings.productCardStyle} product cards · {settings.navbarStyle} navbar
              </p>
            </div>

            <div className="grid gap-2 p-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="rounded-2xl bg-white p-3">
                  <p className="text-sm font-black text-slate-950">
                    Product card {item}
                  </p>
                  {settings.toggles?.showPrices !== false ? (
                    <p
                      className="mt-1 text-xs font-black"
                      style={{ color: selectedColorTheme.swatches[1] }}
                    >
                      ₦10,000
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={saveSettings}
            disabled={isSaving}
            className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[#241436] px-5 text-sm font-black text-white transition hover:bg-[#321b52] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? (
              <Loader2 size={17} className="animate-spin" />
            ) : (
              <Save size={17} />
            )}
            {isSaving ? "Saving..." : "Save customization"}
          </button>

          {message ? (
            <p className="mt-3 inline-flex items-center gap-2 text-sm text-slate-600">
              <CheckCircle2 size={16} className="text-emerald-600" />
              {message}
            </p>
          ) : null}
        </aside>
      </section>
    </div>
  );
}