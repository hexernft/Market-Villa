"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Eye,
  ImagePlus,
  Loader2,
  Plus,
  Save,
  Sparkles,
  Trash2,
} from "lucide-react";
import { getMyBusinesses } from "@/lib/business-actions";
import { supabase } from "@/lib/supabase";
import { uploadBusinessImage } from "@/lib/storage-actions";
import { ImageUploadField } from "@/components/ImageUploadField";
import {
  createHomeSectionFromPreset,
  homeSectionPresets,
} from "@/lib/home-builder";
import type {
  HomeBuilderCard,
  HomeBuilderSection,
  HomeButtonAction,
  HomeSectionEffect,
} from "@/lib/home-builder";

type ThemeSettings = {
  homeSections?: HomeBuilderSection[];
  [key: string]: unknown;
};

type DashboardBusiness = {
  id: string;
  name: string;
  slug: string;
  theme_settings?: ThemeSettings | null;
};

const buttonActions: { id: HomeButtonAction; label: string }[] = [
  { id: "products", label: "Products page" },
  { id: "contact", label: "Contact page" },
  { id: "whatsapp", label: "WhatsApp chat" },
  { id: "custom", label: "Custom URL" },
];

const effects: { id: HomeSectionEffect; label: string }[] = [
  { id: "none", label: "None" },
  { id: "lift", label: "Lift on hover" },
  { id: "glow", label: "Soft glow" },
  { id: "fade", label: "Subtle fade" },
];

function getSections(settings?: ThemeSettings | null) {
  return settings?.homeSections || [];
}

function textInputClass() {
  return "min-h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 outline-none focus:border-[#7c3aed]";
}

function textareaClass() {
  return "min-h-24 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium leading-6 text-slate-900 outline-none focus:border-[#7c3aed]";
}

