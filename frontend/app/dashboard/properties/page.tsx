"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError, deleteProperty, getProperties, Property } from "../../../lib/api";

const formatPrice = (value: string | number) => {
  const price = Number(value);

  if (!Number.isFinite(price)) {
    return "Price unavailable";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(price);
};

const formatDate = (value?: string) => {
  if (!value) {
    return "Date unavailable";
  }

  const date = new Date(value);

  if (Number.isNaN(date.valueOf())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
  }).format(date);
};

export default function PropertiesPage() {
  const isMounted = useRef(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const deletingIdRef = useRef<number | null>(null);

  const loadProperties = useCallback(async () => {
    try {
      const records = await getProperties();

      if (isMounted.current) {
        setProperties(records);
        setError("");
      }
    } catch (caughtError) {
      if (isMounted.current) {
        setError(
          caughtError instanceof ApiError
            ? caughtError.message
            : "Properties could not be loaded.",
        );
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    const loadTimer = window.setTimeout(() => {
      void loadProperties();
    }, 0);

    return () => {
      isMounted.current = false;
      window.clearTimeout(loadTimer);
    };
  }, [loadProperties]);

  const handleRetry = () => {
    if (isLoading) {
      return;
    }

    setError("");
    setIsLoading(true);
    void loadProperties();
  };

  const handleDelete = async (property: Property) => {
    if (deletingIdRef.current !== null) return;

    const confirmed = window.confirm(
      `Delete “${property.title}”? This will permanently remove the property, its inquiries, visits, and images. This action cannot be undone.`,
    );
    if (!confirmed) return;

    deletingIdRef.current = property.id;
    setDeletingId(property.id);
    setDeleteError("");

    try {
      await deleteProperty(property.id);

      if (isMounted.current) {
        setProperties((current) => current.filter((record) => record.id !== property.id));
      }
    } catch (caughtError) {
      if (isMounted.current) {
        setDeleteError(caughtError instanceof ApiError ? caughtError.message : "The property could not be deleted.");
      }
    } finally {
      deletingIdRef.current = null;
      if (isMounted.current) setDeletingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-4xl font-bold">Properties</h1>
          <p className="mt-2 text-gray-600">Review the properties currently listed on the platform.</p>
        </div>
        <Link
          href="/add-property"
          className="rounded-lg bg-blue-600 px-5 py-3 text-center font-semibold text-white transition hover:bg-blue-700"
        >
          Post Property
        </Link>
      </div>

      {deleteError && (
        <p role="alert" className="mb-6 rounded-xl bg-red-50 p-4 text-red-700">
          {deleteError}
        </p>
      )}

      {isLoading ? (
        <div className="rounded-xl bg-white p-6 text-gray-600 shadow-lg">
          Loading properties...
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800">
          <p role="alert">{error}</p>
          <button
            type="button"
            onClick={handleRetry}
            className="mt-4 rounded-lg bg-red-700 px-5 py-3 font-semibold text-white transition hover:bg-red-800"
          >
            Retry
          </button>
        </div>
      ) : properties.length === 0 ? (
        <div className="rounded-xl bg-white p-8 text-center shadow-lg">
          <h2 className="text-2xl font-bold">No properties found</h2>
          <p className="mt-2 text-gray-600">
            Create your first property to begin managing listings.
          </p>
          <Link
            href="/add-property"
            className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Post Property
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {properties.map((property) => {
            const imageUrl = property.primary_image ?? property.image;

            return (
              <article
                key={property.id}
                className="overflow-hidden rounded-xl bg-white shadow-lg md:flex"
              >
                {imageUrl ? (
                  <div
                    role="img"
                    aria-label={property.title}
                    className="h-56 bg-cover bg-center md:h-auto md:w-64 md:shrink-0"
                    style={{ backgroundImage: `url(${JSON.stringify(imageUrl)})` }}
                  />
                ) : (
                  <div className="flex h-56 items-center justify-center bg-gray-200 font-semibold text-gray-500 md:h-auto md:w-64 md:shrink-0">
                    No image
                  </div>
                )}

                <div className="flex flex-1 flex-col gap-5 p-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{property.title}</h2>
                      <p className="mt-1 text-gray-600">{property.city}, {property.state}</p>
                    </div>
                    <p className="text-xl font-bold text-blue-700">{formatPrice(property.price)}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold capitalize text-blue-800">
                      {property.type}
                    </span>
                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-semibold capitalize text-indigo-800">
                      {property.category}
                    </span>
                  </div>

                  <dl className="grid gap-4 text-sm text-gray-700 sm:grid-cols-3">
                    <div>
                      <dt className="font-semibold text-gray-500">Area</dt>
                      <dd className="mt-1">{property.area} sq ft</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-gray-500">Images</dt>
                      <dd className="mt-1">{property.images_count ?? 0}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-gray-500">Created</dt>
                      <dd className="mt-1">{formatDate(property.created_at)}</dd>
                    </div>
                  </dl>

                  <div className="mt-auto flex flex-wrap gap-3">
                    <Link
                      href={`/property/${property.id}`}
                      className="inline-block rounded-lg border border-blue-600 px-4 py-2 font-semibold text-blue-700 transition hover:bg-blue-50"
                    >
                      View Property
                    </Link>
                    <Link
                      href={`/dashboard/properties/${property.id}/edit`}
                      className="inline-block rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => void handleDelete(property)}
                      disabled={deletingId !== null}
                      className="rounded-lg border border-red-600 px-4 py-2 font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {deletingId === property.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
