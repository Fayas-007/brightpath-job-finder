import { Briefcase } from "lucide-react";
import { formatDate } from "../../utils/dateUtils";

const JobDashboardCard = ({ job }) => {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-100 p-4 transition-colors hover:border-slate-200 hover:bg-slate-50">
      <div className="flex items-center space-x-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
          <Briefcase className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h4 className="text-[15px] font-bold text-slate-950">{job.title}</h4>
          <p className="text-xs text-slate-500">
            {job.location} | {formatDate(job.createdAt)}
          </p>
        </div>
      </div>
      <span
        className={`rounded-lg px-3 py-1 text-xs font-bold ${
          !job.isClosed ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"
        }`}
      >
        {job.isClosed ? "Closed" : "Active"}
      </span>
    </div>
  );
};

export default JobDashboardCard;
