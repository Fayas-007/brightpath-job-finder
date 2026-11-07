import {
  ArrowLeft,
  Briefcase,
  Building2,
  Grid,
  List,
  MapPin,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "../../components/layout/Navbar";
import Footer from "../LandingPage/components/Footer";
import axiosInstance from "../../utils/axiosInstance";
import { getAssetUrl } from "../../utils/apiPaths";
import { formatDate } from "../../utils/dateUtils";

const DISPLAY_FONT = { fontFamily: "'Outfit', 'Inter', system-ui, sans-serif" };

const PAGE_BG = "bg-[#f3f5fa]";

const statusStyles = {
  Applied: "bg-[#dbe6ff] text-[#0a1f6b]",
  "In Review": "bg-[#ffd23f]/40 text-[#0a1f6b]",
  Rejected: "bg-red-50 text-red-700",
  Accepted: "bg-green-50 text-green-700",
};

const CompanyLogo = ({ src, name }) => {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl border border-[#0a1f6b]/15 bg-[#eef3ff]"
        aria-label="Company logo unavailable"
      >
        <Building2 className="h-6 w-6 text-[#1646e0]" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      loading="lazy"
      onError={() => setFailed(true)}
      className="h-14 w-14 flex-shrink-0 rounded-xl border border-[#0a1f6b]/15 object-cover"
    />
  );
};

const AppliedJobsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [currentPage, setCurrentPage] = useState(1);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    limit: 10,
    totalPages: 0,
    totalApplications: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  // Fetch the logged-in user's applications for the selected page
  const fetchApplications = async (page) => {
    try {
      setLoading(true);

      const res = await axiosInstance.get("/api/applications/my", {
        params: {
          page,
          limit: 10,
        },
      });

      setApplications(res.data.applications || []);

      if (res.data.pagination) {
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error("Failed to fetch applications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchApplications(currentPage);
    }
  }, [user, currentPage]);

  const isInitialLoad = loading && applications.length === 0;
  const total = pagination.totalApplications || applications.length;
  const isGrid = viewMode === "grid";

  return (
    <div className={`page-with-footer ${PAGE_BG}`}>
      <Navbar />

      <div className="page-footer-main mx-auto w-full max-w-screen-2xl px-4 pb-14 pt-24 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b-2 border-[#0a1f6b] pb-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              aria-label="Go back"
              className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-[#0a1f6b] bg-white text-[#0a1f6b] transition-colors hover:bg-[#ffd23f]"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <div>
              <h1
                style={DISPLAY_FONT}
                className="text-3xl font-extrabold tracking-[-0.01em] text-[#0a1f6b] sm:text-4xl"
              >
                Applied jobs
              </h1>
              {!isInitialLoad && (
                <p className="mt-0.5 text-sm text-slate-500">
                  {total} {total === 1 ? "application" : "applications"}
                </p>
              )}
            </div>
          </div>

          <div className="flex rounded-xl border-2 border-[#0a1f6b] bg-white p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              aria-label="Grid view"
              aria-pressed={isGrid}
              className={`rounded-lg p-2 transition-colors ${
                isGrid
                  ? "bg-[#0a1f6b] text-white"
                  : "text-slate-500 hover:bg-[#eef3ff]"
              }`}
            >
              <Grid className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => setViewMode("list")}
              aria-label="List view"
              aria-pressed={!isGrid}
              className={`rounded-lg p-2 transition-colors ${
                !isGrid
                  ? "bg-[#0a1f6b] text-white"
                  : "text-slate-500 hover:bg-[#eef3ff]"
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {loading && !isInitialLoad && (
          <div className="mb-4 h-1 w-full overflow-hidden rounded-full bg-[#dbe6ff]">
            <div className="h-full w-1/3 animate-pulse rounded-full bg-[#1646e0]" />
          </div>
        )}

        {isInitialLoad ? (
          <div className="rounded-2xl border-2 border-[#0a1f6b]/15 bg-white px-6 py-16 text-center text-sm font-medium text-slate-500">
            Loading applied jobs...
          </div>
        ) : applications.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-[#0a1f6b]/25 bg-white px-6 py-16 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#dbe6ff]">
              <Briefcase className="h-6 w-6 text-[#1646e0]" />
            </div>

            <h2
              style={DISPLAY_FONT}
              className="text-2xl font-extrabold text-[#0a1f6b]"
            >
              No applications yet
            </h2>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-600">
              Jobs you apply to will show up here, with their status.
            </p>

            <button
              type="button"
              onClick={() => navigate("/find-jobs")}
              className="mt-6 rounded-xl border-2 border-[#0a1f6b] bg-[#ffd23f] px-6 py-2.5 text-sm font-bold text-[#0a1f6b] transition-colors hover:bg-[#f5c400]"
            >
              Browse jobs
            </button>
          </div>
        ) : (
          <>
            {/* Same grid as Saved jobs, so cards are the same width */}
            <div
              className={
                isGrid
                  ? "grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3"
                  : "flex flex-col gap-4"
              }
            >
              {applications.map((app) => {
                const job = app.job;
                const companyName = job?.company?.companyName || "Company unavailable";
                const companyImageUrl = job?.company?.avatar
                  ? getAssetUrl(job.company.avatar)
                  : "";
                const openJob = job?._id ? () => navigate(`/job/${job._id}`) : undefined;

                return (
                  <div
                    key={app._id}
                    role={openJob ? "link" : undefined}
                    tabIndex={openJob ? 0 : undefined}
                    onClick={openJob}
                    onKeyDown={(e) => {
                      if (openJob && e.key === "Enter" && e.target === e.currentTarget) {
                        openJob();
                      }
                    }}
                    className={`flex flex-col gap-4 rounded-2xl border-2 border-[#0a1f6b]/15 bg-white p-5 transition-colors hover:border-[#0a1f6b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1646e0] ${
                      isGrid ? "" : "sm:flex-row sm:items-center sm:justify-between"
                    } ${openJob ? "cursor-pointer" : ""}`}
                  >
                    <div className="flex min-w-0 flex-1 items-start gap-4">
                      <CompanyLogo src={companyImageUrl} name={companyName} />

                      <div className="min-w-0">
                        <h2
                          style={DISPLAY_FONT}
                          className="break-words text-lg font-extrabold leading-tight text-[#0a1f6b]"
                        >
                          {job?.title || "Job no longer available"}
                        </h2>

                        <p className="mt-0.5 break-words text-sm font-medium text-slate-600">
                          {companyName}
                        </p>

                        <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5" />
                            {job?.location || "Location not specified"}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <Briefcase className="h-3.5 w-3.5" />
                            {job?.type || "Full-Time"}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div
                      className={
                        isGrid
                          ? "flex flex-row flex-wrap items-center gap-3 border-t border-[#0a1f6b]/10 pt-3"
                          : "flex flex-row items-center gap-3 sm:flex-col sm:items-end sm:gap-1.5"
                      }
                    >
                      {app.status && (
                        <span
                          className={`rounded-full px-3.5 py-1 text-sm font-semibold ${
                            statusStyles[app.status] || "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {app.status}
                        </span>
                      )}

                      {app.createdAt && (
                        <span className="text-xs font-medium text-slate-500">
                          Applied {formatDate(app.createdAt)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination controls */}
            {pagination.totalPages > 1 && (
              <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-[#0a1f6b]/15 pt-5 sm:flex-row">
                <p className="text-sm text-slate-600">
                  Page{" "}
                  <span className="font-bold text-[#0a1f6b]">
                    {pagination.currentPage}
                  </span>{" "}
                  of {pagination.totalPages}
                  {" · "}
                  {pagination.totalApplications} applications
                </p>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((page) => page - 1)}
                    disabled={!pagination.hasPreviousPage || loading}
                    className="rounded-xl border-2 border-[#0a1f6b] bg-white px-5 py-2 text-sm font-semibold text-[#0a1f6b] transition-colors hover:bg-[#eef3ff] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Previous
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurrentPage((page) => page + 1)}
                    disabled={!pagination.hasNextPage || loading}
                    className="rounded-xl border-2 border-[#1646e0] bg-[#1646e0] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0f36b8] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default AppliedJobsPage;