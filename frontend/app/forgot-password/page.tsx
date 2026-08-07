import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-4">
          Forgot Password
        </h1>

        <p className="text-center text-gray-500 mb-8">
          Password recovery is not currently available. Please return to login to access your account.
        </p>

        <div className="text-center">
          <Link
            href="/login"
            className="inline-block rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
