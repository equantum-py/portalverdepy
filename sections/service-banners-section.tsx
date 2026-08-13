import Image from 'next/image';

import type { HomeContentValues } from '@/lib/home-content/schema';

type Banner = HomeContentValues['sections'][number];

export function ServiceBannersSection({ banners }: { banners: Banner[] }) {
  const visibleBanners = banners.slice(0, 2);

  if (!visibleBanners.length) return null;

  return (
    <section aria-label="Servicios para tu jardín" className="border-y border-border py-6 sm:py-9">
      <div className="mb-4 sm:mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">Servicios especializados</p>
        <h2 className="mt-1 text-[1.65rem] font-semibold leading-tight text-text-strong sm:text-3xl">Cuidamos cada detalle de tu jardín</h2>
      </div>
      <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0">
        {visibleBanners.map((banner) => {
          const desktopImage = banner.bannerDesktopUrl || banner.bannerMobileUrl;
          const mobileImage = banner.bannerMobileUrl || banner.bannerDesktopUrl;

          return (
            <a
              key={banner.key}
              href={banner.categorySlug || '#'}
              target={banner.categorySlug.startsWith('http') ? '_blank' : undefined}
              rel={banner.categorySlug.startsWith('http') ? 'noopener noreferrer' : undefined}
              aria-label={banner.title || 'Consultar servicio de Portal Verde'}
              className="group relative aspect-square w-[88%] shrink-0 snap-start overflow-hidden rounded-2xl bg-[#164d2a] shadow-sm sm:aspect-[12/5] sm:w-auto sm:min-h-[220px]"
            >
              {desktopImage ? (
                <picture>
                  {mobileImage ? <source media="(max-width: 639px)" srcSet={mobileImage} /> : null}
                  <Image src={desktopImage} alt={banner.title || 'Servicio de Portal Verde'} fill quality={90} sizes="(max-width: 639px) 88vw, 50vw" className="object-cover object-center transition duration-500 group-hover:scale-[1.02]" />
                </picture>
              ) : null}
            </a>
          );
        })}
      </div>
    </section>
  );
}
