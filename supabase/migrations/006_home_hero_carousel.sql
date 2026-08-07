begin;

alter table public.home_page_settings
  add column if not exists hero_carousel_enabled boolean not null default true,
  add column if not exists hero_carousel_autoplay boolean not null default true,
  add column if not exists hero_carousel_interval integer not null default 5000,
  add column if not exists hero_carousel_manual_navigation boolean not null default true,
  add column if not exists hero_carousel_show_arrows boolean not null default true,
  add column if not exists hero_carousel_show_dots boolean not null default true,
  add column if not exists hero_carousel_pause_on_hover boolean not null default true,
  add column if not exists hero_carousel_loop boolean not null default true;

alter table public.home_page_settings drop constraint if exists home_page_settings_hero_carousel_interval_check;
alter table public.home_page_settings add constraint home_page_settings_hero_carousel_interval_check
  check (hero_carousel_interval between 3000 and 30000);

create table if not exists public.home_hero_slides (
  id uuid primary key default gen_random_uuid(), name text not null, is_active boolean not null default true,
  sort_order integer not null default 0 check (sort_order >= 0),
  desktop_url text, desktop_path text, mobile_url text, mobile_path text,
  alt_text text not null default 'Portal Verde',
  content_enabled boolean not null default true, content_desktop boolean not null default true, content_mobile boolean not null default true,
  show_label boolean not null default true, label text,
  show_title boolean not null default true, title text,
  show_subtitle boolean not null default true, subtitle text,
  show_description boolean not null default true, description text,
  show_price boolean not null default false, price_text text,
  show_installation_badge boolean not null default false, installation_badge_text text,
  show_primary_button boolean not null default false, primary_button_text text, primary_button_url text, primary_button_new_tab boolean not null default false,
  show_secondary_button boolean not null default false, secondary_button_text text, secondary_button_url text, secondary_button_new_tab boolean not null default false,
  show_benefits boolean not null default false, benefits jsonb not null default '[]'::jsonb,
  alignment text not null default 'left' check (alignment in ('left','center','right')),
  overlay_enabled boolean not null default true, overlay_intensity integer not null default 60 check (overlay_intensity between 0 and 90),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create index if not exists home_hero_slides_sort_order_idx on public.home_hero_slides(sort_order);

insert into public.home_hero_slides (
  name, sort_order, desktop_url, desktop_path, mobile_url, mobile_path,
  content_enabled, content_desktop, content_mobile, show_label, label, show_title, title,
  show_subtitle, subtitle, show_description, description, show_price, price_text,
  show_installation_badge, installation_badge_text, show_primary_button, primary_button_text,
  primary_button_url, primary_button_new_tab, show_secondary_button, secondary_button_text,
  secondary_button_url, show_benefits, benefits, overlay_enabled, overlay_intensity
)
select 'Diapositiva principal', 0, hero_desktop_url, hero_desktop_path, hero_mobile_url, hero_mobile_path,
  hero_content_enabled, hero_content_desktop, hero_content_mobile, hero_show_label, 'Instalación profesional garantizada',
  hero_show_title, 'Transformamos tu espacio en un jardín que se disfruta', hero_show_subtitle, 'Césped natural de primera calidad',
  hero_show_description, 'Venta e instalación de césped natural con asesoramiento profesional en Asunción y Gran Asunción.',
  hero_show_price, 'Gs. 31.000 m²', hero_show_installation_badge, 'Instalación incluida',
  hero_show_primary_button, 'Solicitar presupuesto', 'https://wa.me/595981077600', true,
  hero_show_secondary_button, 'Ver catálogo', '/shop', hero_show_benefits,
  '["Asesoramiento personalizado","Trabajo garantizado","Atención profesional"]'::jsonb,
  true, least(hero_shadow_intensity, 90)
from public.home_page_settings
where id = true and not exists (select 1 from public.home_hero_slides);

alter table public.home_hero_slides enable row level security;
drop policy if exists "Public read hero slides" on public.home_hero_slides;
create policy "Public read hero slides" on public.home_hero_slides for select to public using (true);
drop policy if exists "Admins manage hero slides" on public.home_hero_slides;
create policy "Admins manage hero slides" on public.home_hero_slides for all to authenticated using (public.is_admin()) with check (public.is_admin());
grant select on public.home_hero_slides to anon, authenticated;
grant insert, update, delete on public.home_hero_slides to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('home-content-images', 'home-content-images', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public read home content images" on storage.objects;
create policy "Public read home content images" on storage.objects for select to public using (bucket_id = 'home-content-images');
drop policy if exists "Admins insert home content images" on storage.objects;
create policy "Admins insert home content images" on storage.objects for insert to authenticated with check (bucket_id = 'home-content-images' and public.is_admin());
drop policy if exists "Admins update home content images" on storage.objects;
create policy "Admins update home content images" on storage.objects for update to authenticated using (bucket_id = 'home-content-images' and public.is_admin()) with check (bucket_id = 'home-content-images' and public.is_admin());
drop policy if exists "Admins delete home content images" on storage.objects;
create policy "Admins delete home content images" on storage.objects for delete to authenticated using (bucket_id = 'home-content-images' and public.is_admin());

commit;
