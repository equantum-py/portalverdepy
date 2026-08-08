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

alter table public.home_page_settings
  drop constraint if exists home_page_settings_hero_carousel_interval_check;

alter table public.home_page_settings
  add constraint home_page_settings_hero_carousel_interval_check
  check (hero_carousel_interval between 3000 and 30000);

create table if not exists public.home_hero_slides (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  desktop_url text,
  desktop_path text,
  mobile_url text,
  mobile_path text,
  alt_text text not null default 'Portal Verde',
  content_enabled boolean not null default true,
  content_desktop boolean not null default true,
  content_mobile boolean not null default true,
  show_label boolean not null default false,
  label text,
  show_title boolean not null default true,
  title text,
  show_subtitle boolean not null default false,
  subtitle text,
  show_description boolean not null default false,
  description text,
  show_price boolean not null default false,
  price_text text,
  show_installation_badge boolean not null default false,
  installation_badge_text text,
  show_primary_button boolean not null default false,
  primary_button_text text,
  primary_button_url text,
  primary_button_new_tab boolean not null default false,
  show_secondary_button boolean not null default false,
  secondary_button_text text,
  secondary_button_url text,
  secondary_button_new_tab boolean not null default false,
  show_benefits boolean not null default false,
  benefits jsonb not null default '[]'::jsonb,
  alignment text not null default 'left',
  overlay_enabled boolean not null default true,
  overlay_intensity integer not null default 60,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint home_hero_slides_sort_order_check check (sort_order >= 0),
  constraint home_hero_slides_alignment_check check (alignment in ('left', 'center', 'right')),
  constraint home_hero_slides_overlay_intensity_check check (overlay_intensity between 0 and 90)
);

create index if not exists home_hero_slides_active_order_idx
  on public.home_hero_slides (is_active, sort_order);

alter table public.home_hero_slides enable row level security;

drop policy if exists "Public can view active hero slides" on public.home_hero_slides;
create policy "Public can view active hero slides"
  on public.home_hero_slides
  for select
  to public
  using (is_active = true or public.is_admin());

drop policy if exists "Admins can insert hero slides" on public.home_hero_slides;
create policy "Admins can insert hero slides"
  on public.home_hero_slides
  for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "Admins can update hero slides" on public.home_hero_slides;
create policy "Admins can update hero slides"
  on public.home_hero_slides
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can delete hero slides" on public.home_hero_slides;
create policy "Admins can delete hero slides"
  on public.home_hero_slides
  for delete
  to authenticated
  using (public.is_admin());

insert into public.home_hero_slides (
  name,
  is_active,
  sort_order,
  desktop_url,
  desktop_path,
  mobile_url,
  mobile_path,
  alt_text,
  content_enabled,
  content_desktop,
  content_mobile,
  show_title,
  title,
  show_subtitle,
  subtitle,
  show_description,
  description,
  alignment,
  overlay_enabled,
  overlay_intensity
)
select
  'Diapositiva principal',
  coalesce(hero_enabled, true),
  0,
  hero_desktop_url,
  hero_desktop_path,
  hero_mobile_url,
  hero_mobile_path,
  coalesce(hero_alt, 'Portal Verde'),
  coalesce(hero_content_enabled, true),
  coalesce(hero_content_desktop, true),
  coalesce(hero_content_mobile, true),
  coalesce(hero_show_title, true),
  hero_title,
  coalesce(hero_show_subtitle, true),
  hero_subtitle,
  coalesce(hero_show_description, true),
  hero_description,
  coalesce(hero_alignment, 'left'),
  coalesce(hero_overlay, true),
  coalesce(hero_overlay_intensity, 60)
from public.home_page_settings
where id = true
  and not exists (
    select 1 from public.home_hero_slides
  );

notify pgrst, 'reload schema';

commit;
