"use client";

import { useCallback, useEffect, useState } from "react";
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
import Footer from "../components/Footer";
import {
  ApiError,
  getProperties,
  Property,
  PropertyFilters,
} from "../lib/api";

export default function Home() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [city, setCity] = useState("");
  const [type, setType] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProperties = useCallback(async (filters: PropertyFilters = {}) => {
    setIsLoading(true);
    setError("");

    try {
      setProperties(await getProperties(filters));
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Properties could not be loaded.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadTimer = window.setTimeout(() => {
      void loadProperties();
    }, 0);

    return () => window.clearTimeout(loadTimer);
  }, [loadProperties]);

  const handleSearch = () => {
    void loadProperties({ city, type: type === "buy" || type === "rent" ? type : "" });
  };

  return (
    <>
      <Navbar />
      <Hero />
      <SearchBar city={city} setCity={setCity} type={type} setType={setType} onSearch={handleSearch} />
      <Categories />

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-3xl font-bold">Featured Properties</h2>
          <button className="font-semibold text-blue-600">View All</button>
        </div>

        {isLoading ? (
          <div className="rounded-xl bg-gray-50 p-8 text-center text-gray-600">Loading properties...</div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center text-red-800">
            <p role="alert">{error}</p>
            <button type="button" onClick={handleSearch} className="mt-4 rounded-lg bg-red-700 px-5 py-3 font-semibold text-white">Retry</button>
          </div>
        ) : properties.length === 0 ? (
          <div className="rounded-xl bg-gray-50 p-8 text-center text-gray-600">No properties match your search.</div>
        ) : (
          <div className="grid gap-8 md:grid-cols-3">
            {properties.slice(0, 3).map((property) => (
              <PropertyCard
                key={property.id}
                id={property.id}
                title={property.title}
                location={`${property.city}, ${property.state}`}
                price={`₹${Number(property.price).toLocaleString("en-IN")}`}
                image={property.primary_image ?? property.image ?? ""}
                beds={property.bedrooms ?? 0}
                baths={property.bathrooms ?? 0}
                area={`${property.area} sq ft`}
              />
            ))}
          </div>
        )}
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
