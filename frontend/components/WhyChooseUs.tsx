export default function WhyChooseUs() {
  const features = [
    {
      title: "Verified Properties",
      description: "All listings are verified before they are published.",
      icon: "✅",
    },
    {
      title: "Best Prices",
      description: "Find properties at competitive market prices.",
      icon: "💰",
    },
    {
      title: "Trusted Agents",
      description: "Connect with experienced and trusted agents.",
      icon: "🤝",
    },
    {
      title: "24/7 Support",
      description: "Our support team is available anytime.",
      icon: "📞",
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      <h2 className="text-3xl font-bold text-center mb-10">
        Why Choose Us
      </h2>

      <div className="grid md:grid-cols-4 gap-6">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-xl transition"
          >
            <div className="text-5xl mb-4">{feature.icon}</div>

            <h3 className="text-xl font-semibold mb-2">
              {feature.title}
            </h3>

            <p className="text-gray-600">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}