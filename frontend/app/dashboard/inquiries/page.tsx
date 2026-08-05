"use client";

import { useEffect, useState } from "react";
import {
  ApiError,
  getInquiries,
  Inquiry,
  InquiryStatus,
  updateInquiryStatus,
} from "../../../lib/api";
import StatusBadge from "../../../components/dashboard/StatusBadge";

const statusOptions: InquiryStatus[] = ["new", "contacted", "closed"];

const formatDate = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.valueOf())) {
    return "Unknown date";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<Record<number, InquiryStatus>>({});
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadInquiries = async () => {
      try {
        const records = await getInquiries();
        setInquiries(records);
        setSelectedStatuses(
          Object.fromEntries(records.map((record) => [record.id, record.status])),
        );
      } catch (caughtError) {
        if (caughtError instanceof ApiError && caughtError.status === 401) {
          return;
        }

        setError(
          caughtError instanceof ApiError
            ? caughtError.message
            : "Inquiries could not be loaded.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadInquiries();
  }, []);

  const handleUpdate = async (inquiry: Inquiry) => {
    const status = selectedStatuses[inquiry.id] ?? inquiry.status;
    setError("");
    setSuccess("");
    setUpdatingId(inquiry.id);

    try {
      const updatedInquiry = await updateInquiryStatus(inquiry.id, status);
      setInquiries((current) =>
        current.map((record) =>
          record.id === updatedInquiry.id
            ? {
                ...record,
                ...updatedInquiry,
                property: updatedInquiry.property ?? record.property,
              }
            : record,
        ),
      );
      setSelectedStatuses((current) => ({
        ...current,
        [updatedInquiry.id]: updatedInquiry.status,
      }));
      setSuccess(`Inquiry #${updatedInquiry.id} status updated.`);
    } catch (caughtError) {
      if (!(caughtError instanceof ApiError && caughtError.status === 401)) {
        setError(
          caughtError instanceof ApiError
            ? caughtError.message
            : "Inquiry status could not be updated.",
        );
      }
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Inquiries</h1>
        <p className="mt-2 text-gray-600">Review customer messages and keep their status current.</p>
      </div>

      {error && <p role="alert" className="mb-6 rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}
      {success && <p role="status" className="mb-6 rounded-xl bg-green-50 p-4 text-green-700">{success}</p>}

      {isLoading ? (
        <div className="rounded-xl bg-white p-6 text-gray-600 shadow-lg">Loading inquiries...</div>
      ) : inquiries.length === 0 ? (
        <div className="rounded-xl bg-white p-6 text-gray-600 shadow-lg">No inquiries found.</div>
      ) : (
        <div className="grid gap-6">
          {inquiries.map((inquiry) => (
            <article key={inquiry.id} className="rounded-xl bg-white p-6 shadow-lg">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-bold">Inquiry #{inquiry.id}</h2>
                    <StatusBadge status={inquiry.status} />
                  </div>
                  <p className="mt-2 font-semibold text-gray-800">{inquiry.name}</p>
                  <p className="text-gray-600">{inquiry.email} · {inquiry.phone}</p>
                  <p className="mt-2 text-sm text-gray-500">Created {formatDate(inquiry.created_at)}</p>
                </div>
                <p className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-800">
                  {inquiry.property?.title ?? "Property unavailable"}
                </p>
              </div>

              <div className="mt-5 rounded-lg bg-gray-50 p-4 text-gray-700">
                <p className="text-sm font-semibold text-gray-500">Message</p>
                <p className="mt-1 whitespace-pre-wrap">{inquiry.message}</p>
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
                <label className="block flex-1">
                  <span className="mb-2 block text-sm font-semibold text-gray-700">Status</span>
                  <select
                    value={selectedStatuses[inquiry.id] ?? inquiry.status}
                    onChange={(event) =>
                      setSelectedStatuses((current) => ({
                        ...current,
                        [inquiry.id]: event.target.value as InquiryStatus,
                      }))
                    }
                    disabled={updatingId === inquiry.id}
                    className="w-full rounded-lg border p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  >
                    {statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
                  </select>
                </label>
                <button
                  type="button"
                  onClick={() => void handleUpdate(inquiry)}
                  disabled={updatingId === inquiry.id}
                  className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                >
                  {updatingId === inquiry.id ? "Updating..." : "Update status"}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
