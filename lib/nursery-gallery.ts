export const nurseryPhotoContexts = ['Jardín', 'Interior', 'Proyecto'] as const;
export type NurseryPhotoContext = typeof nurseryPhotoContexts[number];
export type NurseryGalleryPhoto = { path: string; context: NurseryPhotoContext };
export const nurseryGalleryLimit = 6;

export function isNurseryPhotoContext(value: unknown): value is NurseryPhotoContext {
  return nurseryPhotoContexts.some((context) => context === value);
}
