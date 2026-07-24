import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Bookmark,
  BriefcaseBusiness,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Menu,
  Search,
  Settings,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import ProfileDropdown from "./ProfileDropdown";
import NotificationBell from "./NotificationBell";
import { getAssetUrl } from "../../utils/apiPaths";
import BrandLogo from "../BrandLogo";

const navByRole = {
  jobseeker: [
    { label: "Find Jobs", path: "/find-jobs", icon: Search },
    { label: "Applied Jobs", path: "/applied-jobs", icon: ClipboardList },
    { label: "Saved Jobs", path: "/saved-jobs", icon: Bookmark },
  ],
  employer: [
    { label: "Dashboard", path: "/employer-dashboard", icon: LayoutDashboard },
    { label: "Post Job", path: "/post-job", icon: BriefcaseBusiness },
    { label: "Applications", path: "/manage-jobs", icon: FileText },
    { label: "Company", path: "/company-profile", icon: Settings },
  ],
  recruiter: [
    { label: "Dashboard", path: "/employer-dashboard", icon: LayoutDashboard },
    { label: "Post Job", path: "/post-job", icon: BriefcaseBusiness },
    { label: "Applications", path: "/manage-jobs", icon: FileText },
    { label: "Company", path: "/company-profile", icon: Settings },
  ],
  admin: [
    { label: "Overview", path: "/admin-dashboard", icon: LayoutDashboard },
    { label: "Users", path: "/manage-users", icon: Users },
    { label: "Jobs", path: "/admin/manage-jobs", icon: BriefcaseBusiness },
    { label: "Applications", path: "/admin/manage-applications", icon: ClipboardList },
  ],
};

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef(null);
  const profileDropdownRef = useRef(null);

  const links = navByRole[user?.role] || [];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        mobileMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target)
      ) {
        setMobileMenuOpen(false);
      }

      if (
        profileDropdownOpen &&
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target)
      ) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileMenuOpen, profileDropdownOpen]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const getAvatarUrl = (avatar) => {
    return getAssetUrl(avatar);
  };

  const navLinkClass = (path) => {
    const isActive = location.pathname === path;

    return `inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-all ${
      isActive
        ? "bg-blue-600 text-white shadow-sm shadow-blue-100"
        : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"
    }`;
  };

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-xl">
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <BrandLogo className="min-w-[150px]" />

          <nav className="hidden items-center gap-1 lg:flex">
            {links.map((item) => (
              <Link key={item.path} to={item.path} className={navLinkClass(item.path)}>
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <NotificationBell />
                <ProfileDropdown
                  isOpen={profileDropdownOpen}
                  dropdownRef={profileDropdownRef}
                  onClose={() => setProfileDropdownOpen(false)}
                  onToggle={(e) => {
                    e.stopPropagation();
                    setProfileDropdownOpen(!profileDropdownOpen);
                  }}
                  avatar={getAvatarUrl(user?.avatar)}
                  companyName={user?.name || ""}
                  email={user?.email || ""}
                  userRole={user?.role || ""}
                  onLogout={logout}
                />
              </>
            ) : (
              <div className="hidden items-center gap-2 sm:flex">
                <Link
                  to="/login"
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
                >
                  Get Started
                </Link>
              </div>
            )}

            <button
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 transition-colors hover:bg-slate-100 lg:hidden"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div
            ref={mobileMenuRef}
            className="border-t border-slate-100 py-4 lg:hidden"
          >
            <div className="grid gap-2">
              {links.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={navLinkClass(item.path)}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}

              {!isAuthenticated && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate("/login");
                  }}
                  className="rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-blue-100"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
