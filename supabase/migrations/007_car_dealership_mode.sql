-- Add dealership mode without replacing the existing product catalogue.

alter table public.businesses
add column if not exists business_mode text not null default 'products';

alter table public.businesses
drop constraint if exists businesses_business_mode_check;

alter table public.businesses
add constraint businesses_business_mode_check
check (business_mode in ('products', 'properties', 'cars'));

alter table public.products
add column if not exists item_type text not null default 'product',
add column if not exists vehicle_status text not null default 'available',
add column if not exists vehicle_details jsonb not null default '{}'::jsonb;

alter table public.products
drop constraint if exists products_item_type_check;

alter table public.products
add constraint products_item_type_check
check (item_type in ('product', 'vehicle'));

alter table public.products
drop constraint if exists products_vehicle_status_check;

alter table public.products
add constraint products_vehicle_status_check
check (vehicle_status in ('available', 'reserved', 'sold', 'in_transit', 'on_request'));

create table if not exists public.vehicle_inquiries (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  vehicle_name text not null,
  customer_name text,
  customer_phone text,
  preferred_date text,
  preferred_location text,
  inquiry_type text not null default 'inspection',
  message text,
  status text not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.vehicle_inquiries
drop constraint if exists vehicle_inquiries_type_check;

alter table public.vehicle_inquiries
add constraint vehicle_inquiries_type_check
check (inquiry_type in ('inspection', 'test_drive', 'video_request', 'price_request', 'financing'));

alter table public.vehicle_inquiries
drop constraint if exists vehicle_inquiries_status_check;

alter table public.vehicle_inquiries
add constraint vehicle_inquiries_status_check
check (status in ('new', 'contacted', 'scheduled', 'closed'));

create index if not exists products_item_type_idx on public.products (item_type);
create index if not exists products_vehicle_status_idx on public.products (vehicle_status);
create index if not exists vehicle_inquiries_business_id_idx on public.vehicle_inquiries (business_id);
create index if not exists vehicle_inquiries_product_id_idx on public.vehicle_inquiries (product_id);

drop trigger if exists set_vehicle_inquiries_updated_at on public.vehicle_inquiries;
create trigger set_vehicle_inquiries_updated_at
before update on public.vehicle_inquiries
for each row execute function public.set_updated_at();

alter table public.vehicle_inquiries enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'vehicle_inquiries'
      and policyname = 'Public can create vehicle inquiries for published dealerships'
  ) then
    create policy "Public can create vehicle inquiries for published dealerships"
    on public.vehicle_inquiries for insert
    with check (
      exists (
        select 1 from public.businesses
        where businesses.id = vehicle_inquiries.business_id
          and businesses.is_published = true
          and businesses.business_mode = 'cars'
      )
    );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'vehicle_inquiries'
      and policyname = 'Owners can read own vehicle inquiries'
  ) then
    create policy "Owners can read own vehicle inquiries"
    on public.vehicle_inquiries for select
    using (
      public.is_super_admin()
      or exists (
        select 1 from public.businesses
        where businesses.id = vehicle_inquiries.business_id
          and businesses.owner_id = auth.uid()
      )
    );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'vehicle_inquiries'
      and policyname = 'Owners can update own vehicle inquiries'
  ) then
    create policy "Owners can update own vehicle inquiries"
    on public.vehicle_inquiries for update
    using (
      public.is_super_admin()
      or exists (
        select 1 from public.businesses
        where businesses.id = vehicle_inquiries.business_id
          and businesses.owner_id = auth.uid()
      )
    )
    with check (
      public.is_super_admin()
      or exists (
        select 1 from public.businesses
        where businesses.id = vehicle_inquiries.business_id
          and businesses.owner_id = auth.uid()
      )
    );
  end if;
end $$;
