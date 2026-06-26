"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, MessageCircle, Sparkles } from "lucide-react";
import { getStorePagePath } from "@/lib/store-pages";
import type { HomeBuilderSection } from "@/lib/home-builder";

type StoreLike = {
  name: string;
  slug?: string | null;
  whatsapp?: string | null;
};

type Palette = {
  page: string;
  surface: string;
  brand: string;
  accent: string;
  soft: string;
  text: string;
  muted: string;
};

type Props = {
  business: StoreLike;
  sections: HomeBuilderSection[];
  palette: Palette;
};

function getButtonHref(section: HomeBuilderSection, business: StoreLike) {
  if (section.buttonAction === "contact") {
    return getStorePagePath(business.slug, "contact");
  }

  if (section.buttonAction === "whatsapp") {
    return `https://wa.me/${business.whatsapp || ""}`;
  }

  if (section.buttonAction === "custom" && section.buttonUrl) {
    return section.buttonUrl;
  }

  return getStorePagePath(business.slug, "products");
}

function effectClass(effect?: string) {
  if (effect === "lift") return "transition hover:-translate-y-1";
  if (effect === "glow") return "shadow-[0_24px_70px_rgba(124,58,237,0.16)]";
  if (effect === "fade") return "opacity-95";
  return "";
}

function SectionButton({
  section,
  business,
  palette,
}: {
  section: HomeBuilderSection;
  business: StoreLike;
  palette: Palette;
}) {
  if (!section.buttonLabel) return null;

  return (
    <Link
      href={getButtonHref(section, business)}
      className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-black"
      style={{
        backgroundColor: palette.accent,
        color: "#ffffff",
      }}
    >
      {section.buttonAction === "whatsapp" ? <MessageCircle size={16} /> : <ArrowRight size={16} />}
      {section.buttonLabel}
    </Link>
  );
}

