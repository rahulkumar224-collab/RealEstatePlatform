export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-16">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-bold mb-4">
          RealEstatePlatform
        </h2>

        <p className="text-gray-400">
          Buy, Sell & Rent Properties Across India.
        </p>

        <div className="flex gap-6 mt-6">
          <a href="#">About</a>
          <a href="#">Contact</a>
          <a href="#">Privacy Policy</a>
        </div>

        <p className="mt-8 text-gray-500 text-sm">
          © 2026 RealEstatePlatform. All rights reserved.
        </p>
      </div>
    </footer>
  );
}