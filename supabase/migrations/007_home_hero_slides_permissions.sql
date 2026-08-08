begin;

grant usage on schema public to anon, authenticated;

grant select on table public.home_hero_slides to anon;
grant select, insert, update, delete on table public.home_hero_slides to authenticated;

alter table public.home_hero_slides enable row level security;

drop policy if exists "Public can view active hero slides" on public.home_hero_slides;
create policy "Public can view active hero slides"
  on public.home_hero_slides
  for select
  to anon, authenticated
  using (
    is_active = true
    or public.is_admin()
  );

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

notify pgrst, 'reload schema';

commit;
