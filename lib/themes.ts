export type StoreLayout =
  | "default-one-page"
  | "suya-spot-pro"
  | "premium-treats"
  | "classic-commerce"
  | "simple-one-page"
  | "editorial-luxury"
  | "food-market"
  | "bold-retail"
  | "minimal-studio"
  | "apartment-stay"
  | "beauty-lounge"
  | "local-vendor"
  | "corporate-clean"
  | "kids-play"
  | "grocery-fresh"
  | "tech-catalog"
  | "jewelry-gallery"
  | "pharmacy-care"
  | "event-catering"
  | "car-showroom"
  | "mono-runway"
  | "daily-menu"
  | "beauty-shop"
  | "home-furniture"
  | "bush-market-pro";

export type ThemeSectionId =
  | "feature-strip"
  | "collections"
  | "lookbook"
  | "menu"
  | "packages"
  | "delivery"
  | "fresh-picks"
  | "bulk-deals"
  | "health-categories"
  | "essentials"
  | "restock-request"
  | "availability-notes"
  | "financing"
  | "inspection"
  | "test-drive"
  | "best-sellers"
  | "featured-deals"
  | "specs"
  | "warranty"
  | "rooms"
  | "details"
  | "age-groups"
  | "gift-picks"
  | "routine"
  | "bundles"
  | "products"
  | "custom-order"
  | "contact";

export type ThemeSectionOption = {
  id: ThemeSectionId;
  label: string;
  description: string;
};

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
  bestFor?: string;
  features?: string[];
  storefrontSections?: string[];
  configurableSections?: ThemeSectionOption[];
  priceLabel?: string;
  priceAmount?: number;
  pricingNote?: string;
};

const basicThemeSections: ThemeSectionOption[] = [
  {
    id: "products",
    label: "Products",
    description: "Show the product grid and add-to-order buttons.",
  },
  {
    id: "contact",
    label: "Contact",
    description: "Show business contact details at the bottom of the page.",
  },
];

const premiumThemeSections: ThemeSectionOption[] = [
  {
    id: "feature-strip",
    label: "Feature strip",
    description: "Show quick highlights about the storefront structure.",
  },
  ...basicThemeSections,
];

const monoRunwaySections: ThemeSectionOption[] = [
  {
    id: "collections",
    label: "Collections",
    description: "Show category blocks that link customers into the shop.",
  },
  {
    id: "lookbook",
    label: "Lookbook",
    description: "Show styled product images for editorial browsing.",
  },
  {
    id: "products",
    label: "Shop",
    description: "Show the product grid and add-to-order buttons.",
  },
  {
    id: "custom-order",
    label: "Custom Order",
    description: "Show a WhatsApp section for measurements and bespoke orders.",
  },
  {
    id: "contact",
    label: "Contact",
    description: "Show business contact details at the bottom of the page.",
  },
];

const dailyMenuSections: ThemeSectionOption[] = [
  {
    id: "menu",
    label: "Menu",
    description: "Show daily menu categories and featured meals.",
  },
  {
    id: "packages",
    label: "Trays & Packages",
    description: "Show larger packs, catering trays, bundles, or party orders.",
  },
  {
    id: "delivery",
    label: "Delivery Notes",
    description: "Show order windows, delivery areas, and preparation notes.",
  },
  {
    id: "products",
    label: "Order Items",
    description: "Show the full product grid and add-to-order buttons.",
  },
  {
    id: "contact",
    label: "Contact",
    description: "Show WhatsApp, location, and business contact details.",
  },
];

const beautyShopSections: ThemeSectionOption[] = [
  {
    id: "collections",
    label: "Collections",
    description: "Show beauty categories like skincare, fragrance, hair, and makeup.",
  },
  {
    id: "best-sellers",
    label: "Best Sellers",
    description: "Show featured products customers should notice first.",
  },
  {
    id: "routine",
    label: "Routine / How to Use",
    description: "Show product education, usage steps, or routine guidance.",
  },
  {
    id: "bundles",
    label: "Bundles",
    description: "Show sets, kits, and product combinations.",
  },
  {
    id: "products",
    label: "Products",
    description: "Show the full product grid and add-to-order buttons.",
  },
  {
    id: "contact",
    label: "Contact",
    description: "Show WhatsApp and business contact details.",
  },
];

const techCatalogSections: ThemeSectionOption[] = [
  {
    id: "collections",
    label: "Collections",
    description: "Show categories like phones, laptops, accessories, and audio.",
  },
  {
    id: "featured-deals",
    label: "Featured Deals",
    description: "Show highlighted products or current offers first.",
  },
  {
    id: "specs",
    label: "Specs / Highlights",
    description: "Show key buying details like storage, warranty, battery, or condition.",
  },
  {
    id: "warranty",
    label: "Warranty Notes",
    description: "Show warranty, pickup, delivery, and after-sales notes.",
  },
  {
    id: "products",
    label: "Products",
    description: "Show the full product grid and add-to-order buttons.",
  },
  {
    id: "contact",
    label: "Contact",
    description: "Show WhatsApp and business contact details.",
  },
];

