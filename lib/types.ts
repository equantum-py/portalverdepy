export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
};

export type ProductImage = {
  imageUrl: string;
  altText?: string | null;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  seoDescription?: string;
  benefits?: string[];
  recommendations?: string[];
  relatedProducts?: string[];
  relatedProductSlugs?: string[];
  price: number;
  category: string;
  categorySlug?: string;
  image: string;
  images?: ProductImage[];
  unit?: string;
  isNew?: boolean;
  isBestSeller?: boolean;
  isOffer?: boolean;
  isRecommended?: boolean;
  isFeatured?: boolean;
  previousPrice?: number;
  includesInstallation?: boolean;
  inStock?: boolean;
};
