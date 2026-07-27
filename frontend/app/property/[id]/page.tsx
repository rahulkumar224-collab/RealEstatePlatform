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
  const [selectedImage, setSelectedImage] = useState("");
  const [name, setName] = useState("");
const [email, setEmail] = useState("");
const [phone, setPhone] = useState("");
const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/properties/${id}`)
      .then((res) => res.json())
      .then((data) => {
  setProperty(data);
  setSelectedImage(data.image);
  setMessage(`Hi, I'm interested in ${data.title}. Please contact me.`);
})
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
  const handleInquiry = () => {
  if (!name || !email || !phone || !message) {
    alert("Please fill all fields.");
    return;
  }

  alert("Inquiry submitted successfully!");
};

  if (!property) {
    return <div className="text-center py-20 text-xl">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-6">
      <img
  src={selectedImage}
  alt={property.title}
  className="w-full h-[500px] object-cover rounded-2xl shadow-lg transition-all duration-300"
/>
<div className="flex gap-4 mt-4">

  {[1, 2, 3, 4].map((item) => (
    <img
      key={item}
      src={property.image}
      alt={property.title}
      onClick={() => setSelectedImage(property.image)}
      className={`h-28 w-40 object-cover rounded-lg cursor-pointer border-4 transition-all duration-300 ${
        selectedImage === property.image
          ? "border-blue-600"
          : "border-transparent hover:border-blue-300"
      }`}
    />
  ))}

</div>

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
      <div className="mt-8">
  <h3 className="text-2xl font-bold mb-4">
    Send Inquiry
  </h3>

  <div className="space-y-4">

    <input
      type="text"
      placeholder="Your Name"
      value={name}
  onChange={(e) => setName(e.target.value)}
      className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />

    <input
      type="email"
      placeholder="Your Email"
      value={email}
  onChange={(e) => setEmail(e.target.value)}
      className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />

    <input
      type="tel"
      placeholder="Phone Number"
      value={phone}
  onChange={(e) => setPhone(e.target.value)}
      className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />

    <textarea
      placeholder="Your Message"
      rows={5}
        value={message}
onChange={(e) => setMessage(e.target.value)}
      className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
      defaultValue={`Hi, I'm interested in ${property.title}. Please contact me.`}
    />
    

   <button
  onClick={handleInquiry}
  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:scale-105 transition duration-300"
>
  Send Inquiry
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