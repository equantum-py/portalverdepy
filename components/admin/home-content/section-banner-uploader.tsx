'use client';

import Image from 'next/image';
import { ImagePlus, Loader2, RefreshCw, Trash2 } from 'lucide-react';
import { type ChangeEvent, useRef, useState } from 'react';

import { validateMinimumImageSize } from '@/lib/images/client-image-validation';
import { createClient } from '@/lib/supabase/client';

const BUCKET = 'home-content-images';
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

type Props = {
  sectionKey: string;
  variant: 'desktop' | 'mobile';
  url: string;
  path: string;
  onChange: (value: { url: string; path: string }) => void;
  layout?: 'vertical' | 'service';
};

export function SectionBannerUploader({ sectionKey, variant, url, onChange, layout = 'vertical' }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const label = variant === 'desktop' ? 'Banner Desktop' : 'Banner Mobile';
  const isService = layout === 'service';
  const recommended = isService
    ? variant === 'desktop' ? '1200 × 500 px o superior' : '800 × 800 px o superior'
    : variant === 'desktop' ? '548 × 882 px o superior' : '548 × 1240 px o superior';
  const ratio = isService
    ? variant === 'desktop' ? 'aspect-[12/5]' : 'aspect-square'
    : variant === 'desktop' ? 'aspect-[274/441]' : 'aspect-[137/310]';
  const minimumWidth = isService ? (variant === 'desktop' ? 1200 : 800) : 548;
  const minimumHeight = isService ? (variant === 'desktop' ? 500 : 800) : variant === 'desktop' ? 882 : 1240;

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setError('');
    if (!ALLOWED_TYPES.includes(file.type)) { setError('Solo se permiten imágenes JPG, PNG o WebP.'); return; }
    if (file.size > MAX_FILE_SIZE) { setError('La imagen supera el máximo permitido de 5 MB.'); return; }
    const dimensionError = await validateMinimumImageSize(file, minimumWidth, minimumHeight);
    if (dimensionError) { setError(dimensionError); return; }
    setUploading(true);
    try {
      const extension = file.name.split('.').pop()?.toLowerCase() || 'webp';
      const safeKey = sectionKey.replace(/[^a-zA-Z0-9-_]/g, '-');
      const storagePath = `home-sections/${safeKey}/${variant}/${crypto.randomUUID()}.${extension}`;
      const supabase = createClient();
      const { error: uploadError } = await supabase.storage.from(BUCKET).upload(storagePath, file, { cacheControl: '31536000', contentType: file.type, upsert: false });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
      onChange({ url: data.publicUrl, path: storagePath });
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'No se pudo subir la imagen.');
    } finally { setUploading(false); }
  }

  return (
    <div>
      <div className="mb-2">
        <p className="text-sm font-semibold text-slate-800">{label}</p>
        <p className="text-xs text-slate-500">Tamaño recomendado: {recommended}</p>
      </div>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={upload} className="hidden" />
      {url ? (
        <div className={`relative w-full ${isService ? 'max-w-xl' : 'max-w-[274px]'} overflow-hidden rounded-xl border bg-slate-50 ${ratio}`}>
          <Image src={url} alt={label} fill quality={95} sizes={isService ? '(max-width: 768px) 100vw, 50vw' : '274px'} className="object-contain" />
          <div className="absolute right-2 top-2 flex gap-2">
            <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading} className="rounded-lg bg-white p-2 text-slate-700 shadow" aria-label={`Reemplazar ${label}`}>{uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}</button>
            <button type="button" onClick={() => onChange({ url: '', path: '' })} disabled={uploading} className="rounded-lg bg-white p-2 text-red-600 shadow" aria-label={`Eliminar ${label}`}><Trash2 className="h-4 w-4" /></button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading} className={`flex w-full ${isService ? 'max-w-xl' : 'max-w-[274px]'} flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 hover:border-green-300 hover:bg-green-50 ${ratio}`}>
          {uploading ? <Loader2 className="h-6 w-6 animate-spin text-green-700" /> : <ImagePlus className="h-6 w-6 text-green-700" />}
          <span className="mt-2 text-xs text-slate-500">{uploading ? 'Subiendo...' : 'Adjuntar imagen · máx. 5 MB'}</span>
        </button>
      )}
      {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
