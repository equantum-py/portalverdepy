'use client';

import {
  ChevronLeft,
  ChevronRight,
  Images
} from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

type GalleryImage = {
  imageUrl: string;
  altText?: string | null;
};

type ProductGalleryProps = {
  productName: string;
  images: GalleryImage[];
};

export function ProductGallery({
  productName,
  images
}: ProductGalleryProps) {
  const validImages = images.filter(
    (image) => Boolean(image.imageUrl)
  );

  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!validImages.length) {
    return (
      <div className="relative aspect-square overflow-hidden rounded-3xl border border-border bg-brand-50">
        <Image
          src="/images/product-placeholder.webp"
          alt={productName}
          fill
          priority
          className="object-cover"
        />
      </div>
    );
  }

  const selectedImage =
    validImages[selectedIndex] ?? validImages[0];

  function previousImage() {
    setSelectedIndex((current) =>
      current === 0
        ? validImages.length - 1
        : current - 1
    );
  }

  function nextImage() {
    setSelectedIndex((current) =>
      current === validImages.length - 1
        ? 0
        : current + 1
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-square overflow-hidden rounded-3xl border border-border bg-brand-50 shadow-sm">
        <Image
          key={selectedImage.imageUrl}
          src={selectedImage.imageUrl}
          alt={
            selectedImage.altText ||
            `${productName} - imagen ${selectedIndex + 1}`
          }
          fill
          priority={selectedIndex === 0}
          sizes="(max-width: 1024px) 100vw, 620px"
          className="object-cover"
        />

        {validImages.length > 1 ? (
          <>
            <button
              type="button"
              onClick={previousImage}
              aria-label="Imagen anterior"
              className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white shadow-lg backdrop-blur"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            <button
              type="button"
              onClick={nextImage}
              aria-label="Imagen siguiente"
              className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white shadow-lg backdrop-blur"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
              <Images className="h-4 w-4" />
              {selectedIndex + 1}/{validImages.length}
            </span>
          </>
        ) : null}
      </div>

      {validImages.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {validImages.map((image, index) => {
            const selected = index === selectedIndex;

            return (
              <button
                key={`${image.imageUrl}-${index}`}
                type="button"
                onClick={() => setSelectedIndex(index)}
                className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-slate-100 sm:h-24 sm:w-24 ${
                  selected
                    ? 'border-brand-700 ring-2 ring-brand-100'
                    : 'border-transparent'
                }`}
              >
                <Image
                  src={image.imageUrl}
                  alt={
                    image.altText ||
                    `${productName} - miniatura ${index + 1}`
                  }
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
