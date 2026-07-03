"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Eye, Lock, Loader2, RotateCcw, Save } from "lucide-react";
import {
  BusinessThemeExtension,
  ThemeEditorBusiness,
  canEditProTheme,
  getBusinessThemeEditorData,
  getPurchasedThemeExtensions,
  resetBusinessThemeSettings,
  updateBusinessThemeSettings,
} from "@/lib/theme-editor-actions";

const inputClass =
  "min-h-11 rounded-2xl border border-[#eadfff] bg-white px-4 text-sm font-bold text-[#241436] outline-none transition focus:border-[#7c3aed] focus:ring-4 focus:ring-[#7c3aed]/10";

const fontOptions = [
  { value: "grill", label: "Oswald" },
  { value: "manrope", label: "Manrope" },
  { value: "market", label: "Inter Tight" },
  { value: "elegant", label: "Playfair Display" },
];

function readSetting(settings: Record<string, any> | null | undefined, key: string, fallback = "") {
  const value = settings?.[key];
  return value === null || value === undefined ? fallback : String(value);
}

function readBool(settings: Record<string, any> | null | undefined, key: string, fallback: boolean) {
  const value = settings?.[key];
  return typeof value === "boolean" ? value : fallback;
}

export default function ThemeEditorDetailPage() {
  const params = useParams<{ themeId: string }>();
  const searchParams = useSearchParams();
  const themeId = params.themeId;

  const [businesses, setBusinesses] = useState<ThemeEditorBusiness[]>([]);
  const [extensions, setExtensions] = useState<BusinessThemeExtension[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState(searchParams.get("businessId") || "");
  const [formState, setFormState] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  const selectedBusiness = useMemo(
    () => businesses.find((business) => business.id === selectedBusinessId),
    [businesses, selectedBusinessId],
  );

  const canEdit = canEditProTheme({
    business: selectedBusiness,
    themeId,
    extensions,
  });

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setIsLoading(true);
        const data = await getBusinessThemeEditorData();

        if (!mounted) return;

        const firstId = searchParams.get("businessId") || data.businesses[0]?.id || "";
        const selected = data.businesses.find((business) => business.id === firstId) || data.businesses[0];
        const selectedExtensions = selected
          ? await getPurchasedThemeExtensions(selected.id)
          : data.extensions;

        setBusinesses(data.businesses);
        setSelectedBusinessId(selected?.id || "");
        setExtensions(selectedExtensions);
        setFormState(buildInitialState(selected));
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Unable to load editor.");
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [searchParams, themeId]);

  async function handleBusinessChange(businessId: string) {
    const business = businesses.find((item) => item.id === businessId);

    setSelectedBusinessId(businessId);
    setFormState(buildInitialState(business));
    setMessage("");
    setExtensions(await getPurchasedThemeExtensions(businessId));
  }

  function buildInitialState(business: ThemeEditorBusiness | undefined) {
    const settings = business?.theme_settings || {};

    return {
      logo_url: readSetting(settings, "logo_url", business?.logo_url || ""),
      hero_image_url: readSetting(settings, "hero_image_url", business?.cover_image_url || ""),
      grill_hero_image_url: readSetting(settings, "grill_hero_image_url", "/suya/suya-grill-hero.png"),
      announcement_text: readSetting(settings, "announcement_text", readSetting(settings, "announcementText")),
      opening_hours: readSetting(settings, "opening_hours", business?.opening_hours || ""),
      hero_title: readSetting(settings, "hero_title"),
      hero_subtitle: readSetting(settings, "hero_subtitle"),
      grill_subtitle: readSetting(settings, "grill_subtitle"),
      primary_color: readSetting(settings, "primary_color", "#b45309"),
      fire_color: readSetting(settings, "fire_color", "#f59e0b"),
      dark_color: readSetting(settings, "dark_color", "#17120a"),
      navbar_logo_size: readSetting(settings, "navbar_logo_size", "medium"),
      navbar_style: readSetting(settings, "navbar_style", "sticky"),
      font_heading: readSetting(settings, "font_heading", "grill"),
      font_body: readSetting(settings, "font_body", "manrope"),
      whatsapp_cta_text: readSetting(settings, "whatsapp_cta_text"),
      footer_text: readSetting(settings, "footer_text"),
      show_gallery: readBool(settings, "show_gallery", true),
      show_party_packs: readBool(settings, "show_party_packs", true),
      show_bulk_cta: readBool(settings, "show_bulk_cta", true),
    };
  }

  function updateField(key: string, value: string | boolean) {
    setFormState((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedBusiness) return;

    setIsSaving(true);
    setMessage("");

    try {
      await updateBusinessThemeSettings({
        businessId: selectedBusiness.id,
        themeId,
        settings: formState,
      });
      setMessage("Theme settings saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save theme settings.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleReset() {
    if (!selectedBusiness) return;

    setIsSaving(true);
    setMessage("");

    try {
      await resetBusinessThemeSettings({
        businessId: selectedBusiness.id,
        themeId,
      });
      setFormState(buildInitialState({ ...selectedBusiness, theme_settings: {} }));
      setMessage("Theme settings reset.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to reset theme settings.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <main className="grid min-h-[55vh] place-items-center">
        <Loader2 className="animate-spin text-[#7c3aed]" size={26} />
      </main>
    );
  }

  if (!selectedBusiness || !canEdit) {
    return (
      <section className="rounded-3xl border border-[#eadfff] bg-white p-6 text-center">
        <Lock className="mx-auto text-[#7c3aed]" size={28} />
        <h1 className="mt-3 text-xl font-black text-[#241436]">Theme locked</h1>
        <div className="mt-5 flex justify-center gap-2">
          <Link href="/dashboard/theme-store" className="inline-flex rounded-2xl bg-[#7c3aed] px-5 py-3 text-sm font-black text-white">
            Purchase Theme
          </Link>
          <Link href="/dashboard/theme-editor" className="inline-flex rounded-2xl border border-[#eadfff] bg-white px-5 py-3 text-sm font-black text-[#241436]">
            Back
          </Link>
        </div>
      </section>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <section className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#7c3aed]">
            Suya Spot Pro Editor
          </p>
          <h1 className="mt-1 text-2xl font-black tracking-[-0.05em] text-[#241436]">
            Customize your grill storefront.
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/store/${selectedBusiness.slug}`} className="inline-flex items-center gap-2 rounded-2xl border border-[#eadfff] bg-white px-4 py-2 text-sm font-black text-[#241436]">
            <Eye size={15} />
            View storefront
          </Link>
          <button type="button" onClick={handleReset} disabled={isSaving} className="inline-flex items-center gap-2 rounded-2xl border border-[#eadfff] bg-white px-4 py-2 text-sm font-black text-[#241436]">
            <RotateCcw size={15} />
            Reset
          </button>
          <button type="submit" disabled={isSaving} className="inline-flex items-center gap-2 rounded-2xl bg-[#241436] px-4 py-2 text-sm font-black text-white">
            {isSaving ? <Loader2 className="animate-spin" size={15} /> : <Save size={15} />}
            Save
          </button>
        </div>
      </section>

      <section className="rounded-3xl border border-[#eadfff] bg-white p-4">
        <label className="grid gap-2">
          <span className="text-sm font-black text-[#241436]">Business</span>
          <select value={selectedBusinessId} onChange={(event) => handleBusinessChange(event.target.value)} className={inputClass}>
            {businesses.map((business) => (
              <option key={business.id} value={business.id}>
                {business.name} - /store/{business.slug}
              </option>
            ))}
          </select>
        </label>
      </section>

      {message ? (
        <div className="rounded-2xl border border-[#eadfff] bg-white p-3 text-sm font-bold text-[#241436]">
          {message}
        </div>
      ) : null}

      <EditorSection title="Brand">
        <TextInput label="Store logo URL" value={formState.logo_url} onChange={(value) => updateField("logo_url", value)} />
        <TextInput label="Opening hours" value={formState.opening_hours} onChange={(value) => updateField("opening_hours", value)} />
      </EditorSection>

      <EditorSection title="Hero">
        <TextInput label="Hero title" value={formState.hero_title} onChange={(value) => updateField("hero_title", value)} />
        <TextInput label="Hero subtitle" value={formState.hero_subtitle} onChange={(value) => updateField("hero_subtitle", value)} />
        <TextInput label="Hero image URL" value={formState.hero_image_url} onChange={(value) => updateField("hero_image_url", value)} />
        <TextInput label="Announcement text" value={formState.announcement_text} onChange={(value) => updateField("announcement_text", value)} />
      </EditorSection>

      <EditorSection title="Grill Page">
        <TextInput label="Grill hero image URL" value={formState.grill_hero_image_url} onChange={(value) => updateField("grill_hero_image_url", value)} />
        <TextInput label="Grill subtitle" value={formState.grill_subtitle} onChange={(value) => updateField("grill_subtitle", value)} />
      </EditorSection>

      <EditorSection title="Colors">
        <ColorInput label="Primary color" value={formState.primary_color} onChange={(value) => updateField("primary_color", value)} />
        <ColorInput label="Fire/accent color" value={formState.fire_color} onChange={(value) => updateField("fire_color", value)} />
        <ColorInput label="Dark background color" value={formState.dark_color} onChange={(value) => updateField("dark_color", value)} />
      </EditorSection>

      <EditorSection title="Navigation">
        <label className="grid gap-2">
          <span className="text-sm font-black text-[#241436]">Navbar logo size</span>
          <select value={formState.navbar_logo_size} onChange={(event) => updateField("navbar_logo_size", event.target.value)} className={inputClass}>
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </label>
        <ToggleInput label="Show gallery" value={formState.show_gallery} onChange={(value) => updateField("show_gallery", value)} />
        <ToggleInput label="Show party packs" value={formState.show_party_packs} onChange={(value) => updateField("show_party_packs", value)} />
        <ToggleInput label="Show bulk CTA" value={formState.show_bulk_cta} onChange={(value) => updateField("show_bulk_cta", value)} />
      </EditorSection>

      <EditorSection title="Typography">
        <SelectInput label="Heading font" value={formState.font_heading} options={fontOptions} onChange={(value) => updateField("font_heading", value)} />
        <SelectInput label="Body font" value={formState.font_body} options={fontOptions} onChange={(value) => updateField("font_body", value)} />
      </EditorSection>

      <EditorSection title="Footer/CTA">
        <TextInput label="WhatsApp CTA text" value={formState.whatsapp_cta_text} onChange={(value) => updateField("whatsapp_cta_text", value)} />
        <TextInput label="Footer note" value={formState.footer_text} onChange={(value) => updateField("footer_text", value)} />
      </EditorSection>
    </form>
  );
}

function EditorSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-[#eadfff] bg-white p-4">
      <h2 className="text-base font-black text-[#241436]">{title}</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-2">{children}</div>
    </section>
  );
}

function TextInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-black text-[#241436]">{label}</span>
      <input value={value || ""} onChange={(event) => onChange(event.target.value)} className={inputClass} />
    </label>
  );
}

function ColorInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-black text-[#241436]">{label}</span>
      <div className="grid grid-cols-[3rem_1fr] gap-2">
        <input type="color" value={value || "#f59e0b"} onChange={(event) => onChange(event.target.value)} className="h-11 rounded-2xl border border-[#eadfff] bg-white p-1" />
        <input value={value || ""} onChange={(event) => onChange(event.target.value)} className={inputClass} />
      </div>
    </label>
  );
}

function SelectInput({ label, value, options, onChange }: { label: string; value: string; options: { value: string; label: string }[]; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-black text-[#241436]">{label}</span>
      <select value={value || ""} onChange={(event) => onChange(event.target.value)} className={inputClass}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}

function ToggleInput({ label, value, onChange }: { label: string; value: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex min-h-11 items-center justify-between gap-3 rounded-2xl border border-[#eadfff] bg-[#faf8ff] px-4">
      <span className="text-sm font-black text-[#241436]">{label}</span>
      <input type="checkbox" checked={Boolean(value)} onChange={(event) => onChange(event.target.checked)} />
    </label>
  );
}
