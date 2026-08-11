begin;

-- La tienda y la Home consultan el Vivero Digital sin sesión de administrador.
-- RLS debe permitir únicamente la lectura pública de plantas activas y publicadas.
grant select on public.digital_nursery_items to anon, authenticated;

drop policy if exists "Public can read active published nursery items" on public.digital_nursery_items;
create policy "Public can read active published nursery items"
on public.digital_nursery_items
for select
to anon, authenticated
using (is_active = true and is_published = true);

-- Mantener la política administrativa existente para altas, bajas y edición.
notify pgrst, 'reload schema';

commit;
