-- Normalize the top subscription plan to internal id "pro".
-- Customers can still see the display name "Premium" in the app.

update public.businesses
set subscription_plan = 'pro',
    updated_at = now()
where subscription_plan = 'premium';

update public.payments
set plan = 'pro',
    updated_at = now()
where plan = 'premium';

do $$
begin
  if to_regclass('public.pricing_items') is not null then
    if exists (
      select 1
      from public.pricing_items
      where pricing_type = 'subscription'
        and pricing_key = 'premium'
    ) and not exists (
      select 1
      from public.pricing_items
      where pricing_type = 'subscription'
        and pricing_key = 'pro'
    ) then
      update public.pricing_items
      set pricing_key = 'pro',
          name = 'Premium',
          updated_at = now()
      where pricing_type = 'subscription'
        and pricing_key = 'premium';
    elsif exists (
      select 1
      from public.pricing_items
      where pricing_type = 'subscription'
        and pricing_key = 'premium'
    ) then
      update public.pricing_items
      set is_active = false,
          updated_at = now()
      where pricing_type = 'subscription'
        and pricing_key = 'premium';
    end if;
  end if;
end $$;
