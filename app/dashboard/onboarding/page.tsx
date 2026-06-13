"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock3,
  Globe2,
  Instagram,
  Loader2,
  MapPin,
  Palette,
  Phone,
  Store,
} from "lucide-react";
import { businessThemes } from "@/lib/themes";
import { createBusiness } from "@/lib/business-actions";
import { slugify } from "@/lib/utils";

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

const setupSteps = [
  "Business identity",
  "Contact details",
  "Theme selection",
  "Preview and publish",
];

export default function OnboardingPage() {
  const router = useRouter();

  const [businessName, setBusinessName] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [location, setLocation] = useState("");
  const [openingHours, setOpeningHours] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [themeId, setThemeId] = useState(businessThemes[0].id);
  const [includeSampleData, setIncludeSampleData] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  function handleBusinessNameChange(value: string) {
    setBusinessName(value);

    if (!slug) {
      setSlug(slugify(value));
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setIsSubmitting(true);

    try {
      const business = await createBusiness({
        name: businessName,
        slug: slugify(slug),
        category,
        description,
        whatsapp,
        location,
        openingHours,
        instagramUrl,
        themeId,
        includeSampleData,
      });

      router.push(`/store/${business.slug}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unable to create business page.";

      setMessage(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid gap-8">
      <section className="rounded-[2rem] bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 p-7 text-white shadow-soft">
        <div className="grid items-end gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-200">
              Business Setup
            </p>

            <h2 className="mt-3 max-w-3xl text-4xl font-semibold tracking-[-0.05em]">
              Set up your Market Villa business page.
            </h2>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
              Add your business information, choose a page style, and publish
              your mini website for customers.
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-white/10 p-5 backdrop-blur-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
              Setup Progress
            </p>

            <div className="mt-5 grid gap-3">
              {setupSteps.map((step, index) => (
                <div
                  key={step}
                  className="flex items-center gap-3 rounded-2xl bg-white/10 p-3 text-sm"
                >
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-white text-xs font-semibold text-slate-950">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm">
          <div className="mb-7">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-700">
              Business Details
            </p>

            <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-950">
              Create your business profile
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              These details will be saved to Supabase and shown on your public
              business page.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-5">
            <div className="grid gap-5 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Building2 size={16} />
                  Business name
                </span>
                <input
                  value={businessName}
                  onChange={(event) =>
                    handleBusinessNameChange(event.target.value)
                  }
                  className="rounded-2xl border border-slate-200 px-4 py-4 text-sm outline-none focus:border-slate-950"
                  placeholder="Example: ZCAS TastyBites"
                  required
                />
              </label>

              <label className="grid gap-2">
                <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Store size={16} />
                  Business category
                </span>
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="rounded-2xl border border-slate-200 px-4 py-4 text-sm outline-none focus:border-slate-950"
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
                Business URL slug
              </span>
              <div className="grid gap-3 md:grid-cols-[auto_1fr] md:items-center">
                <span className="rounded-2xl bg-slate-100 px-4 py-4 text-sm font-medium text-slate-500">
                  marketvilla.com/store/
                </span>

                <input
                  value={slug}
                  onChange={(event) => setSlug(slugify(event.target.value))}
                  className="rounded-2xl border border-slate-200 px-4 py-4 text-sm outline-none focus:border-slate-950"
                  placeholder="zcas-tastybites"
                  required
                />
              </div>
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">
                Business description
              </span>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={4}
                className="rounded-2xl border border-slate-200 px-4 py-4 text-sm outline-none focus:border-slate-950"
                placeholder="Describe what your business offers..."
                required
              />
            </label>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Phone size={16} />
                  Contact / WhatsApp number
                </span>
                <input
                  value={whatsapp}
                  onChange={(event) => setWhatsapp(event.target.value)}
                  className="rounded-2xl border border-slate-200 px-4 py-4 text-sm outline-none focus:border-slate-950"
                  placeholder="2348012345678"
                  required
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
                  className="rounded-2xl border border-slate-200 px-4 py-4 text-sm outline-none focus:border-slate-950"
                  placeholder="Abuja, Nigeria"
                  required
                />
              </label>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Clock3 size={16} />
                  Opening hours
                </span>
                <input
                  value={openingHours}
                  onChange={(event) => setOpeningHours(event.target.value)}
                  className="rounded-2xl border border-slate-200 px-4 py-4 text-sm outline-none focus:border-slate-950"
                  placeholder="Mon - Sat, 9:00 AM - 6:00 PM"
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
                  className="rounded-2xl border border-slate-200 px-4 py-4 text-sm outline-none focus:border-slate-950"
                  placeholder="https://instagram.com/yourbusiness"
                />
              </label>
            </div>

            <div className="rounded-[1.5rem] bg-slate-50 p-5">
              <div className="mb-5 flex items-center gap-2">
                <Palette size={18} className="text-teal-700" />
                <h4 className="font-semibold text-slate-950">
                  Choose a starting theme
                </h4>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                {businessThemes.slice(0, 6).map((theme) => (
                  <label
                    key={theme.id}
                    className={`cursor-pointer rounded-2xl border bg-white p-4 ${
                      themeId === theme.id
                        ? "border-slate-950 ring-2 ring-slate-950/10"
                        : "border-slate-200"
                    }`}
                  >
                    <div
                      className={`mb-4 h-20 rounded-xl bg-gradient-to-br ${theme.hero}`}
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="theme"
                        checked={themeId === theme.id}
                        onChange={() => setThemeId(theme.id)}
                      />
                      <span className="text-sm font-semibold text-slate-800">
                        {theme.name}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>


            <label className="flex cursor-pointer items-center justify-between rounded-[1.5rem] border border-slate-200 bg-emerald-50 p-5">
              <div>
                <p className="text-sm font-semibold text-emerald-950">
                  Add sample products and service
                </p>
                <p className="mt-1 text-xs leading-5 text-emerald-800">
                  Useful for testing the store quickly. You can edit or delete
                  the sample items later from Products and Services.
                </p>
              </div>

              <input
                type="checkbox"
                checked={includeSampleData}
                onChange={(event) => setIncludeSampleData(event.target.checked)}
              />
            </label>

            {message ? (
              <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">
                {message}
              </div>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-4 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <Loader2 size={17} className="animate-spin" />
                ) : (
                  <CheckCircle2 size={17} />
                )}
                {isSubmitting ? "Creating page..." : "Save and Publish Page"}
              </button>

              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-4 text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                Back to Dashboard
                <ArrowRight size={17} />
              </Link>
            </div>
          </form>
        </div>

        <aside className="grid gap-5">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-950">
              What happens after setup?
            </h3>

            <div className="mt-5 grid gap-4">
              {[
                "Your business page is saved to Supabase.",
                "Your page becomes available through your Market Villa link.",
                "You can add products and services from the dashboard.",
                "You can request a custom domain when ready.",
              ].map((item) => (
                <div key={item} className="flex gap-3">
                  <CheckCircle2
                    size={18}
                    className="mt-0.5 shrink-0 text-emerald-600"
                  />
                  <p className="text-sm leading-6 text-slate-600">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-amber-200 bg-amber-50 p-6">
            <h3 className="text-lg font-semibold text-amber-950">
              Want a professional domain?
            </h3>

            <p className="mt-2 text-sm leading-6 text-amber-900">
              After your business page is ready, you can request a custom domain
              such as yourbusiness.com as a paid add-on.
            </p>

            <Link
              href="/dashboard/domain"
              className="mt-5 inline-flex rounded-full bg-amber-300 px-5 py-3 text-sm font-semibold text-amber-950 hover:bg-amber-200"
            >
              View Domain Options
            </Link>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-teal-200">
              Recommended
            </p>

            <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">
              Start simple. Upgrade when the business grows.
            </h3>

            <p className="mt-3 text-sm leading-6 text-slate-300">
              Use the Market Villa link first, test the page with customers,
              then add a custom domain when the business is ready.
            </p>
          </div>
        </aside>
      </section>
    </div>
  );
}
