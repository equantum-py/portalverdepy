'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef, useState } from 'react';

import { DigitalNurseryCard } from '@/components/digital-nursery-card';
import { ProductCard } from '@/components/product-card';
import type { Product } from '@/lib/types';

type Props = {
  title: string;
  categorySlug: string;
  bannerDesktopUrl: string;
  bannerMobileUrl: string;
  products: Product[];
  showViewAll: boolean;
  mobileColumns: 1 | 2;
  mobileSwipe: boolean;
  mobileShowProgress: boolean;
  nurseryMode?: boolean;
};

export function CategoryProductsBannerSection({
  title,
  categorySlug,
  bannerDesktopUrl,
  bannerMobileUrl,
  products,
  showViewAll,
  mobileColumns,
  mobileSwipe,
  mobileShowProgress,
  nurseryMode = false,
}: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  const categoryUrl = `/shop?category=${encodeURIComponent(categorySlug)}`;
  const bannerUrl = bannerMobileUrl || bannerDesktopUrl;

  if (!bannerUrl && products.length === 0) return null;

  const renderCard = (product: Product) =>
    nurseryMode ? (
      <DigitalNurseryCard
        item={{
          id: product.id,
          name: product.name,
          variant: product.unit?.replace(/^Tamaño:\s*/i, '') ?? '',
          description: product.description,
          imageUrl: product.image,
          whatsappMessage: '',
        }}
      />
    ) : (
      <ProductCard product={product} />
    );

  function scroll(direction: -1 | 1) {
    const element = scrollerRef.current;
    if (!element) return;
    element.scrollBy({ left: Math.max(element.clientWidth * 0.85, 220) * direction, behavior: 'smooth' });
  }

  function updateProgress() {
    const element = scrollerRef.current;
    if (!element) return;
    const maxScroll = element.scrollWidth - element.clientWidth;
    setProgress(maxScroll <= 0 ? 100 : Math.min(100, Math.max(0, (element.scrollLeft / maxScroll) * 100)));
  }

  const mobileCardWidth = mobileColumns === 1
    ? 'min-w-[78vw] basis-[78vw]'
    : 'min-w-[46vw] basis-[46vw]';

  return (
    <section className="border-b border-border/70 py-4 last:border-none sm:py-6 lg:py-7">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-700">Productos destacados</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-text-strong sm:text-3xl">{title}</h2>
        </div>
        {showViewAll ? (
          <Link href={categoryUrl} className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-brand-700 transition hover:text-brand-900">
            Ver todos <ArrowRight className="h-4 w-4" />
          </Link>
        ) : null}
      </div>

      <div className="flex items-start gap-2.5 sm:gap-3 lg:grid lg:grid-cols-[274px_minmax(0,1fr)] lg:items-stretch lg:gap-4">
        {bannerUrl ? (
          <Link
            href={categoryUrl}
            className="group relative block h-auto w-[38vw] max-w-[160px] shrink-0 self-start overflow-hidden rounded-2xl border border-border bg-white shadow-sm sm:w-[180px] sm:max-w-none lg:h-full lg:min-h-[441px] lg:w-auto"
            style={{ aspectRatio: '274 / 441' }}
          >
            <Image
              src={bannerUrl}
              alt={`Banner ${title}`}
              fill
              sizes="(max-width: 639px) 38vw, (max-width: 1023px) 180px, 274px"
              className="object-contain object-top transition duration-500 group-hover:scale-[1.01] lg:object-cover lg:object-center"
            />
          </Link>
        ) : (
          <div className="w-[38vw] max-w-[160px] shrink-0 rounded-2xl border border-dashed border-border bg-brand-50 sm:w-[180px] sm:max-w-none lg:min-h-[441px] lg:w-auto" style={{ aspectRatio: '274 / 441' }} />
        )}

        <div className="relative min-w-0 flex-1 overflow-hidden">
          <div
            ref={scrollerRef}
            onScroll={updateProgress}
            className={`flex snap-x snap-mandatory items-start gap-2.5 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-3 lg:h-full lg:items-stretch lg:gap-4 ${mobileSwipe ? 'touch-pan-x' : ''}`}
          >
            {products.map((product) => (
              <div
                key={product.id}
                className={`${mobileCardWidth} flex shrink-0 snap-start sm:min-w-[260px] sm:basis-[260px] lg:min-w-[calc(33.333%-11px)] lg:basis-[calc(33.333%-11px)]`}
              >
                <div className="w-full">{renderCard(product)}</div>
              </div>
            ))}
          </div>

          {products.length > 1 ? (
            <>
              <button type="button" onClick={() => scroll(-1)} aria-label="Productos anteriores" className="absolute left-1 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-border bg-white/95 p-2 text-brand-800 shadow-md transition hover:bg-white sm:inline-flex">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button type="button" onClick={() => scroll(1)} aria-label="Productos siguientes" className="absolute right-1 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-border bg-white/95 p-2 text-brand-800 shadow-md transition hover:bg-white sm:inline-flex">
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          ) : null}
        </div>
      </div>

      {mobileShowProgress ? (
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-slate-200 lg:hidden">
          <div className="h-full rounded-full bg-brand-700 transition-[width] duration-150" style={{ width: `${Math.max(12, progress)}%` }} />
        </div>
      ) : null}
    </section>
  );
}
