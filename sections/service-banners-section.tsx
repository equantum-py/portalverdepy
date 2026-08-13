import Image from 'next/image';

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
              className="group relative aspect-square w-full overflow-hidden rounded-2xl bg-[#164d2a] shadow-sm sm:aspect-[12/5] sm:min-h-[220px]"
            >
              {desktopImage ? (
                <picture>
                  {mobileImage ? <source media="(max-width: 639px)" srcSet={mobileImage} /> : null}
                  <Image src={desktopImage} alt={banner.title || 'Servicio de Portal Verde'} fill quality={90} sizes="(max-width: 639px) 100vw, 50vw" className="object-contain sm:object-cover sm:transition sm:duration-500 sm:group-hover:scale-[1.02]" />
                </picture>
              ) : null}
            </a>
          );
        })}
      </div>
    </section>
  );
}
