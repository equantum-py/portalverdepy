# Analytics GA4 — Instrumentación y base de medición CRO

> Alcance: **medición y analítica únicamente**. Esta capa no cambia diseño, precios, catálogo,
> Supabase, SEO, navegación, autenticación ni la configuración de Google Ads.
>
> Propiedad GA4: `G-X4SL2XNW02` · Google tag: `GT-MKR6HCPJ` · Google Ads: `AW-18381728232`.

## 1. Arquitectura

```
app/layout.tsx
 ├─ <Script beforeInteractive>  getAnalyticsGuardScript()   ← bloqueo de /admin (antes de gtag config)
 ├─ <Script afterInteractive>   gtag('config', GT / G / AW) ← sin cambios
 └─ <AnalyticsProvider/>        components/analytics/analytics-provider.tsx
        · guard de /admin en cada cambio de ruta
        · UN listener de clics delegado (fase de captura):
            enlace wa.me        → whatsapp_click   (clasificado por data-wa-cta)
            [data-select-item]  → select_item      (tarjetas de producto)

lib/analytics/
 ├─ config.ts                 IDs de Google (fuente única)
 ├─ taxonomy.ts               page_type, cta_location, item_list_name, search_source  (CERRADAS)
 ├─ page-type.ts              getPageType(pathname, search), stripQuery
 ├─ sanitize.ts               PII, normalización, sanitizeSearchTerm
 ├─ dedupe.ts                 deduplicación en memoria (por pestaña)
 ├─ track.ts                  trackEvent()  ← ÚNICO punto de salida hacia GA4 + lista blanca por evento
 ├─ events.ts                 trackViewItem / trackSelectItem / trackSearch / trackFormSubmit
 ├─ whatsapp.ts               contrato data-wa-* y whatsapp_click
 ├─ catalog-search-tracker.ts búsqueda del catálogo (término estable)
 ├─ attribution.ts            gclid/utm de sesión (solo booleanos y utm_* salen hacia GA4)
 └─ admin-guard.ts            bloqueo de medición bajo /admin
components/analytics/view-item-tracker.tsx   <ViewItemTracker/> (no renderiza nada)
```

Regla: **ningún componente llama a `gtag()` directamente.** Todo pasa por `trackEvent()`, que
(1) no hace nada en SSR / sin gtag / bajo `/admin`, (2) aplica lista blanca de parámetros y filtro de PII,
(3) envía con destino explícito `send_to: 'G-X4SL2XNW02'`.

## 2. Matriz de eventos

| Evento | Acción | Parámetros | Página |
|---|---|---|---|
| `view_item` | Visualización de ficha de producto | `currency`, `value`, `items[]` (`item_id`, `item_name`, `item_category`, `price`, `quantity`), `page_type` | PDP `/product/[slug]` |
| `select_item` | Selección de un producto desde un listado | `item_list_name`, `items[]` (+`item_list_name`), `page_type` | `/shop`, resultados de búsqueda, categorías, relacionados, secciones de la home |
| `search` | Búsqueda real del usuario | `search_term`, `search_source`, `results_count`, `page_type` | Header (todas las páginas públicas) y catálogo `/shop` |
| `whatsapp_click` | Contacto por WhatsApp | contexto + CTA (ver §4 y §5) | Varias |
| `form_submit` | Envío exitoso de formulario | `form_name`, `form_location`, `page_type` | Asesor Verde (widget global) |
| `quote_request` | **RESERVADO** — solicitud inequívoca de presupuesto | `product_id`, `product_name`, `service_name`, `quantity`, `unit`, `page_type` | Según flujo futuro |
| `calculator_use` | **RESERVADO** — arquitectura preparada para una futura calculadora | `product_id`, `product_name`, `quantity`, `unit`, `page_type` | Futuro |

`quote_request` y `calculator_use` tienen contrato y lista blanca definidos en `lib/analytics/track.ts`
pero **no se emiten en ningún flujo** (decisión de Dirección: no inflar artificialmente el funnel; la
calculadora sigue siendo una hipótesis CRO).

