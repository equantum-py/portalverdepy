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
    .sort((first, second) => {
      return first.sortOrder - second.sortOrder;
    });

  return (
    <>
      <main className="container-shell space-y-5 py-4 sm:space-y-6 sm:py-5 lg:py-6">
        {activeSections.map((section) => {
          if (section.key === "hero") {
            if (!content.heroEnabled) {
              return null;
            }

            return (
              <section
                key={section.key}
                className="w-full"
                aria-label="Portada principal"
              >
                {/* Mobile y tablet */}
                <div className="space-y-4 lg:hidden">
                  <CategorySidebar />

                  <div className="w-full">
                    <HomeHero content={content} />
                  </div>
                </div>

                {/* Desktop */}
                <div className="hidden items-start gap-4 lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
                  <div className="self-start">
                    <CategorySidebar />
                  </div>

                  <div className="min-w-0 self-start">
                    <HomeHero content={content} />
                  </div>
                </div>
              </section>
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
            if (!content.servicesEnabled) {
              return null;
            }

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

      {content.whatsappEnabled ? (
        <WhatsAppFloating />
      ) : null}
    </>
  );
}