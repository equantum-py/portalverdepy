import { HeroCarouselEditor } from '@/components/admin/home-content/hero-carousel-editor';
import { getHomeContent } from '@/lib/home-content/public';

export default async function BannersPage() {
  const content = await getHomeContent();

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-green-700">
          Contenido
        </p>
        <h1 className="mt-2 text-3xl font-semibold">Banners</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-500">
          Administrá los banners del carrusel principal, sus imágenes para Desktop y Mobile, el orden y la configuración de reproducción.
        </p>
      </header>

      <HeroCarouselEditor
        initialSlides={content.heroSlides}
        initialSettings={content.carousel}
      />
    </div>
  );
}
