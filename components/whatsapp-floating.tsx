'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { WhatsAppIcon } from '@/components/icons';
import { createWhatsAppUrl, siteConfig } from '@/lib/site-config';
import { useYieldToControls } from '@/lib/ui/use-yield-to-controls';

type WhatsAppFloatingProps = {
  url?: string;
  text?: string;
};

export function WhatsAppFloating({
  url: urlProp,
  text = 'Escribinos por WhatsApp',
}: WhatsAppFloatingProps) {
  const url = urlProp ?? createWhatsAppUrl('Hola, equipo de Portal Verde. Estoy visitando su página web y quisiera recibir asesoramiento. ¿Podrían ayudarme? Gracias.');
  const pathname = usePathname();
  const isCustomized = urlProp !== undefined && urlProp.replace(/\/+$/, '') !== `https://wa.me/${siteConfig.contact.whatsapp}`;
  const ref = useRef<HTMLAnchorElement>(null);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const yielded = useYieldToControls(ref, !isDuplicate);

  // La burbuja se monta desde el layout compartido (route-shell, valores por defecto) y, en la Home,
  // también desde app/page.tsx con el número/texto configurados en el panel. Debe quedar una sola:
  // gana la instancia con configuración personalizada desde el panel; si el panel solo contiene el
  // valor base (número del sitio sin mensaje) no hay personalización y se conserva la del layout,
  // que es la que los usuarios veían y usaban hasta ahora (con mensaje precargado).
  useEffect(() => {
    const all = Array.from(document.querySelectorAll<HTMLElement>("a[data-wa-cta='floating']"));
    if (all.length < 2) {
      setIsDuplicate(false);
      return;
    }
    const winner = all.filter((el) => el.dataset.waConfigured === 'true').pop() ?? all[all.length - 1];
    setIsDuplicate(winner !== ref.current);
    // Se reevalúa al cambiar de ruta: la instancia del layout persiste entre páginas.
  }, [pathname]);

  if (isDuplicate) return null;

  return (
    <a
      ref={ref}
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      data-wa-cta="floating"
      data-floating-widget
      data-wa-configured={isCustomized ? 'true' : undefined}
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
