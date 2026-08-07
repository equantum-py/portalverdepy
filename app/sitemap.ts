import type { MetadataRoute } from 'next';

import { getPublicCategories } from '@/lib/categories/public-categories';
import { getPublicProducts } from '@/lib/products/catalog-products';
import { siteConfig } from '@/lib/site-config';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([
    getPublicProducts(),
    getPublicCategories()
  ]);
  const updatedAt = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteConfig.url,
      lastModified: updatedAt,
      changeFrequency: 'weekly',
      priority: 1
    },
    {
      url: `${siteConfig.url}/shop`,
      lastModified: updatedAt,
      changeFrequency: 'weekly',
      priority: 0.9
    },
    {
      url: `${siteConfig.url}/trabajos`,
      lastModified: updatedAt,
      changeFrequency: 'monthly',
      priority: 0.8
    }
  ];

  const productPages: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${siteConfig.url}/product/${product.slug}`,
    lastModified: updatedAt,
    changeFrequency: 'weekly',
    priority: 0.8
  }));

  const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${siteConfig.url}/shop?category=${encodeURIComponent(category.name)}`,
    lastModified: updatedAt,
    changeFrequency: 'weekly',
    priority: 0.7
  }));

  return [...staticPages, ...categoryPages, ...productPages];
}
