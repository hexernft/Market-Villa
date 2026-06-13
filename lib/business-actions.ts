import { supabase } from "@/lib/supabase";

export type CreateBusinessInput = {
  name: string;
  slug: string;
  category: string;
  description: string;
  whatsapp: string;
  location: string;
  openingHours: string;
  instagramUrl: string;
  themeId: string;
  includeSampleData?: boolean;
};

export type CreateProductInput = {
  businessId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  isAvailable: boolean;
  isFeatured: boolean;
};

export type CreateServiceInput = {
  businessId: string;
  name: string;
  description: string;
  serviceType: string;
  priceLabel: string;
  availabilityNote: string;
  buttonLabel: string;
  isVisible: boolean;
  isFeatured: boolean;
};

export type CreateDomainRequestInput = {
  businessId: string;
  requestedDomain: string;
  alternativeDomain: string;
  alreadyOwned: boolean;
  contactPhone: string;
  note: string;
};

export type UpdateBusinessProfileInput = {
  businessId: string;
  name: string;
  slug: string;
  category: string;
  tagline: string;
  description: string;
  logoText: string;
  coverImageUrl: string;
  whatsapp: string;
  phone: string;
  email: string;
  location: string;
  instagramUrl: string;
  openingHours: string;
  isPublished: boolean;
};

export type CheckoutCartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

export type CreateOrderInput = {
  businessId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerNote: string;
  items: CheckoutCartItem[];
};

export type UpdateProductInput = {
  productId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  isAvailable: boolean;
  isFeatured: boolean;
};

export type UpdateServiceInput = {
  serviceId: string;
  name: string;
  description: string;
  serviceType: string;
  priceLabel: string;
  availabilityNote: string;
  buttonLabel: string;
  isVisible: boolean;
  isFeatured: boolean;
};

function getLogoText(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase())
      .join("") || "MV"
  );
}

function getSampleCatalogue(category: string) {
  const lowerCategory = category.toLowerCase();

  if (lowerCategory.includes("food")) {
    return {
      products: [
        {
          name: "Signature Meal Pack",
          description: "A customer favorite package with fresh preparation and rich flavour.",
          price: 3500,
          category: "Food & Drinks",
          image_url:
            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1200&auto=format&fit=crop",
          is_available: true,
          is_featured: true,
        },
        {
          name: "Snack Box",
          description: "A quick snack option for office orders, events, and daily cravings.",
          price: 2500,
          category: "Pastries",
          image_url:
            "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1200&auto=format&fit=crop",
          is_available: true,
          is_featured: false,
        },
        {
          name: "Fresh Juice Bottle",
          description: "Refreshing bottled drink option for meals and small events.",
          price: 1500,
          category: "Drinks",
          image_url:
            "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?q=80&w=1200&auto=format&fit=crop",
          is_available: true,
          is_featured: false,
        },
      ],
      services: [
        {
          name: "Event Food Order",
          description: "Request food packages for birthdays, meetings, and small gatherings.",
          service_type: "Quote Request",
          price_label: "Request quote",
          availability_note: "Order at least 24 hours ahead",
          button_label: "Request Quote",
          is_visible: true,
          is_featured: true,
        },
      ],
    };
  }

  if (lowerCategory.includes("fashion") || lowerCategory.includes("tailor")) {
    return {
      products: [
        {
          name: "Ready-to-Wear Piece",
          description: "A stylish ready-to-wear item available for immediate inquiry.",
          price: 25000,
          category: "Fashion",
          image_url:
            "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200&auto=format&fit=crop",
          is_available: true,
          is_featured: true,
        },
        {
          name: "Premium Fabric Option",
          description: "Fabric option suitable for custom outfits and special occasions.",
          price: 18000,
          category: "Fabric",
          image_url:
            "https://images.unsplash.com/photo-1603400521630-9f2de124b33b?q=80&w=1200&auto=format&fit=crop",
          is_available: true,
          is_featured: false,
        },
      ],
      services: [
        {
          name: "Measurement Appointment",
          description: "Book a time for measurements, fittings, and custom style discussion.",
          service_type: "Measurement",
          price_label: "Book appointment",
          availability_note: "Mon - Sat, 10 AM - 5 PM",
          button_label: "Book Measurement",
          is_visible: true,
          is_featured: true,
        },
      ],
    };
  }

  if (lowerCategory.includes("apartment") || lowerCategory.includes("hospitality")) {
    return {
      products: [
        {
          name: "Standard Stay",
          description: "Comfortable shortlet stay for guests who need a simple clean space.",
          price: 50000,
          category: "Apartment",
          image_url:
            "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1200&auto=format&fit=crop",
          is_available: true,
          is_featured: true,
        },
        {
          name: "Executive Stay",
          description: "Premium option with extra comfort for business and leisure guests.",
          price: 80000,
          category: "Apartment",
          image_url:
            "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=1200&auto=format&fit=crop",
          is_available: true,
          is_featured: false,
        },
      ],
      services: [
        {
          name: "Availability Check",
          description: "Ask about available dates, pricing, and booking requirements.",
          service_type: "Reservation",
          price_label: "Confirm availability",
          availability_note: "Daily booking support",
          button_label: "Check Availability",
          is_visible: true,
          is_featured: true,
        },
      ],
    };
  }

  return {
    products: [
      {
        name: "Featured Offer",
        description: "A sample product or package customers can ask about.",
        price: 10000,
        category: "Products",
        image_url:
          "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=1200&auto=format&fit=crop",
        is_available: true,
        is_featured: true,
      },
      {
        name: "Popular Item",
        description: "Another sample listing to help you understand the storefront layout.",
        price: 15000,
        category: "Products",
        image_url:
          "https://images.unsplash.com/photo-1556742111-a301076d9d18?q=80&w=1200&auto=format&fit=crop",
        is_available: true,
        is_featured: false,
      },
    ],
    services: [
      {
        name: "General Inquiry",
        description: "Let customers request more details, quotes, or bookings.",
        service_type: "Quote Request",
        price_label: "Request quote",
        availability_note: "Available during business hours",
        button_label: "Request Service",
        is_visible: true,
        is_featured: true,
      },
    ],
  };
}

