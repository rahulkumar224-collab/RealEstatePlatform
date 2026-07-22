export default function Newsletter() {
  return (
    <section className="bg-blue-600 text-white py-20 mt-16">
      <div className="max-w-4xl mx-auto text-center px-6">
        <h2 className="text-4xl font-bold mb-4">
          Stay Updated
        </h2>

        <p className="text-lg mb-8">
          Subscribe to receive the latest property listings and real estate news.
        </p>

        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <input
            type="email"
            placeholder="Enter your email"
            className="px-5 py-3 rounded-lg text-black w-full md:w-96"
          />

          <button className="bg-white text-blue-600 font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition">
            Subscribe
          </button>
        </div>
      </div>
    </section>
  );
}