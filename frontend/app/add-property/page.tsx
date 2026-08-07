"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import AdminGuard from "../../components/auth/AdminGuard";
import PropertyForm from "../../components/dashboard/PropertyForm";
import {
  ApiError,
  createProperty,
  CreatePropertyPayload,
  uploadPropertyImages,
} from "../../lib/api";

type SubmissionState = "idle" | "creating" | "uploading" | "partial" | "success";

const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const allowedImageExtensions = new Set(["jpg", "jpeg", "png", "webp"]);
const maxImageSize = 5 * 1024 * 1024;

const validateImages = (images: File[]) => {
  if (images.length > 10) return "You can upload a maximum of 10 images.";

  for (const image of images) {
    const extension = image.name.split(".").pop()?.toLowerCase() ?? "";
    const hasAllowedType = allowedImageTypes.has(image.type);
    const hasExtensionFallback = image.type === "" && allowedImageExtensions.has(extension);

    if (!hasAllowedType && !hasExtensionFallback) {
      return `${image.name} must be a JPG, JPEG, PNG, or WEBP image.`;
    }
    if (image.size > maxImageSize) {
      return `${image.name} must not be larger than 5 MB.`;
    }
  }

  return "";
};

export default function AddPropertyPage() {
  const router = useRouter();
  const submissionLock = useRef(false);
  const [images, setImages] = useState<File[]>([]);
  const [submissionState, setSubmissionState] = useState<SubmissionState>("idle");
  const [createdPropertyId, setCreatedPropertyId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [imageValidationError, setImageValidationError] = useState("");
  const [uploadError, setUploadError] = useState("");
  const isSubmitting = submissionState === "creating" || submissionState === "uploading";

  const handleImagesChange = (files: FileList | null) => {
    const selectedImages = files ? Array.from(files) : [];
    const validationError = validateImages(selectedImages);

    if (validationError) {
      setImages([]);
      setImageValidationError(validationError);
      setError(validationError);
      return;
    }

    setImages(selectedImages);
    setImageValidationError("");
    setError("");
  };

  const handleCreate = async (payload: CreatePropertyPayload) => {
    if (submissionLock.current || createdPropertyId !== null) return;

    const imageError = imageValidationError || validateImages(images);
    if (imageError) {
      setError(imageError);
      return;
    }

    submissionLock.current = true;
    setError("");
    setUploadError("");
    setSubmissionState("creating");

    try {
      const property = await createProperty(payload);
      setCreatedPropertyId(property.id);

      if (images.length === 0) {
        setSubmissionState("success");
        router.push(`/property/${property.id}`);
        return;
      }

      setSubmissionState("uploading");

      try {
        await uploadPropertyImages(property.id, images);
        setSubmissionState("success");
        router.push(`/property/${property.id}`);
      } catch (caughtError) {
        setUploadError(caughtError instanceof ApiError ? caughtError.message : "The images could not be uploaded.");
        setSubmissionState("partial");
      }
    } catch (caughtError) {
      setError(caughtError instanceof ApiError ? caughtError.message : "The property could not be created. Please try again.");
      setSubmissionState("idle");
    } finally {
      submissionLock.current = false;
    }
  };

  const handleRetryUpload = async () => {
    if (submissionLock.current || createdPropertyId === null || images.length === 0) return;

    submissionLock.current = true;
    setUploadError("");
    setSubmissionState("uploading");

    try {
      await uploadPropertyImages(createdPropertyId, images);
      setSubmissionState("success");
      router.push(`/property/${createdPropertyId}`);
    } catch (caughtError) {
      setUploadError(caughtError instanceof ApiError ? caughtError.message : "The images could not be uploaded.");
      setSubmissionState("partial");
    } finally {
      submissionLock.current = false;
    }
  };

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-100 px-6 py-10">
        <div className="mx-auto max-w-4xl rounded-xl bg-white p-8 shadow-xl">
          <h1 className="text-4xl font-bold">Add New Property</h1>
          <p className="mt-2 text-gray-600">Create a listing and optionally upload its images.</p>

          {error && <p role="alert" className="mt-6 rounded-lg bg-red-50 p-4 text-red-700">{error}</p>}

          {submissionState === "partial" && createdPropertyId !== null && (
            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
              <p className="font-semibold">Property was created, but its images could not be uploaded.</p>
              {uploadError && <p className="mt-2 text-sm">{uploadError}</p>}
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <button type="button" onClick={() => void handleRetryUpload()} className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700">
                  Retry image upload
                </button>
                <Link href={`/property/${createdPropertyId}`} className="rounded-lg border border-blue-600 px-5 py-3 text-center font-semibold text-blue-700 transition hover:bg-blue-50">
                  View property
                </Link>
              </div>
            </div>
          )}

          <PropertyForm
            onSubmit={handleCreate}
            isSubmitting={isSubmitting}
            disabled={createdPropertyId !== null}
            submitLabel={submissionState === "success" ? "Property created" : "Create property"}
            submittingLabel={submissionState === "uploading" ? "Uploading images..." : "Creating property..."}
          >
            <label className="block">
              <span className="mb-2 block font-medium text-gray-700">Images (optional)</span>
              <input type="file" multiple accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" onChange={(event) => handleImagesChange(event.target.files)} disabled={createdPropertyId !== null || isSubmitting} className="w-full rounded-lg border p-3 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:font-semibold file:text-blue-700 disabled:bg-gray-100" />
              <span className="mt-2 block text-sm text-gray-500">Up to 10 JPG, JPEG, PNG, or WEBP files; maximum 5 MB each.</span>
            </label>

            {images.length > 0 && (
              <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-700">
                <p className="font-semibold">{images.length} image{images.length === 1 ? "" : "s"} selected</p>
                <ul className="mt-2 list-inside list-disc space-y-1">
                  {images.map((image) => <li key={`${image.name}-${image.lastModified}`}>{image.name}</li>)}
                </ul>
              </div>
            )}
          </PropertyForm>
        </div>
      </div>
    </AdminGuard>
  );
}
