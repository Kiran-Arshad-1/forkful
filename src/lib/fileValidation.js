const IMAGE_TYPES = Object.freeze({
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
});

export const ACCEPTED_IMAGE_TYPES = Object.freeze(Object.keys(IMAGE_TYPES));
export const MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024;

export function validateImageFile(file) {
  if (!(file instanceof File)) {
    throw new Error('Please select an image file.');
  }

  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    throw new Error('Images must be JPG, PNG, or WebP files.');
  }

  if (file.size <= 0 || file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error('Images must be larger than 0 bytes and no larger than 8 MB.');
  }

  return { extension: IMAGE_TYPES[file.type] };
}
