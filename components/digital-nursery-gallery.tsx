'use client';

import Image from 'next/image';
import { useId, useRef, useState } from 'react';

import type { NurseryPhotoContext } from '@/lib/nursery-gallery';

export type PublicNurseryGalleryPhoto = { url: string; context: NurseryPhotoContext };

export function DigitalNurseryGallery({ name, photos }: { name: string; photos: PublicNurseryGalleryPhoto[] }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [index, setIndex] = useState(0);
  const photo = photos[index];
  if (!photo) return null;

  return (
    <>
      <button type="button" aria-haspopup="dialog" className="mb-2 min-h-10 w-full rounded-xl border border-brand-700 px-2 text-xs font-semibold text-brand-800"
        onClick={() => dialog.current?.showModal()}>
        Ver galería ({photos.length})
      </button>
      <dialog ref={dialog} aria-labelledby={titleId} className="m-auto max-h-[90dvh] w-11/12 max-w-2xl overflow-y-auto rounded-2xl p-4 backdrop:bg-black/65">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 id={titleId} className="font-semibold text-brand-950">{name}</h3>
          <button type="button" autoFocus className="min-h-10 rounded-lg border px-3 text-sm" onClick={() => dialog.current?.close()}>Cerrar</button>
        </div>
        <div className="relative h-[min(58dvh,32rem)] overflow-hidden rounded-xl bg-brand-50">
          <Image src={photo.url} alt={`${name} · ${photo.context}`} fill sizes="(max-width: 680px) 95vw, 640px" className="object-contain" />
        </div>
        <div className="mt-3 flex items-center justify-between gap-2 text-sm">
          <button type="button" className="min-h-10 rounded-lg border px-2 disabled:opacity-40" disabled={index === 0} onClick={() => setIndex(index - 1)}>Anterior</button>
          <span aria-live="polite" className="text-center">{photo.context} · {index + 1}/{photos.length}</span>
          <button type="button" className="min-h-10 rounded-lg border px-2 disabled:opacity-40" disabled={index === photos.length - 1} onClick={() => setIndex(index + 1)}>Siguiente</button>
        </div>
      </dialog>
    </>
  );
}
