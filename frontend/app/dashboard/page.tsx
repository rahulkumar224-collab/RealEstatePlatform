"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ApiError, getInquiries, getPropertyVisits } from "../../lib/api";

export default function DashboardPage() {
  const [inquiryCount, setInquiryCount] = useState<number | null>(null);
  const [visitCount, setVisitCount] = useState<number | null>(null);
  const [inquiryError, setInquiryError] = useState("");
  const [visitError, setVisitError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [inquiriesResult, visitsResult] = await Promise.allSettled([
          getInquiries(),
          getPropertyVisits(),
        ]);

        if (inquiriesResult.status === "fulfilled") {
          setInquiryCount(inquiriesResult.value.length);
        } else if (!(inquiriesResult.reason instanceof ApiError && inquiriesResult.reason.status === 401)) {
          setInquiryError(
            inquiriesResult.reason instanceof ApiError
              ? inquiriesResult.reason.message
              : "Inquiries could not be loaded.",
          );
        }

        if (visitsResult.status === "fulfilled") {
          setVisitCount(visitsResult.value.length);
        } else if (!(visitsResult.reason instanceof ApiError && visitsResult.reason.status === 401)) {
          setVisitError(
            visitsResult.reason instanceof ApiError
              ? visitsResult.reason.message
              : "Property visits could not be loaded.",
          );
        }
      } finally {
        setIsLoading(false);
      }
    };

    void loadDashboard();
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Management Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Review and update customer inquiries and property visit requests.
        </p>
      </div>

      {inquiryError && (
        <p role="alert" className="mb-6 rounded-xl bg-red-50 p-4 text-red-700">
          Inquiries: {inquiryError}
        </p>
      )}
      {visitError && (
        <p role="alert" className="mb-6 rounded-xl bg-red-50 p-4 text-red-700">
          Property visits: {visitError}
        </p>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Link
          href="/dashboard/inquiries"
          className="rounded-xl bg-blue-600 p-6 text-white shadow-lg transition hover:bg-blue-700"
        >
          <p className="text-sm font-medium text-blue-100">Inquiries</p>
          <p className="mt-2 text-4xl font-bold">
            {isLoading ? "Loading..." : inquiryError ? "Unavailable" : inquiryCount}
          </p>
          <p className="mt-4 font-semibold">Manage inquiries →</p>
        </Link>

        <Link
          href="/dashboard/property-visits"
          className="rounded-xl bg-indigo-600 p-6 text-white shadow-lg transition hover:bg-indigo-700"
        >
          <p className="text-sm font-medium text-indigo-100">Property Visits</p>
          <p className="mt-2 text-4xl font-bold">
            {isLoading ? "Loading..." : visitError ? "Unavailable" : visitCount}
          </p>
          <p className="mt-4 font-semibold">Manage property visits →</p>
        </Link>
      </div>

      {!isLoading && !inquiryError && !visitError && inquiryCount === 0 && visitCount === 0 && (
        <div className="mt-8 rounded-xl bg-white p-6 text-gray-600 shadow-lg">
          No inquiries or property visits have been submitted yet.
        </div>
      )}
    </div>
  );
}
