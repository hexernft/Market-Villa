-- Theme editor entitlement support for Pro storefront themes.
-- Safe to run after the existing Market Villa schema. This migration is additive only.

alter table public.businesses
  add column if not exists theme_settings jsonb not null default '{}'::jsonb;

create table if not exists public.business_theme_extensions (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  theme_id text not null,
  status text not null default 'active',
  purchased_at timestamptz not null default now(),
  expires_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint business_theme_extensions_status_check
    check (status in ('active', 'inactive', 'expired', 'revoked')),
  constraint business_theme_extensions_business_theme_key
    unique (business_id, theme_id)
);

create index if not exists business_theme_extensions_business_id_idx
  on public.business_theme_extensions (business_id);

create index if not exists business_theme_extensions_theme_id_idx
  on public.business_theme_extensions (theme_id);

alter table public.business_theme_extensions enable row level security;

drop policy if exists "Business owners can read their theme extensions"
  on public.business_theme_extensions;

create policy "Business owners can read their theme extensions"
  on public.business_theme_extensions
  for select
  using (
    exists (
      select 1
      from public.businesses
      where businesses.id = business_theme_extensions.business_id
        and businesses.owner_id = auth.uid()
    )
  );

drop policy if exists "Admins can manage theme extensions"
  on public.business_theme_extensions;

create policy "Admins can manage theme extensions"
  on public.business_theme_extensions
  for all
  using (public.is_super_admin())
  with check (public.is_super_admin());

create or replace function public.set_business_theme_extensions_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_business_theme_extensions_updated_at
  on public.business_theme_extensions;

create trigger set_business_theme_extensions_updated_at
  before update on public.business_theme_extensions
  for each row
  execute function public.set_business_theme_extensions_updated_at();
