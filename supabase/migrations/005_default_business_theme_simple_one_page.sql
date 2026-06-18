-- Make the simple one-page storefront the default theme for newly created businesses.

alter table public.businesses
alter column theme_id set default 'simple-one-page';

update public.businesses
set theme_id = 'simple-one-page'
where theme_id is null
   or theme_id = ''
   or theme_id = 'classic-commerce';
