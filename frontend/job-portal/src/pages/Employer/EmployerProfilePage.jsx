import { useEffect, useState } from "react";
import { Check, LogOut, Pencil, Save, Upload } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS, getAssetUrl as buildAssetUrl } from "../../utils/apiPaths";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  isEmployerProfileComplete,
  isValidAssetUrl,
  validateAvatar,
} from "../../utils/helper";

import DashboardLayout from "../../components/layout/DashboardLayout";
import EditProfileDetails from "./EditProfileDetails";
import BrandLogo from "../../components/BrandLogo";

/*
  Heading and type follow Manage jobs: pale panel, yellow-dot label,
  Bricolage Grotesque display, Hanken Grotesk body. Navy is for text only.
*/
const DISPLAY_FONT = {
  fontFamily: "'Bricolage Grotesque', 'Hanken Grotesk', system-ui, sans-serif",
};
const BODY_FONT = { fontFamily: "'Hanken Grotesk', system-ui, sans-serif" };

const inputClass =
  "min-h-11 w-full rounded-lg border border-[#0a1f6b]/15 bg-white px-4 text-sm text-[#0a1f6b] outline-none transition-colors placeholder:text-slate-400 hover:border-[#0a1f6b]/30 focus:border-[#1646e0] focus:ring-4 focus:ring-[#1646e0]/10";

const secondaryButton =
  "inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#0a1f6b]/20 bg-white px-5 text-sm font-semibold text-[#0a1f6b] transition-colors hover:bg-[#eef3ff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1646e0]";

const primaryButton =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#ffd23f] px-6 text-sm font-bold text-[#0a1f6b] transition-colors hover:bg-[#f5c400] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0a1f6b] disabled:cursor-not-allowed disabled:opacity-60";

/* ---------------------------------------------
   Building blocks
--------------------------------------------- */

const PageHeading = ({ label, title, description, action }) => (
  <section className="relative overflow-hidden rounded-2xl border border-[#0a1f6b]/10 bg-[#f5f8ff] px-6 py-7 sm:px-9 sm:py-9">
    <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-2xl">
        <div className="mb-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.13em] text-[#1646e0]">
          <span className="h-2 w-2 rounded-full bg-[#ffd23f]" />
          {label}
        </div>

        <h1
          style={DISPLAY_FONT}
          className="text-4xl font-bold leading-[1.05] tracking-normal text-[#0a1f6b] sm:text-5xl"
        >
          {title}
        </h1>

        <p className="mt-4 max-w-lg text-[15px] leading-6 text-slate-600">
          {description}
        </p>
      </div>

      {action}
    </div>

    <div className="pointer-events-none absolute -bottom-16 right-8 hidden h-56 w-56 rounded-full border-[32px] border-white/60 lg:block" />
    <div className="pointer-events-none absolute -bottom-8 right-32 hidden h-28 w-28 rounded-full bg-[#ffd23f]/20 lg:block" />
  </section>
);

