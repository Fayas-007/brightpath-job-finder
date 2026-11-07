import {
  Building2,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  UserRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getAssetUrl } from "../../utils/apiPaths";

const roleLabels = {
  admin: "Admin",
  employer: "Employer",
  recruiter: "Employer",
  jobseeker: "Job Seeker",
};

const profilePathByRole = {
  admin: "/admin-dashboard",
  employer: "/company-profile",
  recruiter: "/company-profile",
  jobseeker: "/profile",
};

/*
  Two looks, one component.
  classic  employer + job seeker sides, matches the navbar and notification bell
  console  admin side: flat, bordered, mono labels (unchanged)
*/
const THEMES = {
  classic: {
    // Same height (h-11), glass fill and radius as the notification bell
    trigger:
      "flex h-11 items-center gap-3 rounded-xl border border-[#0a1f6b]/15 bg-white/60 shadow-[0_1px_2px_rgba(10,31,107,0.08)] transition-colors hover:bg-white/85 py-1 pl-1 pr-2.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1646e0]",
    avatar: "h-8 w-8 rounded-lg",
    avatarFallback:
      "flex h-8 w-8 items-center justify-center rounded-lg bg-[#dbe6ff] text-sm font-bold text-[#0a1f6b]",
    name: "truncate text-sm font-semibold leading-tight text-[#0a1f6b]",
    role: "text-xs leading-tight text-slate-500",
    chevron: "text-[#0a1f6b]",
    menu: "absolute right-0 top-14 z-50 w-64 overflow-hidden rounded-2xl border border-[#0a1f6b]/10 bg-white shadow-[0_24px_48px_-16px_rgba(10,31,107,0.35)]",
    menuHeader: "bg-[#1646e0] px-4 py-3",
    menuName: "truncate text-sm font-semibold text-white",
    menuEmail: "truncate text-xs text-white/80",
    // Small yellow role tag, the same accent used on the navbar buttons
    menuRole:
      "mb-1.5 inline-block rounded-full bg-[#ffd23f] px-2.5 py-0.5 text-[11px] font-bold leading-4 text-[#0a1f6b]",
    item: "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-[#0a1f6b] transition-colors hover:bg-[#eef3ff] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#1646e0]",
    itemIcon: "h-4 w-4 text-[#1646e0]",
    signOut:
      "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-red-600",
  },
  console: {
    trigger:
      "flex items-center gap-3 rounded-md border border-[#0f1115]/10 bg-white py-1 pl-1 pr-2.5 transition-colors hover:bg-[#ececef] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1646e0]",
    avatar: "h-8 w-8 rounded-md",
    avatarFallback:
      "flex h-8 w-8 items-center justify-center rounded-md bg-[#0f1115] font-mono text-sm font-bold text-white",
    name: "truncate text-sm font-bold leading-tight text-[#0f1115]",
    role: "font-mono text-[10px] font-bold uppercase leading-tight tracking-[0.14em] text-zinc-500",
    chevron: "text-zinc-500",
    menu: "absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-md border border-[#0f1115]/10 bg-white shadow-[0_12px_32px_rgba(15,17,21,0.14)]",
    menuHeader: "border-l-4 border-[#5b8cff] bg-[#0f1115] px-4 py-3.5",
    menuName: "truncate text-sm font-bold text-white",
    menuEmail: "truncate font-mono text-[11px] text-white/60",
    menuRole:
      "mb-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#8fb0ff]",
    item: "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-semibold text-[#0f1115] transition-colors hover:bg-[#f4f4f5] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#1646e0]",
    itemIcon: "h-4 w-4 text-[#1646e0]",
    signOut:
      "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-semibold text-[#c8412f] transition-colors hover:bg-[#c8412f]/10 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#c8412f]",
  },
};

const ProfileDropdown = ({
  isOpen,
  onToggle,
  onClose,
  dropdownRef,
  avatar,
  companyName,
  email,
  onLogout,
  userRole,
  variant = "classic",
}) => {
  const navigate = useNavigate();
  const theme = THEMES[variant] || THEMES.classic;

  const initials = (companyName || email || "U").charAt(0).toUpperCase();
  const avatarUrl = getAssetUrl(avatar);
  const isEmployer = userRole === "employer" || userRole === "recruiter";
  const isAdmin = userRole === "admin";

  // Admins have no profile page: their "profile" link goes to the dashboard.
  const showDashboardLink = variant === "console" && isAdmin;
  const ProfileIcon = showDashboardLink
    ? LayoutDashboard
    : isEmployer
    ? Building2
    : UserRound;
  const profileLabel = showDashboardLink
    ? "Dashboard"
    : isEmployer
    ? "Company Profile"
    : "View Profile";

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className={theme.trigger}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Avatar"
            className={`${theme.avatar} object-cover`}
          />
        ) : (
          <div className={theme.avatarFallback}>{initials}</div>
        )}

        <div className="hidden max-w-36 text-left sm:block">
          <p className={theme.name}>{companyName || "User"}</p>
          <p className={theme.role}>{roleLabels[userRole] || "Member"}</p>
        </div>

        <ChevronDown
          className={`h-4 w-4 transition-transform ${theme.chevron} ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div role="menu" className={theme.menu}>
          <div className={theme.menuHeader}>
            {theme.menuRole && (
              <p className={theme.menuRole}>
                {roleLabels[userRole] || "Member"}
              </p>
            )}
            <p className={theme.menuName}>{companyName || "User"}</p>
            <p className={theme.menuEmail}>{email}</p>
          </div>

          <div className="p-2">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                onClose?.();
                navigate(profilePathByRole[userRole] || "/profile");
              }}
              className={theme.item}
            >
              <ProfileIcon className={theme.itemIcon} />
              {profileLabel}
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={() => {
                onClose?.();
                onLogout();
              }}
              className={theme.signOut}
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;