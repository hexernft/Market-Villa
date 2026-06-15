import { BusinessTheme } from "@/lib/themes";
import { CheckCircle2, LayoutTemplate } from "lucide-react";

type Props = {
  theme: BusinessTheme;
  selected?: boolean;
};

const layoutLabels: Record<string, string> = {
  "classic-commerce": "Classic shop",
  "editorial-luxury": "Editorial",
  "food-market": "Food grid",
  "bold-retail": "Retail drop",
  "minimal-studio": "Minimal",
  "service-pro": "Service-led",
  "apartment-stay": "Hospitality",
  "beauty-lounge": "Beauty",
  "local-vendor": "Local",
  "corporate-clean": "Corporate",
};

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

        {theme.layout === "editorial-luxury" ? (
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
        ) : theme.layout === "service-pro" ? (
          <div className="grid gap-2">
            <div className="h-10 rounded-2xl bg-white/20" />
            <div className="h-10 rounded-2xl bg-white/15" />
            <div className="h-10 rounded-2xl bg-white/10" />
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
      </div>
    </div>
  );
}