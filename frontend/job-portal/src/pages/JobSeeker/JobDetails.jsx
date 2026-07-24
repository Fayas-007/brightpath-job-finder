import {
  ArrowLeft,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  FileText,
  MapPin,
  Send,
  ShieldCheck,
  UploadCloud,
  Wallet,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS, getAssetUrl } from "../../utils/apiPaths";
import { useCallback, useEffect, useMemo, useState } from "react";
import Navbar from "../../components/layout/Navbar";
import StatusBadge from "../../components/StatusBadge";
import toast from "react-hot-toast";
import Footer from "../LandingPage/components/Footer";
import { formatDate } from "../../utils/dateUtils";

const JobDetails = () => {
  const { user, updateUser } = useAuth();
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [jobDetails, setJobDetails] = useState(null);
  const [applying, setApplying] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedResumeFile, setSelectedResumeFile] = useState(null);

  const companyImage = jobDetails?.company?.avatar;
  const companyImageUrl = getAssetUrl(companyImage);
  const currentResume = user?.resume || "";
  const currentResumeName = user?.resumeName || "";
  const currentResumeUrl = getAssetUrl(currentResume);

  const companyName =
    jobDetails?.company?.companyName || jobDetails?.company?.name || "Company";
  const postedDate = jobDetails?.createdAt
    ? formatDate(jobDetails.createdAt)
    : "Recently posted";
  const hasApplied = Boolean(jobDetails?.applicationStatus);

  const salaryText = useMemo(() => {
    if (!jobDetails) return "Salary not specified";

    const formatter = new Intl.NumberFormat("en-LK");
    const min = Number(jobDetails.salaryMin);
    const max = Number(jobDetails.salaryMax);
    const hasMin = Number.isFinite(min) && min > 0;
    const hasMax = Number.isFinite(max) && max > 0;

    if (hasMin && hasMax) return `LKR ${formatter.format(min)} - ${formatter.format(max)}`;
    if (hasMin) return `From LKR ${formatter.format(min)}`;
    if (hasMax) return `Up to LKR ${formatter.format(max)}`;
    return "Salary not specified";
  }, [jobDetails]);

  const jobFacts = useMemo(
    () => [
      {
        label: "Location",
        value: jobDetails?.location || "Not specified",
        icon: MapPin,
      },
      {
        label: "Work type",
        value: jobDetails?.type || "Not specified",
        icon: BriefcaseBusiness,
      },
      {
        label: "Category",
        value: jobDetails?.category || "General",
        icon: BadgeCheck,
      },
      {
        label: "Posted",
        value: postedDate,
        icon: CalendarDays,
      },
    ],
    [jobDetails, postedDate]
  );

  const getResumeName = (resumePath, resumeName = "") => {
    if (!resumePath) return "Current resume";
    if (resumeName) return resumeName;
    const fileName = resumePath.split("/").pop() || resumePath;
    return decodeURIComponent(fileName).replace(/-\d{13}-\d+(\.[^.]+)$/i, "$1");
  };

  const getJobDetailsById = useCallback(async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.JOBS.GET_JOB_BY_ID(jobId));
      setJobDetails(response.data);
    } catch (error) {
      console.error("Error fetching job details:", error);
    }
  }, [jobId]);

  const openApplyModal = () => {
    if (jobDetails?.isClosed) {
      toast.error("This job is closed and no longer accepts applications.");
      return;
    }

    setShowApplyModal(true);
  };

  const closeApplyModal = () => {
    if (applying) return;
    setShowApplyModal(false);
    setSelectedResumeFile(null);
  };

  const handleResumeChange = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    const allowedExtensions = [".pdf", ".doc", ".docx"];
    const fileName = file.name.toLowerCase();
    const isValidType = allowedExtensions.some((extension) => fileName.endsWith(extension));

    if (!isValidType) {
      toast.error("Please upload a PDF, DOC, or DOCX resume.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Resume must be 5MB or smaller.");
      return;
    }

    setSelectedResumeFile(file);
  };

  const applyToJob = async () => {
    if (!currentResume && !selectedResumeFile) {
      toast.error("Add your resume once, then apply faster to any job.");
      return;
    }

    try {
      setApplying(true);
      if (jobId) {
        const payload = new FormData();
        if (selectedResumeFile) payload.append("resume", selectedResumeFile);

        const response = await axiosInstance.post(
          API_PATHS.APPLICATIONS.APPLY_TO_JOB(jobId),
          payload
        );

        if (response.data?.user) updateUser(response.data.user);
        toast.success("Applied to job successfully!");
        setShowApplyModal(false);
        setSelectedResumeFile(null);
        getJobDetailsById();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong!");
    } finally {
      setApplying(false);
    }
  };

  useEffect(() => {
    if (jobId && user) getJobDetailsById();
    else if (!user) navigate("/login");
  }, [getJobDetailsById, jobId, navigate, user]);

  if (!jobDetails) {
    return (
      <div className="app-background app-background-jobseeker flex min-h-screen items-center justify-center">
        <div className="rounded-lg border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-600 shadow-sm">
          Loading job details...
        </div>
      </div>
    );
  }

  return (
    <div className="page-with-footer app-background app-background-jobseeker">
      <Navbar />

      <main className="page-footer-main px-4 pb-10 pt-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-3 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white/85 px-3 py-2 text-sm font-bold text-slate-600 shadow-sm transition hover:border-blue-200 hover:text-blue-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <section className="overflow-hidden rounded-lg border border-blue-100 bg-white shadow-sm">
            <div className="grid lg:grid-cols-[minmax(0,1fr)_20rem]">
              <div className="border-b border-blue-100 bg-gradient-to-br from-blue-50 via-white to-teal-50 p-5 lg:border-b-0 lg:border-r">
                <div className="flex min-w-0 gap-4">
                  {companyImage ? (
                    <img
                      src={companyImageUrl}
                      alt={companyName}
                      className="h-16 w-16 flex-shrink-0 rounded-lg border border-white object-cover shadow-md"
                    />
                  ) : (
                    <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg border border-blue-100 bg-white text-blue-600 shadow-sm">
                      <Building2 className="h-7 w-7" />
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="text-xs font-black uppercase tracking-wide text-blue-600">
                      {companyName}
                    </p>
                    <h1 className="mt-1 text-2xl font-black leading-tight text-slate-950 sm:text-3xl">
                      {jobDetails.title}
                    </h1>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-slate-700 ring-1 ring-slate-200">
                        {jobDetails.location || "Location not set"}
                      </span>
                      <span className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-slate-700 ring-1 ring-slate-200">
                        {jobDetails.type || "Work type not set"}
                      </span>
                      <span className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-slate-700 ring-1 ring-slate-200">
                        {postedDate}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                  {jobFacts.map((fact) => (
                    <div
                      key={fact.label}
                      className="flex items-center gap-3 rounded-lg border border-white bg-white/80 px-3 py-3 shadow-sm"
                    >
                      <fact.icon className="h-4 w-4 flex-shrink-0 text-blue-600" />
                      <div className="min-w-0">
                        <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">
                          {fact.label}
                        </p>
                        <p className="truncate text-sm font-black text-slate-950">
                          {fact.value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <aside className="bg-white p-5">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-white p-2.5 text-teal-700 shadow-sm">
                      <Wallet className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                        Compensation
                      </p>
                      <p className="mt-1 text-lg font-black text-slate-950">
                        {salaryText}
                      </p>
                      <p className="text-xs font-semibold text-slate-500">per month</p>
                    </div>
                  </div>
                </div>

                <div className="mt-3 rounded-lg border border-slate-200 bg-white p-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-blue-50 p-2.5 text-blue-700">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-black text-slate-950">
                        {currentResume ? "Resume ready" : "Resume needed"}
                      </p>
                      <p className="mt-1 truncate text-sm text-slate-500">
                        {currentResume
                          ? getResumeName(currentResume, currentResumeName)
                          : "Upload while applying and we will save it."}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  {hasApplied ? (
                    <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
                      <p className="mb-2 text-xs font-black uppercase tracking-wide text-blue-600">
                        Application status
                      </p>
                      <StatusBadge status={jobDetails.applicationStatus} />
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={openApplyModal}
                      disabled={applying || jobDetails?.isClosed}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Send className="h-4 w-4" />
                      {jobDetails?.isClosed ? "Job closed" : "Apply now"}
                    </button>
                  )}
                </div>

                <div className="mt-3 flex items-start gap-2 rounded-lg bg-teal-50 px-3 py-2.5 text-xs font-semibold leading-5 text-teal-800">
                  <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  Your resume is attached to this application.
                </div>
              </aside>
            </div>
          </section>

          <section className="mt-4 grid gap-4 lg:grid-cols-2">
            <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-lg bg-blue-50 p-2.5 text-blue-700">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-blue-600">
                    Role overview
                  </p>
                  <h2 className="text-xl font-black text-slate-950">About this role</h2>
                </div>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                {jobDetails.description || "No description added yet."}
              </p>
            </article>

            <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-lg bg-teal-50 p-2.5 text-teal-700">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-teal-700">
                    Candidate fit
                  </p>
                  <h2 className="text-xl font-black text-slate-950">Requirements</h2>
                </div>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                {jobDetails.requirements || "No requirements added yet."}
              </p>
            </article>
          </section>
        </div>
      </main>

      {showApplyModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm"
          onMouseDown={closeApplyModal}
        >
          <div
            className="w-full max-w-xl overflow-hidden rounded-lg bg-white shadow-2xl ring-1 ring-slate-200"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-blue-600">
                  Resume check
                </p>
                <h2 className="mt-1 text-2xl font-black text-slate-950">
                  Apply to {jobDetails.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Add your resume once, then apply faster to any job.
                </p>
              </div>
              <button
                type="button"
                onClick={closeApplyModal}
                disabled={applying}
                className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Close apply modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 px-6 py-5">
              {currentResume ? (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50/70 p-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-white p-3 text-emerald-700 shadow-sm">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-slate-950">Profile resume</h3>
                        <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Ready
                        </span>
                      </div>
                      <p className="mt-1 truncate text-sm text-slate-600">
                        {getResumeName(currentResume, currentResumeName)}
                      </p>
                      <a
                        href={currentResumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex text-sm font-semibold text-blue-600 hover:text-blue-700"
                      >
                        View resume
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-amber-200 bg-amber-50/70 p-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-white p-3 text-amber-700 shadow-sm">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-950">No resume saved yet</h3>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        Upload a resume here and BrightPath will save it to your profile for
                        the next application.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-950">
                      {selectedResumeFile ? "New resume selected" : "Use a different resume"}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">
                      {selectedResumeFile
                        ? selectedResumeFile.name
                        : "PDF, DOC, or DOCX. Maximum file size is 5MB."}
                    </p>
                  </div>
                  <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-800 shadow-sm transition hover:border-blue-200 hover:text-blue-600">
                    <UploadCloud className="h-4 w-4" />
                    {selectedResumeFile ? "Change file" : "Upload resume"}
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      onChange={handleResumeChange}
                      disabled={applying}
                    />
                  </label>
                </div>

                {selectedResumeFile && (
                  <p className="mt-3 text-xs font-medium text-slate-500">
                    This resume will replace the resume saved on your profile.
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50 px-6 py-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeApplyModal}
                disabled={applying}
                className="rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={applyToJob}
                disabled={applying || (!currentResume && !selectedResumeFile)}
                className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {applying ? "Applying..." : "Apply with resume"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default JobDetails;
