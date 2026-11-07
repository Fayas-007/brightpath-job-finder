import { ArrowUpRight } from "lucide-react";

const ApplicantDashboardCard = ({
  applicant = {},
  position = "",
  time = "",
}) => {
  const name = applicant.name || "Unknown candidate";

  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <div className="group flex items-center gap-4 px-6 py-4 transition-colors hover:bg-[#f5f8ff]">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#eaf0ff] text-sm font-bold text-[#1646e0]">
        {initials || "?"}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-[15px] font-bold text-[#0a1f6b] transition-colors group-hover:text-[#1646e0]">
          {name}
        </h3>

        <p className="mt-0.5 truncate text-[13px] text-slate-500">
          Applied for{" "}
          <span className="font-semibold text-slate-700">
            {position || "an unspecified position"}
          </span>
        </p>
      </div>

      <span className="flex-shrink-0 text-[13px] text-slate-500">{time}</span>

      <ArrowUpRight className="hidden h-4 w-4 flex-shrink-0 text-slate-300 transition-colors group-hover:text-[#1646e0] sm:block" />
    </div>
  );
};

export default ApplicantDashboardCard;