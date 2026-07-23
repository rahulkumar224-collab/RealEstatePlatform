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
      <img
        src={property.image}
        alt={property.title}
        className="w-full h-[500px] object-cover rounded-xl"
      />

      <h1 className="text-4xl font-bold mt-8">
        {property.title}
      </h1>

      <p className="text-gray-500 mt-2">
        {property.location}
      </p>

      <h2 className="text-3xl text-blue-600 font-bold mt-4">
        {property.price}
      </h2>

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
    </div>
  );
}