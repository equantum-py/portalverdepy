# Auditoría operativa integral — Portal Verde

Fecha: 2026-08-08
Rama revisada: `main`

## Resumen ejecutivo

Estado general estimado: **parcialmente operativo**.

La tienda pública, Productos, Categorías, Banners, Logo y parte de Página de inicio tienen implementación real. Sin embargo, el panel todavía no puede considerarse 100% operativo porque varios módulos del menú son placeholders, faltan flujos administrativos importantes y no existe una validación automática activa de build por el bloqueo de facturación de GitHub Actions.

## Estado por módulo

| Módulo | Estado | Observación |
|---|---|---|
| Dashboard | Parcial | Presenta datos, pero requiere validación funcional y consistencia con Supabase. |
| Productos | Avanzado | CRUD, imágenes, precios, SEO, relacionados, disponibilidad, filtros. Falta cierre de permisos editor/admin y prueba integral. |
| Categorías | Avanzado | CRUD, imágenes, banners, SEO, filtros, paginación, eliminación segura. Falta prueba integral del formulario y RLS. |
| Banners | Avanzado | Carrusel, múltiples diapositivas, orden y configuración. Requiere pruebas desktop/mobile y permisos. |
| Logo | Avanzado | Carga desktop/mobile y guardado. Requiere confirmar reemplazo, limpieza de archivos y render público. |
| Página de inicio | Parcial | Barra promocional, servicios y orden de secciones. La Home todavía depende de nombres fijos de categorías. |
| Trabajos | No operativo | La ruta muestra únicamente un placeholder. |
| Presupuestos | No operativo | La ruta muestra únicamente un placeholder. |
| Configuración | No operativo | La ruta muestra únicamente un placeholder. |
| Usuarios | No operativo | La ruta muestra únicamente un placeholder. |
| Menú/Navegación | No separado | La lógica existe dentro del contenido Home, pero no tiene módulo administrativo exclusivo. |
| Tienda pública | Parcial/avanzado | Catálogo y Home existen. Falta prueba completa de producto, carrito/presupuesto, WhatsApp y estados vacíos. |

## Hallazgos críticos

### 1. Módulos visibles que no funcionan

Las rutas de Trabajos, Presupuestos, Configuración y Usuarios muestran `AdminPlaceholder`. No deben presentarse como módulos terminados.

### 2. Configuración global pendiente

WhatsApp, datos de contacto, redes sociales, datos empresariales, navegación y mega menú todavía no cuentan con administración completa y separada.

### 3. Home dependiente de nombres de categoría

La portada obtiene productos mediante comparación directa con `"Césped"` y `"Paisajismo"`. Si se cambia el nombre de una categoría desde el panel, las secciones pueden quedar vacías. Debe utilizarse slug, ID o configuración de sección.

### 4. Permisos inconsistentes

El layout admite `admin` y `editor`, pero varias acciones históricamente exigían solo `admin`. Productos y Categorías deben aplicar la misma matriz:

- Admin: crear, editar, activar, destacar, duplicar y eliminar.
- Editor: crear, editar, activar, destacar y duplicar.
- Solo Admin: eliminación definitiva y administración de usuarios.

### 5. GitHub Actions inactivo

El workflow de calidad quedó en modo manual debido a un bloqueo de facturación de la cuenta. Hasta resolverlo, Vercel es la principal validación de producción y debe revisarse después de cada cambio.

### 6. Migraciones y RLS

La existencia de archivos SQL en GitHub no confirma que todas las migraciones estén aplicadas en Supabase. Debe verificarse manualmente:

- Tablas y columnas.
- Funciones `is_admin()` y permisos para editor.
- Políticas de lectura pública.
- Políticas de escritura para administradores/editores.
- Buckets y políticas de Storage.

## Correcciones ya aplicadas durante la auditoría

- Administración independiente de Banners.
- Administración independiente de Logo.
- Limpieza de Página de inicio.
- Corrección del carrusel público.
- Corrección de guardado parcial de configuración del carrusel.
- Corrección para no borrar imágenes de producto antes de guardar.
- Cambio rápido Disponible/Agotado desde Productos.
- Búsqueda y filtros funcionales de Productos.
- Permisos y eliminación segura en Categorías.
- Registro de actividad para acciones de Categorías.

## Plan de cierre obligatorio

### Fase A — Bloqueadores

1. Confirmar build exitoso en Vercel.
2. Revisar y ejecutar todas las migraciones pendientes en Supabase.
3. Auditar RLS y Storage.
4. Unificar permisos Admin/Editor en todos los módulos reales.
5. Eliminar dependencia de nombres fijos de categorías en Home.

### Fase B — Módulos faltantes

1. Configuración global y WhatsApp.
2. Usuarios y permisos.
3. Trabajos realizados.
4. Presupuestos/leads.
5. Menú y navegación.

### Fase C — QA funcional

1. Crear, editar, duplicar, desactivar y eliminar producto.
2. Crear, editar, destacar, desactivar y eliminar categoría.
3. Subir/reemplazar/eliminar imágenes.
4. Crear y ordenar banners.
5. Cambiar logos desktop/mobile.
6. Validar Home y catálogo en desktop/mobile.
7. Probar producto, presupuesto, WhatsApp y navegación.
8. Probar sesión vencida, rol editor y rol admin.

### Fase D — Producción

1. SEO técnico.
2. Sitemap y robots.
3. Rendimiento e imágenes.
4. Accesibilidad básica.
5. Backups y documentación de migraciones.
6. Reactivar CI cuando se resuelva la facturación de GitHub.

## Criterio de 100% operativo

El proyecto solo puede declararse 100% operativo cuando:

- Ninguna sección del menú sea un placeholder.
- Todos los CRUD funcionen con permisos correctos.
- Todos los cambios se reflejen en la web pública.
- Build y typecheck pasen.
- RLS y Storage estén verificados.
- Se complete una prueba desktop/mobile de punta a punta.
