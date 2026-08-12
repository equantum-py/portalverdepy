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
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
      <div className="relative aspect-[4/3] overflow-hidden bg-[#f4eee3]">
        <Image
          src={item.imageUrl || '/images/product-placeholder.webp'}
          alt={item.name}
          fill
          quality={95}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-contain p-1"
        />
      </div>
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <p className="text-[10px] font-medium uppercase tracking-wide text-text-soft sm:text-xs">Plantas</p>
        <h3 className="mt-1 text-sm font-semibold leading-5 text-text-strong sm:text-base">{item.name}</h3>
        {item.variant ? <p className="mt-1 text-xs text-text-soft">Tamaño: {item.variant}</p> : null}
        {item.description ? <p className="mt-2 hidden line-clamp-2 text-sm text-text-soft sm:block">{item.description}</p> : null}
        <div className="mt-auto pt-4">
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-700 px-3 text-sm font-semibold text-white transition hover:bg-brand-800">
            <WhatsAppIcon className="h-4 w-4" /> Consultar por WhatsApp
          </a>
        </div>
      </div>
    </article>
  );
}
