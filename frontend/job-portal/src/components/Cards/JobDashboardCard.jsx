import { ArrowUpRight } from "lucide-react";
import { formatDate } from "../../utils/dateUtils";

const JobDashboardCard = ({ job }) => {
  const isActive = !job.isClosed;

  return (
    <div className="group flex items-center gap-4 px-6 py-4 transition-colors hover:bg-[#f5f8ff]">
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-[15px] font-bold text-[#0a1f6b] transition-colors group-hover:text-[#1646e0]">
          {job.title}
        </h3>

        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[13px] text-slate-500">
          <span className="truncate">
            {job.location || "Location not specified"}
          </span>
          <span>Posted {formatDate(job.createdAt)}</span>
        </div>
      </div>

      <span
        className={`inline-flex flex-shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
          isActive
            ? "bg-[#e9f7ef] text-[#187447]"
            : "bg-slate-100 text-slate-600"
        }`}
      >
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            isActive ? "bg-[#21965c]" : "bg-slate-400"
          }`}
        />
        {isActive ? "Active" : "Closed"}
      </span>

      <ArrowUpRight className="hidden h-4 w-4 flex-shrink-0 text-slate-300 transition-colors group-hover:text-[#1646e0] sm:block" />
    </div>
  );
};

export default JobDashboardCard;