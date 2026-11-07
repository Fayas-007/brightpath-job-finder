import { useEffect, useRef, useState } from "react";
import { LogOut, Menu, X } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { NAVIGATION_MENU } from "../../utils/data";
import ProfileDropdown from "./ProfileDropdown";
import NotificationBell from "./NotificationBell";
import Footer from "../../pages/LandingPage/components/Footer";
import BrandLogo from "../BrandLogo";

const NavigationItem = ({ item, isActive, onClick }) => {
  const Icon = item.icon;

  return (
    <button
      type="button"
      onClick={() => onClick(item)}
      aria-current={isActive ? "page" : undefined}
      className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition-all ${
        isActive
          ? "bg-blue-600 text-white shadow-sm shadow-blue-100"
          : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"
      }`}
    >
      {Icon && <Icon className="h-5 w-5 flex-shrink-0" />}
      <span className="truncate">{item.name}</span>
    </button>
  );
};

const DashboardLayout = ({ activeMenu, children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

  const profileDropdownRef = useRef(null);

  // Normalize paths so trailing slashes do not affect active states.
  const normalizePath = (path = "") =>
    path.replace(/\/+$/, "") || "/";

  const currentPath = normalizePath(location.pathname);

  // Resolve the active sidebar item from the current route.
  const routeActiveItem = NAVIGATION_MENU.find((item) => {
    const itemPath = normalizePath(
      item.path || item.href || `/${item.id}`
    );

    return (
      currentPath === itemPath ||
      currentPath.startsWith(`${itemPath}/`)
    );
  });

  // Use the route when available; otherwise fall back to activeMenu.
  const activeItem =
    routeActiveItem ||
    NAVIGATION_MENU.find((item) => item.id === activeMenu);

  const activeNavItem = activeItem?.id || activeMenu || "dashboard";

  // Responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;

      setIsMobile(mobile);

      if (!mobile) {
        setSidebarOpen(false);
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Welcome message
  useEffect(() => {
    setShowWelcome(true);

    const timer = window.setTimeout(() => {
      setShowWelcome(false);
    }, 15000);

    return () => window.clearTimeout(timer);
  }, [user?._id]);

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileDropdownOpen &&
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target)
      ) {
        setProfileDropdownOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [profileDropdownOpen]);

  // Close mobile sidebar and profile dropdown after route changes.
  useEffect(() => {
    setSidebarOpen(false);
    setProfileDropdownOpen(false);
  }, [location.pathname]);

  // Navigation
  const handleNavigation = (item) => {
    const destination = item.path || item.href || `/${item.id}`;

    navigate(destination);

    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const roleBackgroundClass =
    user?.role === "admin"
      ? "app-background-admin"
      : user?.role === "employer" || user?.role === "recruiter"
      ? "app-background-employer"
      : "app-background-jobseeker";

  const roleLabel =
    user?.role === "admin"
      ? "Admin workspace"
      : user?.role === "employer" || user?.role === "recruiter"
      ? "Hiring workspace"
      : "Career workspace";

  return (
    <div className={`app-background ${roleBackgroundClass} text-slate-900`}>
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 transform border-r border-blue-100 bg-white/95 shadow-sm backdrop-blur-xl transition-transform duration-300 ${
          isMobile
            ? sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
            : "translate-x-0"
        }`}
      >
        <div className="flex h-16 items-center border-b border-slate-100 px-5">
          <BrandLogo />
        </div>

        <nav className="grid gap-2 p-4">
          {NAVIGATION_MENU.map((item) => (
            <NavigationItem
              key={item.id}
              item={item}
              isActive={activeNavItem === item.id}
              onClick={handleNavigation}
            />
          ))}
        </nav>

        <div className="absolute bottom-5 left-4 right-4">
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600"
            onClick={logout}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-blue-950/15 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div
        className={`flex min-h-screen flex-col ${
          isMobile ? "ml-0" : "ml-72"
        }`}
      >
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-blue-100 bg-white/90 px-4 shadow-sm backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            {isMobile && (
              <button
                type="button"
                onClick={() => setSidebarOpen((open) => !open)}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100"
                aria-label="Toggle sidebar"
              >
                {sidebarOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            )}

            {showWelcome ? (
              <div className="transition-opacity duration-300">
                <h1 className="text-base font-black text-slate-950 sm:text-lg">
                  Welcome back, {user?.name || "User"}
                </h1>

                <p className="hidden text-sm text-slate-500 sm:block">
                  Manage jobs, applications, and company details.
                </p>
              </div>
            ) : (
              <div className="transition-opacity duration-300">
                <h1 className="text-base font-black text-slate-950 sm:text-lg">
                  {activeItem?.name || roleLabel}
                </h1>

                <p className="hidden text-sm text-slate-500 sm:block">
                  {roleLabel}
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <NotificationBell />

            <ProfileDropdown
              isOpen={profileDropdownOpen}
              dropdownRef={profileDropdownRef}
              onClose={() => setProfileDropdownOpen(false)}
              onToggle={(e) => {
                e.stopPropagation();
                setProfileDropdownOpen((open) => !open);
              }}
              avatar={user?.avatar || ""}
              companyName={user?.name || ""}
              email={user?.email || ""}
              userRole={user?.role || ""}
              onLogout={logout}
            />
          </div>
        </header>

        {/* Page content */}
        <main className="min-h-[calc(100vh-4rem)] flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>

        {user?.role !== "admin" && <Footer />}
      </div>
    </div>
  );
};

export default DashboardLayout;
