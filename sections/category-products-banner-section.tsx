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

export function CategoryProductsBannerSection({ title, categorySlug, bannerDesktopUrl, bannerMobileUrl, products, showViewAll, mobileColumns, mobileSwipe, mobileShowProgress, nurseryMode = false }: Props) {
  const mobileScrollerRef = useRef<HTMLDivElement>(null);
  const desktopScrollerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  if (!products.length) return null;

  const categoryUrl = `/shop?category=${encodeURIComponent(categorySlug)}`;
  const bannerUrl = bannerMobileUrl || bannerDesktopUrl;
  const renderCard = (product: Product) => nurseryMode ? (
    <DigitalNurseryCard item={{ id: product.id, name: product.name, variant: product.unit?.replace(/^Tamaño:\s*/i, '') ?? '', description: product.description, imageUrl: product.image, whatsappMessage: '' }} />
  ) : <ProductCard product={product} />;

  function scrollDesktop(direction: -1 | 1) {
    const element = desktopScrollerRef.current;
    if (!element) return;
    element.scrollBy({ left: Math.max(element.clientWidth * 0.9, 300) * direction, behavior: 'smooth' });
  }

  function updateMobileProgress() {
    const element = mobileScrollerRef.current;
    if (!element) return;
    const maxScroll = element.scrollWidth - element.clientWidth;
    if (maxScroll <= 0) { setProgress(100); return; }
    setProgress(Math.min(100, Math.max(0, (element.scrollLeft / maxScroll) * 100)));
  }

  const mobileProductWidth = mobileColumns === 1 ? 'min-w-[76vw] basis-[76vw]' : 'min-w-[44vw] basis-[44vw]';

  return (
    <section className="border-b border-border/70 py-4 last:border-none sm:py-6 lg:py-7">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-700">Productos destacados</p><h2 className="mt-1 text-xl font-semibold tracking-tight text-text-strong sm:text-3xl">{title}</h2></div>
        {showViewAll ? <Link href={categoryUrl} className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-brand-700 transition hover:text-brand-900">Ver todos <ArrowRight className="h-4 w-4" /></Link> : null}
      </div>

      <div className="lg:hidden">
        <div ref={mobileScrollerRef} onScroll={updateMobileProgress} className={`flex snap-x snap-mandatory items-stretch gap-2.5 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${mobileSwipe ? 'touch-pan-x' : ''}`}>
          {bannerUrl ? (
            <Link href={categoryUrl} className={`relative shrink-0 snap-start overflow-hidden rounded-2xl border border-border bg-white shadow-sm ${mobileColumns === 1 ? 'min-w-[42vw] basis-[42vw]' : 'min-w-[38vw] basis-[38vw]'}`}>
              <div className="relative h-full min-h-[390px] w-full">
                <Image src={bannerUrl} alt={`Banner ${title}`} fill sizes="42vw" className="object-cover" priority={false} />
              </div>
            </Link>
          ) : null}
          {products.map((product) => <div key={product.id} className={`${mobileProductWidth} shrink-0 snap-start`}>{renderCard(product)}</div>)}
        </div>
        {mobileShowProgress ? <div className="mt-1 h-1 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-brand-700 transition-[width] duration-150" style={{ width: `${Math.max(12, progress)}%` }} /></div> : null}
      </div>

      <div className="hidden lg:grid lg:grid-cols-[274px_minmax(0,1fr)] lg:items-stretch lg:gap-4">
        {bannerDesktopUrl || bannerMobileUrl ? <Link href={categoryUrl} className="group relative h-full min-h-[441px] overflow-hidden rounded-2xl border border-border bg-white shadow-sm"><Image src={bannerDesktopUrl || bannerMobileUrl} alt={`Banner ${title}`} fill sizes="274px" className="object-cover transition duration-500 group-hover:scale-[1.02]" /></Link> : <div className="h-full min-h-[441px] rounded-2xl border border-dashed border-border bg-brand-50" />}
        <div className="relative min-w-0">
          <div ref={desktopScrollerRef} className="flex h-full snap-x snap-mandatory items-stretch gap-4 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {products.map((product) => <div key={product.id} className="flex min-w-[calc(33.333%-11px)] basis-[calc(33.333%-11px)] snap-start"><div className="w-full">{renderCard(product)}</div></div>)}
          </div>
          {products.length > 1 ? <><button type="button" onClick={() => scrollDesktop(-1)} aria-label="Productos anteriores" className="absolute left-2 top-1/2 z-10 inline-flex -translate-y-1/2 rounded-full border border-border bg-white/95 p-2 text-brand-800 shadow-md transition hover:bg-white"><ChevronLeft className="h-5 w-5" /></button><button type="button" onClick={() => scrollDesktop(1)} aria-label="Productos siguientes" className="absolute right-2 top-1/2 z-10 inline-flex -translate-y-1/2 rounded-full border border-border bg-white/95 p-2 text-brand-800 shadow-md transition hover:bg-white"><ChevronRight className="h-5 w-5" /></button></> : null}
        </div>
      </div>
    </section>
  );
}
