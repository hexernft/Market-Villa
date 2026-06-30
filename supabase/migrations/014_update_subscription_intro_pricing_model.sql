-- Align subscription intro pricing with the current Market Villa billing rules.

update public.pricing_items
set
  price_label = '3 months free, then NGN 1,500/month for 3 months',
  amount = 1500,
  amount_in_kobo = 150000,
  metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object(
    'intro_monthly_amount', 1500,
    'regular_monthly_amount', 3000,
    'free_months', 3,
    'intro_paid_months', 3,
    'intro_billing_cycle', 'quarterly'
  ),
  updated_at = now()
where pricing_type = 'subscription'
  and pricing_key = 'starter';

update public.pricing_items
set
  price_label = '50% off for 6 months, bi-annual payment only',
  amount = 3500,
  amount_in_kobo = 350000,
  metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object(
    'intro_monthly_amount', 3500,
    'regular_monthly_amount', 7000,
    'free_months', 0,
    'intro_paid_months', 6,
    'intro_billing_cycle', 'biannually'
  ),
  updated_at = now()
where pricing_type = 'subscription'
  and pricing_key = 'growth';

update public.pricing_items
set
  price_label = '50% off for 6 months, bi-annual payment only',
  amount = 5000,
  amount_in_kobo = 500000,
  metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object(
    'intro_monthly_amount', 5000,
    'regular_monthly_amount', 10000,
    'free_months', 0,
    'intro_paid_months', 6,
    'intro_billing_cycle', 'biannually'
  ),
  updated_at = now()
where pricing_type = 'subscription'
  and pricing_key = 'pro';
