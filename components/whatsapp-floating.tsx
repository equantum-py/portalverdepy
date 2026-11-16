'use client';

import { useEffect, useRef, useState } from 'react';

import { WhatsAppIcon } from '@/components/icons';
import { createWhatsAppUrl } from '@/lib/site-config';
import { useYieldToControls } from '@/lib/ui/use-yield-to-controls';

type WhatsAppFloatingProps = {
  url?: string;
  text?: string;
};

export function WhatsAppFloating({
  url = createWhatsAppUrl('Hola, equipo de Portal Verde. Estoy visitando su página web y quisiera recibir asesoramiento. ¿Podrían ayudarme? Gracias.'),
  text = 'Escribinos por WhatsApp',
}: WhatsAppFloatingProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const yielded = useYieldToControls(ref, !isDuplicate);

  // La burbuja se monta desde el layout compartido (route-shell) y, en la Home, también desde
  // app/page.tsx. Se conserva solo la última en el DOM (la que ya recibía los clics por quedar
  // encima), de modo que haya una única burbuja y un único elemento flotante con ese CTA.
  useEffect(() => {
    const all = document.querySelectorAll("a[data-wa-cta='floating']");
    setIsDuplicate(all.length > 1 && all[all.length - 1] !== ref.current);
  }, []);

  if (isDuplicate) return null;

  return (
    <a
      ref={ref}
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      data-wa-cta="floating"
      data-floating-widget
      aria-hidden={yielded || undefined}
      tabIndex={yielded ? -1 : undefined}
      aria-label={text || 'Contactar con Portal Verde por WhatsApp'}
      className={`whatsapp-floating fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-3 z-50 flex items-center gap-3 rounded-full bg-[#25D366] p-1 text-white max-sm:[body:has([data-wa-cta*=sticky])_&]:bottom-[calc(5.25rem+env(safe-area-inset-bottom))] sm:p-2 shadow-[0_12px_35px_rgba(0,0,0,0.25)] transition hover:-translate-y-1 hover:bg-[#20bd5a] sm:bottom-6 sm:right-6 sm:px-3 sm:py-2.5 transition-opacity ${yielded ? 'pointer-events-none opacity-0' : ''}`}
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#25D366] sm:h-11 sm:w-11">
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
