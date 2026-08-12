'use client';

import {
  ArrowLeft,
  ArrowRight,
  ImagePlus,
  Loader2,
  Star,
  Trash2
} from 'lucide-react';
import Image from 'next/image';
import {
  type ChangeEvent,
  useRef,
  useState
} from 'react';

import { validateExactImageSize } from '@/lib/images/client-image-validation';
import type { ProductImageDraft } from '@/lib/products/schema';
import { createProductSlug } from '@/lib/products/slug';
import { createClient } from '@/lib/supabase/client';

type ProductImageUploaderProps = {
  productName: string;
  value: ProductImageDraft[];
  onChange: (images: ProductImageDraft[]) => void;
};

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp'
] as const;

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_IMAGES = 12;

function sanitizeFileName(fileName: string) {
  const extension =
    fileName.split('.').pop()?.toLowerCase() || 'webp';

  const nameWithoutExtension = fileName.replace(/\.[^/.]+$/, '');

  return `${
    createProductSlug(nameWithoutExtension) || 'producto'
  }-${crypto.randomUUID()}.${extension}`;
}

export function ProductImageUploader({
  productName,
  value,
  onChange
}: ProductImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [hasError, setHasError] = useState(false);

  function showError(text: string) {
    setMessage(text);
    setHasError(true);
  }

  async function handleFiles(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const files = Array.from(event.target.files ?? []);

    if (!files.length) return;

    setMessage('');
    setHasError(false);

    if (value.length + files.length > MAX_IMAGES) {
      showError(`Podés cargar como máximo ${MAX_IMAGES} imágenes.`);
      event.target.value = '';
      return;
    }

    for (const file of files) {
      if (
        !ALLOWED_TYPES.includes(
          file.type as (typeof ALLOWED_TYPES)[number]
        )
      ) {
        showError('Solo se permiten imágenes JPG, PNG o WebP.');
        event.target.value = '';
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        showError(
          `La imagen "${file.name}" supera el máximo de 5 MB.`
        );
        event.target.value = '';
        return;
      }

      const dimensionError = await validateExactImageSize(file, 1200, 1200);
      if (dimensionError) {
        showError(dimensionError);
        event.target.value = '';
        return;
      }
    }

    setIsUploading(true);

    try {
      const supabase = createClient();

      const productFolder =
        createProductSlug(productName) || crypto.randomUUID();

      const uploadedImages: ProductImageDraft[] = [];
      const uploadedPaths: string[] = [];

      for (const file of files) {
        const fileName = sanitizeFileName(file.name);
        const storagePath =
          `products/${productFolder}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(storagePath, file, {
            cacheControl: '31536000',
            contentType: file.type,
            upsert: false
          });

        if (uploadError) {
          if (uploadedPaths.length) {
            await supabase.storage
              .from('product-images')
              .remove(uploadedPaths);
          }

          throw new Error(
            `No se pudo subir "${file.name}": ${uploadError.message}`
          );
        }

        uploadedPaths.push(storagePath);

        const { data: publicUrlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(storagePath);

        uploadedImages.push({
          imageUrl: publicUrlData.publicUrl,
          storagePath,
          altText: productName,
          orderIndex: value.length + uploadedImages.length,
          isPrimary:
            value.length === 0 && uploadedImages.length === 0,
          fileSize: file.size,
          mimeType: file.type as
            | 'image/jpeg'
            | 'image/png'
            | 'image/webp'
        });
      }

      onChange([...value, ...uploadedImages]);

      setMessage(
        uploadedImages.length === 1
          ? 'Imagen subida correctamente.'
          : `${uploadedImages.length} imágenes subidas correctamente.`
      );
    } catch (error) {
      showError(
        error instanceof Error
          ? error.message
          : 'No se pudieron subir las imágenes.'
      );
    } finally {
      setIsUploading(false);

      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  }

  function removeImage(index: number) {
    setMessage('');
    setHasError(false);

    const remainingImages = value.filter(
      (_, currentIndex) => currentIndex !== index
    );

    const hasPrimaryImage = remainingImages.some(
      (item) => item.isPrimary
    );

    const normalizedImages = remainingImages.map(
      (item, currentIndex) => ({
        ...item,
        orderIndex: currentIndex,
        isPrimary:
          item.isPrimary ||
          (!hasPrimaryImage && currentIndex === 0)
      })
    );

    onChange(normalizedImages);
    setMessage(
      'Imagen quitada del producto. El archivo se eliminará al guardar los cambios.'
    );
  }

  function setPrimary(index: number) {
    onChange(
      value.map((image, currentIndex) => ({
        ...image,
        isPrimary: currentIndex === index
      }))
    );
  }

  function moveImage(index: number, direction: -1 | 1) {
    const destination = index + direction;

    if (destination < 0 || destination >= value.length) {
      return;
    }

    const reorderedImages = [...value];

    [reorderedImages[index], reorderedImages[destination]] = [
      reorderedImages[destination],
      reorderedImages[index]
    ];

    onChange(
      reorderedImages.map((image, currentIndex) => ({
        ...image,
        orderIndex: currentIndex
      }))
    );
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={handleFiles}
        className="hidden"
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading || value.length >= MAX_IMAGES}
        className="flex min-h-36 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-5 text-center transition hover:border-green-300 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isUploading ? (
          <>
            <Loader2 className="h-7 w-7 animate-spin text-green-700" />

            <span className="mt-3 text-sm font-semibold text-slate-900">
              Subiendo imágenes...
            </span>
          </>
        ) : (
          <>
            <ImagePlus className="h-7 w-7 text-green-700" />

            <span className="mt-3 text-sm font-semibold text-slate-900">
              Seleccionar imágenes
            </span>

            <span className="mt-1 text-xs text-slate-500">
              JPG, PNG o WebP · 1200 × 1200 px · máximo 5 MB
            </span>

            <span className="mt-1 text-xs text-slate-400">
              {value.length}/{MAX_IMAGES} imágenes
            </span>
          </>
        )}
      </button>

      {message ? (
        <p
          className={
            hasError
              ? 'mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700'
              : 'mt-3 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700'
          }
        >
          {message}
        </p>
      ) : null}

      {value.length ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {value.map((image, index) => (
            <article
              key={image.storagePath || image.imageUrl}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
            >
              <div className="relative aspect-square bg-slate-100">
                <Image
                  src={image.imageUrl}
                  alt={image.altText || productName || 'Producto'}
                  fill
                  quality={90}
                  sizes="(max-width: 640px) 100vw, 320px"
                  className="object-contain p-1"
                />

                {image.isPrimary ? (
                  <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-green-700 px-3 py-1 text-xs font-semibold text-white">
                    <Star className="h-3 w-3 fill-current" />
                    Principal
                  </span>
                ) : null}
              </div>

              <div className="p-3">
                <button
                  type="button"
                  onClick={() => setPrimary(index)}
                  disabled={image.isPrimary}
                  className="inline-flex min-h-9 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 disabled:bg-green-50 disabled:text-green-700"
                >
                  <Star className="h-3.5 w-3.5" />

                  {image.isPrimary
                    ? 'Imagen principal'
                    : 'Usar como principal'}
                </button>

                <div className="mt-2 grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => moveImage(index, -1)}
                    disabled={index === 0}
                    aria-label="Mover imagen a la izquierda"
                    className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 disabled:opacity-30"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => moveImage(index, 1)}
                    disabled={index === value.length - 1}
                    aria-label="Mover imagen a la derecha"
                    className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 disabled:opacity-30"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    aria-label="Quitar imagen"
                    className="inline-flex h-9 items-center justify-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </div>
  );
}
