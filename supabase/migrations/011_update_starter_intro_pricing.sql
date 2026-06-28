-- Align Starter introductory pricing with the current public pricing rule.

update public.pricing_items
set
  price_label = '1 month free, then NGN 1,000/month for 3 months',
  amount = 1000,
  amount_in_kobo = 100000,
  metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object(
    'intro_monthly_amount', 1000,
    'regular_monthly_amount', 3000,
    'free_months', 1,
    'intro_paid_months', 3
  ),
  updated_at = now()
where pricing_type = 'subscription'
  and pricing_key = 'starter';
