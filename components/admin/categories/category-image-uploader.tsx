'use client';

import { ImagePlus, Loader2, Trash2 } from 'lucide-react';
import Image from 'next/image';
import {
  useRef,
  useState,
  type ChangeEvent,
} from 'react';

import { validateMinimumImageSize } from '@/lib/images/client-image-validation';
import type { CategoryImage } from '@/lib/categories/schema';
import { createCategorySlug } from '@/lib/categories/slug';
import { createClient } from '@/lib/supabase/client';

type CategoryImageUploaderProps = {
  label: string;
  categoryName: string;
  value: CategoryImage | null;
  onChange: (value: CategoryImage | null) => void;
  aspect?: 'square' | 'desktop' | 'mobile';
};

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
];

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export function CategoryImageUploader({
  label,
  categoryName,
  value,
  onChange,
  aspect = 'square',
}: CategoryImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  async function upload(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setMessage('');

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setMessage('Solo se permiten imágenes JPG, PNG o WebP.');

      if (inputRef.current) {
        inputRef.current.value = '';
      }

      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setMessage('La imagen supera el máximo permitido de 5 MB.');

      if (inputRef.current) {
        inputRef.current.value = '';
      }

      return;
    }

    const minimumSize =
      aspect === 'desktop'
        ? { width: 1920, height: 600 }
        : aspect === 'mobile'
          ? { width: 960, height: 1200 }
          : { width: 1200, height: 1200 };
    const dimensionError = await validateMinimumImageSize(
      file,
      minimumSize.width,
      minimumSize.height,
    );
    if (dimensionError) {
      setMessage(dimensionError);
      if (inputRef.current) inputRef.current.value = '';
      return;
    }

    setUploading(true);

    try {
      const supabase = createClient();

      const extension =
        file.name.split('.').pop()?.toLowerCase() || 'webp';

      const categorySlug =
        createCategorySlug(categoryName) || 'categoria';

      const path = `categories/${categorySlug}/${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from('category-images')
        .upload(path, file, {
          contentType: file.type,
          cacheControl: '31536000',
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('category-images')
        .getPublicUrl(path);

      onChange({
        imageUrl: data.publicUrl,
        storagePath: path,
        fileSize: file.size,
        mimeType: file.type as CategoryImage['mimeType'],
      });
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'No se pudo subir la imagen.',
      );
    } finally {
      setUploading(false);

      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  }

  function remove() {
    onChange(null);
    setMessage('');
  }

  const ratio =
    aspect === 'desktop'
      ? 'aspect-[16/5]'
      : aspect === 'mobile'
        ? 'aspect-[4/5]'
        : 'aspect-square';

  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-slate-800">
        {label}
      </p>

      <input
        ref={inputRef}
        className="hidden"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={upload}
      />

      {value ? (
        <div
          className={`relative overflow-hidden rounded-xl bg-slate-100 ${ratio}`}
        >
          <Image
            src={value.imageUrl}
            alt={label}
            fill
            quality={95}
            className="object-cover"
            sizes={
              aspect === 'desktop'
                ? '(min-width: 768px) 600px, 100vw'
                : '600px'
            }
          />

          <button
            type="button"
            onClick={remove}
            aria-label={`Eliminar ${label}`}
            className="absolute right-3 top-3 rounded-lg bg-white p-2 text-red-600 shadow transition-colors hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className={`flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 transition-colors hover:border-green-300 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-60 ${ratio}`}
        >
          {uploading ? (
            <Loader2 className="h-6 w-6 animate-spin text-green-700" />
          ) : (
            <ImagePlus className="h-6 w-6 text-green-700" />
          )}

          <span className="mt-2 text-xs text-slate-500">
            {uploading
              ? 'Subiendo imagen...'
              : 'JPG, PNG o WebP · máx. 5 MB'}
          </span>
        </button>
      )}

      {message && (
        <p
          role="alert"
          className="mt-2 text-xs text-red-600"
        >
          {message}
        </p>
      )}
    </div>
  );
}