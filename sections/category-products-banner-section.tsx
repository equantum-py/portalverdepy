'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

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
  const mobileScrollerRef = useRef<HTMLDivElement>(null);
  const desktopScrollerRef = useRef<HTMLDivElement>(null);
  const firstMobileCardRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [mobileCardHeight, setMobileCardHeight] = useState<number | null>(null);

  const categoryUrl = `/shop?category=${encodeURIComponent(categorySlug)}`;
  const bannerUrl = bannerMobileUrl || bannerDesktopUrl;
  const isGrassBanner = categorySlug.trim().toLowerCase() === 'cesped';

  useEffect(() => {
    if (isGrassBanner) return;
    const element = firstMobileCardRef.current;
    if (!element) return;

    const update = () => setMobileCardHeight(Math.ceil(element.getBoundingClientRect().height));
    update();

    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, [isGrassBanner, products.length, mobileColumns]);

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

  function scrollDesktop(direction: -1 | 1) {
    const element = desktopScrollerRef.current;
    if (!element) return;
    element.scrollBy({ left: Math.max(element.clientWidth * 0.85, 220) * direction, behavior: 'smooth' });
  }

  function updateProgress() {
    const element = mobileScrollerRef.current;
    if (!element) return;
    const maxScroll = element.scrollWidth - element.clientWidth;
    setProgress(maxScroll <= 0 ? 100 : Math.min(100, Math.max(0, (element.scrollLeft / maxScroll) * 100)));
  }

  const mobileItemWidth = mobileColumns === 1
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

      <div className="lg:hidden">
        <div
          ref={mobileScrollerRef}
          onScroll={updateProgress}
          className={`flex items-start gap-2.5 overflow-x-auto overscroll-x-contain pb-3 touch-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${mobileSwipe ? 'snap-x snap-mandatory' : ''}`}
        >
          {bannerUrl ? (
            <Link
              href={categoryUrl}
              className={`${mobileItemWidth} relative shrink-0 snap-start overflow-hidden rounded-2xl shadow-sm ${isGrassBanner ? 'aspect-[340/548]' : 'border border-border bg-[#f7f5ef]'}`}
              style={!isGrassBanner && mobileCardHeight ? { height: `${mobileCardHeight}px` } : undefined}
            >
              <Image
                src={bannerUrl}
                alt={`Banner ${title}`}
                fill
                quality={isGrassBanner ? 90 : 95}
                sizes={mobileColumns === 1 ? '78vw' : '46vw'}
                className={isGrassBanner ? 'object-cover object-center' : 'object-contain object-center'}
                priority={false}
              />
            </Link>
          ) : null}

          {products.map((product, index) => (
            <div
              key={product.id}
              ref={index === 0 ? firstMobileCardRef : undefined}
              className={`${mobileItemWidth} flex shrink-0 snap-start`}
            >
              <div className="w-full">{renderCard(product)}</div>
            </div>
          ))}
        </div>

        {mobileShowProgress ? (
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-brand-700 transition-[width] duration-150" style={{ width: `${Math.max(12, progress)}%` }} />
          </div>
        ) : null}
      </div>

      <div className={`hidden lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,3fr)] lg:gap-4 ${isGrassBanner ? 'lg:items-start' : 'lg:items-stretch'}`}>
        {bannerDesktopUrl || bannerMobileUrl ? (
          <Link href={categoryUrl} className={`group relative w-full overflow-hidden rounded-2xl shadow-sm ${isGrassBanner ? 'aspect-[340/548]' : 'h-full min-h-[441px] border border-border bg-white'}`}>
            <Image
              src={bannerDesktopUrl || bannerMobileUrl}
              alt={`Banner ${title}`}
              fill
              quality={isGrassBanner ? 90 : 95}
              sizes="(min-width: 1536px) 360px, 25vw"
              className={`${isGrassBanner ? 'object-cover object-center' : 'object-contain object-top'} transition duration-500 group-hover:scale-[1.01]`}
            />
          </Link>
        ) : (
          <div className="h-full min-h-[441px] w-full rounded-2xl border border-dashed border-border bg-brand-50" />
        )}

        <div className="relative min-w-0 overflow-hidden">
          <div ref={desktopScrollerRef} className="flex h-full snap-x snap-mandatory items-stretch gap-4 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {products.map((product) => (
              <div key={product.id} className="flex min-w-[calc(33.333%-11px)] basis-[calc(33.333%-11px)] shrink-0 snap-start">
                <div className="w-full">{renderCard(product)}</div>
              </div>
            ))}
          </div>

          {products.length > 1 ? (
            <>
              <button type="button" onClick={() => scrollDesktop(-1)} aria-label="Productos anteriores" className="absolute left-2 top-1/2 z-10 inline-flex -translate-y-1/2 rounded-full border border-border bg-white/95 p-2 text-brand-800 shadow-md transition hover:bg-white">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button type="button" onClick={() => scrollDesktop(1)} aria-label="Productos siguientes" className="absolute right-2 top-1/2 z-10 inline-flex -translate-y-1/2 rounded-full border border-border bg-white/95 p-2 text-brand-800 shadow-md transition hover:bg-white">
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
}
