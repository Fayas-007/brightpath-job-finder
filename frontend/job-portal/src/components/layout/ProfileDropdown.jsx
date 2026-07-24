import { Building2, ChevronDown, LogOut, UserRound } from "lucide-react";
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
}) => {
  const navigate = useNavigate();
  const initials = (companyName || email || "U").charAt(0).toUpperCase();
  const avatarUrl = getAssetUrl(avatar);
  const isEmployer = userRole === "employer" || userRole === "recruiter";
  const ProfileIcon = isEmployer ? Building2 : UserRound;
  const profileLabel = isEmployer ? "Company Profile" : "View Profile";

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={onToggle}
        className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-2 py-2 shadow-sm transition-colors hover:bg-slate-50"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Avatar"
            className="h-9 w-9 rounded-lg object-cover"
          />
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-sm font-black text-blue-700">
            {initials}
          </div>
        )}
        <div className="hidden max-w-36 text-left sm:block">
          <p className="truncate text-sm font-bold text-slate-950">
            {companyName || "User"}
          </p>
          <p className="text-xs font-medium text-slate-500">
            {roleLabels[userRole] || "Member"}
          </p>
        </div>
        <ChevronDown className="h-4 w-4 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl">
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="truncate text-sm font-bold text-slate-950">
              {companyName || "User"}
            </p>
            <p className="truncate text-xs text-slate-500">{email}</p>
          </div>

          <button
            type="button"
            onClick={() => {
              onClose?.();
              navigate(profilePathByRole[userRole] || "/profile");
            }}
            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            <ProfileIcon className="h-4 w-4 text-slate-400" />
            {profileLabel}
          </button>

          <button
            type="button"
            onClick={() => {
              onClose?.();
              onLogout();
            }}
            className="flex w-full items-center gap-3 border-t border-slate-100 px-4 py-3 text-left text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
