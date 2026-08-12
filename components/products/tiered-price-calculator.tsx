'use client';

import { Check, Minus, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { formatPricePYG } from '@/lib/format-price';
import { addPricedQuoteItem } from '@/lib/quote-storage';
import type { Product } from '@/lib/types';
import { WhatsAppIcon } from '@/components/icons';

type Tier = { id: string; minQuantity: number; maxQuantity: number | null; priceAmount: number; label: string };

export function TieredPriceCalculator({ product, tiers, minimumQuantity, unit, whatsappNumber }: { product: Product; tiers: Tier[]; minimumQuantity: number; unit: string; whatsappNumber: string }) {
  const ordered = useMemo(() => [...tiers].sort((a, b) => a.minQuantity - b.minQuantity), [tiers]);
  const [quantity, setQuantity] = useState(Math.max(minimumQuantity, ordered[0]?.minQuantity ?? 1));
  const [added, setAdded] = useState(false);
  const appliedIndex = Math.max(0, ordered.findIndex((tier) => quantity >= tier.minQuantity && (tier.maxQuantity === null || quantity <= tier.maxQuantity)));
  const applied = ordered[appliedIndex] ?? { minQuantity: minimumQuantity, maxQuantity: null, priceAmount: product.price, label: '' };
  const next = ordered[appliedIndex + 1];
  const total = Math.round(quantity * applied.priceAmount);
  const normalize = (value: number) => setQuantity(Math.max(minimumQuantity, Math.round(Number.isFinite(value) ? value : minimumQuantity)));
  const message = `Hola, quiero consultar por ${product.name}.\n\nCantidad aproximada: ${quantity} ${unit}\nPrecio aplicado: ${formatPricePYG(applied.priceAmount)} por ${unit}\nTotal estimado: ${formatPricePYG(total)}`;

  return <div className="mt-4 rounded-2xl border border-brand-100 bg-white p-4 shadow-sm sm:mt-6 sm:p-5">
    <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wider text-text-soft">Precio aplicado</p><p className="mt-1 text-2xl font-bold text-brand-700">{formatPricePYG(applied.priceAmount)} <span className="text-sm font-semibold">/ {unit}</span></p></div><span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-800">Mínimo {minimumQuantity} {unit}</span></div>
    <div className="mt-4"><p className="text-sm font-semibold text-text-strong">Cantidad</p><div className="mt-2 grid grid-cols-[44px_1fr_44px] overflow-hidden rounded-xl border"><button type="button" onClick={() => normalize(quantity - 1)} className="grid place-items-center border-r"><Minus className="h-4 w-4" /></button><div className="relative"><input type="number" min={minimumQuantity} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} onBlur={() => normalize(quantity)} className="h-12 w-full bg-white text-center text-lg font-semibold outline-none" /><span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-soft">{unit}</span></div><button type="button" onClick={() => normalize(quantity + 1)} className="grid place-items-center border-l"><Plus className="h-4 w-4" /></button></div></div>
    <div className="mt-4 space-y-2">{ordered.map((tier, index) => <div key={tier.id} className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2 text-sm ${index === appliedIndex ? 'border-brand-300 bg-brand-50' : 'border-border'}`}><span>{tier.maxQuantity === null ? `Desde ${tier.minQuantity}` : `${tier.minQuantity} a ${tier.maxQuantity}`} {unit}</span><span className="text-right font-semibold">{formatPricePYG(tier.priceAmount)}{index === appliedIndex ? <small className="ml-2 text-brand-700">Aplicado</small> : null}{tier.label ? <small className="ml-2 text-text-soft">{tier.label}</small> : null}</span></div>)}</div>
    <p className="mt-3 text-xs leading-5 text-text-soft">{next ? `Agregá ${Math.max(0, next.minQuantity - quantity)} ${unit} más para acceder a ${formatPricePYG(next.priceAmount)} por ${unit}.` : 'Ya accediste al mejor precio disponible.'}</p>
    <div className="mt-4 border-t pt-4"><p className="text-xs font-semibold uppercase tracking-wider text-text-soft">Total estimado</p><p className="mt-1 text-3xl font-bold text-text-strong">{formatPricePYG(total)}</p><p className="mt-1 text-xs text-text-soft">{quantity} {unit} × {formatPricePYG(applied.priceAmount)}</p></div>
    <p className="mt-3 text-[11px] leading-4 text-text-soft">Precio estimado sujeto a confirmación de disponibilidad y condiciones del terreno.</p>
    <div className="mt-4 grid gap-2 sm:grid-cols-2"><button type="button" onClick={() => { addPricedQuoteItem(product, quantity, applied.priceAmount, applied.label); setAdded(true); }} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-brand-700 px-4 text-sm font-semibold text-white">{added ? <Check className="h-4 w-4" /> : null}{added ? 'Agregado al presupuesto' : 'Solicitar presupuesto'}</button><a href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-brand-200 text-sm font-semibold text-brand-800"><WhatsAppIcon className="h-4 w-4" /> Consultar por WhatsApp</a></div>
  </div>;
}
