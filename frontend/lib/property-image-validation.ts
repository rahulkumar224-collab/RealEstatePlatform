export const PROPERTY_IMAGE_ACCEPT =
  ".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp";

export const MAX_PROPERTY_IMAGES_PER_UPLOAD = 10;
export const MAX_PROPERTY_IMAGE_SIZE = 5 * 1024 * 1024;

const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const allowedImageExtensions = new Set(["jpg", "jpeg", "png", "webp"]);

export const validatePropertyImages = (images: File[]) => {
  if (images.length > MAX_PROPERTY_IMAGES_PER_UPLOAD) {
    return `You can upload a maximum of ${MAX_PROPERTY_IMAGES_PER_UPLOAD} images.`;
  }

  for (const image of images) {
    const extension = image.name.split(".").pop()?.toLowerCase() ?? "";
    const hasAllowedType = allowedImageTypes.has(image.type);
    const hasExtensionFallback =
      image.type === "" && allowedImageExtensions.has(extension);

    if (!hasAllowedType && !hasExtensionFallback) {
      return `${image.name} must be a JPG, JPEG, PNG, or WEBP image.`;
    }

    if (image.size > MAX_PROPERTY_IMAGE_SIZE) {
      return `${image.name} must not be larger than 5 MB.`;
    }
  }

  return "";
};
