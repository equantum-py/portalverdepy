'use client';

import { useRef, useState } from 'react';

import { DigitalNurseryImageUploader } from './digital-nursery-image-uploader';
import { nurseryGalleryLimit, nurseryPhotoContexts, type NurseryGalleryPhoto } from '@/lib/nursery-gallery';

type GalleryRow = { key: number; photo?: NurseryGalleryPhoto & { url: string } };

export function NurseryGalleryFields({ itemId, itemName, photos }: {
  itemId: string;
  itemName: string;
  photos: Array<NurseryGalleryPhoto & { url: string }>;
}) {
  const [rows, setRows] = useState<GalleryRow[]>(() => photos.map((photo, key) => ({ photo, key })));
  const nextKey = useRef(photos.length);

  return (
    <fieldset className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
      <legend className="px-2 font-semibold">Galería de la planta</legend>
      <input type="hidden" name="gallery_present" value="1" />
      <p className="mb-4 text-sm text-slate-600">Agregá hasta seis fotos para mostrar la planta en un jardín, un interior o un proyecto. Guardá los cambios al terminar.</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map(({ key, photo }, index) => (
          <div key={key} className="rounded-xl border border-slate-200 p-3">
            <label className="mb-3 grid gap-1 text-sm font-medium">
              Ambiente de la foto {index + 1}
              <select name="gallery_context" className="h-10 rounded-lg border border-slate-200 px-2" defaultValue={photo?.context ?? 'Jardín'}>
                {nurseryPhotoContexts.map((context) => <option key={context}>{context}</option>)}
              </select>
            </label>
            <DigitalNurseryImageUploader itemId={itemId} itemName={itemName} initialPath={photo?.path} initialUrl={photo?.url} gallery />
            <button type="button" className="mt-3 text-sm text-red-700 underline" onClick={() => setRows(rows.filter((row) => row.key !== key))}>
              Quitar espacio de foto
            </button>
          </div>
        ))}
      </div>
      {rows.length < nurseryGalleryLimit && (
        <button type="button" className="mt-4 rounded-xl border border-green-700 px-4 py-2 text-sm font-semibold text-green-800"
          onClick={() => { const key = nextKey.current++; setRows((current) => [...current, { key }]); }}>
          Agregar foto
        </button>
      )}
    </fieldset>
  );
}
