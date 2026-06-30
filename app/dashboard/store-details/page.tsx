"use client";

import { ImageUploadEditor } from "@/components/ImageUploadEditor";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  ImageIcon,
  Instagram,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Save,
  Store,
} from "lucide-react";
import { getMyBusinesses } from "@/lib/business-actions";
import { supabase } from "@/lib/supabase";

type ThemeSettings = {
  announcementText?: string | null;
  toggles?: {
    showPrices?: boolean;
    showFooter?: boolean;
    showMarketVillaBadge?: boolean;
    [key: string]: boolean | undefined;
  };
  [key: string]: any;
};

type DashboardBusiness = {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  whatsapp: string | null;
  phone: string | null;
  email: string | null;
  location: string | null;
  instagram_url: string | null;
  opening_hours: string | null;
  theme_settings?: ThemeSettings | null;
};

const inputClass =
  "min-h-12 rounded-2xl border border-[#eadfff] bg-white px-4 text-sm font-semibold text-[#241436] outline-none transition focus:border-[#7c3aed] focus:ring-4 focus:ring-[#7c3aed]/10";

function mergeSettings(settings?: ThemeSettings | null): ThemeSettings {
  return {
    ...(settings || {}),
    toggles: {
      ...((settings || {}).toggles || {}),
      showPrices: settings?.toggles?.showPrices !== false,
      showFooter: settings?.toggles?.showFooter !== false,
      showMarketVillaBadge: settings?.toggles?.showMarketVillaBadge !== false,
    },
  };
}

