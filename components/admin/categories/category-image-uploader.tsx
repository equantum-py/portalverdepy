'use client';

import { ImagePlus, Loader2, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useRef, useState, type ChangeEvent } from 'react';
import type { CategoryImage } from '@/lib/categories/schema';
import { createCategorySlug } from '@/lib/categories/slug';
import { createClient } from '@/lib/supabase/client';

export function CategoryImageUploader({ label, categoryName, value, onChange, aspect = 'square' }: {
  label: string; categoryName: string; value: CategoryImage | null;
  onChange: (value: CategoryImage | null) => void; aspect?: 'square' | 'desktop' | 'mobile';
}) {
  const input = useRef<HTMLInputElement>(null); const [uploading, setUploading] = useState(false); const [message, setMessage] = useState('');
  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; if (!file) return; setMessage('');
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { setMessage('Solo se permiten JPG, PNG o WebP.'); return; }
    if (file.size > 5 * 1024 * 1024) { setMessage('La imagen supera el máximo de 5 MB.'); return; }
    setUploading(true);
    try {
      const supabase = createClient(); const extension = file.name.split('.').pop()?.toLowerCase() || 'webp';
      const path = `categories/${createCategorySlug(categoryName) || 'categoria'}/${crypto.randomUUID()}.${extension}`;
      const { error } = await supabase.storage.from('category-images').upload(path, file, { contentType: file.type, cacheControl: '3600' });
      if (error) throw error;
      if (value?.storagePath) await supabase.storage.from('category-images').remove([value.storagePath]);
      const { data } = supabase.storage.from('category-images').getPublicUrl(path);
      onChange({ imageUrl: data.publicUrl, storagePath: path, fileSize: file.size, mimeType: file.type as CategoryImage['mimeType'] });
    } catch (error) { setMessage(error instanceof Error ? error.message : 'No se pudo subir la imagen.'); }
    finally { setUploading(false); if (input.current) input.current.value = ''; }
  }
  async function remove() { if (value?.storagePath) await createClient().storage.from('category-images').remove([value.storagePath]); onChange(null); }
  const ratio = aspect === 'desktop' ? 'aspect-[16/5]' : aspect === 'mobile' ? 'aspect-[4/5]' : 'aspect-square';
  return <div><p className="mb-2 text-sm font-semibold text-slate-800">{label}</p><input ref={input} className="hidden" type="file" accept="image/jpeg,image/png,image/webp" onChange={upload} />
    {value ? <div className={`relative overflow-hidden rounded-xl bg-slate-100 ${ratio}`}><Image src={value.imageUrl} alt={label} fill className="object-cover" sizes="600px" /><button type="button" onClick={remove} aria-label={`Eliminar ${label}`} className="absolute right-3 top-3 rounded-lg bg-white p-2 text-red-600 shadow"><Trash2 className="h-4 w-4" /></button></div> :
    <button type="button" disabled={uploading} onClick={() => input.current?.click()} className={`flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 ${ratio}`}>
      {uploading ? <Loader2 className="h-6 w-6 animate-spin text-green-700" /> : <ImagePlus className="h-6 w-6 text-green-700" />}<span className="mt-2 text-xs text-slate-500">JPG, PNG o WebP · máx. 5 MB</span></button>}
    {message && <p role="alert" className="mt-2 text-xs text-red-600">{message}</p>}</div>;
}