const Field = ({ label, htmlFor, hint, children }) => (
  <div>
    <label
      htmlFor={htmlFor}
      className="mb-2 block text-sm font-semibold text-[#0a1f6b]"
    >
      {label}
    </label>
    {children}
    {hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
  </div>
);

/* Logo with scanner-style corner marks */
const LogoFrame = ({ src, size = "h-40 w-40" }) => (
  <div className={`relative p-3 ${size}`}>
    <span className="absolute left-0 top-0 h-4 w-4 border-l-2 border-t-2 border-[#1646e0]" />
    <span className="absolute right-0 top-0 h-4 w-4 border-r-2 border-t-2 border-[#1646e0]" />
    <span className="absolute bottom-0 left-0 h-4 w-4 border-b-2 border-l-2 border-[#1646e0]" />
    <span className="absolute bottom-0 right-0 h-4 w-4 border-b-2 border-r-2 border-[#1646e0]" />
    <img
      src={src}
      alt="Company logo"
      className="h-full w-full rounded-md bg-white object-cover"
    />
  </div>
);

const DetailRow = ({ label, value }) => (
  <div className="grid gap-1 px-6 py-5 sm:grid-cols-[170px_minmax(0,1fr)] sm:gap-6 sm:px-8">
    <dt className="text-sm font-medium text-slate-500">{label}</dt>
    <dd className="break-words text-[15px] font-semibold text-[#0a1f6b]">
      {value}
    </dd>
  </div>
);

const Spinner = () => (
  <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#0a1f6b] border-t-transparent" />
);

/* ---------------------------------------------
   Employer profile page
--------------------------------------------- */

const EmployerProfilePage = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    avatar: user?.avatar || "",
    companyName: user?.companyName || "",
    companyDescription: user?.companyDescription || "",
  });

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ ...profileData });
  const [avatarFile, setAvatarFile] = useState(null);
  const [imagePreview, setImagePreview] = useState({ avatar: "" });
  const [saving, setSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const getProfileAssetUrl = (url) => {
    if (!url) return "/default-logo.png";
    if (url.startsWith("blob:")) return "/default-logo.png";
    return buildAssetUrl(url);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const error = validateAvatar(file);
    if (error) {
      e.target.value = "";
      toast.error(error);
      return;
    }

    setAvatarFile(file);
    setImagePreview({ avatar: URL.createObjectURL(file) });
  };

  const handleSave = async () => {
    if (
      !formData.companyName?.trim() ||
      !formData.companyDescription?.trim() ||
      (!avatarFile && !isValidAssetUrl(formData.avatar))
    ) {
      toast.error("Company name, profile image, and description are required.");
      return;
    }

    setSaving(true);

    try {
      const payload = new FormData();
      payload.append("name", formData.name || "");
      payload.append("companyName", formData.companyName || "");
      payload.append("companyDescription", formData.companyDescription || "");
      if (avatarFile) payload.append("avatar", avatarFile);

      const response = await axiosInstance.put(
        API_PATHS.AUTH.UPDATE_PROFILE,
        payload,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.status === 200) {
        toast.success("Profile details updated successfully");
        setProfileData(response.data);
        setFormData(response.data);
        setAvatarFile(null);
        setImagePreview({ avatar: "" });
        updateUser(response.data);
        setEditMode(false);

        if (
          !isEmployerProfileComplete(user) &&
          isEmployerProfileComplete(response.data)
        ) {
          navigate("/employer-dashboard");
        }
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({ ...profileData });
    setAvatarFile(null);
    setImagePreview({ avatar: "" });
    setEditMode(false);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get(API_PATHS.AUTH.GET_PROFILE);
        const nextProfile = {
          name: res.data.name || "",
          email: res.data.email || "",
          avatar: res.data.avatar || "",
          companyName: res.data.companyName || "",
          companyDescription: res.data.companyDescription || "",
        };
        setProfileData(nextProfile);
        setFormData(nextProfile);
        setImagePreview({ avatar: "" });
        setAvatarFile(null);
        updateUser(res.data);
      } catch {
        toast.error("Could not load profile details");
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
    // updateUser is intentionally omitted because it is not memoized in AuthContext.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const profileComplete = isEmployerProfileComplete(profileData);

  const setupSteps = [
    {
      label: "Company logo",
      done: Boolean(avatarFile || isValidAssetUrl(formData.avatar)),
    },
    { label: "Company name", done: Boolean(formData.companyName?.trim()) },
    {
      label: "Company description",
      done: Boolean(formData.companyDescription?.trim()),
    },
  ];
  const setupProgress = setupSteps.filter((step) => step.done).length;

  if (loadingProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f8ff]">
        <p className="font-medium text-slate-600">Loading company profile...</p>
      </div>
    );
  }

  /* ---------- First-time setup ---------- */
  if (!profileComplete) {
    const setupImage =
      imagePreview.avatar || getProfileAssetUrl(formData.avatar);

    return (
      <div style={BODY_FONT} className="min-h-screen bg-white text-[#0a1f6b]">
        <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <BrandLogo />
          <button type="button" onClick={logout} className={secondaryButton}>
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </header>

        <main className="mx-auto w-full max-w-6xl space-y-7 px-4 pb-16 pt-2 sm:px-6 lg:px-8">
          <PageHeading
            label="Company setup"
            title={
              <>
                Introduce your
                <br className="hidden sm:block" /> company.
              </>
            }
            description="Candidates see these details on every job you post. Complete all three to open your dashboard."
          />

          <div className="grid gap-7 lg:grid-cols-[340px_minmax(0,1fr)] lg:items-start">
            {/* Progress */}
            <section className="rounded-2xl border border-[#0a1f6b]/10 bg-white p-6">
              <div className="flex items-baseline justify-between">
                <h2
                  style={DISPLAY_FONT}
                  className="text-xl font-bold text-[#0a1f6b]"
                >
                  Your progress
                </h2>
                <p className="text-sm font-semibold text-slate-500">
                  {setupProgress} of 3
                </p>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-1.5">
                {setupSteps.map((step) => (
                  <span
                    key={step.label}
                    className={`h-1.5 rounded-full transition-colors ${
                      step.done ? "bg-[#ffd23f]" : "bg-[#0a1f6b]/10"
                    }`}
                  />
                ))}
              </div>

              <ol className="mt-5 divide-y divide-[#0a1f6b]/10">
                {setupSteps.map((step) => (
                  <li
                    key={step.label}
                    className="flex items-center gap-3 py-3.5"
                  >
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                        step.done
                          ? "bg-[#ffd23f] text-[#0a1f6b]"
                          : "border-2 border-[#0a1f6b]/20"
                      }`}
                    >
                      {step.done && (
                        <Check className="h-3.5 w-3.5" strokeWidth={3} />
                      )}
                    </span>
                    <span
                      className={`flex-1 text-[15px] ${
                        step.done
                          ? "font-semibold text-[#0a1f6b]"
                          : "text-slate-600"
                      }`}
                    >
                      {step.label}
                    </span>
                    <span className="text-xs font-medium text-slate-400">
                      {step.done ? "Done" : "Required"}
                    </span>
                  </li>
                ))}
              </ol>
            </section>

            {/* Form */}
            <section className="overflow-hidden rounded-2xl border border-[#0a1f6b]/10 bg-white">
              <header className="border-b border-[#0a1f6b]/10 px-6 py-5 sm:px-8">
                <h2
                  style={DISPLAY_FONT}
                  className="text-2xl font-bold text-[#0a1f6b]"
                >
                  Company details
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Keep it short, clear and candidate friendly.
                </p>
              </header>

              <div className="space-y-6 p-6 sm:p-8">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                  <LogoFrame src={setupImage} size="h-32 w-32" />
                  <div>
                    <label className={secondaryButton}>
                      <Upload className="h-4 w-4" />
                      Upload logo
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                    <p className="mt-2 text-xs text-slate-500">
                      JPG, PNG or WebP, up to 5MB.
                    </p>
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Contact name" htmlFor="setup-name">
                    <input
                      id="setup-name"
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      className={inputClass}
                      placeholder="Your name"
                    />
                  </Field>

                  <Field label="Company name" htmlFor="setup-company">
                    <input
                      id="setup-company"
                      type="text"
                      value={formData.companyName}
                      onChange={(e) =>
                        handleInputChange("companyName", e.target.value)
                      }
                      className={inputClass}
                      placeholder="Company name"
                    />
                  </Field>
                </div>

                <Field label="Company description" htmlFor="setup-description">
                  <textarea
                    id="setup-description"
                    value={formData.companyDescription}
                    onChange={(e) =>
                      handleInputChange("companyDescription", e.target.value)
                    }
                    className={`${inputClass} min-h-40 resize-none py-3 leading-6`}
                    placeholder="What do you build, who do you serve, and why should candidates want to join?"
                  />
                </Field>

                <div className="flex justify-end border-t border-[#0a1f6b]/10 pt-6">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className={primaryButton}
                  >
                    {saving ? <Spinner /> : <Save className="h-4 w-4" />}
                    {saving ? "Saving..." : "Complete setup"}
                  </button>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    );
  }

  /* ---------- Edit mode ---------- */
  if (editMode) {
    return (
      <EditProfileDetails
        formData={formData}
        imagePreview={imagePreview}
        handleImageChange={handleImageChange}
        handleInputChange={handleInputChange}
        handleSave={handleSave}
        handleCancel={handleCancel}
        saving={saving}
      />
    );
  }

  /* ---------- Normal view ---------- */
  return (
    <DashboardLayout activeMenu="company-profile">
      {user && (
        <div
          style={BODY_FONT}
          className="mx-auto w-full max-w-[1440px] space-y-7 pb-12"
        >
          <PageHeading
            label="Company workspace"
            title={
              <>
                Your company,
                <br className="hidden sm:block" /> as candidates see it.
              </>
            }
            description="This is what appears on every job you publish. Keep it accurate and up to date."
            action={
              <button
                type="button"
                onClick={() => setEditMode(true)}
                className={`${primaryButton} self-start lg:self-auto`}
              >
                <Pencil className="h-4 w-4" />
                Edit profile
              </button>
            }
          />

          <section className="overflow-hidden rounded-2xl border border-[#0a1f6b]/10 bg-white">
            <div className="grid lg:grid-cols-[340px_minmax(0,1fr)]">
              {/* Identity */}
              <div className="border-b border-[#0a1f6b]/10 p-6 sm:p-8 lg:border-b-0 lg:border-r">
                <LogoFrame src={getProfileAssetUrl(profileData.avatar)} />

                <h2
                  style={DISPLAY_FONT}
                  className="mt-7 break-words text-3xl font-bold leading-tight text-[#0a1f6b]"
                >
                  {profileData.companyName || "Company profile"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">Employer account</p>

                <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#187447]">
                  <span className="relative flex h-2.5 w-2.5 items-center justify-center rounded-full bg-[#22965b]">
                    <span className="absolute h-2.5 w-2.5 animate-ping rounded-full bg-[#22965b]/30" />
                  </span>
                  Visible on your job posts
                </span>
              </div>

              {/* Content */}
              <div className="min-w-0">
                <div className="p-6 sm:p-8">
                  <h3
                    style={DISPLAY_FONT}
                    className="text-xl font-bold text-[#0a1f6b]"
                  >
                    About the company
                  </h3>

                  {profileData.companyDescription ? (
                    <p className="mt-3 max-w-[68ch] whitespace-pre-line text-[15px] leading-7 text-slate-700">
                      {profileData.companyDescription}
                    </p>
                  ) : (
                    <p className="mt-3 text-sm text-slate-500">
                      No description added yet.
                    </p>
                  )}
                </div>

                <dl className="divide-y divide-[#0a1f6b]/10 border-t border-[#0a1f6b]/10 bg-[#fafbfe]">
                  <DetailRow
                    label="Contact name"
                    value={profileData.name || "Not provided"}
                  />
                  <DetailRow
                    label="Company name"
                    value={profileData.companyName || "Not provided"}
                  />
                  <DetailRow label="Email address" value={profileData.email} />
                </dl>
              </div>
            </div>
          </section>
        </div>
      )}
    </DashboardLayout>
  );
};

export default EmployerProfilePage;