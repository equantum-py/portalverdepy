import { CategoryCard } from '@/components/category-card';
import { getPublicCategories } from '@/lib/categories/public-categories';

export async function FeaturedCategoriesSection() {
  const categories = await getPublicCategories();
  return (
    <section className="section-space pt-0">
      <div className="container-shell">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted">Categories</p>
            <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">Shop by room</h2>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </div>
    </section>
  );
}
