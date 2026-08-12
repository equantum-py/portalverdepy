import Image from 'next/image';
import { ArrowUpRight, Droplets, Leaf } from 'lucide-react';

import type { HomeContentValues } from '@/lib/home-content/schema';

type Banner = HomeContentValues['sections'][number];

export function ServiceBannersSection({ banners }: { banners: Banner[] }) {
  const visibleBanners = banners.slice(0, 2);

  if (!visibleBanners.length) return null;

  return (
    <section aria-label="Servicios para tu jardín" className="border-y border-border py-7 sm:py-9">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">Servicios especializados</p>
        <h2 className="mt-1 text-2xl font-semibold text-text-strong sm:text-3xl">Cuidamos cada detalle de tu jardín</h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 sm:gap-5">
        {visibleBanners.map((banner, index) => {
          const desktopImage = banner.bannerDesktopUrl || banner.bannerMobileUrl;
          const mobileImage = banner.bannerMobileUrl || banner.bannerDesktopUrl;
          const Icon = index === 0 ? Droplets : Leaf;

          return (
            <a
              key={banner.key}
              href={banner.categorySlug || '#'}
              target={banner.categorySlug.startsWith('http') ? '_blank' : undefined}
              rel={banner.categorySlug.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="group relative aspect-[16/8] min-h-[190px] overflow-hidden rounded-2xl bg-[#164d2a] shadow-sm sm:aspect-[12/5] sm:min-h-[220px]"
            >
              {desktopImage ? (
                <picture>
                  {mobileImage ? <source media="(max-width: 639px)" srcSet={mobileImage} /> : null}
                  <Image src={desktopImage} alt={banner.title} fill quality={90} sizes="(max-width: 639px) 100vw, 50vw" className="object-cover transition duration-500 group-hover:scale-[1.02]" />
                </picture>
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-r from-[#092f19]/90 via-[#123f24]/55 to-transparent" />
              <div className="absolute inset-0 flex flex-col items-start justify-end p-5 text-white sm:p-7">
                <span className="mb-auto inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/15 backdrop-blur"><Icon className="h-5 w-5" /></span>
                <h3 className="max-w-[80%] text-2xl font-semibold leading-tight sm:text-3xl">{banner.title}</h3>
                <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold">Solicitar información <ArrowUpRight className="h-4 w-4" /></span>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}
