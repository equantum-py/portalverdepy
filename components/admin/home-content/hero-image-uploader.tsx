'use client';

import {
  ImagePlus,
  Loader2,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import Image from 'next/image';
import {
  type ChangeEvent,
  useEffect,
  useRef,
  useState,
} from 'react';

import { createClient } from '@/lib/supabase/client';

const BUCKET = 'home-content-images';
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
];

type HeroImageUploaderValue = {
  url: string;
  path: string;
};

type HeroImageUploaderProps = {
  label: string;
  recommendedSize: string;
  aspect: 'desktop' | 'mobile';
  url: string;
  path: string;
  onChange: (
    value: HeroImageUploaderValue,
  ) => void;
};

export function HeroImageUploader({
  label,
  recommendedSize,
  aspect,
  url,
  onChange,
}: HeroImageUploaderProps) {
  const inputRef =
    useRef<HTMLInputElement | null>(null);

  const [previewUrl, setPreviewUrl] =
    useState('');
  const [uploading, setUploading] =
    useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  async function upload(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    event.target.value = '';

    if (!file) {
      return;
    }

    setError('');

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError(
        'Solo se permiten imágenes JPG, PNG o WebP.',
      );
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError(
        'La imagen supera el máximo permitido de 5 MB.',
      );
      return;
    }

    const localUrl = URL.createObjectURL(file);

    setPreviewUrl((current) => {
      if (current) {
        URL.revokeObjectURL(current);
      }

      return localUrl;
    });

    setUploading(true);

    try {
      const extension =
        file.name
          .split('.')
          .pop()
          ?.toLowerCase() || 'webp';

      const storagePath =
        `hero/${aspect}/${crypto.randomUUID()}.${extension}`;

      const supabase = createClient();

      const { error: uploadError } =
        await supabase.storage
          .from(BUCKET)
          .upload(storagePath, file, {
            cacheControl: '3600',
            contentType: file.type,
            upsert: false,
          });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(storagePath);

      onChange({
        url: data.publicUrl,
        path: storagePath,
      });

      setPreviewUrl('');
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : 'No se pudo subir la imagen.',
      );

      setPreviewUrl('');
    } finally {
      setUploading(false);
    }
  }

  function removeImage() {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl('');
    setError('');

    onChange({
      url: '',
      path: '',
    });
  }

  const displayedUrl = previewUrl || url;

  const ratio =
    aspect === 'desktop'
      ? 'aspect-[1920/650]'
      : 'aspect-[750/507]';

  return (
    <div>
      <div className="mb-2">
        <p className="text-sm font-medium text-slate-900">
          {label}
        </p>

        <p className="text-xs text-slate-500">
          Tamaño recomendado: {recommendedSize}
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={upload}
      />

      {displayedUrl ? (
        <div
          className={`relative overflow-hidden rounded-xl bg-slate-100 ${ratio}`}
        >
          <Image
            src={displayedUrl}
            alt={label}
            fill
            unoptimized={Boolean(previewUrl)}
            className="object-contain object-center"
            sizes="(min-width: 768px) 550px, 100vw"
          />

          <div className="absolute right-3 top-3 flex gap-2">
            <button
              type="button"
              onClick={() =>
                inputRef.current?.click()
              }
              disabled={uploading}
              aria-label={`Reemplazar ${label}`}
              className="rounded-lg bg-white p-2 text-slate-700 shadow transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </button>

            <button
              type="button"
              onClick={removeImage}
              disabled={uploading}
              aria-label={`Eliminar ${label}`}
              className="rounded-lg bg-white p-2 text-red-600 shadow transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() =>
            inputRef.current?.click()
          }
          disabled={uploading}
          className={`flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 transition hover:border-green-300 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-60 ${ratio}`}
        >
          {uploading ? (
            <Loader2 className="h-6 w-6 animate-spin text-green-700" />
          ) : (
            <ImagePlus className="h-6 w-6 text-green-700" />
          )}

          <span className="mt-2 px-4 text-center text-xs text-slate-500">
            {uploading
              ? 'Subiendo imagen...'
              : 'Seleccionar imagen · JPG, PNG o WebP · máx. 5 MB'}
          </span>
        </button>
      )}

      {error ? (
        <p
          role="alert"
          className="mt-2 text-xs text-red-600"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}