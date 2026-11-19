import type { Metadata } from 'next';

import { CategorySidebar } from "@/components/category-sidebar";
import { WhatsAppFloating } from "@/components/whatsapp-floating";
import { getHomeContent } from "@/lib/home-content/public";
import { getPublicProducts } from "@/lib/products/catalog-products";
import { getPublicNurseryPlants } from "@/lib/public-nursery-catalog";
import { HomeHero } from "@/sections/home-hero";
import { ProductSection } from "@/sections/product-section";
import { ServicesSection } from "@/sections/services-section";
import { CategoryProductsBannerSection } from "@/sections/category-products-banner-section";
import { DigitalNurserySection } from "@/sections/digital-nursery-section";
import { ServiceBannersSection } from "@/sections/service-banners-section";

export const metadata: Metadata = {
  title: 'Césped Esmeralda y Pasto Kavaju en Gran Asunción',
  description:
    'Venta e instalación de Césped Esmeralda y Pasto Kavaju, plantas, jardinería y paisajismo en Limpio, Asunción y Gran Asunción.',
  alternates: { canonical: '/' },
  openGraph: {
    url: '/',
    title: 'Césped Esmeralda y Pasto Kavaju en Gran Asunción | Portal Verde',
    description:
      'Césped, plantas, jardinería y paisajismo para Limpio, Asunción y Gran Asunción.'
  }
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

function normalizeCategory(value: string) {
  return value.trim().toLowerCase();
}

export default async function HomePage() {
  const [products, content, nurseryPlants] = await Promise.all([
    getPublicProducts(),
    getHomeContent(),
    getPublicNurseryPlants({ includeAccessories: true }),
  ]);
  const cesped = products.filter((product) => product.categorySlug === "cesped");
  const piedras = products.filter((product) =>
    normalizeCategory(product.name).includes("piedra")
  );
  const paisajismo = products.filter(
    (product) =>
      product.categorySlug === "paisajismo" &&
      !normalizeCategory(product.name).includes("piedra")
  );
  const activeSections = [...content.sections].filter((section) => section.isActive).sort((a, b) => a.sortOrder - b.sortOrder);
  const serviceBanners = activeSections.filter((section) => section.key.startsWith("service-banner-"));
  const regularSections = activeSections.filter((section) => !section.key.startsWith("service-banner-"));

  return <>
    <main className="container-shell space-y-5 py-4 sm:space-y-6 sm:py-5 lg:py-6">
      {regularSections.map((section) => {
        if (section.key === "hero") { if (!content.heroEnabled) return null; return <div key={section.key}><div className="space-y-4 lg:hidden"><CategorySidebar /><HomeHero content={content} /></div><div className="hidden items-start gap-5 lg:grid lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)]"><CategorySidebar /><HomeHero content={content} /></div></div>; }
        if (section.sectionType === "banner-products" && section.categorySlug) {
          const isPlantsSection = ["plantas", "planta"].includes(normalizeCategory(section.categorySlug));
          const categoryProducts = (isPlantsSection
            ? nurseryPlants
            : products.filter((product) => normalizeCategory(product.categorySlug ?? "") === normalizeCategory(section.categorySlug))
          ).slice(0, section.productLimit);
          return <CategoryProductsBannerSection key={section.key} title={section.title} categorySlug={section.categorySlug} bannerDesktopUrl={section.bannerDesktopUrl} bannerMobileUrl={section.bannerMobileUrl} products={categoryProducts} showViewAll={section.showViewAll} mobileColumns={section.mobileColumns} mobileSwipe={section.mobileSwipe} mobileShowProgress={section.mobileShowProgress} />;
        }
        const isStandardPlantsSection =
          section.sectionType === "standard" &&
          (["plants", "plantas", "planta"].includes(normalizeCategory(section.key)) ||
            ["plantas", "planta"].includes(normalizeCategory(section.title)));
        if (isStandardPlantsSection) {
          return (
            <DigitalNurserySection
              key={section.key}
              title={section.title}
              plants={nurseryPlants}
              limit={8}
              showViewAll={section.showViewAll}
            />
          );
        }
        if (section.key === "products-grass") return <ProductSection key={section.key} title={section.title} products={cesped} />;
        if (section.key === "services") { if (!content.servicesEnabled) return null; return <ServicesSection key={section.key} />; }
        if (section.key === "products-landscaping") return <div key={section.key} className="space-y-5 sm:space-y-6"><ServiceBannersSection banners={serviceBanners} /><ProductSection title={section.title} products={paisajismo} /></div>;
        const isStonesSection =
          section.sectionType === "standard" &&
          (normalizeCategory(section.key).includes("piedra") ||
            normalizeCategory(section.title).includes("piedra"));
        if (isStonesSection) {
          return <ProductSection key={section.key} title={section.title} products={piedras} />;
        }
        return null;
      })}
    </main>
    {content.whatsappEnabled ? <WhatsAppFloating url={content.whatsappUrl} text={content.whatsappText} /> : null}
  </>;
}
