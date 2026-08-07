"use client";

import Link from "next/link";
import { use, useCallback, useEffect, useRef, useState } from "react";
import PropertyCard from "../../../components/PropertyCard";
import {
  ApiError,
  getProperties,
  getProperty,
  Property,
  submitPropertyInquiry,
  submitPropertyVisit,
} from "../../../lib/api";

type LoadState = "loading" | "ready" | "not-found" | "load-error";

type FormMessage = {
  type: "success" | "error";
  text: string;
} | null;

export default function PropertyDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const propertyId = Number(id);
  const invalidId = !Number.isInteger(propertyId) || propertyId < 1;

  const [property, setProperty] = useState<Property | null>(null);
  const [relatedProperties, setRelatedProperties] = useState<Property[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [loadError, setLoadError] = useState("");

  const [favorite, setFavorite] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const [visitDate, setVisitDate] = useState("");
  const [visitTime, setVisitTime] = useState("");
  const inquiryLock = useRef(false);
  const visitLock = useRef(false);
  const [isSubmittingInquiry, setIsSubmittingInquiry] = useState(false);
  const [isSubmittingVisit, setIsSubmittingVisit] = useState(false);
  const [inquiryResult, setInquiryResult] = useState<FormMessage>(null);
  const [visitResult, setVisitResult] = useState<FormMessage>(null);

  const loadProperty = useCallback(async () => {
    if (invalidId) return;

    setLoadState("loading");
    setLoadError("");

    try {
      const data = await getProperty(propertyId);
      setProperty(data);
      setSelectedImage(data.primary_image ?? data.image ?? "");
      setMessage(`Hi, I'm interested in ${data.title}. Please contact me.`);
      setLoadState("ready");
    } catch (caughtError) {
      setProperty(null);

      if (caughtError instanceof ApiError && caughtError.status === 404) {
        setLoadState("not-found");
      } else {
        setLoadError(
          caughtError instanceof ApiError
            ? caughtError.message
            : "Property could not be loaded.",
        );
        setLoadState("load-error");
      }
    }
  }, [invalidId, propertyId]);

  useEffect(() => {
    if (invalidId) return;

    const loadTimer = window.setTimeout(() => {
      void loadProperty();
      void getProperties()
        .then((all) => {
          setRelatedProperties(
            all.filter((item) => item.id !== propertyId).slice(0, 3),
          );
        })
        .catch(() => setRelatedProperties([]));
    }, 0);

    return () => window.clearTimeout(loadTimer);
  }, [invalidId, loadProperty, propertyId]);

  const handleInquiry = async () => {
    if (inquiryLock.current) return;

    if (!name || !email || !phone || !message) {
      setInquiryResult({ type: "error", text: "Please fill all inquiry fields." });
      return;
    }

    inquiryLock.current = true;
    setIsSubmittingInquiry(true);
    setInquiryResult(null);

    try {
      const successMessage = await submitPropertyInquiry(propertyId, {
        name,
        email,
        phone,
        message,
      });

      setName("");
      setEmail("");
      setPhone("");
      setMessage(`Hi, I'm interested in ${property?.title}. Please contact me.`);
      setInquiryResult({ type: "success", text: successMessage });
    } catch (caughtError) {
      setInquiryResult({
        type: "error",
        text: caughtError instanceof ApiError
          ? caughtError.message
          : "Something went wrong while submitting inquiry.",
      });
    } finally {
      inquiryLock.current = false;
      setIsSubmittingInquiry(false);
    }
  };

  const handleVisitBooking = async () => {
    if (visitLock.current) return;

    if (
      !name ||
      !email ||
      !phone ||
      !visitDate ||
      !visitTime
    ) {
      setVisitResult({
        type: "error",
        text: "Please enter your name, email, phone, visit date and visit time.",
      });
      return;
    }

    visitLock.current = true;
    setIsSubmittingVisit(true);
    setVisitResult(null);

    try {
      const successMessage = await submitPropertyVisit(propertyId, {
        name,
        email,
        phone,
        visit_date: visitDate,
        visit_time: visitTime,
        notes: message || null,
      });

      setVisitDate("");
      setVisitTime("");
      setVisitResult({ type: "success", text: successMessage });
    } catch (caughtError) {
      setVisitResult({
        type: "error",
        text: caughtError instanceof ApiError
          ? caughtError.message
          : "Something went wrong while booking the visit.",
      });
    } finally {
      visitLock.current = false;
      setIsSubmittingVisit(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert("Property link copied!");
    } catch {
      alert("Property link could not be copied.");
    }
  };

  if (invalidId || loadState === "not-found") {
    return (
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h1 className="text-4xl font-bold">Property not found</h1>
        <p className="mt-3 text-gray-600">The requested property may have been removed.</p>
        <Link href="/" className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white">Back to Home</Link>
      </div>
    );
  }

  if (loadState === "loading") {
    return <div className="py-20 text-center text-xl text-gray-600">Loading property...</div>;
  }

  if (loadState === "load-error" || !property) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h1 className="text-4xl font-bold">Property could not be loaded.</h1>
        <p role="alert" className="mt-3 text-gray-600">{loadError || "Please try again."}</p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <button type="button" onClick={() => void loadProperty()} className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white">Retry</button>
          <Link href="/" className="rounded-lg border border-blue-600 px-5 py-3 font-semibold text-blue-700">Back to Home</Link>
        </div>
      </div>
    );
  }

  const galleryImages =
    property.images && property.images.length > 0
      ? property.images
      : [];

  const currentImageIndex = galleryImages.findIndex(
    (image) => image.image_url === selectedImage,
  );

  const showPreviousImage = () => {
    if (galleryImages.length === 0) {
      return;
    }

    const previousIndex =
      currentImageIndex <= 0
        ? galleryImages.length - 1
        : currentImageIndex - 1;

    setSelectedImage(galleryImages[previousIndex].image_url);
  };

  const showNextImage = () => {
    if (galleryImages.length === 0) {
      return;
    }

    const nextIndex =
      currentImageIndex === -1 ||
      currentImageIndex >= galleryImages.length - 1
        ? 0
        : currentImageIndex + 1;

    setSelectedImage(galleryImages[nextIndex].image_url);
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <section>
        <button
          type="button"
          onClick={() => setIsGalleryOpen(true)}
          className="relative block w-full overflow-hidden rounded-2xl"
        >
          <img
            src={selectedImage || property.primary_image || property.image || ""}
            alt={property.title}
            className="h-[500px] w-full object-cover shadow-lg transition duration-300 hover:scale-[1.01]"
          />

          <span className="absolute bottom-4 right-4 rounded-lg bg-black/70 px-4 py-2 text-sm font-semibold text-white">
            🔍 View Fullscreen
          </span>
        </button>

        <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
          {galleryImages.length > 0 ? (
            galleryImages.map((image) => (
              <button
                key={image.id}
                type="button"
                onClick={() => setSelectedImage(image.image_url)}
                className="shrink-0"
              >
                <img
                  src={image.image_url}
                  alt={`${property.title} image ${image.id}`}
                  className={`h-28 w-40 cursor-pointer rounded-lg border-4 object-cover transition ${
                    selectedImage === image.image_url
                      ? "border-blue-600"
                      : "border-transparent hover:border-blue-300"
                  }`}
                />
              </button>
            ))
          ) : (
            <button
              type="button"
              onClick={() =>
                setSelectedImage(property.primary_image ?? property.image ?? "")
              }
            >
              <img
                src={property.primary_image ?? property.image ?? ""}
                alt={property.title}
                className="h-28 w-40 cursor-pointer rounded-lg border-4 border-blue-600 object-cover"
              />
            </button>
          )}
        </div>
      </section>

      <div className="mb-6 mt-6 flex justify-end gap-4">
        <button
          type="button"
          onClick={() => setFavorite((current) => !current)}
          className={`rounded-xl px-5 py-3 font-semibold transition ${
            favorite
              ? "bg-red-600 text-white"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          {favorite ? "❤️ Saved" : "🤍 Save Property"}
        </button>

        <button
          type="button"
          onClick={handleShare}
          className="rounded-xl bg-blue-600 px-5 py-3 text-white transition hover:bg-blue-700"
        >
          📤 Share
        </button>
      </div>

      <div className="mt-8 flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div>
          <div className="mb-3 flex gap-3">
            <span className="rounded-full bg-blue-600 px-3 py-1 text-white">
              {property.type.toUpperCase()}
            </span>

            <span className="rounded-full bg-green-600 px-3 py-1 text-white">
              {property.category.toUpperCase()}
            </span>
          </div>

          <h1 className="text-4xl font-bold md:text-5xl">
            {property.title}
          </h1>

          <p className="mt-2 text-gray-500">
            📍 {property.city}, {property.state}
          </p>
        </div>

        <p className="text-4xl font-bold text-blue-600">
          ₹{Number(property.price).toLocaleString("en-IN")}
        </p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        <div className="rounded-xl bg-gray-100 p-6 text-center">
          <h3 className="text-xl font-bold">
            🛏 Bedrooms
          </h3>
          <p>{property.bedrooms ?? "N/A"}</p>
        </div>

        <div className="rounded-xl bg-gray-100 p-6 text-center">
          <h3 className="text-xl font-bold">
            🚿 Bathrooms
          </h3>
          <p>{property.bathrooms ?? "N/A"}</p>
        </div>

        <div className="rounded-xl bg-gray-100 p-6 text-center">
          <h3 className="text-xl font-bold">
            📐 Area
          </h3>
          <p>{property.area} sq ft</p>
        </div>
      </div>

      <div className="mt-12 grid grid-cols-2 gap-6 md:grid-cols-4">
        <div className="rounded-xl bg-blue-50 p-6 text-center">
          <p className="text-gray-500">Property ID</p>
          <h3 className="text-xl font-bold">
            #{property.id}
          </h3>
        </div>

        <div className="rounded-xl bg-green-50 p-6 text-center">
          <p className="text-gray-500">Type</p>
          <h3 className="text-xl font-bold">
            {property.type.toUpperCase()}
          </h3>
        </div>

        <div className="rounded-xl bg-yellow-50 p-6 text-center">
          <p className="text-gray-500">Category</p>
          <h3 className="text-xl font-bold">
            {property.category.toUpperCase()}
          </h3>
        </div>

        <div className="rounded-xl bg-purple-50 p-6 text-center">
          <p className="text-gray-500">City</p>
          <h3 className="text-xl font-bold">
            {property.city}
          </h3>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="mb-4 text-3xl font-bold">
          Description
        </h2>

        <p className="leading-8 text-gray-700">
          {property.description}
        </p>
      </div>

      <div className="mt-12">
        <h2 className="mb-6 text-3xl font-bold">
          Features & Amenities
        </h2>

        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {[
            ["🚗", "Parking"],
            ["🏊", "Swimming Pool"],
            ["🌳", "Garden"],
            ["🛗", "Lift"],
            ["🔒", "24x7 Security"],
            ["🏋️", "Gym"],
            ["⚡", "Power Backup"],
            ["💧", "Water Supply"],
          ].map(([icon, label]) => (
            <div
              key={label}
              className="rounded-xl bg-gray-100 p-5 text-center"
            >
              <span>{icon}</span>
              <p className="mt-2 font-semibold">
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12 rounded-2xl border bg-white p-8 shadow-lg">
        <h2 className="mb-6 text-3xl font-bold">
          👤 Agent Information
        </h2>

        <div className="flex flex-col items-center gap-6 md:flex-row">
          <img
            src="https://i.pravatar.cc/150?img=12"
            alt="Agent"
            className="h-28 w-28 rounded-full border-4 border-blue-500 object-cover"
          />

          <div>
            <h3 className="text-2xl font-bold">
              Rahul Sharma
            </h3>

            <p className="text-gray-500">
              Senior Property Consultant
            </p>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <p>⭐ 4.9 Rating</p>
              <p>🏠 150 Properties</p>
              <p>📞 +91 9876543210</p>
              <p>✉️ rahul@example.com</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 rounded-2xl border bg-yellow-50 p-8">
        <div className="flex flex-col justify-between md:flex-row md:items-center">
          <div>
            <h2 className="text-5xl font-bold text-yellow-600">
              4.8
            </h2>

            <p className="text-xl">⭐⭐⭐⭐⭐</p>

            <p className="text-gray-600">
              Based on 256 Reviews
            </p>
          </div>

          <div className="mt-6 w-full space-y-3 md:mt-0 md:w-1/2">
            {[
              ["5⭐", "w-[80%]"],
              ["4⭐", "w-[15%]"],
              ["3⭐", "w-[3%]"],
              ["2⭐", "w-[1%]"],
              ["1⭐", "w-[1%]"],
            ].map(([rating, width]) => (
              <div
                key={rating}
                className="flex items-center gap-3"
              >
                <span className="w-10">
                  {rating}
                </span>

                <div className="h-3 flex-1 rounded-full bg-gray-200">
                  <div
                    className={`h-3 rounded-full bg-yellow-500 ${width}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="mb-6 text-3xl font-bold">
          ⭐ Customer Reviews
        </h2>

        <div className="space-y-6">
          {[
            {
              name: "Rahul Verma",
              rating: "⭐⭐⭐⭐⭐",
              text: "Excellent property. The buying process was smooth and the agent was very helpful.",
            },
            {
              name: "Priya Singh",
              rating: "⭐⭐⭐⭐☆",
              text: "Great location and reasonable price. Highly recommended.",
            },
            {
              name: "Amit Kumar",
              rating: "⭐⭐⭐⭐⭐",
              text: "Amazing experience. Everything matched the property description.",
            },
          ].map((review) => (
            <div
              key={review.name}
              className="rounded-xl bg-gray-100 p-6"
            >
              <div className="flex justify-between">
                <h3 className="font-bold">
                  {review.name}
                </h3>

                <span>{review.rating}</span>
              </div>

              <p className="mt-2 text-gray-600">
                {review.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12 rounded-2xl border bg-white p-8 shadow-lg">
        <h2 className="mb-6 text-3xl font-bold">
          Contact Agent
        </h2>

        <div className="space-y-4">
          <a
            href="tel:+919876543210"
            className="block w-full rounded-lg bg-blue-600 py-3 text-center text-white"
          >
            📞 Call Agent
          </a>

          <a
            href="https://wa.me/919876543210"
            target="_blank"
            rel="noreferrer"
            className="block w-full rounded-lg bg-green-600 py-3 text-center text-white"
          >
            💬 WhatsApp
          </a>

          <a
            href="mailto:rahul@example.com"
            className="block w-full rounded-lg bg-gray-800 py-3 text-center text-white"
          >
            ✉️ Email Agent
          </a>
        </div>
      </div>

      <div className="mt-12 rounded-2xl border bg-white p-8 shadow-lg">
        <h2 className="mb-6 text-3xl font-bold">
          Send Inquiry
        </h2>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Your Name"
            value={name}
            onChange={(event) =>
              setName(event.target.value)
            }
            className="w-full rounded-xl border p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="email"
            placeholder="Your Email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            className="w-full rounded-xl border p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="tel"
            placeholder="Phone Number"
            value={phone}
            onChange={(event) =>
              setPhone(event.target.value)
            }
            className="w-full rounded-xl border p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <textarea
            placeholder="Your Message"
            rows={5}
            value={message}
            onChange={(event) =>
              setMessage(event.target.value)
            }
            className="w-full rounded-xl border p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="button"
            onClick={handleInquiry}
            disabled={isSubmittingInquiry}
            className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-4 text-lg font-bold text-white transition duration-300 hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmittingInquiry ? "Sending inquiry..." : "Send Inquiry"}
          </button>

          {inquiryResult && (
            <p
              role={inquiryResult.type === "error" ? "alert" : "status"}
              className={`rounded-lg p-4 ${inquiryResult.type === "error" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}
            >
              {inquiryResult.text}
            </p>
          )}
        </div>
      </div>

      <div className="mt-12 rounded-2xl border bg-white p-8 shadow-lg">
        <h2 className="mb-6 text-3xl font-bold">
          📅 Schedule Property Visit
        </h2>

        <p className="mb-5 text-gray-600">
          Visit booking ke liye upar inquiry form me apna
          name, email aur phone fill karein.
        </p>

        <div className="space-y-4">
          <input
            type="date"
            min={today}
            value={visitDate}
            onChange={(event) =>
              setVisitDate(event.target.value)
            }
            className="w-full rounded-xl border p-3"
          />

          <input
            type="time"
            value={visitTime}
            onChange={(event) =>
              setVisitTime(event.target.value)
            }
            className="w-full rounded-xl border p-3"
          />

          <button
            type="button"
            onClick={handleVisitBooking}
            disabled={isSubmittingVisit}
            className="w-full rounded-xl bg-indigo-600 py-4 font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmittingVisit ? "Booking visit..." : "📅 Book Visit"}
          </button>

          {visitResult && (
            <p
              role={visitResult.type === "error" ? "alert" : "status"}
              className={`rounded-lg p-4 ${visitResult.type === "error" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}
            >
              {visitResult.text}
            </p>
          )}
        </div>
      </div>

      <div className="mt-16">
        <h2 className="mb-6 text-3xl font-bold">
          Property Location
        </h2>

        <div className="overflow-hidden rounded-2xl shadow-lg">
          <iframe
            title="Property Location"
            src={`https://www.google.com/maps?q=${encodeURIComponent(
              `${property.city}, ${property.state}`,
            )}&output=embed`}
            width="100%"
            height="450"
            loading="lazy"
            className="border-0"
          />
        </div>
      </div>

      <div className="mt-16">
        <h2 className="mb-8 text-3xl font-bold">
          Related Properties
        </h2>

        <div className="grid gap-8 md:grid-cols-3">
          {relatedProperties.map((item) => (
            <PropertyCard
              key={item.id}
              id={item.id}
              title={item.title}
              location={`${item.city}, ${item.state}`}
              price={`₹${Number(item.price).toLocaleString(
                "en-IN",
              )}`}
              image={item.primary_image ?? item.image ?? ""}
              beds={item.bedrooms ?? 0}
              baths={item.bathrooms ?? 0}
              area={`${item.area} sq ft`}
            />
          ))}
        </div>
      </div>

      {isGalleryOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setIsGalleryOpen(false)}
        >
          <button
            type="button"
            onClick={() => setIsGalleryOpen(false)}
            className="absolute right-6 top-6 z-10 rounded-full bg-white px-4 py-2 text-2xl font-bold text-black"
          >
            ✕
          </button>

          {galleryImages.length > 1 && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                showPreviousImage();
              }}
              className="absolute left-4 z-10 rounded-full bg-white px-4 py-3 text-2xl font-bold text-black md:left-6"
            >
              ←
            </button>
          )}

          <img
            src={selectedImage || property.primary_image || property.image || ""}
            alt={property.title}
            onClick={(event) => event.stopPropagation()}
            className="max-h-[90vh] max-w-[80vw] rounded-xl object-contain"
          />

          {galleryImages.length > 1 && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                showNextImage();
              }}
              className="absolute right-4 z-10 rounded-full bg-white px-4 py-3 text-2xl font-bold text-black md:right-6"
            >
              →
            </button>
          )}

          {galleryImages.length > 0 && (
            <div className="absolute bottom-5 rounded-full bg-black/70 px-4 py-2 text-sm font-semibold text-white">
              {currentImageIndex >= 0
                ? currentImageIndex + 1
                : 1}
              {" / "}
              {galleryImages.length}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
