import { Clock } from "lucide-react";

const ApplicantDashboardCard = ({ applicant = {}, position = "", time = "" }) => {
  const name = applicant.name || "Unknown Candidate";
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-100 p-4 transition-colors hover:border-slate-200 hover:bg-slate-50">
      <div className="flex items-center space-x-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50">
          <span className="text-sm font-black text-teal-700">{initials}</span>
        </div>
        <div>
          <h4 className="text-[15px] font-bold text-slate-950">{name}</h4>
          <p className="text-sm text-slate-500">{position}</p>
        </div>
      </div>
      <div className="flex items-center text-xs text-slate-500">
        <Clock className="mr-1 h-3 w-3" />
        {time}
      </div>
    </div>
  );
};

export default ApplicantDashboardCard;
