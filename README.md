# Portal Verde Ecommerce Starter (Next.js)

## Administración del catálogo

Productos y Categorías se gestionan en `/admin/productos` y
`/admin/categorias` usando Supabase, Server Actions y validación Zod. Aplicar
las migraciones antes de desplegar con `npx supabase db push`. Los buckets
`product-images` y `category-images` admiten JPG, PNG y WebP de hasta 5 MB.
La eliminación de categorías asociadas a productos está bloqueada en la
aplicación y en la clave foránea.

Starter profesional de ecommerce para **Portal Verde**, construido con **Next.js App Router**, **TypeScript**, **Tailwind CSS** y **ESLint**, listo para producción y despliegue en **Vercel**.

## Stack técnico

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- ESLint

## Qué incluye

- Header comercial realista con:
  - barra superior informativa
  - buscador principal con selector de categoría
  - acceso a cuenta, carrito y WhatsApp
- Home tipo tienda por categorías:
  - sidebar de categorías
  - banner promocional principal
  - franjas promocionales
  - secciones de productos: **Nuevos productos**, **Más vendidos**, **Ofertas**, **Recomendados**
- Página de catálogo (`/shop`)
- Página de detalle de producto (`/product/[slug]`)
- Carrito visual con estado local (`/cart`)
- Mock data local con precios en guaraníes
- Layout responsive para mobile y desktop
- Estructura lista para despliegue en Vercel
- SEO básico
- Imágenes optimizadas con `next/image`

## Estructura principal

```bash
app/
  cart/page.tsx
  product/[slug]/page.tsx
  shop/page.tsx
  globals.css
  layout.tsx
  not-found.tsx
  page.tsx
components/
  add-to-cart-button.tsx
  cart-client.tsx
  category-sidebar.tsx
  footer.tsx
  header.tsx
  icons.tsx
  logo.tsx
  product-card.tsx
sections/
  home-hero.tsx
  promo-strip.tsx
  product-section.tsx
lib/
  data.ts
  types.ts
public/images/
  *.svg