function createBlankCard(): HomeBuilderCard {
  return {
    id: `card-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: "New card",
    text: "Add a short supporting point.",
  };
}

export default function HomeBuilderPage() {
  const [businesses, setBusinesses] = useState<DashboardBusiness[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [sections, setSections] = useState<HomeBuilderSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingId, setUploadingId] = useState("");
  const [message, setMessage] = useState("");

  const selectedBusiness = useMemo(
    () => businesses.find((business) => business.id === selectedBusinessId),
    [businesses, selectedBusinessId],
  );

  async function loadBusinesses() {
    setIsLoading(true);
    setMessage("");

    try {
      const items = (await getMyBusinesses()) as DashboardBusiness[];

      if (items.length === 0) {
        setBusinesses([]);
        setSections([]);
        return;
      }

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
        setSections(getSections(loadedBusinesses[0].theme_settings));
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
    setSections(getSections(business?.theme_settings));
    setMessage("");
  }

  function addPreset(preset: HomeBuilderSection) {
    setSections((current) => [...current, createHomeSectionFromPreset(preset)]);
    setMessage("Section added. Save when you are happy with the page.");
  }

  function updateSection(sectionId: string, update: Partial<HomeBuilderSection>) {
    setSections((current) =>
      current.map((section) =>
        section.id === sectionId ? { ...section, ...update } : section,
      ),
    );
  }

  function moveSection(sectionId: string, direction: -1 | 1) {
    setSections((current) => {
      const index = current.findIndex((section) => section.id === sectionId);
      const nextIndex = index + direction;

      if (index < 0 || nextIndex < 0 || nextIndex >= current.length) {
        return current;
      }

      const next = [...current];
      const [section] = next.splice(index, 1);
      next.splice(nextIndex, 0, section);
      return next;
    });
  }

  function removeSection(sectionId: string) {
    setSections((current) => current.filter((section) => section.id !== sectionId));
  }

  function updateCard(
    sectionId: string,
    cardId: string,
    update: Partial<HomeBuilderCard>,
  ) {
    setSections((current) =>
      current.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              cards: (section.cards || []).map((card) =>
                card.id === cardId ? { ...card, ...update } : card,
              ),
            }
          : section,
      ),
    );
  }

  function addCard(sectionId: string) {
    setSections((current) =>
      current.map((section) =>
        section.id === sectionId
          ? { ...section, cards: [...(section.cards || []), createBlankCard()] }
          : section,
      ),
    );
  }

  function removeCard(sectionId: string, cardId: string) {
    setSections((current) =>
      current.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              cards: (section.cards || []).filter((card) => card.id !== cardId),
            }
          : section,
      ),
    );
  }

  async function uploadSectionImage(sectionId: string, file: File) {
    if (!selectedBusinessId) return;

    setUploadingId(sectionId);
    setMessage("");

    try {
      const uploaded = await uploadBusinessImage({
        file,
        businessId: selectedBusinessId,
        folder: "covers",
      });
      updateSection(sectionId, { imageUrl: uploaded.publicUrl });
      setMessage("Image uploaded.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to upload image.");
    } finally {
      setUploadingId("");
    }
  }

  async function uploadCardImage(sectionId: string, cardId: string, file: File) {
    if (!selectedBusinessId) return;

    setUploadingId(cardId);
    setMessage("");

    try {
      const uploaded = await uploadBusinessImage({
        file,
        businessId: selectedBusinessId,
        folder: "covers",
      });
      updateCard(sectionId, cardId, { imageUrl: uploaded.publicUrl });
      setMessage("Card image uploaded.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to upload image.");
    } finally {
      setUploadingId("");
    }
  }

  async function saveSections() {
    if (!selectedBusiness) {
      setMessage("Select a store first.");
      return;
    }

    setIsSaving(true);
    setMessage("");

    const nextSettings = {
      ...(selectedBusiness.theme_settings || {}),
      homeSections: sections,
    };

    try {
      const { error } = await supabase
        .from("businesses")
        .update({
          theme_settings: nextSettings,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedBusiness.id);

      if (error) throw error;

      setBusinesses((current) =>
        current.map((business) =>
          business.id === selectedBusiness.id
            ? { ...business, theme_settings: nextSettings }
            : business,
        ),
      );
      setMessage("Home page saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save home page.");
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
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-white/80">
              <Sparkles size={14} />
              Home Builder
            </p>
            <h1 className="mt-4 text-3xl font-black tracking-[-0.06em] md:text-5xl">
              Build a richer store homepage.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/70">
              Add hero sections, cards, images, text blocks, effects, and buttons.
              These sections replace the default home content only when enabled.
            </p>
          </div>

          <div>
            <label className="text-sm font-black text-white/80">Store</label>
            <select
              value={selectedBusinessId}
              onChange={(event) => handleBusinessChange(event.target.value)}
              className="mt-3 min-h-11 w-full rounded-2xl border border-white/15 bg-white px-4 text-sm font-semibold text-slate-900 outline-none"
            >
              {businesses.map((business) => (
                <option key={business.id} value={business.id}>
                  {business.name} - /store/{business.slug}
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

      {businesses.length === 0 ? (
        <section className="rounded-[1.5rem] border border-slate-200 bg-white p-6 text-sm text-slate-600">
          Create a store before building a custom homepage.
        </section>
      ) : null}

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="grid gap-5">
          <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black tracking-[-0.04em] text-slate-950">
                  Add a section
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Start with a ready-made block, then customize the content.
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {homeSectionPresets.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => addPreset(preset)}
                  className="rounded-[1.2rem] border border-slate-200 bg-slate-50 p-4 text-left transition hover:-translate-y-0.5 hover:border-[#7c3aed]/40 hover:bg-[#f7f1ff]"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[#7c3aed]">
                    <Plus size={18} />
                  </span>
                  <p className="mt-3 text-sm font-black text-slate-950">
                    {preset.title}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {preset.type} block
                  </p>
                </button>
              ))}
            </div>
          </section>

          <section className="grid gap-4">
            {sections.length === 0 ? (
              <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-white p-8 text-center">
                <Sparkles className="mx-auto text-[#7c3aed]" size={28} />
                <h2 className="mt-3 text-xl font-black tracking-[-0.04em] text-slate-950">
                  No custom home sections yet
                </h2>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  Add a preset above. Until you save enabled sections, the store keeps
                  using its current default homepage.
                </p>
              </div>
            ) : null}

            {sections.map((section, index) => (
              <article
                key={section.id}
                className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-[#7c3aed]">
                      {section.type}
                    </p>
                    <h2 className="mt-1 text-xl font-black tracking-[-0.04em] text-slate-950">
                      {section.title || "Untitled section"}
                    </h2>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => updateSection(section.id, { enabled: section.enabled === false })}
                      className={`rounded-full px-4 py-2 text-xs font-black ${
                        section.enabled === false
                          ? "bg-slate-100 text-slate-500"
                          : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {section.enabled === false ? "Disabled" : "Enabled"}
                    </button>
                    <button
                      type="button"
                      onClick={() => moveSection(section.id, -1)}
                      disabled={index === 0}
                      className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 text-slate-600 disabled:opacity-35"
                      aria-label="Move section up"
                    >
                      <ArrowUp size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveSection(section.id, 1)}
                      disabled={index === sections.length - 1}
                      className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 text-slate-600 disabled:opacity-35"
                      aria-label="Move section down"
                    >
                      <ArrowDown size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeSection(section.id)}
                      className="grid h-9 w-9 place-items-center rounded-full bg-red-50 text-red-600"
                      aria-label="Remove section"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <label className="grid gap-2 text-sm font-black text-slate-700">
                    Eyebrow
                    <input
                      value={section.eyebrow || ""}
                      onChange={(event) =>
                        updateSection(section.id, { eyebrow: event.target.value })
                      }
                      className={textInputClass()}
                    />
                  </label>

                  <label className="grid gap-2 text-sm font-black text-slate-700">
                    Title
                    <input
                      value={section.title}
                      onChange={(event) =>
                        updateSection(section.id, { title: event.target.value })
                      }
                      className={textInputClass()}
                    />
                  </label>

                  <label className="grid gap-2 text-sm font-black text-slate-700 md:col-span-2">
                    Text
                    <textarea
                      value={section.text || ""}
                      onChange={(event) =>
                        updateSection(section.id, { text: event.target.value })
                      }
                      className={textareaClass()}
                    />
                  </label>

                  <label className="grid gap-2 text-sm font-black text-slate-700">
                    Alignment
                    <select
                      value={section.alignment || "left"}
                      onChange={(event) =>
                        updateSection(section.id, {
                          alignment: event.target.value as HomeBuilderSection["alignment"],
                        })
                      }
                      className={textInputClass()}
                    >
                      <option value="left">Left</option>
                      <option value="center">Center</option>
                    </select>
                  </label>

                  <label className="grid gap-2 text-sm font-black text-slate-700">
                    Image position
                    <select
                      value={section.imagePosition || "right"}
                      onChange={(event) =>
                        updateSection(section.id, {
                          imagePosition: event.target.value as HomeBuilderSection["imagePosition"],
                        })
                      }
                      className={textInputClass()}
                    >
                      <option value="right">Right</option>
                      <option value="left">Left</option>
                      <option value="top">Top</option>
                      <option value="background">Background</option>
                    </select>
                  </label>

                  <label className="grid gap-2 text-sm font-black text-slate-700">
                    Effect
                    <select
                      value={section.effect || "none"}
                      onChange={(event) =>
                        updateSection(section.id, {
                          effect: event.target.value as HomeSectionEffect,
                        })
                      }
                      className={textInputClass()}
                    >
                      {effects.map((effect) => (
                        <option key={effect.id} value={effect.id}>
                          {effect.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="grid gap-2 text-sm font-black text-slate-700">
                    Button action
                    <select
                      value={section.buttonAction || "products"}
                      onChange={(event) =>
                        updateSection(section.id, {
                          buttonAction: event.target.value as HomeButtonAction,
                        })
                      }
                      className={textInputClass()}
                    >
                      {buttonActions.map((action) => (
                        <option key={action.id} value={action.id}>
                          {action.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="grid gap-2 text-sm font-black text-slate-700">
                    Button label
                    <input
                      value={section.buttonLabel || ""}
                      onChange={(event) =>
                        updateSection(section.id, { buttonLabel: event.target.value })
                      }
                      className={textInputClass()}
                    />
                  </label>

                  {section.buttonAction === "custom" ? (
                    <label className="grid gap-2 text-sm font-black text-slate-700">
                      Custom button URL
                      <input
                        value={section.buttonUrl || ""}
                        onChange={(event) =>
                          updateSection(section.id, { buttonUrl: event.target.value })
                        }
                        className={textInputClass()}
                        placeholder="https://example.com"
                      />
                    </label>
                  ) : null}
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-[0.8fr_1.2fr]">
                  <ImageUploadField
                    label="Section image"
                    helper="Used by hero and image/text sections. Images are compressed before upload."
                    onCompressed={(file) => uploadSectionImage(section.id, file)}
                  />
                  <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-black text-slate-900">Current image</p>
                    {section.imageUrl ? (
                      <img
                        src={section.imageUrl}
                        alt={section.title}
                        className="mt-3 h-48 w-full rounded-2xl object-cover"
                      />
                    ) : (
                      <div className="mt-3 grid h-48 place-items-center rounded-2xl border border-dashed border-slate-300 bg-white text-slate-400">
                        <ImagePlus size={24} />
                      </div>
                    )}
                    {uploadingId === section.id ? (
                      <p className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-slate-500">
                        <Loader2 size={14} className="animate-spin" />
                        Uploading...
                      </p>
                    ) : null}
                  </div>
                </div>

                {section.type === "cards" || section.type === "trustBadges" ? (
                  <div className="mt-5 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-black text-slate-900">Cards</p>
                        <p className="mt-1 text-xs text-slate-500">
                          Add images for visual cards, or leave them blank for simple badges.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => addCard(section.id)}
                        className="inline-flex items-center gap-2 rounded-full bg-[#241436] px-4 py-2 text-xs font-black text-white"
                      >
                        <Plus size={14} />
                        Add card
                      </button>
                    </div>

                    <div className="mt-4 grid gap-4">
                      {(section.cards || []).map((card) => (
                        <div key={card.id} className="rounded-[1.25rem] border border-slate-200 bg-white p-4">
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-sm font-black text-slate-900">
                              {card.title || "Card"}
                            </p>
                            <button
                              type="button"
                              onClick={() => removeCard(section.id, card.id)}
                              className="grid h-8 w-8 place-items-center rounded-full bg-red-50 text-red-600"
                              aria-label="Remove card"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>

                          <div className="mt-4 grid gap-4 md:grid-cols-2">
                            <label className="grid gap-2 text-sm font-black text-slate-700">
                              Card title
                              <input
                                value={card.title}
                                onChange={(event) =>
                                  updateCard(section.id, card.id, {
                                    title: event.target.value,
                                  })
                                }
                                className={textInputClass()}
                              />
                            </label>

                            <label className="grid gap-2 text-sm font-black text-slate-700">
                              Card text
                              <input
                                value={card.text}
                                onChange={(event) =>
                                  updateCard(section.id, card.id, {
                                    text: event.target.value,
                                  })
                                }
                                className={textInputClass()}
                              />
                            </label>
                          </div>

                          <div className="mt-4 grid gap-4 md:grid-cols-[0.8fr_1.2fr]">
                            <ImageUploadField
                              label="Card image"
                              helper="Optional image for this card."
                              onCompressed={(file) =>
                                uploadCardImage(section.id, card.id, file)
                              }
                            />
                            <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-3">
                              {card.imageUrl ? (
                                <img
                                  src={card.imageUrl}
                                  alt={card.title}
                                  className="h-36 w-full rounded-2xl object-cover"
                                />
                              ) : (
                                <div className="grid h-36 place-items-center rounded-2xl border border-dashed border-slate-300 bg-white text-slate-400">
                                  <ImagePlus size={22} />
                                </div>
                              )}
                              {uploadingId === card.id ? (
                                <p className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-slate-500">
                                  <Loader2 size={14} className="animate-spin" />
                                  Uploading...
                                </p>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </article>
            ))}
          </section>
        </div>

        <aside className="sticky top-5 h-fit rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-black tracking-[-0.04em] text-slate-950">
            Home page status
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Enabled sections appear on the public homepage. If none are enabled,
            the store uses the default homepage.
          </p>

          <div className="mt-4 grid gap-2 rounded-[1.25rem] bg-slate-50 p-3 text-sm">
            <div className="flex justify-between gap-3">
              <span className="text-slate-500">Total sections</span>
              <strong className="text-slate-950">{sections.length}</strong>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-slate-500">Enabled</span>
              <strong className="text-slate-950">
                {sections.filter((section) => section.enabled !== false).length}
              </strong>
            </div>
          </div>

          <button
            type="button"
            onClick={saveSections}
            disabled={isSaving || !selectedBusiness}
            className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[#241436] px-5 text-sm font-black text-white transition hover:bg-[#321b52] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? (
              <Loader2 size={17} className="animate-spin" />
            ) : (
              <Save size={17} />
            )}
            {isSaving ? "Saving..." : "Save home page"}
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


