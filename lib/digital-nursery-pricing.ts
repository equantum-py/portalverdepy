export const MAX_NURSERY_PRICE = 9_999_999_999;

export function isNurseryPrice(value: number | null): value is number {
  return value !== null && Number.isInteger(value) && value >= 1 && value <= MAX_NURSERY_PRICE;
}

const guaranies = new Intl.NumberFormat('es-PY');

export function formatNurseryPrice(price: number) {
  return `Gs. ${guaranies.format(price)}`;
}

export function getNurseryPricing(normal: number | null, promotional: number | null, enabled: boolean) {
  if (!isNurseryPrice(normal)) return null;

  if (enabled && isNurseryPrice(promotional) && promotional < normal) {
    const exactDiscount = ((normal - promotional) / normal) * 100;
    const discount = exactDiscount < 1 ? '<1' : String(Math.min(99, Math.round(exactDiscount)));

    return { current: promotional, previous: normal, discount };
  }

  return { current: normal, previous: null, discount: null };
}

export function buildNurseryWhatsAppMessage(item: {
  name: string;
  variant: string;
  whatsappMessage: string;
}, price: number | null) {
  const greeting = item.whatsappMessage.trim() ||
    'Hola, equipo de Portal Verde. ¿Podrían confirmarme la disponibilidad de esta planta?';
  const details = [
    `Planta: ${item.name}`,
    item.variant ? `Tamaño: ${item.variant}` : '',
    price !== null ? `Precio vigente: ${formatNurseryPrice(price)}` : ''
  ];

  return [greeting, '', ...details.filter(Boolean)].join('\n');
}
