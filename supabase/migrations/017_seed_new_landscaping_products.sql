begin;

-- Nuevos productos solicitados. Se crean desactivados para revisión antes de publicación.
-- Se reutilizan las categorías existentes Paisajismo y Servicios.

insert into public.products (
  category_id, name, slug, description, short_description, full_description,
  seo_description, seo_title, seo_keywords, price, currency, unit,
  min_order_quantity, benefits, recommendations, is_active, is_featured,
  in_stock, main_image_alt, canonical_url
)
select
  c.id,
  v.name,
  v.slug,
  v.description,
  v.short_description,
  v.full_description,
  v.seo_description,
  v.seo_title,
  v.seo_keywords,
  v.price,
  'PYG',
  v.unit,
  v.min_order_quantity,
  v.benefits,
  v.recommendations,
  false,
  false,
  true,
  v.main_image_alt,
  'https://www.portalverdepy.com/catalogo/' || v.slug
from (
  values
    (
      'paisajismo', 'Piedra Arenisca N° 4', 'piedra-arenisca-n-4',
      'Piedra arenisca N° 4 para proyectos de paisajismo, jardines, senderos y terminaciones decorativas.',
      'Piedra arenisca N° 4 para jardines, senderos y proyectos de paisajismo.',
      'Piedra Arenisca N° 4 seleccionada para paisajismo y decoración exterior. Ideal para aportar textura natural en jardines, senderos, bordes y diferentes composiciones decorativas. Venta por kilogramo. Consultá disponibilidad y cantidad necesaria para tu proyecto.',
      'Comprá Piedra Arenisca N° 4 por kilogramo en Portal Verde Paraguay. Ideal para paisajismo, jardines, senderos y decoración exterior.',
      'Piedra Arenisca N° 4 por kg | Portal Verde',
      array['piedra arenisca','piedra arenisca n 4','piedras decorativas','piedras para jardin','paisajismo paraguay','portal verde']::text[],
      100000::numeric, 'kg', 1::numeric,
      '["Terminación natural para jardines y espacios exteriores","Ideal para paisajismo, senderos y bordes","Venta por kilogramo según necesidad del proyecto"]'::jsonb,
      '["Consultá la cantidad recomendada antes de realizar tu pedido","La tonalidad y forma pueden variar por tratarse de piedra natural"]'::jsonb,
      'Piedra Arenisca N° 4 para paisajismo y jardines'
    ),
    (
      'paisajismo', 'Piedra Canto Rodado', 'piedra-canto-rodado',
      'Piedra canto rodado decorativa para jardines, canteros, senderos y proyectos de paisajismo.',
      'Canto rodado decorativo para jardines, canteros y senderos. Venta por kg.',
      'Piedra Canto Rodado para crear terminaciones naturales en jardines, canteros, senderos y espacios exteriores. Su apariencia redondeada permite integrarla fácilmente en distintos estilos de paisajismo. Venta por kilogramo.',
      'Piedra Canto Rodado por kilogramo en Portal Verde Paraguay. Para jardines, canteros, senderos y proyectos de paisajismo.',
      'Piedra Canto Rodado por kg | Portal Verde',
      array['piedra canto rodado','canto rodado jardin','piedras decorativas','piedras para jardin','paisajismo paraguay']::text[],
      35000::numeric, 'kg', 1::numeric,
      '["Aporta una terminación natural y decorativa","Apta para jardines, canteros y senderos","Venta por kilogramo"]'::jsonb,
      '["Calculá previamente la superficie a cubrir","Consultá disponibilidad antes de confirmar el pedido"]'::jsonb,
      'Piedra Canto Rodado decorativa para jardín'
    ),
    (
      'paisajismo', 'Piedra Marmolada Blanca 40 kg', 'piedra-marmolada-blanca-40-kg',
      'Piedra marmolada blanca decorativa en presentación de 40 kg para jardines, maceteros, canteros y paisajismo.',
      'Piedra marmolada blanca decorativa en presentación de 40 kg.',
      'Piedra Marmolada Blanca en presentación de 40 kg, pensada para terminaciones decorativas en jardines, maceteros, canteros, senderos y otros espacios exteriores. Su color claro ayuda a generar contraste visual y una terminación limpia.',
      'Piedra Marmolada Blanca de 40 kg en Portal Verde Paraguay. Ideal para jardines, maceteros, canteros, senderos y paisajismo.',
      'Piedra Marmolada Blanca 40 kg | Portal Verde',
      array['piedra marmolada blanca','piedra blanca jardin','piedra decorativa blanca','piedra 40 kg','paisajismo paraguay']::text[],
      180000::numeric, 'unidad', 1::numeric,
      '["Presentación de 40 kg","Color blanco para crear contraste visual","Ideal para jardines, maceteros, canteros y senderos"]'::jsonb,
      '["Consultá cuántas bolsas necesitás según la superficie","El aspecto puede presentar variaciones naturales"]'::jsonb,
      'Piedra Marmolada Blanca decorativa presentación 40 kg'
    ),
    (
      'paisajismo', 'Piedra Arenisca N° 2', 'piedra-arenisca-n-2',
      'Piedra arenisca N° 2 para jardines, senderos, bordes y proyectos de paisajismo.',
      'Piedra arenisca N° 2 para paisajismo y decoración exterior. Venta por kg.',
      'Piedra Arenisca N° 2 seleccionada para jardines y proyectos de paisajismo. Puede utilizarse en senderos, bordes, canteros y composiciones decorativas exteriores. Venta por kilogramo y asesoramiento para calcular la cantidad necesaria.',
      'Comprá Piedra Arenisca N° 2 por kilogramo en Portal Verde Paraguay. Para jardines, senderos, bordes y paisajismo.',
      'Piedra Arenisca N° 2 por kg | Portal Verde',
      array['piedra arenisca n 2','piedra arenisca','piedras decorativas jardin','piedras paisajismo','paisajismo paraguay']::text[],
      100000::numeric, 'kg', 1::numeric,
      '["Material natural para proyectos exteriores","Ideal para senderos, bordes y jardines","Venta por kilogramo"]'::jsonb,
      '["Consultá la cantidad adecuada para tu proyecto","La piedra natural puede variar en forma y tonalidad"]'::jsonb,
      'Piedra Arenisca N° 2 para jardín y paisajismo'
    ),
    (
      'paisajismo', 'Cinta Separadora de Jardín', 'cinta-separadora-de-jardin',
      'Cinta separadora para delimitar césped, piedras, canteros y sectores del jardín.',
      'Separador para delimitar césped, piedras y canteros. Venta por metro lineal.',
      'Cinta Separadora de Jardín para ordenar y delimitar diferentes sectores del espacio exterior. Útil para separar césped, piedras decorativas, canteros y senderos, logrando bordes más definidos. Venta por metro lineal.',
      'Cinta Separadora de Jardín por metro lineal en Portal Verde Paraguay. Delimitá césped, piedras, canteros y senderos.',
      'Cinta Separadora de Jardín | Portal Verde',
      array['cinta separadora jardin','separador de jardin','borde jardin','separador cesped','paisajismo paraguay']::text[],
      15000::numeric, 'metro lineal', 1::numeric,
      '["Ayuda a delimitar diferentes sectores del jardín","Ideal para separar césped, piedras y canteros","Venta por metro lineal"]'::jsonb,
      '["Medí previamente los metros lineales necesarios","Consultá disponibilidad y asesoramiento para instalación"]'::jsonb,
      'Cinta separadora para césped, piedras y canteros'
    ),
    (
      'servicios', 'Sistema de Riego', 'sistema-de-riego',
      'Diseño e instalación de sistemas de riego según las necesidades de cada jardín o espacio verde.',
      'Sistema de riego a medida para jardines y espacios verdes. Solicitar presupuesto.',
      'Servicio de sistema de riego para jardines y espacios verdes. Evaluamos las características del lugar y las necesidades del proyecto para preparar una solución adecuada. El servicio se cotiza de forma personalizada: solicitá una evaluación y presupuesto por WhatsApp.',
      'Sistema de riego para jardines en Paraguay. Solicitá evaluación y presupuesto personalizado con Portal Verde.',
      'Sistema de Riego para Jardines | Portal Verde',
      array['sistema de riego','riego para jardin','instalacion sistema de riego','riego paraguay','paisajismo paraguay','portal verde']::text[],
      0::numeric, 'servicio', 1::numeric,
      '["Solución adaptada a las necesidades del espacio","Evaluación previa del proyecto","Presupuesto personalizado antes de confirmar el servicio"]'::jsonb,
      '["Solicitá una evaluación para definir el sistema adecuado","El precio depende de las características y dimensiones del proyecto"]'::jsonb,
      'Sistema de riego para jardines y espacios verdes'
    )
) as v(
  category_slug, name, slug, description, short_description, full_description,
  seo_description, seo_title, seo_keywords, price, unit, min_order_quantity,
  benefits, recommendations, main_image_alt
)
join public.categories c on c.slug = v.category_slug
on conflict (slug) do update set
  category_id = excluded.category_id,
  name = excluded.name,
  description = excluded.description,
  short_description = excluded.short_description,
  full_description = excluded.full_description,
  seo_description = excluded.seo_description,
  seo_title = excluded.seo_title,
  seo_keywords = excluded.seo_keywords,
  price = excluded.price,
  currency = excluded.currency,
  unit = excluded.unit,
  min_order_quantity = excluded.min_order_quantity,
  benefits = excluded.benefits,
  recommendations = excluded.recommendations,
  is_active = false,
  is_featured = excluded.is_featured,
  main_image_alt = excluded.main_image_alt,
  canonical_url = excluded.canonical_url;

commit;
