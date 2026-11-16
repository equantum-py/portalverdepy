/**
 * Identificadores de Google. Única fuente de verdad: el layout y la capa de
 * analytics importan desde aquí para evitar desincronización.
 */
export const GOOGLE_TAG_ID = 'GT-MKR6HCPJ';
export const GA4_MEASUREMENT_ID = 'G-X4SL2XNW02';
export const GOOGLE_ADS_ID = 'AW-18381728232';

/** Destinos de gtag que se silencian bajo /admin. */
export const ANALYTICS_DESTINATION_IDS = [
  GOOGLE_TAG_ID,
  GA4_MEASUREMENT_ID,
  GOOGLE_ADS_ID
] as const;

export const DEFAULT_CURRENCY = 'PYG';
