
import Link from "next/link";
export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-8 py-4">

        <div>
          <h1 className="text-3xl font-bold text-blue-700">
            RealEstatePlatform
          </h1>
        </div>

        <ul className="hidden lg:flex gap-8 font-medium text-gray-700">
  <li className="cursor-pointer hover:text-blue-600">
    <Link href="/">Buy</Link>
  </li>

  <li className="cursor-pointer hover:text-blue-600">
    <Link href="/">Sell</Link>
  </li>

  <li className="cursor-pointer hover:text-blue-600">
    <Link href="/">Rent</Link>
  </li>

  <li className="cursor-pointer hover:text-blue-600">
    <Link href="/">Commercial</Link>
  </li>

  <li className="cursor-pointer hover:text-blue-600">
    <Link href="/">Residential</Link>
  </li>
</ul>

       <div className="flex gap-3">

  <Link
    href="/login"
    className="border border-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50"
  >
    Login
  </Link>

  <Link
    href="/add-property"
    className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
  >
    Post Property
  </Link>

</div>

      </div>
    </nav>
  );
}