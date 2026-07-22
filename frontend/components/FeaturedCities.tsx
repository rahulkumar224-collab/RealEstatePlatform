export default function FeaturedCities() {
  const cities = [
    "Mumbai",
    "Delhi",
    "Bangalore",
    "Hyderabad",
    "Pune",
    "Chennai",
  ];

  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      <h2 className="text-4xl font-bold text-center mb-12">
        Explore by City
      </h2>

      <div className="grid md:grid-cols-3 gap-6">
        {cities.map((city) => (
          <div
            key={city}
            className="bg-blue-600 text-white rounded-xl p-10 text-center text-2xl font-bold hover:bg-blue-700 transition cursor-pointer"
          >
            {city}
          </div>
        ))}
      </div>
    </section>
  );
}