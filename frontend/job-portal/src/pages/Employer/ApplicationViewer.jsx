import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  CheckCircle2,
  Download,
  Eye,
  FileText,
  Mail,
  MapPin,
  Search,
  UserRound,
  Users,
} from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { getInitials } from "../../utils/helper";
import { formatDate } from "../../utils/dateUtils";
import DashboardLayout from "../../components/layout/DashboardLayout";
import StatusBadge from "../../components/StatusBadge";
import ApplicantProfilePreview from "../../components/Cards/ApplicantProfilePreview";

const statusOptions = ["All", "Applied", "In Review", "Accepted", "Rejected"];

const ApplicationViewer = () => {
  const location = useLocation();
  const { jobId: routeJobId } = useParams();
  const jobId = routeJobId || location.state?.jobId || null;
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        API_PATHS.APPLICATIONS.GET_ALL_APPLICATIONS(jobId)
      );
      setApplications(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Failed to fetch applications:", err);
      toast.error("Failed to fetch applications");
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    if (jobId) fetchApplications();
    else navigate("/manage-jobs");
  }, [fetchApplications, jobId, navigate]);

  const validApplications = useMemo(
    () => applications.filter((app) => app.job?._id && app.applicant?._id),
    [applications]
  );

  const job = validApplications[0]?.job || null;

  const counts = useMemo(() => {
    const summary = {
      total: validApplications.length,
      Applied: 0,
      "In Review": 0,
      Accepted: 0,
      Rejected: 0,
    };

    validApplications.forEach((application) => {
      if (summary[application.status] !== undefined) summary[application.status] += 1;
    });

    return summary;
  }, [validApplications]);

  const filteredApplications = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return validApplications.filter((application) => {
      const applicantName = application.applicant?.name?.toLowerCase() || "";
      const applicantEmail = application.applicant?.email?.toLowerCase() || "";
      const matchesSearch =
        !query || applicantName.includes(query) || applicantEmail.includes(query);
      const matchesStatus = statusFilter === "All" || application.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter, validApplications]);

  const getDisplayResumeName = (application) => {
    if (application.resumeName) return application.resumeName;
    if (!application.resume) return "resume";

    const fileName = decodeURIComponent(application.resume.split("/").pop() || application.resume);
    return fileName.replace(/-\d{13}-\d+(\.[^.]+)$/i, "$1");
  };

  const handleDownloadResume = async (application) => {
    if (!application?.resume) {
      toast.error("Submitted resume unavailable.");
      return;
    }

    try {
      const response = await axiosInstance.get(
        API_PATHS.APPLICATIONS.DOWNLOAD_RESUME(application._id),
        { responseType: "blob" }
      );
      const resumeBlobUrl = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = resumeBlobUrl;
      link.download = getDisplayResumeName(application);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => window.URL.revokeObjectURL(resumeBlobUrl), 1000);
    } catch (err) {
      console.error("Failed to download submitted resume:", err);
      toast.error("The submitted resume file is no longer available.");
    }
  };

  if (loading) {
    return (
      <DashboardLayout activeMenu="manage-jobs">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="employer-card px-6 py-5 text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-b-2 border-teal-700" />
            <p className="mt-4 text-sm font-semibold text-slate-600">
              Loading candidate review...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeMenu="manage-jobs">
      <div className="employer-shell mb-16 space-y-5">
        <section className="employer-panel overflow-hidden">
          <div className="grid gap-5 border-b border-slate-100 bg-gradient-to-br from-white via-teal-50/60 to-blue-50/50 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_auto]">
            <div className="min-w-0">
              <button
                type="button"
                onClick={() => navigate("/manage-jobs")}
                className="employer-secondary-action mb-5 px-3 py-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>

              <p className="employer-kicker">Candidate review</p>
              <h1 className="mt-2 text-3xl font-black leading-tight text-slate-950 sm:text-4xl">
                {job?.title || "Applications"}
              </h1>

              <div className="mt-4 flex flex-wrap gap-2 text-sm font-semibold text-slate-600">
                {job?.location && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-white bg-white/80 px-3 py-2 shadow-sm">
                    <MapPin className="h-4 w-4 text-teal-700" />
                    {job.location}
                  </span>
                )}
                {job?.type && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-white bg-white/80 px-3 py-2 shadow-sm">
                    <Briefcase className="h-4 w-4 text-teal-700" />
                    {job.type}
                  </span>
                )}
                {job?.category && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-white bg-white/80 px-3 py-2 shadow-sm">
                    <FileText className="h-4 w-4 text-teal-700" />
                    {job.category}
                  </span>
                )}
              </div>
            </div>

            <div className="grid min-w-64 grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2">
              <div className="rounded-lg border border-white bg-white/85 p-4 shadow-sm">
                <p className="text-xs font-black uppercase text-slate-400">Total</p>
                <p className="mt-1 text-3xl font-black text-slate-950">{counts.total}</p>
              </div>
              <div className="rounded-lg border border-white bg-white/85 p-4 shadow-sm">
                <p className="text-xs font-black uppercase text-slate-400">In review</p>
                <p className="mt-1 text-3xl font-black text-teal-700">
                  {counts["In Review"]}
                </p>
              </div>
              <div className="rounded-lg border border-white bg-white/85 p-4 shadow-sm">
                <p className="text-xs font-black uppercase text-slate-400">Accepted</p>
                <p className="mt-1 text-3xl font-black text-emerald-700">
                  {counts.Accepted}
                </p>
              </div>
              <div className="rounded-lg border border-white bg-white/85 p-4 shadow-sm">
                <p className="text-xs font-black uppercase text-slate-400">Rejected</p>
                <p className="mt-1 text-3xl font-black text-rose-600">
                  {counts.Rejected}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_13rem] sm:p-5">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search candidate name or email"
                className="field-control pl-10"
              />
            </label>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="field-control"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status === "All" ? "All statuses" : status}
                </option>
              ))}
            </select>
          </div>
        </section>

        {validApplications.length === 0 ? (
          <section className="employer-panel flex min-h-80 flex-col items-center justify-center p-8 text-center">
            <div className="rounded-lg bg-teal-50 p-4 text-teal-700">
              <Users className="h-8 w-8" />
            </div>
            <h3 className="mt-4 text-lg font-black text-slate-950">
              No applications yet
            </h3>
            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
              Candidate submissions for this role will appear here.
            </p>
          </section>
        ) : filteredApplications.length === 0 ? (
          <section className="employer-panel flex min-h-64 flex-col items-center justify-center p-8 text-center">
            <div className="rounded-lg bg-slate-50 p-4 text-slate-500">
              <Search className="h-8 w-8" />
            </div>
            <h3 className="mt-4 text-lg font-black text-slate-950">
              No matching candidates
            </h3>
            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
              Try a different search or status filter.
            </p>
          </section>
        ) : (
          <section className="employer-panel overflow-hidden">
            <div className="border-b border-slate-100 px-5 py-4">
              <p className="text-sm font-black text-slate-950">
                Showing {filteredApplications.length} of {validApplications.length} candidates
              </p>
            </div>

            <div className="divide-y divide-slate-100">
              {filteredApplications.map((application) => {
                const applicant = application.applicant || {};
                const hasResume = Boolean(application.resume);

                return (
                  <article
                    key={application._id}
                    className="grid gap-4 bg-white/72 p-4 transition hover:bg-teal-50/35 sm:p-5 lg:grid-cols-[minmax(0,1fr)_auto]"
                  >
                    <div className="flex min-w-0 gap-4">
                      {applicant.avatar ? (
                        <img
                          src={applicant.avatar}
                          alt={applicant.name || "Applicant"}
                          className="h-14 w-14 flex-shrink-0 rounded-lg object-cover shadow-sm"
                        />
                      ) : (
                        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700 shadow-sm">
                          {applicant.name ? (
                            <span className="text-base font-black">
                              {getInitials(applicant.name)}
                            </span>
                          ) : (
                            <UserRound className="h-6 w-6" />
                          )}
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="break-words text-lg font-black text-slate-950">
                            {applicant.name || "Applicant"}
                          </h2>
                          <StatusBadge status={application.status} />
                        </div>
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm font-medium text-slate-500">
                          <span className="inline-flex min-w-0 items-center gap-1.5">
                            <Mail className="h-4 w-4 flex-shrink-0" />
                            <span className="break-all">{applicant.email || "No email"}</span>
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <Calendar className="h-4 w-4" />
                            Applied {formatDate(application.createdAt)}
                          </span>
                        </div>
                        <div className="mt-3 inline-flex max-w-full items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-bold text-slate-600 ring-1 ring-slate-200">
                          {hasResume ? (
                            <>
                              <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-teal-700" />
                              <span className="truncate">
                                {getDisplayResumeName(application)}
                              </span>
                            </>
                          ) : (
                            <>
                              <FileText className="h-4 w-4 flex-shrink-0 text-slate-400" />
                              Submitted resume unavailable
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row lg:items-center">
                      <button
                        type="button"
                        onClick={() => handleDownloadResume(application)}
                        disabled={!hasResume}
                        className="employer-action px-3 py-2 disabled:hover:bg-teal-700"
                      >
                        <Download className="h-4 w-4" />
                        Resume
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedApplicant(application)}
                        className="employer-secondary-action px-3 py-2"
                      >
                        <Eye className="h-4 w-4" />
                        Review
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {selectedApplicant && (
          <ApplicantProfilePreview
            selectedApplicant={selectedApplicant}
            setSelectedApplicant={setSelectedApplicant}
            handleDownloadResume={handleDownloadResume}
            handleClose={() => {
              setSelectedApplicant(null);
              fetchApplications();
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default ApplicationViewer;
