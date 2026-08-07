"use client";

import { useEffect, useState } from "react";
import PropertyCard from "./PropertyCard";
import type { Property } from "../lib/api";

export default function LatestProperties() {
  const [properties, setProperties] = useState<Property[]>([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/properties")
      .then((res) => res.json())
      .then((data) => setProperties(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">
          Latest Properties
        </h2>

        <button className="text-blue-600 font-semibold">
          View All
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {properties.slice(1, 5).map((property) => (
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
    </section>
  );
}
