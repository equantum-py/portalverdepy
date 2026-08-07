"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type {
  HeroCarouselSettings,
  HeroSlide,
} from "@/lib/home-content/hero-schema";
import { HomeHeroSlide } from "./home-hero-slide";

type Props = {
  slides: HeroSlide[];
  settings: HeroCarouselSettings;
  previewViewport?: "desktop" | "mobile";
};
export function HomeHeroCarousel({ slides, settings, previewViewport }: Props) {
  const activeSlides = useMemo(
    () =>
      slides
        .filter((s) => s.isActive)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [slides],
  );
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStart = useRef<number | null>(null);
  useEffect(() => {
    if (index >= activeSlides.length) setIndex(0);
  }, [activeSlides.length, index]);
  const move = useCallback(
    (direction: number) => {
      setIndex((current) => {
        const next = current + direction;
        if (settings.carouselLoop)
          return (next + activeSlides.length) % activeSlides.length;
        return Math.max(0, Math.min(activeSlides.length - 1, next));
      });
    },
    [activeSlides.length, settings.carouselLoop],
  );
  useEffect(() => {
    if (!settings.carouselAutoplay || paused || activeSlides.length < 2) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;
    const timer = window.setInterval(() => move(1), settings.carouselInterval);
    return () => window.clearInterval(timer);
  }, [
    activeSlides.length,
    move,
    paused,
    settings.carouselAutoplay,
    settings.carouselInterval,
  ]);
  if (!settings.carouselEnabled || activeSlides.length === 0) return null;
  const controls = settings.carouselManualNavigation && activeSlides.length > 1;
  return (
    <section
      aria-roledescription="carrusel"
      aria-label="Portada principal"
      tabIndex={controls ? 0 : -1}
      onKeyDown={(e) => {
        if (!controls) return;
        if (e.key === "ArrowLeft") move(-1);
        if (e.key === "ArrowRight") move(1);
      }}
      onMouseEnter={() => settings.carouselPauseOnHover && setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => {
        touchStart.current = e.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(e) => {
        if (!controls || touchStart.current === null) return;
        const delta =
          (e.changedTouches[0]?.clientX ?? touchStart.current) -
          touchStart.current;
        if (Math.abs(delta) > 40) move(delta < 0 ? 1 : -1);
        touchStart.current = null;
      }}
      className={`relative isolate w-full self-start overflow-hidden rounded-3xl bg-brand-950 shadow-soft ${previewViewport === "desktop" ? "aspect-[1920/650]" : previewViewport === "mobile" ? "aspect-[750/507]" : "aspect-[750/507] lg:aspect-[1920/650]"}`}
    >
      <div aria-live="off">
        {activeSlides.map((slide, slideIndex) => (
          <div
            key={slide.id}
            aria-hidden={slideIndex !== index}
            className={`absolute inset-0 transition-opacity duration-500 motion-reduce:transition-none ${slideIndex === index ? "z-10 opacity-100" : "pointer-events-none opacity-0"}`}
          >
            <HomeHeroSlide
              slide={slide}
              previewViewport={previewViewport}
              priority={slideIndex === 0}
            />
          </div>
        ))}
      </div>
      {controls && settings.carouselShowArrows && (
        <>
          <button
            type="button"
            aria-label="Diapositiva anterior"
            onClick={() => move(-1)}
            className="absolute left-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white"
          >
            <ChevronLeft />
          </button>
          <button
            type="button"
            aria-label="Diapositiva siguiente"
            onClick={() => move(1)}
            className="absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white"
          >
            <ChevronRight />
          </button>
        </>
      )}
      {controls && settings.carouselShowDots && (
        <div className="absolute bottom-2 left-1/2 z-20 flex -translate-x-1/2 gap-2">
          {activeSlides.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              aria-label={`Ir a diapositiva ${i + 1}`}
              aria-current={i === index}
              onClick={() => setIndex(i)}
              className={`h-2.5 w-2.5 rounded-full ring-1 ring-white ${i === index ? "bg-white" : "bg-white/40"}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