export function StoreHomeBuilderSections({ business, sections, palette }: Props) {
  return (
    <div className="grid gap-5 px-4 py-5">
      {sections.map((section) => {
        if (section.type === "hero") {
          const imageAsBackground = section.imagePosition === "background";

          return (
            <section
              key={section.id}
              className={`mx-auto grid w-full max-w-6xl overflow-hidden rounded-[1.6rem] ${effectClass(section.effect)} ${
                imageAsBackground ? "relative min-h-[420px]" : "md:grid-cols-[0.95fr_1.05fr]"
              }`}
              style={{
                backgroundColor: palette.brand,
                color: "#ffffff",
              }}
            >
              {imageAsBackground && section.imageUrl ? (
                <Image src={section.imageUrl} alt={section.title} fill sizes="100vw" className="object-cover opacity-55" />
              ) : null}
              <div className={`relative z-10 flex flex-col justify-center p-6 md:p-10 ${section.alignment === "center" ? "items-center text-center" : ""}`}>
                {section.eyebrow ? (
                  <p className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: palette.accent }}>
                    {section.eyebrow}
                  </p>
                ) : null}
                <h1 className="mt-4 max-w-3xl text-[2.5rem] font-black leading-[0.95] tracking-[-0.065em] md:text-[4.5rem]">
                  {section.title}
                </h1>
                {section.text ? (
                  <p className="mt-4 max-w-xl text-sm leading-7 text-white/76">
                    {section.text}
                  </p>
                ) : null}
                <div className="mt-6">
                  <SectionButton section={section} business={business} palette={palette} />
                </div>
              </div>
              {!imageAsBackground ? (
                <div className={`relative min-h-[280px] ${section.imagePosition === "left" ? "md:-order-1" : ""}`} style={{ backgroundColor: palette.soft }}>
                  {section.imageUrl ? (
                    <Image src={section.imageUrl} alt={section.title} fill sizes="50vw" className="object-cover" />
                  ) : (
                    <div className="grid h-full min-h-[280px] place-items-center text-white/60">
                      <Sparkles size={42} />
                    </div>
                  )}
                </div>
              ) : null}
            </section>
          );
        }

        if (section.type === "cards" || section.type === "trustBadges") {
          return (
            <section key={section.id} className="mx-auto w-full max-w-6xl">
              <div className={section.alignment === "center" ? "text-center" : ""}>
                {section.eyebrow ? (
                  <p className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: palette.accent }}>
                    {section.eyebrow}
                  </p>
                ) : null}
                <h2 className="mt-2 text-3xl font-black tracking-[-0.05em]" style={{ color: palette.text }}>
                  {section.title}
                </h2>
                {section.text ? (
                  <p className="mx-auto mt-2 max-w-2xl text-sm leading-7" style={{ color: palette.muted }}>
                    {section.text}
                  </p>
                ) : null}
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                {(section.cards || []).map((card) => (
                  <article
                    key={card.id}
                    className={`overflow-hidden rounded-[1.25rem] border p-4 ${effectClass(section.effect)}`}
                    style={{
                      backgroundColor: palette.surface,
                      borderColor: palette.soft,
                    }}
                  >
                    {card.imageUrl ? (
                      <div className="relative mb-4 min-h-[150px] overflow-hidden rounded-[1rem]">
                        <Image src={card.imageUrl} alt={card.title} fill sizes="33vw" className="object-cover" />
                      </div>
                    ) : section.type === "trustBadges" ? (
                      <CheckCircle2 className="mb-4" size={24} style={{ color: palette.accent }} />
                    ) : null}
                    <h3 className="text-base font-black" style={{ color: palette.text }}>
                      {card.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6" style={{ color: palette.muted }}>
                      {card.text}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          );
        }

        if (section.type === "imageText") {
          return (
            <section
              key={section.id}
              className={`mx-auto grid w-full max-w-6xl overflow-hidden rounded-[1.35rem] md:grid-cols-2 ${effectClass(section.effect)}`}
              style={{ backgroundColor: palette.surface, border: `1px solid ${palette.soft}` }}
            >
              <div className={`relative min-h-[260px] ${section.imagePosition === "right" ? "md:order-2" : ""}`} style={{ backgroundColor: palette.soft }}>
                {section.imageUrl ? (
                  <Image src={section.imageUrl} alt={section.title} fill sizes="50vw" className="object-cover" />
                ) : null}
              </div>
              <div className={`flex flex-col justify-center p-6 md:p-8 ${section.alignment === "center" ? "items-center text-center" : ""}`}>
                {section.eyebrow ? (
                  <p className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: palette.accent }}>
                    {section.eyebrow}
                  </p>
                ) : null}
                <h2 className="mt-3 text-3xl font-black tracking-[-0.05em]" style={{ color: palette.text }}>
                  {section.title}
                </h2>
                {section.text ? (
                  <p className="mt-3 max-w-xl text-sm leading-7" style={{ color: palette.muted }}>
                    {section.text}
                  </p>
                ) : null}
                <div className="mt-5">
                  <SectionButton section={section} business={business} palette={palette} />
                </div>
              </div>
            </section>
          );
        }

        return (
          <section
            key={section.id}
            className={`mx-auto w-full max-w-6xl rounded-[1.35rem] p-6 text-center md:p-9 ${effectClass(section.effect)}`}
            style={{
              backgroundColor: palette.brand,
              color: "#ffffff",
            }}
          >
            {section.eyebrow ? (
              <p className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: palette.accent }}>
                {section.eyebrow}
              </p>
            ) : null}
            <h2 className="mx-auto mt-3 max-w-3xl text-3xl font-black tracking-[-0.05em] md:text-4xl">
              {section.title}
            </h2>
            {section.text ? (
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-white/72">
                {section.text}
              </p>
            ) : null}
            <div className="mt-6">
              <SectionButton section={section} business={business} palette={palette} />
            </div>
          </section>
        );
      })}
    </div>
  );
}
