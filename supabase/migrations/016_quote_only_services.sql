begin;

-- Permite servicios que se cotizan a medida, sin inventar un precio fijo.
alter table public.products
  drop constraint if exists products_price_positive_check;

alter table public.products
  add constraint products_price_positive_check
  check (
    price > 0
    or (price = 0 and unit in ('servicio', 'visita'))
  );

commit;
