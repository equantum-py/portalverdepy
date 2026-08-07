import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck, Star } from "lucide-react";

import { WhatsAppIcon } from "@/components/icons";
import type { HomeContentValues } from "@/lib/home-content/schema";

const whatsappUrl = `https://wa.me/595981077600?text=${encodeURIComponent(
  "Hola, quiero solicitar un presupuesto para césped con instalación.",
)}`;

type HomeHeroProps = {
  content: HomeContentValues;
  previewViewport?: "desktop" | "mobile";
};

export function HomeHero({ content, previewViewport }: HomeHeroProps) {
  const desktopVisible =
    content.heroContentEnabled && content.heroContentDesktop;
  const mobileVisible = content.heroContentEnabled && content.heroContentMobile;
  const previewVisible =
    previewViewport === "desktop" ? desktopVisible : mobileVisible;
  const responsiveVisibility = mobileVisible
    ? desktopVisible
      ? "block"
      : "block lg:hidden"
    : desktopVisible
      ? "hidden lg:block"
      : "hidden";
  const contentVisibility = previewViewport
    ? previewVisible
      ? ""
      : "hidden"
    : responsiveVisibility;
  const overlayVisibility = contentVisibility;
  const overlayOpacity =
    Math.min(100, Math.max(0, content.heroShadowIntensity)) / 100;
  const mobileLayout = previewViewport === "mobile";

  return (
    <section
      aria-label="Portada principal"
      className="relative isolate overflow-hidden rounded-3xl bg-brand-950 shadow-soft"
    >
      <Image
        src={
          previewViewport === "mobile"
            ? content.heroMobileUrl
            : content.heroDesktopUrl
        }
        alt="Servicio profesional de jardinería y mantenimiento de césped"
        fill
        priority={!previewViewport}
        sizes="(max-width: 1024px) 100vw, 900px"
        className={`${previewViewport ? "" : "hidden lg:block"} object-cover object-left`}
      />
      {!previewViewport && (
        <Image
          src={content.heroMobileUrl}
          alt="Servicio profesional de jardinería y mantenimiento de césped"
          fill
          priority
          sizes="100vw"
          className="object-cover lg:hidden"
        />
      )}

      <div
        className={`absolute inset-0 bg-gradient-to-r from-brand-950 via-brand-950/75 to-brand-950/10 ${overlayVisibility}`}
        style={{ opacity: overlayOpacity }}
      />
      <div
        className={`absolute inset-0 bg-gradient-to-t from-brand-950/80 via-transparent to-transparent ${overlayVisibility} ${previewViewport === "desktop" ? "hidden" : previewViewport === "mobile" ? "" : "lg:hidden"}`}
        style={{ opacity: overlayOpacity }}
      />

      <div
        className={`relative flex min-h-[430px] items-end p-5 sm:min-h-[480px] sm:p-8 ${mobileLayout ? "" : "lg:min-h-[470px] lg:items-center lg:p-10 xl:p-12"}`}
      >
        <div className={`max-w-xl ${contentVisibility}`}>
          {content.heroShowLabel && (
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md sm:text-sm">
              <ShieldCheck className="h-4 w-4 text-brand-200" />
              Instalación profesional garantizada
            </div>
          )}
          {content.heroShowTitle && (
            <h1
              id={!previewViewport ? "home-hero-title" : undefined}
              className="max-w-lg text-3xl font-semibold leading-[1.08] tracking-tight text-white sm:text-4xl lg:text-5xl"
            >
              Transformamos tu espacio en un jardín que se disfruta
            </h1>
          )}
          {content.heroShowSubtitle && (
            <p className="mt-3 text-lg font-semibold text-brand-200">
              Césped natural de primera calidad
            </p>
          )}
          {content.heroShowDescription && (
            <p className="mt-4 max-w-lg text-sm leading-6 text-white/85 sm:text-base sm:leading-7">
              Venta e instalación de césped natural con asesoramiento
              profesional en Asunción y Gran Asunción.
            </p>
          )}
          {(content.heroShowPrice || content.heroShowInstallationBadge) && (
            <div className="mt-5 flex flex-wrap items-end gap-x-3 gap-y-1">
              {content.heroShowPrice && (
                <>
                  <span className="text-sm font-medium text-white/75">
                    Desde
                  </span>
                  <strong className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                    Gs. 31.000 m²
                  </strong>
                </>
              )}
              {content.heroShowInstallationBadge && (
                <span className="rounded-full bg-brand-300 px-2.5 py-1 text-xs font-semibold text-brand-950">
                  Instalación incluida
                </span>
              )}
            </div>
          )}
          {(content.heroShowPrimaryButton ||
            content.heroShowSecondaryButton) && (
            <div className="mt-6 grid gap-2.5 sm:flex sm:flex-wrap">
              {content.heroShowPrimaryButton && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 text-sm font-semibold text-white shadow-lg transition hover:bg-[#20bd5a]"
                >
                  <WhatsAppIcon className="h-5 w-5" />
                  Solicitar presupuesto
                </a>
              )}
              {content.heroShowSecondaryButton && (
                <Link
                  href="/shop"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white hover:text-brand-900"
                >
                  Ver catálogo
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          )}
          {content.heroShowBenefits && (
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
          )}
        </div>
      </div>
    </section>
  );
}
