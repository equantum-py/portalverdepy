'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { WhatsAppFloating } from '@/components/whatsapp-floating';
import type { Category, Product } from '@/lib/types';
import type { HomeContentValues } from '@/lib/home-content/schema';

export function RouteShell({
  children,
  categories,
  products
  ,homeContent
}: {
  children: ReactNode;
  categories: Category[];
  products: Product[];
  homeContent: HomeContentValues;
}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Header categories={categories} products={products} homeContent={homeContent} />
      {children}
      <Footer />
      <WhatsAppFloating />
    </>
  );
}
