import { properties } from "../data/properties";
import PropertyCard from "./PropertyCard";

export default function LatestProperties() {
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

        {properties.slice(3, 7).map((property) => (
  <PropertyCard
    key={property.id}
    id={property.id}
    title={property.title}
    location={property.location}
    price={property.price}
    image={property.image}
    beds={property.beds}
    baths={property.baths}
    area={property.area}
  />
))}

      </div>
    </section>
  );
}