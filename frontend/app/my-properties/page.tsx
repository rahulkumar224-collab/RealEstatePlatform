import { properties } from "../../data/properties";
import PropertyCard from "../../components/PropertyCard";

export default function MyPropertiesPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="text-4xl font-bold mb-8">
        My Properties
      </h1>

      <div className="grid md:grid-cols-3 gap-8">
        {properties.map((property) => (
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
    </div>
  );
}