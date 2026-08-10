import { WhatsAppIcon } from '@/components/icons';
import { createWhatsAppUrl } from '@/lib/site-config';

type WhatsAppFloatingProps = {
  url?: string;
  text?: string;
};

export function WhatsAppFloating({
  url = createWhatsAppUrl('Hola, equipo de Portal Verde. Estoy visitando su página web y quisiera recibir asesoramiento. ¿Podrían ayudarme? Gracias.'),
  text = 'Escribinos por WhatsApp',
}: WhatsAppFloatingProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={text || 'Contactar con Portal Verde por WhatsApp'}
      className="fixed bottom-5 right-4 z-50 flex items-center gap-3 rounded-full bg-[#25D366] p-2.5 text-white shadow-[0_12px_35px_rgba(0,0,0,0.25)] transition hover:-translate-y-1 hover:bg-[#20bd5a] sm:bottom-6 sm:right-6 sm:px-3 sm:py-2.5"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#25D366]">
        <WhatsAppIcon className="h-6 w-6" />
      </span>

      <span className="hidden pr-3 sm:block">
        <span className="block text-xs text-white/80">
          ¿Necesitás ayuda?
        </span>

        <span className="block text-sm font-semibold">
          {text || 'Escribinos por WhatsApp'}
        </span>
      </span>
    </a>
  );
}
