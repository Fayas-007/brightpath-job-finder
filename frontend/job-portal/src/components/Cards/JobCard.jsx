import { Bookmark, Building, Building2, Calendar, MapPin } from "lucide-react";
import { formatDate } from "../../utils/dateUtils";
import { useAuth } from "../../context/AuthContext";
import StatusBadge from "../StatusBadge";
import { getAssetUrl } from "../../utils/apiPaths";

const typeStyles = {
  "Full-Time": "bg-green-50 text-green-700",
  "Part-Time": "bg-yellow-50 text-yellow-700",
  Contract: "bg-teal-50 text-teal-700",
  Internship: "bg-blue-50 text-blue-700",
  Remote: "bg-cyan-50 text-cyan-700",
};

const JobCard = ({ job, onClick, onToggleSave, saved, hideApply }) => {
  const { user } = useAuth();
  const companyImage = job?.company?.avatar;
  const companyImageUrl = getAssetUrl(companyImage);

  return (
    <div
      className="group relative cursor-pointer overflow-hidden rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
      onClick={onClick}
    >
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-4">
          {companyImage ? (
            <img
              src={companyImageUrl}
              alt={job?.company?.companyName || "Company"}
              className="h-14 w-14 rounded-lg border border-slate-100 object-cover shadow-sm"
            />
          ) : (
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50">
              <Building2 className="h-7 w-7 text-slate-400" />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h3 className="line-clamp-2 text-lg font-black text-slate-950 transition-colors group-hover:text-blue-600">
              {job?.title}
            </h3>
            <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
              <Building className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">{job?.company?.companyName || "Company"}</span>
            </p>
          </div>
        </div>

        {user && (
          <button
            className="flex-shrink-0 rounded-lg p-2 transition-colors hover:bg-slate-100"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave();
            }}
            aria-label="Save job"
          >
            <Bookmark
              className={`h-5 w-5 ${
                job?.isSaved || saved ? "fill-blue-600 text-blue-600" : "text-slate-400"
              }`}
            />
          </button>
        )}
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
          <MapPin className="h-3.5 w-3.5" />
          {job?.location || "Remote"}
        </span>
        <span
          className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
            typeStyles[job?.type] || "bg-slate-100 text-slate-700"
          }`}
        >
          {job?.type || "N/A"}
        </span>
        <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700">
          {job?.category || "General"}
        </span>
      </div>

      <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" />
          {formatDate(job?.createdAt)}
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        {job?.applicationStatus && <StatusBadge status={job.applicationStatus} />}
        {!saved && !hideApply && !job?.applicationStatus && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            View
          </button>
        )}
      </div>
    </div>
  );
};

export default JobCard;
