begin;

alter table public.home_page_settings
  add column if not exists hero_content_enabled boolean not null default true,
  add column if not exists hero_content_desktop boolean not null default true,
  add column if not exists hero_content_mobile boolean not null default true,
  add column if not exists hero_show_label boolean not null default true,
  add column if not exists hero_show_title boolean not null default true,
  add column if not exists hero_show_subtitle boolean not null default false,
  add column if not exists hero_show_description boolean not null default true,
  add column if not exists hero_show_price boolean not null default true,
  add column if not exists hero_show_installation_badge boolean not null default true,
  add column if not exists hero_show_primary_button boolean not null default true,
  add column if not exists hero_show_secondary_button boolean not null default true,
  add column if not exists hero_show_benefits boolean not null default true;

commit;
