import {
  ArrowRight,
  BriefcaseBusiness,
  ClipboardList,
  FileText,
  Search,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

const Hero = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const jobChips = [
    { label: "Search", value: "Roles by title, skill, or place", icon: Search },
    { label: "Apply", value: "Keep your profile ready", icon: FileText },
    { label: "Track", value: "Follow every application", icon: ClipboardList },
  ];

  return (
    <section
      id="home"
      className="relative min-h-[84vh] overflow-hidden bg-blue-50 pt-24 text-slate-950"
    >
      <img
        src="/images/brightpath-hero.png"
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-100"
      />
      <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(255,255,255,0.96)_0%,rgba(255,255,255,0.76)_34%,rgba(255,255,255,0.12)_52%,rgba(255,255,255,0)_66%,rgba(255,255,255,0)_100%)]" />
      <div className="absolute bottom-0 left-0 h-28 w-3/5 bg-gradient-to-t from-white via-white/30 to-transparent" />

      <div className="relative mx-auto flex min-h-[calc(84vh-6rem)] max-w-7xl flex-col justify-center px-4 pb-10 sm:px-6 lg:px-8">
        <div className="max-w-3xl pt-6">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/78 px-4 py-2 text-sm font-bold text-blue-700 shadow-sm backdrop-blur-md">
            <Sparkles className="h-4 w-4 text-teal-500" />
            Career paths and hiring workflows in one place
          </div>

          <h1 className="max-w-3xl text-4xl font-black leading-[1.04] text-slate-950 sm:text-5xl lg:text-6xl">
            Find work that fits. Hire without the clutter.
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
            BrightPath gives job seekers a clean way to discover roles and
            gives employers a focused workspace to post jobs, review applicants,
            and move decisions forward.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              className="group inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-100 transition-all hover:bg-blue-700"
              onClick={() => navigate("/find-jobs")}
            >
              <Search className="h-5 w-5" />
              Find Jobs
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>

            <button
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-100 bg-white/82 px-5 py-3 text-sm font-bold text-slate-700 shadow-sm backdrop-blur-md transition-all hover:bg-blue-50 hover:text-blue-700"
              onClick={() => {
                navigate(
                  isAuthenticated && user?.role === "employer"
                    ? "/employer-dashboard"
                    : "/login"
                );
              }}
            >
              <BriefcaseBusiness className="h-5 w-5" />
              Post a Job
            </button>
          </div>

          <div className="mt-8 grid max-w-3xl gap-3 sm:grid-cols-3">
            {jobChips.map((chip) => (
              <div
                key={chip.label}
                className="rounded-lg border border-white/80 bg-white/70 px-4 py-4 shadow-sm backdrop-blur-md"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                    <chip.icon className="h-4 w-4" />
                  </span>
                  <span className="text-sm font-black text-slate-950">
                    {chip.label}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-5 text-slate-600">
                  {chip.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative h-8 bg-white [clip-path:polygon(0_35%,100%_0,100%_100%,0_100%)]" />
    </section>
  );
};

export default Hero;
