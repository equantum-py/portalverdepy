import Image from 'next/image';

import type { Category } from '../lib/types';

export function CategoryCard({ category }: { category: Category }) {
  return (
    <article className="rounded-xl border border-border bg-white p-4 shadow-card">
      <Image
        src={category.image ?? '/images/category-living.svg'}
        alt={category.name}
        width={640}
        height={420}
        quality={95}
        className="h-44 w-full rounded-lg object-cover"
      />
      <h3 className="mt-4 text-lg font-semibold">{category.name}</h3>
      <p className="mt-2 text-sm text-text-soft">
        {category.description ?? 'Explorá productos seleccionados para tu espacio verde.'}
      </p>
    </article>
  );
}