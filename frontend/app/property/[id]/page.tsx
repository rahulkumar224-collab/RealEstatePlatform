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
  const [favorite, setFavorite] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [name, setName] = useState("");
const [email, setEmail] = useState("");
const [phone, setPhone] = useState("");
const [message, setMessage] = useState("");
const [visitDate, setVisitDate] = useState("");
const [visitTime, setVisitTime] = useState("");

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

const handleVisitBooking = () => {
  if (!visitDate || !visitTime) {
    alert("Please select visit date and time.");
    return;
  }

  alert(`Visit booked on ${visitDate} at ${visitTime}`);
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
  <img
    src={property.image}
    alt={property.title}
    onClick={() => setSelectedImage(property.image)}
    className="h-28 w-40 object-cover rounded-lg border-4 border-blue-600 cursor-pointer"
  />
</div>
<div className="flex justify-end gap-4 mb-6">

  <button
    onClick={() => setFavorite(!favorite)}
    className={`px-5 py-3 rounded-xl font-semibold transition ${
      favorite
        ? "bg-red-600 text-white"
        : "bg-gray-200 hover:bg-gray-300"
    }`}
  >
    {favorite ? "❤️ Saved" : "🤍 Save Property"}
  </button>

  <button
    onClick={() => {
      navigator.clipboard.writeText(window.location.href);
      alert("Property link copied!");
    }}
    className="bg-blue-600 text-white px-5 py-3 rounded-xl hover:bg-blue-700 transition"
  >
    📤 Share
  </button>

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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">

  <div className="bg-blue-50 p-6 rounded-xl text-center">
    <p className="text-gray-500">Property ID</p>
    <h3 className="text-xl font-bold">#{property.id}</h3>
  </div>

  <div className="bg-green-50 p-6 rounded-xl text-center">
    <p className="text-gray-500">Type</p>
  <h3 className="text-xl font-bold">
  {property.type.toUpperCase()}
</h3>
  </div>

  <div className="bg-yellow-50 p-6 rounded-xl text-center">
    <p className="text-gray-500">Category</p>
    <h3 className="text-xl font-bold">
  {property.category.toUpperCase()}
</h3>
  </div>

  <div className="bg-purple-50 p-6 rounded-xl text-center">
    <p className="text-gray-500">City</p>
    <h3 className="text-xl font-bold">{property.city}</h3>
  </div>

</div>

      <div className="mt-10">
        <h2 className="text-3xl font-bold mb-4">Description</h2>

        <p className="text-gray-700 leading-8">
          {property.description}
        </p>
      </div>
      <div className="mt-12">
  <h2 className="text-3xl font-bold mb-6">
    Features & Amenities
  </h2>

  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

    <div className="bg-gray-100 p-5 rounded-xl text-center">
      🚗
      <p className="mt-2 font-semibold">Parking</p>
    </div>

    <div className="bg-gray-100 p-5 rounded-xl text-center">
      🏊
      <p className="mt-2 font-semibold">Swimming Pool</p>
    </div>

    <div className="bg-gray-100 p-5 rounded-xl text-center">
      🌳
      <p className="mt-2 font-semibold">Garden</p>
    </div>

    <div className="bg-gray-100 p-5 rounded-xl text-center">
      🛗
      <p className="mt-2 font-semibold">Lift</p>
    </div>

    <div className="bg-gray-100 p-5 rounded-xl text-center">
      🔒
      <p className="mt-2 font-semibold">24x7 Security</p>
    </div>

    <div className="bg-gray-100 p-5 rounded-xl text-center">
      🏋️
      <p className="mt-2 font-semibold">Gym</p>
    </div>

    <div className="bg-gray-100 p-5 rounded-xl text-center">
      ⚡
      <p className="mt-2 font-semibold">Power Backup</p>
    </div>

    <div className="bg-gray-100 p-5 rounded-xl text-center">
      💧
      <p className="mt-2 font-semibold">Water Supply</p>
    </div>

  </div>
</div>
<div className="mt-12 bg-white rounded-2xl shadow-lg p-8 border">

  <h2 className="text-3xl font-bold mb-6">
    👤 Agent Information
  </h2>

  <div className="flex items-center gap-6">

    <img
      src="https://i.pravatar.cc/150?img=12"
      alt="Agent"
      className="w-28 h-28 rounded-full object-cover border-4 border-blue-500"
    />

    <div>

      <h3 className="text-2xl font-bold">
        Rahul Sharma
      </h3>

      <p className="text-gray-500">
        Senior Property Consultant
      </p>

      <div className="grid grid-cols-2 gap-4 mt-4">

        <p>⭐ 4.9 Rating</p>

        <p>🏠 150 Properties</p>

        <p>📞 +91 9876543210</p>

        <p>✉️ rahul@example.com</p>

      </div>

    </div>

  </div>

</div>
<div className="mt-12 bg-yellow-50 rounded-2xl p-8 border">

  <div className="flex flex-col md:flex-row justify-between items-center">

    <div>
      <h2 className="text-5xl font-bold text-yellow-600">
        4.8
      </h2>

      <p className="text-xl">
        ⭐⭐⭐⭐⭐
      </p>

      <p className="text-gray-600">
        Based on 256 Reviews
      </p>
    </div>

    <div className="w-full md:w-1/2 mt-6 md:mt-0 space-y-3">

      <div className="flex items-center gap-3">
        <span className="w-10">5⭐</span>
        <div className="flex-1 bg-gray-200 rounded-full h-3">
          <div className="bg-yellow-500 h-3 rounded-full w-[80%]"></div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="w-10">4⭐</span>
        <div className="flex-1 bg-gray-200 rounded-full h-3">
          <div className="bg-yellow-500 h-3 rounded-full w-[15%]"></div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="w-10">3⭐</span>
        <div className="flex-1 bg-gray-200 rounded-full h-3">
          <div className="bg-yellow-500 h-3 rounded-full w-[3%]"></div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="w-10">2⭐</span>
        <div className="flex-1 bg-gray-200 rounded-full h-3">
          <div className="bg-yellow-500 h-3 rounded-full w-[1%]"></div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="w-10">1⭐</span>
        <div className="flex-1 bg-gray-200 rounded-full h-3">
          <div className="bg-yellow-500 h-3 rounded-full w-[1%]"></div>
        </div>
      </div>

    </div>

  </div>

</div>
<div className="mt-12">

  <h2 className="text-3xl font-bold mb-6">
    ⭐ Customer Reviews
  </h2>

  <div className="space-y-6">

    <div className="bg-gray-100 p-6 rounded-xl">
      <div className="flex justify-between">
        <h3 className="font-bold">Rahul Verma</h3>
        <span>⭐⭐⭐⭐⭐</span>
      </div>

      <p className="text-gray-600 mt-2">
        Excellent property. The buying process was smooth and the agent was very helpful.
      </p>
    </div>

    <div className="bg-gray-100 p-6 rounded-xl">
      <div className="flex justify-between">
        <h3 className="font-bold">Priya Singh</h3>
        <span>⭐⭐⭐⭐☆</span>
      </div>

      <p className="text-gray-600 mt-2">
        Great location and reasonable price. Highly recommended.
      </p>
    </div>

    <div className="bg-gray-100 p-6 rounded-xl">
      <div className="flex justify-between">
        <h3 className="font-bold">Amit Kumar</h3>
        <span>⭐⭐⭐⭐⭐</span>
      </div>

      <p className="text-gray-600 mt-2">
        Amazing experience. Everything matched the property description.
      </p>
    </div>

  </div>

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
<div className="mt-12 bg-white rounded-2xl shadow-lg p-8 border">

  <h2 className="text-3xl font-bold mb-6">
    📅 Schedule Property Visit
  </h2>

  <div className="space-y-4">

    <input
      type="date"
      value={visitDate}
      onChange={(e) => setVisitDate(e.target.value)}
      className="w-full border rounded-xl p-3"
    />

    <input
      type="time"
      value={visitTime}
      onChange={(e) => setVisitTime(e.target.value)}
      className="w-full border rounded-xl p-3"
    />

    <button
      onClick={handleVisitBooking}
      className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition"
    >
      📅 Book Visit
    </button>

  </div>

</div>
<div className="mt-16">
  <h2 className="text-3xl font-bold mb-6">
    Property Location
  </h2>

  <div className="rounded-2xl overflow-hidden shadow-lg">

    <iframe
      title="Property Location"
      src={`https://www.google.com/maps?q=${property.city}&output=embed`}
      width="100%"
      height="450"
      loading="lazy"
      className="border-0"
    />

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