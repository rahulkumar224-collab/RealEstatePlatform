export default function Categories() {
  const categories = [
    { name: "Apartments", icon: "🏢" },
    { name: "Villas", icon: "🏡" },
    { name: "Commercial", icon: "🏬" },
    { name: "Plots", icon: "🌳" },
  ];

  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      <h2 className="text-3xl font-bold text-center mb-10">
        Browse by Category
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {categories.map((category) => (
          <div
            key={category.name}
            className="bg-white shadow-md rounded-xl p-8 text-center hover:shadow-xl transition cursor-pointer"
          >
            <div className="text-5xl mb-4">{category.icon}</div>

            <h3 className="text-xl font-semibold">
              {category.name}
            </h3>
          </div>
        ))}
      </div>
    </section>
  );
}