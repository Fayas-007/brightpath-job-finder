import { createElement, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/layout/Navbar";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BriefcaseBusiness,
  Check,
  Download,
  Edit,
  FileText,
  GraduationCap,
  Lightbulb,
  Mail,
  UserRound,
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import { getAssetUrl } from "../../utils/apiPaths";
import Footer from "../LandingPage/components/Footer";

const DISPLAY_FONT = { fontFamily: "'Outfit', 'Inter', system-ui, sans-serif" };

const PAGE_BG = "bg-[#f3f5fa]";

// Shared surface: white, soft shadow, no border.
const SURFACE =
  "rounded-2xl bg-white shadow-[0_1px_2px_rgba(10,31,107,0.06),0_10px_28px_-14px_rgba(10,31,107,0.22)]";

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString(undefined, {
        month: "short",
        year: "numeric",
      })
    : null;

// Only these can render inside a browser tab. Word files get downloaded.
const isViewable = (name = "") => /\.(pdf|png|jpe?g)$/i.test(name);

const Card = ({ title, icon: Icon, children, className = "" }) => (
  <section className={`${SURFACE} p-6 ${className}`}>
    <div className="mb-5 flex items-center gap-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef3ff] text-[#1646e0]">
        {createElement(Icon, { className: "h-5 w-5" })}
      </span>
      <h2
        style={DISPLAY_FONT}
        className="text-xl font-extrabold text-[#0a1f6b]"
      >
        {title}
      </h2>
    </div>
    {children}
  </section>
);

const Field = ({ label, value }) => (
  <div>
    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
      {label}
    </p>
    <p className="mt-1 break-words text-[15px] font-semibold text-[#0a1f6b]">
      {value || "N/A"}
    </p>
  </div>
);

const EmptyState = ({ text, action, onAction }) => (
  <div className="rounded-xl bg-[#f5f8ff] px-4 py-5">
    <p className="text-sm text-slate-600">{text}</p>
    {action && (
      <button
        type="button"
        onClick={onAction}
        className="mt-3 inline-flex items-center gap-2 rounded-lg text-sm font-semibold text-[#1646e0] hover:text-[#0f36b8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1646e0]"
      >
        {action}
        <ArrowRight className="h-4 w-4" />
      </button>
    )}
  </div>
);

const TimelineItem = ({ title, subtitle, meta, last }) => (
  <div className="relative pl-6">
    <span className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-[#1646e0] ring-4 ring-[#dbe6ff]" />
    {!last && (
      <span className="absolute bottom-[-1.25rem] left-[5px] top-5 w-px bg-[#0a1f6b]/15" />
    )}
    <p className="break-words font-bold text-[#0a1f6b]">
      {title || "Untitled"}
    </p>
    <p className="mt-0.5 break-words text-sm font-medium text-slate-600">
      {subtitle || "Not specified"}
    </p>
    <p className="mt-1 text-xs font-medium text-slate-500">{meta}</p>
  </div>
);

const ProgressRing = ({ value }) => {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - value / 100);

  return (
    <div
      className="relative mx-auto h-36 w-36"
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Profile readiness"
    >
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="#eef3ff"
          strokeWidth="10"
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="#1646e0"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          style={DISPLAY_FONT}
          className="text-4xl font-extrabold text-[#0a1f6b]"
        >
          {value}
          <span className="text-xl text-[#1646e0]">%</span>
        </span>
      </div>
    </div>
  );
};

const ProfileHero = ({ profile, roleLabel, navigate, showTrack }) => (
  <section className={`${SURFACE} overflow-hidden`}>
    <div className="bg-gradient-to-br from-[#eef3ff] via-white to-white px-6 py-8 sm:px-10 sm:py-10">
      <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:gap-8 sm:text-left">
        <img
          src={profile.avatar || "/default-avatar.png"}
          alt="Avatar"
          className="h-28 w-28 flex-shrink-0 rounded-full bg-white object-cover shadow-md ring-4 ring-white sm:h-32 sm:w-32"
        />

        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#1646e0]">
            {roleLabel}
          </p>

          <h1
            style={DISPLAY_FONT}
            className="mt-1 break-words text-3xl font-extrabold leading-tight tracking-[-0.01em] text-[#0a1f6b] sm:text-4xl"
          >
            {profile.name || "Profile"}
          </h1>

          <p className="mt-2 flex min-w-0 items-center justify-center gap-2 break-all text-sm text-slate-600 sm:justify-start sm:break-normal">
            <Mail className="h-4 w-4 flex-shrink-0 text-slate-400" />
            {profile.email || "No email"}
          </p>

          <div className="mt-5 flex flex-wrap justify-center gap-3 sm:justify-start">
            <button
              type="button"
              onClick={() => navigate("/edit-profile")}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1646e0] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0f36b8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1646e0]"
            >
              <Edit className="h-4 w-4" />
              Edit profile
            </button>

            {showTrack && (
              <button
                type="button"
                onClick={() => navigate("/applied-jobs")}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#0a1f6b]/25 bg-white px-5 py-2.5 text-sm font-semibold text-[#0a1f6b] transition-colors hover:bg-[#eef3ff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1646e0]"
              >
                Track applications
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  </section>
);

// Full-width banner right under the hero.
const NextStepBanner = ({ title, text, action, onAction }) => (
  <section className="flex flex-col gap-4 rounded-2xl bg-[#fff6d6] p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
    <div className="flex min-w-0 items-start gap-4">
      <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[#ffd23f] text-[#0a1f6b]">
        <Lightbulb className="h-5 w-5" />
      </span>

      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#0a1f6b]/65">
          Next best step
        </p>
        <p
          style={DISPLAY_FONT}
          className="mt-0.5 break-words text-lg font-extrabold leading-tight text-[#0a1f6b]"
        >
          {title}
        </p>
        <p className="mt-1 text-sm text-[#0a1f6b]/75">{text}</p>
      </div>
    </div>

    <button
      type="button"
      onClick={onAction}
      className="inline-flex flex-shrink-0 items-center justify-center gap-2 rounded-xl bg-[#0a1f6b] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1646e0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0a1f6b]"
    >
      {action}
      <ArrowRight className="h-4 w-4" />
    </button>
  </section>
);

const ProfileView = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({});

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get(`/api/user/${user._id}`);
        const data = res.data;

        data.avatar = getAssetUrl(data.avatar);
        data.resume = getAssetUrl(data.resume);

        setProfile(data);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      }
    };

    if (user) fetchProfile();
  }, [user]);

  const roleLabel =
    user?.role === "admin"
      ? "Admin"
      : user?.role === "employer"
        ? "Employer"
        : "Job Seeker";

  const getDisplayResumeName = (resume, resumeName) => {
    if (resumeName) return resumeName;
    if (!resume) return "";

    const fileName = decodeURIComponent(resume.split("/").pop() || resume);
    return fileName.replace(/-\d{13}-\d+(\.[^.]+)$/i, "$1");
  };

  const completionItems = useMemo(
    () => [
      { label: "Photo", complete: Boolean(profile.avatar) },
      { label: "Resume", complete: Boolean(profile.resume) },
      { label: "Education", complete: Boolean(profile.education?.length) },
      { label: "Experience", complete: Boolean(profile.experience?.length) },
    ],
    [profile]
  );

  const completionScore = Math.round(
    (completionItems.filter((item) => item.complete).length /
      completionItems.length) *
      100
  );

  // First missing item drives the next-step banner.
  const nextMissing = completionItems.find((item) => !item.complete);

  /* ---------------------------------------------
     Resume view / download
  --------------------------------------------- */

  const resumeFileName = () => profile.resumeName || profile.resume || "";

  // Fetch the resume through the authenticated endpoint as a blob URL.
  const fetchResumeBlobUrl = async (inline) => {
    const response = await axiosInstance.get(
      `/api/user/resume/download${inline ? "?inline=1" : ""}`,
      { responseType: "blob" }
    );

    const name = resumeFileName();
    const type = /\.pdf$/i.test(name)
      ? "application/pdf"
      : response.headers["content-type"] || "application/octet-stream";

    return URL.createObjectURL(new Blob([response.data], { type }));
  };

  const saveBlob = (url, filename) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const showResumeError = async (error) => {
    console.error("Resume error:", error);

    let message = "Unable to open resume. Please try again.";

    if (error.response?.data instanceof Blob) {
      try {
        const errorData = JSON.parse(await error.response.data.text());
        message = errorData.message || message;
      } catch {
        // Use the default error message.
      }
    } else if (error.response?.data?.message) {
      message = error.response.data.message;
    }

    alert(message);
  };

  const downloadResume = async () => {
    try {
      const url = await fetchResumeBlobUrl(false);
      saveBlob(url, profile.resumeName || "resume.pdf");
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (error) {
      showResumeError(error);
    }
  };

  const openResume = async () => {
    // Word files can't render in a browser tab, so download those.
    if (!isViewable(resumeFileName())) return downloadResume();

    // Open a blank tab immediately to avoid popup blocking.
    const newWindow = window.open("about:blank", "_blank");

    try {
      const url = await fetchResumeBlobUrl(true);

      if (newWindow) {
        newWindow.location.href = url;
      } else {
        // Popup blocked: fall back to downloading.
        saveBlob(url, profile.resumeName || "resume.pdf");
      }

      // Keep the object URL alive while the file opens.
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (error) {
      if (newWindow && !newWindow.closed) newWindow.close();
      showResumeError(error);
    }
  };

  // Display the profile page for admins and employers.
  if (user?.role !== "jobseeker") {
    return (
      <div className={`page-with-footer ${PAGE_BG}`}>
        <Navbar />

        <main className="page-footer-main mx-auto w-full max-w-6xl px-4 pb-14 pt-24 sm:px-6 lg:px-8">
          <ProfileHero
            profile={profile}
            roleLabel={roleLabel}
            navigate={navigate}
            showTrack={false}
          />

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <Card title="Account" icon={UserRound}>
              <div className="grid gap-4">
                <Field label="Full name" value={profile.name} />
                <Field label="Email" value={profile.email} />
              </div>
            </Card>

            <Card title="Company" icon={BriefcaseBusiness}>
              <Field label="Company name" value={profile.companyName} />
              <p className="mt-4 whitespace-pre-line text-sm leading-6 text-slate-600">
                {profile.companyDescription || "No company description added"}
              </p>
            </Card>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className={`page-with-footer ${PAGE_BG}`}>
      <Navbar />

      <main className="page-footer-main mx-auto w-full max-w-6xl px-4 pb-14 pt-24 sm:px-6 lg:px-8">
        <ProfileHero
          profile={profile}
          roleLabel={roleLabel}
          navigate={navigate}
          showTrack
        />

        {/* Next best step, right under the hero */}
        <div className="mt-6">
          {nextMissing ? (
            <NextStepBanner
              title={`Add your ${nextMissing.label.toLowerCase()}`}
              text="A complete profile speeds up applying and keeps your applications consistent."
              action="Update profile"
              onAction={() => navigate("/edit-profile")}
            />
          ) : (
            <NextStepBanner
              title="Your profile is ready"
              text="Everything is filled in. Find a job and apply in a few clicks."
              action="Browse jobs"
              onAction={() => navigate("/find-jobs")}
            />
          )}
        </div>

        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          {/* Main column */}
          <div className="grid gap-6">
            {/* Resume: solid navy card */}
            <section className="rounded-2xl bg-[#0a1f6b] p-6 text-white shadow-[0_10px_28px_-14px_rgba(10,31,107,0.5)]">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-start gap-4">
                  <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#ffd23f]">
                    <FileText className="h-6 w-6" />
                  </span>

                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#ffd23f]">
                      Resume
                    </p>

                    {profile.resume ? (
                      <>
                        <p
                          style={DISPLAY_FONT}
                          className="mt-1 break-words text-xl font-extrabold leading-tight"
                        >
                          {getDisplayResumeName(
                            profile.resume,
                            profile.resumeName
                          )}
                        </p>
                        <p className="mt-1 text-sm text-white/70">
                          Employers receive this file when you apply.
                        </p>
                      </>
                    ) : (
                      <p className="mt-1 text-sm text-white/70">
                        Add a resume to apply faster.
                      </p>
                    )}
                  </div>
                </div>

                {profile.resume ? (
                  <div className="flex flex-shrink-0 flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={openResume}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#ffd23f] px-5 py-2.5 text-sm font-semibold text-[#0a1f6b] transition-colors hover:bg-[#f5c400] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    >
                      View resume
                      <ArrowRight className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={downloadResume}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => navigate("/edit-profile")}
                    className="inline-flex flex-shrink-0 items-center justify-center gap-2 rounded-xl bg-[#ffd23f] px-5 py-2.5 text-sm font-semibold text-[#0a1f6b] transition-colors hover:bg-[#f5c400] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    Upload resume
                  </button>
                )}
              </div>
            </section>

            {/* Education + Experience */}
            <div className="grid gap-6 xl:grid-cols-2">
              <Card title="Education" icon={GraduationCap}>
                {profile.education?.length ? (
                  <div className="grid gap-6">
                    {profile.education.map((edu, index) => (
                      <TimelineItem
                        key={index}
                        title={edu.degree}
                        subtitle={edu.institution}
                        meta={`${edu.startYear || "N/A"} – ${
                          edu.endYear || "Present"
                        }`}
                        last={index === profile.education.length - 1}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    text="No education added yet."
                    action="Add education"
                    onAction={() => navigate("/edit-profile")}
                  />
                )}
              </Card>

              <Card title="Experience" icon={BriefcaseBusiness}>
                {profile.experience?.length ? (
                  <div className="grid gap-6">
                    {profile.experience.map((exp, index) => (
                      <TimelineItem
                        key={index}
                        title={exp.title}
                        subtitle={exp.company}
                        meta={`${formatDate(exp.startDate) || "N/A"} – ${
                          formatDate(exp.endDate) || "Present"
                        }`}
                        last={index === profile.experience.length - 1}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    text="No experience added yet."
                    action="Add experience"
                    onAction={() => navigate("/edit-profile")}
                  />
                )}
              </Card>
            </div>
          </div>

          {/* Sidebar: readiness only */}
          <aside className="lg:sticky lg:top-24">
            <section className={`${SURFACE} p-6`}>
              <h2
                style={DISPLAY_FONT}
                className="text-xl font-extrabold text-[#0a1f6b]"
              >
                Profile readiness
              </h2>

              <div className="mt-5">
                <ProgressRing value={completionScore} />
              </div>

              <ul className="mt-6 grid gap-3">
                {completionItems.map((item) => (
                  <li
                    key={item.label}
                    className="flex items-center gap-3 text-sm"
                  >
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full ${
                        item.complete
                          ? "bg-[#1646e0] text-white"
                          : "bg-[#eef3ff] text-transparent"
                      }`}
                    >
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                    <span
                      className={
                        item.complete
                          ? "font-semibold text-[#0a1f6b]"
                          : "text-slate-500"
                      }
                    >
                      {item.label}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProfileView;