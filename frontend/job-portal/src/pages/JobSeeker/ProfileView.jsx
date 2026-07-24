import { createElement, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/layout/Navbar";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  Edit,
  FileText,
  GraduationCap,
  Mail,
  Sparkles,
  UserRound,
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import { getAssetUrl } from "../../utils/apiPaths";
import Footer from "../LandingPage/components/Footer";

const InfoCard = ({ title, children, icon: Icon }) => (
  <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
    <div className="mb-4 flex items-center gap-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
        {createElement(Icon, { className: "h-5 w-5" })}
      </span>
      <h2 className="text-lg font-black text-slate-950">{title}</h2>
    </div>
    <div className="text-sm leading-6 text-slate-600">{children}</div>
  </section>
);

const EmptyState = ({ text, action, onAction }) => (
  <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-5">
    <p className="text-sm font-semibold text-slate-500">{text}</p>
    {action && (
      <button
        type="button"
        onClick={onAction}
        className="mt-3 inline-flex items-center gap-2 text-sm font-black text-blue-600 hover:text-blue-700"
      >
        {action}
        <ArrowRight className="h-4 w-4" />
      </button>
    )}
  </div>
);

const TimelineItem = ({ title, subtitle, meta }) => (
  <div className="relative pl-7">
    <span className="absolute left-0 top-1.5 h-3 w-3 rounded-full border-2 border-white bg-blue-600 shadow-sm ring-2 ring-blue-100" />
    <div className="absolute bottom-0 left-1.5 top-6 w-px bg-slate-200" />
    <div className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
      <p className="font-black text-slate-950">{title || "Untitled"}</p>
      <p className="mt-1 font-semibold text-slate-600">{subtitle || "Not specified"}</p>
      <p className="mt-2 text-xs font-bold text-slate-400">{meta}</p>
    </div>
  </div>
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
    (completionItems.filter((item) => item.complete).length / completionItems.length) * 100
  );

  if (user?.role !== "jobseeker") {
    return (
      <div className="page-with-footer app-background app-background-jobseeker">
        <Navbar />
        <main className="page-footer-main mx-auto max-w-6xl px-4 pb-12 pt-24 sm:px-6 lg:px-8">
          <section className="page-panel overflow-hidden rounded-lg">
            <div className="grid gap-0 lg:grid-cols-[320px_1fr]">
              <aside className="border-b border-blue-100 bg-gradient-to-br from-blue-50 via-white to-teal-50 p-8 text-slate-950 lg:border-b-0 lg:border-r">
                <img
                  src={profile.avatar || "/default-avatar.png"}
                  alt="Avatar"
                  className="h-28 w-28 rounded-lg border border-white object-cover shadow-lg shadow-blue-100"
                />
                <h1 className="mt-6 text-3xl font-black">{profile.name || "Profile"}</h1>
                <p className="mt-2 text-sm font-semibold text-blue-700">{roleLabel}</p>
                <p className="mt-5 flex items-center gap-2 text-sm text-slate-600">
                  <Mail className="h-4 w-4 text-blue-600" />
                  {profile.email || "No email"}
                </p>
                <button
                  onClick={() => navigate("/edit-profile")}
                  className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm shadow-blue-100 hover:bg-blue-700"
                >
                  <Edit className="h-4 w-4" />
                  Edit Profile
                </button>
              </aside>

              <div className="grid gap-5 p-6 sm:p-8">
                <InfoCard title="Account" icon={UserRound}>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-bold uppercase text-slate-400">Full Name</p>
                      <p className="mt-1 font-semibold text-slate-900">{profile.name || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase text-slate-400">Email</p>
                      <p className="mt-1 font-semibold text-slate-900">{profile.email || "N/A"}</p>
                    </div>
                  </div>
                </InfoCard>

                <InfoCard title="Company" icon={BriefcaseBusiness}>
                  <p className="font-semibold text-slate-900">{profile.companyName || "N/A"}</p>
                  <p className="mt-3 whitespace-pre-line">
                    {profile.companyDescription || "No company description added"}
                  </p>
                </InfoCard>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="page-with-footer app-background app-background-jobseeker">
      <Navbar />
      <main className="page-footer-main mx-auto max-w-6xl px-4 pb-12 pt-24 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-lg border border-blue-100 bg-white shadow-sm">
          <div className="border-b border-blue-100 bg-gradient-to-r from-blue-50 via-white to-teal-50 px-5 py-6 sm:px-7">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 flex-col items-start gap-4 sm:flex-row sm:items-center">
                <img
                  src={profile.avatar || "/default-avatar.png"}
                  alt="Avatar"
                  className="h-20 w-20 flex-shrink-0 rounded-lg border border-white object-cover shadow-lg shadow-blue-100 sm:h-24 sm:w-24"
                />
                <div className="min-w-0">
                  <p className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-black uppercase tracking-wide text-blue-700 ring-1 ring-blue-100">
                    <Sparkles className="h-3.5 w-3.5" />
                    Career profile
                  </p>
                  <h1 className="mt-3 break-words text-2xl font-black leading-tight text-slate-950 sm:text-3xl">
                    {profile.name || "Profile"}
                  </h1>
                  <p className="mt-1 flex min-w-0 items-center gap-2 break-all text-sm font-semibold text-slate-600 sm:break-normal">
                    <Mail className="h-4 w-4 flex-shrink-0 text-blue-600" />
                    {profile.email || "No email"}
                  </p>
                </div>
              </div>

              <div className="w-full lg:max-w-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-black text-slate-950">Profile readiness</p>
                  <p className="text-sm font-black text-blue-700">{completionScore}%</p>
                </div>
                <div className="mt-3 h-2 rounded-full bg-white ring-1 ring-blue-100">
                  <div
                    className="h-full rounded-full bg-blue-600"
                    style={{ width: `${completionScore}%` }}
                  />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {completionItems.map((item) => (
                    <span
                      key={item.label}
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-black ${
                        item.complete
                          ? "bg-teal-50 text-teal-700 ring-1 ring-teal-100"
                          : "bg-white text-slate-400 ring-1 ring-slate-200"
                      }`}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {item.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                onClick={() => navigate("/edit-profile")}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700"
              >
                <Edit className="h-4 w-4" />
                Edit profile
              </button>
              <button
                onClick={() => navigate("/applied-jobs")}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-100 bg-white px-5 py-3 text-sm font-black text-blue-700 hover:bg-blue-50"
              >
                Track applications
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid gap-5 p-4 sm:p-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <div className="grid gap-5">
              <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="rounded-lg bg-blue-50 p-3 text-blue-700">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black uppercase tracking-wide text-blue-600">
                        Resume dossier
                      </p>
                      {profile.resume ? (
                        <>
                          <p className="mt-2 break-words text-lg font-black leading-tight text-slate-950 sm:text-xl">
                            {getDisplayResumeName(profile.resume, profile.resumeName)}
                          </p>
                          <p className="mt-1 text-sm font-semibold text-slate-500">
                            This is the resume employers receive when you apply.
                          </p>
                        </>
                      ) : (
                        <p className="mt-2 text-sm font-semibold text-slate-500">
                          Add a resume to apply faster.
                        </p>
                      )}
                    </div>
                  </div>
                  {profile.resume && (
                    <a
                      href={profile.resume}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-4 py-2.5 text-sm font-black text-blue-700 hover:bg-blue-100"
                    >
                      View resume
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </section>

              <section className="grid gap-5 lg:grid-cols-2">
                <InfoCard title="Education" icon={GraduationCap}>
                  {profile.education?.length ? (
                    <div className="grid gap-4">
                      {profile.education.map((edu, index) => (
                        <TimelineItem
                          key={index}
                          title={edu.degree}
                          subtitle={edu.institution}
                          meta={`${edu.startYear || "N/A"} to ${edu.endYear || "Present"}`}
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
                </InfoCard>

                <InfoCard title="Experience" icon={BriefcaseBusiness}>
                  {profile.experience?.length ? (
                    <div className="grid gap-4">
                      {profile.experience.map((exp, index) => (
                        <TimelineItem
                          key={index}
                          title={exp.title}
                          subtitle={exp.company}
                          meta={`${
                            exp.startDate
                              ? new Date(exp.startDate).toLocaleDateString()
                              : "N/A"
                          } to ${
                            exp.endDate
                              ? new Date(exp.endDate).toLocaleDateString()
                              : "Present"
                          }`}
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
                </InfoCard>
              </section>
            </div>

            <aside className="space-y-4">
              <section className="rounded-lg border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                  Account
                </p>
                <div className="mt-4 grid gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase text-slate-400">Full name</p>
                    <p className="mt-1 font-black text-slate-950">{profile.name || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase text-slate-400">Email</p>
                    <p className="mt-1 break-words font-semibold text-slate-700">
                      {profile.email || "N/A"}
                    </p>
                  </div>
                </div>
              </section>

              <section className="rounded-lg border border-teal-100 bg-teal-50 p-5">
                <p className="text-sm font-black text-slate-950">Next best step</p>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                  Keep this profile complete before applying. It makes the resume step
                  faster and keeps your application details consistent.
                </p>
              </section>
            </aside>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ProfileView;
