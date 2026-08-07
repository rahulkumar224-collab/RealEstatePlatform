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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

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
