import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  BriefcaseBusiness,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import ProfileDropdown from "./ProfileDropdown";
import NotificationBell from "./NotificationBell";
import AdminBackdrop from "./AdminBackdrop";
import brandLogo from "../../assets/brightpath-logo-dark.png";
import "../../styles/admin-motion.css";
/*
  Palette (admin: black and white, one blue accent shared with the other sides)
  Ink    #0f1115  sidebar, headings, primary buttons
  Page   #f4f4f5  background, white cards
  Blue   #1646e0  links, focus rings, employer tags
  Blue   #5b8cff  the same accent, lightened for dark surfaces
*/

const NAV_GROUPS = [
  {
    label: "Overview",
    items: [
      {
        id: "dashboard",
        name: "Dashboard",
        path: "/admin-dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: "Moderation",
    items: [
      {
        id: "users",
        name: "Users",
        path: "/manage-users",
        icon: Users,
        badgeKey: "users",
      },
      {
        id: "jobs",
        name: "Jobs",
        path: "/admin/manage-jobs",
        icon: BriefcaseBusiness,
        badgeKey: "jobs",
      },
      {
        id: "applications",
        name: "Applications",
        path: "/admin/manage-applications",
        icon: ClipboardList,
        badgeKey: "applications",
      },
    ],
  },
];

const normalizePath = (path = "") => path.replace(/\/+$/, "") || "/";

const isRouteActive = (currentPath, targetPath) => {
  const current = normalizePath(currentPath);
  const target = normalizePath(targetPath);

  return current === target || current.startsWith(`${target}/`);
};

const NavItem = ({ item, active, badge, onClick }) => {
  const Icon = item.icon;

  return (
    <button
      type="button"
      onClick={() => onClick(item.path)}
      aria-current={active ? "page" : undefined}
      className={`group relative flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5b8cff] ${active
          ? "bg-white/10 text-white"
          : "text-white/60 hover:bg-white/5 hover:text-white"
        }`}
    >
      <span
        className={`absolute -left-4 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-sm bg-[#5b8cff] transition-opacity duration-200 ${active ? "opacity-100" : "opacity-0"
          }`}
      />

      <Icon className="h-4 w-4 flex-shrink-0" />

      <span className="flex-1 truncate">{item.name}</span>

      {badge !== undefined && (
        <span className="font-mono text-[11px] tabular-nums text-white/50">
          {badge}
        </span>
      )}
    </button>
  );
};

const AdminLayout = ({ children, badges = {}, title = "Admin" }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef(null);

  // Close menus after a route change.
  useEffect(() => {
    setSidebarOpen(false);
    setProfileDropdownOpen(false);
  }, [location.pathname]);

  // Close profile dropdown on outside click or Escape.
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
        setSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [profileDropdownOpen]);

  const goTo = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  const activePage =
    NAV_GROUPS.flatMap((group) => group.items).find((item) =>
      isRouteActive(location.pathname, item.path)
    )?.id || "dashboard";

  return (
    <div className="min-h-screen bg-[#f4f4f5] text-[#0f1115]">
      <AdminBackdrop page={activePage} />

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 transform flex-col bg-[#0f1115] transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >

{/* Brand: sits directly on the black sidebar. */}
<div className="flex h-16 flex-shrink-0 items-center justify-between gap-3 border-b border-white/10 px-5">
  <button
    type="button"
    onClick={() => goTo("/admin-dashboard")}
    className="flex h-full items-center rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5b8cff]"
    aria-label="BrightPath admin home"
  >
    <img
  src={brandLogo}
  alt="BrightPath"
  className="h-12 w-auto max-w-full object-contain"
/>
  </button>

  <button
    type="button"
    onClick={() => setSidebarOpen(false)}
    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md text-white/60 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5b8cff] lg:hidden"
    aria-label="Close sidebar"
  >
    <X className="h-4 w-4" />
  </button>
</div>
        {/* Console label */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-3.5">
          <span className="rounded-sm border border-[#5b8cff]/40 bg-[#5b8cff]/15 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#8fb0ff]">
            Admin console
          </span>
        </div>

        <nav className="flex-1 space-y-7 overflow-y-auto px-4 py-6">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="mb-2 px-3 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">
                {group.label}
              </p>

              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <NavItem
                    key={item.id}
                    item={item}
                    active={isRouteActive(location.pathname, item.path)}
                    badge={item.badgeKey ? badges[item.badgeKey] : undefined}
                    onClick={goTo}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="mb-3 flex items-center gap-2.5 px-3">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#3fb27f] opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#3fb27f]" />
            </span>

            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-white/50">
              All systems normal
            </p>
          </div>

          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold text-white/60 transition-colors hover:bg-red-500/10 hover:text-red-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5b8cff]"
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            Log out
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#0f1115]/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <div className="relative z-10 flex min-h-screen flex-col lg:ml-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#0f1115]/10 bg-[#f4f4f5]/95 px-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-md border border-[#0f1115]/20 text-[#0f1115] hover:bg-[#ececef] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1646e0] lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu className="h-4 w-4" />
            </button>

            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-500">
              {title}
            </p>
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
              variant="console"
            />
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;