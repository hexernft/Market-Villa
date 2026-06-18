alter table products
  add column if not exists property_status text not null default 'available',
  add column if not exists property_details jsonb not null default '{}'::jsonb;

alter table products
  drop constraint if exists products_item_type_check;

alter table products
  add constraint products_item_type_check
  check (item_type in ('product', 'vehicle', 'property'));

alter table products
  drop constraint if exists products_property_status_check;

alter table products
  add constraint products_property_status_check
  check (property_status in ('available', 'reserved', 'rented', 'sold', 'unavailable'));

create table if not exists property_inquiries (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  property_name text not null,
  customer_name text not null,
  customer_phone text not null,
  preferred_date text,
  preferred_location text,
  inquiry_type text not null default 'inspection',
  message text,
  status text not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint property_inquiries_type_check
    check (inquiry_type in ('inspection', 'availability', 'price_request', 'document_request')),
  constraint property_inquiries_status_check
    check (status in ('new', 'contacted', 'scheduled', 'closed'))
);

alter table property_inquiries enable row level security;

drop policy if exists "Anyone can create property inquiries for published property businesses" on property_inquiries;
create policy "Anyone can create property inquiries for published property businesses"
on property_inquiries
for insert
with check (
  exists (
    select 1
    from businesses
    where businesses.id = property_inquiries.business_id
      and businesses.is_published = true
      and businesses.business_mode = 'properties'
  )
);

drop policy if exists "Owners can read property inquiries" on property_inquiries;
create policy "Owners can read property inquiries"
on property_inquiries
for select
using (
  exists (
    select 1
    from businesses
    where businesses.id = property_inquiries.business_id
      and businesses.owner_id = auth.uid()
  )
);

drop policy if exists "Owners can update property inquiries" on property_inquiries;
create policy "Owners can update property inquiries"
on property_inquiries
for update
using (
  exists (
    select 1
    from businesses
    where businesses.id = property_inquiries.business_id
      and businesses.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from businesses
    where businesses.id = property_inquiries.business_id
      and businesses.owner_id = auth.uid()
  )
);
