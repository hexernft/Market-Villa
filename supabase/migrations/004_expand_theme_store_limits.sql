-- Expand theme access metadata now that the Theme Store includes premium options.

update public.pricing_items
set features = jsonb_set(
  coalesce(features, '{}'::jsonb),
  '{theme_limit}',
  '22'::jsonb,
  true
)
where pricing_type = 'subscription'
  and pricing_key = 'pro';
