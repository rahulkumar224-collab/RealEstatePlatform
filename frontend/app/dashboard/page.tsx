export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="text-4xl font-bold mb-8">
        My Dashboard
      </h1>

      <div className="grid md:grid-cols-4 gap-6">

        <div className="bg-blue-600 text-white p-6 rounded-xl shadow-lg">
          <h2 className="text-3xl font-bold">12</h2>
          <p className="mt-2">My Properties</p>
        </div>

        <div className="bg-green-600 text-white p-6 rounded-xl shadow-lg">
          <h2 className="text-3xl font-bold">45</h2>
          <p className="mt-2">Property Views</p>
        </div>

        <div className="bg-purple-600 text-white p-6 rounded-xl shadow-lg">
          <h2 className="text-3xl font-bold">8</h2>
          <p className="mt-2">Inquiries</p>
        </div>

        <div className="bg-orange-500 text-white p-6 rounded-xl shadow-lg">
          <h2 className="text-3xl font-bold">5</h2>
          <p className="mt-2">Favorites</p>
        </div>

      </div>

      <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-4">
          Welcome Back 👋
        </h2>

        <p className="text-gray-600">
          Manage your properties, view inquiries,
          and update your profile from your dashboard.
        </p>
      </div>
    </div>
  );
}