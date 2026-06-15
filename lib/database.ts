export type Business = {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  category: string | null;
  tagline: string | null;
  description: string | null;
  logo_text: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  whatsapp: string | null;
  phone: string | null;
  email: string | null;
  location: string | null;
  instagram_url: string | null;
  opening_hours: string | null;
  theme_id: string;
  is_published: boolean;
  custom_domain: string | null;
  custom_domain_status: string;
  subscription_plan: string;
  subscription_status: string;
  created_at: string;
  updated_at: string;
};

export type Product = {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  price: number;
  category: string | null;
  image_url: string | null;
  is_available: boolean;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type Service = {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  service_type: string | null;
  price_label: string | null;
  availability_note: string | null;
  button_label: string | null;
  is_visible: boolean;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type DomainRequest = {
  id: string;
  business_id: string;
  requested_domain: string;
  alternative_domain: string | null;
  already_owned: boolean;
  contact_phone: string | null;
  note: string | null;
  status: string;
  setup_fee: number | null;
  renewal_fee: number | null;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
};
