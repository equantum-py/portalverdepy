import type { MetadataRoute } from 'next';

import { getPublicProducts } from '@/lib/products/catalog-products';
import { siteConfig } from '@/lib/site-config';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getPublicProducts();
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
    priority: product.categorySlug === 'cesped' ? 0.9 : 0.8
  }));

  return [...staticPages, ...productPages];
}
