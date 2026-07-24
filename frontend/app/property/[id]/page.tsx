import RelatedProperties from "../../../components/RelatedProperties";
import ContactAgent from "../../../components/ContactAgent";
import PropertyGallery from "../../../components/PropertyGallery";
import { properties } from "../../../data/properties";

export default async function PropertyDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const property = properties.find((item) => item.id === Number(id));

  if (!property) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center">
        <h1 className="text-3xl font-bold">Property Not Found</h1>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <PropertyGallery images={property.images} />

      <h1 className="text-4xl font-bold mt-8">
        {property.title}
      </h1>

      <p className="text-gray-500 mt-2">
        {property.location}
      </p>

      <div className="flex justify-between items-center mt-4">
  <h2 className="text-3xl text-blue-600 font-bold">
    {property.price}
  </h2>

  <div className="flex gap-3">
    <button className="border rounded-lg px-4 py-2 hover:bg-red-50 transition">
      ❤️ Favorite
    </button>

    <button className="border rounded-lg px-4 py-2 hover:bg-blue-50 transition">
      🔗 Share
    </button>
  </div>
</div>

      <div className="flex gap-8 mt-6 text-lg">
        <span>🛏 {property.beds} Beds</span>
        <span>🚿 {property.baths} Baths</span>
        <span>📐 {property.area}</span>
      </div>

     <h3 className="text-2xl font-bold mt-10">
  Description
</h3>

<p className="text-gray-700 mt-3 leading-8">
  {property.description}
</p>

<div className="mt-10">
  <h3 className="text-2xl font-bold mb-5">
    Property Features
  </h3>

  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
    {property.features.map((feature, index) => (
      <div
        key={index}
        className="bg-blue-50 rounded-lg p-4 font-medium"
      >
        ✅ {feature}
      </div>
    ))}
  </div>
</div>

<ContactAgent />
<RelatedProperties currentId={property.id} />
</div>
  );
}