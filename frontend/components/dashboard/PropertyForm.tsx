"use client";

import { FormEvent, ReactNode, useState } from "react";
import {
  CreatePropertyPayload,
  Property,
  PropertyCategory,
  PropertyType,
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

type PropertyFormProps = {
  initialProperty?: Property;
  onSubmit: (payload: CreatePropertyPayload) => void | Promise<void>;
  isSubmitting: boolean;
  disabled?: boolean;
  submitLabel: string;
  submittingLabel: string;
  children?: ReactNode;
};

const createInitialForm = (property?: Property): FormState => ({
  title: property?.title ?? "",
  description: property?.description ?? "",
  price: property ? String(property.price) : "",
  city: property?.city ?? "",
  state: property?.state ?? "",
  type: property?.type ?? "buy",
  category: property?.category ?? "residential",
  bedrooms: property?.bedrooms == null ? "" : String(property.bedrooms),
  bathrooms: property?.bathrooms == null ? "" : String(property.bathrooms),
  area: property ? String(property.area) : "",
});

const buildPayload = (
  form: FormState,
): { error: string; payload?: CreatePropertyPayload } => {
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
  if (!(form.type === "buy" || form.type === "rent")) {
    return { error: "Select a valid property type." };
  }
  if (!(form.category === "residential" || form.category === "commercial")) {
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

export default function PropertyForm({
  initialProperty,
  onSubmit,
  isSubmitting,
  disabled = false,
  submitLabel,
  submittingLabel,
  children,
}: PropertyFormProps) {
  const [form, setForm] = useState<FormState>(() => createInitialForm(initialProperty));
  const [validationError, setValidationError] = useState("");
  const controlsDisabled = disabled || isSubmitting;

  const setField = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (controlsDisabled) return;

    const { error, payload } = buildPayload(form);

    if (error || !payload) {
      setValidationError(error);
      return;
    }

    setValidationError("");
    void onSubmit(payload);
  };

  const inputClassName = "w-full rounded-lg border p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100";

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      {validationError && (
        <p role="alert" className="rounded-lg bg-red-50 p-4 text-red-700">
          {validationError}
        </p>
      )}

      <label className="block">
        <span className="mb-2 block font-medium text-gray-700">Property title</span>
        <input type="text" value={form.title} onChange={(event) => setField("title", event.target.value)} maxLength={255} required disabled={controlsDisabled} className={inputClassName} />
      </label>

      <label className="block">
        <span className="mb-2 block font-medium text-gray-700">Description</span>
        <textarea value={form.description} onChange={(event) => setField("description", event.target.value)} rows={5} required disabled={controlsDisabled} className={inputClassName} />
      </label>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block font-medium text-gray-700">Price</span>
          <input type="number" value={form.price} onChange={(event) => setField("price", event.target.value)} min="0.01" step="0.01" required disabled={controlsDisabled} className={inputClassName} />
        </label>
        <label className="block">
          <span className="mb-2 block font-medium text-gray-700">Area (sq ft)</span>
          <input type="number" value={form.area} onChange={(event) => setField("area", event.target.value)} min="1" step="1" required disabled={controlsDisabled} className={inputClassName} />
        </label>
        <label className="block">
          <span className="mb-2 block font-medium text-gray-700">City</span>
          <input type="text" value={form.city} onChange={(event) => setField("city", event.target.value)} maxLength={255} required disabled={controlsDisabled} className={inputClassName} />
        </label>
        <label className="block">
          <span className="mb-2 block font-medium text-gray-700">State</span>
          <input type="text" value={form.state} onChange={(event) => setField("state", event.target.value)} maxLength={255} required disabled={controlsDisabled} className={inputClassName} />
        </label>
        <label className="block">
          <span className="mb-2 block font-medium text-gray-700">Type</span>
          <select value={form.type} onChange={(event) => setField("type", event.target.value as PropertyType)} disabled={controlsDisabled} className={inputClassName}>
            <option value="buy">Buy</option>
            <option value="rent">Rent</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block font-medium text-gray-700">Category</span>
          <select value={form.category} onChange={(event) => setField("category", event.target.value as PropertyCategory)} disabled={controlsDisabled} className={inputClassName}>
            <option value="residential">Residential</option>
            <option value="commercial">Commercial</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block font-medium text-gray-700">Bedrooms (optional)</span>
          <input type="number" value={form.bedrooms} onChange={(event) => setField("bedrooms", event.target.value)} min="0" step="1" disabled={controlsDisabled} className={inputClassName} />
        </label>
        <label className="block">
          <span className="mb-2 block font-medium text-gray-700">Bathrooms (optional)</span>
          <input type="number" value={form.bathrooms} onChange={(event) => setField("bathrooms", event.target.value)} min="0" step="1" disabled={controlsDisabled} className={inputClassName} />
        </label>
      </div>

      {children}

      <button type="submit" disabled={controlsDisabled} className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300">
        {isSubmitting ? submittingLabel : submitLabel}
      </button>
    </form>
  );
}
