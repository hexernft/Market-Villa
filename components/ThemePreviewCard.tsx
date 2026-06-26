import { BusinessTheme } from "@/lib/themes";
import { CheckCircle2, LayoutTemplate, Sparkles } from "lucide-react";

type Props = {
  theme: BusinessTheme;
  selected?: boolean;
};

const layoutLabels: Record<string, string> = {
  "classic-commerce": "Classic shop",
  "simple-one-page": "One pager",
  "editorial-luxury": "Editorial",
  "food-market": "Food grid",
  "bold-retail": "Retail drop",
  "minimal-studio": "Minimal",
  "apartment-stay": "Hospitality",
  "beauty-lounge": "Beauty",
  "local-vendor": "Local",
  "corporate-clean": "Corporate",
  "kids-play": "Kids retail",
  "grocery-fresh": "Grocery",
  "tech-catalog": "Tech specs",
  "jewelry-gallery": "Gallery",
  "pharmacy-care": "Care retail",
  "event-catering": "Events",
  "car-showroom": "Cars",
  "mono-runway": "Runway",
  "daily-menu": "Food menu",
  "beauty-shop": "Beauty shop",
  "home-furniture": "Home",
};

const defaultFeatures = ["Product catalogue", "WhatsApp checkout", "Mobile-ready"];

