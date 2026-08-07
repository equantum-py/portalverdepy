import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Star,
} from 'lucide-react';

import { WhatsAppIcon } from '@/components/icons';
import type { HomeContentValues } from '@/lib/home-content/schema';

const whatsappUrl = `https://wa.me/595981077600?text=${encodeURIComponent(
  'Hola, quiero solicitar un presupuesto para césped con instalación.',
)}`;

type HomeHeroProps = {
  content: HomeContentValues;
  previewViewport?: 'desktop' | 'mobile';
};

export function HomeHero({
  content,
  previewViewport,
}: HomeHeroProps) {
  const isMobilePreview = previewViewport === 'mobile';

  const desktopContentVisible =
    content.heroContentEnabled &&
    content.heroContentDesktop;

  const mobileContentVisible =
    content.heroContentEnabled &&
    content.heroContentMobile;

  const previewContentVisible =
    previewViewport === 'desktop'
      ? desktopContentVisible
      : mobileContentVisible;

  const responsiveContentVisibility =
    mobileContentVisible && desktopContentVisible
      ? 'block'
      : mobileContentVisible
        ? 'block lg:hidden'
        : desktopContentVisible
          ? 'hidden lg:block'
          : 'hidden';

  const contentVisibility = previewViewport
    ? previewContentVisible
      ? 'block'
      : 'hidden'
    : responsiveContentVisibility;

  const desktopImage =
    content.heroDesktopUrl || content.heroMobileUrl;

  const mobileImage =
    content.heroMobileUrl || content.heroDesktopUrl;

  const previewImage = isMobilePreview
    ? mobileImage
    : desktopImage;

  const shadowIntensity = Math.min(
    100,
    Math.max(
      0,
      content.heroShadowIntensity ??
        content.heroOverlayIntensity ??
        0,
    ),
  );

  const overlayOpacity = shadowIntensity / 100;

  const alignmentClass =
    content.heroAlignment === 'center'
      ? 'items-center text-center'
      : content.heroAlignment === 'right'
        ? 'items-end text-right'
        : 'items-start text-left';

  const horizontalClass =
    content.heroAlignment === 'center'
      ? 'justify-center'
      : content.heroAlignment === 'right'
        ? 'justify-end'
        : 'justify-start';

  const hasVisibleContent =
    content.heroShowLabel ||
    content.heroShowTitle ||
    content.heroShowSubtitle ||
    content.heroShowDescription ||
    content.heroShowPrice ||
    content.heroShowInstallationBadge ||
    content.heroShowPrimaryButton ||
    content.heroShowSecondaryButton ||
    content.heroShowBenefits;

  const showOverlay =
    content.heroOverlay &&
    hasVisibleContent &&
    (previewViewport
      ? previewContentVisible
      : desktopContentVisible ||
        mobileContentVisible);

  return (
    <section
      aria-labelledby={
        content.heroShowTitle
          ? 'home-hero-title'
          : undefined
      }
      aria-label={
        content.heroShowTitle
          ? undefined
          : 'Portada principal'
      }
      className={`relative isolate overflow-hidden rounded-3xl bg-brand-950 shadow-soft ${
        previewViewport === 'mobile'
          ? 'aspect-[750/507]'
          : previewViewport === 'desktop'
            ? 'aspect-[1920/650]'
            : 'aspect-[750/507] lg:aspect-[1920/650]'
      }`}
    >
      {previewViewport ? (
        previewImage ? (
          <Image
            src={previewImage}
            alt={content.heroAlt}
            fill
            priority={false}
            sizes="900px"
            className="object-contain object-center"
          />
        ) : null
      ) : (
        <>
          {desktopImage ? (
            <Image
              src={desktopImage}
              alt={content.heroAlt}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 900px"
              className={
                content.heroMobileUrl
                  ? 'hidden object-contain object-center lg:block'
                  : 'object-contain object-center'
              }
            />
          ) : null}

          {mobileImage ? (
            <Image
              src={mobileImage}
              alt={content.heroAlt}
              fill
              priority
              sizes="100vw"
              className={
                content.heroDesktopUrl
                  ? 'object-contain object-center lg:hidden'
                  : 'object-contain object-center'
              }
            />
          ) : null}
        </>
      )}

      {showOverlay ? (
        <>
          <div
            className={`absolute inset-0 bg-gradient-to-r from-brand-950 via-brand-950/75 to-brand-950/10 ${contentVisibility}`}
            style={{ opacity: overlayOpacity }}
          />

          <div
            className={`absolute inset-0 bg-gradient-to-t from-brand-950/80 via-transparent to-transparent ${contentVisibility} ${
              previewViewport === 'desktop'
                ? 'hidden'
                : previewViewport === 'mobile'
                  ? 'block'
                  : 'lg:hidden'
            }`}
            style={{ opacity: overlayOpacity }}
          />
        </>
      ) : null}

      <div
        className={`absolute inset-0 flex ${horizontalClass} ${
          isMobilePreview
            ? 'items-end p-5'
            : previewViewport === 'desktop'
              ? 'items-center p-8 lg:p-10'
              : 'items-end p-5 sm:p-8 lg:items-center lg:p-10 xl:p-12'
        }`}
      >
        <div
          className={`flex max-w-xl flex-col ${alignmentClass} ${contentVisibility}`}
        >
          {content.heroShowLabel ? (
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md sm:text-sm">
              <ShieldCheck className="h-4 w-4 shrink-0 text-brand-200" />
              {content.heroSubtitle ||
                'Instalación profesional garantizada'}
            </div>
          ) : null}

          {content.heroShowTitle ? (
            <h1
              id={
                previewViewport
                  ? undefined
                  : 'home-hero-title'
              }
              className={`max-w-lg font-semibold leading-[1.08] tracking-tight text-white ${
                isMobilePreview
                  ? 'text-3xl'
                  : 'text-3xl sm:text-4xl lg:text-5xl'
              }`}
            >
              {content.heroTitle}
            </h1>
          ) : null}

          {content.heroShowSubtitle ? (
            <p className="mt-3 text-lg font-semibold text-brand-200">
              {content.heroSubtitle}
            </p>
          ) : null}

          {content.heroShowDescription ? (
            <p className="mt-4 max-w-lg text-sm leading-6 text-white/85 sm:text-base sm:leading-7">
              {content.heroDescription}
            </p>
          ) : null}

          {content.heroShowPrice ||
          content.heroShowInstallationBadge ? (
            <div className="mt-5 flex flex-wrap items-end gap-x-3 gap-y-1">
              {content.heroShowPrice ? (
                <>
                  <span className="text-sm font-medium text-white/75">
                    Desde
                  </span>

                  <strong className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                    Gs. 31.000 m²
                  </strong>
                </>
              ) : null}

              {content.heroShowInstallationBadge ? (
                <span className="rounded-full bg-brand-300 px-2.5 py-1 text-xs font-semibold text-brand-950">
                  Instalación incluida
                </span>
              ) : null}
            </div>
          ) : null}

          {content.heroShowPrimaryButton ||
          content.heroShowSecondaryButton ? (
            <div
              className={`mt-6 grid gap-2.5 ${
                isMobilePreview
                  ? ''
                  : 'sm:flex sm:flex-wrap'
              }`}
            >
              {content.heroShowPrimaryButton ? (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#20bd5a] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/30"
                >
                  <WhatsAppIcon className="h-5 w-5" />
                  Solicitar presupuesto
                </a>
              ) : null}

              {content.heroShowSecondaryButton ? (
                <Link
                  href="/shop"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white hover:text-brand-900"
                >
                  Ver catálogo
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : null}
            </div>
          ) : null}

          {content.heroShowBenefits ? (
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/15 pt-5 text-xs text-white/80 sm:text-sm">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-brand-300" />
                Asesoramiento personalizado
              </span>

              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-brand-300" />
                Trabajo garantizado
              </span>

              <span className="inline-flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-brand-300 text-brand-300" />
                Atención profesional
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}