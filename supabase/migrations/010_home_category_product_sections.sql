begin;

alter table public.home_sections_config
  add column if not exists section_type text not null default 'standard',
  add column if not exists category_slug text,
  add column if not exists banner_desktop_url text,
  add column if not exists banner_desktop_path text,
  add column if not exists banner_mobile_url text,
  add column if not exists banner_mobile_path text,
  add column if not exists product_limit integer not null default 4,
  add column if not exists show_view_all boolean not null default true;

alter table public.home_sections_config
  drop constraint if exists home_sections_config_section_type_check;

alter table public.home_sections_config
  add constraint home_sections_config_section_type_check
  check (section_type in ('standard', 'banner-products'));

alter table public.home_sections_config
  drop constraint if exists home_sections_config_product_limit_check;

alter table public.home_sections_config
  add constraint home_sections_config_product_limit_check
  check (product_limit between 1 and 8);

notify pgrst, 'reload schema';

commit;