export function ThemePreviewCard({ theme, selected }: Props) {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-soft">
      <div className={`bg-gradient-to-br ${theme.hero} p-5 text-white`}>
        <div className="mb-10 flex items-center justify-between">
          <span className={`rounded-full px-3 py-1 text-xs ${theme.chip}`}>
            {layoutLabels[theme.layout]}
          </span>

          {selected ? (
            <CheckCircle2 className="text-emerald-300" size={21} />
          ) : null}
        </div>

        {theme.layout === "simple-one-page" ? (
          <div className="rounded-2xl bg-white/80 p-4 text-[#211331]">
            <div className="mb-4 flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-[#211331]" />
              <div className="h-3 w-1/2 rounded bg-[#211331]/70" />
            </div>
            <div className="grid grid-cols-[1fr_0.8fr] gap-3">
              <div>
                <div className="h-4 w-3/4 rounded bg-[#211331]/80" />
                <div className="mt-3 h-3 w-1/2 rounded bg-[#211331]/30" />
                <div className="mt-5 h-8 w-24 rounded-xl bg-[#211331]" />
              </div>
              <div className="h-24 rounded-2xl bg-[#7c3aed]/20" />
            </div>
          </div>
        ) : theme.layout === "editorial-luxury" ? (
          <div className="grid grid-cols-[0.75fr_1fr] gap-3">
            <div className="h-32 bg-white/20" />
            <div className="space-y-3">
              <div className="h-3 w-2/3 bg-white/80" />
              <div className="h-3 w-1/2 bg-white/40" />
              <div className="mt-5 h-10 w-24 rounded-full bg-white/80" />
            </div>
          </div>
        ) : theme.layout === "bold-retail" ? (
          <div>
            <div className="mb-5 h-6 w-4/5 rounded bg-white/80" />
            <div className="grid grid-cols-3 gap-2">
              <div className="h-16 rounded-xl bg-white/20" />
              <div className="h-16 rounded-xl bg-white/30" />
              <div className="h-16 rounded-xl bg-white/20" />
            </div>
          </div>
        ) : theme.layout === "minimal-studio" ? (
          <div className="space-y-5">
            <div className="h-px w-full bg-white/40" />
            <div className="h-4 w-2/3 bg-white/90" />
            <div className="h-px w-3/4 bg-white/30" />
            <div className="h-10 w-28 border border-white/70" />
          </div>
        ) : theme.layout === "apartment-stay" ? (
          <div className="overflow-hidden rounded-2xl bg-white/15 p-2">
            <div className="h-28 rounded-xl bg-white/30" />
            <div className="mt-3 h-3 w-2/3 rounded bg-white/70" />
          </div>
        ) : theme.layout === "beauty-lounge" ? (
          <div className="rounded-[2rem] bg-white/15 p-4">
            <div className="h-16 w-16 rounded-full bg-white/40" />
            <div className="mt-4 h-3 w-2/3 rounded bg-white/80" />
            <div className="mt-2 h-3 w-1/2 rounded bg-white/40" />
          </div>
        ) : theme.layout === "beauty-shop" ? (
          <div className="rounded-[1.35rem] bg-white/90 p-3 text-[#3b1020]">
            <div className="grid grid-cols-[1fr_auto] gap-3">
              <div>
                <div className="h-3 w-24 rounded-full bg-[#3b1020]" />
                <div className="mt-2 h-2 w-16 rounded-full bg-pink-200" />
              </div>
              <div className="h-10 w-10 rounded-full bg-[#f8b4c8]" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="h-20 rounded-2xl bg-[#fff1f6]" />
              <div className="h-20 rounded-2xl bg-[#f8b4c8]/70" />
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <div className="h-8 rounded-xl bg-[#3b1020]" />
              <div className="h-8 rounded-xl bg-pink-100" />
              <div className="h-8 rounded-xl bg-pink-100" />
            </div>
          </div>
        ) : theme.layout === "local-vendor" ? (
          <div className="grid grid-cols-2 gap-3">
            <div className="h-24 rounded-3xl bg-white/20" />
            <div className="h-24 rounded-3xl bg-white/30" />
          </div>
        ) : theme.layout === "corporate-clean" ? (
          <div className="rounded-xl bg-white/10 p-4">
            <div className="h-3 w-full rounded bg-white/60" />
            <div className="mt-3 h-3 w-2/3 rounded bg-white/30" />
            <div className="mt-6 grid grid-cols-2 gap-2">
              <div className="h-10 rounded-lg bg-white/20" />
              <div className="h-10 rounded-lg bg-white/20" />
            </div>
          </div>
        ) : theme.layout === "kids-play" ? (
          <div className="rounded-[1.35rem] bg-white/90 p-3 text-[#25112f]">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="h-3 w-24 rounded-full bg-[#25112f]" />
                <div className="mt-2 h-2 w-16 rounded-full bg-fuchsia-200" />
              </div>
              <div className="h-10 w-10 rounded-2xl bg-yellow-200" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="h-16 rounded-2xl bg-fuchsia-100" />
              <div className="h-16 rounded-2xl bg-yellow-100" />
              <div className="h-16 rounded-2xl bg-purple-100" />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="h-8 rounded-xl bg-[#7c3aed]" />
              <div className="h-8 rounded-xl bg-fuchsia-100" />
            </div>
          </div>
        ) : theme.layout === "grocery-fresh" ? (
          <div className="grid grid-cols-3 gap-2">
            <div className="h-24 rounded-2xl bg-white/20" />
            <div className="h-24 rounded-2xl bg-lime-200/60" />
            <div className="h-24 rounded-2xl bg-white/25" />
          </div>
        ) : theme.layout === "tech-catalog" ? (
          <div className="rounded-xl bg-[#061124]/90 p-3 ring-1 ring-sky-200/20">
            <div className="mb-3 flex items-center justify-between">
              <div className="h-2 w-24 rounded-full bg-sky-200/80" />
              <div className="h-7 w-7 rounded-lg bg-sky-300/70" />
            </div>
            <div className="grid grid-cols-[0.9fr_1fr] gap-2">
              <div className="h-28 rounded-lg bg-white/15" />
              <div className="grid gap-2">
                <div className="h-8 rounded-lg bg-white/25" />
                <div className="h-8 rounded-lg bg-sky-200/35" />
                <div className="h-8 rounded-lg bg-white/15" />
              </div>
            </div>
          </div>
        ) : theme.layout === "home-furniture" ? (
          <div className="rounded-xl bg-white/90 p-3 text-[#201a14]">
            <div className="grid grid-cols-[1fr_0.65fr] gap-2">
              <div className="h-28 rounded-lg bg-[#d8c2a4]" />
              <div className="grid gap-2">
                <div className="h-12 rounded-lg bg-[#f5f2ec]" />
                <div className="h-12 rounded-lg bg-[#201a14]" />
              </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <div className="h-8 rounded-lg bg-[#201a14]" />
              <div className="h-8 rounded-lg bg-[#ede3d5]" />
              <div className="h-8 rounded-lg bg-[#ede3d5]" />
            </div>
          </div>
        ) : theme.layout === "jewelry-gallery" ? (
          <div className="grid grid-cols-[1fr_0.7fr] gap-3">
            <div className="h-32 bg-amber-100/25" />
            <div className="grid gap-3">
              <div className="h-14 bg-white/30" />
              <div className="h-14 bg-white/15" />
            </div>
          </div>
        ) : theme.layout === "pharmacy-care" ? (
          <div className="rounded-2xl bg-white/12 p-4">
            <div className="h-12 w-12 rounded-full bg-cyan-100/70" />
            <div className="mt-4 h-3 w-3/4 rounded bg-white/80" />
            <div className="mt-3 h-3 w-1/2 rounded bg-white/35" />
          </div>
        ) : theme.layout === "event-catering" ? (
          <div className="grid gap-2">
            <div className="h-14 rounded-2xl bg-orange-100/30" />
            <div className="h-14 rounded-2xl bg-white/20" />
            <div className="h-14 rounded-2xl bg-white/15" />
          </div>
        ) : theme.layout === "car-showroom" ? (
          <div className="rounded-xl bg-white/90 p-3 text-[#101714]">
            <div className="h-24 rounded-lg bg-[#101714]" />
            <div className="mt-3 grid grid-cols-3 gap-2">
              <div className="h-8 rounded-lg bg-[#22c55e]" />
              <div className="h-8 rounded-lg bg-slate-200" />
              <div className="h-8 rounded-lg bg-slate-200" />
            </div>
            <div className="mt-3 grid grid-cols-[1fr_0.55fr] gap-2">
              <div className="h-10 rounded-lg bg-slate-100" />
              <div className="h-10 rounded-lg bg-[#101714]" />
            </div>
          </div>
        ) : theme.id === "bush-market-pro" ? (
          <div className="rounded-[1.35rem] bg-[#fffaf0] p-3 text-[#24160a] ring-1 ring-[#d8b879]">
            <div className="grid grid-cols-[1fr_auto] items-center gap-3">
              <div>
                <div className="h-3 w-28 rounded-full bg-[#24160a]" />
                <div className="mt-2 h-2 w-20 rounded-full bg-[#d8b879]" />
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-full bg-[#31572c] text-[10px] font-bold text-[#fff8e8]">
                PRO
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="h-12 rounded-2xl bg-[#ead6a8]" />
              <div className="h-12 rounded-2xl bg-[#d89a2b]" />
              <div className="h-12 rounded-2xl bg-[#f5e3bd]" />
            </div>
            <div className="mt-3 grid gap-2">
              <div className="h-8 rounded-xl bg-[#24160a]" />
              <div className="h-8 rounded-xl bg-[#31572c]" />
            </div>
          </div>
        ) : theme.layout === "daily-menu" ? (
          <div className="rounded-[1.35rem] bg-white/95 p-3 text-[#2b1206]">
            <div className="grid grid-cols-[1fr_auto] items-center gap-3">
              <div>
                <div className="h-3 w-24 rounded-full bg-[#2b1206]" />
                <div className="mt-2 h-2 w-16 rounded-full bg-orange-200" />
              </div>
              <div className="h-10 w-10 rounded-full bg-[#f97316]" />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="h-12 rounded-2xl bg-[#fff1df]" />
              <div className="h-12 rounded-2xl bg-[#fed7aa]" />
              <div className="h-12 rounded-2xl bg-[#fff1df]" />
            </div>
            <div className="mt-3 grid gap-2">
              <div className="h-8 rounded-xl bg-[#2b1206]" />
              <div className="h-8 rounded-xl bg-orange-100" />
            </div>
          </div>
        ) : theme.layout === "mono-runway" ? (
          <div className="rounded-xl border border-white/15 bg-[#0c0e13]/85 p-3">
            <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
              <div className="h-2 w-20 rounded bg-white/80" />
              <div className="flex gap-1">
                <div className="h-1.5 w-5 rounded bg-white/30" />
                <div className="h-1.5 w-5 rounded bg-white/30" />
                <div className="h-1.5 w-5 rounded bg-white/30" />
              </div>
            </div>
            <div className="grid grid-cols-[1fr_0.72fr] gap-3">
              <div>
                <div className="h-4 w-3/4 rounded bg-white/90" />
                <div className="mt-2 h-3 w-1/2 rounded bg-white/35" />
                <div className="mt-5 h-8 w-20 rounded-full bg-white" />
              </div>
              <div className="grid gap-2">
                <div className="h-16 rounded-lg bg-white/25" />
                <div className="h-8 rounded-lg bg-white/10" />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="h-3 w-2/3 rounded-full bg-white/80" />
            <div className="h-3 w-1/2 rounded-full bg-white/40" />
            <div className="mt-5 h-10 w-32 rounded-full bg-white/80" />
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          <LayoutTemplate size={15} />
          Website structure
        </div>

        <h3 className="font-semibold text-slate-950">{theme.name}</h3>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          {theme.description}
        </p>

        <div className="mt-4 grid gap-2">
          {(theme.features || defaultFeatures).slice(0, 3).map((feature) => (
            <span
              key={feature}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600"
            >
              <Sparkles size={13} className="text-[#7c3aed]" />
              {feature}
            </span>
          ))}
        </div>

        {theme.bestFor ? (
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
            Best for: {theme.bestFor}
          </p>
        ) : null}
      </div>
    </div>
  );
}

