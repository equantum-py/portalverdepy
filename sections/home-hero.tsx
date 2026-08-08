import type { HomeContentValues } from '@/lib/home-content/schema';
import { HomeHeroCarousel } from './home-hero-carousel';

type HomeHeroProps = {
  content: HomeContentValues;
  previewViewport?: 'desktop' | 'mobile';
};

export function HomeHero({
  content,
  previewViewport,
}: HomeHeroProps) {
  return (
    <HomeHeroCarousel
      slides={content.heroSlides}
      settings={content.carousel}
      previewViewport={previewViewport}
    />
  );
}