const homeFurnitureSections: ThemeSectionOption[] = [
  {
    id: "collections",
    label: "Collections",
    description: "Show categories like sofas, beds, decor, lighting, and kitchen.",
  },
  {
    id: "rooms",
    label: "Featured Rooms",
    description: "Show room-based browsing for living room, bedroom, dining, or office.",
  },
  {
    id: "details",
    label: "Measurements / Details",
    description: "Show dimensions, materials, colors, care notes, or sizing guidance.",
  },
  {
    id: "delivery",
    label: "Delivery Notes",
    description: "Show delivery area, installation, pickup, and lead-time notes.",
  },
  {
    id: "products",
    label: "Products",
    description: "Show the full product grid and add-to-order buttons.",
  },
  {
    id: "contact",
    label: "Contact",
    description: "Show WhatsApp and business contact details.",
  },
];

const kidsPlaySections: ThemeSectionOption[] = [
  {
    id: "age-groups",
    label: "Age Groups",
    description: "Show quick shopping paths for newborns, toddlers, kids, and teens.",
  },
  {
    id: "gift-picks",
    label: "Gift Picks",
    description: "Show birthday, baby shower, school, and celebration gift ideas.",
  },
  {
    id: "best-sellers",
    label: "Best Sellers",
    description: "Show featured products parents should notice first.",
  },
  {
    id: "bundles",
    label: "Bundles",
    description: "Show baby sets, toy packs, school packs, and product combos.",
  },
  {
    id: "products",
    label: "Products",
    description: "Show the full product grid and add-to-order buttons.",
  },
  {
    id: "contact",
    label: "Contact",
    description: "Show WhatsApp and business contact details.",
  },
];

const groceryFreshSections: ThemeSectionOption[] = [
  {
    id: "fresh-picks",
    label: "Fresh Picks",
    description: "Show featured groceries, farm produce, or daily essentials first.",
  },
  {
    id: "collections",
    label: "Categories",
    description: "Show grocery categories like grains, oil, fruits, drinks, and spices.",
  },
  {
    id: "bulk-deals",
    label: "Bulk Deals",
    description: "Show market packs, cartons, bags, bundles, and wholesale-friendly items.",
  },
  {
    id: "delivery",
    label: "Delivery Notes",
    description: "Show delivery areas, pickup options, and ordering guidance.",
  },
  {
    id: "products",
    label: "Products",
    description: "Show the full product grid and add-to-order buttons.",
  },
  {
    id: "contact",
    label: "Contact",
    description: "Show WhatsApp and business contact details.",
  },
];

const pharmacyCareSections: ThemeSectionOption[] = [
  {
    id: "health-categories",
    label: "Health Categories",
    description: "Show care categories like medicines, wellness, baby care, and skincare.",
  },
  {
    id: "essentials",
    label: "Featured Essentials",
    description: "Show important or fast-moving products customers should see first.",
  },
  {
    id: "restock-request",
    label: "Restock Request",
    description: "Show a WhatsApp prompt for prescriptions, restock checks, or special requests.",
  },
  {
    id: "bundles",
    label: "Wellness Bundles",
    description: "Show kits, packs, routines, and product combinations.",
  },
  {
    id: "availability-notes",
    label: "Availability Notes",
    description: "Show stock, pickup, delivery, and consultation guidance.",
  },
  {
    id: "products",
    label: "Products",
    description: "Show the full product grid and add-to-order buttons.",
  },
  {
    id: "contact",
    label: "Contact",
    description: "Show WhatsApp and business contact details.",
  },
];

const jewelryGallerySections: ThemeSectionOption[] = [
  {
    id: "collections",
    label: "Collections",
    description: "Show jewellery, perfume, watches, accessories, or gift collections.",
  },
  {
    id: "featured-deals",
    label: "Featured Pieces",
    description: "Show selected pieces customers should notice first.",
  },
  {
    id: "gift-picks",
    label: "Gift Picks",
    description: "Show gift-ready pieces for birthdays, anniversaries, and celebrations.",
  },
  {
    id: "details",
    label: "Material / Care Notes",
    description: "Show care notes, material guidance, sizing, or authenticity details.",
  },
  {
    id: "products",
    label: "Gallery",
    description: "Show the full product gallery and add-to-order buttons.",
  },
  {
    id: "custom-order",
    label: "Concierge Request",
    description: "Show a WhatsApp prompt for custom orders, gift help, or sourcing requests.",
  },
  {
    id: "contact",
    label: "Contact",
    description: "Show WhatsApp and business contact details.",
  },
];

