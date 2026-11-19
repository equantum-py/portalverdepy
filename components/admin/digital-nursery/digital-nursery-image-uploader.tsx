'use client';

import { ImagePlus, Loader2, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { type ChangeEvent, useRef, useState } from 'react';

import { readImageDimensions } from '@/lib/images/client-image-validation';
import { createClient } from '@/lib/supabase/client';

type Props = {
  itemId: string;
  itemName: string;
  initialUrl?: string | null;
  initialPath?: string | null;
  gallery?: boolean;
};

const imageExtensions = new Map([['image/jpeg', 'jpg'], ['image/png', 'png'], ['image/webp', 'webp']]);
const maxSize = 5 * 1024 * 1024;

function safeName(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'planta';
}

export function DigitalNurseryImageUploader({ itemId, itemName, initialUrl, initialPath, gallery = false }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState(initialUrl ?? '');
  const [path, setPath] = useState(initialPath ?? '');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  async function onFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    event.currentTarget.value = '';
    const extension = imageExtensions.get(file.type);
    if (!extension) {
      setMessage('Usá JPG, PNG o WebP.');
      return;
    }
    if (file.size > maxSize) {
      setMessage('La imagen supera 5 MB.');
      return;
    }
    const form = event.currentTarget.form;
    const preventEarlySave = (submitEvent: SubmitEvent) => {
      submitEvent.preventDefault();
      setMessage('Esperá a que termine la carga antes de guardar.');
    };
    form?.addEventListener('submit', preventEarlySave);
    setUploading(true);
    setMessage('');
    try {
      const { width, height } = await readImageDimensions(file);
      if (Math.max(width, height) < 1200 || Math.min(width, height) < 900) {
        setMessage(`La imagen mide ${width} × ${height} px. Usá al menos 1200 px en el lado largo y 900 px en el corto.`);
        return;
      }

      const supabase = createClient();
      const nextPath = `digital-nursery/${itemId}/${safeName(itemName)}-${crypto.randomUUID()}.${extension}`;
      const { error } = await supabase.storage.from('product-images').upload(nextPath, file, {
        cacheControl: '31536000',
        contentType: file.type,
        upsert: false
      });
      if (error) throw error;

      const { data } = supabase.storage.from('product-images').getPublicUrl(nextPath);
      setPath(nextPath);
      setUrl(data.publicUrl);
      setMessage('Foto lista. Guardá los cambios.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo subir la imagen.');
    } finally {
      form?.removeEventListener('submit', preventEarlySave);
      setUploading(false);
    }
  }

  function remove() {
    setPath('');
    setUrl('');
    setMessage('Foto quitada del registro. El archivo original se conserva. Guardá los cambios.');
  }

  return (
    <div>
      {!gallery && <input type="hidden" name="image_url" value={url} />}
      <input type="hidden" name={gallery ? 'gallery_path' : 'storage_path'} value={path} />
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={onFile} className="hidden" />

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
        {url ? (
          <div className="relative aspect-[4/3] w-full">
            <Image src={url} alt={itemName} fill quality={90} sizes="(max-width: 768px) 100vw, 720px" className="object-contain p-1" />
          </div>
        ) : (
          <div className="flex aspect-[4/3] items-center justify-center text-sm text-slate-400">Sin foto</div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading} className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium hover:bg-slate-50 disabled:opacity-50">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
          {url ? 'Cambiar foto' : 'Subir foto'}
        </button>
        {url ? <button type="button" onClick={remove} className="inline-flex h-10 items-center gap-2 rounded-xl border border-red-100 px-3 text-sm text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" />Quitar</button> : null}
      </div>
      {message ? <p role="status" className="mt-2 text-xs text-slate-600">{message}</p> : null}
    </div>
  );
}
