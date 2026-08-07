"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import AdminGuard from "../../components/auth/AdminGuard";
import {
  ApiError,
  createProperty,
  CreatePropertyPayload,
  PropertyCategory,
  PropertyType,
  uploadPropertyImages,
} from "../../lib/api";

type FormState = {
  title: string;
  description: string;
  price: string;
  city: string;
  state: string;
  type: PropertyType;
  category: PropertyCategory;
  bedrooms: string;
  bathrooms: string;
  area: string;
};

type SubmissionState = "idle" | "creating" | "uploading" | "partial" | "success";

const initialForm: FormState = {
  title: "",
  description: "",
  price: "",
  city: "",
  state: "",
  type: "buy",
  category: "residential",
  bedrooms: "",
  bathrooms: "",
  area: "",
};

const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const allowedImageExtensions = new Set(["jpg", "jpeg", "png", "webp"]);
const maxImageSize = 5 * 1024 * 1024;

const validateImages = (images: File[]) => {
  if (images.length > 10) {
    return "You can upload a maximum of 10 images.";
  }

  for (const image of images) {
    const extension = image.name.split(".").pop()?.toLowerCase() ?? "";
    const hasAllowedType = allowedImageTypes.has(image.type);
    const hasExtensionFallback =
      image.type === "" && allowedImageExtensions.has(extension);

    if (!hasAllowedType && !hasExtensionFallback) {
      return `${image.name} must be a JPG, JPEG, PNG, or WEBP image.`;
    }

    if (image.size > maxImageSize) {
      return `${image.name} must not be larger than 5 MB.`;
    }
  }

  return "";
};

const buildPayload = (form: FormState): { error: string; payload?: CreatePropertyPayload } => {
  const title = form.title.trim();
  const description = form.description.trim();
  const city = form.city.trim();
  const state = form.state.trim();
  const price = Number(form.price);
  const area = Number(form.area);
  const bedrooms = form.bedrooms === "" ? null : Number(form.bedrooms);
  const bathrooms = form.bathrooms === "" ? null : Number(form.bathrooms);

  if (!title) return { error: "Property title is required." };
  if (title.length > 255) return { error: "Property title must not exceed 255 characters." };
  if (!description) return { error: "Property description is required." };
  if (!form.price.trim() || !Number.isFinite(price) || price < 0.01) {
    return { error: "Price must be at least 0.01." };
  }
  if (!city) return { error: "City is required." };
  if (city.length > 255) return { error: "City must not exceed 255 characters." };
  if (!state) return { error: "State is required." };
  if (state.length > 255) return { error: "State must not exceed 255 characters." };
  if (!(["buy", "rent"] as string[]).includes(form.type)) {
    return { error: "Select a valid property type." };
  }
  if (!(["residential", "commercial"] as string[]).includes(form.category)) {
    return { error: "Select a valid property category." };
  }
  if (!form.area.trim() || !Number.isInteger(area) || area < 1) {
    return { error: "Area must be a whole number of at least 1." };
  }
  if (bedrooms !== null && (!Number.isInteger(bedrooms) || bedrooms < 0)) {
    return { error: "Bedrooms must be empty or a non-negative whole number." };
  }
  if (bathrooms !== null && (!Number.isInteger(bathrooms) || bathrooms < 0)) {
    return { error: "Bathrooms must be empty or a non-negative whole number." };
  }

  return {
    error: "",
    payload: {
      title,
      description,
      price,
      city,
      state,
      type: form.type,
      category: form.category,
      bedrooms,
      bathrooms,
      area,
    },
  };
};

