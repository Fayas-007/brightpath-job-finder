import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import BrandLogo from "../../../components/BrandLogo";

const Header = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const dashboardPath =
    user?.role === "admin"
      ? "/admin-dashboard"
      : user?.role === "employer"
      ? "/employer-dashboard"
      : "/find-jobs";

  const navItems = [
    { label: "Home", href: "#home" },
    { label: "Features", href: "#features" },
  ];

  const handleNav = (href) => {
    setMobileOpen(false);
    const target = document.querySelector(href);
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/20 bg-white/85 shadow-sm backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <BrandLogo as="button" onClick={() => handleNav("#home")} />

          <nav className="hidden items-center gap-8 md:flex">
            {navItems.map((item) => (
              <button
                key={item.href}
                type="button"
                onClick={() => handleNav(item.href)}
                className="text-sm font-semibold text-slate-600 transition-colors hover:text-slate-950"
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="max-w-40 truncate text-sm font-medium text-slate-600">
                  {user?.name || user?.fullName || "Welcome"}
                </span>
                <button
                  onClick={() => navigate(dashboardPath)}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-100 transition-all hover:bg-blue-700"
                >
                  Dashboard
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => navigate("/login")}
                  className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate("/signup")}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700"
                >
                  Get Started
                </button>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 md:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="border-t border-slate-100 py-4 md:hidden">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <button
                  key={item.href}
                  type="button"
                  onClick={() => handleNav(item.href)}
                  className="rounded-lg px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  {item.label}
                </button>
              ))}
              <button
                onClick={() => {
                  setMobileOpen(false);
                  navigate(isAuthenticated ? dashboardPath : "/login");
                }}
                className="mt-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-blue-100"
              >
                {isAuthenticated ? "Dashboard" : "Login"}
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
