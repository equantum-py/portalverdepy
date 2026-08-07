import type { Metadata } from 'next';
import { Manrope } from "next/font/google";
import { SpeedInsights } from '@vercel/speed-insights/next';

import { siteConfig } from '@/lib/site-config';

import { RouteShell } from '@/components/route-shell';
import { getPublicCategories } from '@/lib/categories/public-categories';
import { getPublicProducts } from '@/lib/products/catalog-products';
import { getHomeContent } from '@/lib/home-content/public';

import './globals.css';
import '../styles/design-tokens.css';

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),

  title: {
    default:
      'Portal Verde | Césped, jardinería y paisajismo en Paraguay',
    template: '%s | Portal Verde'
  },

  description: siteConfig.description,

  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  publisher: siteConfig.name,

  alternates: {
    canonical: '/'
  },

  openGraph: {
    type: 'website',
    locale: 'es_PY',
    url: '/',
    siteName: siteConfig.name,
    title: 'Portal Verde | Transformamos tus espacios verdes',
    description: siteConfig.description,
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Portal Verde - Césped, jardinería y paisajismo'
      }
    ]
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Portal Verde | Transformamos tus espacios verdes',
    description: siteConfig.description,
    images: ['/opengraph-image']
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1
    }
  }
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [categories, products, homeContent] = await Promise.all([
    getPublicCategories(),
    getPublicProducts(),
    getHomeContent()
  ]);

  return (
    <html lang="es-PY">
      <body
        className={`${manrope.variable} bg-[#f8faf8] font-sans text-[#172019] antialiased`}
      >
<main><RouteShell categories={categories} products={products} homeContent={homeContent}>{children}</RouteShell></main>
<SpeedInsights />
      </body>
    </html>
  );
}
