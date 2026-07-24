export default function AddPropertyPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-4xl font-bold mb-8">
        Add New Property
      </h1>

      <form className="space-y-5">
        <input
          type="text"
          placeholder="Property Title"
          className="w-full border rounded-lg p-3"
        />

        <input
          type="text"
          placeholder="Location"
          className="w-full border rounded-lg p-3"
        />

        <input
          type="text"
          placeholder="Price"
          className="w-full border rounded-lg p-3"
        />

        <input
          type="number"
          placeholder="Bedrooms"
          className="w-full border rounded-lg p-3"
        />

        <input
          type="number"
          placeholder="Bathrooms"
          className="w-full border rounded-lg p-3"
        />

        <input
          type="text"
          placeholder="Area (sq ft)"
          className="w-full border rounded-lg p-3"
        />

        <textarea
          placeholder="Property Description"
          rows={5}
          className="w-full border rounded-lg p-3"
        ></textarea>

        <button
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
        >
          Submit Property
        </button>
      </form>
    </div>
  );
}