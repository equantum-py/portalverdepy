import type { HomeContentValues } from "@/lib/home-content/schema";
import { HomeHeroCarousel } from "./home-hero-carousel";

export function HomeHero({
  content,
  previewViewport,
}: {
  content: HomeContentValues;
  previewViewport?: "desktop" | "mobile";
}) {
  return (
    <HomeHeroCarousel
      slides={content.heroSlides}
      settings={content.carousel}
      previewViewport={previewViewport}
    />
  );
}
