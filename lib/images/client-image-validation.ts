export type ImageDimensions = {
  width: number;
  height: number;
};

export async function readImageDimensions(file: File): Promise<ImageDimensions> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new window.Image();

    image.onload = () => {
      const dimensions = {
        width: image.naturalWidth,
        height: image.naturalHeight
      };
      URL.revokeObjectURL(objectUrl);
      resolve(dimensions);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('No se pudieron leer las dimensiones de la imagen.'));
    };

    image.src = objectUrl;
  });
}

export async function validateExactImageSize(
  file: File,
  width: number,
  height: number
): Promise<string | null> {
  const dimensions = await readImageDimensions(file);

  if (dimensions.width === width && dimensions.height === height) {
    return null;
  }

  return `La imagen "${file.name}" mide ${dimensions.width} × ${dimensions.height} px. Debe medir exactamente ${width} × ${height} px.`;
}

export async function validateMinimumImageSize(
  file: File,
  width: number,
  height: number
): Promise<string | null> {
  const dimensions = await readImageDimensions(file);

  if (dimensions.width >= width && dimensions.height >= height) {
    return null;
  }

  return `La imagen "${file.name}" mide ${dimensions.width} × ${dimensions.height} px. Para evitar pixelado debe medir al menos ${width} × ${height} px.`;
}
