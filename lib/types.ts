export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
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
  price: number;
  category: string;
  image: string;
  isNew?: boolean;
  isBestSeller?: boolean;
  isOffer?: boolean;
  isRecommended?: boolean;
  isFeatured?: boolean;
  previousPrice?: number;
  includesInstallation?: boolean;
  inStock?: boolean;
};
