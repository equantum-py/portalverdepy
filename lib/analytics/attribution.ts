const STORAGE_KEY = 'portalverde_campaign_attribution';

const CAMPAIGN_KEYS = [
  'gclid',
  'gbraid',
  'wbraid',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term'
] as const;

export type Attribution = Record<string, string>;

/** Conserva la atribución de campaña de la sesión (solo en sessionStorage, nunca se envía cruda). */
export function captureAttribution(): Attribution {
  const params = new URLSearchParams(window.location.search);
  const current: Attribution = {};
  CAMPAIGN_KEYS.forEach((key) => {
    const value = params.get(key);
    if (value) current[key] = value;
  });

  let stored: Attribution = {};
  try {
    stored = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}') as Attribution;
  } catch {
    stored = {};
  }

  const merged = { ...stored, ...current };
  if (Object.keys(merged).length > 0) {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    } catch {
      /* almacenamiento no disponible */
    }
  }
  return merged;
}
