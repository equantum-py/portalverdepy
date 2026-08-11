begin;

alter table public.products
  drop constraint if exists products_unit_check;

alter table public.products
  add constraint products_unit_check
  check (
    unit in (
      'unidad',
      'm²',
      'metro lineal',
      'docena',
      'kg',
      'servicio',
      'visita'
    )
  );

commit;
