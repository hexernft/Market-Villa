-- Market Villa core schema, RLS, storage, and starter pricing.
-- This migration is intentionally additive/idempotent for safer review.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'business_owner',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_role_check check (role in ('business_owner', 'business_staff', 'super_admin'))
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'business_owner')
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = coalesce(nullif(excluded.full_name, ''), public.profiles.full_name),
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'super_admin'
  );
$$;

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  slug text not null unique,
  category text,
  tagline text,
  description text,
  logo_text text,
  logo_url text,
  cover_image_url text,
  whatsapp text,
  phone text,
  email text,
  location text,
  instagram_url text,
  opening_hours text,
  theme_id text not null default 'classic-commerce',
  is_published boolean not null default false,
  is_featured boolean not null default false,
  featured_until timestamptz,
  is_verified boolean not null default false,
  visibility_plan text not null default 'standard',
  weekly_views integer not null default 0,
  total_views integer not null default 0,
  whatsapp_clicks integer not null default 0,
  copy_link_clicks integer not null default 0,
  share_clicks integer not null default 0,
  custom_domain text,
  custom_domain_status text not null default 'none',
  subscription_plan text not null default 'starter',
  subscription_status text not null default 'trial',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  description text,
  price numeric(12, 2) not null default 0,
  category text,
  image_url text,
  is_available boolean not null default true,
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  description text,
  service_type text,
  price_label text,
  availability_note text,
  button_label text,
  is_visible boolean not null default true,
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.domain_requests (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  requested_domain text not null,
  alternative_domain text,
  already_owned boolean not null default false,
  contact_phone text,
  note text,
  status text not null default 'pending',
  setup_fee integer,
  renewal_fee integer,
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint domain_requests_status_check check (status in ('pending', 'approved', 'rejected', 'completed'))
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  customer_name text,
  customer_phone text,
  customer_address text,
  customer_location text,
  customer_note text,
  status text not null default 'started',
  total_amount numeric(12, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  quantity integer not null default 1,
  unit_price numeric(12, 2) not null default 0,
  line_total numeric(12, 2) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.pricing_items (
  id uuid primary key default gen_random_uuid(),
  pricing_key text not null,
  pricing_type text not null,
  name text not null,
  description text,
  price_label text,
  amount integer not null default 0,
  amount_in_kobo integer not null default 0,
  duration_days integer,
  product_limit integer,
  store_limit integer,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (pricing_type, pricing_key),
  constraint pricing_items_type_check check (pricing_type in ('subscription', 'visibility'))
);

create table if not exists public.visibility_requests (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  owner_id uuid references auth.users(id) on delete set null,
  request_type text not null,
  status text not null default 'pending',
  payment_reference text,
  amount integer,
  currency text not null default 'NGN',
  requested_days integer,
  package_name text,
  package_price_label text,
  message text,
  paid_at timestamptz,
  activated_at timestamptz,
  expires_at timestamptz,
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint visibility_requests_status_check check (status in ('pending', 'paid', 'approved', 'rejected', 'expired'))
);

create table if not exists public.store_events (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  event_type text not null,
  source text not null default 'web',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint store_events_type_check check (event_type in ('store_view', 'whatsapp_click', 'copy_link', 'share_click'))
);

create index if not exists businesses_owner_id_idx on public.businesses (owner_id);
create index if not exists businesses_slug_idx on public.businesses (slug);
create index if not exists businesses_published_idx on public.businesses (is_published);
create index if not exists businesses_featured_idx on public.businesses (is_featured, featured_until);
create index if not exists products_business_id_idx on public.products (business_id);
create index if not exists services_business_id_idx on public.services (business_id);
create index if not exists domain_requests_business_id_idx on public.domain_requests (business_id);
create index if not exists orders_business_id_idx on public.orders (business_id);
create index if not exists order_items_order_id_idx on public.order_items (order_id);
create index if not exists visibility_requests_business_id_idx on public.visibility_requests (business_id);
create index if not exists visibility_requests_payment_reference_idx on public.visibility_requests (payment_reference);
create index if not exists pricing_items_type_key_idx on public.pricing_items (pricing_type, pricing_key);
create index if not exists store_events_business_created_idx on public.store_events (business_id, created_at desc);

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_businesses_updated_at on public.businesses;
create trigger set_businesses_updated_at
before update on public.businesses
for each row execute function public.set_updated_at();

drop trigger if exists set_products_updated_at on public.products;
create trigger set_products_updated_at
before update on public.products
for each row execute function public.set_updated_at();

drop trigger if exists set_services_updated_at on public.services;
create trigger set_services_updated_at
before update on public.services
for each row execute function public.set_updated_at();

drop trigger if exists set_domain_requests_updated_at on public.domain_requests;
create trigger set_domain_requests_updated_at
before update on public.domain_requests
for each row execute function public.set_updated_at();

drop trigger if exists set_orders_updated_at on public.orders;
create trigger set_orders_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

drop trigger if exists set_pricing_items_updated_at on public.pricing_items;
create trigger set_pricing_items_updated_at
before update on public.pricing_items
for each row execute function public.set_updated_at();

drop trigger if exists set_visibility_requests_updated_at on public.visibility_requests;
create trigger set_visibility_requests_updated_at
before update on public.visibility_requests
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.businesses enable row level security;
alter table public.products enable row level security;
alter table public.services enable row level security;
alter table public.domain_requests enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.pricing_items enable row level security;
alter table public.visibility_requests enable row level security;
alter table public.store_events enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'profiles' and policyname = 'Users can read own profile') then
    create policy "Users can read own profile" on public.profiles for select using (id = auth.uid() or public.is_super_admin());
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'profiles' and policyname = 'Users can update own profile') then
    create policy "Users can update own profile" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'profiles' and policyname = 'Super admins can manage profiles') then
    create policy "Super admins can manage profiles" on public.profiles for all using (public.is_super_admin()) with check (public.is_super_admin());
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'businesses' and policyname = 'Public can read published businesses') then
    create policy "Public can read published businesses" on public.businesses for select using (is_published = true or owner_id = auth.uid() or public.is_super_admin());
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'businesses' and policyname = 'Owners can create businesses') then
    create policy "Owners can create businesses" on public.businesses for insert with check (owner_id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'businesses' and policyname = 'Owners can update own businesses') then
    create policy "Owners can update own businesses" on public.businesses for update using (owner_id = auth.uid() or public.is_super_admin()) with check (owner_id = auth.uid() or public.is_super_admin());
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'businesses' and policyname = 'Owners can delete own businesses') then
    create policy "Owners can delete own businesses" on public.businesses for delete using (owner_id = auth.uid() or public.is_super_admin());
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'products' and policyname = 'Public can read published products') then
    create policy "Public can read published products" on public.products for select using (
      exists (
        select 1 from public.businesses
        where businesses.id = products.business_id
          and (businesses.is_published = true or businesses.owner_id = auth.uid() or public.is_super_admin())
      )
    );
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'products' and policyname = 'Owners can manage own products') then
    create policy "Owners can manage own products" on public.products for all using (
      exists (select 1 from public.businesses where businesses.id = products.business_id and (businesses.owner_id = auth.uid() or public.is_super_admin()))
    ) with check (
      exists (select 1 from public.businesses where businesses.id = products.business_id and (businesses.owner_id = auth.uid() or public.is_super_admin()))
    );
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'services' and policyname = 'Public can read published services') then
    create policy "Public can read published services" on public.services for select using (
      exists (
        select 1 from public.businesses
        where businesses.id = services.business_id
          and (businesses.is_published = true or businesses.owner_id = auth.uid() or public.is_super_admin())
      )
    );
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'services' and policyname = 'Owners can manage own services') then
    create policy "Owners can manage own services" on public.services for all using (
      exists (select 1 from public.businesses where businesses.id = services.business_id and (businesses.owner_id = auth.uid() or public.is_super_admin()))
    ) with check (
      exists (select 1 from public.businesses where businesses.id = services.business_id and (businesses.owner_id = auth.uid() or public.is_super_admin()))
    );
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'domain_requests' and policyname = 'Owners can create domain requests') then
    create policy "Owners can create domain requests" on public.domain_requests for insert with check (
      exists (select 1 from public.businesses where businesses.id = domain_requests.business_id and businesses.owner_id = auth.uid())
    );
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'domain_requests' and policyname = 'Owners and admins can read domain requests') then
    create policy "Owners and admins can read domain requests" on public.domain_requests for select using (
      public.is_super_admin() or exists (select 1 from public.businesses where businesses.id = domain_requests.business_id and businesses.owner_id = auth.uid())
    );
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'domain_requests' and policyname = 'Admins can update domain requests') then
    create policy "Admins can update domain requests" on public.domain_requests for update using (public.is_super_admin()) with check (public.is_super_admin());
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'orders' and policyname = 'Public can create orders for published businesses') then
    create policy "Public can create orders for published businesses" on public.orders for insert with check (
      exists (select 1 from public.businesses where businesses.id = orders.business_id and businesses.is_published = true)
    );
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'orders' and policyname = 'Owners can manage own orders') then
    create policy "Owners can manage own orders" on public.orders for all using (
      exists (select 1 from public.businesses where businesses.id = orders.business_id and (businesses.owner_id = auth.uid() or public.is_super_admin()))
    ) with check (
      exists (select 1 from public.businesses where businesses.id = orders.business_id and (businesses.owner_id = auth.uid() or public.is_super_admin()))
    );
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'order_items' and policyname = 'Public can create order items for published businesses') then
    create policy "Public can create order items for published businesses" on public.order_items for insert with check (
      exists (
        select 1
        from public.products
        join public.businesses on businesses.id = products.business_id
        where products.id = order_items.product_id
          and businesses.is_published = true
      )
    );
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'order_items' and policyname = 'Owners can read own order items') then
    create policy "Owners can read own order items" on public.order_items for select using (
      exists (
        select 1
        from public.orders
        join public.businesses on businesses.id = orders.business_id
        where orders.id = order_items.order_id
          and (businesses.owner_id = auth.uid() or public.is_super_admin())
      )
    );
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'pricing_items' and policyname = 'Public can read active pricing') then
    create policy "Public can read active pricing" on public.pricing_items for select using (is_active = true or public.is_super_admin());
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'pricing_items' and policyname = 'Admins can manage pricing') then
    create policy "Admins can manage pricing" on public.pricing_items for all using (public.is_super_admin()) with check (public.is_super_admin());
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'visibility_requests' and policyname = 'Owners can create visibility requests') then
    create policy "Owners can create visibility requests" on public.visibility_requests for insert with check (
      exists (select 1 from public.businesses where businesses.id = visibility_requests.business_id and businesses.owner_id = auth.uid())
    );
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'visibility_requests' and policyname = 'Owners and admins can read visibility requests') then
    create policy "Owners and admins can read visibility requests" on public.visibility_requests for select using (
      public.is_super_admin() or exists (select 1 from public.businesses where businesses.id = visibility_requests.business_id and businesses.owner_id = auth.uid())
    );
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'visibility_requests' and policyname = 'Admins can update visibility requests') then
    create policy "Admins can update visibility requests" on public.visibility_requests for update using (public.is_super_admin()) with check (public.is_super_admin());
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'store_events' and policyname = 'Admins can read store events') then
    create policy "Admins can read store events" on public.store_events for select using (public.is_super_admin());
  end if;
