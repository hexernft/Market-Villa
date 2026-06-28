"use client";

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
  Phone,
  Store,
} from "lucide-react";
import { createBusiness } from "@/lib/business-actions";
import { slugify } from "@/lib/utils";
import { BusinessMode, businessModes } from "@/lib/business-modes";
import {
  canUseBusinessModeForPlan,
  getBusinessModePlanMessage,
} from "@/lib/plans";

const categories = [
  "Food & Drinks",
  "Fashion & Tailoring",
  "Beauty & Wellness",
  "Apartment & Hospitality",
  "Retail Store",
  "Digital Products",
  "School / Education",
  "Church / Ministry",
  "Professional Products",
  "Other",
];

const categoriesByMode: Record<BusinessMode, string[]> = {
  products: [
    "Fashion",
    "Food & Drinks",
    "Beauty",
    "Electronics",
    "Furniture",
    "Kids & Baby",
    "Grocery",
    "Pharmacy",
    "Jewelry",
    "Events & Catering",
    "General Retail",
  ],
  properties: [
    "Shortlet Apartment",
    "Rental Property",
    "Land",
    "Commercial Property",
    "Real Estate Agency",
    "Property Management",
  ],
  cars: [
    "Car Dealership",
    "Vehicle Broker",
    "Imported Cars",
    "Auto Lot",
    "Car Rentals",
    "Spare Parts",
  ],
};

export default function OnboardingPage() {
  const router = useRouter();

  const [businessName, setBusinessName] = useState("");
  const [businessMode, setBusinessMode] = useState<BusinessMode>("products");
  const [category, setCategory] = useState(categories[0]);
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [location, setLocation] = useState("");
  const [openingHours, setOpeningHours] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [themeId] = useState("simple-one-page");
  const [includeSampleData, setIncludeSampleData] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  function handleBusinessNameChange(value: string) {
    setBusinessName(value);

    if (!slug) {
      setSlug(slugify(value));
    }
  }

  function handleModeChange(mode: BusinessMode) {
    if (!canUseBusinessModeForPlan({ mode, plan: "starter" })) {
      setMessage(getBusinessModePlanMessage(mode));
      return;
    }

    setMessage("");
    setBusinessMode(mode);
    setCategory(categoriesByMode[mode][0]);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setIsSubmitting(true);

    try {
      if (!canUseBusinessModeForPlan({ mode: businessMode, plan: "starter" })) {
        throw new Error(getBusinessModePlanMessage(businessMode));
      }

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
        businessMode,
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
    <div className="grid gap-5">
      <section className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">
              Onboarding
            </p>

            <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-slate-950">
              Create business page
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Own a business website with 1 month free. N1000 for the next 3
              months.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-800 transition hover:-translate-y-0.5 hover:bg-slate-50"
          >
            Back to Dashboard
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_0.7fr]">
        <form
          onSubmit={handleSubmit}
          className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">
                Business Details
              </p>

              <h3 className="mt-1 text-xl font-semibold tracking-[-0.04em] text-slate-950">
                Public store information
              </h3>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="hidden items-center justify-center gap-2 rounded-full bg-[#26143d] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 md:inline-flex"
            >
              {isSubmitting ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <CheckCircle2 size={17} />
              )}

              {isSubmitting ? "Creating..." : "Save and Publish"}
            </button>
          </div>

          <div className="grid gap-4">
            <div className="grid gap-3">
              <span className="text-sm font-semibold text-slate-700">
                What do you want to use Market Villa for?
              </span>

              <div className="grid gap-3 md:grid-cols-3">
                {businessModes.map((mode) => {
                  const isModeLocked = !canUseBusinessModeForPlan({
                    mode: mode.id,
                    plan: "starter",
                  });

                  return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => handleModeChange(mode.id)}
                    className={`rounded-[1.25rem] border p-4 text-left transition ${
                      businessMode === mode.id
                        ? "border-[#26143d] bg-[#26143d] text-white shadow-sm"
                        : isModeLocked
                          ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400"
                          : "border-slate-200 bg-slate-50 text-slate-800 hover:border-[#26143d]/40"
                    }`}
                  >
                    <span className="flex items-center justify-between gap-3 text-sm font-semibold">
                      {mode.label}
                      {isModeLocked ? (
                        <span className="rounded-full bg-white px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-slate-500">
                          Pro
                        </span>
                      ) : null}
                    </span>
                    <span
                      className={`mt-2 block text-xs leading-5 ${
                        businessMode === mode.id
                          ? "text-white/70"
                          : "text-slate-500"
                      }`}
                    >
                      {isModeLocked
                        ? getBusinessModePlanMessage(mode.id)
                        : mode.description}
                    </span>
                  </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
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
                  className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-[var(--mv-violet)] focus:ring-4 focus:ring-slate-100"
                  required
                />
              </label>

              <label className="grid gap-2">
                <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Store size={16} />
                  {false
                    ? "Property category"
                    : false
                      ? "Car business type"
                      : "Business category"}
                </span>

                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-[var(--mv-violet)] focus:ring-4 focus:ring-slate-100"
                >
                  {categoriesByMode[businessMode].map((item) => (
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
                <span className="rounded-2xl bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-500">
                  /store/
                </span>

                <input
                  value={slug}
                  onChange={(event) => setSlug(slugify(event.target.value))}
                  className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-[var(--mv-violet)] focus:ring-4 focus:ring-slate-100"
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
                rows={3}
                className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-[var(--mv-violet)] focus:ring-4 focus:ring-slate-100"
                required
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
                  className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-[var(--mv-violet)] focus:ring-4 focus:ring-slate-100"
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
                  className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-[var(--mv-violet)] focus:ring-4 focus:ring-slate-100"
                  required
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
                  className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-[var(--mv-violet)] focus:ring-4 focus:ring-slate-100"
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
                  className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-[var(--mv-violet)] focus:ring-4 focus:ring-slate-100"
                />
              </label>
            </div>

            <label className="flex cursor-pointer items-center justify-between gap-4 rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Add starter catalogue
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Adds editable starter {false
                    ? "vehicles"
                    : false
                      ? "listings"
                      : "products"}.
                </p>
              </div>

              <input
                type="checkbox"
                checked={includeSampleData}
                onChange={(event) => setIncludeSampleData(event.target.checked)}
              />
            </label>

            {message ? (
              <div className="rounded-2xl bg-red-50 p-3 text-sm text-red-700">
                {message}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#26143d] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 md:hidden"
            >
              {isSubmitting ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <CheckCircle2 size={17} />
              )}

              {isSubmitting ? "Creating..." : "Save and Publish"}
            </button>
          </div>
        </form>

        <aside className="grid content-start gap-4">
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">
              Store Link
            </p>

            <p className="mt-3 break-all rounded-2xl bg-slate-50 p-3 text-sm font-semibold text-slate-950">
              /store/{slug || "business"}
            </p>

            <p className="mt-3 text-xs leading-5 text-slate-500">
              Theme selection is available after setup.
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">
              Next Steps
            </p>

            <div className="mt-3 grid gap-2">
              <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">
                Add or edit {false
                  ? "vehicles"
                  : false
                    ? "property listings"
                    : "products"}.
              </div>

              <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">
                Upload a hero image from Profile.
              </div>

              <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">
                Choose a {businessModes.find((mode) => mode.id === businessMode)?.themeLabel.toLowerCase()}.
              </div>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}

