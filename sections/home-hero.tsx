import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Star
} from 'lucide-react';

import { WhatsAppIcon } from '@/components/icons';
import type {HomeContentValues} from '@/lib/home-content/schema';

const whatsappNumber = '595981077600';

const whatsappMessage =
  'Hola, quiero solicitar un presupuesto para césped con instalación.';

const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
  whatsappMessage
)}`;

export function HomeHero({content}:{content:HomeContentValues}) {
  return (
    <section
      aria-labelledby="home-hero-title"
      className="relative isolate overflow-hidden rounded-3xl bg-brand-950 shadow-soft"
    >
      {/* Imagen de fondo */}
      <Image
        src={content.heroDesktopUrl}
        alt={content.heroAlt}
        fill
        priority
        sizes="(max-width: 1024px) 100vw, 900px"
        className="hidden object-cover object-left sm:block"
      />
      <Image
        src={content.heroMobileUrl}
        alt={content.heroAlt}
        fill
        priority
        sizes="100vw"
        className="object-cover sm:hidden"
      />

      {/* Capas para mejorar la lectura */}
      {content.heroOverlay&&<div className="absolute inset-0 bg-brand-950" style={{opacity:content.heroOverlayIntensity/100}} />}
      <div className="absolute inset-0 bg-gradient-to-t from-brand-950/80 via-transparent to-transparent lg:hidden" />

      <div className="relative flex min-h-[430px] items-end p-5 sm:min-h-[480px] sm:p-8 lg:min-h-[470px] lg:items-center lg:p-10 xl:p-12">
        <div className={`max-w-xl ${content.heroAlignment==='center'?'mx-auto text-center':content.heroAlignment==='right'?'ml-auto text-right':''}`}>
          {/* Etiqueta */}
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md sm:text-sm">
            <ShieldCheck className="h-4 w-4 text-brand-200" />
            {content.heroSubtitle}
          </div>

          {/* Título */}
          <h1
            id="home-hero-title"
            className="max-w-lg text-3xl font-semibold leading-[1.08] tracking-tight text-white sm:text-4xl lg:text-5xl"
          >
            {content.heroTitle}
          </h1>

          {/* Descripción */}
          <p className="mt-4 max-w-lg text-sm leading-6 text-white/85 sm:text-base sm:leading-7">
            {content.heroDescription}
          </p>

          {/* Precio */}
          <div className="mt-5 flex flex-wrap items-end gap-x-3 gap-y-1">
            <span className="text-sm font-medium text-white/75">
              Desde
            </span>

            <strong className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Gs. 31.000 m²
            </strong>

            <span className="rounded-full bg-brand-300 px-2.5 py-1 text-xs font-semibold text-brand-950">
              Instalación incluida
            </span>
          </div>

          {/* Acciones */}
          <div className="mt-6 grid gap-2.5 sm:flex sm:flex-wrap">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#20bd5a] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/30"
            >
              <WhatsAppIcon className="h-5 w-5" />
              Solicitar presupuesto
            </a>

            <Link
              href="/shop"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white hover:text-brand-900"
            >
              Ver catálogo
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Confianza */}
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/15 pt-5 text-xs text-white/80 sm:text-sm">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-brand-300" />
              Asesoramiento personalizado
            </span>

            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-brand-300" />
              Trabajo garantizado
            </span>

            <span className="inline-flex items-center gap-1.5">
              <Star className="h-4 w-4 fill-brand-300 text-brand-300" />
              Atención profesional
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
