type PropertyCardProps = {
  title: string;
  location: string;
  price: string;
  image: string;
  beds: number;
baths: number;
area: string;
};

export default function PropertyCard({
  title,
  location,
  price,
  image,
  beds,
baths,
area,
}: PropertyCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:-translate-y-3 hover:shadow-2xl">
      <div className="overflow-hidden">
  <img
    src={image}
    alt={title}
    className="w-full h-56 object-cover transition-transform duration-500 hover:scale-110"
  />
</div>

      <div className="p-4">
        <h3 className="text-xl font-bold">{title}</h3>

        <p className="text-gray-500 mt-1">
          {location}
        </p>

        <p className="text-blue-600 text-xl font-bold mt-3">
          {price}
        </p>
        <div className="flex justify-between text-gray-600 text-sm mt-4">
  <span>🛏 {beds} Beds</span>
  <span>🚿 {baths} Baths</span>
  <span>📐 {area}</span>
</div>

        <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg transition duration-300 hover:bg-blue-700 hover:scale-105">
  View Details
</button>
      </div>
    </div>
  );
}