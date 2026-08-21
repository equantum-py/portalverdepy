export const siteConfig = {
  name: 'Portal Verde',
  description:
    'Venta e instalación de césped, productos de jardinería, paisajismo y mantenimiento en Limpio, Asunción y Gran Asunción.',

  // Dominio canónico de producción. El dominio raíz redirige a www en Vercel.
  url: 'https://www.portalverdepy.com',

  contact: {
    phoneDisplay: '+595 984 053 683',
    phoneRaw: '+595984053683',
    whatsapp: '595984053683',
    email: 'hola@portalverde.com.py',
    coverage: 'Limpio, Asunción y Gran Asunción',
    schedule: 'Lunes a sábado'
  },

  social: {
    instagram: 'https://www.instagram.com/portalverde_py/',
    facebook:
      'https://www.facebook.com/p/Portal-Verde-61550756372757/'
  }
} as const;

export function createWhatsAppUrl(message: string) {
  return `https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent(
    message
  )}`;
}
