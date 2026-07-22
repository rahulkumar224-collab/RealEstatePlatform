export default function Testimonials() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      <h2 className="text-4xl font-bold text-center mb-12">
        What Our Clients Say
      </h2>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="bg-white shadow-lg rounded-xl p-6">
          <p className="text-gray-600">
            "Excellent platform! I found my dream home in just a few days."
          </p>

          <h3 className="mt-6 font-bold text-lg">
            Rahul Sharma
          </h3>

          <p className="text-blue-600">
            Home Buyer
          </p>
        </div>

        <div className="bg-white shadow-lg rounded-xl p-6">
          <p className="text-gray-600">
            "Very easy to use and verified properties saved me a lot of time."
          </p>

          <h3 className="mt-6 font-bold text-lg">
            Priya Verma
          </h3>

          <p className="text-blue-600">
            Property Investor
          </p>
        </div>

        <div className="bg-white shadow-lg rounded-xl p-6">
          <p className="text-gray-600">
            "Professional agents and excellent customer support."
          </p>

          <h3 className="mt-6 font-bold text-lg">
            Amit Singh
          </h3>

          <p className="text-blue-600">
            Seller
          </p>
        </div>
      </div>
    </section>
  );
}