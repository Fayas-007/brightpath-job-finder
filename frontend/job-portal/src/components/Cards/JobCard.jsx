
import { useState } from "react";
import {
  ArrowUpRight,
  Bookmark,
  Building,
  Building2,
  Calendar,
  MapPin,
  Wallet,
} from "lucide-react";
import { formatDate } from "../../utils/dateUtils";
import { useAuth } from "../../context/AuthContext";
import StatusBadge from "../StatusBadge";
import { getAssetUrl } from "../../utils/apiPaths";

const DISPLAY_FONT = {
  fontFamily: "'Outfit', 'Inter', system-ui, sans-serif",
};

const typeStyles = {
  "Full-Time": "bg-[#ffd23f] text-[#0a1f6b]",
  "Part-Time": "bg-[#dbe6ff] text-[#0a1f6b]",
  Contract: "bg-[#c5d7ff] text-[#0a1f6b]",
  Internship: "bg-white text-[#0a1f6b] ring-1 ring-[#0a1f6b]/30",
  Remote: "bg-[#1646e0] text-white",
};

const salaryFormatter = new Intl.NumberFormat("en-LK");

const formatSalary = (minValue, maxValue) => {
  const min = Number(minValue);
  const max = Number(maxValue);

  const hasMin = Number.isFinite(min) && min > 0;
  const hasMax = Number.isFinite(max) && max > 0;

  if (hasMin && hasMax)
    return `LKR ${salaryFormatter.format(min)} – ${salaryFormatter.format(max)}`;
  if (hasMin) return `From LKR ${salaryFormatter.format(min)}`;
  if (hasMax) return `Up to LKR ${salaryFormatter.format(max)}`;

  return "";
};

const chip =
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold";

const CompanyPlaceholder = () => (
  <div
    className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl border border-[#0a1f6b]/15 bg-[#eef3ff]"
    aria-label="Company logo unavailable"
  >
    <Building2 className="h-7 w-7 text-[#1646e0]" />
  </div>
);

const CompanyLogo = ({ imageUrl, imageFailed, companyName, onError }) => {
  if (!imageUrl || imageFailed) {
    return <CompanyPlaceholder />;
  }

  return (
    <img
      src={imageUrl}
      alt={`${companyName || "Company"} logo`}
      width={56}
      height={56}
      loading="lazy"
      decoding="async"
      onError={onError}
      className="h-14 w-14 flex-shrink-0 rounded-xl border border-[#0a1f6b]/15 object-cover"
    />
  );
};

const JobHeader = ({
  job,
  imageUrl,
  imageFailed,
  onImageError,
  user,
  isSaved,
  onToggleSave,
}) => (
  <div className="flex items-start justify-between gap-3">
    <div className="flex min-w-0 items-start gap-3.5">
      <CompanyLogo
        imageUrl={imageUrl}
        imageFailed={imageFailed}
        companyName={job?.company?.companyName}
        onError={onImageError}
      />

      <div className="min-w-0 flex-1">
        <h3
          style={DISPLAY_FONT}
          className="line-clamp-2 text-xl font-extrabold leading-tight tracking-[-0.01em] text-[#0a1f6b] transition-colors group-hover:text-[#1646e0]"
        >
          {job?.title}
        </h3>

        <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-slate-500">
          <Building className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="truncate">
            {job?.company?.companyName || "Company"}
          </span>
        </p>
      </div>
    </div>

    {user && (
      <button
        type="button"
        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-[#0a1f6b]/60 transition-colors hover:bg-[#ffd23f] ${
          isSaved ? "bg-[#ffd23f]" : "bg-white"
        }`}
        onClick={(e) => {
          e.stopPropagation();
          onToggleSave?.();
        }}
        aria-label={isSaved ? "Unsave job" : "Save job"}
        aria-pressed={isSaved}
      >
        <Bookmark
          className={`h-5 w-5 text-[#0a1f6b] ${
            isSaved ? "fill-[#0a1f6b]" : ""
          }`}
        />
      </button>
    )}
  </div>
);

const JobMetadata = ({ job }) => (
  <div className="mt-5 flex flex-wrap items-center gap-2">
    <span className={`${chip} bg-[#eef3ff] text-[#0a1f6b]`}>
      <MapPin className="h-3.5 w-3.5 text-[#1646e0]" />
      {job?.location || "Remote"}
    </span>

    <span
      className={`${chip} ${
        typeStyles[job?.type] || "bg-slate-100 text-slate-700"
      }`}
    >
      {job?.type || "N/A"}
    </span>

    <span className={`${chip} bg-white text-slate-600 ring-1 ring-[#0a1f6b]/20`}>
      {job?.category || "General"}
    </span>

    {job?.isClosed && (
      <span className={`${chip} bg-slate-200 text-slate-700`}>
        Closed
      </span>
    )}
  </div>
);

const JobSalary = ({ salary }) => {
  if (!salary) return null;

  return (
    <p className="mt-4 flex items-center gap-2 text-sm font-bold text-[#0a1f6b]">
      <Wallet className="h-4 w-4 text-[#1646e0]" />
      {salary}
    </p>
  );
};

const JobFooter = ({ job, saved, hideApply, onClick }) => (
  <div className="mt-auto pt-5">
    <div className="flex items-center justify-between gap-3 border-t border-dashed border-[#0a1f6b]/15 pt-4">
      <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
        <Calendar className="h-3.5 w-3.5" />
        {formatDate(job?.createdAt)}
      </span>

      <div className="flex items-center gap-2">
        {job?.applicationStatus && (
          <StatusBadge status={job.applicationStatus} />
        )}

        {!saved && !hideApply && !job?.applicationStatus && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClick?.();
            }}
            className="inline-flex items-center gap-1 rounded-xl border border-[#0a1f6b] bg-[#ffd23f] px-3.5 py-1.5 text-sm font-bold text-[#0a1f6b] transition-colors hover:bg-[#f5c400]"
          >
            View
            <ArrowUpRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  </div>
);

const JobCard = ({ job, onClick, onToggleSave, saved, hideApply }) => {
  const { user } = useAuth();
  const [imageFailed, setImageFailed] = useState(false);

  const companyImageUrl = job?.company?.avatar
    ? getAssetUrl(job.company.avatar)
    : "";

  const isSaved = Boolean(job?.isSaved || saved);

  const salary = formatSalary(job?.salaryMin, job?.salaryMax);

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" && e.target === e.currentTarget) {
          onClick?.();
        }
      }}
    className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-[#0a1f6b]/15 bg-white p-5 shadow-[0_3px_0_0_rgba(10,31,107,0.55)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#0a1f6b]/30 hover:shadow-[0_5px_0_0_rgba(10,31,107,0.65)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1646e0]"
    >
      <JobHeader
        job={job}
        imageUrl={companyImageUrl}
        imageFailed={imageFailed}
        onImageError={() => setImageFailed(true)}
        user={user}
        isSaved={isSaved}
        onToggleSave={onToggleSave}
      />

      <JobMetadata job={job} />

      <JobSalary salary={salary} />

      <JobFooter
        job={job}
        saved={saved}
        hideApply={hideApply}
        onClick={onClick}
      />
    </div>
  );
};

export default JobCard;
