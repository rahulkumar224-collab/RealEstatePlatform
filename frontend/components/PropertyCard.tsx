type PropertyCardProps = {
  title: string;
  location: string;
  price: string;
  image: string;
};

export default function PropertyCard({
  title,
  location,
  price,
  image,
}: PropertyCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition">
      <img
        src={image}
        alt={title}
        className="w-full h-56 object-cover"
      />

      <div className="p-4">
        <h3 className="text-xl font-bold">{title}</h3>

        <p className="text-gray-500 mt-1">
          {location}
        </p>

        <p className="text-blue-600 text-xl font-bold mt-3">
          {price}
        </p>

        <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
          View Details
        </button>
      </div>
    </div>
  );
}