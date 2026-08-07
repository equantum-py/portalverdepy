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

const whatsappNumber = '595981077600';

const whatsappMessage =
  'Hola, quiero solicitar un presupuesto para césped con instalación.';

const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
  whatsappMessage,
)}`;

type HomeHeroProps = {
  content: Pick<
    HomeContentValues,
    | 'heroDesktopUrl'
    | 'heroMobileUrl'
    | 'heroAlt'
    | 'heroTitle'
    | 'heroSubtitle'
    | 'heroDescription'
    | 'heroAlignment'
    | 'heroOverlay'
    | 'heroOverlayIntensity'
    | 'heroContentEnabled'
    | 'heroContentDesktop'
    | 'heroContentMobile'
    | 'heroShowLabel'
    | 'heroShowTitle'
    | 'heroShowSubtitle'
    | 'heroShowDescription'
    | 'heroShowPrice'
    | 'heroShowInstallationBadge'
    | 'heroShowPrimaryButton'
    | 'heroShowSecondaryButton'
    | 'heroShowBenefits'
  >;

  previewMode?: 'desktop' | 'mobile';
};

export function HomeHero({
  content,
  previewMode,
}: HomeHeroProps) {
  const isPreviewMobile = previewMode === 'mobile';

  const previewImage = isPreviewMobile
    ? content.heroMobileUrl || content.heroDesktopUrl
    : content.heroDesktopUrl || content.heroMobileUrl;

  const showInPreview = previewMode
    ? isPreviewMobile
      ? content.heroContentMobile
      : content.heroContentDesktop
    : true;

  const showContent =
    content.heroContentEnabled && showInPreview;

  const responsiveContentClass = previewMode
    ? showContent
      ? 'flex'
      : 'hidden'
    : !content.heroContentEnabled
      ? 'hidden'
      : content.heroContentDesktop &&
          content.heroContentMobile
        ? 'flex'
        : content.heroContentDesktop
          ? 'hidden sm:flex'
          : content.heroContentMobile
            ? 'flex sm:hidden'
            : 'hidden';

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

  const hasActions =
    content.heroShowPrimaryButton ||
    content.heroShowSecondaryButton;

  const layoutClass = isPreviewMobile
    ? 'items-end p-5'
    : previewMode === 'desktop'
      ? 'items-center p-8 lg:p-10'
      : 'items-end p-5 sm:items-center sm:p-8 lg:p-10 xl:p-12';

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
        previewMode === 'mobile'
          ? 'min-h-[460px]'
          : 'min-h-[430px] sm:min-h-[480px] lg:min-h-[470px]'
      }`}
    >
      {previewMode ? (
        previewImage ? (
          <Image
            src={previewImage}
            alt={content.heroAlt}
            fill
            sizes="900px"
            className="object-cover"
          />
        ) : null
      ) : (
        <>
          {content.heroDesktopUrl ? (
            <Image
              src={content.heroDesktopUrl}
              alt={content.heroAlt}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 900px"
              className={
                content.heroMobileUrl
                  ? 'hidden object-cover sm:block'
                  : 'object-cover'
              }
            />
          ) : null}

          {content.heroMobileUrl ? (
            <Image
              src={content.heroMobileUrl}
              alt={content.heroAlt}
              fill
              priority
              sizes="(max-width: 640px) 100vw, 900px"
              className={
                content.heroDesktopUrl
                  ? 'object-cover sm:hidden'
                  : 'object-cover'
              }
            />
          ) : null}
        </>
      )}

      {content.heroOverlay && showContent ? (
        <div
          className={`${responsiveContentClass} absolute inset-0 bg-gradient-to-t from-brand-950 via-brand-950/40 to-transparent sm:bg-gradient-to-r`}
          style={{
            opacity:
              content.heroOverlayIntensity / 100,
          }}
        />
      ) : null}

      <div
        className={`${responsiveContentClass} absolute inset-0 ${horizontalClass} ${layoutClass}`}
      >
        <div
          className={`flex max-w-xl flex-col gap-4 ${alignmentClass}`}
        >
          {content.heroShowLabel ? (
            <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-brand-950/45 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md sm:text-sm">
              <ShieldCheck className="h-4 w-4 shrink-0 text-brand-200" />

              {content.heroSubtitle}
            </div>
          ) : null}

          {content.heroShowTitle ? (
            <h1
              id="home-hero-title"
              className={`max-w-lg font-semibold leading-[1.08] tracking-tight text-white ${
                isPreviewMobile
                  ? 'text-3xl'
                  : 'text-3xl sm:text-4xl lg:text-5xl'
              }`}
            >
              {content.heroTitle}
            </h1>
          ) : null}

          {content.heroShowSubtitle ? (
            <p className="max-w-lg text-base font-semibold leading-6 text-white sm:text-lg">
              {content.heroSubtitle}
            </p>
          ) : null}

          {content.heroShowDescription ? (
            <p className="max-w-lg text-sm leading-6 text-white/90 sm:text-base sm:leading-7">
              {content.heroDescription}
            </p>
          ) : null}

          {content.heroShowPrice ? (
            <div className="flex flex-wrap items-end gap-x-3 gap-y-2">
              <span className="text-sm font-medium text-white/75">
                Desde
              </span>

              <strong className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Gs. 31.000 m²
              </strong>

              {content.heroShowInstallationBadge ? (
                <span className="rounded-full bg-brand-300 px-2.5 py-1 text-xs font-semibold text-brand-950">
                  Instalación incluida
                </span>
              ) : null}
            </div>
          ) : content.heroShowInstallationBadge ? (
            <span className="rounded-full bg-brand-300 px-2.5 py-1 text-xs font-semibold text-brand-950">
              Instalación incluida
            </span>
          ) : null}

          {hasActions ? (
            <div
              className={
                isPreviewMobile
                  ? 'grid w-full gap-2.5'
                  : 'grid w-full gap-2.5 sm:flex sm:w-auto sm:flex-wrap'
              }
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
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/30 bg-brand-950/35 px-5 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white hover:text-brand-900"
                >
                  Ver catálogo

                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : null}
            </div>
          ) : null}

          {content.heroShowBenefits ? (
            <div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-white/20 pt-4 text-xs text-white/85 sm:text-sm">
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