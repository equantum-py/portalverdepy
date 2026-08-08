begin;

create or replace function public.merge_home_page_settings_partial_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  current_row public.home_page_settings%rowtype;
begin
  select *
  into current_row
  from public.home_page_settings
  where id = new.id;

  if found then
    new := jsonb_populate_record(
      new,
      to_jsonb(current_row) || jsonb_strip_nulls(to_jsonb(new))
    );
  end if;

  return new;
end;
$$;

drop trigger if exists merge_home_page_settings_partial_insert_trigger
on public.home_page_settings;

create trigger merge_home_page_settings_partial_insert_trigger
before insert on public.home_page_settings
for each row
execute function public.merge_home_page_settings_partial_insert();

update public.home_page_settings
set
  hero_carousel_enabled = true,
  hero_carousel_autoplay = true,
  hero_carousel_interval = 3000,
  hero_carousel_manual_navigation = true,
  hero_carousel_show_arrows = true,
  hero_carousel_show_dots = true,
  hero_carousel_pause_on_hover = true,
  hero_carousel_loop = true,
  updated_at = now()
where id = true;

notify pgrst, 'reload schema';

commit;