### Parámetros de `whatsapp_click`

| Parámetro | Origen | Notas |
|---|---|---|
| `cta_location` | `data-wa-cta` | Taxonomía cerrada (§3). Si falta el atributo: `unclassified` (centinela de CTA sin instrumentar). |
| `page_type` | ruta actual | Taxonomía cerrada (§3). |
| `page_path` | ruta actual | **Sin query string** (la query puede contener texto del usuario). |
| `product_id`, `product_name`, `product_slug`, `product_category` | `data-wa-product-*` | Solo cuando el CTA pertenece a un producto. |
| `service_name` | `data-wa-service-name` | Solo servicios. |
| `contact_type` | `data-wa-contact-type` | Por defecto `whatsapp`. Distingue p. ej. `product_quote`, `tiered_price_consultation`, `budget_request`. |
| `item_count`, `value`, `currency` | `data-wa-item-count`, `-value`, `-currency` | Solo `/cart`. `value` = subtotal estimado; se omite si es 0. |
| `source`, `whatsapp_source`, `event_label` | = `cta_location` | **Compatibilidad**: conservan nombre, pero ahora llevan valores de la taxonomía (ver §8). |
| `event_category` | `lead` | Sin cambios. |
| `page_title`, `button_text` | documento / texto del botón (≤60) | Texto estático de interfaz. |
| `utm_source/medium/campaign/content/term`, `gclid_present`, `gbraid_present`, `wbraid_present` | atribución de sesión | Los identificadores de clic **nunca** se envían crudos. |
| `timestamp`, `transport_type` | — | Sin cambios respecto de la implementación anterior. |

**Eliminado** respecto de la implementación anterior: `page_url` (incluía query string).

## 3. Taxonomías (centralizadas en `lib/analytics/taxonomy.ts`)

No introducir variantes. Cualquier valor nuevo se agrega en `taxonomy.ts`, aquí, y en
`tests/analytics/*`.

### `page_type`

| Valor | Rutas |
|---|---|
| `home` | `/` |
| `shop` | `/shop` (catálogo; también con `?search=` y `?category=` de productos) |
| `product` | `/product/[slug]` |
| `plants` | `/plantas` y `/shop?category=Plantas` |
| `services` | `/shop?category=Mantenimiento de jardines` (y alias `servicios`) |
| `projects` | `/trabajos` |
| `cart` | `/cart` |
| `other` | cualquier otra ruta pública (`/terminos`, `/privacidad`, …) |

### `cta_location`

| Valor | Dónde |
|---|---|
| `hero` | Botón de WhatsApp en el hero / slides de la home |
| `header` | Barra promocional y menú móvil del header |
| `floating` | Botón flotante de WhatsApp |
| `product_card` | Tarjeta de producto o de planta (`/shop`, home, relacionados, `/plantas`) |
| `product_page` | Botones de WhatsApp dentro del cuerpo de la ficha (incl. calculadora por escalas) |
| `product_page_sticky` | Barra fija inferior (móvil) de la ficha |
| `shop` | CTA propio del catálogo (consulta de plantas a medida) |
| `services` | Catálogo de servicios y botones de la sección Servicios de la home |
| `projects` | Página de trabajos (3 CTA) |
| `footer` | Footer (4 puntos de anclaje en código; 3 enlaces de contacto + 5 enlaces de servicio renderizados con un mismo anchor) |
| `cart` | Botón "Enviar presupuesto por WhatsApp" del carrito |
| `advisor` | "Continuar por WhatsApp" dentro del Asesor Verde |

### `item_list_name` (`select_item`)

`shop` (listado sin filtros) · `search_results` (hay término de búsqueda o sugerencia del header) ·
`category` (filtro de categoría sin búsqueda) · `related_products` (ficha) · `home_featured` (secciones de la home).

### `search_source`

`header` · `header_suggestion` · `catalog`.

## 4. Búsqueda: header vs. catálogo (diferencia intencional)

`search` representa **intención real**, no teclas.

