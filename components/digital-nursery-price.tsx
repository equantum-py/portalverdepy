import { formatNurseryPrice, getNurseryPricing } from '@/lib/digital-nursery-pricing';

export function DigitalNurseryPrice({ pricing }: { pricing: ReturnType<typeof getNurseryPricing> }) {
  if (!pricing) return null;

  return (
    <div className="mt-2 text-sm">
      {pricing.previous !== null && (
        <p className="text-xs text-text-soft">Antes <s>{formatNurseryPrice(pricing.previous)}</s></p>
      )}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <strong className="break-words text-brand-800 sm:text-base">
          {pricing.previous !== null && <span className="sr-only">Ahora </span>}
          {formatNurseryPrice(pricing.current)}
        </strong>
        {pricing.discount !== null && (
          <span className="whitespace-nowrap rounded-full bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-950">
            {pricing.discount}% OFF
          </span>
        )}
      </div>
    </div>
  );
}
