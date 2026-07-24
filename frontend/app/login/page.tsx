export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8">
          Login
        </h1>

        <form className="space-y-5">
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

          <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition">
            Login
          </button>

          <p className="text-center text-sm text-gray-500">
            Forgot Password?
          </p>

          <p className="text-center text-sm">
            Don't have an account?
            <span className="text-blue-600 cursor-pointer">
              {" "}
              Register
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}