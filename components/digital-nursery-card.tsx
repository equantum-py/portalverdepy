import Image from 'next/image';

import { WhatsAppIcon } from '@/components/icons';
import { createWhatsAppUrl } from '@/lib/site-config';

export type DigitalNurseryPublicItem = {
  id: string;
  name: string;
  variant: string;
  description: string;
  imageUrl: string;
  whatsappMessage: string;
};

export function DigitalNurseryCard({ item }: { item: DigitalNurseryPublicItem }) {
  const message =
    item.whatsappMessage ||
    `Hola, equipo de Portal Verde. Estoy interesado/a en la planta “${item.name}${item.variant ? ` - ${item.variant}` : ''}”. ¿Podrían confirmarme la disponibilidad y brindarme más información? Gracias.`;
  const whatsappUrl = createWhatsAppUrl(message);

  return (
    <article className="flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-[0_2px_12px_rgba(15,62,37,0.05)]">
      <div className="relative aspect-square w-full overflow-hidden rounded-t-2xl bg-[#f3ecdf]">
        <Image
          src={item.imageUrl || '/images/product-placeholder.webp'}
          alt={item.name}
          fill
          quality={90}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-contain p-[4%]"
        />
      </div>
      <div className="flex flex-1 flex-col p-2.5 sm:p-3.5">
        <p className="text-[10px] font-medium uppercase tracking-wide text-text-soft sm:text-xs">Plantas</p>
        <h3 className="mt-1 line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-text-strong sm:min-h-12 sm:text-base sm:leading-6">{item.name}</h3>
        <p className="mt-1 min-h-4 text-[11px] text-text-soft sm:text-xs">{item.variant ? `Tamaño: ${item.variant}` : '\u00a0'}</p>
        {item.description ? <p className="mt-2 hidden line-clamp-2 text-sm text-text-soft sm:block">{item.description}</p> : null}
        <div className="mt-auto pt-3 sm:pt-4">
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 w-full items-center justify-center gap-1.5 rounded-xl bg-brand-700 px-2 text-xs font-semibold text-white transition hover:bg-brand-800 sm:min-h-11 sm:gap-2 sm:px-3 sm:text-sm">
            <WhatsAppIcon className="h-4 w-4 shrink-0" />
            <span className="sm:hidden">Consultar</span>
            <span className="hidden sm:inline">Consultar por WhatsApp</span>
          </a>
        </div>
      </div>
    </article>
  );
}
