begin;
alter table public.home_page_settings
  add column if not exists logo_desktop_path text,
  add column if not exists logo_mobile_path text,
  add column if not exists whatsapp_text text not null default 'Consultar por WhatsApp',
  add column if not exists whatsapp_url text not null default 'https://wa.me/595981077600',
  add column if not exists hero_enabled boolean not null default true,
  add column if not exists hero_title text not null default 'Transformamos tu espacio en un jardín que se disfruta',
  add column if not exists hero_subtitle text not null default 'Instalación profesional garantizada',
  add column if not exists hero_description text not null default 'Venta e instalación de césped natural con asesoramiento profesional en Asunción y Gran Asunción.',
  add column if not exists hero_desktop_url text not null default '/images/banners/slide-2-desktop.webp',
  add column if not exists hero_desktop_path text,
  add column if not exists hero_mobile_url text not null default '/images/banners/slide-2-desktop.webp',
  add column if not exists hero_mobile_path text,
  add column if not exists hero_alt text not null default 'Servicio profesional de jardinería y mantenimiento de césped',
  add column if not exists hero_alignment text not null default 'left' check (hero_alignment in ('left','center','right')),
  add column if not exists hero_overlay boolean not null default true,
  add column if not exists hero_overlay_intensity integer not null default 75 check (hero_overlay_intensity between 0 and 90);
alter table public.home_navigation_items add column if not exists link_type text not null default 'internal', add column if not exists target_id uuid, add column if not exists new_tab boolean not null default false;
alter table public.home_service_tags add column if not exists icon text not null default 'Leaf';
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('home-content-images','home-content-images',true,5242880,array['image/jpeg','image/png','image/webp','image/svg+xml']) on conflict(id) do update set public=excluded.public,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
drop policy if exists "Public read home content images" on storage.objects;
create policy "Public read home content images" on storage.objects for select to public using(bucket_id='home-content-images');
drop policy if exists "Admins upload home content images" on storage.objects;
create policy "Admins upload home content images" on storage.objects for insert to authenticated with check(bucket_id='home-content-images' and public.is_admin());
drop policy if exists "Admins update home content images" on storage.objects;
create policy "Admins update home content images" on storage.objects for update to authenticated using(bucket_id='home-content-images' and public.is_admin()) with check(bucket_id='home-content-images' and public.is_admin());
drop policy if exists "Admins delete home content images" on storage.objects;
create policy "Admins delete home content images" on storage.objects for delete to authenticated using(bucket_id='home-content-images' and public.is_admin());
commit;
