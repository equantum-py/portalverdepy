begin;

alter table public.home_page_settings
  add column if not exists hero_desktop_url text not null default '/images/banners/slide-2-desktop.webp',
  add column if not exists hero_desktop_path text not null default '',
  add column if not exists hero_mobile_url text not null default '/images/banners/slide-2-mobile.webp',
  add column if not exists hero_mobile_path text not null default '',
  add column if not exists hero_shadow_intensity integer not null default 75 check (hero_shadow_intensity between 0 and 100),
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

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('hero-images', 'hero-images', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view hero images" on storage.objects;
create policy "Public can view hero images" on storage.objects
  for select to public using (bucket_id = 'hero-images');
drop policy if exists "Admins can upload hero images" on storage.objects;
create policy "Admins can upload hero images" on storage.objects
  for insert to authenticated with check (bucket_id = 'hero-images' and public.is_admin());
drop policy if exists "Admins can update hero images" on storage.objects;
create policy "Admins can update hero images" on storage.objects
  for update to authenticated using (bucket_id = 'hero-images' and public.is_admin()) with check (bucket_id = 'hero-images' and public.is_admin());
drop policy if exists "Admins can delete hero images" on storage.objects;
create policy "Admins can delete hero images" on storage.objects
  for delete to authenticated using (bucket_id = 'hero-images' and public.is_admin());

commit;
