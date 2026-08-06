import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    '❌ Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY'
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

const categories = [
  {
    name: 'Césped',
    slug: 'cesped',
    description: 'Césped natural para jardines y espacios verdes.',
    sort_order: 1,
    is_active: true
  },
  {
    name: 'Paisajismo',
    slug: 'paisajismo',
    description: 'Productos para decoración y diseño de exteriores.',
    sort_order: 2,
    is_active: true
  },
  {
    name: 'Plantas',
    slug: 'plantas',
    description: 'Plantas para jardines, patios y espacios verdes.',
    sort_order: 3,
    is_active: true
  },
  {
    name: 'Mantenimiento de jardines',
    slug: 'mantenimiento-jardines',
    description: 'Servicios y productos para mantenimiento de jardines.',
    sort_order: 4,
    is_active: true
  },
  {
    name: 'Piscinas',
    slug: 'piscinas',
    description: 'Productos y servicios para piscinas y exteriores.',
    sort_order: 5,
    is_active: true
  }
];

const products = [
  {
    slug: 'cesped-esmeralda-m2',
    name: 'Césped Esmeralda m²',
    description:
      'Césped natural de alta calidad para jardines residenciales.',
    seo_description:
      'Césped Esmeralda natural ideal para jardines residenciales, patios y áreas verdes. Destaca por su color intenso, textura uniforme y excelente adaptación al clima de Paraguay.',
    benefits: [
      'Color verde intenso y uniforme',
      'Excelente presentación estética',
      'Ideal para jardines residenciales',
      'Incluye instalación'
    ],
    recommendations: [
      'Recomendado para patios y jardines familiares',
      'Ideal para proyectos residenciales de paisajismo',
      'Se luce mejor con bordes delimitados y granza decorativa'
    ],
    related_product_slugs: [
      'granza-blanca-fina-decorativa',
      'separador-cesped-caminos',
      'piso-ecologico-40x60'
    ],
    price: 31000,
    previous_price: 35000,
    category_slug: 'cesped',
    image_url: '/images/products/cesped-esmeralda.webp',
    is_offer: true,
    is_best_seller: true,
    is_recommended: true,
    includes_installation: true,
    in_stock: true,
    is_active: true,
    sort_order: 1
  },
  {
    slug: 'cesped-siempre-verde-m2',
    name: 'Césped Siempre Verde m²',
    description:
      'Variedad resistente, ideal para mantener un verde intenso durante todo el año.',
    seo_description:
      'Césped Siempre Verde pensado para quienes buscan un jardín fresco, uniforme y resistente.',
    benefits: [
      'Alta resistencia para exteriores',
      'Mantiene un verde atractivo',
      'Buena cobertura visual',
      'Incluye instalación'
    ],
    recommendations: [
      'Ideal para jardines con uso diario',
      'Recomendado para viviendas y áreas comunes',
      'Combina muy bien con senderos y pisos decorativos'
    ],
    related_product_slugs: [
      'piso-ecologico-40x60',
      'separador-cesped-caminos',
      'granza-blanca-fina-decorativa'
    ],
    price: 25000,
    previous_price: 35000,
    category_slug: 'cesped',
    image_url: '/images/products/cesped-siempre-verde.webp',
    is_offer: false,
    is_recommended: true,
    includes_installation: true,
    in_stock: true,
    is_active: true,
    sort_order: 2
  },
  {
    slug: 'cesped-mani-docena',
    name: 'Césped Maní por Docena',
    description:
      'Cobertura ornamental ideal para paisajismo y áreas decorativas.',
    seo_description:
      'Césped Maní por docena ideal para proyectos decorativos y paisajismo.',
    benefits: [
      'Cobertura ornamental atractiva',
      'Ideal para paisajismo decorativo',
      'Aporta un acabado natural y prolijo',
      'Incluye instalación'
    ],
    recommendations: [
      'Perfecto para bordes de jardín y espacios decorativos',
      'Muy recomendado para proyectos de paisajismo',
      'Se complementa bien con granza y separadores'
    ],
    related_product_slugs: [
      'granza-blanca-fina-decorativa',
      'separador-cesped-caminos',
      'pisos-cemento-imitacion-madera'
    ],
    price: 30000,
    previous_price: 57000,
    category_slug: 'cesped',
    image_url: '/images/products/cesped-mani.webp',
    is_new: true,
    is_recommended: true,
    includes_installation: true,
    in_stock: true,
    is_active: true,
    sort_order: 3
  },
  {
    slug: 'cesped-kavaju-m2',
    name: 'Césped Kavaju m²',
    description:
      'Pasto resistente para exteriores y zonas de uso frecuente.',
    seo_description:
      'Césped Kavaju natural recomendado para exteriores con mayor exigencia.',
    benefits: [
      'Mayor resistencia para uso frecuente',
      'Ideal para exteriores amplios',
      'Buena durabilidad visual',
      'Incluye instalación'
    ],
    recommendations: [
      'Recomendado para jardines con alto tránsito',
      'Ideal para patios amplios y zonas funcionales',
      'Se complementa con pisos y delimitadores decorativos'
    ],
    related_product_slugs: [
      'piso-ecologico-40x60',
      'separador-cesped-caminos',
      'granza-blanca-fina-decorativa'
    ],
    price: 25000,
    previous_price: 57000,
    category_slug: 'cesped',
    image_url: '/images/products/cesped-kavaju.webp',
    is_offer: false,
    includes_installation: true,
    in_stock: true,
    is_active: true,
    sort_order: 4
  },
  {
    slug: 'piso-ecologico-40x60',
    name: 'Piso Ecológico 40x60',
    description:
      'Piso drenante ideal para jardines, senderos y estacionamientos.',
    seo_description:
      'Piso Ecológico 40x60 diseñado para jardines, senderos y espacios exteriores.',
    benefits: [
      'Ideal para senderos y jardines',
      'Aporta orden visual al espacio',
      'Mejora la circulación exterior',
      'Excelente complemento para césped'
    ],
    recommendations: [
      'Recomendado para caminos y accesos de jardín',
      'Ideal para combinar con césped natural',
      'Muy útil en proyectos de paisajismo moderno'
    ],
    related_product_slugs: [
      'cesped-esmeralda-m2',
      'cesped-siempre-verde-m2',
      'granza-blanca-fina-decorativa'
    ],
    price: 155000,
    previous_price: 220000,
    category_slug: 'paisajismo',
    image_url: '/images/products/piso-ecologico.webp',
    is_best_seller: true,
    in_stock: true,
    is_active: true,
    sort_order: 5
  },
  {
    slug: 'separador-cesped-caminos',
    name: 'Separador de Césped y Caminos',
    description:
      'Separador flexible para delimitar jardines, bordes y senderos.',
    seo_description:
      'Separador de césped y caminos ideal para delimitar áreas verdes, senderos y bordes decorativos.',
    benefits: [
      'Delimita espacios con prolijidad',
      'Mejora el acabado del jardín',
      'Flexible y funcional',
      'Ideal para paisajismo'
    ],
    recommendations: [
      'Muy recomendado para bordes de césped',
      'Ideal para senderos decorativos',
      'Se complementa con granza y pisos exteriores'
    ],
    related_product_slugs: [
      'granza-blanca-fina-decorativa',
      'piso-ecologico-40x60',
      'cesped-esmeralda-m2'
    ],
    price: 15000,
    previous_price: 30000,
    category_slug: 'paisajismo',
    image_url: '/images/products/separador.webp',
    is_offer: false,
    in_stock: true,
    is_active: true,
    sort_order: 6
  },
  {
    slug: 'pisos-cemento-imitacion-madera',
    name: 'Pisos de Cemento Imitación Madera',
    description:
      'Acabado decorativo moderno para caminos, patios y exteriores.',
    seo_description:
      'Pisos de cemento imitación madera con acabado decorativo moderno para patios, caminos y exteriores.',
    benefits: [
      'Estética cálida y moderna',
      'Ideal para exteriores',
      'Aporta diseño al paisajismo',
      'Muy buen complemento decorativo'
    ],
    recommendations: [
      'Recomendado para patios y caminos principales',
      'Ideal para combinar con césped y granza',
      'Excelente para proyectos residenciales modernos'
    ],
    related_product_slugs: [
      'cesped-esmeralda-m2',
      'granza-blanca-fina-decorativa',
      'separador-cesped-caminos'
    ],
    price: 95000,
    previous_price: 185000,
    category_slug: 'paisajismo',
    image_url: '/images/products/piso-madera.webp',
    is_best_seller: true,
    in_stock: true,
    is_active: true,
    sort_order: 7
  },
  {
    slug: 'granza-blanca-fina-decorativa',
    name: 'Granza Blanca Fina Decorativa',
    description:
      'Ideal para decoración de jardines, maceteros y senderos.',
    seo_description:
      'Granza blanca fina decorativa ideal para embellecer jardines, maceteros, senderos y bordes.',
    benefits: [
      'Aporta contraste y limpieza visual',
      'Ideal para senderos y bordes',
      'Muy utilizada en decoración exterior',
      'Combina con césped y pisos'
    ],
    recommendations: [
      'Ideal para maceteros y senderos decorativos',
      'Muy recomendada para acompañar césped natural',
      'Perfecta para resaltar bordes y caminos'
    ],
    related_product_slugs: [
      'separador-cesped-caminos',
      'piso-ecologico-40x60',
      'cesped-siempre-verde-m2'
    ],
    price: 20000,
    previous_price: 50000,
    category_slug: 'paisajismo',
    image_url: '/images/products/granza.webp',
    is_offer: false,
    in_stock: true,
    is_active: true,
    sort_order: 8
  }
];

