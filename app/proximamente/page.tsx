import type { Metadata } from 'next';
import Image from 'next/image';
import { ArrowUpRight, Leaf, MessageCircle } from 'lucide-react';

import { createWhatsAppUrl } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Muy pronto | Portal Verde Online',
  description:
    'Estamos preparando Portal Verde Online: productos y soluciones para transformar tu jardín.',
  robots: {
    index: false,
    follow: false
  }
};

const whatsappUrl = createWhatsAppUrl(
  'Hola, quiero recibir novedades sobre el lanzamiento de Portal Verde Online.'
);

export default function ComingSoonPage() {
  return (
    <main className="relative isolate flex min-h-screen overflow-hidden bg-[#f2f7f1] px-5 py-6 text-[#102d1c] sm:px-8 sm:py-8">
      <div className="pointer-events-none absolute -left-28 -top-24 h-80 w-80 rounded-full bg-[#cdeccf]/70 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-[#9ed8a6]/45 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.035] [background-image:radial-gradient(#123c24_1px,transparent_1px)] [background-size:18px_18px]" />

      <section className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col overflow-hidden rounded-[2rem] border border-white/80 bg-white/75 shadow-[0_28px_90px_rgba(20,73,38,0.12)] backdrop-blur-sm">
        <header className="flex items-center justify-between border-b border-[#dce9de] px-5 py-5 sm:px-9">
          <Image
            src="/images/logo-desktop.png"
            alt="Portal Verde"
            width={176}
            height={64}
            priority
            className="h-auto w-32 sm:w-40"
          />
          <span className="inline-flex items-center gap-2 rounded-full border border-[#b9d9bd] bg-[#edf8ee] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#17652f] sm:px-4 sm:text-xs">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#24a148]" />
            Próximamente
          </span>
        </header>

        <div className="grid flex-1 items-center gap-10 px-6 py-10 sm:px-10 sm:py-14 lg:grid-cols-[1.15fr_0.85fr] lg:px-16 lg:py-16">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-[#27733d]">
              <Leaf className="h-4 w-4" aria-hidden="true" />
              Estamos arreglando el jardín
            </div>
            <h1 className="text-balance text-4xl font-semibold leading-[1.03] tracking-[-0.04em] text-[#0e321d] sm:text-6xl lg:text-7xl">
              Algo verde y hermoso está por florecer.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-[#52665a] sm:text-lg sm:leading-8">
              Muy pronto llega <strong className="font-semibold text-[#185c2d]">Portal Verde Online</strong>, un nuevo espacio para encontrar todo lo que necesitás para transformar tu jardín.
            </p>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-whatsapp-source="coming-soon"
              className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#176b32] px-6 text-sm font-semibold text-white shadow-lg shadow-[#176b32]/20 hover:-translate-y-0.5 hover:bg-[#125a29] sm:min-h-14 sm:px-8 sm:text-base"
            >
              <MessageCircle className="h-5 w-5" aria-hidden="true" />
              Quiero recibir novedades
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>

          <div className="relative mx-auto aspect-square w-full max-w-[390px]" aria-hidden="true">
            <div className="absolute inset-[8%] rounded-full border border-[#b8dbbe] bg-gradient-to-br from-[#e5f4e6] to-[#b7ddb9] shadow-[inset_0_0_0_18px_rgba(255,255,255,0.45)]" />
            <div className="absolute left-[21%] top-[19%] h-[57%] w-[25%] origin-bottom -rotate-[28deg] rounded-[100%_0_100%_0] bg-gradient-to-br from-[#63ac67] to-[#1d6d35] shadow-xl" />
            <div className="absolute right-[21%] top-[19%] h-[57%] w-[25%] origin-bottom rotate-[28deg] rounded-[0_100%_0_100%] bg-gradient-to-bl from-[#8cc887] to-[#277b3c] shadow-xl" />
            <div className="absolute bottom-[20%] left-1/2 h-[49%] w-[2px] -translate-x-1/2 bg-[#225c32]" />
            <div className="absolute bottom-[15%] left-1/2 w-[44%] -translate-x-1/2 rounded-full bg-white/90 px-4 py-3 text-center text-xs font-bold uppercase tracking-[0.2em] text-[#1a6030] shadow-lg sm:text-sm">
              Portal Verde Online
            </div>
          </div>
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[#dce9de] px-6 py-5 text-xs text-[#66776b] sm:px-9 sm:text-sm">
          <span>Muy pronto, más cerca tuyo.</span>
          <span className="font-medium text-[#326341]">Césped · Plantas · Paisajismo</span>
        </footer>
      </section>
    </main>
  );
}
