import {
  FileText,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import BrandLogo from "../../../components/BrandLogo";

const footerGroups = {
  public: [
    {
      title: "Start",
      links: [
        { label: "Find jobs", path: "/login" },
        { label: "Create account", path: "/signup" },
        { label: "Login", path: "/login" },
      ],
    },
    {
      title: "For Teams",
      links: [
        { label: "Post a job", path: "/login" },
        { label: "Review applicants", path: "/login" },
        { label: "Employer workspace", path: "/login" },
      ],
    },
    {
      title: "Support",
      links: [
        { label: "Contact support", href: "mailto:support@brightpath.local" },
        { label: "Privacy", path: "/" },
        { label: "Terms", path: "/" },
      ],
    },
  ],
  jobseeker: [
    {
      title: "Career",
      links: [
        { label: "Find jobs", path: "/find-jobs" },
      ],
    },
    {
      title: "Profile",
      links: [
        { label: "View profile", path: "/profile" },
        { label: "Edit profile", path: "/edit-profile" },
      ],
    },
    {
      title: "Support",
      links: [
        { label: "Contact support", href: "mailto:support@brightpath.local" },
        { label: "Privacy", path: "/find-jobs" },
      ],
    },
  ],
  employer: [
    {
      title: "Hiring",
      links: [
        { label: "Dashboard", path: "/employer-dashboard" },
        { label: "Post a job", path: "/post-job" },
        { label: "Manage jobs", path: "/manage-jobs" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "Company profile", path: "/company-profile" },
        { label: "Applications", path: "/manage-jobs" },
        { label: "Candidate review", path: "/manage-jobs" },
      ],
    },
    {
      title: "Support",
      links: [
        { label: "Contact support", href: "mailto:support@brightpath.local" },
        { label: "Hiring help", path: "/employer-dashboard" },
        { label: "Privacy", path: "/company-profile" },
      ],
    },
  ],
};

const footerCopy = {
  public: {
    eyebrow: "BrightPath",
    text: "BrightPath keeps job discovery, hiring workflows, and applications clear from the first search to the final decision.",
  },
  jobseeker: {
    eyebrow: "Job Seeker",
    text: "Return to your search and keep your profile ready from one clean workspace.",
  },
  employer: {
    eyebrow: "Employer",
    text: "Post roles, review candidates, and keep company details ready for the people you want to reach.",
  },
};

const FooterLink = ({ item }) => {
  const className =
    "inline-flex w-fit items-center gap-2 text-sm font-semibold text-slate-600 transition-colors hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200";

  if (item.href) {
    return (
      <a href={item.href} className={className}>
        {item.label}
      </a>
    );
  }

  return (
    <Link to={item.path} className={className}>
      {item.label}
    </Link>
  );
};

const Footer = () => {
  const { user, isAuthenticated } = useAuth();
  const role =
    isAuthenticated && (user?.role === "employer" || user?.role === "recruiter")
      ? "employer"
      : isAuthenticated && user?.role === "jobseeker"
      ? "jobseeker"
      : "public";
  const groups = footerGroups[role];
  const copy = footerCopy[role];

  return (
    <footer className="relative overflow-hidden border-t border-slate-200/80 bg-white/90 text-slate-900 shadow-sm backdrop-blur-xl">

      <div className="relative mx-auto max-w-screen-2xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.35fr]">
          <div className="max-w-xl">
            <div className="flex items-center gap-3">
              <BrandLogo textClassName="text-[1.45rem]" iconClassName="h-8 w-8" />
              <span className="inline-flex items-center gap-2 rounded-full bg-blue-50/80 px-3 py-1 text-xs font-bold uppercase text-blue-700 ring-1 ring-blue-100">
                <Sparkles className="h-3.5 w-3.5 text-teal-500" />
                {copy.eyebrow}
              </span>
            </div>
            <p className="max-w-md text-sm leading-7 text-slate-600">
              {copy.text}
            </p>
            <div className="mt-5 flex flex-wrap gap-3 text-sm font-semibold text-slate-600">
              <a
                href="mailto:support@brightpath.local"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white/75 px-3 py-2 transition-colors hover:border-blue-200 hover:text-blue-700"
              >
                <Mail className="h-4 w-4 text-blue-600" />
                support@brightpath.local
              </a>
              <span className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white/75 px-3 py-2">
                <ShieldCheck className="h-4 w-4 text-teal-600" />
                Secure workspace
              </span>
            </div>
          </div>

          <nav className="grid gap-8 sm:grid-cols-3">
            {groups.map((group) => (
              <div
                key={group.title}
                className="border-t border-slate-200 pt-5 sm:border-l sm:border-t-0 sm:pl-7 sm:pt-0"
              >
                <h3 className="text-xs font-black uppercase text-slate-950">
                  {group.title}
                </h3>
                <div className="mt-4 grid gap-3">
                  {group.links.map((link) => (
                    <FooterLink key={`${group.title}-${link.label}`} item={link} />
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-slate-100 pt-5 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>Copyright {new Date().getFullYear()} BrightPath. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Simple tools for focused hiring and job discovery.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
