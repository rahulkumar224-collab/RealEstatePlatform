import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import SearchBar from "../components/SearchBar";
import PropertyCard from "../components/PropertyCard";
import Categories from "../components/Categories";
import WhyChooseUs from "../components/WhyChooseUs";
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
          <PropertyCard
            title="Luxury Apartment"
            location="Mumbai"
            price="₹1.25 Cr"
            image="https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800"
            beds={3}
baths={2}
area="1450 sq ft"
          />

          <PropertyCard
            title="Modern Villa"
            location="Delhi"
            price="₹2.40 Cr"
            image="https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800"
            beds={4}
baths={3}
area="2200 sq ft"
          />

          <PropertyCard
            title="Premium Flat"
            location="Bangalore"
            price="₹95 Lakh"
            image="https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800"
            beds={2}
baths={2}
area="1100 sq ft"
          />
        </div>
      </section>
      <WhyChooseUs />

      <Footer />
    </>
  );
}