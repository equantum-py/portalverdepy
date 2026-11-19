begin;

alter table public.digital_nursery_items
  add column public_price bigint,
  add column promotional_price bigint,
  add column promotion_enabled boolean not null default false,
  add constraint nursery_public_price_range
    check (public_price between 1 and 9999999999),
  add constraint nursery_promotional_price_range
    check (promotional_price between 1 and 9999999999),
  add constraint nursery_active_promotion
    check (
      not promotion_enabled or (
        public_price is not null
        and promotional_price is not null
        and promotional_price < public_price
      )
    );

-- RLS sigue filtrando las filas. Los permisos de columna protegen los precios internos.
revoke select on public.digital_nursery_items from public, anon, authenticated;
grant select (
  id, name, variant, category, source_url, reference_image_url, notes,
  is_active, is_published, sort_order, created_at, updated_at,
  description, image_url, storage_path, whatsapp_message,
  public_price, promotional_price, promotion_enabled
) on public.digital_nursery_items to anon, authenticated;

-- El editor autorizado conserva el acceso al precio interno.
create function public.get_admin_nursery_item(item_id uuid)
returns setof public.digital_nursery_items
language sql stable security definer
set search_path = ''
as $$
  select item.*
  from public.digital_nursery_items as item
  where item.id = item_id and public.is_admin();
$$;

revoke all on function public.get_admin_nursery_item(uuid) from public, anon, authenticated;
grant execute on function public.get_admin_nursery_item(uuid) to authenticated;

notify pgrst, 'reload schema';

commit;
