'use client';

import { useState } from 'react';

import { DigitalNurseryPrice } from '@/components/digital-nursery-price';
import { getNurseryPricing, MAX_NURSERY_PRICE } from '@/lib/digital-nursery-pricing';

type Props = {
  normal: number | null;
  promotional: number | null;
  enabled: boolean;
};

export function NurseryPublicPriceFields({ normal, promotional, enabled }: Props) {
  const [normalInput, setNormalInput] = useState(normal?.toString() ?? '');
  const [promotionInput, setPromotionInput] = useState(promotional?.toString() ?? '');
  const [promotionEnabled, setPromotionEnabled] = useState(enabled);
  const normalPrice = normalInput === '' ? null : Number(normalInput);
  const promotionalPrice = promotionInput === '' ? null : Number(promotionInput);
  const pricing = getNurseryPricing(normalPrice, promotionalPrice, promotionEnabled);
  const invalidPromotion = promotionEnabled && pricing?.previous == null;
  const inputClass = 'h-11 w-full rounded-xl border border-slate-200 bg-white px-3';

  return (
    <fieldset className="grid gap-4 rounded-2xl border border-green-100 bg-green-50/60 p-4 sm:col-span-2">
      <legend className="px-2 text-sm font-semibold text-green-900">Precios públicos</legend>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm font-medium">
          Precio normal (Gs.)
          <input name="public_price" type="number" min={1} max={MAX_NURSERY_PRICE} step={1}
            value={normalInput} className={inputClass}
            onChange={(event) => setNormalInput(event.target.value)} />
        </label>
        <label className="grid gap-1.5 text-sm font-medium">
          Precio promocional (Gs.)
          <input name="promotional_price" type="number" min={1}
            max={MAX_NURSERY_PRICE}
            step={1} value={promotionInput} className={inputClass}
            aria-describedby={invalidPromotion ? 'nursery-promotion-error' : undefined}
            onChange={(event) => setPromotionInput(event.target.value)} />
        </label>
      </div>
      <label className="flex items-center gap-2 text-sm font-medium">
        <input name="promotion_enabled" type="checkbox" checked={promotionEnabled} className="h-4 w-4 accent-green-700"
          onChange={(event) => setPromotionEnabled(event.target.checked)} />
        Activar promoción
      </label>
      {invalidPromotion && (
        <p id="nursery-promotion-error" className="text-sm text-slate-600">
          Podés guardar sin promoción. Para activarla, cargá ambos precios y asegurate de que el promocional sea menor.
        </p>
      )}
      <div className="rounded-xl border border-green-100 bg-white p-3" aria-live="polite">
        <p className="text-xs font-medium text-text-soft">Vista previa del catálogo</p>
        {pricing ? <DigitalNurseryPrice pricing={pricing} /> : <p className="mt-1 text-sm">Consultar por WhatsApp</p>}
      </div>
    </fieldset>
  );
}