const eventCateringSections: ThemeSectionOption[] = [
  {
    id: "packages",
    label: "Event Packages",
    description: "Show catering trays, rentals, decor packages, cakes, or event bundles.",
  },
  {
    id: "menu",
    label: "Package Categories",
    description: "Show categories like small chops, cakes, trays, decor, rentals, and drinks.",
  },
  {
    id: "featured-deals",
    label: "Featured Packages",
    description: "Show selected packages customers should notice first.",
  },
  {
    id: "details",
    label: "Tray Sizes / Guest Counts",
    description: "Show serving guidance, guest-count notes, tray sizes, or setup details.",
  },
  {
    id: "custom-order",
    label: "Date & Quote Request",
    description: "Show a WhatsApp prompt for event date, guest count, and quote requests.",
  },
  {
    id: "delivery",
    label: "Delivery & Setup Notes",
    description: "Show pickup, delivery, dispatch, setup, and lead-time guidance.",
  },
  {
    id: "products",
    label: "Gallery",
    description: "Show the full product or package gallery and add-to-order buttons.",
  },
  {
    id: "contact",
    label: "Contact",
    description: "Show WhatsApp and business contact details.",
  },
];

const carShowroomSections: ThemeSectionOption[] = [
  {
    id: "collections",
    label: "Brands / Body Types",
    description: "Show quick paths for brands, SUVs, sedans, buses, trucks, or price ranges.",
  },
  {
    id: "featured-deals",
    label: "Featured Cars",
    description: "Show selected vehicles customers should notice first.",
  },
  {
    id: "specs",
    label: "Vehicle Specs",
    description: "Show mileage, engine, transmission, year, trim, and condition highlights.",
  },
  {
    id: "inspection",
    label: "Inspection Notes",
    description: "Show inspection, customs, duty, accident history, and document guidance.",
  },
  {
    id: "financing",
    label: "Financing Notes",
    description: "Show instalment, deposit, swap, or payment guidance where available.",
  },
  {
    id: "test-drive",
    label: "Test Drive Request",
    description: "Show a WhatsApp prompt for inspection booking or test drive requests.",
  },
  {
    id: "products",
    label: "Vehicle Gallery",
    description: "Show the full vehicle gallery and inquiry buttons.",
  },
  {
    id: "contact",
    label: "Contact",
    description: "Show WhatsApp and dealership contact details.",
  },
];

const propertyListingSections: ThemeSectionOption[] = [
  {
    id: "feature-strip",
    label: "Trust Highlights",
    description: "Show inspection, document, and direct-contact highlights.",
  },
  {
    id: "availability-notes",
    label: "Availability Notes",
    description: "Show availability, viewing, location, and access notes.",
  },
  {
    id: "inspection",
    label: "Inspection Requests",
    description: "Show prompts for inspection booking and availability checks.",
  },
  {
    id: "details",
    label: "Fees & Documents",
    description: "Show title documents, inspection fees, agency fees, and service charges.",
  },
  {
    id: "products",
    label: "Property Listings",
    description: "Show the full listing gallery and inquiry buttons.",
  },
  {
    id: "contact",
    label: "Contact",
    description: "Show WhatsApp and business contact details.",
  },
];

