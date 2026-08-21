import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import type { HeroSlide } from "@/lib/home-content/hero-schema";

type Props = {
  slide: HeroSlide;
  previewViewport?: "desktop" | "mobile";
  priority?: boolean;
  primaryHeading?: boolean;
};

function HeroLink({ href, newTab, children, className }: { href: string; newTab: boolean; children: React.ReactNode; className: string; }) {
  if (/^https?:\/\//.test(href)) return <a href={href} target={newTab ? "_blank" : undefined} rel={newTab ? "noopener noreferrer" : undefined} className={className}>{children}</a>;
  return <Link href={href || "#"} target={newTab ? "_blank" : undefined} className={className}>{children}</Link>;
}

export function HomeHeroSlide({ slide, previewViewport, priority = false, primaryHeading = false }: Props) {
  const visible = slide.contentEnabled && (previewViewport === "desktop" ? slide.contentDesktop : previewViewport === "mobile" ? slide.contentMobile : true);
  const deviceVisibility = slide.contentMobile ? (slide.contentDesktop ? "block" : "block lg:hidden") : (slide.contentDesktop ? "hidden lg:block" : "hidden");
  const responsiveContent = previewViewport ? (visible ? "" : "hidden") : (slide.contentEnabled ? deviceVisibility : "hidden");
  const alignment = slide.alignment === "center" ? "items-center text-center" : slide.alignment === "right" ? "items-end text-right" : "items-start text-left";
  const headingClassName = "text-2xl font-semibold leading-tight text-white sm:text-3xl lg:text-4xl";

  return (
    <div className="absolute inset-0">
      <Image src={previewViewport === "mobile" ? slide.mobileUrl || slide.desktopUrl : slide.desktopUrl || slide.mobileUrl} alt={slide.altText} fill quality={95} priority={priority} sizes="(max-width:1023px) 100vw, 1080px" className={`${previewViewport ? "" : "hidden lg:block"} object-contain object-center`} />
      {!previewViewport && <Image src={slide.mobileUrl || slide.desktopUrl} alt={slide.altText} fill quality={95} priority={priority} sizes="100vw" className="object-contain object-center lg:hidden" />}
      {slide.overlayEnabled && visible && <div className={`absolute inset-0 bg-brand-950 ${responsiveContent}`} style={{ opacity: slide.overlayIntensity / 100 }} />}
      {visible && (
        <div className={`absolute inset-0 flex flex-col justify-end p-3 sm:p-5 lg:justify-center lg:p-8 xl:p-10 ${alignment} ${responsiveContent}`}>
          <div className="max-w-xl">
            {slide.showLabel && slide.label && <p className="mb-2 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur">{slide.label}</p>}
            {slide.showTitle && (primaryHeading ? <h1 className={headingClassName}>{slide.title}</h1> : <h2 className={headingClassName}>{slide.title}</h2>)}
            {slide.showSubtitle && slide.subtitle && <p className="mt-2 font-semibold text-brand-200">{slide.subtitle}</p>}
            {slide.showDescription && slide.description && <p className="mt-2 text-sm text-white/85 sm:text-base">{slide.description}</p>}
            {(slide.showPrice || slide.showInstallationBadge) && <div className="mt-3 flex flex-wrap items-center gap-2">
              {slide.showPrice && slide.priceText && <strong className="text-xl text-white sm:text-2xl">{slide.priceText}</strong>}
              {slide.showInstallationBadge && slide.installationBadgeText && <span className="rounded-full bg-brand-300 px-2.5 py-1 text-xs font-semibold text-brand-950">{slide.installationBadgeText}</span>}
            </div>}
            {(slide.showPrimaryButton || slide.showSecondaryButton) && <div className="mt-4 flex flex-wrap gap-2">
              {slide.showPrimaryButton && <HeroLink href={slide.primaryButtonUrl} newTab={slide.primaryButtonNewTab} className="inline-flex min-h-10 items-center rounded-xl bg-[#25D366] px-4 text-sm font-semibold text-white">{slide.primaryButtonText}</HeroLink>}
              {slide.showSecondaryButton && <HeroLink href={slide.secondaryButtonUrl} newTab={slide.secondaryButtonNewTab} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 text-sm font-semibold text-white">{slide.secondaryButtonText}<ArrowRight className="h-4 w-4" /></HeroLink>}
            </div>}
            {slide.showBenefits && slide.benefits.length > 0 && <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/85">{slide.benefits.map((benefit) => <span key={benefit} className="inline-flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-brand-300" />{benefit}</span>)}</div>}
          </div>
        </div>
      )}
    </div>
  );
}
