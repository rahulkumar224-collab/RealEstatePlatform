export default function ContactAgent() {
  return (
    <div className="bg-white shadow-xl rounded-xl p-8 mt-14">
      <h2 className="text-3xl font-bold mb-6">
        Contact Agent
      </h2>

      <form className="space-y-5">
        <input
          type="text"
          placeholder="Your Name"
          className="w-full border rounded-lg p-3"
        />

        <input
          type="email"
          placeholder="Your Email"
          className="w-full border rounded-lg p-3"
        />

        <input
          type="tel"
          placeholder="Phone Number"
          className="w-full border rounded-lg p-3"
        />

        <textarea
          placeholder="Write your message..."
          rows={5}
          className="w-full border rounded-lg p-3"
        ></textarea>

        <button
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
        >
          Send Inquiry
        </button>
      </form>
    </div>
  );
}