"use client";

import { use, useEffect, useState } from "react";
import PropertyCard from "../../../components/PropertyCard";

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
  const [relatedProperties, setRelatedProperties] = useState<Property[]>([]);

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/properties/${id}`)
      .then((res) => res.json())
      .then((data) => setProperty(data))
      .catch(console.error);

    fetch("http://127.0.0.1:8000/api/properties")
      .then((res) => res.json())
      .then((all) => {
        const filtered = all
          .filter((p: Property) => p.id !== Number(id))
          .slice(0, 3);

        setRelatedProperties(filtered);
      })
      .catch(console.error);
  }, [id]);

  if (!property) {
    return <div className="text-center py-20 text-xl">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-6">
      <img
        src={property.image}
        alt={property.title}
        className="w-full h-[500px] object-cover rounded-2xl shadow-lg"
      />

      <div className="flex justify-between items-center mt-8">
        <div>
          <div className="flex gap-3 mb-3">
            <span className="bg-blue-600 text-white px-3 py-1 rounded-full">
              {property.type.toUpperCase()}
            </span>

            <span className="bg-green-600 text-white px-3 py-1 rounded-full">
              {property.category.toUpperCase()}
            </span>
          </div>

          <h1 className="text-5xl font-bold">{property.title}</h1>

          <p className="text-gray-500 mt-2">
            📍 {property.city}, {property.state}
          </p>
        </div>

        <div>
          <p className="text-4xl text-blue-600 font-bold">
            ₹{Number(property.price).toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mt-10">
        <div className="bg-gray-100 rounded-xl p-6 text-center">
          <h3 className="font-bold text-xl">🛏 Bedrooms</h3>
          <p>{property.bedrooms}</p>
        </div>

        <div className="bg-gray-100 rounded-xl p-6 text-center">
          <h3 className="font-bold text-xl">🚿 Bathrooms</h3>
          <p>{property.bathrooms}</p>
        </div>

        <div className="bg-gray-100 rounded-xl p-6 text-center">
          <h3 className="font-bold text-xl">📐 Area</h3>
          <p>{property.area} sq ft</p>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-3xl font-bold mb-4">Description</h2>

        <p className="text-gray-700 leading-8">
          {property.description}
        </p>
      </div>

      <div className="mt-12 bg-white rounded-2xl shadow-lg p-8 border">
        <h2 className="text-3xl font-bold mb-6">
          Contact Agent
        </h2>

        <div className="space-y-4">
          <button className="w-full bg-blue-600 text-white py-3 rounded-lg">
            📞 Call Agent
          </button>

          <button className="w-full bg-green-600 text-white py-3 rounded-lg">
            💬 WhatsApp
          </button>

          <button className="w-full bg-gray-800 text-white py-3 rounded-lg">
            ✉️ Email Agent
          </button>
        </div>
      </div>

      <div className="mt-16">
        <h2 className="text-3xl font-bold mb-8">
          Related Properties
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {relatedProperties.map((item) => (
            <PropertyCard
              key={item.id}
              id={item.id}
              title={item.title}
              location={`${item.city}, ${item.state}`}
              price={`₹${Number(item.price).toLocaleString("en-IN")}`}
              image={item.image}
              beds={item.bedrooms ?? 0}
              baths={item.bathrooms ?? 0}
              area={`${item.area} sq ft`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}