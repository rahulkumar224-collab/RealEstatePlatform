import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-4">
          Forgot Password
        </h1>

        <p className="text-center text-gray-500 mb-8">
          Enter your email address and we'll send you a password reset link.
        </p>

        <form className="space-y-5">
          <input
            type="email"
            placeholder="Email Address"
            className="w-full border rounded-lg p-3"
          />

          <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition">
            Send Reset Link
          </button>

          <div className="mt-6 text-center">
            <p>
              Remember your password?{" "}
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