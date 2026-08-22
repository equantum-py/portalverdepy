import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  MapPin,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

import { WhatsAppIcon } from '@/components/icons';

export const metadata: Metadata = {
  title: 'Trabajos realizados',
  description:
    'Conocé algunos proyectos de césped, jardinería y paisajismo realizados por Portal Verde.'
};

const projects = [
  {
    id: 1,
    title: 'Instalación de césped residencial',
    category: 'Césped',
    location: 'Asunción',
    image: '/images/trabajos/trabajo-1.jpg',
    description:
      'Preparación del terreno e instalación profesional para renovar por completo el patio.',
    features: [
      'Preparación del suelo',
      'Instalación profesional',
      'Asesoramiento de cuidado'
    ]
  },
  {
    id: 2,
    title: 'Renovación de jardín familiar',
    category: 'Paisajismo',
    location: 'Gran Asunción',
    image: '/images/banners/slide-2-desktop.webp',
    description:
      'Mejora integral del espacio verde con una propuesta funcional y de fácil mantenimiento.',
    features: [
      'Diseño del espacio',
      'Selección de materiales',
      'Terminación profesional'
    ]
  },
  {
    id: 3,
    title: 'Área verde para vivienda',
    category: 'Mantenimiento',
    location: 'Luque',
    image: '/images/banners/slide-1-desktop.webp',
    description:
      'Recuperación visual y mantenimiento del jardín para conservarlo sano y ordenado.',
    features: [
      'Limpieza general',
      'Mantenimiento del césped',
      'Recomendaciones personalizadas'
    ]
  }
];

const whatsappNumber = '595984053683';
const whatsappMessage =
  'Hola, quiero solicitar un presupuesto para un trabajo similar a los proyectos publicados en Portal Verde.';
const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
  whatsappMessage
)}`;

export default function TrabajosPage() {
  return (
    <main className="pb-12">
      {/* Hero */}
      <section className="container-shell py-4 sm:py-7 lg:py-10">
        <div className="relative isolate overflow-hidden rounded-3xl bg-brand-950 px-5 py-10 text-white sm:px-8 sm:py-14 lg:px-12 lg:py-16">
          <Image
            src="/images/banners/slide-2-desktop.webp"
            alt="Jardín terminado por Portal Verde"
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-35"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-brand-950 via-brand-950/90 to-brand-950/40" />

          <div className="relative max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-200">
              Proyectos reales
            </p>

            <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              Espacios transformados por Portal Verde
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-6 text-white/80 sm:text-base sm:leading-7">
              Conocé algunos trabajos de césped, jardinería, mantenimiento y
              paisajismo realizados por nuestro equipo.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[#20bd5a]"
              >
                <WhatsAppIcon className="h-5 w-5" />
                Solicitar un presupuesto
              </a>

              <Link
                href="/shop"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white hover:text-brand-900"
              >
                Ver productos
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Introducción */}
      <section className="container-shell py-6 sm:py-9">
        <div className="grid gap-5 rounded-3xl border border-brand-100 bg-white p-5 shadow-sm sm:p-7 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-700">
              Trabajo profesional
            </p>

            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-text-strong sm:text-3xl">
              No mostramos solo productos: mostramos resultados
            </h2>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-text-soft sm:text-base">
              Cada proyecto requiere una solución diferente. Evaluamos el
              espacio, recomendamos materiales y coordinamos el trabajo según
              las necesidades reales del cliente.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 lg:w-[360px]">
            <div className="rounded-2xl bg-brand-50 p-3 text-center">
              <ShieldCheck className="mx-auto h-5 w-5 text-brand-700" />
              <p className="mt-2 text-xs font-semibold text-text-strong">
                Trabajo garantizado
              </p>
            </div>

            <div className="rounded-2xl bg-brand-50 p-3 text-center">
              <Sparkles className="mx-auto h-5 w-5 text-brand-700" />
              <p className="mt-2 text-xs font-semibold text-text-strong">
                Terminación cuidada
              </p>
            </div>

            <div className="rounded-2xl bg-brand-50 p-3 text-center">
              <CheckCircle2 className="mx-auto h-5 w-5 text-brand-700" />
              <p className="mt-2 text-xs font-semibold text-text-strong">
                Atención personalizada
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Galería */}
      <section className="container-shell py-6 sm:py-9">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-700">
            Portafolio
          </p>

          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-text-strong sm:text-3xl">
            Trabajos destacados
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-text-soft">
            Algunos ejemplos de los servicios que podemos realizar para
            viviendas, comercios y otros espacios.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {projects.map((project) => (
            <article
              key={project.id}
              className="group overflow-hidden rounded-3xl border border-border bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-soft"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-brand-50">
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />

                <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-brand-800 shadow-sm backdrop-blur">
                  {project.category}
                </span>
              </div>

              <div className="p-5">
                <div className="flex items-center gap-1.5 text-xs text-text-soft">
                  <MapPin className="h-3.5 w-3.5 text-brand-700" />
                  {project.location}
                </div>

                <h3 className="mt-2 text-xl font-semibold leading-tight text-text-strong">
                  {project.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-text-soft">
                  {project.description}
                </p>

                <ul className="mt-4 space-y-2">
                  {project.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-sm text-text-soft"
                    >
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <a
                  href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                    `Hola, quiero consultar por un trabajo similar a: ${project.title}.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-700 px-4 text-sm font-semibold text-white transition hover:bg-brand-800"
                >
                  <WhatsAppIcon className="h-4 w-4" />
                  Quiero algo similar
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Proceso */}
      <section className="container-shell py-6 sm:py-10">
        <div className="rounded-3xl bg-brand-950 px-5 py-8 text-white sm:px-8 lg:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-200">
            Proceso simple
          </p>

          <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">
            ¿Cómo trabajamos?
          </h2>

          <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                number: '01',
                title: 'Nos contás tu idea',
                text: 'Compartís fotos, medidas aproximadas y ubicación.'
              },
              {
                number: '02',
                title: 'Evaluamos',
                text: 'Analizamos el espacio y recomendamos una solución.'
              },
              {
                number: '03',
                title: 'Coordinamos',
                text: 'Definimos materiales, presupuesto y fecha del trabajo.'
              },
              {
                number: '04',
                title: 'Ejecutamos',
                text: 'Realizamos el trabajo con seguimiento profesional.'
              }
            ].map((step) => (
              <article
                key={step.number}
                className="rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <span className="text-sm font-bold text-brand-300">
                  {step.number}
                </span>

                <h3 className="mt-3 font-semibold">{step.title}</h3>

                <p className="mt-2 text-sm leading-6 text-white/70">
                  {step.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="container-shell py-6 sm:py-10">
        <div className="rounded-3xl border border-brand-100 bg-brand-50 px-5 py-8 text-center sm:px-8 sm:py-10">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-700">
            Tu espacio puede ser el próximo
          </p>

          <h2 className="mx-auto mt-2 max-w-2xl text-2xl font-semibold tracking-tight text-text-strong sm:text-3xl">
            Contanos qué querés transformar
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-text-soft">
            Enviá fotos y medidas aproximadas. Nuestro equipo te orientará
            sobre materiales, instalación y presupuesto.
          </p>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-6 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[#20bd5a]"
          >
            <WhatsAppIcon className="h-5 w-5" />
            Hablar con un asesor
          </a>
        </div>
      </section>
    </main>
  );
}
