-- Market Villa revenue protection foundation

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade,
  owner_id uuid references auth.users(id) on delete cascade,
  plan text not null,
  amount integer not null,
  currency text not null default 'NGN',
  reference text not null unique,
  status text not null default 'pending',
  authorization_url text,
  paid_at timestamptz,
  raw_response jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.payments enable row level security;

create policy if not exists "Business owners can view own payments"
on public.payments for select
using (owner_id = auth.uid());

create policy if not exists "Business owners can create own payments"
on public.payments for insert
with check (owner_id = auth.uid());

create policy if not exists "Business owners can update own pending payments"
on public.payments for update
using (owner_id = auth.uid());

alter table public.businesses
add column if not exists subscription_started_at timestamptz,
add column if not exists subscription_expires_at timestamptz,
add column if not exists grace_period_ends_at timestamptz,
add column if not exists admin_override_active boolean default false,
add column if not exists admin_override_note text;

create index if not exists payments_business_id_idx on public.payments (business_id);
create index if not exists payments_owner_id_idx on public.payments (owner_id);
create index if not exists payments_reference_idx on public.payments (reference);
create index if not exists businesses_slug_idx on public.businesses (slug);
create index if not exists businesses_subscription_expires_at_idx on public.businesses (subscription_expires_at);
create index if not exists businesses_subscription_status_idx on public.businesses (subscription_status);
create index if not exists products_business_id_idx on public.products (business_id);
create index if not exists services_business_id_idx on public.services (business_id);
create index if not exists orders_business_id_idx on public.orders (business_id);