end $$;

insert into public.pricing_items (pricing_key, pricing_type, name, description, price_label, amount, amount_in_kobo, product_limit, store_limit, sort_order, metadata)
values
  ('starter', 'subscription', 'Starter', 'For small businesses starting online.', 'NGN 10,000/month', 10000, 1000000, 20, 1, 10, '{"theme_limit":5}'::jsonb),
  ('growth', 'subscription', 'Growth', 'For growing businesses ready to sell more products.', 'NGN 20,000/month', 20000, 2000000, 100, 3, 20, '{"theme_limit":10}'::jsonb),
  ('pro', 'subscription', 'Premium', 'For established businesses that need stronger visibility.', 'NGN 30,000/month', 30000, 3000000, 500, 10, 30, '{"theme_limit":10}'::jsonb),
  ('featured_store', 'visibility', 'Featured Store', 'Get higher visibility inside your business category.', 'NGN 5,000 / 7 days', 5000, 500000, 7, null, 10, '{}'::jsonb),
  ('verified_badge', 'visibility', 'Verified Badge', 'Show customers that this business has been reviewed.', 'NGN 3,000 one-time', 3000, 300000, null, null, 20, '{}'::jsonb),
  ('visibility_pack', 'visibility', 'Visibility Pack', 'Featured visibility, category boost, verified badge, and launch promotion support.', 'NGN 15,000 / 30 days', 15000, 1500000, 30, null, 30, '{}'::jsonb)
