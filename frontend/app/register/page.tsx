import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8">
          Create Account
        </h1>

        <form className="space-y-5">
          <input
            type="text"
            placeholder="Full Name"
            className="w-full border rounded-lg p-3"
          />

          <input
            type="email"
            placeholder="Email Address"
            className="w-full border rounded-lg p-3"
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full border rounded-lg p-3"
          />

          <input
            type="password"
            placeholder="Confirm Password"
            className="w-full border rounded-lg p-3"
          />

          <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition">
            Create Account
          </button>

          <div className="mt-6 text-center">
            <p>
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-blue-600 font-semibold"
              >
                Login
              </Link>
            </p>
          </div>

        </form>
      </div>
    </div>
  );
}