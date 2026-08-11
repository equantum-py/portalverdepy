import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Check, CheckCircle2, ChevronRight, Clock3, PackageCheck, ShieldCheck, Sparkles } from 'lucide-react';
import { ProductCard } from '@/components/product-card';
import { ProductGallery } from '@/components/products/product-gallery';
import { formatPricePYG } from '@/lib/format-price';
import { getPublicProducts } from '@/lib/products/catalog-products';
import type { Product } from '@/lib/types';
import { getPublicProductBySlug } from '@/lib/products/public-products';
import { WhatsAppIcon } from '@/components/icons';
import { createWhatsAppUrl } from '@/lib/site-config';

type ProductPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const p = await getPublicProductBySlug(slug);
  if (!p) return { title: 'Producto no encontrado' };
  const description = p.seo_description ?? p.description ?? '';
  return { title: p.seo_title || p.name, description, alternates: p.canonical_url ? { canonical: p.canonical_url } : undefined, keywords: p.seo_keywords ?? undefined, openGraph: { title: p.seo_title || p.name, description, images: [{ url: p.mainImage || '' }] } };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const databaseProduct = await getPublicProductBySlug(slug);
  if (!databaseProduct) notFound();
  const product = { ...databaseProduct, category: databaseProduct.categoryName ?? 'Productos', image: databaseProduct.mainImage, price: Number(databaseProduct.price ?? 0), previousPrice: databaseProduct.previousPrice === null ? undefined : Number(databaseProduct.previousPrice), isOffer: Boolean(databaseProduct.promo_price), description: databaseProduct.full_description ?? databaseProduct.description ?? '', seoDescription: databaseProduct.seo_description ?? databaseProduct.description ?? '', benefits: databaseProduct.features, recommendations: databaseProduct.recommendations, relatedProducts: [] };
  const galleryImages = databaseProduct.images?.length ? databaseProduct.images.map((image: { imageUrl: string; altText?: string | null }) => ({ imageUrl: image.imageUrl, altText: image.altText || databaseProduct.main_image_alt || product.name })) : [{ imageUrl: databaseProduct.mainImage || product.image || '/images/product-placeholder.webp', altText: product.name }];
  const publicProducts = await getPublicProducts();
  const relatedProducts: Product[] = (databaseProduct.relatedProductSlugs ?? []).map((s: string) => publicProducts.find((i: Product) => i.slug === s)).filter((i: Product | undefined): i is Product => Boolean(i));
  const message = `Hola, equipo de Portal Verde. Quiero solicitar un presupuesto para “${product.name}”. ¿Podrían brindarme información sobre precio final, instalación y disponibilidad? Gracias.`;
  const whatsappUrl = createWhatsAppUrl(message);
  const tracking = { 'data-whatsapp-source': 'product_pdp', 'data-item-name': product.name, 'data-item-category': product.category } as const;

  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context':'https://schema.org','@type':'Product',name:product.name,description:product.seoDescription||product.description,image:galleryImages.map((i:{imageUrl:string})=>i.imageUrl),offers:{'@type':'Offer',priceCurrency:databaseProduct.currency||'PYG',price:product.price,availability:product.in_stock===false?'https://schema.org/OutOfStock':'https://schema.org/InStock'},additionalProperty:(databaseProduct.specifications??[]).map((s:{key:string;value:string})=>({'@type':'PropertyValue',name:s.key,value:s.value})) }).replace(/</g,'\\u003c') }} />
    <main className="container-shell pb-28 pt-4 sm:pb-12 sm:pt-7 lg:pt-10">
      <nav aria-label="Migas de pan" className="mb-4 flex items-center gap-1 overflow-hidden text-xs text-text-soft sm:mb-6 sm:text-sm"><Link href="/" className="shrink-0 transition hover:text-brand-700">Inicio</Link><ChevronRight className="h-3.5 w-3.5 shrink-0"/><Link href="/shop" className="shrink-0 transition hover:text-brand-700">Catálogo</Link><ChevronRight className="h-3.5 w-3.5 shrink-0"/><span className="truncate font-medium text-text-strong">{product.name}</span></nav>
      <Link href="/shop" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-700 transition hover:text-brand-900 sm:mb-7"><ArrowLeft className="h-4 w-4"/>Volver al catálogo</Link>
      <section className="grid items-start gap-4 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.9fr)] lg:gap-10">
        <div className="lg:sticky lg:top-32"><ProductGallery productName={product.name} images={galleryImages}/></div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-800">{product.category}</span>{product.isOffer?<span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">Precio promocional</span>:null}</div>
          <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-text-strong sm:text-4xl lg:text-5xl">{product.name}</h1>
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-text-soft sm:mt-4 sm:line-clamp-none sm:text-base sm:leading-7">{product.seoDescription||product.description}</p>
          <div className="mt-4 rounded-2xl border border-brand-100 bg-white p-4 shadow-soft sm:mt-6 sm:rounded-3xl sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-soft">Precio desde</p><div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1"><strong className="text-3xl font-bold tracking-tight text-brand-700 sm:text-4xl">{formatPricePYG(product.price)}</strong>{product.previousPrice?<span className="text-sm text-text-soft line-through">{formatPricePYG(product.previousPrice)}</span>:null}</div>
            {product.includesInstallation?<div className="mt-4 inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1.5 text-sm font-semibold text-green-800"><CheckCircle2 className="h-4 w-4"/>Instalación incluida</div>:null}
            <div className="mt-5 grid gap-3 text-sm text-text-soft"><p className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-700"/>Asesoramiento antes de confirmar el pedido.</p><p className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-700"/>Materiales seleccionados para mayor duración.</p><p className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-700"/>Trabajo profesional con resultados garantizados.</p></div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2"><a href={whatsappUrl} {...tracking} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[#20bd5a]"><WhatsAppIcon className="h-5 w-5"/>Solicitar presupuesto</a><Link href="/trabajos" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-border bg-white px-5 text-sm font-semibold text-text-strong transition hover:border-brand-300 hover:bg-brand-50">Ver trabajos realizados</Link></div>
            <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-text-soft"><Clock3 className="h-3.5 w-3.5"/>Atención personalizada por WhatsApp</p>
          </div>
          {product.benefits?.length?<section className="mt-4 sm:mt-6"><div className="mb-3"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-700">Por qué elegirlo</p><h2 className="mt-1 text-xl font-semibold text-text-strong">Beneficios principales</h2></div><div className="grid grid-cols-2 gap-2.5">{product.benefits.map((benefit:string,index:number)=>{const icons=[Sparkles,ShieldCheck,PackageCheck,CheckCircle2];const Icon=icons[index%icons.length];return <div key={benefit} className="rounded-2xl border border-border bg-white p-4 shadow-sm"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-100 text-brand-700"><Icon className="h-4 w-4"/></span><p className="mt-3 text-sm font-medium leading-5 text-text-strong">{benefit}</p></div>})}</div></section>:null}
          {product.recommendations?.length?<section className="mt-3 sm:mt-6"><div className="rounded-3xl border border-border bg-white p-6 shadow-sm"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-700">Uso recomendado</p><h2 className="mt-1 text-xl font-semibold text-text-strong">Ideal para</h2><ul className="mt-4 grid gap-3">{product.recommendations.map((r:string)=><li key={r} className="flex items-start gap-3 text-sm leading-6 text-text-soft"><span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-100"><Check className="h-3 w-3 text-brand-700"/></span>{r}</li>)}</ul></div></section>:null}
        </div>
      </section>
      <section className="mt-6 rounded-2xl bg-brand-950 px-4 py-6 text-white sm:mt-14 sm:rounded-3xl sm:px-8 sm:py-8 lg:px-10"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-200">Simple y acompañado</p><h2 className="mt-2 text-2xl font-semibold sm:text-3xl">¿Cómo realizamos tu pedido?</h2><div className="mt-5 grid auto-cols-[82%] grid-flow-col gap-3 overflow-x-auto pb-2 sm:mt-7 sm:grid-flow-row sm:auto-cols-auto sm:grid-cols-2 sm:overflow-visible sm:pb-0 lg:grid-cols-4">{[{number:'01',title:'Consultás',text:'Nos contás qué necesitás y cuántos metros aproximados.'},{number:'02',title:'Asesoramos',text:'Te recomendamos el producto adecuado para tu espacio.'},{number:'03',title:'Coordinamos',text:'Confirmamos precio, disponibilidad y fecha de trabajo.'},{number:'04',title:'Instalamos',text:'Nuestro equipo realiza la instalación profesional.'}].map(step=><article key={step.number} className="rounded-2xl border border-white/10 bg-white/5 p-4"><span className="text-sm font-bold text-brand-300">{step.number}</span><h3 className="mt-3 font-semibold">{step.title}</h3><p className="mt-2 text-sm leading-6 text-white/70">{step.text}</p></article>)}</div></section>
      {relatedProducts.length?<section className="mt-10 sm:mt-14"><div className="mb-5 flex items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-700">Completá tu proyecto</p><h2 className="mt-1 text-2xl font-semibold tracking-tight text-text-strong sm:text-3xl">También te puede interesar</h2></div><Link href="/shop" className="shrink-0 text-sm font-semibold text-brand-700">Ver más</Link></div><div className="flex snap-x gap-3 overflow-x-auto pb-3 sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0 lg:grid-cols-4">{relatedProducts.map((p:Product)=><div key={p.id} className="w-[72%] shrink-0 snap-start sm:w-auto"><ProductCard product={p}/></div>)}</div></section>:null}
    </main>
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white/95 p-3 shadow-[0_-10px_30px_rgba(15,35,20,0.12)] backdrop-blur-lg sm:hidden"><div className="container-shell flex items-center gap-3 px-0"><div className="min-w-0 flex-1"><p className="text-[10px] uppercase tracking-wide text-text-soft">Desde</p><p className="truncate text-lg font-bold text-brand-700">{formatPricePYG(product.price)}</p></div><a href={whatsappUrl} {...tracking} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 text-sm font-semibold text-white"><WhatsAppIcon className="h-5 w-5"/>Presupuesto</a></div></div>
  </>;
}
