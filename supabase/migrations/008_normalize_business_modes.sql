-- Normalize early dealership-mode values into the final three vertical modes.

alter table public.businesses
alter column business_mode set default 'products';

update public.businesses
set business_mode = case
  when business_mode = 'car_dealership' then 'cars'
  when business_mode = 'standard' then 'products'
  when business_mode in ('products', 'properties', 'cars') then business_mode
  else 'products'
end;

alter table public.businesses
drop constraint if exists businesses_business_mode_check;

alter table public.businesses
add constraint businesses_business_mode_check
check (business_mode in ('products', 'properties', 'cars'));

drop policy if exists "Public can create vehicle inquiries for published dealerships"
on public.vehicle_inquiries;

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