export default function AddPropertyPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialForm);
  const [images, setImages] = useState<File[]>([]);
  const [submissionState, setSubmissionState] = useState<SubmissionState>("idle");
  const [createdPropertyId, setCreatedPropertyId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [imageValidationError, setImageValidationError] = useState("");
  const [uploadError, setUploadError] = useState("");

  const isSubmitting = submissionState === "creating" || submissionState === "uploading";

  const setField = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting || createdPropertyId !== null) return;

    setError("");
    setUploadError("");

    const { error: formError, payload } = buildPayload(form);
    const imageError = imageValidationError || validateImages(images);

    if (formError || !payload) {
      setError(formError);
      return;
    }
    if (imageError) {
      setError(imageError);
      return;
    }

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
        setUploadError(
          caughtError instanceof ApiError
            ? caughtError.message
            : "The images could not be uploaded.",
        );
        setSubmissionState("partial");
      }
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "The property could not be created. Please try again.",
      );
      setSubmissionState("idle");
    }
  };

  const handleRetryUpload = async () => {
    if (createdPropertyId === null || images.length === 0 || isSubmitting) return;

    setUploadError("");
    setSubmissionState("uploading");

    try {
      await uploadPropertyImages(createdPropertyId, images);
      setSubmissionState("success");
      router.push(`/property/${createdPropertyId}`);
    } catch (caughtError) {
      setUploadError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "The images could not be uploaded.",
      );
      setSubmissionState("partial");
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
                <button
                  type="button"
                  onClick={() => void handleRetryUpload()}
                  className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
                >
                  Retry image upload
                </button>
                <Link
                  href={`/property/${createdPropertyId}`}
                  className="rounded-lg border border-blue-600 px-5 py-3 text-center font-semibold text-blue-700 transition hover:bg-blue-50"
                >
                  View property
                </Link>
              </div>
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block font-medium text-gray-700">Property title</span>
              <input type="text" value={form.title} onChange={(event) => setField("title", event.target.value)} maxLength={255} required disabled={createdPropertyId !== null} className="w-full rounded-lg border p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" />
            </label>

            <label className="block">
              <span className="mb-2 block font-medium text-gray-700">Description</span>
              <textarea value={form.description} onChange={(event) => setField("description", event.target.value)} rows={5} required disabled={createdPropertyId !== null} className="w-full rounded-lg border p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" />
            </label>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block font-medium text-gray-700">Price</span>
                <input type="number" value={form.price} onChange={(event) => setField("price", event.target.value)} min="0.01" step="0.01" required disabled={createdPropertyId !== null} className="w-full rounded-lg border p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" />
              </label>
              <label className="block">
                <span className="mb-2 block font-medium text-gray-700">Area (sq ft)</span>
                <input type="number" value={form.area} onChange={(event) => setField("area", event.target.value)} min="1" step="1" required disabled={createdPropertyId !== null} className="w-full rounded-lg border p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" />
              </label>
              <label className="block">
                <span className="mb-2 block font-medium text-gray-700">City</span>
                <input type="text" value={form.city} onChange={(event) => setField("city", event.target.value)} maxLength={255} required disabled={createdPropertyId !== null} className="w-full rounded-lg border p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" />
              </label>
              <label className="block">
                <span className="mb-2 block font-medium text-gray-700">State</span>
                <input type="text" value={form.state} onChange={(event) => setField("state", event.target.value)} maxLength={255} required disabled={createdPropertyId !== null} className="w-full rounded-lg border p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" />
              </label>
              <label className="block">
                <span className="mb-2 block font-medium text-gray-700">Type</span>
                <select value={form.type} onChange={(event) => setField("type", event.target.value as PropertyType)} disabled={createdPropertyId !== null} className="w-full rounded-lg border p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100">
                  <option value="buy">Buy</option>
                  <option value="rent">Rent</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block font-medium text-gray-700">Category</span>
                <select value={form.category} onChange={(event) => setField("category", event.target.value as PropertyCategory)} disabled={createdPropertyId !== null} className="w-full rounded-lg border p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100">
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block font-medium text-gray-700">Bedrooms (optional)</span>
                <input type="number" value={form.bedrooms} onChange={(event) => setField("bedrooms", event.target.value)} min="0" step="1" disabled={createdPropertyId !== null} className="w-full rounded-lg border p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" />
              </label>
              <label className="block">
                <span className="mb-2 block font-medium text-gray-700">Bathrooms (optional)</span>
                <input type="number" value={form.bathrooms} onChange={(event) => setField("bathrooms", event.target.value)} min="0" step="1" disabled={createdPropertyId !== null} className="w-full rounded-lg border p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" />
              </label>
            </div>

            <label className="block">
              <span className="mb-2 block font-medium text-gray-700">Images (optional)</span>
              <input type="file" multiple accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" onChange={(event) => handleImagesChange(event.target.files)} disabled={createdPropertyId !== null} className="w-full rounded-lg border p-3 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:font-semibold file:text-blue-700 disabled:bg-gray-100" />
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

            <button type="submit" disabled={isSubmitting || createdPropertyId !== null} className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300">
              {submissionState === "creating"
                ? "Creating property..."
                : submissionState === "uploading"
                  ? "Uploading images..."
                  : submissionState === "success"
                    ? "Property created"
                    : "Create property"}
            </button>
          </form>
        </div>
      </div>
    </AdminGuard>
  );
}
