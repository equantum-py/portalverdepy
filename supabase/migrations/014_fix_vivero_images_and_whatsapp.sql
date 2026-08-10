begin;

-- Vivero Digital: asegurar todos los campos requeridos por el editor.
alter table public.digital_nursery_items
  add column if not exists description text not null default '',
  add column if not exists image_url text,
  add column if not exists storage_path text,
  add column if not exists whatsapp_message text not null default '';

-- Asegurar permisos de edición para administradores.
grant select, insert, update, delete on public.digital_nursery_items to authenticated;

drop policy if exists "Admins can manage digital nursery" on public.digital_nursery_items;
create policy "Admins can manage digital nursery"
on public.digital_nursery_items
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Bucket utilizado por las fotos del vivero y productos.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880,
  array['image/jpeg','image/png','image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view product images" on storage.objects;
create policy "Public can view product images"
on storage.objects
for select
to public
using (bucket_id = 'product-images');

drop policy if exists "Admins can upload product images" on storage.objects;
create policy "Admins can upload product images"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "Admins can update product images" on storage.objects;
create policy "Admins can update product images"
on storage.objects
for update
to authenticated
using (bucket_id = 'product-images' and public.is_admin())
with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "Admins can delete product images" on storage.objects;
create policy "Admins can delete product images"
on storage.objects
for delete
to authenticated
using (bucket_id = 'product-images' and public.is_admin());

-- WhatsApp oficial de Portal Verde.
alter table public.home_page_settings
  add column if not exists whatsapp_text text not null default 'Consultar por WhatsApp',
  add column if not exists whatsapp_url text not null default 'https://wa.me/595984053683';

update public.home_page_settings
set
  whatsapp_url = 'https://wa.me/595984053683',
  promo_url = case
    when promo_url is null or promo_url = '' or promo_url like '%595981077600%'
      then 'https://wa.me/595984053683'
    else replace(promo_url, '595981077600', '595984053683')
  end,
  updated_at = now()
where id = true;

update public.home_global_buttons
set url = replace(url, '595981077600', '595984053683')
where url like '%595981077600%';

update public.home_navigation_items
set url = replace(url, '595981077600', '595984053683')
where url like '%595981077600%';

update public.home_mega_services
set url = replace(url, '595981077600', '595984053683')
where url like '%595981077600%';

update public.home_hero_slides
set
  primary_button_url = replace(primary_button_url, '595981077600', '595984053683'),
  secondary_button_url = replace(secondary_button_url, '595981077600', '595984053683')
where primary_button_url like '%595981077600%'
   or secondary_button_url like '%595981077600%';

notify pgrst, 'reload schema';

commit;