async function migrate() {
  console.log('🌱 Iniciando migración...');

  const { error: categoriesError } = await supabase
    .from('categories')
    .upsert(categories, {
      onConflict: 'slug'
    });

  if (categoriesError) {
    throw categoriesError;
  }

  const { data: savedCategories, error: categoryReadError } =
    await supabase.from('categories').select('id, slug');

  if (categoryReadError) {
    throw categoryReadError;
  }

  const categoryMap = Object.fromEntries(
    savedCategories.map((category) => [category.slug, category.id])
  );

  const preparedProducts = products.map(
    ({ category_slug, ...product }) => ({
      ...product,
      category_id: categoryMap[category_slug],
      is_offer: product.is_offer ?? false,
      is_new: product.is_new ?? false,
      is_best_seller: product.is_best_seller ?? false,
      is_recommended: product.is_recommended ?? false,
      includes_installation: product.includes_installation ?? false,
      in_stock: product.in_stock ?? true,
      is_active: product.is_active ?? true
    })
  );

  const { error: productsError } = await supabase
    .from('products')
    .upsert(preparedProducts, {
      onConflict: 'slug'
    });

  if (productsError) {
    throw productsError;
  }

  console.log('✅ Categorías migradas:', categories.length);
  console.log('✅ Productos migrados:', products.length);
}

migrate().catch((error) => {
  console.error('❌ Error durante la migración:');
  console.error(error);
  process.exit(1);
});
