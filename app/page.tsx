import { CategorySidebar } from "@/components/category-sidebar";
import { WhatsAppFloating } from "@/components/whatsapp-floating";
import { getHomeContent } from "@/lib/home-content/public";
import { getPublicProducts } from "@/lib/products/catalog-products";
import { HomeHero } from "@/sections/home-hero";
import { ProductSection } from "@/sections/product-section";
import { ServicesSection } from "@/sections/services-section";

export default async function HomePage() {
  const [products, content] = await Promise.all([
    getPublicProducts(),
    getHomeContent(),
  ]);

  const cesped = products.filter(
    (product) => product.category === "Césped",
  );

  const paisajismo = products.filter(
    (product) => product.category === "Paisajismo",
  );

  const activeSections = [...content.sections]
    .filter((section) => section.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <>
      <main className="container-shell space-y-4 py-3 sm:space-y-5 sm:py-4 lg:py-6">
        {activeSections.map((section) => {
          if (section.key === "hero") {
            return (
              <div key={section.key}>
                <div className="space-y-3 lg:hidden">
                  <CategorySidebar />
                  <HomeHero content={content} />
                </div>

                <div className="hidden gap-4 lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
                  <CategorySidebar />
                  <HomeHero content={content} />
                </div>
              </div>
            );
          }

          if (section.key === "products-grass") {
            return (
              <ProductSection
                key={section.key}
                title={section.title}
                products={cesped}
              />
            );
          }

          if (section.key === "services") {
            return (
              <ServicesSection key={section.key} />
            );
          }

          if (section.key === "products-landscaping") {
            return (
              <ProductSection
                key={section.key}
                title={section.title}
                products={paisajismo}
              />
            );
          }

          return null;
        })}
      </main>

      <WhatsAppFloating />
    </>
  );
}