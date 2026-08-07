"use client";

import { useEffect, useRef, useState } from "react";
import {
  ApiError,
  deletePropertyImage,
  getProperty,
  makePrimaryPropertyImage,
  Property,
  uploadPropertyImages,
} from "../../lib/api";
import {
  PROPERTY_IMAGE_ACCEPT,
  validatePropertyImages,
} from "../../lib/property-image-validation";

type ImageAction = {
  imageId: number;
  type: "delete" | "primary";
};

type PropertyImageManagerProps = {
  property: Property;
  onPropertyChange: (property: Property) => void;
  onPropertyNotFound: () => void;
};

const errorMessage = (error: unknown, fallback: string) =>
  error instanceof ApiError ? error.message : fallback;

export default function PropertyImageManager({
  property,
  onPropertyChange,
  onPropertyNotFound,
}: PropertyImageManagerProps) {
  const isMounted = useRef(true);
  const actionLock = useRef(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [activeImageAction, setActiveImageAction] = useState<ImageAction | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [refreshFailed, setRefreshFailed] = useState(false);
  const images = property.images ?? [];
  const isBusy = isUploadingImages || activeImageAction !== null;

  useEffect(() => () => {
    isMounted.current = false;
  }, []);

  const refreshProperty = async (successMessage: string) => {
    try {
      const refreshed = await getProperty(property.id);
      if (!isMounted.current) return;

      onPropertyChange(refreshed);
      setSuccess(successMessage);
      setError("");
      setRefreshFailed(false);
    } catch (caughtError) {
      if (!isMounted.current) return;

      if (caughtError instanceof ApiError && caughtError.status === 404) {
        onPropertyNotFound();
        return;
      }

      setSuccess(successMessage);
      setError(
        "The action succeeded, but the latest image information could not be loaded.",
      );
      setRefreshFailed(true);
    }
  };

  const handleFilesChange = (files: FileList | null) => {
    const nextImages = files ? Array.from(files) : [];
    const validationError = validatePropertyImages(nextImages);

    setSuccess("");
    setRefreshFailed(false);

    if (validationError) {
      setSelectedImages([]);
      setError(validationError);
      if (fileInput.current) fileInput.current.value = "";
      return;
    }

    setSelectedImages(nextImages);
    setError("");
  };

  const handleUpload = async () => {
    if (actionLock.current || selectedImages.length === 0) return;

    const validationError = validatePropertyImages(selectedImages);
    if (validationError) {
      setError(validationError);
      return;
    }

    actionLock.current = true;
    setIsUploadingImages(true);
    setError("");
    setSuccess("");
    setRefreshFailed(false);

    try {
      await uploadPropertyImages(property.id, selectedImages);
      if (!isMounted.current) return;

      setSelectedImages([]);
      if (fileInput.current) fileInput.current.value = "";
      await refreshProperty("Property images uploaded successfully.");
    } catch (caughtError) {
      if (isMounted.current) {
        setError(errorMessage(caughtError, "The images could not be uploaded."));
      }
    } finally {
      actionLock.current = false;
      if (isMounted.current) setIsUploadingImages(false);
    }
  };

  const handleMakePrimary = async (imageId: number) => {
    if (actionLock.current) return;

    actionLock.current = true;
    setActiveImageAction({ imageId, type: "primary" });
    setError("");
    setSuccess("");
    setRefreshFailed(false);

    try {
      await makePrimaryPropertyImage(property.id, imageId);
      await refreshProperty("Primary property image updated successfully.");
    } catch (caughtError) {
      if (!isMounted.current) return;

      if (caughtError instanceof ApiError && caughtError.status === 404) {
        onPropertyNotFound();
      } else {
        setError(errorMessage(caughtError, "The primary image could not be updated."));
      }
    } finally {
      actionLock.current = false;
      if (isMounted.current) setActiveImageAction(null);
    }
  };

  const handleDelete = async (imageId: number, isPrimary: boolean) => {
    if (actionLock.current) return;

    const confirmation = isPrimary
      ? "Delete the primary property image? Another image will become primary automatically if one is available. This action cannot be undone."
      : "Delete this property image? This action cannot be undone.";

    if (!window.confirm(confirmation)) return;

    actionLock.current = true;
    setActiveImageAction({ imageId, type: "delete" });
    setError("");
    setSuccess("");
    setRefreshFailed(false);

    try {
      await deletePropertyImage(property.id, imageId);
      await refreshProperty("Property image deleted successfully.");
    } catch (caughtError) {
      if (!isMounted.current) return;

      if (caughtError instanceof ApiError && caughtError.status === 404) {
        onPropertyNotFound();
      } else {
        setError(errorMessage(caughtError, "The property image could not be deleted."));
      }
    } finally {
      actionLock.current = false;
      if (isMounted.current) setActiveImageAction(null);
    }
  };

  const handleRefreshRetry = async () => {
    if (actionLock.current) return;

    actionLock.current = true;
    setIsUploadingImages(true);
    setError("");

    try {
      await refreshProperty("Property images refreshed successfully.");
    } finally {
      actionLock.current = false;
      if (isMounted.current) setIsUploadingImages(false);
    }
  };

  return (
    <section className="mt-8 border-t pt-8">
      <div>
        <h2 className="text-2xl font-bold">Property Images</h2>
        <p className="mt-1 text-gray-600">Manage the gallery and primary listing image.</p>
      </div>

      {error && (
        <div className="mt-5 rounded-lg bg-red-50 p-4 text-red-700">
          <p role="alert">{error}</p>
          {refreshFailed && (
            <button
              type="button"
              onClick={() => void handleRefreshRetry()}
              disabled={isBusy}
              className="mt-3 rounded-lg border border-red-700 px-4 py-2 font-semibold disabled:opacity-50"
            >
              Retry refresh
            </button>
          )}
        </div>
      )}
      {success && <p role="status" className="mt-5 rounded-lg bg-green-50 p-4 text-green-700">{success}</p>}

      {images.length === 0 ? (
        <div className="mt-6 rounded-lg bg-gray-50 p-6 text-center text-gray-600">
          No images have been uploaded for this property.
        </div>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image) => {
            const isDeleting = activeImageAction?.imageId === image.id && activeImageAction.type === "delete";
            const isSettingPrimary = activeImageAction?.imageId === image.id && activeImageAction.type === "primary";

            return (
              <article key={image.id} className="overflow-hidden rounded-xl border bg-white shadow-sm">
                <div
                  role="img"
                  aria-label={`${property.title} gallery image`}
                  className="h-44 bg-gray-100 bg-cover bg-center"
                  style={{ backgroundImage: `url(${JSON.stringify(image.image_url)})` }}
                />
                <div className="space-y-3 p-4">
                  {image.is_primary && (
                    <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
                      Primary
                    </span>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {!image.is_primary && (
                      <button
                        type="button"
                        onClick={() => void handleMakePrimary(image.id)}
                        disabled={isBusy}
                        className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white disabled:bg-blue-300"
                      >
                        {isSettingPrimary ? "Setting primary..." : "Set Primary"}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => void handleDelete(image.id, image.is_primary)}
                      disabled={isBusy}
                      className="rounded-lg border border-red-600 px-3 py-2 text-sm font-semibold text-red-700 disabled:opacity-50"
                    >
                      {isDeleting ? "Deleting..." : "Delete Image"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <div className="mt-8 rounded-xl border bg-gray-50 p-5">
        <h3 className="text-lg font-bold">Add More Images</h3>
        <p className="mt-1 text-sm text-gray-600">Upload up to 10 images at a time. JPG, JPEG, PNG, and WEBP files up to 5 MB each are accepted.</p>
        <input
          ref={fileInput}
          type="file"
          multiple
          accept={PROPERTY_IMAGE_ACCEPT}
          onChange={(event) => handleFilesChange(event.target.files)}
          disabled={isBusy}
          className="mt-4 w-full rounded-lg border bg-white p-3 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:font-semibold file:text-blue-700 disabled:bg-gray-100"
        />

        {selectedImages.length > 0 && (
          <div className="mt-4 text-sm text-gray-700">
            <p className="font-semibold">{selectedImages.length} image{selectedImages.length === 1 ? "" : "s"} selected</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              {selectedImages.map((image) => (
                <li key={`${image.name}-${image.lastModified}`}>{image.name}</li>
              ))}
            </ul>
          </div>
        )}

        <button
          type="button"
          onClick={() => void handleUpload()}
          disabled={isBusy || selectedImages.length === 0}
          className="mt-5 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          {isUploadingImages ? "Uploading images..." : "Upload images"}
        </button>
      </div>
    </section>
  );
}
