'use client';

import Link from 'next/link';
import {
  ArrowRight,
  ChevronDown,
  Leaf,
  Sparkles,
  TreePine,
  Waves,
  Wrench
} from 'lucide-react';
import { useState } from 'react';

import type { Category, Product } from '@/lib/types';
import { cn } from '@/lib/utils';
import type { HomeContentValues } from '@/lib/home-content/schema';

const serviceLinks = [
  {
    title: 'Instalación de césped',
    description: 'Preparación e instalación profesional.',
    href: '/trabajos',
    icon: Leaf
  },
  {
    title: 'Paisajismo',
    description: 'Soluciones funcionales para cada espacio.',
    href: '/trabajos',
    icon: Sparkles
  },
  {
    title: 'Mantenimiento',
    description: 'Cuidado periódico de jardines.',
    href: '/trabajos',
    icon: Wrench
  },
  {
    title: 'Piscinas y exteriores',
    description: 'Complementos para áreas recreativas.',
    href: '/shop?category=Piscinas',
    icon: Waves
  }
];

export function MegaMenu({ categories, products, homeContent }: { categories: Category[]; products: Product[]; homeContent: HomeContentValues }) {
  const [isOpen, setIsOpen] = useState(false);
  const fallbackGroups = categories.slice(0, 2).map((category, index) => ({
    title: category.name,
    description: category.description || 'Productos seleccionados para tu espacio.',
    href: `/shop?category=${encodeURIComponent(category.name)}`,
    icon: index === 0 ? Leaf : TreePine,
    products: products.filter((product) => product.category === category.name).slice(0, 4)
  }));
  const menuGroups = homeContent.megaColumns.length
    ? homeContent.megaColumns.filter(column=>column.isActive).sort((a,b)=>a.sortOrder-b.sortOrder).map((column,index)=>({
        title:column.title,
        description:categories.find(category=>category.id===column.categoryId)?.description||'Productos seleccionados para tu espacio.',
        href:column.viewAllUrl,
        linkLabel:column.viewAllLabel,
        icon:index===0?Leaf:TreePine,
        products:column.productIds.map(id=>products.find(product=>product.id===id)).filter((product):product is Product=>Boolean(product))
      }))
    : fallbackGroups.map(group=>({...group,linkLabel:'Ver toda la categoría'}));

  const closeMenu = () => {
    setIsOpen(false);
  };

  if (!homeContent.megaMenuEnabled) return null;
  const configuredServices=homeContent.megaServices.filter(item=>item.isActive).sort((a,b)=>a.sortOrder-b.sortOrder);
  const workButton=homeContent.buttons.find(item=>item.placement==='mega-work'&&item.isActive);
  const ctaButton=homeContent.buttons.find(item=>item.placement==='mega-cta'&&item.isActive);
  return (
    <div
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          closeMenu();
        }
      }}
    >
      <button
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="true"
        onClick={() => setIsOpen((current) => !current)}
        className={cn(
          'inline-flex h-11 items-center gap-2 rounded-xl border px-4 text-sm font-semibold transition',
          isOpen
            ? 'border-brand-300 bg-brand-50 text-brand-800'
            : 'border-border bg-white text-text-strong hover:border-brand-300 hover:bg-brand-50'
        )}
      >
        Productos
        <ChevronDown
          aria-hidden="true"
          className={cn(
            'h-4 w-4 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      <div
        className={cn(
          'fixed left-1/2 top-[118px] z-[999] w-[min(1120px,calc(100vw-40px))] -translate-x-1/2 origin-top transition duration-200',
          isOpen
            ? 'visible translate-y-0 scale-100 opacity-100'
            : 'invisible -translate-y-2 scale-[0.98] opacity-0'
        )}
      >
        <div className="overflow-hidden rounded-3xl border border-border bg-white shadow-[0_24px_70px_rgba(15,35,20,0.18)]">
          <div className="grid lg:grid-cols-[1fr_1fr_300px]">
            {menuGroups.map((group) => {
              const Icon = group.icon;

              return (
                <section
                  key={group.title}
                  className="border-b border-border p-5 lg:border-b-0 lg:border-r lg:p-6"
                >
                  <Link
                    href={group.href}
                    onClick={closeMenu}
                    className="group flex items-start gap-3"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700 transition group-hover:bg-brand-700 group-hover:text-white">
                      <Icon className="h-5 w-5" />
                    </span>

                    <span>
                      <span className="block text-base font-semibold text-text-strong">
                        {group.title}
                      </span>

                      <span className="mt-1 block text-xs leading-5 text-text-soft">
                        {group.description}
                      </span>
                    </span>
                  </Link>

                  <ul className="mt-5 space-y-1.5">
                    {group.products.map((product) => (
                      <li key={product.id}>
                        <Link
                          href={`/product/${product.slug}`}
                          onClick={closeMenu}
                          className="group flex min-h-11 items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm transition hover:bg-brand-50"
                        >
                          <span className="min-w-0">
                            <span className="block truncate font-medium text-text-strong">
                              {product.name}
                            </span>

                            {product.includesInstallation ? (
                              <span className="mt-0.5 block text-[10px] font-medium text-green-700">
                                Instalación incluida
                              </span>
                            ) : null}
                          </span>

                          <ArrowRight className="h-4 w-4 shrink-0 text-brand-600 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
                        </Link>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={group.href}
                    onClick={closeMenu}
                    className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-700 transition hover:text-brand-900"
                  >
                    {group.linkLabel}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </section>
              );
            })}

            <aside className="bg-brand-950 p-5 text-white lg:p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-200">
                {homeContent.megaServicesTitle}
              </p>

              <h3 className="mt-2 text-xl font-semibold leading-tight">
                {homeContent.megaServicesDescription}
              </h3>

              <div className="mt-5 space-y-2">
                {configuredServices.map((service) => {
                  const Icon = serviceLinks.find(item=>item.icon.displayName===service.icon)?.icon ?? Leaf;

                  return (
                    <Link
                      key={service.title}
                      href={service.url}
                      onClick={closeMenu}
                      className="group flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3 transition hover:bg-white/10"
                    >
                      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" />

                      <span>
                        <span className="block text-sm font-semibold">
                          {service.title}
                        </span>

                        <span className="mt-0.5 block text-[11px] leading-4 text-white/60">
                          {service.description}
                        </span>
                      </span>
                    </Link>
                  );
                })}
              </div>

              {workButton&&<Link
                href={workButton.url}
                onClick={closeMenu}
                className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-brand-950 transition hover:bg-brand-100"
              >
                {workButton.text}
                <ArrowRight className="h-4 w-4" />
              </Link>}
            </aside>
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-border bg-brand-50 px-6 py-3">
            <p className="text-xs text-text-soft">
              ¿No sabés qué producto necesitás? Nuestro equipo puede orientarte.
            </p>

            {ctaButton&&<Link
              href={ctaButton.url}
              onClick={closeMenu}
              className="shrink-0 text-xs font-semibold text-brand-800"
            >
              {ctaButton.text} →
            </Link>}
          </div>
        </div>
      </div>
    </div>
  );
}
