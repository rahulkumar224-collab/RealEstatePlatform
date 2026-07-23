import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import SearchBar from "../components/SearchBar";
import PropertyCard from "../components/PropertyCard";
import Categories from "../components/Categories";
import WhyChooseUs from "../components/WhyChooseUs";
import Stats from "../components/Stats";
import Testimonials from "../components/Testimonials";
import FeaturedCities from "../components/FeaturedCities";
import LatestProperties from "../components/LatestProperties";
import Newsletter from "../components/Newsletter";
import { properties } from "../data/properties";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <SearchBar />
      <Categories />

      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">
            Featured Properties
          </h2>

          <button className="text-blue-600 font-semibold">
            View All
          </button>
        </div>

    <div className="grid md:grid-cols-3 gap-8">
  {properties.slice(0, 3).map((property) => (
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
      <WhyChooseUs />
      <Stats />
      <LatestProperties />
      <Testimonials />
      <FeaturedCities />
      <Newsletter />

      <Footer />
    </>
  );
}