import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

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
};

export function CategoryProductsBannerSection({ title, categorySlug, bannerDesktopUrl, bannerMobileUrl, products, showViewAll, mobileColumns, mobileSwipe, mobileShowProgress }: Props) {
  if (!products.length) return null;
  const categoryUrl = `/shop?category=${encodeURIComponent(categorySlug)}`;
  const mobileCardWidth = mobileColumns === 1 ? 'min-w-[82vw]' : 'min-w-[calc(50%-5px)]';

  return <section className="border-b border-border/70 py-4 last:border-none sm:py-6 lg:py-7">
    <div className="mb-4 flex items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-700">Productos destacados</p><h2 className="mt-1 text-xl font-semibold tracking-tight text-text-strong sm:text-3xl">{title}</h2></div>{showViewAll ? <Link href={categoryUrl} className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-brand-700 transition hover:text-brand-900">Ver todos<ArrowRight className="h-4 w-4" /></Link> : null}</div>

    <div className="lg:grid lg:grid-cols-[274px_minmax(0,1fr)] lg:gap-4">
      {(bannerDesktopUrl || bannerMobileUrl) ? <Link href={categoryUrl} className="group relative mx-auto mb-4 block w-[274px] max-w-full overflow-hidden rounded-2xl border border-border bg-brand-50 shadow-sm lg:mx-0 lg:mb-0"><div className="relative aspect-[274/441]"><picture>{bannerMobileUrl ? <source media="(max-width: 1023px)" srcSet={bannerMobileUrl} /> : null}<Image src={bannerDesktopUrl || bannerMobileUrl} alt={`Banner ${title}`} fill sizes="274px" className="object-cover transition duration-500 group-hover:scale-[1.02]" /></picture></div></Link> : null}

      <div>
        {mobileSwipe ? <div className="flex snap-x snap-mandatory gap-2.5 overflow-x-auto pb-3 lg:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{products.map((product) => <div key={product.id} className={`${mobileCardWidth} snap-start` }><ProductCard product={product} /></div>)}</div> : <div className={`grid gap-2.5 lg:hidden ${mobileColumns === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>{products.map((product) => <ProductCard key={product.id} product={product} />)}</div>}
        {mobileSwipe && mobileShowProgress ? <div className="mt-1 h-1 overflow-hidden rounded-full bg-slate-200 lg:hidden"><div className="h-full w-1/2 rounded-full bg-brand-700" /></div> : null}
        <div className="hidden gap-4 lg:grid lg:grid-cols-3">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div>
      </div>
    </div>
  </section>;
}
