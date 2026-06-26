export type HomeSectionType = "hero" | "cards" | "imageText" | "cta" | "trustBadges";
export type HomeSectionEffect = "none" | "lift" | "glow" | "fade";
export type HomeButtonAction = "products" | "contact" | "whatsapp" | "custom";

export type HomeBuilderCard = {
  id: string;
  title: string;
  text: string;
  imageUrl?: string;
};

export type HomeBuilderSection = {
  id: string;
  type: HomeSectionType;
  template: string;
  enabled: boolean;
  title: string;
  eyebrow?: string;
  text?: string;
  imageUrl?: string;
  alignment?: "left" | "center";
  imagePosition?: "left" | "right" | "top" | "background";
  effect?: HomeSectionEffect;
  buttonLabel?: string;
  buttonAction?: HomeButtonAction;
  buttonUrl?: string;
  cards?: HomeBuilderCard[];
};

export type HomeBuilderSettings = {
  homeSections?: HomeBuilderSection[];
};

export const homeSectionPresets: HomeBuilderSection[] = [
  {
    id: "preset-hero",
    type: "hero",
    template: "split-image",
    enabled: true,
    eyebrow: "Welcome",
    title: "A polished store made for easy orders",
    text: "Show your best offer, guide customers to products, and make ordering feel simple.",
    alignment: "left",
    imagePosition: "right",
    effect: "glow",
    buttonLabel: "Shop products",
    buttonAction: "products",
  },
  {
    id: "preset-cards",
    type: "cards",
    template: "three-image-cards",
    enabled: true,
    eyebrow: "Highlights",
    title: "Why customers choose us",
    text: "Use cards for offers, services, product groups, or trust points.",
    alignment: "center",
    effect: "lift",
    cards: [
      {
        id: "card-1",
        title: "Fast response",
        text: "Customers can ask questions and order directly on WhatsApp.",
      },
      {
        id: "card-2",
        title: "Fresh updates",
        text: "Keep your latest products, bundles, and offers visible.",
      },
      {
        id: "card-3",
        title: "Trusted service",
        text: "Add delivery, quality, and support notes customers care about.",
      },
    ],
  },
  {
    id: "preset-image-text",
    type: "imageText",
    template: "image-left",
    enabled: true,
    eyebrow: "About the brand",
    title: "Tell customers what makes this store different",
    text: "Pair a strong image with a short story, process note, or special service.",
    alignment: "left",
    imagePosition: "left",
    effect: "none",
    buttonLabel: "Contact us",
    buttonAction: "contact",
  },
  {
    id: "preset-cta",
    type: "cta",
    template: "whatsapp-banner",
    enabled: true,
    eyebrow: "Ready to order?",
    title: "Send a message and we’ll help you choose",
    text: "Use this section for a direct order prompt, quote request, or booking call.",
    alignment: "center",
    effect: "glow",
    buttonLabel: "Chat on WhatsApp",
    buttonAction: "whatsapp",
  },
  {
    id: "preset-trust",
    type: "trustBadges",
    template: "badge-row",
    enabled: true,
    eyebrow: "Store promises",
    title: "Shop with confidence",
    alignment: "center",
    effect: "none",
    cards: [
      { id: "badge-1", title: "Quality checked", text: "Products are reviewed before delivery." },
      { id: "badge-2", title: "Clear communication", text: "Confirm details before payment or pickup." },
      { id: "badge-3", title: "Customer support", text: "Ask questions before placing your order." },
    ],
  },
];

export function createHomeSectionFromPreset(preset: HomeBuilderSection) {
  return {
    ...preset,
    id: `${preset.type}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    cards: preset.cards?.map((card, index) => ({
      ...card,
      id: `${preset.type}-card-${index}-${Date.now()}`,
    })),
  };
}

export function getEnabledHomeSections(settings?: HomeBuilderSettings | null) {
  return (settings?.homeSections || []).filter((section) => section.enabled !== false);
}