export async function getCurrentProfile() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    return null;
  }

  return data;
}

export async function requireSuperAdmin() {
  const profile = await getCurrentProfile();

  if (!profile || profile.role !== "super_admin") {
    throw new Error("You do not have permission to access the Admin Center.");
  }

  return profile;
}

export async function createBusiness(input: CreateBusinessInput) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error("You must be logged in to create a business.");
  }

  const { data, error } = await supabase
    .from("businesses")
    .insert({
      owner_id: user.id,
      name: input.name,
      slug: input.slug,
      category: input.category,
      description: input.description,
      tagline: input.description,
      logo_text: getLogoText(input.name),
      whatsapp: input.whatsapp,
      phone: input.whatsapp,
      location: input.location,
      instagram_url: input.instagramUrl,
      opening_hours: input.openingHours,
      theme_id: input.themeId,
      is_published: true,
      subscription_plan: "starter",
      subscription_status: "trial",
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  if (input.includeSampleData) {
    const sample = getSampleCatalogue(input.category);

    await supabase.from("products").insert(
      sample.products.map((product) => ({
        ...product,
        business_id: data.id,
      }))
    );

    await supabase.from("services").insert(
      sample.services.map((service) => ({
        ...service,
        business_id: data.id,
      }))
    );
  }

  return data;
}

export async function getMyBusinesses() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error("You must be logged in.");
  }

  const { data, error } = await supabase
    .from("businesses")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function getPublicBusinessBySlug(slug: string) {
  const { data, error } = await supabase
    .from("businesses")
    .select("*, products (*), services (*)")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (error) {
    return null;
  }

  return data;
}