| Buscador | Cuándo emite | Cuándo NO |
|---|---|---|
| **Header** | Enter · botón de lupa · "Ver todos los resultados" · selección de una sugerencia (`header_suggestion`, junto con `select_item`) | Campo vacío o <2 caracteres · mientras se escribe · PII |
| **Catálogo `/shop`** | Solo si el término queda **estable** 1,2 s (`CATALOG_SEARCH_SETTLE_MS`), tiene ≥2 caracteres, es distinto del último medido **y modifica realmente el conjunto de resultados** respecto de la línea base | Cada pulsación · término inicial que llegó por `?search=` (ya medido en el header) · campo vacío · mismo término repetido |

Además, `trackSearch` deduplica el mismo término dentro de 3 s (Enter + sugerencia). Los términos con
apariencia de email o teléfono (≥7 dígitos) se descartan. Las búsquedas sin resultados **sí** se miden
(`results_count = 0`): es información comercial valiosa.

> Nota: si las *Mediciones mejoradas → Búsqueda en el sitio* de GA4 están activas, GA4 puede generar además
> `view_search_results` a partir del parámetro `?search=`. Es un evento distinto de `search`.

## 5. Matriz de CTA de WhatsApp instrumentados

El origen **nunca** se deduce de la URL ni de clases CSS: cada `<a>` declara `data-wa-cta`.
Contrato: `data-wa-cta` (obligatorio) + opcionales `data-wa-product-id|name|slug|category`,
`data-wa-service-name`, `data-wa-contact-type`, `data-wa-item-count|value|currency`.

| # | Archivo | `cta_location` | Enlaces |
|---|---|---|---|
| 1 | `components/whatsapp-floating.tsx` | `floating` | 1 (renderizado por `RouteShell` y, en la home, también por `app/page.tsx` — ver §9) |
| 2 | `components/header.tsx` | `header` | 2 (barra promo + menú móvil) |
| 3 | `sections/hero.tsx` | `hero` | 1 |
| 4 | `sections/home-hero-slide.tsx` | `hero` | 1 (botones de slide configurables desde admin) |
| 5 | `sections/services-section.tsx` | `services` | 2 (botones configurables desde admin) |
| 6 | `components/product-card.tsx` | `product_card` | 1 |
| 7 | `app/product/[slug]/page.tsx` | `product_page` · `product_page_sticky` | 1 + 1 |
| 8 | `components/products/tiered-price-calculator.tsx` | `product_page` (`contact_type=tiered_price_consultation`) | 1 |
| 9 | `components/services-catalog.tsx` | `services` | 1 por servicio |
| 10 | `components/digital-nursery-card.tsx` | `product_card` (`product_category=Plantas`) | 1 por planta |
| 11 | `components/digital-nursery-catalog.tsx` | `shop` (`contact_type=plant_request`) | 1 |
| 12 | `app/trabajos/page.tsx` | `projects` | 3 |
| 13 | `components/footer.tsx` | `footer` | 4 |
| 14 | `components/cart-client.tsx` | `cart` (+`item_count`, `value`, `currency`) | 1 |
| 15 | `components/green-advisor.tsx` | `advisor` | 1 |

15 archivos distintos / 22 puntos de enlace en código. El test `tests/analytics/cta-coverage.test.ts` falla
si aparece un archivo público con enlaces de WhatsApp que no esté en este inventario.

