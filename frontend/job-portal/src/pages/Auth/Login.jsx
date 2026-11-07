import BrandLogo from "../../components/BrandLogo";
import { useEffect, useState } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  validateEmail,
  isEmployerProfileComplete,
} from "../../utils/helper";
import { useAuth } from "../../context/AuthContext";
import { API_PATHS } from "../../utils/apiPaths";
import axiosInstance from "../../utils/axiosInstance";

const Login = () => {
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [formState, setFormState] = useState({
    loading: false,
    errors: {},
    showPassword: false,
  });

  const { loading, errors, showPassword } = formState;

  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");

    if (rememberedEmail) {
      setFormData((prev) => ({
        ...prev,
        email: rememberedEmail,
        rememberMe: true,
      }));
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setFormState((prev) => ({
      ...prev,
      errors: {
        ...prev.errors,
        [name]: "",
        submit: "",
      },
    }));
  };

  const validateForm = () => {
    const nextErrors = {};
    const emailError = validateEmail(formData.email);

    if (emailError) {
      nextErrors.email = emailError;
    }

    if (!formData.password) {
      nextErrors.password = "Password is required.";
    }

    setFormState((prev) => ({
      ...prev,
      errors: nextErrors,
    }));

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setFormState((prev) => ({
      ...prev,
      loading: true,
      errors: {},
    }));

    try {
      const response = await axiosInstance.post(
        API_PATHS.AUTH.LOGIN,
        {
          email: formData.email.trim(),
          password: formData.password,
        }
      );

      const { token, user } = response.data;

      if (!token || !user) {
        throw new Error(
          "The server did not return a valid login response."
        );
      }

      if (formData.rememberMe) {
        localStorage.setItem(
          "rememberedEmail",
          formData.email.trim()
        );
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      login(user, token, formData.rememberMe);

      // Redirect immediately after successful login
      if (user.role === "admin") {
        window.location.href = "/admin-dashboard";
      } else if (user.role === "employer") {
        window.location.href = isEmployerProfileComplete(user)
          ? "/employer-dashboard"
          : "/company-profile";
      } else {
        window.location.href = "/find-jobs";
      }
    } catch (error) {
      setFormState((prev) => ({
        ...prev,
        loading: false,
        errors: {
          submit:
            error.response?.data?.message ||
            error.message ||
            "Login failed. Please check your credentials.",
        },
      }));
    }
  };

  return (
    <div className="bp-login min-h-screen bg-white text-slate-900">
      <style>{`
        @keyframes bp-image-drift {
          from {
            transform: scale(1.02);
          }
          to {
            transform: scale(1.09);
          }
        }

        @keyframes bp-content-enter {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .bp-login-image {
          animation: bp-image-drift 24s ease-out forwards;
          will-change: transform;
        }

        .bp-login-enter {
          animation: bp-content-enter 650ms cubic-bezier(.2,.7,.2,1) both;
        }

        .bp-login-delay {
          animation-delay: 100ms;
        }

        .bp-login-input {
          transition:
            border-color 180ms ease,
            box-shadow 180ms ease;
        }

        .bp-login-input:focus-within {
          border-color: #60A5FA;
          box-shadow: 0 0 0 3px rgba(96,165,250,.16);
        }

        .bp-login-submit {
          transition:
            background-color 180ms ease,
            transform 180ms ease;
        }

        .bp-login-submit:hover:not(:disabled) {
          background-color: #2563EB;
        }

        .bp-login-submit:active:not(:disabled) {
          transform: scale(.99);
        }

        .bp-login-link {
          transition: color 160ms ease;
        }

        @media (prefers-reduced-motion: reduce) {
          .bp-login-image,
          .bp-login-enter {
            animation: none !important;
          }

          .bp-login-input,
          .bp-login-submit,
          .bp-login-link {
            transition: none !important;
          }
        }
      `}</style>

      <main className="grid min-h-screen lg:grid-cols-[1.12fr_.88fr]">

        {/* LEFT: LARGE PHOTOGRAPH */}
        <section className="relative hidden min-h-screen overflow-hidden bg-[#142338] lg:flex lg:flex-col lg:justify-between">
          <div
            className="bp-login-image absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2200&q=90')",
            }}
            aria-hidden="true"
          />

          <div
            className="absolute inset-0 bg-[#08182c]/45"
            aria-hidden="true"
          />

          <div
            className="absolute inset-0 bg-gradient-to-t from-[#08182c]/85 via-[#08182c]/10 to-[#08182c]/20"
            aria-hidden="true"
          />

          {/* BRAND: white-lettered logo, no background box */}
          <div className="bp-login-enter relative z-10 px-12 pt-10 xl:px-16 xl:pt-12 2xl:px-20">
            <BrandLogo />
          </div>

          {/* EDITORIAL CONTENT */}
          <div className="relative z-10 max-w-4xl px-12 pb-14 xl:px-16 xl:pb-20 2xl:px-20 2xl:pb-24">
            <div className="bp-login-enter mb-7 flex items-center gap-3">
              <span className="h-px w-12 bg-blue-400" />

              <span className="text-sm font-semibold uppercase tracking-[0.17em] text-blue-300">
                Careers & opportunities
              </span>
            </div>

            <h1 className="bp-login-enter text-5xl font-semibold leading-[1.1] tracking-[-0.04em] text-white xl:text-6xl 2xl:text-7xl">
              Find work that
              <br />
              moves you forward.
            </h1>

            <p className="bp-login-enter bp-login-delay mt-6 max-w-xl text-base leading-7 text-white/80 xl:text-lg xl:leading-8">
              Discover opportunities that match your skills and ambitions.
              Your next career move starts here.
            </p>

            <div className="mt-12 max-w-3xl border-t border-white/25 pt-6">
              <p className="text-base text-white/70 xl:text-lg">
                A better way to find your next opportunity.
              </p>
            </div>
          </div>
        </section>

        {/* RIGHT: LOGIN FORM */}
        <section className="flex min-h-screen items-center justify-center bg-white px-6 py-10 sm:px-10 lg:px-12 xl:px-16">
          <div className="bp-login-enter w-full max-w-[390px]">

            {/* MOBILE BRAND: real logo */}
            <div className="-mt-4 mb-12 flex justify-center lg:hidden">
              <BrandLogo className="[&_img]:h-20 sm:[&_img]:h-24" />
            </div>

            {/* FORM HEADING */}
            <header className="mb-8">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
                Your account
              </p>

              <h2 className="text-3xl font-semibold tracking-[-0.035em] text-slate-950 sm:text-[34px]">
                Sign in
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Welcome back. Enter your details to continue.
              </p>
            </header>

            {/* GENERAL ERROR */}
            {errors.submit && (
              <div
                role="alert"
                className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3.5 text-sm leading-6 text-red-700"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>{errors.submit}</p>
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
              noValidate
            >
              {/* EMAIL */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-slate-800"
                >
                  Email address
                </label>

                <div
                  className={`bp-login-input flex items-center rounded-lg border bg-white ${errors.email ? "border-red-400" : "border-slate-300"
                    }`}
                >
                  <Mail className="ml-3.5 h-[18px] w-[18px] shrink-0 text-slate-400" />

                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="name@example.com"
                    autoComplete="email"
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={
                      errors.email ? "bp-email-error" : undefined
                    }
                    className="w-full rounded-lg bg-transparent px-3 py-3.5 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  />
                </div>

                {errors.email && (
                  <p
                    id="bp-email-error"
                    role="alert"
                    className="mt-2 flex items-center gap-1.5 text-xs text-red-600"
                  >
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* PASSWORD */}
              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-slate-800"
                  >
                    Password
                  </label>

                  <Link
                    to="/forgot-password"
                    className="bp-login-link text-xs font-medium text-blue-600 hover:text-blue-800 sm:text-sm"
                  >
                    Forgot password?
                  </Link>
                </div>

                <div
                  className={`bp-login-input flex items-center rounded-lg border bg-white ${errors.password ? "border-red-400" : "border-slate-300"
                    }`}
                >
                  <Lock className="ml-3.5 h-[18px] w-[18px] shrink-0 text-slate-400" />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    aria-invalid={Boolean(errors.password)}
                    aria-describedby={
                      errors.password ? "bp-password-error" : undefined
                    }
                    className="w-full min-w-0 bg-transparent px-3 py-3.5 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setFormState((prev) => ({
                        ...prev,
                        showPassword: !prev.showPassword,
                      }))
                    }
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="mr-1.5 rounded-md p-2 text-slate-400 transition-colors hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-700/25"
                  >
                    {showPassword ? (
                      <EyeOff className="h-[17px] w-[17px]" />
                    ) : (
                      <Eye className="h-[17px] w-[17px]" />
                    )}
                  </button>
                </div>

                {errors.password && (
                  <p
                    id="bp-password-error"
                    role="alert"
                    className="mt-2 flex items-center gap-1.5 text-xs text-red-600"
                  >
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* KEEP ME SIGNED IN */}
              <label className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-slate-200 bg-slate-50/60 px-4 py-3 transition-colors hover:border-slate-300 has-[:checked]:border-blue-200 has-[:checked]:bg-blue-50/60">
                <span>
                  <span className="block text-sm font-medium text-slate-800">
                    Keep me signed in
                  </span>
                  <span className="mt-0.5 block text-xs text-slate-500">
                    Stay logged in on this device
                  </span>
                </span>

                <span className="relative inline-flex h-6 w-11 shrink-0">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    className="peer sr-only"
                  />
                  <span className="absolute inset-0 rounded-full bg-slate-300 transition-colors peer-checked:bg-blue-600 peer-focus-visible:ring-4 peer-focus-visible:ring-blue-500/25" />
                  <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
                </span>
              </label>

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={loading}
                className="bp-login-submit flex w-full items-center justify-center gap-2 rounded-lg bg-[#3B82F6] px-5 py-3.5 text-sm font-semibold text-white focus:outline-none focus:ring-4 focus:ring-blue-500/25 disabled:cursor-not-allowed disabled:opacity-65"
              >
                {loading ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              {/* SIGN UP */}
              <p className="pt-3 text-center text-sm text-slate-500">
                New to BrightPath?{" "}
                <Link
                  to="/signup"
                  className="bp-login-link font-semibold text-blue-600 hover:text-blue-800"
                >
                  Create an account
                </Link>
              </p>
            </form>

            {/* FOOTER */}
            <footer className="mt-12 border-t border-slate-200 pt-5 text-center text-xs text-slate-400">
              © {new Date().getFullYear()} BrightPath
            </footer>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Login;