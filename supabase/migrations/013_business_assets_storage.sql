insert into storage.buckets (id, name, public)
values ('business-assets', 'business-assets', true)
on conflict (id) do update
set public = true;

create policy "Public can view business assets"
on storage.objects
for select
using (bucket_id = 'business-assets');

create policy "Authenticated users can upload business assets"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'business-assets');

create policy "Authenticated users can update business assets"
on storage.objects
for update
to authenticated
using (bucket_id = 'business-assets')
with check (bucket_id = 'business-assets');

create policy "Authenticated users can delete business assets"
on storage.objects
for delete
to authenticated
using (bucket_id = 'business-assets');
