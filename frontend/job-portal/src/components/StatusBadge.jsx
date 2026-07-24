import { CheckCircle, XCircle, Clock, UserCheck } from "lucide-react";

const StatusBadge = ({ status }) => {
  // Map statuses to style + optional icon
  const statusConfig = {
    Applied: { bg: "bg-blue-50", text: "text-blue-700", icon: <UserCheck className="w-3 h-3" /> },
    "In Review": { bg: "bg-amber-50", text: "text-amber-700", icon: <Clock className="w-3 h-3" /> },
    Accepted: { bg: "bg-green-50", text: "text-green-700", icon: <CheckCircle className="w-3 h-3" /> },
    Rejected: { bg: "bg-red-50", text: "text-red-700", icon: <XCircle className="w-3 h-3" /> },
  };

  const config = statusConfig[status] || { bg: "bg-gray-50", text: "text-gray-700", icon: null };

  return (
    <span
      className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${config.bg} ${config.text}`}
    >
      {config.icon}
      {status}
    </span>
  );
};

export default StatusBadge;
