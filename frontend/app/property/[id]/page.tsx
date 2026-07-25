"use client";

import { use, useEffect, useState } from "react";

type Property = {
  id: number;
  title: string;
  description: string;
  price: string;
  city: string;
  state: string;
  image: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  category: string;
  type: string;
};


export default function PropertyDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [property, setProperty] = useState<Property | null>(null);

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/properties/${id}`)
      .then((res) => res.json())
      .then((data) => setProperty(data))
      .catch(console.error);
  }, [id]);

  if (!property) {
    return (
      <div className="text-center py-20 text-xl">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-6">

      <img
        src={property.image}
        alt={property.title}
        className="w-full h-[450px] object-cover rounded-xl"
      />

      <h1 className="text-4xl font-bold mt-8">
        {property.title}
      </h1>

      <p className="text-gray-500 mt-2">
        {property.city}, {property.state}
      </p>

      <p className="text-blue-600 text-3xl font-bold mt-4">
        ₹{Number(property.price).toLocaleString("en-IN")}
      </p>

      <div className="flex gap-8 mt-6 text-lg">
        <span>🛏 {property.bedrooms} Beds</span>
        <span>🚿 {property.bathrooms} Baths</span>
        <span>📐 {property.area} sq ft</span>
      </div>

      <p className="mt-8 leading-8 text-gray-700">
        {property.description}
      </p>

    </div>
  );
}