'use client';

import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { updateProductStockAction } from '@/app/admin/(panel)/productos/actions/product-stock-actions';

type ProductStockToggleProps = {
  productId: string;
  productName: string;
  inStock: boolean;
};

export function ProductStockToggle({
  productId,
  productName,
  inStock,
}: ProductStockToggleProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState('');

  function changeStock(nextValue: boolean) {
    if (nextValue === inStock || isPending) return;

    setMessage('');

    startTransition(async () => {
      const result = await updateProductStockAction(productId, nextValue);

      if (!result.success) {
        setMessage(result.message);
        return;
      }

      router.refresh();
    });
  }

  return (
    <div className="relative min-w-[130px]">
      <div
        className={
          inStock
            ? 'flex items-center rounded-xl border border-green-200 bg-green-50 p-1'
            : 'flex items-center rounded-xl border border-red-200 bg-red-50 p-1'
        }
      >
        <button
          type="button"
          onClick={() => changeStock(true)}
          disabled={isPending}
          aria-label={`Marcar ${productName} como disponible`}
          className={
            inStock
              ? 'flex min-h-8 flex-1 items-center justify-center rounded-lg bg-white px-2 text-xs font-semibold text-green-700 shadow-sm'
              : 'flex min-h-8 flex-1 items-center justify-center rounded-lg px-2 text-xs font-medium text-slate-500 hover:text-green-700'
          }
        >
          {isPending && !inStock ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            'Disponible'
          )}
        </button>

        <button
          type="button"
          onClick={() => changeStock(false)}
          disabled={isPending}
          aria-label={`Marcar ${productName} como agotado`}
          className={
            !inStock
              ? 'flex min-h-8 flex-1 items-center justify-center rounded-lg bg-white px-2 text-xs font-semibold text-red-600 shadow-sm'
              : 'flex min-h-8 flex-1 items-center justify-center rounded-lg px-2 text-xs font-medium text-slate-500 hover:text-red-600'
          }
        >
          {isPending && inStock ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            'Agotado'
          )}
        </button>
      </div>

      {message ? (
        <div
          role="alert"
          className="absolute right-0 top-12 z-30 w-64 rounded-xl border border-red-200 bg-white p-3 text-xs text-red-700 shadow-xl"
        >
          {message}
        </div>
      ) : null}
    </div>
  );
}