on conflict (pricing_type, pricing_key) do update
set
  name = excluded.name,
  description = excluded.description,
  price_label = excluded.price_label,
  amount = excluded.amount,
  amount_in_kobo = excluded.amount_in_kobo,
  product_limit = excluded.product_limit,
  store_limit = excluded.store_limit,
  sort_order = excluded.sort_order,
  metadata = public.pricing_items.metadata || excluded.metadata,
  updated_at = now();

insert into storage.buckets (id, name, public)
values ('business-images', 'business-images', true)
on conflict (id) do update set public = true;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Public can read business images') then
    create policy "Public can read business images" on storage.objects for select using (bucket_id = 'business-images');
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Business owners can upload own images') then
    create policy "Business owners can upload own images" on storage.objects for insert with check (
      bucket_id = 'business-images'
      and exists (
        select 1 from public.businesses
        where businesses.id::text = (storage.foldername(name))[1]
          and businesses.owner_id = auth.uid()
      )
    );
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Business owners can update own images') then
    create policy "Business owners can update own images" on storage.objects for update using (
      bucket_id = 'business-images'
      and exists (
        select 1 from public.businesses
        where businesses.id::text = (storage.foldername(name))[1]
          and businesses.owner_id = auth.uid()
      )
    ) with check (
      bucket_id = 'business-images'
      and exists (
        select 1 from public.businesses
        where businesses.id::text = (storage.foldername(name))[1]
          and businesses.owner_id = auth.uid()
      )
    );
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Business owners can delete own images') then
    create policy "Business owners can delete own images" on storage.objects for delete using (
      bucket_id = 'business-images'
      and exists (
        select 1 from public.businesses
        where businesses.id::text = (storage.foldername(name))[1]
          and businesses.owner_id = auth.uid()
      )
    );
  end if;
end $$;

create or replace function public.increment_store_views(target_business_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.businesses
  set
    total_views = coalesce(total_views, 0) + 1,
    weekly_views = coalesce(weekly_views, 0) + 1,
    updated_at = now()
  where id = target_business_id;
end;
$$;

create or replace function public.increment_whatsapp_clicks(target_business_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.businesses
  set whatsapp_clicks = coalesce(whatsapp_clicks, 0) + 1,
      updated_at = now()
  where id = target_business_id;
end;
$$;

create or replace function public.increment_copy_link_clicks(target_business_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.businesses
  set copy_link_clicks = coalesce(copy_link_clicks, 0) + 1,
      updated_at = now()
  where id = target_business_id;
end;
$$;

create or replace function public.increment_share_clicks(target_business_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.businesses
  set share_clicks = coalesce(share_clicks, 0) + 1,
      updated_at = now()
  where id = target_business_id;
end;
$$;
