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

// Same hero photo as the job search page.
// Path is relative to this file (src/pages/<Page>/JobDetails.jsx).
import HERO_IMAGE from "../../assets/job-hero.png";

const DISPLAY_FONT = { fontFamily: "'Outfit', 'Inter', system-ui, sans-serif" };

// Same card look as the job search page.
const CARD =
  "rounded-2xl border border-[#0a1f6b]/10 bg-white shadow-[0_10px_28px_-18px_rgba(10,31,107,0.35)]";

// "a\n\nb" -> ["a", "b"]
const toParagraphs = (text = "") =>
  text
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);

// One item per line, leading bullets / numbers stripped
const toList = (text = "") =>
  text
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*(?:[-*•·▪●]|\d+[.)])\s*/, "").trim())
    .filter(Boolean);

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
  // Shown only if the company has a description saved on its profile.
  const companyAbout =
    jobDetails?.company?.companyDescription ||
    jobDetails?.company?.description ||
    "";
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

  const hasSalary = salaryText !== "Salary not specified";

  const heroChips = useMemo(
    () => [
      { label: jobDetails?.location || "Location not specified", icon: MapPin },
      { label: jobDetails?.type || "Type not specified", icon: BriefcaseBusiness },
      { label: jobDetails?.category || "General", icon: BadgeCheck },
    ],
    [jobDetails]
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

  const closeApplyModal = useCallback(() => {
    if (applying) return;
    setShowApplyModal(false);
    setSelectedResumeFile(null);
  }, [applying]);

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
        toast.success("Application submitted!");
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

  // While the apply popup is open: Escape closes it, and the page behind it
  // can't scroll.
  useEffect(() => {
    if (!showApplyModal) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") closeApplyModal();
    };

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [showApplyModal, closeApplyModal]);

  if (!jobDetails) {
    return (
      <div className="page-with-footer flex min-h-screen items-center justify-center bg-[#f3f5fa]">
        <div className={`${CARD} flex items-center gap-3 px-5 py-4 text-sm font-semibold text-[#0a1f6b]`}>
          <span
            aria-hidden="true"
            className="h-4 w-4 animate-spin rounded-full border-2 border-[#1646e0]/30 border-t-[#1646e0]"
          />
          Loading job details...
        </div>
      </div>
    );
  }

  const descriptionParagraphs = toParagraphs(jobDetails.description);
  const requirementItems = toList(jobDetails.requirements);

  const resumeDisplayName = selectedResumeFile
    ? selectedResumeFile.name
    : currentResume
      ? getResumeName(currentResume, currentResumeName)
      : "";

  // File picker styled as a button; the same input serves "Change" and "Upload".
  const renderUpload = (text, className) => (
    <label className={`inline-flex flex-shrink-0 items-center justify-center ${className}`}>
      {text}
      <input
        type="file"
        accept=".pdf,.doc,.docx"
        className="sr-only"
        onChange={handleResumeChange}
        disabled={applying}
      />
    </label>
  );

  const renderApply = () => {
    if (hasApplied) {
      return (
        <div className="flex items-center justify-between gap-3 rounded-xl bg-[#eef3ff] px-4 py-3">
          <span className="text-sm font-semibold text-[#0a1f6b]">Application status</span>
          <StatusBadge status={jobDetails.applicationStatus} />
        </div>
      );
    }

    return (
      <button
        type="button"
        onClick={openApplyModal}
        disabled={applying || jobDetails?.isClosed}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1646e0] px-5 py-3.5 text-[15px] font-bold text-white transition-colors hover:bg-[#0f36b8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1646e0] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Send className="h-4 w-4" />
        {jobDetails?.isClosed ? "Job closed" : "Apply now"}
      </button>
    );
  };

  return (
    <div className="page-with-footer bg-[#f3f5fa]">
      <Navbar transparent />

      <main className="page-footer-main">
        {/* Hero: same photo and overlay as the job search page */}
        <section className="relative isolate -mt-2 overflow-hidden bg-[#0a1f6b] pb-28 pt-[7.5rem] sm:pb-32 sm:pt-[9rem]">
          <img
            src={HERO_IMAGE}
            alt=""
            className="absolute inset-0 -z-30 h-full w-full object-cover object-[78%_12%] lg:object-[right_12%]"
          />

          <div
            aria-hidden="true"
            className="absolute inset-0 -z-20 hidden bg-gradient-to-r from-[#050b24] from-25% via-[#0a1f6b]/85 via-50% to-[#0a1f6b]/10 lg:block"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-20 bg-gradient-to-b from-[#050b24]/90 via-[#0a1f6b]/75 to-[#0a1f6b]/55 lg:hidden"
          />

          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-[13px] font-semibold text-white backdrop-blur transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to jobs
            </button>

            <div className="mt-6 flex items-center gap-3">
              {companyImage ? (
                <img
                  src={companyImageUrl}
                  alt={companyName}
                  className="h-12 w-12 flex-shrink-0 rounded-xl bg-white object-cover shadow-md"
                />
              ) : (
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white text-[#1646e0] shadow-md">
                  <Building2 className="h-6 w-6" />
                </div>
              )}
              <p className="truncate text-base font-semibold text-white/90">
                {companyName}
              </p>
            </div>

            <h1
              style={DISPLAY_FONT}
              className="mt-4 max-w-3xl text-[clamp(2rem,4.5vw,3.25rem)] font-extrabold leading-[1.05] tracking-[-0.02em] text-white"
            >
              {jobDetails.title}
            </h1>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              {heroChips.map(({ label, icon: Icon }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-[13px] font-semibold text-white backdrop-blur"
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Content overlaps the hero edge */}
        <div className="relative z-10 mx-auto -mt-16 w-full max-w-6xl px-4 pb-14 sm:px-6 lg:px-8">
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
            {/* Main content */}
            <div className="min-w-0 space-y-6">
              <article className={`${CARD} p-6 sm:p-8`}>
                <h2
                  style={DISPLAY_FONT}
                  className="text-xl font-extrabold tracking-[-0.01em] text-[#0a1f6b]"
                >
                  About this role
                </h2>

                {descriptionParagraphs.length > 0 ? (
                  <div className="mt-4 max-w-[70ch] space-y-4">
                    {descriptionParagraphs.map((paragraph, index) => (
                      <p
                        key={index}
                        className="whitespace-pre-line text-[15px] leading-7 text-slate-700"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-[15px] text-slate-500">
                    No description added yet.
                  </p>
                )}
              </article>

              <article className={`${CARD} p-6 sm:p-8`}>
                <h2
                  style={DISPLAY_FONT}
                  className="text-xl font-extrabold tracking-[-0.01em] text-[#0a1f6b]"
                >
                  Requirements
                </h2>

                {requirementItems.length > 1 ? (
                  <ul className="mt-4 max-w-[70ch] space-y-3">
                    {requirementItems.map((item, index) => (
                      <li
                        key={index}
                        className="flex gap-3 text-[15px] leading-7 text-slate-700"
                      >
                        <CheckCircle2 className="mt-1 h-5 w-5 flex-shrink-0 text-[#1646e0]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : requirementItems.length === 1 ? (
                  <p className="mt-4 max-w-[70ch] text-[15px] leading-7 text-slate-700">
                    {requirementItems[0]}
                  </p>
                ) : (
                  <p className="mt-4 text-[15px] text-slate-500">
                    No requirements added yet.
                  </p>
                )}
              </article>

              {companyAbout && (
                <article className={`${CARD} p-6 sm:p-8`}>
                  <h2
                    style={DISPLAY_FONT}
                    className="text-xl font-extrabold tracking-[-0.01em] text-[#0a1f6b]"
                  >
                    About {companyName}
                  </h2>
                  <p className="mt-4 max-w-[70ch] whitespace-pre-line text-[15px] leading-7 text-slate-700">
                    {companyAbout}
                  </p>
                </article>
              )}
            </div>

            {/* Sidebar: first on mobile, sticky on desktop */}
            <aside className={`${CARD} order-first p-6 lg:sticky lg:top-24 lg:order-none`}>
              <p className="text-sm font-medium text-slate-500">Salary</p>
              <p
                style={DISPLAY_FONT}
                className="mt-1 text-2xl font-extrabold leading-tight text-[#0a1f6b]"
              >
                {salaryText}
              </p>
              {hasSalary && (
                <p className="mt-0.5 text-xs font-medium text-slate-500">per month</p>
              )}

              <div className="mt-5">{renderApply()}</div>

              <div className="mt-5 flex items-start gap-3 rounded-xl bg-[#eef3ff] p-3.5">
                <FileText className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#1646e0]" />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[#0a1f6b]">
                    {currentResume ? "Resume ready" : "Resume needed"}
                  </p>
                  <p className="mt-0.5 truncate text-sm text-slate-500">
                    {currentResume
                      ? getResumeName(currentResume, currentResumeName)
                      : "Upload while applying and we will save it."}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-3 border-t border-[#0a1f6b]/10 pt-5">
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[#eef3ff] text-[#1646e0]">
                  <CalendarDays className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-xs font-medium text-slate-500">Posted</p>
                  <p className="text-sm font-bold text-[#0a1f6b]">{postedDate}</p>
                </div>
              </div>

              <p className="mt-5 flex items-start gap-2 text-xs font-medium leading-5 text-slate-500">
                <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#1646e0]" />
                Your resume is attached to this application.
              </p>
            </aside>
          </div>
        </div>
      </main>

      {showApplyModal && (
        // Plain frosted blur: a faint white wash, no blue tint
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-white/20 px-4 py-6 backdrop-blur-md"
          onMouseDown={closeApplyModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="apply-modal-title"
            className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_64px_-16px_rgba(15,23,42,0.35)]"
            onMouseDown={(event) => event.stopPropagation()}
          >
            {/* Header: company + role, quiet close button */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
              <div className="flex min-w-0 items-center gap-3">
                {companyImage ? (
                  <img
                    src={companyImageUrl}
                    alt=""
                    className="h-11 w-11 flex-shrink-0 rounded-lg border border-slate-200 bg-white object-cover"
                  />
                ) : (
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-400">
                    <Building2 className="h-5 w-5" />
                  </div>
                )}

                <div className="min-w-0">
                  <h2
                    id="apply-modal-title"
                    style={DISPLAY_FONT}
                    title={`Apply to ${jobDetails.title}`}
                    className="truncate text-lg font-bold leading-tight text-slate-900"
                  >
                    Apply to {jobDetails.title}
                  </h2>
                  <p className="mt-0.5 truncate text-sm text-slate-500">{companyName}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeApplyModal}
                disabled={applying}
                className="-mr-2 -mt-1 flex-shrink-0 rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1646e0] disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body: one resume card */}
            <div className="px-6 py-5">
              <p className="text-sm font-semibold text-slate-900">Resume</p>

              {resumeDisplayName ? (
                <div className="mt-3 flex items-center gap-3 rounded-xl border border-slate-200 p-3">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#1646e0]">
                    <FileText className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {resumeDisplayName}
                    </p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-slate-500">
                      {selectedResumeFile ? (
                        <span>New file. It will replace your profile resume.</span>
                      ) : (
                        <>
                          <span>From your profile</span>
                          <a
                            href={currentResumeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-[#1646e0] hover:underline"
                          >
                            View
                          </a>
                        </>
                      )}
                    </p>
                  </div>

                  {renderUpload(
                    "Change",
                    "cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-within:ring-2 focus-within:ring-[#1646e0]"
                  )}
                </div>
              ) : (
                <div className="mt-3 flex flex-col items-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-7 text-center">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-400 ring-1 ring-slate-200">
                    <UploadCloud className="h-5 w-5" />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-slate-900">
                    Add your resume to apply
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    We will save it to your profile for next time.
                  </p>
                  {renderUpload(
                    "Upload resume",
                    "mt-4 cursor-pointer rounded-lg bg-[#1646e0] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0f36b8] focus-within:ring-2 focus-within:ring-[#1646e0] focus-within:ring-offset-2"
                  )}
                </div>
              )}

              {selectedResumeFile && currentResume && (
                <button
                  type="button"
                  onClick={() => setSelectedResumeFile(null)}
                  disabled={applying}
                  className="mt-3 text-sm font-semibold text-[#1646e0] hover:underline disabled:opacity-50"
                >
                  Use my profile resume instead
                </button>
              )}

              <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-slate-500">
                <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400" />
                PDF, DOC, or DOCX, up to 5MB. Your resume is shared with {companyName}.
              </p>
            </div>

            {/* Footer */}
            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeApplyModal}
                disabled={applying}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1646e0] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={applyToJob}
                disabled={applying || !resumeDisplayName}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1646e0] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0f36b8] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1646e0] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {applying && (
                  <span
                    aria-hidden="true"
                    className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                  />
                )}
                {applying ? "Submitting..." : "Submit application"}
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