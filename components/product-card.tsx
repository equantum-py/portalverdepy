import Image from 'next/image';

import { AddToCartButton } from '@/components/add-to-cart-button';
import Link from 'next/link';
import {
  CheckCircle2,
  Heart,
  PackageCheck
} from 'lucide-react';

import { formatPricePYG } from '@/lib/format-price';
import type { Product } from '@/lib/types';
import { WhatsAppIcon } from '@/components/icons';
import { createWhatsAppUrl } from '@/lib/site-config';

export function ProductCard({ product }: { product: Product }) {
  const whatsappMessage = `Hola, equipo de Portal Verde. Estoy interesado/a en el producto “${product.name}”. ¿Podrían confirmarme la disponibilidad y brindarme más información? Gracias.`;
  const whatsappUrl = createWhatsAppUrl(whatsappMessage);
  const saleUnit = product.unit ?? 'unidad';

  const discount =
    product.previousPrice && product.previousPrice > product.price
      ? Math.round(
          ((product.previousPrice - product.price) / product.previousPrice) *
            100
        )
      : null;

  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-soft">
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-brand-50">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />

          <div className="absolute left-2 top-2 flex max-w-[70%] flex-wrap gap-1.5">
            {discount ? (
              <span className="rounded-full bg-red-600 px-2 py-1 text-[10px] font-bold text-white shadow-sm sm:text-xs">
                -{discount}%
              </span>
            ) : null}

            {product.includesInstallation ? (
              <span className="rounded-full bg-white/95 px-2 py-1 text-[10px] font-semibold text-brand-800 shadow-sm backdrop-blur sm:text-xs">
                Instalación incluida
              </span>
            ) : null}
          </div>

          <button
            type="button"
            aria-label={`Agregar ${product.name} a favoritos`}
            className="absolute right-2 top-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-text-soft shadow-sm backdrop-blur transition hover:text-red-500"
          >
            <Heart className="h-4 w-4" />
          </button>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wide text-text-soft sm:text-xs">
            {product.category}
          </p>

          <Link href={`/product/${product.slug}`}>
            <h3 className="mt-1 line-clamp-2 min-h-[36px] text-sm font-semibold leading-5 text-text-strong transition group-hover:text-brand-800 sm:min-h-[48px] sm:text-base sm:leading-6">
              {product.name}
            </h3>
          </Link>

          <p className="mt-1.5 hidden line-clamp-2 text-xs leading-5 text-text-soft sm:block sm:text-sm">
            {product.description}
          </p>
        </div>

        <div className="mt-3">
          <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-1">
            <p className="text-base font-bold tracking-tight text-brand-700 sm:text-xl">
              {formatPricePYG(product.price)}
            </p>

            <span className="text-[11px] font-semibold text-brand-700 sm:text-sm">
              / {saleUnit}
            </span>

            {product.previousPrice ? (
              <p className="text-[10px] text-text-soft line-through sm:text-xs">
                {formatPricePYG(product.previousPrice)}
              </p>
            ) : null}
          </div>

          <div className="mt-2 space-y-1">
            <p className="flex items-center gap-1.5 text-[10px] font-medium text-brand-800 sm:text-xs">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              Trabajo garantizado
            </p>

            <p className="hidden items-center gap-1.5 text-xs text-text-soft sm:flex">
              <PackageCheck className="h-3.5 w-3.5 shrink-0" />
              Consultá disponibilidad
            </p>
          </div>
        </div>

        <div className="mt-auto pt-3">
          <div className="grid gap-2">
            <AddToCartButton product={product} />

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-10 w-full items-center justify-center gap-1.5 rounded-xl border border-brand-200 bg-white px-2 text-center text-[11px] font-semibold text-brand-800 transition hover:bg-brand-50 active:scale-[0.98] sm:min-h-11 sm:gap-2 sm:px-4 sm:text-sm"
            >
              <WhatsAppIcon className="h-4 w-4 shrink-0" />
              Consultar ahora
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
