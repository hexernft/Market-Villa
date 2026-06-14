"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Building2,
  CheckCircle2,
  Clock3,
  Eye,
  Globe2,
  ImageIcon,
  Instagram,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Store,
} from "lucide-react";
import {
  getMyBusinesses,
  updateBusinessProfile,
} from "@/lib/business-actions";
import { uploadBusinessImage } from "@/lib/storage-actions";
import { slugify } from "@/lib/utils";
import { ImageUploadField } from "@/components/ImageUploadField";

const categories = [
  "Food & Drinks",
  "Fashion & Tailoring",
  "Beauty & Wellness",
  "Apartment & Hospitality",
  "Retail Store",
  "Digital Services",
  "School / Education",
  "Church / Ministry",
  "Professional Services",
  "Other",
];

type DashboardBusiness = {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  tagline: string | null;
  description: string | null;
  logo_text: string | null;
  cover_image_url: string | null;
  whatsapp: string | null;
  phone: string | null;
  email: string | null;
  location: string | null;
  instagram_url: string | null;
  opening_hours: string | null;
  is_published: boolean;
};

export default function ProfilePage() {
  const [businesses, setBusinesses] = useState<DashboardBusiness[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState("");

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [logoText, setLogoText] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [compressedCoverFile, setCompressedCoverFile] = useState<File | null>(
    null
  );
  const [whatsapp, setWhatsapp] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [openingHours, setOpeningHours] = useState("");
  const [isPublished, setIsPublished] = useState(true);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  const selectedBusiness = useMemo(() => {
    return businesses.find((business) => business.id === selectedBusinessId);
  }, [businesses, selectedBusinessId]);

  useEffect(() => {
    let mounted = true;

    async function loadBusinesses() {
      try {
        setIsLoading(true);

        const items = await getMyBusinesses();

        if (!mounted) return;

        setBusinesses(items);

        if (items.length > 0) {
          setSelectedBusinessId(items[0].id);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unable to load businesses.";
        setMessage(errorMessage);
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

    setName(selectedBusiness.name || "");
    setSlug(selectedBusiness.slug || "");
    setCategory(selectedBusiness.category || categories[0]);
    setTagline(selectedBusiness.tagline || "");
    setDescription(selectedBusiness.description || "");
    setLogoText(selectedBusiness.logo_text || "");
    setCoverImageUrl(selectedBusiness.cover_image_url || "");
    setCompressedCoverFile(null);
    setWhatsapp(selectedBusiness.whatsapp || "");
    setPhone(selectedBusiness.phone || "");
    setEmail(selectedBusiness.email || "");
    setLocation(selectedBusiness.location || "");
    setInstagramUrl(selectedBusiness.instagram_url || "");
    setOpeningHours(selectedBusiness.opening_hours || "");
    setIsPublished(selectedBusiness.is_published);
  }, [selectedBusiness]);

  function handleNameChange(value: string) {
    setName(value);

    if (!slug) {
      setSlug(slugify(value));
    }
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedBusinessId) {
      setMessage("Create a business page first before editing profile.");
      return;
    }

    setIsSaving(true);
    setMessage("");

    try {
      let finalCoverImageUrl = coverImageUrl;

      if (compressedCoverFile) {
        const uploadedImage = await uploadBusinessImage({
          file: compressedCoverFile,
          businessId: selectedBusinessId,
          folder: "covers",
        });

        finalCoverImageUrl = uploadedImage.publicUrl;
      }

      await updateBusinessProfile({
        businessId: selectedBusinessId,
        name,
        slug: slugify(slug),
        category,
        tagline,
        description,
        logoText,
        coverImageUrl: finalCoverImageUrl,
        whatsapp,
        phone,
        email,
        location,
        instagramUrl,
        openingHours,
        isPublished,
      });

      const updatedBusinesses = await getMyBusinesses();
      setBusinesses(updatedBusinesses);
      setCoverImageUrl(finalCoverImageUrl);
      setCompressedCoverFile(null);

      setMessage("Business profile updated successfully.");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unable to update profile.";

      setMessage(errorMessage);
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <main className="grid min-h-[60vh] place-items-center">
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 text-center shadow-sm">
          <Loader2 className="mx-auto animate-spin text-slate-950" size={24} />

          <p className="mt-3 text-sm text-slate-500">
            Loading business profile...
          </p>
        </div>
      </main>
    );
  }

  if (businesses.length === 0) {
    return (
      <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-6 text-center">
        <p className="text-xl font-semibold tracking-[-0.04em] text-amber-950">
          Create your business page first
        </p>

        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-amber-900">
          Complete onboarding before editing a business profile.
        </p>

        <Link
          href="/dashboard/onboarding"
          className="mt-5 inline-flex rounded-full bg-amber-300 px-5 py-3 text-sm font-semibold text-amber-950 transition hover:-translate-y-0.5 hover:bg-amber-200"
        >
          Start Onboarding
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-5">
      <section className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-4 xl:grid-cols-[1fr_auto] xl:items-center">
          <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
            <select
              value={selectedBusinessId}
              onChange={(event) => setSelectedBusinessId(event.target.value)}
              className="min-h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 outline-none transition focus:border-[var(--mv-orange)] focus:ring-4 focus:ring-slate-100 md:min-w-72"
            >
              {businesses.map((business) => (
                <option key={business.id} value={business.id}>
                  {business.name} - /store/{business.slug}
                </option>
              ))}
            </select>

            <Link
              href={`/store/${slug || selectedBusiness?.slug}`}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-slate-950 px-5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800"
            >
              <Eye size={17} />
              Preview Store
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-2xl bg-slate-50 px-3 py-2.5">
              <p className="text-xs text-slate-500">Status</p>
              <p className="mt-1 text-sm font-semibold text-slate-950">
                {isPublished ? "Live" : "Draft"}
              </p>
            </div>

            <div className="rounded-2xl bg-teal-50 px-3 py-2.5">
              <p className="text-xs text-teal-700">Category</p>
              <p className="mt-1 truncate text-sm font-semibold text-teal-950">
                {category}
              </p>
            </div>

            <div className="rounded-2xl bg-amber-50 px-3 py-2.5">
              <p className="text-xs text-amber-700">URL</p>
              <p className="mt-1 truncate text-sm font-semibold text-amber-950">
                /store/{slug || selectedBusiness?.slug}
              </p>
            </div>
          </div>
        </div>
      </section>

      {message ? (
        <div className="rounded-2xl bg-white p-3 text-sm text-slate-700 shadow-sm">
          {message}
        </div>
      ) : null}

      <section className="grid gap-5 xl:grid-cols-[1fr_0.7fr]">
        <form
          onSubmit={handleSave}
          className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">
                Profile
              </p>

              <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-slate-950">
                Business information
              </h2>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="hidden items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 md:inline-flex"
            >
              {isSaving ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <CheckCircle2 size={17} />
              )}

              {isSaving ? "Saving..." : "Save Profile"}
            </button>
          </div>

          <div className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Building2 size={16} />
                  Business name
                </span>

                <input
                  value={name}
                  onChange={(event) => handleNameChange(event.target.value)}
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[var(--mv-orange)] focus:ring-4 focus:ring-slate-100"
                  placeholder="Business name"
                  required
                />
              </label>

              <label className="grid gap-2">
                <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Store size={16} />
                  Category
                </span>

                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[var(--mv-orange)] focus:ring-4 focus:ring-slate-100"
                >
                  {categories.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
            </div>

            <label className="grid gap-2">
              <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Globe2 size={16} />
                Store slug
              </span>

              <div className="grid gap-3 md:grid-cols-[auto_1fr] md:items-center">
                <span className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-medium text-slate-500">
                  /store/
                </span>

                <input
                  value={slug}
                  onChange={(event) => setSlug(slugify(event.target.value))}
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[var(--mv-orange)] focus:ring-4 focus:ring-slate-100"
                  placeholder="business-slug"
                  required
                />
              </div>
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700">
                  Logo text
                </span>

                <input
                  value={logoText}
                  onChange={(event) =>
                    setLogoText(event.target.value.toUpperCase().slice(0, 4))
                  }
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[var(--mv-orange)] focus:ring-4 focus:ring-slate-100"
                  placeholder="MV"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700">
                  Tagline
                </span>

                <input
                  value={tagline}
                  onChange={(event) => setTagline(event.target.value)}
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[var(--mv-orange)] focus:ring-4 focus:ring-slate-100"
                  placeholder="Short line about the business"
                />
              </label>
            </div>

            <ImageUploadField
              label="Upload hero image"
              helper="This image appears at the top of your public store page."
              maxWidth={1800}
              maxHeight={1100}
              onCompressed={(file) => setCompressedCoverFile(file)}
            />

            <label className="grid gap-2">
              <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <ImageIcon size={16} />
                Or paste hero image URL
              </span>

              <input
                value={coverImageUrl}
                onChange={(event) => setCoverImageUrl(event.target.value)}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[var(--mv-orange)] focus:ring-4 focus:ring-slate-100"
                placeholder="https://..."
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">
                Business description
              </span>

              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={3}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[var(--mv-orange)] focus:ring-4 focus:ring-slate-100"
                placeholder="Describe what your business offers."
              />
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Phone size={16} />
                  WhatsApp number
                </span>

                <input
                  value={whatsapp}
                  onChange={(event) => setWhatsapp(event.target.value)}
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[var(--mv-orange)] focus:ring-4 focus:ring-slate-100"
                  placeholder="2348012345678"
                />
              </label>

              <label className="grid gap-2">
                <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Phone size={16} />
                  Phone number
                </span>

                <input
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[var(--mv-orange)] focus:ring-4 focus:ring-slate-100"
                  placeholder="080..."
                />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Mail size={16} />
                  Email
                </span>

                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  type="email"
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[var(--mv-orange)] focus:ring-4 focus:ring-slate-100"
                  placeholder="business@email.com"
                />
              </label>

              <label className="grid gap-2">
                <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <MapPin size={16} />
                  Location
                </span>

                <input
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[var(--mv-orange)] focus:ring-4 focus:ring-slate-100"
                  placeholder="Abuja, Nigeria"
                />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Clock3 size={16} />
                  Opening hours
                </span>

                <input
                  value={openingHours}
                  onChange={(event) => setOpeningHours(event.target.value)}
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[var(--mv-orange)] focus:ring-4 focus:ring-slate-100"
                  placeholder="Mon - Sat, 9 AM - 6 PM"
                />
              </label>

              <label className="grid gap-2">
                <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Instagram size={16} />
                  Instagram link
                </span>

                <input
                  value={instagramUrl}
                  onChange={(event) => setInstagramUrl(event.target.value)}
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[var(--mv-orange)] focus:ring-4 focus:ring-slate-100"
                  placeholder="https://instagram.com/yourbusiness"
                />
              </label>
            </div>

            <label className="flex cursor-pointer items-center justify-between gap-4 rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Publish store
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Turn this off to hide the public store page.
                </p>
              </div>

              <input
                type="checkbox"
                checked={isPublished}
                onChange={(event) => setIsPublished(event.target.checked)}
              />
            </label>

            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 md:hidden"
            >
              {isSaving ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <CheckCircle2 size={17} />
              )}

              {isSaving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </form>

        <aside className="grid content-start gap-4">
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">
              Preview
            </p>

            <div className="mt-4 overflow-hidden rounded-[1.25rem] border border-slate-200">
              <div
                className="h-36 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${
                    coverImageUrl ||
                    "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=1600&auto=format&fit=crop"
                  })`,
                }}
              />

              <div className="p-4">
                <div className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-slate-950 text-base font-semibold text-white">
                  {logoText || "MV"}
                </div>

                <p className="text-lg font-semibold tracking-[-0.04em] text-slate-950">
                  {name || "Business Name"}
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {tagline || description || "Business preview"}
                </p>

                <div className="mt-4 grid gap-2 text-xs text-slate-500">
                  <span>{location || "Location not added"}</span>
                  <span>{openingHours || "Opening hours not added"}</span>
                  <span>{isPublished ? "Published" : "Draft"}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-4">
            <p className="font-semibold text-amber-950">Store link</p>

            <p className="mt-2 break-all text-sm leading-6 text-amber-900">
              /store/{slug || selectedBusiness?.slug}
            </p>

            <p className="mt-2 text-xs leading-5 text-amber-800">
              Changing the slug changes the public store link.
            </p>
          </div>
        </aside>
      </section>
    </div>
  );
}