export default function StoreDetailsPage() {
  const [businesses, setBusinesses] = useState<DashboardBusiness[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [announcementText, setAnnouncementText] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [openingHours, setOpeningHours] = useState("");

  const selectedBusiness = useMemo(() => {
    return businesses.find((business) => business.id === selectedBusinessId);
  }, [businesses, selectedBusinessId]);

  useEffect(() => {
    let mounted = true;

    async function loadBusinesses() {
      setIsLoading(true);
      setMessage("");

      try {
        const items = (await getMyBusinesses()) as DashboardBusiness[];
        const ids = items.map((item) => item.id);

        if (!ids.length) {
          if (mounted) {
            setBusinesses([]);
            setSelectedBusinessId("");
          }
          return;
        }

        const { data, error } = await supabase
          .from("businesses")
          .select(
            "id,name,slug,tagline,logo_url,cover_image_url,whatsapp,phone,email,location,instagram_url,opening_hours,theme_settings",
          )
          .in("id", ids)
          .order("created_at", { ascending: true });

        if (error) throw error;
        if (!mounted) return;

        const loadedBusinesses = (data || []) as DashboardBusiness[];
        setBusinesses(loadedBusinesses);

        if (loadedBusinesses.length > 0) {
          setSelectedBusinessId(loadedBusinesses[0].id);
        }
      } catch (error) {
        if (!mounted) return;
        setMessage(
          error instanceof Error ? error.message : "Unable to load stores.",
        );
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadBusinesses();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedBusiness) return;

    const settings = mergeSettings(selectedBusiness.theme_settings);

    setName(selectedBusiness.name || "");
    setTagline(selectedBusiness.tagline || "");
    setAnnouncementText(settings.announcementText || "");
    setLogoUrl(selectedBusiness.logo_url || "");
    setCoverImageUrl(selectedBusiness.cover_image_url || "");
    setPhone(selectedBusiness.phone || "");
    setWhatsapp(selectedBusiness.whatsapp || "");
    setEmail(selectedBusiness.email || "");
    setLocation(selectedBusiness.location || "");
    setInstagramUrl(selectedBusiness.instagram_url || "");
    setOpeningHours(selectedBusiness.opening_hours || "");
  }, [selectedBusiness]);

  function handleBusinessChange(businessId: string) {
    setSelectedBusinessId(businessId);
    setMessage("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedBusiness) {
      setMessage("Select a store first.");
      return;
    }

    setIsSaving(true);
    setMessage("");

    const currentSettings = selectedBusiness.theme_settings || {};
    const nextSettings: ThemeSettings = {
      ...currentSettings,
      announcementText,
      toggles: {
        ...(currentSettings.toggles || {}),
        showPrices: true,
        showFooter: true,
        showMarketVillaBadge: true,
      },
    };

    try {
      const { error } = await supabase
        .from("businesses")
        .update({
          name,
          tagline,
          logo_url: logoUrl,
          cover_image_url: coverImageUrl,
          phone,
          whatsapp,
          email,
          location,
          instagram_url: instagramUrl,
          opening_hours: openingHours,
          theme_settings: nextSettings,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedBusiness.id);

      if (error) throw error;

      setBusinesses((current) =>
        current.map((business) =>
          business.id === selectedBusiness.id
            ? {
                ...business,
                name,
                tagline,
                logo_url: logoUrl,
                cover_image_url: coverImageUrl,
                phone,
                whatsapp,
                email,
                location,
                instagram_url: instagramUrl,
                opening_hours: openingHours,
                theme_settings: nextSettings,
              }
            : business,
        ),
      );
      setMessage("Store details saved.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to save store details.",
      );
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
      <section className="rounded-[1.35rem] border border-[#eadfff] bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#7c3aed]">
              Store Details
            </p>
            <h1 className="mt-2 text-2xl font-black tracking-[-0.05em] text-slate-950">
              Storefront content
            </h1>
          </div>

          {businesses.length > 1 ? (
            <label className="grid min-w-[240px] gap-2 text-sm font-black text-slate-700">
              Selected store
              <select
                value={selectedBusinessId}
                onChange={(event) => handleBusinessChange(event.target.value)}
                className={inputClass}
              >
                {businesses.map((business) => (
                  <option key={business.id} value={business.id}>
                    {business.name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </div>
      </section>

      {message ? (
        <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-3 text-sm font-semibold text-slate-700">
          <CheckCircle2 size={16} className="text-emerald-600" />
          {message}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="grid gap-5">
        <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
          <h2 className="flex items-center gap-2 text-lg font-black tracking-[-0.04em] text-slate-950">
            <Store size={18} className="text-[#7c3aed]" />
            Store Identity
          </h2>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-black text-slate-700">
              Business name
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className={inputClass}
                required
              />
            </label>

            <label className="grid gap-2 text-sm font-black text-slate-700">
              Tagline
              <input
                value={tagline}
                onChange={(event) => setTagline(event.target.value)}
                className={inputClass}
              />
            </label>

            <label className="grid gap-2 text-sm font-black text-slate-700 md:col-span-2">
              Announcement text
              <input
                value={announcementText}
                onChange={(event) => setAnnouncementText(event.target.value)}
                className={inputClass}
              />
            </label>
          </div>
        </section>

        <section className="rounded-[1.35rem] border border-[#eadfff] bg-white p-5">
          <h2 className="flex items-center gap-2 text-lg font-black tracking-[-0.04em] text-slate-950">
            <ImageIcon size={18} className="text-[#7c3aed]" />
            Store Banner
          </h2>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <div className="md:col-span-1">
              <ImageUploadEditor
                label="Logo"
                value={logoUrl}
                onChange={setLogoUrl}
                businessId={selectedBusiness?.id || ""}
                imageType="logo"
                aspect="square"
              />
            </div>

            <div className="md:col-span-1">
              <ImageUploadEditor
                label="Cover image"
                value={coverImageUrl}
                onChange={setCoverImageUrl}
                businessId={selectedBusiness?.id || ""}
                imageType="cover"
                aspect="wide"
              />
            </div>
          </div>
        </section>

        <section className="rounded-[1.35rem] border border-[#eadfff] bg-white p-5">
          <h2 className="flex items-center gap-2 text-lg font-black tracking-[-0.04em] text-slate-950">
            <Phone size={18} className="text-[#7c3aed]" />
            Contact Details
          </h2>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-black text-slate-700">
              Phone
              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className={inputClass}
              />
            </label>

            <label className="grid gap-2 text-sm font-black text-slate-700">
              WhatsApp
              <input
                value={whatsapp}
                onChange={(event) => setWhatsapp(event.target.value)}
                className={inputClass}
              />
            </label>

            <label className="grid gap-2 text-sm font-black text-slate-700">
              Email
              <span className="relative">
                <Mail
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className={`${inputClass} w-full pl-11`}
                />
              </span>
            </label>

            <label className="grid gap-2 text-sm font-black text-slate-700">
              Location
              <span className="relative">
                <MapPin
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  className={`${inputClass} w-full pl-11`}
                />
              </span>
            </label>

            <label className="grid gap-2 text-sm font-black text-slate-700">
              Instagram URL
              <span className="relative">
                <Instagram
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={instagramUrl}
                  onChange={(event) => setInstagramUrl(event.target.value)}
                  className={`${inputClass} w-full pl-11`}
                />
              </span>
            </label>

            <label className="grid gap-2 text-sm font-black text-slate-700">
              Opening hours
              <span className="relative">
                <Clock3
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={openingHours}
                  onChange={(event) => setOpeningHours(event.target.value)}
                  className={`${inputClass} w-full pl-11`}
                />
              </span>
            </label>
          </div>
        </section>

        <div className="rounded-[1.35rem] border border-[#eadfff] bg-white p-3">
          <button
            type="submit"
            disabled={isSaving || !selectedBusiness}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#241436] to-[#7c3aed] px-5 text-sm font-black text-white transition disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            {isSaving ? "Saving..." : "Save store details"}
          </button>
        </div>
      </form>
    </div>
  );
}








