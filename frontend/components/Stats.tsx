export default function Stats() {
  return (
    <section className="bg-blue-600 text-white py-16">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8 text-center">
        <div>
          <h2 className="text-4xl font-bold">10K+</h2>
          <p>Properties</p>
        </div>

        <div>
          <h2 className="text-4xl font-bold">5K+</h2>
          <p>Happy Clients</p>
        </div>

        <div>
          <h2 className="text-4xl font-bold">500+</h2>
          <p>Trusted Agents</p>
        </div>

        <div>
          <h2 className="text-4xl font-bold">25+</h2>
          <p>Cities</p>
        </div>
      </div>
    </section>
  );
}