export const businessThemes: BusinessTheme[] = [
  {
    id: "default-one-page",
    name: "Default One Page",
    description: "",
    layout: "default-one-page",
    page: "bg-[#fbf9ff] text-[#211331]",
    hero: "bg-white",
    card: "bg-white text-[#211331]",
    mutedCard: "bg-[#f1eaff] text-[#211331]",
    text: "text-[#211331]",
    mutedText: "text-[#6f6785]",
    accent: "bg-[#7c3aed]",
    accentText: "text-[#7c3aed]",
    button: "bg-[#241436] text-white hover:bg-[#351b55]",
    secondaryButton:
      "bg-white text-[#241436] ring-1 ring-[#eee7f7] hover:bg-[#fbf9ff]",
    chip: "bg-[#f1eaff] text-[#7c3aed]",
    border: "border-[#eee7f7]",
    productCard: "rounded-[1.25rem] border border-[#eee7f7] bg-white",
    sectionLabel: "text-[#7c3aed]",
    bestFor: "All businesses",
    features: ["One-page layout", "Products", "Contact"],
    storefrontSections: ["Products", "About", "Contact"],
    configurableSections: [
      { id: "products", label: "Products", description: "" },
      { id: "contact", label: "Contact", description: "" },
    ],
  },
  {
    id: "suya-spot-pro",
    name: "Suya Spot Pro",
    description:
      "Premium suya and grill website theme with cinematic hero, featured products, party packs, quote requests, Paystack checkout, and WhatsApp ordering.",
    layout: "suya-spot-pro",
    page: "bg-[#fffaf0] text-[#17120a]",
    hero: "from-[#17120a] via-[#2a160c] to-[#000000]",
    card: "bg-white text-[#17120a]",
    mutedCard: "bg-[#17120a] text-white",
    text: "text-white",
    mutedText: "text-[#f8e6b8]",
    accent: "bg-[#facc15]",
    accentText: "text-[#b45309]",
    button: "bg-[#17120a] text-white hover:bg-[#2a160c]",
    secondaryButton:
      "bg-white text-[#17120a] ring-1 ring-[#e7dcc8] hover:bg-[#fffaf0]",
    chip: "bg-[#fffaf0] text-[#17120a] ring-1 ring-[#e7dcc8]",
    border: "border-[#e7dcc8]",
    productCard: "rounded-[1.35rem] border border-[#e7dcc8] bg-white text-[#17120a]",
    sectionLabel: "text-[#b45309]",
    bestFor:
      "Suya vendors, grill spots, BBQ businesses, meat restaurants, party/event food vendors",
    features: [
      "Full-screen hero",
      "Scroll-cover content effect",
      "Customer Favorites",
      "Separate The Grill page",
      "Party Packs",
      "Bulk/Event quote form",
      "Video upload support",
      "Instagram video preview",
      "Gallery carousel",
      "Paystack checkout",
      "WhatsApp ordering",
      "Delivery/pickup checkout",
      "Area-based delivery fees",
    ],
    storefrontSections: [
      "Hero",
      "Customer Favorites",
      "The Grill",
      "Party Packs",
      "Grillary",
      "Bulk/Event Orders",
      "Delivery & Pickup",
      "FAQ",
      "Footer",
    ],
    configurableSections: [
      { id: "feature-strip", label: "Feature strip", description: "" },
      { id: "products", label: "The Grill", description: "" },
      { id: "packages", label: "Party Packs", description: "" },
      { id: "lookbook", label: "Grillary", description: "" },
      { id: "contact", label: "Contact", description: "" },
    ],
    priceLabel: "Premium food theme",
    pricingNote:
      "Built for suya, grill, BBQ, and event food vendors. Add-ons activate only after purchase.",
  },
  {
    id: "premium-treats",
    name: "Premium Treats",
    description:
      "A refined product storefront for bakeries, food brands, gift shops, and premium catalog sellers.",
    layout: "premium-treats",
    page: "bg-[#fffaf0] text-[#1f180d]",
    hero: "from-[#06261c] via-[#0c3b2c] to-[#1f180d]",
    card: "bg-white text-[#1f180d]",
    mutedCard: "bg-[#06261c] text-white",
    text: "text-white",
    mutedText: "text-[#f8e6b8]",
    accent: "bg-[#b8892f]",
    accentText: "text-[#9b6f21]",
    button: "bg-[#06261c] text-white hover:bg-[#0c3b2c]",
    secondaryButton:
      "bg-white text-[#1f180d] ring-1 ring-[#eadbb8] hover:bg-[#fffaf0]",
    chip: "bg-[#fffaf0] text-[#1f180d] ring-1 ring-[#eadbb8]",
    border: "border-[#eadbb8]",
    productCard: "rounded-xl border border-[#eadbb8] bg-white text-[#1f180d]",
    sectionLabel: "text-[#9b6f21]",
    bestFor: "Bakeries, food vendors, gift shops, premium products",
    features: [
      "Luxury catalog layout",
      "Cart to WhatsApp",
      "Extension-ready sections",
    ],
    storefrontSections: [
      "Announcement Bar",
      "Hero",
      "Category Pills",
      "Product Grid",
      "Contact Footer",
      "Extension Slots",
    ],
    configurableSections: [
      { id: "feature-strip", label: "Feature strip", description: "" },
      { id: "products", label: "Products", description: "" },
      { id: "contact", label: "Contact", description: "" },
    ],
    priceLabel: "Premium theme",
    pricingNote: "Add-ons activate only after purchase or admin entitlement.",
  },
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
    id: "simple-one-page",
    name: "Simple One Page",
    description: "A light one-page storefront with a small hero, image box, products, and contact footer.",
    layout: "simple-one-page",
    page: "bg-[#f7f2fb] text-[#211331]",
    hero: "from-[#efe7f6] via-[#f7f2fb] to-[#ffffff]",
    card: "bg-white text-[#211331]",
    mutedCard: "bg-[#211331] text-white",
    text: "text-[#211331]",
    mutedText: "text-[#6f637d]",
    accent: "bg-[#7c3aed]",
    accentText: "text-[#6d28d9]",
    button: "bg-[#211331] text-white hover:bg-[#3b2258]",
    secondaryButton:
      "bg-white text-[#211331] ring-1 ring-[#e6d9f2] hover:bg-[#fbf8ff]",
    chip: "bg-white/80 text-[#211331] ring-1 ring-[#e6d9f2]",
    border: "border-[#e6d9f2]",
    productCard: "rounded-[1.15rem] bg-white text-[#211331] shadow-sm",
    sectionLabel: "text-[#6d28d9]",
    bestFor: "Simple product pages",
    features: ["Small hero", "Optional logo", "Contact footer"],
    storefrontSections: ["Hero image", "3 product preview", "Business contact"],
    configurableSections: basicThemeSections,
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
    bestFor: "Real estate, shortlets, rentals, land, and commercial property",
    features: ["Inspection prompts", "Fees and documents", "Availability-led listings"],
    storefrontSections: ["Inspection request", "Listing details", "Direct WhatsApp"],
    configurableSections: propertyListingSections,
    priceLabel: "Set price",
    pricingNote: "Premium property theme",
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
  {
    id: "kids-play",
    name: "Kids Play",
    description: "Bright, friendly theme for children's stores, toys, school items, and family brands.",
    layout: "kids-play",
    page: "bg-[#fff7fb] text-[#25112f]",
    hero: "from-[#2b1245] via-[#7c3aed] to-[#f0abfc]",
    card: "bg-white text-[#25112f]",
    mutedCard: "bg-[#25112f] text-white",
    text: "text-white",
    mutedText: "text-fuchsia-100",
    accent: "bg-[#facc15]",
    accentText: "text-[#fde047]",
    button: "bg-[#7c3aed] text-white hover:bg-[#6d28d9]",
    secondaryButton:
      "bg-white/12 text-white ring-1 ring-white/20 hover:bg-white/18",
    chip: "bg-white/14 text-white ring-1 ring-white/20",
    border: "border-fuchsia-100",
    productCard: "rounded-[1.75rem] bg-white text-[#25112f] shadow-sm",
    sectionLabel: "text-[#7c3aed]",
    bestFor: "Kidswear, toys, baby products",
    features: ["Playful hero", "Soft product cards", "Parent-friendly ordering"],
    storefrontSections: ["Age groups", "Gift picks", "WhatsApp cart"],
    configurableSections: kidsPlaySections,
  },
  {
    id: "grocery-fresh",
    name: "Grocery Fresh",
    description: "A compact market theme for foodstuff, groceries, farms, and daily essentials.",
    layout: "grocery-fresh",
    page: "bg-[#f6fbf2] text-[#102315]",
    hero: "from-[#0f2f1b] via-[#1f7a3a] to-[#a3e635]",
    card: "bg-white text-[#102315]",
    mutedCard: "bg-[#102315] text-white",
    text: "text-white",
    mutedText: "text-lime-100",
    accent: "bg-[#bef264]",
    accentText: "text-[#d9f99d]",
    button: "bg-[#15803d] text-white hover:bg-[#166534]",
    secondaryButton:
      "bg-white/12 text-white ring-1 ring-white/20 hover:bg-white/18",
    chip: "bg-white/14 text-white ring-1 ring-white/20",
    border: "border-lime-200",
    productCard: "rounded-[1.25rem] bg-white text-[#102315] shadow-sm",
    sectionLabel: "text-[#15803d]",
    bestFor: "Groceries, farms, foodstuff vendors",
    features: ["Fast category scan", "Bundle-friendly cards", "Daily order focus"],
    storefrontSections: ["Fresh picks", "Bulk items", "Delivery notes"],
    configurableSections: groceryFreshSections,
  },
  {
    id: "tech-catalog",
    name: "Tech Catalog",
    description: "A precise catalogue theme for gadgets, accessories, electronics, and specs-heavy products.",
    layout: "tech-catalog",
    page: "bg-[#eef6ff] text-[#08111f]",
    hero: "from-[#031124] via-[#0f2d56] to-[#38bdf8]",
    card: "bg-white text-[#08111f]",
    mutedCard: "bg-[#08111f] text-white",
    text: "text-white",
    mutedText: "text-sky-100",
    accent: "bg-[#38bdf8]",
    accentText: "text-[#7dd3fc]",
    button: "bg-[#0369a1] text-white hover:bg-[#075985]",
    secondaryButton:
      "bg-white/12 text-white ring-1 ring-white/20 hover:bg-white/18",
    chip: "bg-sky-300/18 text-sky-50 ring-1 ring-sky-100/25",
    border: "border-sky-100",
    productCard: "rounded-[1rem] bg-white text-[#08111f] shadow-sm",
    sectionLabel: "text-[#0369a1]",
    bestFor: "Phones, laptops, accessories",
    features: ["Spec-led cards", "Clean comparison feel", "Sharp CTA styling"],
    storefrontSections: ["Featured specs", "Warranty notes", "Product search"],
    configurableSections: techCatalogSections,
  },
  {
    id: "jewelry-gallery",
    name: "Jewelry Gallery",
    description: "Elegant gallery theme for jewellery, fragrance, accessories, and high-detail products.",
    layout: "jewelry-gallery",
    page: "bg-[#fbf7ef] text-[#21190f]",
    hero: "from-[#21190f] via-[#5f3b16] to-[#eab308]",
    card: "bg-[#fffaf0] text-[#21190f]",
    mutedCard: "bg-[#21190f] text-[#fffaf0]",
    text: "text-[#fffaf0]",
    mutedText: "text-amber-100",
    accent: "bg-[#fbbf24]",
    accentText: "text-[#fde68a]",
    button: "bg-[#21190f] text-[#fffaf0] hover:bg-[#3b2a15]",
    secondaryButton:
      "bg-white/12 text-white ring-1 ring-white/20 hover:bg-white/18",
    chip: "bg-white/14 text-white ring-1 ring-white/20",
    border: "border-amber-200",
    productCard: "rounded-none bg-[#fffaf0] text-[#21190f] shadow-sm",
    sectionLabel: "text-[#a16207]",
    bestFor: "Jewellery, accessories, perfume",
    features: ["Gallery-first layout", "Luxury product framing", "Premium inquiry flow"],
    storefrontSections: ["Collections", "Gift-ready items", "WhatsApp concierge"],
    configurableSections: jewelryGallerySections,
  },
  {
    id: "pharmacy-care",
    name: "Pharmacy Care",
    description: "Trust-focused layout for pharmacies, wellness, skincare, and health retail.",
    layout: "pharmacy-care",
    page: "bg-[#f3fbfb] text-[#0f2530]",
    hero: "from-[#0f2530] via-[#0f766e] to-[#67e8f9]",
    card: "bg-white text-[#0f2530]",
    mutedCard: "bg-[#0f2530] text-white",
    text: "text-white",
    mutedText: "text-cyan-100",
    accent: "bg-[#2dd4bf]",
    accentText: "text-[#5eead4]",
    button: "bg-[#0f766e] text-white hover:bg-[#115e59]",
    secondaryButton:
      "bg-white/12 text-white ring-1 ring-white/20 hover:bg-white/18",
    chip: "bg-white/14 text-white ring-1 ring-white/20",
    border: "border-cyan-100",
    productCard: "rounded-[1.25rem] bg-white text-[#0f2530] shadow-sm",
    sectionLabel: "text-[#0f766e]",
    bestFor: "Pharmacy, wellness, skincare",
    features: ["Trust badges", "Care-focused copy", "Simple restock requests"],
    storefrontSections: ["Health categories", "Availability", "Consult on WhatsApp"],
    configurableSections: pharmacyCareSections,
  },
  {
    id: "event-catering",
    name: "Event Catering",
    description: "Package-driven theme for caterers, decorators, rentals, and event vendors.",
    layout: "event-catering",
    page: "bg-[#fff8f1] text-[#2c1608]",
    hero: "from-[#2c1608] via-[#9a3412] to-[#fb923c]",
    card: "bg-white text-[#2c1608]",
    mutedCard: "bg-[#2c1608] text-white",
    text: "text-white",
    mutedText: "text-orange-100",
    accent: "bg-[#fed7aa]",
    accentText: "text-[#fdba74]",
    button: "bg-[#9a3412] text-white hover:bg-[#7c2d12]",
    secondaryButton:
      "bg-white/12 text-white ring-1 ring-white/20 hover:bg-white/18",
    chip: "bg-white/14 text-white ring-1 ring-white/20",
    border: "border-orange-100",
    productCard: "rounded-[1.5rem] bg-white text-[#2c1608] shadow-sm",
    sectionLabel: "text-[#c2410c]",
    bestFor: "Catering, rentals, event packages",
    features: ["Package cards", "Date-ready inquiries", "Event quote flow"],
    storefrontSections: ["Packages", "Tray sizes", "Quote request"],
    configurableSections: eventCateringSections,
  },
  {
    id: "car-showroom",
    name: "Car Showroom",
    description: "Clean dealership theme for car sellers, importers, auto lots, and vehicle brokers.",
    layout: "car-showroom",
    page: "bg-[#f6f7f5] text-[#101714]",
    hero: "from-[#101714] via-[#1f352b] to-[#94a3b8]",
    card: "bg-white text-[#101714]",
    mutedCard: "bg-[#101714] text-white",
    text: "text-white",
    mutedText: "text-slate-200",
    accent: "bg-[#22c55e]",
    accentText: "text-[#86efac]",
    button: "bg-[#101714] text-white hover:bg-[#1f352b]",
    secondaryButton:
      "bg-white text-[#101714] ring-1 ring-[#d7ded8] hover:bg-[#f6f7f5]",
    chip: "bg-white/14 text-white ring-1 ring-white/20",
    border: "border-[#d7ded8]",
    productCard: "rounded-[1rem] bg-white text-[#101714] shadow-sm",
    sectionLabel: "text-[#15803d]",
    bestFor: "Car dealers, importers, auto lots, vehicle brokers",
    features: ["Vehicle specs", "Inspection flow", "Test drive CTA"],
    storefrontSections: ["Featured Cars", "Specs", "Test Drive Request"],
    configurableSections: carShowroomSections,
  },
  {
    id: "mono-runway",
    name: "Mono Runway",
    description:
      "High-contrast editorial theme for fashion drops, capsule collections, lookbooks, and custom orders.",
    layout: "mono-runway",
    page: "bg-[#f4f5f7] text-[#0c0e13]",
    hero: "from-[#0c0e13] via-[#171a22] to-[#eef0f3]",
    card: "bg-white text-[#0c0e13]",
    mutedCard: "bg-[#0c0e13] text-white",
    text: "text-white",
    mutedText: "text-[#aeb6c2]",
    accent: "bg-white",
    accentText: "text-[#aeb6c2]",
    button: "bg-[#0c0e13] text-white hover:bg-[#171a22]",
    secondaryButton:
      "bg-white text-[#0c0e13] ring-1 ring-[#d8dce2] hover:bg-[#f4f5f7]",
    chip: "bg-white/10 text-white ring-1 ring-white/15",
    border: "border-[#d8dce2]",
    productCard: "rounded-lg bg-white text-[#0c0e13] shadow-sm",
    sectionLabel: "text-[#6e7682]",
    bestFor: "Fashion drops and lookbooks",
    features: ["Editorial hero", "Lookbook sections", "Custom order flow"],
    storefrontSections: ["Collections", "Lookbook", "Custom Order"],
    configurableSections: monoRunwaySections,
  },
  {
    id: "daily-menu",
    name: "Daily Menu",
    description:
      "Compact food-vendor theme for daily menus, trays, delivery notes, and fast WhatsApp orders.",
    layout: "daily-menu",
    page: "bg-[#fff8f0] text-[#221207]",
    hero: "from-[#2b1206] via-[#8a2d12] to-[#f97316]",
    card: "bg-white text-[#221207]",
    mutedCard: "bg-[#2b1206] text-white",
    text: "text-white",
    mutedText: "text-orange-100",
    accent: "bg-[#fbbf24]",
    accentText: "text-[#fed7aa]",
    button: "bg-[#2b1206] text-white hover:bg-[#441908]",
    secondaryButton:
      "bg-white text-[#2b1206] ring-1 ring-[#f2d8bd] hover:bg-[#fff3e4]",
    chip: "bg-white/14 text-white ring-1 ring-white/20",
    border: "border-[#f2d8bd]",
    productCard: "rounded-[1.25rem] bg-white text-[#221207] shadow-sm",
    sectionLabel: "text-[#c2410c]",
    bestFor: "Food vendors, bakeries, small chops, meal prep",
    features: ["Daily menu blocks", "Tray/package section", "Delivery notes"],
    storefrontSections: ["Menu", "Trays & Packages", "Delivery Notes"],
    configurableSections: dailyMenuSections,
  },
  {
    id: "bush-market-pro",
    name: "Bush Market Pro",
    description:
      "Rustic local-market food theme for palm oil, grains, spices, fresh produce, foodstuff, and farm-to-table sellers.",
    layout: "daily-menu",
    page: "bg-[#f8f1df] text-[#24160a]",
    hero: "from-[#24160a] via-[#5b3516] to-[#a15c1b]",
    card: "bg-[#fffaf0] text-[#24160a]",
    mutedCard: "bg-[#24160a] text-[#fff8e8]",
    text: "text-[#fff8e8]",
    mutedText: "text-[#f6dfb8]",
    accent: "bg-[#d89a2b]",
    accentText: "text-[#f7c873]",
    button: "bg-[#31572c] text-[#fff8e8] hover:bg-[#24421f]",
    secondaryButton:
      "bg-[#fff8e8] text-[#24160a] ring-1 ring-[#d8b879] hover:bg-[#f5e3bd]",
    chip: "bg-[#fff8e8]/14 text-[#fff8e8] ring-1 ring-[#f7c873]/24",
    border: "border-[#d8b879]",
    productCard: "rounded-[1.15rem] bg-[#fffaf0] text-[#24160a] shadow-sm",
    sectionLabel: "text-[#7a4314]",
    bestFor: "Palm oil, grains, spices, farm produce, foodstuff sellers",
    features: ["Local market feel", "Bulk foodstuff sections", "Farm-fresh ordering"],
    storefrontSections: ["Market Stalls", "Bulk Sacks", "Pickup & Delivery"],
    configurableSections: dailyMenuSections,
    priceLabel: "Pro",
    pricingNote: "Premium local food market theme",
  },
  {
    id: "beauty-shop",
    name: "Beauty Shop",
    description:
      "Soft product-first theme for skincare, perfume, wigs, hair, makeup, and body-care stores.",
    layout: "beauty-shop",
    page: "bg-[#fff7fb] text-[#2c1020]",
    hero: "from-[#3b1020] via-[#8b1e4d] to-[#f8b4c8]",
    card: "bg-white text-[#2c1020]",
    mutedCard: "bg-[#3b1020] text-white",
    text: "text-white",
    mutedText: "text-pink-100",
    accent: "bg-[#f8b4c8]",
    accentText: "text-[#ffd7e3]",
    button: "bg-[#3b1020] text-white hover:bg-[#5a1830]",
    secondaryButton:
      "bg-white text-[#3b1020] ring-1 ring-[#f5c8d7] hover:bg-[#fff1f6]",
    chip: "bg-white/14 text-white ring-1 ring-white/20",
    border: "border-[#f5c8d7]",
    productCard: "rounded-[1.35rem] bg-white text-[#2c1020] shadow-sm",
    sectionLabel: "text-[#be496b]",
    bestFor: "Skincare, hair, fragrance, makeup, body-care",
    features: ["Beauty collections", "Routine education", "Bundle-focused cards"],
    storefrontSections: ["Collections", "Best Sellers", "Beauty Routine"],
    configurableSections: beautyShopSections,
  },
  {
    id: "home-furniture",
    name: "Home & Furniture",
    description:
      "Airy visual storefront for furniture, decor, lighting, bedding, rugs, kitchenware, and home sellers.",
    layout: "home-furniture",
    page: "bg-[#f5f2ec] text-[#201a14]",
    hero: "from-[#201a14] via-[#5a4635] to-[#d8c2a4]",
    card: "bg-white text-[#201a14]",
    mutedCard: "bg-[#201a14] text-white",
    text: "text-white",
    mutedText: "text-stone-200",
    accent: "bg-[#d8c2a4]",
    accentText: "text-[#f1dfc6]",
    button: "bg-[#201a14] text-white hover:bg-[#3a2d22]",
    secondaryButton:
      "bg-white text-[#201a14] ring-1 ring-[#ded3c4] hover:bg-[#fbf8f3]",
    chip: "bg-white/14 text-white ring-1 ring-white/20",
    border: "border-[#ded3c4]",
    productCard: "rounded-[1rem] bg-white text-[#201a14] shadow-sm",
    sectionLabel: "text-[#8a6a46]",
    bestFor: "Furniture, decor, lighting, homeware, bedding",
    features: ["Room-based browsing", "Large product visuals", "Delivery details"],
    storefrontSections: ["Collections", "Featured Rooms", "Delivery Notes"],
    configurableSections: homeFurnitureSections,
  },
];

export function getBusinessTheme(themeId: string) {
  return (
    businessThemes.find((theme) => theme.id === themeId) ??
    businessThemes.find((theme) => theme.id === "default-one-page") ??
    businessThemes[0]
  );
}

export function getThemeSectionOptions(themeId: string) {
  const theme = getBusinessTheme(themeId);

  return theme.configurableSections || premiumThemeSections;
}

export function getDefaultThemeSectionIds(themeId: string) {
  return getThemeSectionOptions(themeId).map((section) => section.id);
}

export function normalizeThemeSections(
  sectionIds: unknown,
  themeId: string,
): ThemeSectionId[] {
  const options = getThemeSectionOptions(themeId);
  const allowedIds = new Set(options.map((section) => section.id));

  if (!Array.isArray(sectionIds) || sectionIds.length === 0) {
    return options.map((section) => section.id);
  }

  const normalized = sectionIds.filter(
    (sectionId): sectionId is ThemeSectionId =>
      typeof sectionId === "string" &&
      allowedIds.has(sectionId as ThemeSectionId),
  );

  return normalized.length ? normalized : options.map((section) => section.id);
}



