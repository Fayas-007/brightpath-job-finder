
import { useState } from "react";
import BrandLogo from "../../components/BrandLogo";
import {
  User,
  Mail,
  Lock,
  Upload,
  Eye,
  EyeOff,
  UserCheck,
  Building2,
  CheckCircle,
  AlertCircle,
  Loader,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { Link } from "react-router-dom";

import {
  validateAvatar,
  validateEmail,
  validatePassword,
} from "../../utils/helper";

import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import uploadImage from "../../utils/uploadImage";
import { useAuth } from "../../context/AuthContext";

const SignUp = () => {
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "",
    avatar: null,
  });

  const [formState, setFormState] = useState({
    step: 1,
    loading: false,
    errors: {},
    showPassword: false,
    avatarPreview: null,
    success: false,
  });

  const {
    step,
    loading,
    errors,
    showPassword,
    avatarPreview,
    success,
  } = formState;

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
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

  const handleRoleChange = (role) => {
    setFormData((prev) => ({
      ...prev,
      role,
    }));

    setFormState((prev) => ({
      ...prev,
      errors: {
        ...prev.errors,
        role: "",
        submit: "",
      },
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const error = validateAvatar(file);

    if (error) {
      e.target.value = "";

      setFormData((prev) => ({
        ...prev,
        avatar: null,
      }));

      setFormState((prev) => ({
        ...prev,
        avatarPreview: null,
        errors: {
          ...prev.errors,
          avatar: error,
        },
      }));

      return;
    }

    setFormData((prev) => ({
      ...prev,
      avatar: file,
    }));

    const reader = new FileReader();

    reader.onload = (event) => {
      setFormState((prev) => ({
        ...prev,
        avatarPreview: event.target.result,
        errors: {
          ...prev.errors,
          avatar: "",
          submit: "",
        },
      }));
    };

    reader.readAsDataURL(file);
  };

  const validateRole = () => {
    const nextErrors = {};

    if (!formData.role) {
      nextErrors.role =
        "Please select whether you are a job seeker or employer.";
    }

    setFormState((prev) => ({
      ...prev,
      errors: {
        ...prev.errors,
        ...nextErrors,
        role: nextErrors.role || "",
        submit: "",
      },
    }));

    return Object.keys(nextErrors).length === 0;
  };

  const validateAccountDetails = () => {
    const nextErrors = {};

    if (!formData.fullName.trim()) {
      nextErrors.fullName = "Enter your full name.";
    }

    const emailError = validateEmail(formData.email);

    if (emailError) {
      nextErrors.email = emailError;
    }

    const passwordError = validatePassword(formData.password);

    if (passwordError) {
      nextErrors.password = passwordError;
    }

    setFormState((prev) => ({
      ...prev,
      errors: {
        ...prev.errors,
        fullName: nextErrors.fullName || "",
        email: nextErrors.email || "",
        password: nextErrors.password || "",
        submit: "",
      },
    }));

    return Object.keys(nextErrors).length === 0;
  };

  const handleContinue = (e) => {
    e.preventDefault();

    if (!validateRole()) return;

    setFormState((prev) => ({
      ...prev,
      step: 2,
      errors: {},
    }));
  };

  const handleBack = () => {
    if (loading) return;

    setFormState((prev) => ({
      ...prev,
      step: 1,
      errors: {},
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateAccountDetails()) return;

    setFormState((prev) => ({
      ...prev,
      loading: true,
      errors: {},
    }));

    try {
      let avatarUrl = "";

      if (formData.avatar) {
        const imgUploadRes = await uploadImage(formData.avatar);
        avatarUrl = imgUploadRes.imageUrl || "";
      }

      const response = await axiosInstance.post(
        API_PATHS.AUTH.REGISTER,
        {
          name: formData.fullName.trim(),
          email: formData.email.trim(),
          password: formData.password,
          role: formData.role,
          avatar: avatarUrl,
        }
      );

      const { token, user } = response.data;

      setFormState((prev) => ({
        ...prev,
        loading: false,
        success: true,
        errors: {},
      }));

      if (token) {
        login(user || response.data, token);

        setTimeout(() => {
          window.location.href =
            formData.role === "employer"
              ? "/company-profile"
              : "/find-jobs";
        }, 1200);
      } else {
        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
      }
    } catch (error) {
      setFormState((prev) => ({
        ...prev,
        loading: false,
        success: false,
        errors: {
          ...prev.errors,
          submit:
            error.response?.data?.message ||
            error.message ||
            "Registration failed. Please try again.",
        },
      }));
    }
  };

  const ErrorMessage = ({ message }) => {
    if (!message) return null;

    return (
      <p className="mt-2 flex items-start gap-1.5 text-xs leading-5 text-red-600">
        <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <span>{message}</span>
      </p>
    );
  };

  return (
    <div className="bp-signup min-h-screen bg-white text-slate-900">
      <style>{`
        @keyframes bp-signup-image {
          from { transform: scale(1.02); }
          to { transform: scale(1.09); }
        }

        @keyframes bp-signup-enter {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bp-signup-progress {
          from { width: 0; }
          to { width: 100%; }
        }

        .bp-signup-image {
          animation: bp-signup-image 24s ease-out forwards;
        }

        .bp-signup-enter {
          animation: bp-signup-enter 650ms cubic-bezier(.2,.7,.2,1) both;
        }

        .bp-signup-delay {
          animation-delay: 100ms;
        }

        .bp-signup-input {
          transition: border-color 180ms ease, box-shadow 180ms ease;
        }

        .bp-signup-input:focus-within {
          border-color: #60A5FA;
          box-shadow: 0 0 0 3px rgba(96,165,250,.16);
        }

        .bp-signup-button {
          transition: background-color 180ms ease, transform 180ms ease;
        }

        .bp-signup-button:hover:not(:disabled) {
          background-color: #2563EB;
        }

        .bp-signup-button:active:not(:disabled) {
          transform: scale(.99);
        }

        .bp-signup-progress {
          animation: bp-signup-progress 1200ms ease-in-out forwards;
        }

        @media (prefers-reduced-motion: reduce) {
          .bp-signup-image,
          .bp-signup-enter,
          .bp-signup-progress {
            animation: none !important;
          }

          .bp-signup-input,
          .bp-signup-button {
            transition: none !important;
          }
        }
      `}</style>

      {success ? (
        <main className="flex min-h-screen items-center justify-center bg-[#f7f8fa] px-5 py-10">
          <section className="bp-signup-enter w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 text-center sm:p-10">
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
              <CheckCircle className="h-7 w-7" strokeWidth={1.8} />
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Account created
            </h1>

            <p className="mt-3 break-words text-sm leading-6 text-slate-500">
              Your BrightPath account has been created successfully.
              We're preparing your account now.
            </p>

            <div className="mt-7 h-1 overflow-hidden rounded-full bg-slate-100">
              <div className="bp-signup-progress h-full rounded-full bg-emerald-600" />
            </div>

            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-500">
              <Loader className="h-4 w-4 animate-spin" />
              Redirecting you...
            </div>
          </section>
        </main>
      ) : (
        <main className="grid min-h-screen lg:grid-cols-[1.12fr_.88fr]">

          {/* LEFT PANEL — SAME DESIGN AS SIGN IN */}
          <section className="relative hidden min-h-screen overflow-hidden bg-[#142338] lg:flex lg:flex-col lg:justify-between">
            <div
              className="bp-signup-image absolute inset-0 bg-cover bg-center"
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

            <div className="bp-signup-enter relative z-10 px-12 pt-10 xl:px-16 xl:pt-12 2xl:px-20">
              <BrandLogo />
            </div>

            {/* SIGN UP EDITORIAL CONTENT */}
            <div className="relative z-10 max-w-4xl px-12 pb-14 xl:px-16 xl:pb-20 2xl:px-20 2xl:pb-24">

              <div className="bp-signup-enter mb-7 flex items-center gap-3">
                <span className="h-px w-12 bg-blue-400" />

                <span className="text-sm font-semibold uppercase tracking-[0.17em] text-blue-300">
                  Start something new
                </span>
              </div>

              <h1 className="bp-signup-enter text-5xl font-semibold leading-[1.1] tracking-[-0.04em] text-white xl:text-6xl 2xl:text-7xl">
                Create your path.
                <br />
                Shape what's next.
              </h1>

              <p className="bp-signup-enter bp-signup-delay mt-6 max-w-xl text-base leading-7 text-white/80 xl:text-lg xl:leading-8">
                Join a community of professionals and businesses.
                Find opportunities, connect with talent, and take
                your next step forward.
              </p>

              <div className="mt-12 max-w-3xl border-t border-white/25 pt-6">
                <p className="text-base text-white/70 xl:text-lg">
                  One profile. New possibilities.
                </p>
              </div>

            </div>
          </section>

          {/* RIGHT PANEL — SIGN UP */}
          <section className="flex min-h-screen items-center justify-center bg-white px-6 py-10 sm:px-10 lg:px-12 xl:px-16">
            <div
              key={step}
              className="bp-signup-enter w-full max-w-[390px]"
            >
              <div className="-mt-4 mb-10 flex justify-center lg:hidden">
                <BrandLogo className="[&_img]:h-20 sm:[&_img]:h-24" />
              </div>
              {/* STEP INDICATOR */}
              <div className="mb-7">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
                    Create your account
                  </p>

                  <span className="text-xs font-medium text-slate-500">
                    Step {step} of 2
                  </span>
                </div>

                <div className="mt-3 flex gap-2">
                  <div
                    className={`h-1 flex-1 rounded-full ${step >= 1 ? "bg-[#60A5FA]" : "bg-slate-200"
                      }`}
                  />

                  <div
                    className={`h-1 flex-1 rounded-full ${step >= 2 ? "bg-[#60A5FA]" : "bg-slate-200"
                      }`}
                  />
                </div>
              </div>

              {/* STEP 1 — ACCOUNT TYPE */}
              {step === 1 && (
                <>
                  <header className="mb-8">
                    <h2 className="text-3xl font-semibold tracking-[-0.035em] text-slate-950 sm:text-[34px]">
                      Create an account
                    </h2>

                    <p className="mt-3 text-sm leading-6 text-slate-500">
                      First, tell us how you plan to use BrightPath.
                    </p>
                  </header>

                  {errors.submit && (
                    <div
                      role="alert"
                      className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3.5 text-sm leading-6 text-red-700"
                    >
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                      <p>{errors.submit}</p>
                    </div>
                  )}

                  <form onSubmit={handleContinue} noValidate>
                    <fieldset>
                      <legend className="mb-3 text-sm font-medium text-slate-800">
                        I want to...
                      </legend>

                      <div className="space-y-3">
                        {/* JOB SEEKER */}
                        <button
                          type="button"
                          onClick={() => handleRoleChange("jobseeker")}
                          aria-pressed={formData.role === "jobseeker"}
                          className={`flex w-full items-start gap-4 rounded-lg border p-4 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-[#60A5FA]/25 ${formData.role === "jobseeker"
                            ? "border-[#60A5FA] bg-[#EFF6FF]"
                            : "border-slate-200 bg-white hover:border-slate-300"
                            }`}
                        >
                          <span
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${formData.role === "jobseeker"
                              ? "bg-[#3B82F6] text-white"
                              : "bg-slate-100 text-slate-600"
                              }`}
                          >
                            <UserCheck className="h-5 w-5" />
                          </span>

                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-semibold text-slate-900">
                              Find a job
                            </span>

                            <span className="mt-1 block text-sm leading-5 text-slate-500">
                              Discover opportunities and build your career.
                            </span>
                          </span>

                          <span
                            className={`mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${formData.role === "jobseeker"
                              ? "border-[#60A5FA]"
                              : "border-slate-300"
                              }`}
                          >
                            {formData.role === "jobseeker" && (
                              <span className="h-2 w-2 rounded-full bg-[#3B82F6]" />
                            )}
                          </span>
                        </button>

                        {/* EMPLOYER */}
                        <button
                          type="button"
                          onClick={() => handleRoleChange("employer")}
                          aria-pressed={formData.role === "employer"}
                          className={`flex w-full items-start gap-4 rounded-lg border p-4 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-[#60A5FA]/25 ${formData.role === "employer"
                            ? "border-[#60A5FA] bg-[#EFF6FF]"
                            : "border-slate-200 bg-white hover:border-slate-300"
                            }`}
                        >
                          <span
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${formData.role === "employer"
                              ? "bg-[#3B82F6] text-white"
                              : "bg-slate-100 text-slate-600"
                              }`}
                          >
                            <Building2 className="h-5 w-5" />
                          </span>

                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-semibold text-slate-900">
                              Hire talent
                            </span>

                            <span className="mt-1 block text-sm leading-5 text-slate-500">
                              Create a company profile and find candidates.
                            </span>
                          </span>

                          <span
                            className={`mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${formData.role === "employer"
                              ? "border-[#60A5FA]"
                              : "border-slate-300"
                              }`}
                          >
                            {formData.role === "employer" && (
                              <span className="h-2 w-2 rounded-full bg-[#3B82F6]" />
                            )}
                          </span>
                        </button>
                      </div>

                      <ErrorMessage message={errors.role} />
                    </fieldset>

                    <button
                      type="submit"
                      className="bp-signup-button mt-7 flex w-full items-center justify-center gap-2 rounded-lg bg-[#3B82F6] px-5 py-3.5 text-sm font-semibold text-white focus:outline-none focus:ring-4 focus:ring-blue-500/25"
                    >
                      Continue
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </form>

                  <p className="mt-5 text-center text-sm text-slate-500">
                    Already have an account?{" "}
                    <Link
                      to="/login"
                      className="font-semibold text-[#3B82F6] transition hover:text-[#2563EB] hover:underline"
                    >
                      Sign in
                    </Link>
                  </p>
                </>
              )}

              {/* STEP 2 — ACCOUNT DETAILS */}
              {step === 2 && (
                <>
                  <header className="mb-7">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900 focus:outline-none focus:underline"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back
                    </button>

                    <h2 className="text-3xl font-semibold tracking-[-0.035em] text-slate-950 sm:text-[34px]">
                      Your details
                    </h2>

                    <p className="mt-3 text-sm leading-6 text-slate-500">
                      {formData.role === "employer"
                        ? "Create your employer account to start finding talent."
                        : "Create your account to explore your next opportunity."}
                    </p>

                    <div className="mt-5 inline-flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600">
                      {formData.role === "employer" ? (
                        <Building2 className="h-4 w-4 text-[#3B82F6]" />
                      ) : (
                        <UserCheck className="h-4 w-4 text-[#3B82F6]" />
                      )}

                      {formData.role === "employer"
                        ? "Employer account"
                        : "Job seeker account"}

                      <button
                        type="button"
                        onClick={handleBack}
                        className="ml-1 font-semibold text-[#3B82F6] hover:underline"
                      >
                        Change
                      </button>
                    </div>
                  </header>

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
                    {/* FULL NAME */}
                    <div>
                      <label
                        htmlFor="fullName"
                        className="mb-2 block text-sm font-medium text-slate-800"
                      >
                        Full name
                      </label>

                      <div
                        className={`bp-signup-input flex items-center rounded-lg border bg-white ${errors.fullName
                          ? "border-red-300"
                          : "border-slate-300"
                          }`}
                      >
                        <User className="ml-3.5 h-4 w-4 shrink-0 text-slate-400" />

                        <input
                          id="fullName"
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          placeholder="Enter your full name"
                          autoComplete="name"
                          aria-invalid={Boolean(errors.fullName)}
                          aria-describedby={
                            errors.fullName ? "signup-name-error" : undefined
                          }
                          className="w-full rounded-lg bg-transparent px-3 py-3.5 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                        />
                      </div>

                      {errors.fullName && (
                        <p
                          id="signup-name-error"
                          className="mt-2 flex items-start gap-1.5 text-xs leading-5 text-red-600"
                        >
                          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                          {errors.fullName}
                        </p>
                      )}
                    </div>

                    {/* EMAIL */}
                    <div>
                      <label
                        htmlFor="signup-email"
                        className="mb-2 block text-sm font-medium text-slate-800"
                      >
                        Email address
                      </label>

                      <div
                        className={`bp-signup-input flex items-center rounded-lg border bg-white ${errors.email
                          ? "border-red-300"
                          : "border-slate-300"
                          }`}
                      >
                        <Mail className="ml-3.5 h-4 w-4 shrink-0 text-slate-400" />

                        <input
                          id="signup-email"
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="you@example.com"
                          autoComplete="email"
                          aria-invalid={Boolean(errors.email)}
                          aria-describedby={
                            errors.email ? "signup-email-error" : undefined
                          }
                          className="w-full rounded-lg bg-transparent px-3 py-3.5 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                        />
                      </div>

                      {errors.email && (
                        <p
                          id="signup-email-error"
                          className="mt-2 flex items-start gap-1.5 text-xs leading-5 text-red-600"
                        >
                          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                          {errors.email}
                        </p>
                      )}
                    </div>

                    {/* PASSWORD */}
                    <div>
                      <label
                        htmlFor="signup-password"
                        className="mb-2 block text-sm font-medium text-slate-800"
                      >
                        Password
                      </label>

                      <div
                        className={`bp-signup-input flex items-center rounded-lg border bg-white ${errors.password
                          ? "border-red-300"
                          : "border-slate-300"
                          }`}
                      >
                        <Lock className="ml-3.5 h-4 w-4 shrink-0 text-slate-400" />

                        <input
                          id="signup-password"
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="Create a password"
                          autoComplete="new-password"
                          aria-invalid={Boolean(errors.password)}
                          aria-describedby={
                            errors.password
                              ? "signup-password-error"
                              : undefined
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
                          className="mr-2 rounded-md p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#60A5FA]/25"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>

                      {errors.password && (
                        <p
                          id="signup-password-error"
                          className="mt-2 flex items-start gap-1.5 text-xs leading-5 text-red-600"
                        >
                          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                          {errors.password}
                        </p>
                      )}

                      <p className="mt-2 text-xs leading-5 text-slate-500">
                        Choose a strong password to help protect your account.
                      </p>
                    </div>

                    {/* OPTIONAL PROFILE PHOTO */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-800">
                        Profile photo{" "}
                        <span className="font-normal text-slate-400">
                          (optional)
                        </span>
                      </label>

                      <div className="flex items-center gap-4 rounded-lg border border-slate-200 p-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100">
                          {avatarPreview ? (
                            <img
                              src={avatarPreview}
                              alt="Profile preview"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <User className="h-5 w-5 text-slate-400" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-800">
                            {formData.avatar
                              ? formData.avatar.name
                              : "Upload a photo"}
                          </p>

                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            Choose an image for your profile.
                          </p>
                        </div>

                        <label className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">
                          <Upload className="h-3.5 w-3.5" />
                          Browse

                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            className="sr-only"
                          />
                        </label>
                      </div>

                      {errors.avatar && (
                        <ErrorMessage message={errors.avatar} />
                      )}
                    </div>

                    {/* SUBMIT */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="bp-signup-button flex w-full items-center justify-center gap-2 rounded-lg bg-[#3B82F6] px-5 py-3.5 text-sm font-semibold text-white focus:outline-none focus:ring-4 focus:ring-blue-500/25 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? (
                        <>
                          <Loader className="h-4 w-4 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        <>
                          Create account
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>

                    <p className="pt-1 text-center text-sm text-slate-500">
                      Already have an account?{" "}
                      <Link
                        to="/login"
                        className="font-semibold text-[#3B82F6] transition hover:text-[#2563EB] hover:underline"
                      >
                        Sign in
                      </Link>
                    </p>
                  </form>
                </>
              )}

              {/* FOOTER */}
              <div className="mt-8 flex items-center justify-center gap-2 border-t border-slate-200 pt-5 text-xs text-slate-400">
                <Lock className="h-3.5 w-3.5" />
                Your career journey, securely yours.
              </div>
            </div>
          </section>
        </main>
      )}
    </div>
  );
};

export default SignUp;