export function mapSupabaseBusinessToStoreBusiness(business: any) {
  return {
    id: business.id,
    name: business.name,
    slug: business.slug,
    tagline: business.tagline || business.description || "",
    description: business.description || "",
    whatsapp: business.whatsapp || business.phone || "",
    location: business.location || "",
    instagram: business.instagram_url || "https://instagram.com",
    themeId: business.theme_id || "classic-commerce",
    logo: business.logo_text || "MV",
    coverImage:
      business.cover_image_url ||
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=1600&auto=format&fit=crop",
    openingHours: business.opening_hours || "Contact business for availability",
    products: (business.products || [])
      .filter((product: any) => product.is_available)
      .map((product: any) => ({
        id: product.id,
        name: product.name,
        description: product.description || "",
        price: Number(product.price || 0),
        category: product.category || "Products",
        image:
          product.image_url ||
          "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1200&auto=format&fit=crop",
        available: product.is_available,
      })),
    services: (business.services || [])
      .filter((service: any) => service.is_visible)
      .map((service: any) => ({
        id: service.id,
        name: service.name,
        description: service.description || "",
        priceLabel: service.price_label || "Request quote",
      })),
  };
}

export async function createProduct(input: CreateProductInput) {
  const { data, error } = await supabase
    .from("products")
    .insert({
      business_id: input.businessId,
      name: input.name,
      description: input.description,
      price: input.price,
      category: input.category,
      image_url: input.imageUrl,
      is_available: input.isAvailable,
      is_featured: input.isFeatured,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getProductsByBusinessId(businessId: string) {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function updateProduct(input: UpdateProductInput) {
  const { data, error } = await supabase
    .from("products")
    .update({
      name: input.name,
      description: input.description,
      price: input.price,
      category: input.category,
      image_url: input.imageUrl,
      is_available: input.isAvailable,
      is_featured: input.isFeatured,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.productId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function toggleProductAvailability({
  productId,
  isAvailable,
}: {
  productId: string;
  isAvailable: boolean;
}) {
  const { data, error } = await supabase
    .from("products")
    .update({
      is_available: isAvailable,
      updated_at: new Date().toISOString(),
    })
    .eq("id", productId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function deleteProduct(productId: string) {
  const { error } = await supabase.from("products").delete().eq("id", productId);

  if (error) {
    throw error;
  }

  return true;
}

export async function createService(input: CreateServiceInput) {
  const { data, error } = await supabase
    .from("services")
    .insert({
      business_id: input.businessId,
      name: input.name,
      description: input.description,
      service_type: input.serviceType,
      price_label: input.priceLabel,
      availability_note: input.availabilityNote,
      button_label: input.buttonLabel,
      is_visible: input.isVisible,
      is_featured: input.isFeatured,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getServicesByBusinessId(businessId: string) {
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function updateService(input: UpdateServiceInput) {
  const { data, error } = await supabase
    .from("services")
    .update({
      name: input.name,
      description: input.description,
      service_type: input.serviceType,
      price_label: input.priceLabel,
      availability_note: input.availabilityNote,
      button_label: input.buttonLabel,
      is_visible: input.isVisible,
      is_featured: input.isFeatured,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.serviceId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function toggleServiceVisibility({
  serviceId,
  isVisible,
}: {
  serviceId: string;
  isVisible: boolean;
}) {
  const { data, error } = await supabase
    .from("services")
    .update({
      is_visible: isVisible,
      updated_at: new Date().toISOString(),
    })
    .eq("id", serviceId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function deleteService(serviceId: string) {
  const { error } = await supabase
    .from("services")
    .delete()
    .eq("id", serviceId);

  if (error) {
    throw error;
  }

  return true;
}

export async function createDomainRequest(input: CreateDomainRequestInput) {
  const { data, error } = await supabase
    .from("domain_requests")
    .insert({
      business_id: input.businessId,
      requested_domain: input.requestedDomain,
      alternative_domain: input.alternativeDomain,
      already_owned: input.alreadyOwned,
      contact_phone: input.contactPhone,
      note: input.note,
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  await supabase
    .from("businesses")
    .update({
      custom_domain: input.requestedDomain,
      custom_domain_status: "pending",
    })
    .eq("id", input.businessId);

  return data;
}

export async function getDomainRequestsByBusinessId(businessId: string) {
  const { data, error } = await supabase
    .from("domain_requests")
    .select("*")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function getAllBusinessesForAdmin() {
  await requireSuperAdmin();

  const { data, error } = await supabase
    .from("businesses")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function getAllDomainRequestsForAdmin() {
  await requireSuperAdmin();

  const { data, error } = await supabase
    .from("domain_requests")
    .select("*, businesses (name, slug, owner_id)")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function updateDomainRequestStatus({
  requestId,
  status,
  adminNote,
}: {
  requestId: string;
  status: string;
  adminNote: string;
}) {
  await requireSuperAdmin();

  const { data, error } = await supabase
    .from("domain_requests")
    .update({
      status,
      admin_note: adminNote,
      updated_at: new Date().toISOString(),
    })
    .eq("id", requestId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateBusinessProfile(input: UpdateBusinessProfileInput) {
  const { data, error } = await supabase
    .from("businesses")
    .update({
      name: input.name,
      slug: input.slug,
      category: input.category,
      tagline: input.tagline,
      description: input.description,
      logo_text: input.logoText,
      cover_image_url: input.coverImageUrl,
      whatsapp: input.whatsapp,
      phone: input.phone,
      email: input.email,
      location: input.location,
      instagram_url: input.instagramUrl,
      opening_hours: input.openingHours,
      is_published: input.isPublished,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.businessId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateBusinessTheme({
  businessId,
  themeId,
}: {
  businessId: string;
  themeId: string;
}) {
  const { data, error } = await supabase
    .from("businesses")
    .update({
      theme_id: themeId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", businessId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateBusinessPublishStatus({
  businessId,
  isPublished,
}: {
  businessId: string;
  isPublished: boolean;
}) {
  const { data, error } = await supabase
    .from("businesses")
    .update({
      is_published: isPublished,
      updated_at: new Date().toISOString(),
    })
    .eq("id", businessId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getOrdersByBusinessId(businessId: string) {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function createOrder(input: CreateOrderInput) {
  const totalAmount = input.items.reduce(
    (sum, item) => sum + Number(item.price || 0) * item.quantity,
    0
  );

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      business_id: input.businessId,
      customer_name: input.customerName,
      customer_phone: input.customerPhone,
      customer_address: input.customerAddress,
      customer_note: input.customerNote,
      total_amount: totalAmount,
      status: "started",
    })
    .select()
    .single();

  if (orderError) {
    throw orderError;
  }

  const orderItems = input.items.map((item) => ({
    order_id: order.id,
    product_id: item.id,
    product_name: item.name,
    quantity: item.quantity,
    unit_price: item.price,
    line_total: Number(item.price || 0) * item.quantity,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems);

  if (itemsError) {
    throw itemsError;
  }

  return order;
}

export async function getOrdersWithItemsByBusinessId(businessId: string) {
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items (*)")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function updateOrderStatus({
  orderId,
  status,
}: {
  orderId: string;
  status: string;
}) {
  const { data, error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getPublicBusinessPageBySlug(slug: string) {
  const { data, error } = await supabase
    .from("businesses")
    .select(
      `
      *,
      products (
        id,
        name,
        description,
        price,
        category,
        image_url,
        is_available,
        is_featured
      ),
      services (
        id,
        name,
        description,
        service_type,
        price_label,
        availability_note,
        button_label,
        is_visible,
        is_featured
      )
    `
    )
    .eq("slug", slug)
    .single();

  if (error) {
    return null;
  }

  return data;
}

export function getComputedSubscriptionStatus(business: {
  subscription_status?: string | null;
  subscription_expires_at?: string | null;
  grace_period_ends_at?: string | null;
  admin_override_active?: boolean | null;
}) {
  if (business.admin_override_active) {
    return {
      status: "override_active",
      label: "Admin Override",
      shouldBePublished: true,
    };
  }

  if (!business.subscription_expires_at) {
    return {
      status: business.subscription_status || "trial",
      label: business.subscription_status || "Trial",
      shouldBePublished: true,
    };
  }

  const now = new Date();
  const expiresAt = new Date(business.subscription_expires_at);
  const graceEndsAt = business.grace_period_ends_at
    ? new Date(business.grace_period_ends_at)
    : expiresAt;

  if (now <= expiresAt) {
    return {
      status: "active",
      label: "Active",
      shouldBePublished: true,
    };
  }

  if (now <= graceEndsAt) {
    return {
      status: "grace_period",
      label: "Grace Period",
      shouldBePublished: true,
    };
  }

  return {
    status: "expired",
    label: "Expired",
    shouldBePublished: false,
  };
}
