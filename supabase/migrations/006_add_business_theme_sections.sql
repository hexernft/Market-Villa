-- Store per-business theme section visibility so premium themes can be modular.

alter table public.businesses
add column if not exists theme_sections jsonb not null default '[]'::jsonb;
