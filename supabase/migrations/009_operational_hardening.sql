begin;

-- Asegura las funciones de autorización usadas por todo el panel.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and is_active = true
  );
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin','editor') and is_active = true
  );
$$;

grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_staff() to authenticated;

-- El contenido editorial puede ser gestionado por admin/editor.
grant select, insert, update on public.categories, public.products, public.projects,
  public.site_settings, public.home_sections, public.banners, public.quotes,
  public.quote_items, public.activity_logs to authenticated;

-- Eliminación destructiva de contenido editorial: se controla también por RLS.
grant delete on public.categories, public.products, public.projects,
  public.site_settings, public.home_sections, public.banners, public.quotes,
  public.quote_items to authenticated;

-- Perfiles: todos los miembros del staff pueden leer; solo admin modifica.
grant select on public.profiles to authenticated;
grant insert, update, delete on public.profiles to authenticated;

-- Reemplazar políticas para evitar inconsistencias entre instalaciones antiguas.
drop policy if exists "Staff can read all profiles" on public.profiles;
create policy "Staff can read all profiles" on public.profiles
for select to authenticated using (public.is_staff());

drop policy if exists "Admins can manage profiles" on public.profiles;
create policy "Admins can manage profiles" on public.profiles
for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Logs: staff crea/lee, no modifica historial.
drop policy if exists "Staff can read logs" on public.activity_logs;
create policy "Staff can read logs" on public.activity_logs
for select to authenticated using (public.is_staff());

drop policy if exists "Staff can create logs" on public.activity_logs;
create policy "Staff can create logs" on public.activity_logs
for insert to authenticated with check (public.is_staff());

-- Índices operativos.
create index if not exists projects_published_sort_idx on public.projects(is_published, sort_order);
create index if not exists quotes_status_created_idx on public.quotes(status, created_at desc);
create index if not exists activity_logs_created_idx on public.activity_logs(created_at desc);
create index if not exists profiles_role_active_idx on public.profiles(role, is_active);

notify pgrst, 'reload schema';
commit;
