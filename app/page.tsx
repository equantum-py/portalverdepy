import { CategorySidebar } from "@/components/category-sidebar";
import { WhatsAppFloating } from "@/components/whatsapp-floating";
import { getHomeContent } from "@/lib/home-content/public";
import { getPublicProducts } from "@/lib/products/catalog-products";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";
import { HomeHero } from "@/sections/home-hero";
import { ProductSection } from "@/sections/product-section";
import { ServicesSection } from "@/sections/services-section";
import { CategoryProductsBannerSection } from "@/sections/category-products-banner-section";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function normalizeCategory(value: string) {
  return value.trim().toLowerCase();
}

async function getActiveNurseryPlants(): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("digital_nursery_items")
    .select("id,name,variant,description,image_url,sort_order")
    .eq("category", "Planta")
    .eq("is_active", true)
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("No se pudieron cargar las plantas activas del Vivero Digital en la Home:", error);
    return [];
  }

  return (data ?? []).map((item) => ({
    id: item.id,
    slug: `vivero-${item.id}`,
    name: item.name,
    description: item.description ?? "",
    price: 0,
    category: "Plantas",
    categorySlug: "plantas",
    image: item.image_url || "/images/product-placeholder.webp",
    images: item.image_url ? [{ imageUrl: item.image_url, altText: item.name }] : [],
    unit: item.variant ? `Tamaño: ${item.variant}` : undefined,
    inStock: true,
  }));
}

export default async function HomePage() {
  const [products, content, nurseryPlants] = await Promise.all([
    getPublicProducts(),
    getHomeContent(),
    getActiveNurseryPlants(),
  ]);
  const cesped = products.filter((product) => product.categorySlug === "cesped");
  const paisajismo = products.filter((product) => product.categorySlug === "paisajismo");
  const activeSections = [...content.sections].filter((section) => section.isActive).sort((a, b) => a.sortOrder - b.sortOrder);

  return <>
    <main className="container-shell space-y-5 py-4 sm:space-y-6 sm:py-5 lg:py-6">
      {activeSections.map((section) => {
        if (section.key === "hero") { if (!content.heroEnabled) return null; return <div key={section.key}><div className="space-y-4 lg:hidden"><CategorySidebar /><HomeHero content={content} /></div><div className="hidden items-start gap-5 lg:grid lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)]"><CategorySidebar /><HomeHero content={content} /></div></div>; }
        if (section.sectionType === "banner-products" && section.categorySlug) {
          const isPlantsSection = ["plantas", "planta"].includes(normalizeCategory(section.categorySlug));
          const categoryProducts = (isPlantsSection
            ? nurseryPlants
            : products.filter((product) => normalizeCategory(product.categorySlug ?? "") === normalizeCategory(section.categorySlug))
          ).slice(0, section.productLimit);
          return <CategoryProductsBannerSection key={section.key} title={section.title} categorySlug={section.categorySlug} bannerDesktopUrl={section.bannerDesktopUrl} bannerMobileUrl={section.bannerMobileUrl} products={categoryProducts} showViewAll={section.showViewAll} mobileColumns={section.mobileColumns} mobileSwipe={section.mobileSwipe} mobileShowProgress={section.mobileShowProgress} nurseryMode={isPlantsSection} />;
        }
        if (section.key === "products-grass") return <ProductSection key={section.key} title={section.title} products={cesped} />;
        if (section.key === "services") { if (!content.servicesEnabled) return null; return <ServicesSection key={section.key} />; }
        if (section.key === "products-landscaping") return <ProductSection key={section.key} title={section.title} products={paisajismo} />;
        return null;
      })}
    </main>
    {content.whatsappEnabled ? <WhatsAppFloating url={content.whatsappUrl} text={content.whatsappText} /> : null}
  </>;
}
