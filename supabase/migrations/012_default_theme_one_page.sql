-- Make the new clean one-page storefront the default for future businesses.
alter table public.businesses
alter column theme_id set default 'default-one-page';

update public.businesses
set theme_id = 'default-one-page'
where theme_id is null
   or theme_id = ''
   or theme_id = 'classic-commerce'
   or theme_id = 'simple-one-page';
