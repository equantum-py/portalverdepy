import { ArrowUpRight, ClipboardCheck, Droplets, Flower2, Waves, Wrench } from 'lucide-react';

import { WhatsAppIcon } from '@/components/icons';
import { createWhatsAppUrl } from '@/lib/site-config';

const services = [
  {
    name: 'Paisajismo',
    description: 'Diseño y transformación de jardines y espacios verdes.',
    icon: Flower2
  },
  {
    name: 'Mantenimiento de jardín',
    description: 'Cuidado periódico para conservar tu jardín limpio y saludable.',
    icon: Wrench
  },
  {
    name: 'Mantenimiento de piscina',
    description: 'Limpieza y cuidado profesional para mantener el agua en condiciones.',
    icon: Waves
  },
  {
    name: 'Colocación de riego automático',
    description: 'Instalación de sistemas de riego adaptados a cada espacio.',
    icon: Droplets
  },
  {
    name: 'Visita técnica',
    description: 'Evaluación del lugar para recomendar la solución adecuada y cotizar.',
    icon: ClipboardCheck
  }
];

export function ServicesCatalog() {
  return (
    <section aria-labelledby="services-title" className="mx-auto max-w-6xl">
      <div className="rounded-3xl bg-brand-950 px-5 py-7 text-white sm:px-8 sm:py-10">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-200">Servicios Portal Verde</p>
        <h1 id="services-title" className="mt-2 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">Soluciones profesionales para tu espacio</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70 sm:text-base">Contanos qué necesitás. Nuestro equipo evaluará tu proyecto y te brindará un presupuesto personalizado.</p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
        {services.map((service) => {
          const Icon = service.icon;
          const whatsappUrl = createWhatsAppUrl(`Hola, equipo de Portal Verde. Quiero consultar por el servicio de ${service.name}. ¿Podrían brindarme más información y ayudarme con un presupuesto?`);

          return (
            <article key={service.name} className="flex min-h-[230px] flex-col rounded-2xl border border-brand-100 bg-white p-5 shadow-sm sm:p-6">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100 text-brand-700"><Icon className="h-6 w-6" strokeWidth={1.8} /></span>
              <h2 className="mt-5 text-xl font-semibold leading-tight text-text-strong">{service.name}</h2>
              <p className="mt-2 text-sm leading-6 text-text-soft">{service.description}</p>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" data-whatsapp-source={`service-${service.name.toLowerCase().replaceAll(' ', '-')}`} className="mt-auto inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-700 px-4 pt-0 text-sm font-semibold text-white transition hover:bg-brand-800">
                <WhatsAppIcon className="h-4 w-4" /> Consultar por WhatsApp <ArrowUpRight className="h-4 w-4" />
              </a>
            </article>
          );
        })}
      </div>
    </section>
  );
}
