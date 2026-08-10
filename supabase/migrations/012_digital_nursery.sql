begin;

create table if not exists public.digital_nursery_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  variant text not null default '',
  reference_price numeric(12,2) not null default 0,
  portal_price numeric(12,2),
  category text not null default 'Planta',
  source_url text,
  reference_image_url text,
  notes text not null default '',
  is_active boolean not null default true,
  is_published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(name)
);

create index if not exists digital_nursery_items_active_idx
  on public.digital_nursery_items(is_active);

create index if not exists digital_nursery_items_category_idx
  on public.digital_nursery_items(category);

alter table public.digital_nursery_items enable row level security;

drop policy if exists "Admins can manage digital nursery" on public.digital_nursery_items;
create policy "Admins can manage digital nursery"
on public.digital_nursery_items
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

grant select, insert, update, delete
on public.digital_nursery_items
to authenticated;

grant select, insert, update, delete
on public.digital_nursery_items
to service_role;

insert into public.digital_nursery_items (name, variant, reference_price, category, source_url, sort_order)
values
  ('Potus Nacional Grande', 'Grande', 450000, 'Planta', 'https://www.decogarden.com.py/producto/potus-nacional-grande', 1),
  ('Potus Nacional Mediano', 'Mediano', 90000, 'Planta', 'https://www.decogarden.com.py/producto/potus-nacional-mediano', 2),
  ('Potus Nacional Chico', 'Chico', 7500, 'Planta', 'https://www.decogarden.com.py/producto/potus-nacional-chico', 3),
  ('Bouxinha Brasilera Grande', 'Grande', 225000, 'Planta', 'https://www.decogarden.com.py/producto/bouxinha-brasilera-grande', 4),
  ('Bouxinha Brasilera Mediano', 'Mediano', 120000, 'Planta', 'https://www.decogarden.com.py/producto/bouxinha-brasilera-mediano', 5),
  ('Bouxinha Brasilera Chico', 'Chico', 90000, 'Planta', 'https://www.decogarden.com.py/producto/bouxinha-brasilera-chico', 6),
  ('Calathea Nacional Tamaño Unico', 'Tamaño Unico', 75000, 'Planta', 'https://www.decogarden.com.py/producto/calathea-nacional-tamano-unico', 7),
  ('Costilla De Adan Grande', 'Grande', 375000, 'Planta', 'https://www.decogarden.com.py/producto/costilla-de-adan-grande', 8),
  ('Costilla De Adan Mediano', 'Mediano', 150000, 'Planta', 'https://www.decogarden.com.py/producto/costilla-de-adan-mediano', 9),
  ('Costilla De Adan Chico', 'Chico', 75000, 'Planta', 'https://www.decogarden.com.py/producto/costilla-de-adan-chico', 10),
  ('Heliconia Grande', 'Grande', 300000, 'Planta', 'https://www.decogarden.com.py/producto/heliconia-grande', 11),
  ('Heliconia Mediano', 'Mediano', 120000, 'Planta', 'https://www.decogarden.com.py/producto/heliconia-mediano', 12),
  ('Heliconia Chico', 'Chico', 75000, 'Planta', 'https://www.decogarden.com.py/producto/heliconia-chico', 13),
  ('Cala Negra Grande', 'Grande', 225000, 'Planta', 'https://www.decogarden.com.py/producto/cala-negra-grande', 14),
  ('Cala Negra Mediano', 'Mediano', 90000, 'Planta', 'https://www.decogarden.com.py/producto/cala-negra-mediano', 15),
  ('Alocacia Grande', 'Grande', 135000, 'Planta', 'https://www.decogarden.com.py/producto/alocacia-grande', 16),
  ('Alocacia Mediano', 'Mediano', 75000, 'Planta', 'https://www.decogarden.com.py/producto/alocacia-mediano', 17),
  ('Alocacia Chico', 'Chico', 60000, 'Planta', 'https://www.decogarden.com.py/producto/alocacia-chico', 18),
  ('Pandurata Nacional Grande', 'Grande', 225000, 'Planta', 'https://www.decogarden.com.py/producto/pandurata-nacional-grande', 19),
  ('Pandurata Nacional Mediano', 'Mediano', 120000, 'Planta', 'https://www.decogarden.com.py/producto/pandurata-nacional-mediano', 20),
  ('Pandurata Nacional Chico', 'Chico', 60000, 'Planta', 'https://www.decogarden.com.py/producto/pandurata-nacional-chico', 21),
  ('Zamioculca Grande', 'Grande', 225000, 'Planta', 'https://www.decogarden.com.py/producto/zamioculca-grande', 22),
  ('Zamioculca Mediano', 'Mediano', 150000, 'Planta', 'https://www.decogarden.com.py/producto/zamioculca-mediano', 23),
  ('Zamioculca Chico', 'Chico', 60000, 'Planta', 'https://www.decogarden.com.py/producto/zamioculca-chico', 24),
  ('Catalea Zebrina Talle Unico', 'Talle Unico', 150000, 'Planta', 'https://www.decogarden.com.py/producto/catalea-zebrina-talle-unico', 25),
  ('Amaranta Lila Talle Unico', 'Talle Unico', 150000, 'Planta', 'https://www.decogarden.com.py/producto/amaranta-lila-talle-unico', 26),
  ('Amaranta Verde Talle Unico', 'Talle Unico', 150000, 'Planta', 'https://www.decogarden.com.py/producto/amaranta-verde-talle-unico', 27),
  ('Palmera Areka Bambu Grande', 'Grande', 600000, 'Planta', 'https://www.decogarden.com.py/producto/palmera-areka-bambu-grande', 28),
  ('Palmera Areka Bambu Mediano', 'Mediano', 300000, 'Planta', 'https://www.decogarden.com.py/producto/palmera-areka-bambu-mediano', 29),
  ('Palmera Areka Bambu Chico', 'Chico', 180000, 'Planta', 'https://www.decogarden.com.py/producto/palmera-areka-bambu-chico', 30),
  ('Pino Cipress Grande', 'Grande', 375000, 'Planta', 'https://www.decogarden.com.py/producto/pino-cipress-grande', 31),
  ('Pino Cipress Mediano', 'Mediano', 225000, 'Planta', 'https://www.decogarden.com.py/producto/pino-cipress-mediano', 32),
  ('Lantana Talle Unico', 'Talle Unico', 24000, 'Planta', 'https://www.decogarden.com.py/producto/lantana-talle-unico', 33),
  ('Santa Rita Enana Grande', 'Grande', 180000, 'Planta', 'https://www.decogarden.com.py/producto/santa-rita-enana-grande', 34),
  ('Santa Rita Enana Mediano', 'Mediano', 120000, 'Planta', 'https://www.decogarden.com.py/producto/santa-rita-enana-mediano', 35),
  ('Santa Rita Enana Chico', 'Chico', 37500, 'Planta', 'https://www.decogarden.com.py/producto/santa-rita-enana-chico', 36),
  ('Achira Talle Unico', 'Talle Unico', 37500, 'Planta', 'https://www.decogarden.com.py/producto/achira-talle-unico', 37),
  ('Cenizo Talle Unico', 'Talle Unico', 60000, 'Planta', 'https://www.decogarden.com.py/producto/cenizo-talle-unico', 38),
  ('Croton Enano Nacional Mediano', 'Mediano', 150000, 'Planta', 'https://www.decogarden.com.py/producto/croton-enano-nacional-mediano', 39),
  ('Croton Enano Nacional Chico', 'Chico', 37500, 'Planta', 'https://www.decogarden.com.py/producto/croton-enano-nacional-chico', 40),
  ('Pino Columna Grande', 'Grande', 1800000, 'Planta', 'https://www.decogarden.com.py/producto/pino-columna-grande', 41),
  ('Pino Columna Mediano', 'Mediano', 750000, 'Planta', 'https://www.decogarden.com.py/producto/pino-columna-mediano', 42),
  ('Pino Columna Chico', 'Chico', 375000, 'Planta', 'https://www.decogarden.com.py/producto/pino-columna-chico', 43),
  ('Clusia Matizada Nacional Mediano', 'Mediano', 120000, 'Planta', 'https://www.decogarden.com.py/producto/clusia-matizada-nacional-mediano', 44),
  ('Clusia Matizada Nacional Chico', 'Chico', 37500, 'Planta', 'https://www.decogarden.com.py/producto/clusia-matizada-nacional-chico', 45),
  ('Clusia Verde Mediano', 'Mediano', 120000, 'Planta', 'https://www.decogarden.com.py/producto/clusia-verde-mediano', 46),
  ('Clusia Verde Chico', 'Chico', 37500, 'Planta', 'https://www.decogarden.com.py/producto/clusia-verde-chico', 47),
  ('Palmera Real Grande', 'Grande', 1200000, 'Planta', 'https://www.decogarden.com.py/producto/palmera-real-grande', 48),
  ('Palmera Real Mediano', 'Mediano', 450000, 'Planta', 'https://www.decogarden.com.py/producto/palmera-real-mediano', 49),
  ('Palmera Real Chico', 'Chico', 300000, 'Planta', 'https://www.decogarden.com.py/producto/palmera-real-chico', 50),
  ('Banano Viajero Nacional Grande', 'Grande', 1050000, 'Planta', 'https://www.decogarden.com.py/producto/banano-viajero-nacional-grande', 51),
  ('Banano Viajero Nacional Mediano', 'Mediano', 375000, 'Planta', 'https://www.decogarden.com.py/producto/banano-viajero-nacional-mediano', 52),
  ('Banano Viajero Nacional Chico', 'Chico', 120000, 'Planta', 'https://www.decogarden.com.py/producto/banano-viajero-nacional-chico', 53),
  ('Coco Rafi Grande', 'Grande', 180000, 'Planta', 'https://www.decogarden.com.py/producto/coco-rafi-grande', 54),
  ('Coco Rafi Chico', 'Chico', 120000, 'Planta', 'https://www.decogarden.com.py/producto/coco-rafi-chico', 55),
  ('Palmera Azul Grande', 'Grande', 2250000, 'Planta', 'https://www.decogarden.com.py/producto/palmera-azul-grande', 56),
  ('Palmera Azul Chico', 'Chico', 450000, 'Planta', 'https://www.decogarden.com.py/producto/palmera-azul-chico', 57),
  ('Wembe Brasilero Grande', 'Grande', 165000, 'Planta', 'https://www.decogarden.com.py/producto/wembe-brasilero-grande', 58),
  ('Wembe Brasilero Mediano', 'Mediano', 120000, 'Planta', 'https://www.decogarden.com.py/producto/wembe-brasilero-mediano', 59),
  ('Wembe Brasilero Chico', 'Chico', 90000, 'Planta', 'https://www.decogarden.com.py/producto/wembe-brasilero-chico', 60),
  ('Alocacia Corazon Grande', 'Grande', 150000, 'Planta', 'https://www.decogarden.com.py/producto/alocacia-corazon-grande', 61),
  ('Alocacia Corazon Chico', 'Chico', 60000, 'Planta', 'https://www.decogarden.com.py/producto/alocacia-corazon-chico', 62),
  ('Iris Grande', 'Grande', 60000, 'Planta', 'https://www.decogarden.com.py/producto/iris-grande', 63),
  ('Iris Chico', 'Chico', 37500, 'Planta', 'https://www.decogarden.com.py/producto/iris-chico', 64),
  ('Xanandu Grande', 'Grande', 300000, 'Planta', 'https://www.decogarden.com.py/producto/xanandu-grande', 65),
  ('Xanandu Chico', 'Chico', 180000, 'Planta', 'https://www.decogarden.com.py/producto/xanandu-chico', 66),
  ('Palmera Cola De Pez Grande', 'Grande', 375000, 'Planta', 'https://www.decogarden.com.py/producto/palmera-cola-de-pez-grande', 67),
  ('Palmera Cola De Pez Mediano', 'Mediano', 165000, 'Planta', 'https://www.decogarden.com.py/producto/palmera-cola-de-pez-mediano', 68),
  ('Ave De Paraiso Grande', 'Grande', 375000, 'Planta', 'https://www.decogarden.com.py/producto/ave-de-paraiso-grande', 69),
  ('Ave De Paraiso Chico', 'Chico', 165000, 'Planta', 'https://www.decogarden.com.py/producto/ave-de-paraiso-chico', 70),
  ('Oreja De Elefante Grande', 'Grande', 180000, 'Planta', 'https://www.decogarden.com.py/producto/oreja-de-elefante-grande', 71),
  ('Oreja De Elefante Chico', 'Chico', 75000, 'Planta', 'https://www.decogarden.com.py/producto/oreja-de-elefante-chico', 72),
  ('Jardineria 60x40x30', '', 146250, 'Jardinería / accesorio', 'https://www.decogarden.com.py/producto/jardineria-60x40x30', 73),
  ('Jardineria 70x40x20', '', 157500, 'Jardinería / accesorio', 'https://www.decogarden.com.py/producto/jardineria-70x40x20', 74),
  ('Jardineria 80x30x20', '', 157500, 'Jardinería / accesorio', 'https://www.decogarden.com.py/producto/jardineria-80x30x20', 75),
  ('Jardineria 80x30x30', '', 168750, 'Jardinería / accesorio', 'https://www.decogarden.com.py/producto/jardineria-80x30x30', 76),
  ('Jardineria 80x50x20', '', 202500, 'Jardinería / accesorio', 'https://www.decogarden.com.py/producto/jardineria-80x50x20', 77),
  ('Jardineria 1m x 20x20', '', 157500, 'Jardinería / accesorio', 'https://www.decogarden.com.py/producto/jardineria-1m-x-20x20', 78),
  ('Jardineria 1m x 30x30', '', 213750, 'Jardinería / accesorio', 'https://www.decogarden.com.py/producto/jardineria-1m-x-30x30', 79),
  ('Mortero 30 CM', '', 67500, 'Jardinería / accesorio', 'https://www.decogarden.com.py/producto/mortero-30-cm', 80),
  ('Mortero 40 CM', '', 78750, 'Jardinería / accesorio', 'https://www.decogarden.com.py/producto/mortero-40-cm', 81),
  ('Mortero 50 CM', '', 90000, 'Jardinería / accesorio', 'https://www.decogarden.com.py/producto/mortero-50-cm', 82),
  ('Gota 40x35', '', 123750, 'Jardinería / accesorio', 'https://www.decogarden.com.py/producto/gota-40x35', 83),
  ('Gota 55x35', '', 157500, 'Jardinería / accesorio', 'https://www.decogarden.com.py/producto/gota-55x35', 84),
  ('Gota 70x35', '', 180000, 'Jardinería / accesorio', 'https://www.decogarden.com.py/producto/gota-70x35', 85),
  ('Bolsa arpillera de canto rodado coquito (40 Kg.)', '', 30000, 'Jardinería / accesorio', 'https://www.decogarden.com.py/producto/bolsa-arpillera-de-canto-rodado-coquito-40-kg', 86),
  ('Bolsa pequeña de canto rodado coquito (5 Kg.)', '', 7500, 'Jardinería / accesorio', 'https://www.decogarden.com.py/producto/bolsa-pequena-de-canto-rodado-coquito-5-kg', 87),
  ('Bolsa arpillera de canto rodado mediano (40 Kg.)', '', 30000, 'Jardinería / accesorio', 'https://www.decogarden.com.py/producto/bolsa-arpillera-de-canto-rodado-mediano-40-kg', 88),
  ('Bolsa pequeña de canto rodado mediano (5 Kg.)', '', 7500, 'Jardinería / accesorio', 'https://www.decogarden.com.py/producto/bolsa-pequena-de-canto-rodado-mediano-5-kg', 89),
  ('Bolsa arpillera de canto rodado grande (40 Kg.)', '', 30000, 'Jardinería / accesorio', 'https://www.decogarden.com.py/producto/bolsa-arpillera-de-canto-rodado-grande-40-kg', 90),
  ('Bolsa pequeña de canto rodado grande (5 Kg.)', '', 7500, 'Jardinería / accesorio', 'https://www.decogarden.com.py/producto/bolsa-pequena-de-canto-rodado-grande-5-kg', 91),
  ('Corteza de pino (8 Kg.)', '', 142500, 'Jardinería / accesorio', 'https://www.decogarden.com.py/producto/corteza-de-pino-8-kg', 92)
on conflict (name) do update
set
  variant = excluded.variant,
  reference_price = excluded.reference_price,
  category = excluded.category,
  source_url = excluded.source_url,
  sort_order = excluded.sort_order,
  updated_at = now();

notify pgrst, 'reload schema';

commit;
