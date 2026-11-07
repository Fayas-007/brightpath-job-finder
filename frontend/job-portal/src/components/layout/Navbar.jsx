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
    {
      label: "Applications",
      path: "/admin/manage-applications",
      icon: ClipboardList,
    },
  ],
};

// Normalize paths to handle trailing slashes.
const normalizePath = (path) => path.replace(/\/+$/, "") || "/";

// Check exact routes and their nested routes.
const isRouteActive = (currentPath, targetPath) => {
  const current = normalizePath(currentPath);
  const target = normalizePath(targetPath);

  return current === target || current.startsWith(`${target}/`);
};

/*
  transparent: use on pages that start with a hero image.
  At the top of the page the bar is a light, mostly see-through white tint with
  blur, then becomes the normal frosted white bar once you scroll.
*/
const Navbar = ({ transparent = false }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Attached to the whole header so the hamburger button counts as "inside".
  const headerRef = useRef(null);
  const profileDropdownRef = useRef(null);

  const links = navByRole[user?.role?.toLowerCase()] || [];

  // True only while the bar sits over the hero at the top of the page.
  const overlay = transparent && !scrolled && !mobileMenuOpen;

  // Track scroll so the transparent bar becomes readable over page content.
  useEffect(() => {
    if (!transparent) return undefined;

    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [transparent]);

  // Close menus when navigating to another page.
  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  }, [location.pathname]);

  // Handle clicks outside the menus.
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        mobileMenuOpen &&
        headerRef.current &&
        !headerRef.current.contains(event.target)
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

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [mobileMenuOpen, profileDropdownOpen]);

  // Close menus using Escape.
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const getAvatarUrl = (avatar) => getAssetUrl(avatar);

  const navLinkClass = (path) => {
    const isActive = isRouteActive(location.pathname, path);

    return `inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[15px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1646e0] ${
      isActive
        ? "bg-[#1646e0] text-white"
        : "text-[#0a1f6b]/75 hover:bg-[#eef3ff] hover:text-[#0a1f6b]"
    }`;
  };

  const headerClass = overlay
    ? "bg-white/40 backdrop-blur-md backdrop-saturate-150"
    : mobileMenuOpen
    ? "bg-white/90 backdrop-blur-xl backdrop-saturate-150"
    : "bg-white/55 backdrop-blur-xl backdrop-saturate-150";

  return (
    <header
      ref={headerRef}
      className={`fixed left-0 right-0 top-0 z-50 transition-colors duration-300 ${headerClass}`}
    >
      <div className="mx-auto max-w-[1920px] px-6 sm:px-10 lg:px-16 xl:px-24">
        <div className="flex h-16 items-center justify-between gap-4">
          <BrandLogo />

          {/* Desktop navigation */}
          <nav className="hidden items-center gap-1.5 lg:flex">
            {links.map((item) => {
              const active = isRouteActive(location.pathname, item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={navLinkClass(item.path)}
                  aria-current={active ? "page" : undefined}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            {isAuthenticated ? (
              <>
                <NotificationBell />

                <ProfileDropdown
                  isOpen={profileDropdownOpen}
                  dropdownRef={profileDropdownRef}
                  onClose={() => setProfileDropdownOpen(false)}
                  onToggle={(e) => {
                    e.stopPropagation();
                    setProfileDropdownOpen((open) => !open);
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
                  className="rounded-xl px-4 py-2.5 text-[15px] font-semibold text-[#0a1f6b] transition-colors hover:bg-[#eef3ff]"
                >
                  Login
                </Link>

                <Link
                  to="/signup"
                  className="rounded-xl border-2 border-[#0a1f6b] bg-[#ffd23f] px-5 py-2.5 text-[15px] font-bold text-[#0a1f6b] transition-colors hover:bg-[#f5c400]"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#0a1f6b]/15 bg-white/60 shadow-[0_1px_2px_rgba(10,31,107,0.08)] transition-colors hover:bg-white/85 text-[#0a1f6b] lg:hidden"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile navigation */}
        {mobileMenuOpen && (
          <div className="border-t border-[#0a1f6b]/10 py-4 lg:hidden">
            <div className="grid gap-2">
              {links.map((item) => {
                const active = isRouteActive(location.pathname, item.path);

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={navLinkClass(item.path)}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}

              {!isAuthenticated && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate("/login");
                    }}
                    className="rounded-xl px-4 py-3 text-sm font-semibold text-[#0a1f6b] hover:bg-[#eef3ff]"
                  >
                    Login
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate("/signup");
                    }}
                    className="rounded-xl border-2 border-[#0a1f6b] bg-[#ffd23f] px-4 py-3 text-sm font-bold text-[#0a1f6b]"
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;