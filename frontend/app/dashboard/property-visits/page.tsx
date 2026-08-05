"use client";

import { useEffect, useState } from "react";
import {
  ApiError,
  getPropertyVisits,
  PropertyVisit,
  PropertyVisitStatus,
  updatePropertyVisitStatus,
} from "../../../lib/api";
import StatusBadge from "../../../components/dashboard/StatusBadge";

const statusOptions: PropertyVisitStatus[] = [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
];

export default function PropertyVisitsPage() {
  const [visits, setVisits] = useState<PropertyVisit[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<Record<number, PropertyVisitStatus>>({});
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadVisits = async () => {
      try {
        const records = await getPropertyVisits();
        setVisits(records);
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
            : "Property visits could not be loaded.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadVisits();
  }, []);

  const handleUpdate = async (visit: PropertyVisit) => {
    const status = selectedStatuses[visit.id] ?? visit.status;
    setError("");
    setSuccess("");
    setUpdatingId(visit.id);

    try {
      const updatedVisit = await updatePropertyVisitStatus(visit.id, status);
      setVisits((current) =>
        current.map((record) =>
          record.id === updatedVisit.id
            ? {
                ...record,
                ...updatedVisit,
                property: updatedVisit.property ?? record.property,
              }
            : record,
        ),
      );
      setSelectedStatuses((current) => ({
        ...current,
        [updatedVisit.id]: updatedVisit.status,
      }));
      setSuccess(`Property visit #${updatedVisit.id} status updated.`);
    } catch (caughtError) {
      if (!(caughtError instanceof ApiError && caughtError.status === 401)) {
        setError(
          caughtError instanceof ApiError
            ? caughtError.message
            : "Property visit status could not be updated.",
        );
      }
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Property Visits</h1>
        <p className="mt-2 text-gray-600">Review scheduled visits and update their progress.</p>
      </div>

      {error && <p role="alert" className="mb-6 rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}
      {success && <p role="status" className="mb-6 rounded-xl bg-green-50 p-4 text-green-700">{success}</p>}

      {isLoading ? (
        <div className="rounded-xl bg-white p-6 text-gray-600 shadow-lg">Loading property visits...</div>
      ) : visits.length === 0 ? (
        <div className="rounded-xl bg-white p-6 text-gray-600 shadow-lg">No property visits found.</div>
      ) : (
        <div className="grid gap-6">
          {visits.map((visit) => (
            <article key={visit.id} className="rounded-xl bg-white p-6 shadow-lg">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-bold">Visit #{visit.id}</h2>
                    <StatusBadge status={visit.status} />
                  </div>
                  <p className="mt-2 font-semibold text-gray-800">{visit.name}</p>
                  <p className="text-gray-600">{visit.email} · {visit.phone}</p>
                </div>
                <p className="rounded-lg bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-800">
                  {visit.property?.title ?? "Property unavailable"}
                </p>
              </div>

              <dl className="mt-5 grid gap-4 rounded-lg bg-gray-50 p-4 text-gray-700 sm:grid-cols-2">
                <div><dt className="text-sm font-semibold text-gray-500">Visit date</dt><dd className="mt-1">{visit.visit_date}</dd></div>
                <div><dt className="text-sm font-semibold text-gray-500">Visit time</dt><dd className="mt-1">{visit.visit_time}</dd></div>
                <div className="sm:col-span-2"><dt className="text-sm font-semibold text-gray-500">Notes</dt><dd className="mt-1 whitespace-pre-wrap">{visit.notes || "No notes provided."}</dd></div>
              </dl>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
                <label className="block flex-1">
                  <span className="mb-2 block text-sm font-semibold text-gray-700">Status</span>
                  <select
                    value={selectedStatuses[visit.id] ?? visit.status}
                    onChange={(event) =>
                      setSelectedStatuses((current) => ({
                        ...current,
                        [visit.id]: event.target.value as PropertyVisitStatus,
                      }))
                    }
                    disabled={updatingId === visit.id}
                    className="w-full rounded-lg border p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                  >
                    {statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
                  </select>
                </label>
                <button
                  type="button"
                  onClick={() => void handleUpdate(visit)}
                  disabled={updatingId === visit.id}
                  className="rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
                >
                  {updatingId === visit.id ? "Updating..." : "Update status"}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
