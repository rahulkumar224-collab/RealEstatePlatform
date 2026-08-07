"use client";

import { useCallback, useEffect, useState } from "react";
import PropertyCard from "./PropertyCard";
import { ApiError, getProperties, Property } from "../lib/api";

export default function LatestProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProperties = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      setProperties(await getProperties());
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Latest properties could not be loaded.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadTimer = window.setTimeout(() => {
      void loadProperties();
    }, 0);

    return () => window.clearTimeout(loadTimer);
  }, [loadProperties]);

  const latestProperties = properties.slice(1, 5);

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-3xl font-bold">Latest Properties</h2>
        <button className="font-semibold text-blue-600">View All</button>
      </div>

      {isLoading ? (
        <div className="rounded-xl bg-gray-50 p-8 text-center text-gray-600">Loading latest properties...</div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center text-red-800">
          <p role="alert">{error}</p>
          <button type="button" onClick={() => void loadProperties()} className="mt-4 rounded-lg bg-red-700 px-5 py-3 font-semibold text-white">Retry</button>
        </div>
      ) : latestProperties.length === 0 ? (
        <div className="rounded-xl bg-gray-50 p-8 text-center text-gray-600">No latest properties are available.</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {latestProperties.map((property) => (
            <PropertyCard
              key={property.id}
              id={property.id}
              title={property.title}
              location={`${property.city}, ${property.state}`}
              price={`₹${Number(property.price).toLocaleString("en-IN")}`}
              image={property.primary_image ?? property.image ?? ""}
              beds={property.bedrooms ?? 0}
              baths={property.bathrooms ?? 0}
              area={`${property.area} sq ft`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
