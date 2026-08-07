"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import PropertyForm from "../../../../../components/dashboard/PropertyForm";
import {
  ApiError,
  CreatePropertyPayload,
  getProperty,
  Property,
  updateProperty,
} from "../../../../../lib/api";

export default function EditPropertyPage() {
  const params = useParams<{ id: string }>();
  const propertyId = Number(params.id);
  const invalidId = !Number.isInteger(propertyId) || propertyId < 1;
  const isMounted = useRef(false);
  const saveLock = useRef(false);
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isNotFound, setIsNotFound] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [success, setSuccess] = useState("");

  const loadProperty = useCallback(async () => {
    if (invalidId) return;

    try {
      const record = await getProperty(propertyId);
      if (isMounted.current) {
        setProperty(record);
        setLoadError("");
        setIsNotFound(false);
      }
    } catch (caughtError) {
      if (!isMounted.current) return;

      if (caughtError instanceof ApiError && caughtError.status === 404) {
        setIsNotFound(true);
      } else {
        setLoadError(caughtError instanceof ApiError ? caughtError.message : "Property could not be loaded.");
      }
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  }, [invalidId, propertyId]);

  useEffect(() => {
    isMounted.current = true;
    const loadTimer = window.setTimeout(() => {
      void loadProperty();
    }, 0);

    return () => {
      isMounted.current = false;
      window.clearTimeout(loadTimer);
    };
  }, [loadProperty]);

  const handleRetry = () => {
    setLoadError("");
    setIsLoading(true);
    void loadProperty();
  };

  const handleUpdate = async (payload: CreatePropertyPayload) => {
    if (saveLock.current || invalidId) return;

    saveLock.current = true;
    setIsSaving(true);
    setSaveError("");
    setSuccess("");

    try {
      const updated = await updateProperty(propertyId, payload);
      if (isMounted.current) {
        setProperty(updated);
        setSuccess("Property updated successfully.");
      }
    } catch (caughtError) {
      if (isMounted.current) {
        if (caughtError instanceof ApiError && caughtError.status === 404) {
          setIsNotFound(true);
        } else {
          setSaveError(caughtError instanceof ApiError ? caughtError.message : "The property could not be updated.");
        }
      }
    } finally {
      saveLock.current = false;
      if (isMounted.current) setIsSaving(false);
    }
  };

  if (invalidId || isNotFound) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="rounded-xl bg-white p-8 text-center shadow-lg">
          <h1 className="text-3xl font-bold">Property not found</h1>
          <p className="mt-2 text-gray-600">The requested property may have been removed.</p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/dashboard/properties" className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white">Back to Properties</Link>
            <Link href="/add-property" className="rounded-lg border border-blue-600 px-5 py-3 font-semibold text-blue-700">Post Property</Link>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <div className="p-10 text-center text-gray-600">Loading property...</div>;
  }

  if (loadError || !property) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center text-red-800">
          <h1 className="text-3xl font-bold">Property could not be loaded</h1>
          <p role="alert" className="mt-2">{loadError || "Please try again."}</p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <button type="button" onClick={handleRetry} className="rounded-lg bg-red-700 px-5 py-3 font-semibold text-white">Retry</button>
            <Link href="/dashboard/properties" className="rounded-lg border border-red-700 px-5 py-3 font-semibold">Back to Properties</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="rounded-xl bg-white p-8 shadow-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-4xl font-bold">Edit Property</h1>
            <p className="mt-2 text-gray-600">Update the property listing details.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href={`/property/${property.id}`} className="rounded-lg border border-blue-600 px-4 py-2 font-semibold text-blue-700">View Property</Link>
            <Link href="/dashboard/properties" className="rounded-lg border px-4 py-2 font-semibold text-gray-700">Back</Link>
          </div>
        </div>

        {saveError && <p role="alert" className="mt-6 rounded-lg bg-red-50 p-4 text-red-700">{saveError}</p>}
        {success && <p role="status" className="mt-6 rounded-lg bg-green-50 p-4 text-green-700">{success}</p>}

        <PropertyForm
          initialProperty={property}
          onSubmit={handleUpdate}
          isSubmitting={isSaving}
          submitLabel="Save changes"
          submittingLabel="Saving changes..."
        />
      </div>
    </div>
  );
}
