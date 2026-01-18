-- Create storage bucket for restaurant customization images
insert into storage.buckets (id, name, public)
values ('restaurants', 'restaurants', true)
on conflict (id) do nothing;

-- Set up RLS policies for restaurants bucket
create policy "Restaurant owners can upload images"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'restaurants' and
  (storage.foldername(name))[1] in (
    select id::text from restaurants where owner_id = auth.uid()
  )
);

create policy "Anyone can view restaurant images"
on storage.objects for select
to public
using (bucket_id = 'restaurants');

create policy "Restaurant owners can update their images"
on storage.objects for update
to authenticated
using (
  bucket_id = 'restaurants' and
  (storage.foldername(name))[1] in (
    select id::text from restaurants where owner_id = auth.uid()
  )
);

create policy "Restaurant owners can delete their images"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'restaurants' and
  (storage.foldername(name))[1] in (
    select id::text from restaurants where owner_id = auth.uid()
  )
);
