export default function Navbar() {
  return (
    <nav className="w-full border-b bg-white">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">

        <h1 className="text-3xl font-bold text-blue-600">
          RealEstatePlatform
        </h1>

        <ul className="hidden md:flex gap-8 text-lg">
          <li><a href="#">Buy</a></li>
          <li><a href="#">Sell</a></li>
          <li><a href="#">Rent</a></li>
          <li><a href="#">Commercial</a></li>
          <li><a href="#">Residential</a></li>
        </ul>

        <button className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700">
          Post Property
        </button>

      </div>
    </nav>
  );
}