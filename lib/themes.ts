export type StoreLayout =
  | "classic-commerce"
  | "editorial-luxury"
  | "food-market"
  | "bold-retail"
  | "minimal-studio"
  | "service-pro"
  | "apartment-stay"
  | "beauty-lounge"
  | "local-vendor"
  | "corporate-clean";

export type BusinessTheme = {
  id: string;
  name: string;
  description: string;
  layout: StoreLayout;
  page: string;
  hero: string;
  card: string;
  mutedCard: string;
  text: string;
  mutedText: string;
  accent: string;
  accentText: string;
  button: string;
  secondaryButton: string;
  chip: string;
  border: string;
  productCard: string;
  sectionLabel: string;
};

export const businessThemes: BusinessTheme[] = [
  {
    id: "classic-commerce",
    name: "Classic Commerce",
    description: "A clean storefront layout for general product businesses.",
    layout: "classic-commerce",
    page: "bg-slate-100 text-slate-950",
    hero: "from-slate-950 via-slate-900 to-teal-950",
    card: "bg-white text-slate-950",
    mutedCard: "bg-slate-950 text-white",
    text: "text-white",
    mutedText: "text-slate-300",
    accent: "bg-purple-400",
    accentText: "text-purple-300",
    button: "bg-purple-400 text-slate-950 hover:bg-purple-300",
    secondaryButton:
      "bg-white/10 text-white ring-1 ring-white/15 hover:bg-white/15",
    chip: "bg-white/10 text-white ring-1 ring-white/15",
    border: "border-slate-200",
    productCard: "rounded-[1.75rem] bg-white text-slate-950 shadow-sm",
    sectionLabel: "text-teal-700",
  },
  {
    id: "editorial-luxury",
    name: "Editorial Luxury",
    description: "Magazine-style layout for fashion, interiors, and premium brands.",
    layout: "editorial-luxury",
    page: "bg-[#f7f1e8] text-[#20140d]",
    hero: "from-[#20140d] via-[#4a2e1d] to-[#9c6b3f]",
    card: "bg-[#fffaf3] text-[#20140d]",
    mutedCard: "bg-[#20140d] text-[#fffaf3]",
    text: "text-[#fffaf3]",
    mutedText: "text-[#ead9c2]",
    accent: "bg-[#c99b5c]",
    accentText: "text-[#f3c77e]",
    button: "bg-[#20140d] text-[#fffaf3] hover:bg-[#3a2619]",
    secondaryButton:
      "bg-[#fffaf3]/10 text-[#fffaf3] ring-1 ring-[#fffaf3]/20 hover:bg-[#fffaf3]/15",
    chip: "bg-[#fffaf3]/12 text-[#fffaf3] ring-1 ring-[#fffaf3]/20",
    border: "border-[#ead9c2]",
    productCard: "rounded-none bg-[#fffaf3] text-[#20140d] shadow-sm",
    sectionLabel: "text-[#9c6b3f]",
  },
  {
    id: "food-market",
    name: "Food Market",
    description: "Warm, appetizing, and built for food vendors and bakeries.",
    layout: "food-market",
    page: "bg-[#fff7ed] text-[#2a1208]",
    hero: "from-[#2a1208] via-[#5a1f0f] to-[#b45309]",
    card: "bg-white text-[#2a1208]",
    mutedCard: "bg-[#2a1208] text-white",
    text: "text-white",
    mutedText: "text-purple-100",
    accent: "bg-[#f59e0b]",
    accentText: "text-[#fbbf24]",
    button: "bg-[#2a1208] text-white hover:bg-[#441908]",
    secondaryButton:
      "bg-white/10 text-white ring-1 ring-white/20 hover:bg-white/15",
    chip: "bg-white/12 text-white ring-1 ring-white/20",
    border: "border-[rgba(124,58,237,0.28)]",
    productCard: "rounded-[2rem] bg-white text-[#2a1208] shadow-sm",
    sectionLabel: "text-purple-700",
  },
  {
    id: "bold-retail",
    name: "Bold Retail",
    description: "High-energy layout for gadgets, fashion drops, and retail stores.",
    layout: "bold-retail",
    page: "bg-zinc-950 text-white",
    hero: "from-black via-zinc-900 to-rose-950",
    card: "bg-white text-zinc-950",
    mutedCard: "bg-zinc-900 text-white",
    text: "text-white",
    mutedText: "text-zinc-300",
    accent: "bg-rose-500",
    accentText: "text-rose-400",
    button: "bg-rose-500 text-white hover:bg-rose-400",
    secondaryButton:
      "bg-white/10 text-white ring-1 ring-white/15 hover:bg-white/15",
    chip: "bg-rose-500/15 text-rose-50 ring-1 ring-rose-300/20",
    border: "border-white/10",
    productCard: "rounded-[1.25rem] bg-white text-zinc-950 shadow-sm",
    sectionLabel: "text-rose-400",
  },
  {
    id: "minimal-studio",
    name: "Minimal Studio",
    description: "Sharp black-and-white layout for creators and modern studios.",
    layout: "minimal-studio",
    page: "bg-white text-black",
    hero: "from-black via-neutral-950 to-neutral-900",
    card: "bg-white text-black",
    mutedCard: "bg-black text-white",
    text: "text-white",
    mutedText: "text-neutral-300",
    accent: "bg-black",
    accentText: "text-black",
    button: "bg-black text-white hover:bg-neutral-800",
    secondaryButton:
      "bg-white/10 text-white ring-1 ring-white/15 hover:bg-white/15",
    chip: "bg-white/10 text-white ring-1 ring-white/15",
    border: "border-neutral-200",
    productCard: "rounded-none border border-neutral-200 bg-white text-black",
    sectionLabel: "text-neutral-500",
  },
  {
    id: "service-pro",
    name: "Service Pro",
    description: "Consulting-style layout for agencies, professionals, and service brands.",
    layout: "service-pro",
    page: "bg-slate-50 text-slate-950",
    hero: "from-[#07111f] via-[#0f253f] to-[#0f766e]",
    card: "bg-white text-slate-950",
    mutedCard: "bg-[#07111f] text-white",
    text: "text-white",
    mutedText: "text-slate-300",
    accent: "bg-teal-400",
    accentText: "text-teal-300",
    button: "bg-teal-400 text-slate-950 hover:bg-teal-300",
    secondaryButton:
      "bg-white/10 text-white ring-1 ring-white/15 hover:bg-white/15",
    chip: "bg-teal-300/15 text-teal-50 ring-1 ring-teal-200/20",
    border: "border-slate-200",
    productCard: "rounded-[1.5rem] bg-white text-slate-950 shadow-sm",
    sectionLabel: "text-teal-700",
  },
  {
    id: "apartment-stay",
    name: "Apartment Stay",
    description: "Hospitality layout for shortlets, hotels, and premium stays.",
    layout: "apartment-stay",
    page: "bg-stone-100 text-stone-950",
    hero: "from-stone-950 via-stone-800 to-[#7a552c]",
    card: "bg-white text-stone-950",
    mutedCard: "bg-stone-900 text-white",
    text: "text-white",
    mutedText: "text-stone-200",
    accent: "bg-[#c7a15a]",
    accentText: "text-[#d9b76f]",
    button: "bg-stone-950 text-white hover:bg-stone-800",
    secondaryButton:
      "bg-white/10 text-white ring-1 ring-white/20 hover:bg-white/15",
    chip: "bg-white/12 text-white ring-1 ring-white/20",
    border: "border-stone-200",
    productCard: "rounded-[2rem] bg-white text-stone-950 shadow-sm",
    sectionLabel: "text-[#7a552c]",
  },
  {
    id: "beauty-lounge",
    name: "Beauty Lounge",
    description: "Soft, elegant layout for salons, spas, beauty, and wellness.",
    layout: "beauty-lounge",
    page: "bg-[#fff1f5] text-[#3b1020]",
    hero: "from-[#3b1020] via-[#7f1d3a] to-[#db7290]",
    card: "bg-white text-[#3b1020]",
    mutedCard: "bg-[#3b1020] text-white",
    text: "text-white",
    mutedText: "text-pink-100",
    accent: "bg-[#f8b4c8]",
    accentText: "text-[#f8b4c8]",
    button: "bg-[#3b1020] text-white hover:bg-[#5a1830]",
    secondaryButton:
      "bg-white/10 text-white ring-1 ring-white/20 hover:bg-white/15",
    chip: "bg-white/12 text-white ring-1 ring-white/20",
    border: "border-pink-200",
    productCard: "rounded-[2.25rem] bg-white text-[#3b1020] shadow-sm",
    sectionLabel: "text-[#be496b]",
  },
  {
    id: "local-vendor",
    name: "Local Vendor",
    description: "Friendly neighborhood layout for simple local sellers.",
    layout: "local-vendor",
    page: "bg-[#f5f0df] text-[#172114]",
    hero: "from-[#172114] via-[#31572c] to-[#90a955]",
    card: "bg-[#fffdf5] text-[#172114]",
    mutedCard: "bg-[#172114] text-[#fffdf5]",
    text: "text-[#fffdf5]",
    mutedText: "text-lime-100",
    accent: "bg-[#ecf39e]",
    accentText: "text-[#ecf39e]",
    button: "bg-[#172114] text-[#fffdf5] hover:bg-[#253820]",
    secondaryButton:
      "bg-white/10 text-white ring-1 ring-white/20 hover:bg-white/15",
    chip: "bg-white/12 text-white ring-1 ring-white/20",
    border: "border-lime-200",
    productCard: "rounded-[1.5rem] bg-[#fffdf5] text-[#172114] shadow-sm",
    sectionLabel: "text-[#31572c]",
  },
  {
    id: "corporate-clean",
    name: "Corporate Clean",
    description: "Structured layout for schools, clinics, firms, and formal businesses.",
    layout: "corporate-clean",
    page: "bg-[#f8fafc] text-[#0f172a]",
    hero: "from-[#0f172a] via-[#1e3a5f] to-[#2563eb]",
    card: "bg-white text-[#0f172a]",
    mutedCard: "bg-[#0f172a] text-white",
    text: "text-white",
    mutedText: "text-blue-100",
    accent: "bg-blue-500",
    accentText: "text-blue-300",
    button: "bg-blue-600 text-white hover:bg-blue-500",
    secondaryButton:
      "bg-white/10 text-white ring-1 ring-white/15 hover:bg-white/15",
    chip: "bg-white/12 text-white ring-1 ring-white/20",
    border: "border-slate-200",
    productCard: "rounded-[1rem] bg-white text-slate-950 shadow-sm",
    sectionLabel: "text-blue-700",
  },
];

export function getBusinessTheme(themeId: string) {
  return (
    businessThemes.find((theme) => theme.id === themeId) ?? businessThemes[0]
  );
}