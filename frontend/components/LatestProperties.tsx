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

        <PropertyCard
          title="Luxury Villa"
          location="Goa"
          price="₹3.20 Cr"
          image="https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800"
          beds={4}
          baths={3}
          area="2800 sq ft"
        />

        <PropertyCard
          title="New Apartment"
          location="Noida"
          price="₹85 Lakh"
          image="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800"
          beds={3}
          baths={2}
          area="1350 sq ft"
        />

        <PropertyCard
          title="Farm House"
          location="Jaipur"
          price="₹1.90 Cr"
          image="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800"
          beds={5}
          baths={4}
          area="3500 sq ft"
        />

        <PropertyCard
          title="Commercial Office"
          location="Gurgaon"
          price="₹4.50 Cr"
          image="https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800"
          beds={8}
          baths={4}
          area="5000 sq ft"
        />

      </div>
    </section>
  );
}