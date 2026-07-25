"use client";

type SearchBarProps = {
  city: string;
  setCity: (value: string) => void;

  type: string;
  setType: (value: string) => void;

  onSearch: () => void;
};

export default function SearchBar({
  city,
  setCity,
  type,
  setType,
  onSearch,
}: SearchBarProps) {
  return (
    <section className="bg-white py-8 shadow-md">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">

          <input
            type="text"
            placeholder="City, Locality or Project"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="border rounded-lg p-3"
          />

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="border rounded-lg p-3"
          >
            <option value="">Buy / Rent</option>
            <option value="buy">Buy</option>
            <option value="rent">Rent</option>
          </select>

          <select className="border rounded-lg p-3">
            <option>Property Type</option>
            <option>Apartment</option>
            <option>Villa</option>
            <option>Plot</option>
            <option>Office</option>
            <option>Shop</option>
          </select>

          <select className="border rounded-lg p-3">
            <option>Budget</option>
            <option>₹10L - ₹25L</option>
            <option>₹25L - ₹50L</option>
            <option>₹50L - ₹1Cr</option>
            <option>₹1Cr+</option>
          </select>

          <button
            onClick={onSearch}
            className="bg-blue-600 text-white rounded-lg p-3 hover:bg-blue-700"
          >
            Search
          </button>

        </div>
      </div>
    </section>
  );
}