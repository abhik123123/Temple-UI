/**
 * Prepares an image chosen in a file input for upload: checks type and size,
 * then re-encodes it as a resized JPEG. That keeps uploads small and fast and
 * normalises formats (HEIC, large PNGs) the backend may not accept.
 *
 * @returns {Promise<{ file: File, previewUrl: string }>}
 */
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export function prepareImage(file, { maxDimension = 1600, quality = 0.85, namePrefix = 'photo' } = {}) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file selected.'));
      return;
    }
    if (!file.type.startsWith('image/')) {
      reject(new Error('Please choose an image file (JPEG, PNG or WebP).'));
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      reject(new Error('Image is too large. Please choose a file under 10 MB.'));
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(objectUrl);
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Could not process this image. Please try another one.'));
            return;
          }
          resolve({
            file: new File([blob], `${namePrefix}-${Date.now()}.jpg`, { type: 'image/jpeg' }),
            previewUrl: canvas.toDataURL('image/jpeg', 0.6),
          });
        },
        'image/jpeg',
        quality
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Could not read this image. Please try another one.'));
    };
    img.src = objectUrl;
  });
}
