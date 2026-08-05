import { InquiryStatus, PropertyVisitStatus } from "../../lib/api";

type StatusBadgeProps = {
  status: InquiryStatus | PropertyVisitStatus;
};

const statusStyles: Record<StatusBadgeProps["status"], string> = {
  new: "bg-blue-100 text-blue-800",
  contacted: "bg-amber-100 text-amber-800",
  closed: "bg-gray-200 text-gray-800",
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-indigo-100 text-indigo-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${statusStyles[status]}`}>
      {status}
    </span>
  );
}
