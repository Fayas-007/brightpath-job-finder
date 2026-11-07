import { ArrowUp, Mail } from "lucide-react";
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
        { label: "Contact support", href: "mailto:fayasshibly007@gmail.com" },
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
        { label: "Applied jobs", path: "/applied-jobs" },
        { label: "Saved jobs", path: "/saved-jobs" },
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
        { label: "Contact support", href: "mailto:fayasshibly007@gmail.com" },
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
        { label: "Contact support", href: "mailto:fayasshibly007@gmail.com" },
        { label: "Hiring help", path: "/employer-dashboard" },
        { label: "Privacy", path: "/company-profile" },
      ],
    },
  ],
};

const footerCopy = {
  public:
    "BrightPath keeps job discovery, hiring workflows, and applications clear from the first search to the final decision.",
  jobseeker:
    "Return to your search and keep your profile ready from one clean workspace.",
  employer:
    "Post roles, review candidates, and keep company details ready for the people you want to reach.",
};

const linkClass =
  "w-fit rounded-sm text-[15px] text-slate-600 transition-colors hover:text-[#1646e0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1646e0]";

const FooterLink = ({ item }) =>
  item.href ? (
    <a href={item.href} className={linkClass}>
      {item.label}
    </a>
  ) : (
    <Link to={item.path} className={linkClass}>
      {item.label}
    </Link>
  );

const Footer = () => {
  const { user, isAuthenticated } = useAuth();

  const role =
    isAuthenticated && (user?.role === "employer" || user?.role === "recruiter")
      ? "employer"
      : isAuthenticated && user?.role === "jobseeker"
      ? "jobseeker"
      : "public";

  const groups = footerGroups[role];

  return (
    <footer className="border-t border-[#0a1f6b]/10 bg-white text-[#0a1f6b]">
      <div className="mx-auto max-w-[1920px] px-6 sm:px-10 lg:px-16 xl:px-24">
        {/* Main */}
        <div className="grid gap-12 py-14 lg:grid-cols-12 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-4">
            <div className="py-2">
              <BrandLogo />
            </div>

            <p className="mt-4 max-w-sm text-[15px] leading-7 text-slate-600">
              {footerCopy[role]}
            </p>

            <a
              href="mailto:support@brightpath.lk"
              className="mt-6 inline-flex items-center gap-2.5 rounded-sm text-sm font-semibold text-[#0a1f6b] transition-colors hover:text-[#1646e0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1646e0]"
            >
              <Mail className="h-4 w-4" />
              support@brightpath.lk
            </a>
          </div>

          {/* Link columns */}
          <nav
            aria-label="Footer"
            className="grid gap-10 sm:grid-cols-3 sm:gap-0 lg:col-span-8"
          >
            {groups.map((group, index) => (
              <div
                key={group.title}
                className="border-t border-[#0a1f6b]/10 pt-6 sm:border-l sm:border-t-0 sm:px-8 sm:pt-0"
              >
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-[11px] tracking-[0.18em] text-[#1646e0]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-[#0a1f6b]">
                    {group.title}
                  </h3>
                </div>

                <div className="mt-6 grid gap-3.5">
                  {group.links.map((link) => (
                    <FooterLink
                      key={`${group.title}-${link.label}`}
                      item={link}
                    />
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col gap-4 border-t border-[#0a1f6b]/10 py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-xs tracking-wide text-slate-500">
            © {new Date().getFullYear()} BrightPath. All rights reserved.
          </p>

          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="inline-flex w-fit items-center gap-2 rounded-sm font-mono text-xs uppercase tracking-[0.16em] text-slate-500 transition-colors hover:text-[#1646e0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1646e0]"
          >
            Back to top
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;