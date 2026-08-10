begin;

alter table public.home_sections_config
  add column if not exists mobile_columns integer not null default 2,
  add column if not exists mobile_swipe boolean not null default false,
  add column if not exists mobile_show_progress boolean not null default false;

alter table public.home_sections_config
  drop constraint if exists home_sections_config_mobile_columns_check;

alter table public.home_sections_config
  add constraint home_sections_config_mobile_columns_check
  check (mobile_columns in (1, 2));

notify pgrst, 'reload schema';

commit;