> **Hallazgo respecto de la Fase A:** el CTA de la calculadora por escalas (#8) no figuraba en el
> diagnóstico; se detectó con el test de cobertura y quedó instrumentado.

### `/cart` y `quote_request`

Por decisión de Dirección, abrir WhatsApp **no** es una solicitud de presupuesto. En `/cart` se emite únicamente
`whatsapp_click` enriquecido (`cta_location=cart`, `page_type=cart`, `item_count`, `value`, `currency`).
No se envían nombres de productos, zona, observaciones ni el mensaje armado.

## 6. `form_submit` y `form_start`

* `form_submit` se emite **solo** en el Asesor Verde, **después** de `result.success` de la acción del
  servidor, con `form_name=green_advisor` y `form_location=advisor_widget`. No viaja la pregunta, la respuesta ni
  ningún texto del usuario. Cada respuesta exitosa del servidor es un envío; se deduplica en 1 s.
* Causa investigada de `form_start` sin `form_submit`: el código del repositorio **no genera** `form_start`; proviene
  de las *Mediciones mejoradas → Interacciones con formularios* de GA4, que detecta el foco en campos pero no el
  envío de formularios con `preventDefault`/acciones de servidor (Asesor Verde) ni los de `/admin`
  (login y formularios de gestión, hasta ahora sin bloqueo). Es una hipótesis a confirmar en GA4 filtrando
  `form_start` por `page_location`.
* **Recomendación (NO aplicada, fuera de esta OT):** desactivar *Interacciones con formularios* en las
  Mediciones mejoradas de la propiedad para eliminar `form_start`/`form_submit` automáticos ambiguos.

## 7. Bloqueo de medición bajo `/admin`

Sin reestructurar layouts ni tocar autenticación:

1. **Carga directa de `/admin/*`:** el script `beforeInteractive` (`getAnalyticsGuardScript()`) fija
   `window['ga-disable-<ID>'] = true` para `GT-MKR6HCPJ`, `G-X4SL2XNW02` y `AW-18381728232` **antes** de
   `gtag('config', …)`. Es el interruptor oficial de Google: ningún hit (ni `page_view`) sale mientras esté activo.
2. **Navegación SPA:** el mismo script envuelve `history.pushState/replaceState` y escucha `popstate`, de modo que
   el interruptor se recalcula **de forma síncrona, antes** de que GA4 mida el cambio de historial. Entrar a
   `/admin` desde una ruta pública no envía `page_view`; volver a una ruta pública lo desactiva.
3. `AnalyticsProvider` repite `applyAnalyticsGuard(pathname)` en cada cambio de ruta (respaldo).
4. `trackEvent()` y los *handlers* de clic devuelven sin hacer nada bajo `/admin`.

Limitación: las cargas de `gtag.js` ocurren igualmente en `/admin` (el script se descarga), pero no emiten hits.
Para reportes históricos conviene además un filtro de tráfico interno en GA4 (§10).

## 8. Compatibilidad y riesgos de datos

* **Valores de `source`/`whatsapp_source`/`event_label` cambiaron.** Antes: `product_pdp`, `product_card`,
  `footer`, `floating`, `unknown`, `service`, `plant`, `budget`, `plantas_custom_request`. Ahora: valores de la
  taxonomía `cta_location`. **No se pueden comparar directamente series anteriores y posteriores de estos
  parámetros**; los datos históricos de origen en `/shop` ya eran poco fiables (la heurística etiquetaba como
  `product_card` cualquier enlace en `/shop`, p. ej. el del header). Usar `cta_location` hacia adelante.
* **`send_to` explícito (`G-X4SL2XNW02`)** en todos los eventos propios. Hasta ahora `whatsapp_click` se enviaba sin
  destino, es decir a **todos** los destinos configurados (`GT-…`, `G-…`, `AW-…`). Riesgo documentado: si el Google
  tag `GT-MKR6HCPJ` tiene `G-X4SL2XNW02` como destino, cada clic se medía **dos veces**; el destino explícito lo evita.
  Efecto colateral a vigilar: los destinos `GT-`/`AW-` **dejan de recibir** `whatsapp_click`. La conversión de Google
  Ads por clic (`conversion` con `send_to: AW-…/<label>`, activa solo si
  `NEXT_PUBLIC_GOOGLE_ADS_WHATSAPP_CONVERSION_LABEL` está definida) **no se modificó**. Si la conversión de Ads se
  alimenta de un evento importado desde GA4, sigue funcionando porque GA4 lo recibe.
* Eliminada la ventana de deduplicación en `sessionStorage` de 3 s con clave por URL (colapsaba tarjetas
  distintas porque todas comparten la URL base de WhatsApp). Ahora la clave incluye CTA + página + producto/servicio.

## 9. Mecanismos de deduplicación

| Evento | Mecanismo |
|---|---|
| `whatsapp_click` | Un único listener (se registra una vez, se limpia al desmontar, seguro ante Strict Mode). Dedupe 1,5 s por `cta + ruta + producto + servicio + contact_type`. |
| `select_item` | Un único listener. Dedupe 1 s por `lista + producto`. |
| `view_item` | `useRef` por producto en `<ViewItemTracker/>` (sobrevive al doble montaje de Strict Mode y a re-renders) + dedupe de módulo 2 s por producto. Navegar a otro producto emite uno nuevo. |
| `search` | Dedupe 3 s por término; catálogo: máquina de estados de término estable (§4). |
| `form_submit` | Dedupe 1 s. |
| Destinos GA4 | `send_to` explícito evita el fan-out a `GT-`/`AW-`. |

La deduplicación vive en el módulo (no en componentes), por lo que sobrevive a la navegación SPA.

**Botón flotante duplicado en la home** (hallazgo de Fase A): `RouteShell` y `app/page.tsx` renderizan
`<WhatsAppFloating/>`. Verificado con Chrome: hay 2 botones en el DOM y **un clic genera exactamente 1
`whatsapp_click`** (desktop y móvil), por lo que **no afecta la analítica** y no se corrigió en esta OT.

## 10. Configuración manual posterior en GA4 (NO realizada desde código)

1. **Dimensiones personalizadas** (ámbito *evento*): `cta_location`, `page_type`, `product_id`, `product_name`,
   `product_category`, `service_name`, `contact_type`, `search_source`, `form_name`, `item_count`.
   (`search_term`, `item_list_name` y los parámetros de ecommerce son estándar de GA4.) Las dimensiones solo acumulan
   datos desde su creación.
2. **No marcar** los eventos nuevos como *eventos clave* (indicación de Dirección). Revisar si `whatsapp_click` ya lo es.
3. **Mediciones mejoradas:** recomendada la desactivación de *Interacciones con formularios* (§6). Decisión de Dirección: fuera de esta OT.
4. **Filtro de tráfico interno / de desarrollador** para excluir historia e IP internas (el bloqueo de `/admin` solo evita futuros hits).
5. Si se usan informes de comercio electrónico: confirmar que `view_item`/`select_item` aparecen en *Monetización → Compras de comercio electrónico*.

## 11. Checklist de validación en GA4 DebugView / Tag Assistant

Objetivo: **una acción = un único evento en GA4.** Abrir `https://www.portalverdepy.com/?debug_mode=1`
(o Tag Assistant con el contenedor) y, para cada fila, ejecutar la acción y confirmar **1** evento con el parámetro:

| Acción | Evento esperado (exactamente 1) | Verificar |
|---|---|---|
| Abrir una ficha desde `/shop` | `select_item` y luego `view_item` | `item_list_name=shop`; `items[0].item_id/name/category/price` |
| Abrir una ficha por URL directa / recarga | `view_item` | sin `select_item` |
| Buscar "césped" + Enter en el header | `search` | `search_term=césped`, `search_source=header`; **sin** segundo `search` al aterrizar en `/shop` |
| Escribir en el catálogo y esperar ~1,5 s | `search` | `search_source=catalog`; nada mientras se teclea |
| Elegir una sugerencia del header | `search` (`header_suggestion`) + `select_item` (`search_results`) + `view_item` | |
| CTA WhatsApp de la ficha | `whatsapp_click` | `cta_location=product_page`, `page_type=product`, `product_name` |
| Barra fija móvil de la ficha | `whatsapp_click` | `cta_location=product_page_sticky` |
| Botón flotante (incluida la home) | `whatsapp_click` | `cta_location=floating` (1 solo evento aunque haya 2 botones en la home) |
| WhatsApp del header en `/shop?search=x` | `whatsapp_click` | `cta_location=header`, `page_type=shop` (**no** `product_card`) |
| Tarjeta de producto → "Consultar ahora" | `whatsapp_click` | `cta_location=product_card`, `product_id` |
| `/cart` → "Enviar presupuesto" | `whatsapp_click` (**no** `quote_request`) | `cta_location=cart`, `page_type=cart`, `item_count`, `value`, `currency=PYG` |
| Asesor Verde → recibir respuesta | `form_submit` | `form_name=green_advisor`; sin contenido |
| Entrar a `/admin/login` y navegar por el panel | **ningún** `page_view`/evento de `/admin` | luego volver a `/shop`: la medición pública sigue funcionando |
| Cualquier evento | — | `send_to`/stream = `G-X4SL2XNW02`; **no** debe aparecer duplicado por `GT-MKR6HCPJ`; sin PII ni `page_url` |

En la pestaña *Red* del navegador, cada acción debe producir **un** `…/g/collect?…tid=G-X4SL2XNW02…&en=<evento>`.
Si se ven dos requests por acción (uno con `tid=GT-…`), el riesgo de duplicación del §8 sigue vigente en el contenedor.

## 12. Privacidad (PII)

Prohibido enviar a GA4: nombre, apellido, teléfono, email, mensaje de WhatsApp, dirección y cualquier texto escrito
por el cliente. Garantías técnicas:

* **Lista blanca por evento** (`EVENT_PARAM_ALLOWLIST`): lo que no está listado no sale del navegador.
* Lista de claves bloqueadas (`name`, `phone`, `email`, `message`, `address`, `notes`, `zone`, `question`, `page_url`…).
* Los valores de texto con apariencia de email o ≥7 dígitos se descartan (excepto identificadores).
* Texto limitado a 100 caracteres; `page_path` sin query string.
* El mensaje de WhatsApp y la URL `wa.me` nunca se leen para el payload.

## 13. Cómo agregar un CTA, evento o valor de taxonomía

* **CTA de WhatsApp nuevo:** agregar `data-wa-cta="<valor de la taxonomía>"` (+ atributos de contexto) al `<a>` y registrar
  el archivo en `tests/analytics/cta-coverage.test.ts` y en la matriz del §5.
* **Tarjeta de producto nueva:** usar `<ProductCard listName="…"/>` (o `data-select-item` + `data-item-*`).
* **Valor nuevo de `page_type`/`cta_location`/`item_list_name`:** editar `lib/analytics/taxonomy.ts` (y `page-type.ts` si aplica),
  esta documentación y los tests.
* **Evento nuevo:** agregarlo a `AnalyticsEventName` y a `EVENT_PARAM_ALLOWLIST` en `track.ts`, crear su *builder* en `events.ts`
  y cubrirlo con tests. Nunca llamar a `gtag()` directamente.

## 14. Pruebas

```bash
npm test            # Vitest + jsdom (devDependencies)
npm run typecheck   # tsc --noEmit
npm run lint        # next lint
npm run build
```

Cobertura de `tests/analytics/`: nombres de evento y parámetros, ausencia de PII, lista blanca, deduplicación,
`search` (vacío / corto / PII / término estable), `view_item` sin duplicados (Strict Mode, re-render, producto distinto),
`select_item` por lista, diferenciación de los 12 `cta_location`, `/cart`, `form_submit` solo tras éxito,
bloqueo de `/admin` (carga directa, pushState, popstate, retorno a rutas públicas), clasificación de `page_type` y
cobertura estática de los CTA.

## 15. Limitaciones conocidas

* No se emite `quote_request` ni `calculator_use` (reservados).
* `form_submit` solo cubre el Asesor Verde (único formulario público con envío al servidor). El componente
  `sections/newsletter.tsx` existe pero no se usa en ninguna página.
* El bloqueo de `/admin` se valida mediante el interruptor oficial `ga-disable-*`; la confirmación a nivel de hit en
  GA4 requiere DebugView (§11).
* La cuota de eventos y los umbrales de muestreo de GA4 con ~100 usuarios/28 días siguen siendo bajos: esta instrumentación
  mejora la calidad, no el volumen.
