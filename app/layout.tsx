import type { Metadata } from 'next';
import { Manrope } from "next/font/google";
import Script from 'next/script';
import { SpeedInsights } from '@vercel/speed-insights/next';

import { siteConfig } from '@/lib/site-config';
import { AnalyticsProvider } from '@/components/analytics/analytics-provider';
import { getAnalyticsGuardScript } from '@/lib/analytics/admin-guard';
import { GA4_MEASUREMENT_ID, GOOGLE_ADS_ID, GOOGLE_TAG_ID } from '@/lib/analytics/config';
import { RouteShell } from '@/components/route-shell';
import { getPublicCategories } from '@/lib/categories/public-categories';
import { getPublicProducts } from '@/lib/products/catalog-products';
import { getHomeContent } from '@/lib/home-content/public';

import './globals.css';
import '../styles/design-tokens.css';

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });
const googleTagId = GOOGLE_TAG_ID;
const googleAnalyticsId = GA4_MEASUREMENT_ID;
const googleAdsId = GOOGLE_ADS_ID;

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: 'Portal Verde | Césped Esmeralda, Pasto Kavaju y paisajismo en Paraguay',
    template: '%s | Portal Verde'
  },
  description:
    'Césped Esmeralda, Pasto Kavaju, jardinería, paisajismo y mantenimiento para Limpio, Asunción y Gran Asunción.',
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  verification: {
    google: 'am0hj0OAjnewmz0aTNAxxHlsp3j8jlABLXkE0pRG4NE'
  },
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    shortcut: ['/icon.svg']
  },
  keywords: [
    'Césped Esmeralda',
    'Pasto Kavaju',
    'césped en Paraguay',
    'césped en Limpio',
    'paisajismo Gran Asunción',
    'jardinería Paraguay'
  ],
  openGraph: {
    type: 'website',
    locale: 'es_PY',
    siteName: siteConfig.name,
    title: 'Portal Verde | Césped, jardinería y paisajismo en Paraguay',
    description: siteConfig.description,
    images: [{
      url: '/opengraph-image',
      width: 1200,
      height: 630,
      alt: 'Portal Verde - Césped, jardinería y paisajismo'
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Portal Verde | Césped, jardinería y paisajismo en Paraguay',
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

const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': `${siteConfig.url}/#localbusiness`,
  name: siteConfig.name,
  url: siteConfig.url,
  description: siteConfig.description,
  telephone: siteConfig.contact.phoneRaw,
  areaServed: [
    { '@type': 'City', name: 'Limpio' },
    { '@type': 'City', name: 'Asunción' },
    { '@type': 'AdministrativeArea', name: 'Gran Asunción' }
  ],
  sameAs: [siteConfig.social.instagram, siteConfig.social.facebook]
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [categories, products, homeContent] = await Promise.all([
    getPublicCategories(),
    getPublicProducts(),
    getHomeContent()
  ]);

  return (
    <html lang="es-PY">
      <body className={`${manrope.variable} bg-[#f8faf8] font-sans text-[#172019] antialiased`}>
        <Script id="analytics-admin-guard" strategy="beforeInteractive">{getAnalyticsGuardScript()}</Script>
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${googleTagId}`} strategy="afterInteractive" />
        <Script id="google-tag" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${googleTagId}', { send_page_view: false });
          gtag('config', '${googleAnalyticsId}');
          gtag('config', '${googleAdsId}');
        `}</Script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(localBusinessSchema).replace(/</g, '\\u003c')
          }}
        />
        <AnalyticsProvider />
        <RouteShell categories={categories} products={products} homeContent={homeContent}>
          {children}
        </RouteShell>
        <SpeedInsights />
      </body>
    </html>
  );
}
