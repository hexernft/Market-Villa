update businesses
set
  business_mode = 'products',
  theme_id = 'simple-one-page',
  updated_at = now()
where business_mode in ('properties', 'cars')
  and subscription_plan in ('starter', 'basic');

alter table businesses
  drop constraint if exists businesses_mode_requires_growth_plan_check;

alter table businesses
  add constraint businesses_mode_requires_growth_plan_check
  check (
    business_mode = 'products'
    or subscription_plan in ('growth', 'business', 'pro', 'premium')
  );

drop policy if exists "Anyone can create vehicle inquiries for published dealerships" on vehicle_inquiries;
create policy "Anyone can create vehicle inquiries for published dealerships"
on vehicle_inquiries
for insert
with check (
  exists (
    select 1
    from businesses
    where businesses.id = vehicle_inquiries.business_id
      and businesses.is_published = true
      and businesses.business_mode = 'cars'
      and businesses.subscription_plan in ('growth', 'business', 'pro', 'premium')
  )
);

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
      and businesses.subscription_plan in ('growth', 'business', 'pro', 'premium')
  )
);
