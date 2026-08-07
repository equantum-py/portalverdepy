begin;

alter table public.home_page_settings
  add column if not exists hero_enabled boolean not null default true,
  add column if not exists hero_title text not null default 'Transformamos tu espacio en un jardín que se disfruta',
  add column if not exists hero_subtitle text not null default 'Instalación profesional garantizada',
  add column if not exists hero_description text not null default '',
  add column if not exists hero_desktop_url text,
  add column if not exists hero_desktop_path text,
  add column if not exists hero_mobile_url text,
  add column if not exists hero_mobile_path text,
  add column if not exists hero_alt text not null default 'Portal Verde',
  add column if not exists hero_alignment text not null default 'left',
  add column if not exists hero_overlay boolean not null default true,
  add column if not exists hero_overlay_intensity integer not null default 75,
  add column if not exists hero_shadow_intensity integer not null default 75,
  add column if not exists hero_content_enabled boolean not null default true,
  add column if not exists hero_content_desktop boolean not null default true,
  add column if not exists hero_content_mobile boolean not null default true,
  add column if not exists hero_show_label boolean not null default true,
  add column if not exists hero_show_title boolean not null default true,
  add column if not exists hero_show_subtitle boolean not null default true,
  add column if not exists hero_show_description boolean not null default true,
  add column if not exists hero_show_price boolean not null default true,
  add column if not exists hero_show_installation_badge boolean not null default true,
  add column if not exists hero_show_primary_button boolean not null default true,
  add column if not exists hero_show_secondary_button boolean not null default true,
  add column if not exists hero_show_benefits boolean not null default true;

alter table public.home_page_settings
  drop constraint if exists home_page_settings_hero_alignment_check;

alter table public.home_page_settings
  add constraint home_page_settings_hero_alignment_check
  check (hero_alignment in ('left', 'center', 'right'));

alter table public.home_page_settings
  drop constraint if exists home_page_settings_hero_overlay_intensity_check;

alter table public.home_page_settings
  add constraint home_page_settings_hero_overlay_intensity_check
  check (hero_overlay_intensity between 0 and 90);

alter table public.home_page_settings
  drop constraint if exists home_page_settings_hero_shadow_intensity_check;

alter table public.home_page_settings
  add constraint home_page_settings_hero_shadow_intensity_check
  check (hero_shadow_intensity between 0 and 100);

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'home-content-images',
  'home-content-images',
  true,
  5242880,
  array[
    'image/jpeg',
    'image/png',
    'image/webp'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view home content images"
  on storage.objects;

create policy "Public can view home content images"
  on storage.objects
  for select
  to public
  using (
    bucket_id = 'home-content-images'
  );

drop policy if exists "Admins can upload home content images"
  on storage.objects;

create policy "Admins can upload home content images"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'home-content-images'
    and public.is_admin()
  );

drop policy if exists "Admins can update home content images"
  on storage.objects;

create policy "Admins can update home content images"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'home-content-images'
    and public.is_admin()
  )
  with check (
    bucket_id = 'home-content-images'
    and public.is_admin()
  );

drop policy if exists "Admins can delete home content images"
  on storage.objects;

create policy "Admins can delete home content images"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'home-content-images'
    and public.is_admin()
  );

notify pgrst, 'reload schema';

commit;