import { properties } from "../data/properties";
import PropertyCard from "./PropertyCard";

type Props = {
  currentId: number;
};

export default function RelatedProperties({ currentId }: Props) {
  const related = properties
    .filter((property) => property.id !== currentId)
    .slice(0, 3);

  return (
    <section className="mt-16">
      <h2 className="text-3xl font-bold mb-8">
        Related Properties
      </h2>

      <div className="grid md:grid-cols-3 gap-8">
        {related.map((property) => (
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