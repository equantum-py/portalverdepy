begin;

alter table public.digital_nursery_items
  add column if not exists description text not null default '',
  add column if not exists image_url text,
  add column if not exists storage_path text,
  add column if not exists whatsapp_message text not null default '';

-- Las referencias externas no deben formar parte de la experiencia del panel ni del sitio.
update public.digital_nursery_items
set
  source_url = null,
  reference_image_url = null,
  is_active = false,
  is_published = false,
  updated_at = now();

-- Lectura pública únicamente para registros habilitados.
drop policy if exists "Public can read active digital nursery" on public.digital_nursery_items;
create policy "Public can read active digital nursery"
on public.digital_nursery_items
for select
to anon, authenticated
using (is_active = true and is_published = true);

grant select on public.digital_nursery_items to anon;

notify pgrst, 'reload schema';

commit;
