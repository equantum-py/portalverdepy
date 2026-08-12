'use client';

import { ImagePlus, Loader2, Trash2 } from 'lucide-react';
import { type ChangeEvent, useRef, useState } from 'react';

import { validateMinimumImageSize } from '@/lib/images/client-image-validation';
import { createClient } from '@/lib/supabase/client';

type Props = {
  itemId: string;
  itemName: string;
  initialUrl?: string | null;
  initialPath?: string | null;
};

const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
const maxSize = 5 * 1024 * 1024;

function safeName(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'planta';
}

export function DigitalNurseryImageUploader({ itemId, itemName, initialUrl, initialPath }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState(initialUrl ?? '');
  const [path, setPath] = useState(initialPath ?? '');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  async function onFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!allowedTypes.includes(file.type)) {
      setMessage('Usá JPG, PNG o WebP.');
      return;
    }
    if (file.size > maxSize) {
      setMessage('La imagen supera 5 MB.');
      return;
    }
    const dimensionError = await validateMinimumImageSize(file, 1200, 900);
    if (dimensionError) {
      setMessage(dimensionError);
      return;
    }

    setUploading(true);
    setMessage('');
    try {
      const supabase = createClient();
      const extension = file.name.split('.').pop()?.toLowerCase() || 'webp';
      const nextPath = `digital-nursery/${itemId}/${safeName(itemName)}-${crypto.randomUUID()}.${extension}`;
      const { error } = await supabase.storage.from('product-images').upload(nextPath, file, {
        cacheControl: '31536000',
        contentType: file.type,
        upsert: false
      });
      if (error) throw error;

      if (path) await supabase.storage.from('product-images').remove([path]);
      const { data } = supabase.storage.from('product-images').getPublicUrl(nextPath);
      setPath(nextPath);
      setUrl(data.publicUrl);
      setMessage('Foto lista. Guardá los cambios.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo subir la imagen.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  async function remove() {
    const supabase = createClient();
    if (path) await supabase.storage.from('product-images').remove([path]);
    setPath('');
    setUrl('');
    setMessage('Foto eliminada. Guardá los cambios.');
  }

  return (
    <div>
      <input type="hidden" name="image_url" value={url} />
      <input type="hidden" name="storage_path" value={path} />
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={onFile} className="hidden" />

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={itemName} width={1200} height={900} className="aspect-[4/3] w-full object-cover" />
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
      {message ? <p className="mt-2 text-xs text-slate-500">{message}</p> : null}
    </div>
  );
}
