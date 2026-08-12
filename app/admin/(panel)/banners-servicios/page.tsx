import { ServiceBannersManager } from '@/components/admin/home-content/service-banners-manager';
import { getHomeContent } from '@/lib/home-content/public';

export default async function ServiceBannersPage() {
  const content = await getHomeContent();
  const banners = content.sections.filter((section) => section.key.startsWith('service-banner-')).map((section) => ({
    key: section.key as 'service-banner-irrigation' | 'service-banner-maintenance',
    title: section.title,
    isActive: section.isActive,
    link: section.categorySlug,
    desktopUrl: section.bannerDesktopUrl,
    desktopPath: section.bannerDesktopPath,
    mobileUrl: section.bannerMobileUrl,
    mobilePath: section.bannerMobilePath
  }));

  return <div className="mx-auto max-w-6xl"><header className="mb-6"><p className="text-xs font-semibold uppercase tracking-widest text-green-700">Contenido de la Home</p><h1 className="mt-2 text-3xl font-semibold">Banners de servicios</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Administrá los banners de Sistema de riego y Mantenimiento de jardines. Completá los pasos y guardá cada banner por separado.</p></header><ServiceBannersManager initialBanners={banners} /></div>;
}
