/**
 * Sanitización y detección de PII. Regla de la OT: a GA4 no viaja nombre,
 * teléfono, email, mensaje de WhatsApp, dirección ni texto libre del cliente.
 */

const EMAIL_RE = /[^\s@]+@[^\s@]+\.[^\s@]+/;
/** 7 o más dígitos, aunque estén separados por espacios, puntos, guiones o paréntesis. */
const PHONE_RE = /(?:\+?\d[\s().-]?){7,}/;

export const MAX_TEXT_LENGTH = 100;

export function containsPii(value: string): boolean {
  return EMAIL_RE.test(value) || PHONE_RE.test(value);
}

export function normalizeText(value: string, max = MAX_TEXT_LENGTH): string {
  return value.normalize('NFC').replace(/\s+/g, ' ').trim().slice(0, max);
}

/**
 * Normaliza un término de búsqueda para GA4. Devuelve null cuando no debe
 * medirse: vacío, menos de 2 caracteres o con apariencia de dato personal.
 */
export function sanitizeSearchTerm(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const term = normalizeText(raw).toLowerCase();
  if (term.length < 2) return null;
  if (containsPii(term)) return null;
  return term;
}

/** Claves que jamás deben enviarse, aunque alguien las agregue por error. */
export const BLOCKED_PARAM_KEYS = new Set([
  'name',
  'first_name',
  'last_name',
  'nombre',
  'apellido',
  'phone',
  'telefono',
  'teléfono',
  'email',
  'mail',
  'message',
  'mensaje',
  'whatsapp_message',
  'address',
  'direccion',
  'dirección',
  'zone',
  'zona',
  'notes',
  'observaciones',
  'question',
  'pregunta',
  'answer',
  'respuesta',
  'text',
  'page_url',
  'url',
  'href'
]);

/** Claves de identificadores: pueden tener muchos dígitos y no se tratan como PII. */
export const ID_PARAM_KEYS = new Set(['item_id', 'product_id', 'product_slug']);
