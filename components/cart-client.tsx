'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  Calculator,
  CheckCircle2,
  ClipboardList,
  MapPin,
  Minus,
  Plus,
  Ruler,
  Trash2
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { formatPricePYG } from '@/lib/format-price';
import {
  getQuoteItems,
  saveQuoteItems,
  type QuoteItem
} from '@/lib/quote-storage';

import { WhatsAppIcon } from '@/components/icons';

export function CartClient() {
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [zone, setZone] = useState('');
  const [needsInstallation, setNeedsInstallation] = useState(true);
  const [notes, setNotes] = useState('');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setItems(getQuoteItems());
    setIsReady(true);
  }, []);

  const subtotal = useMemo(
    () =>
      items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      ),
    [items]
  );

  const totalUnits = useMemo(
    () => items.reduce((total, item) => total + item.quantity, 0),
    [items]
  );

  const updateItems = (nextItems: QuoteItem[]) => {
    setItems(nextItems);
    saveQuoteItems(nextItems);
  };

  const updateQuantity = (id: string, quantity: number) => {
    updateItems(
      items.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, quantity) }
          : item
      )
    );
  };

  const removeItem = (id: string) => {
    updateItems(items.filter((item) => item.id !== id));
  };

  const whatsappMessage = useMemo(() => {
    const productLines = items
      .map(
        (item) =>
          `• ${item.name}\n  Cantidad: ${item.quantity}\n  Precio estimado: ${formatPricePYG(
            item.price * item.quantity
          )}`
      )
      .join('\n\n');

    return [
      'Hola, quiero solicitar un presupuesto en Portal Verde.',
      '',
      productLines,
      '',
      `Subtotal estimado: ${formatPricePYG(subtotal)}`,
      `Instalación: ${needsInstallation ? 'Sí' : 'No'}`,
      `Zona: ${zone || 'A confirmar'}`,
      notes ? `Observaciones: ${notes}` : ''
    ]
      .filter(Boolean)
      .join('\n');
  }, [items, needsInstallation, notes, subtotal, zone]);

  const whatsappUrl = `https://wa.me/595981077600?text=${encodeURIComponent(
    whatsappMessage
  )}`;

  if (!isReady) {
    return (
      <div className="rounded-3xl border border-border bg-white p-8 text-center">
        <p className="text-sm text-text-soft">Cargando presupuesto...</p>
      </div>
    );
  }

  if (!items.length) {
    return (
      <section className="rounded-3xl border border-border bg-white px-5 py-12 text-center shadow-sm sm:px-8">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-brand-700">
          <ClipboardList className="h-8 w-8" />
        </span>

        <h2 className="mt-5 text-2xl font-semibold text-text-strong">
          Tu presupuesto está vacío
        </h2>

        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-text-soft">
          Agregá césped, materiales o servicios para preparar una consulta
          completa y enviarla por WhatsApp.
        </p>

        <Link
          href="/shop"
          className="mt-6 inline-flex min-h-12 items-center justify-center rounded-xl bg-brand-700 px-6 text-sm font-semibold text-white"
        >
          Explorar catálogo
        </Link>
      </section>
    );
  }

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-700">
              Proyecto personalizado
            </p>

            <h2 className="mt-1 text-2xl font-semibold text-text-strong">
              Productos seleccionados
            </h2>
          </div>

          <span className="shrink-0 rounded-full bg-brand-100 px-3 py-1.5 text-xs font-semibold text-brand-800">
            {totalUnits} ítems
          </span>
        </div>

        {items.map((item) => (
          <article
            key={item.id}
            className="grid grid-cols-[96px_minmax(0,1fr)] gap-3 rounded-2xl border border-border bg-white p-3 shadow-sm sm:grid-cols-[140px_minmax(0,1fr)] sm:gap-5 sm:p-4"
          >
            <Link
              href={`/product/${item.slug}`}
              className="relative aspect-square overflow-hidden rounded-xl bg-brand-50"
            >
              <Image
                src={item.image}
                alt={item.name}
                fill
                sizes="140px"
                className="object-cover"
              />
            </Link>

            <div className="flex min-w-0 flex-col">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-text-soft sm:text-xs">
                    {item.category}
                  </p>

                  <Link href={`/product/${item.slug}`}>
                    <h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-5 text-text-strong sm:text-lg">
                      {item.name}
                    </h3>
                  </Link>
                </div>

                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  aria-label={`Eliminar ${item.name}`}
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600 transition hover:bg-red-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <p className="mt-2 text-base font-bold text-brand-700 sm:text-xl">
                {formatPricePYG(item.price)}
              </p>

              {item.includesInstallation ? (
                <p className="mt-1 flex items-center gap-1.5 text-[11px] font-medium text-green-700 sm:text-xs">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Instalación incluida
                </p>
              ) : null}

              <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-4">
                <div>
                  <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-text-soft">
                    Cantidad / m²
                  </p>

                  <div className="inline-flex h-10 items-center rounded-xl border border-border bg-white">
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.id, item.quantity - 1)
                      }
                      className="inline-flex h-full w-10 items-center justify-center text-brand-800"
                    >
                      <Minus className="h-4 w-4" />
                    </button>

                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(event) =>
                        updateQuantity(
                          item.id,
                          Number.parseInt(event.target.value, 10) || 1
                        )
                      }
                      className="h-full w-14 border-x border-border text-center text-sm font-semibold outline-none"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.id, item.quantity + 1)
                      }
                      className="inline-flex h-full w-10 items-center justify-center text-brand-800"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-wide text-text-soft">
                    Estimado
                  </p>

                  <p className="mt-1 text-sm font-bold text-text-strong sm:text-base">
                    {formatPricePYG(item.price * item.quantity)}
                  </p>
                </div>
              </div>
            </div>
          </article>
        ))}

        <Link
          href="/shop"
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-brand-200 bg-white px-5 text-sm font-semibold text-brand-800 transition hover:bg-brand-50"
        >
          Agregar más productos
        </Link>
      </section>

      <aside className="rounded-3xl border border-brand-100 bg-white p-5 shadow-soft lg:sticky lg:top-32 sm:p-6">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
            <Calculator className="h-5 w-5" />
          </span>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
              Resumen
            </p>

            <h2 className="text-xl font-semibold text-text-strong">
              Tu presupuesto
            </h2>
          </div>
        </div>

        <div className="mt-5 space-y-3 border-b border-border pb-5 text-sm">
          <div className="flex items-center justify-between gap-4 text-text-soft">
            <span>Productos</span>
            <span>{totalUnits}</span>
          </div>

          <div className="flex items-center justify-between gap-4 text-text-soft">
            <span>Entrega</span>
            <span>A coordinar</span>
          </div>

          <div className="flex items-end justify-between gap-4 pt-2">
            <span className="font-semibold text-text-strong">
              Estimado
            </span>

            <strong className="text-2xl font-bold text-brand-700">
              {formatPricePYG(subtotal)}
            </strong>
          </div>
        </div>

        <div className="mt-5">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={needsInstallation}
              onChange={(event) =>
                setNeedsInstallation(event.target.checked)
              }
              className="mt-1 h-4 w-4 accent-brand-700"
            />

            <span>
              <span className="block text-sm font-semibold text-text-strong">
                Necesito instalación
              </span>

              <span className="mt-0.5 block text-xs leading-5 text-text-soft">
                Un asesor confirmará el alcance y la zona.
              </span>
            </span>
          </label>
        </div>

        <label className="mt-5 block">
          <span className="flex items-center gap-2 text-sm font-semibold text-text-strong">
            <MapPin className="h-4 w-4 text-brand-700" />
            Ciudad o zona
          </span>

          <input
            type="text"
            value={zone}
            onChange={(event) => setZone(event.target.value)}
            placeholder="Ej.: Luque, San Lorenzo..."
            className="mt-2 h-11 w-full rounded-xl border border-border px-3 text-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
          />
        </label>

        <label className="mt-5 block">
          <span className="flex items-center gap-2 text-sm font-semibold text-text-strong">
            <Ruler className="h-4 w-4 text-brand-700" />
            Observaciones
          </span>

          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Contanos medidas, tipo de espacio o cualquier detalle."
            rows={3}
            className="mt-2 w-full resize-none rounded-xl border border-border px-3 py-3 text-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
          />
        </label>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[#20bd5a]"
        >
          <WhatsAppIcon className="h-5 w-5" />
          Enviar presupuesto por WhatsApp
        </a>

        <p className="mt-3 text-center text-[11px] leading-5 text-text-soft">
          El monto es estimativo. Un asesor confirmará precio final,
          disponibilidad, entrega e instalación.
        </p>
      </aside>
    </div>
  );
}
