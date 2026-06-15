import { businessThemes } from "@/lib/themes";

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  available: boolean;
};

export type Service = {
  id: string;
  name: string;
  description: string;
  priceLabel: string;
};

export type Business = {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  whatsapp: string;
  location: string;
  instagram: string;
  themeId: string;
  logo: string;
  coverImage: string;
  openingHours: string;
  products: Product[];
  services: Service[];
};

export const businesses: Business[] = [
  {
    id: "1",
    name: "ZCAS TastyBites",
    slug: "zcas-tastybites",
    tagline: "Fresh pastries, cakes, and drinks for every occasion.",
    description: "Cute, premium snacks and treats made fresh for Abuja customers. Order pastries, cakes, doughnuts, rolls, and fresh juice directly through WhatsApp.",
    whatsapp: "2348012345678",
    location: "Abuja, Nigeria",
    instagram: "https://instagram.com",
    themeId: "warm-local",
    logo: "ZT",
    coverImage: "https://images.unsplash.com/photo-1551024506-0bccd828d307?q=80&w=1600&auto=format&fit=crop",
    openingHours: "Mon - Sat, 8:00 AM - 7:00 PM",
    products: [
      {
        id: "p1",
        name: "Meat Pie",
        description: "Golden, flaky pastry with rich savoury filling.",
        price: 1500,
        category: "Pastries",
        image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=1200&auto=format&fit=crop",
        available: true
      },
      {
        id: "p2",
        name: "Samosa",
        description: "Crispy party favourite, perfect for trays and boxes.",
        price: 350,
        category: "Small Chops",
        image: "https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?q=80&w=1200&auto=format&fit=crop",
        available: true
      },
      {
        id: "p3",
        name: "Doughnuts",
        description: "Soft, sweet doughnuts with a premium finish.",
        price: 800,
        category: "Pastries",
        image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=1200&auto=format&fit=crop",
        available: true
      },
      {
        id: "p4",
        name: "Fruit Juice",
        description: "Freshly prepared fruit juice bottles.",
        price: 2000,
        category: "Drinks",
        image: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?q=80&w=1200&auto=format&fit=crop",
        available: true
      }
    ],
    services: [
      {
        id: "s1",
        name: "Event Snack Boxes",
        description: "Custom boxes for birthdays, meetings, weddings, and church events.",
        priceLabel: "Request quote"
      }
    ]
  },
  {
    id: "2",
    name: "Lumora Abuja",
    slug: "lumora-abuja",
    tagline: "Luxury stays and premium apartment experiences.",
    description: "A polished apartment booking page for guests looking for comfort, style, and easy WhatsApp reservations.",
    whatsapp: "2348098765432",
    location: "Abuja, Nigeria",
    instagram: "https://instagram.com",
    themeId: "soft-luxury",
    logo: "LA",
    coverImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1600&auto=format&fit=crop",
    openingHours: "Daily, 24 hours",
    products: [
      {
        id: "p1",
        name: "One Night Stay",
        description: "Luxury apartment booking for one night.",
        price: 85000,
        category: "Booking",
        image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1200&auto=format&fit=crop",
        available: true
      },
      {
        id: "p2",
        name: "Weekend Stay",
        description: "Perfect for short getaways and premium weekend stays.",
        price: 240000,
        category: "Booking",
        image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=1200&auto=format&fit=crop",
        available: true
      }
    ],
    services: [
      {
        id: "s1",
        name: "Availability Check",
        description: "Confirm available dates and booking requirements on WhatsApp.",
        priceLabel: "Chat to book"
      }
    ]
  },
  {
    id: "3",
    name: "SleekStitch Atelier",
    slug: "sleekstitch",
    tagline: "Tailored fashion with a clean executive finish.",
    description: "A premium fashion storefront for outfits, appointments, measurements, and WhatsApp orders.",
    whatsapp: "2348076543210",
    location: "Abuja, Nigeria",
    instagram: "https://instagram.com",
    themeId: "classic-navy",
    logo: "SA",
    coverImage: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1600&auto=format&fit=crop",
    openingHours: "Mon - Sat, 9:00 AM - 6:00 PM",
    products: [
      {
        id: "p1",
        name: "Executive Native Wear",
        description: "Sharp custom outfit with clean finishing.",
        price: 65000,
        category: "Fashion",
        image: "https://images.unsplash.com/photo-1520975682031-a1b4760d74d6?q=80&w=1200&auto=format&fit=crop",
        available: true
      },
      {
        id: "p2",
        name: "Luxury Kaftan",
        description: "Premium kaftan design for special occasions.",
        price: 90000,
        category: "Fashion",
        image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop",
        available: true
      }
    ],
    services: [
      {
        id: "s1",
        name: "Measurement Appointment",
        description: "Book a measurement appointment through WhatsApp.",
        priceLabel: "Book now"
      }
    ]
  }
];

export const dashboardStats = [
  { label: "Products", value: "24", note: "12 active this week" },
  { label: "WhatsApp Clicks", value: "183", note: "+28% from last week" },
  { label: "Orders Started", value: "47", note: "Generated from storefront" },
  { label: "Selected Theme", value: "Soft Luxury", note: "Can be changed anytime" }
];

export const availableThemes = businessThemes;



