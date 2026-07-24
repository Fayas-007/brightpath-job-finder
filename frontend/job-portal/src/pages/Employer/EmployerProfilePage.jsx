import { useEffect, useState } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  Edit3,
  LogOut,
  Mail,
  Save,
  ShieldCheck,
  Upload,
} from "lucide-react";
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

      const response = await axiosInstance.put(API_PATHS.AUTH.UPDATE_PROFILE, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 200) {
        toast.success("Profile details updated successfully");
        setProfileData(response.data);
        setFormData(response.data);
        setAvatarFile(null);
        setImagePreview({ avatar: "" });
        updateUser(response.data);
        setEditMode(false);

        if (!isEmployerProfileComplete(user) && isEmployerProfileComplete(response.data)) {
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
  const setupProgress = [
    Boolean(formData.companyName?.trim()),
    Boolean(formData.companyDescription?.trim()),
    Boolean(avatarFile || isValidAssetUrl(formData.avatar)),
  ].filter(Boolean).length;

  if (loadingProfile) {
    return (
      <div className="app-background app-background-employer flex min-h-screen items-center justify-center">
        <p className="font-semibold text-slate-600">Loading company profile...</p>
      </div>
    );
  }

  if (!profileComplete) {
    const setupImage = imagePreview.avatar || getProfileAssetUrl(formData.avatar);

    return (
      <div className="app-background app-background-employer min-h-screen text-slate-900">
        <header className="employer-shell flex items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <BrandLogo />
          <button type="button" onClick={logout} className="employer-secondary-action px-3 py-2">
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </header>

        <main className="employer-shell grid min-h-[calc(100vh-84px)] items-center gap-6 px-4 pb-10 sm:px-6 lg:grid-cols-[0.82fr_1.18fr] lg:px-8">
          <section className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-100 bg-white/80 px-4 py-2 text-sm font-black text-teal-700 shadow-sm">
              <ShieldCheck className="h-4 w-4" />
              Employer setup
            </div>
            <div>
              <h1 className="max-w-xl text-4xl font-black leading-tight text-slate-950 md:text-5xl">
                Build your hiring identity first.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-slate-600">
                Add the company details candidates will see before you post a role. Your dashboard unlocks as soon as the profile is complete.
              </p>
            </div>

            <div className="employer-card max-w-xl p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-black text-slate-950">Setup progress</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {setupProgress} of 3 required details added
                  </p>
                </div>
                <span className="rounded-full bg-teal-50 px-3 py-1 text-sm font-black text-teal-700">
                  {Math.round((setupProgress / 3) * 100)}%
                </span>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-teal-600 transition-all duration-500"
                  style={{ width: `${(setupProgress / 3) * 100}%` }}
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {[
                "Show a real company identity",
                "Unlock job posting tools",
                "Give applicants a clear first impression",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-lg border border-teal-100 bg-white/80 px-4 py-3 shadow-sm">
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-teal-600" />
                  <span className="text-sm font-semibold text-slate-700">{item}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="employer-panel p-5 sm:p-7 lg:p-8">
            <div className="flex flex-col gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="employer-kicker">Company profile</p>
                <h2 className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl">
                  Complete your details
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Keep it short, clear, and candidate friendly.
                </p>
              </div>
              <div className="hidden rounded-lg bg-teal-50 p-3 text-teal-700 sm:block">
                <BriefcaseBusiness className="h-6 w-6" />
              </div>
            </div>

            <div className="grid gap-6 pt-6">
              <div className="grid gap-4 sm:grid-cols-[96px_1fr] sm:items-center">
                <img
                  src={setupImage}
                  alt="Company profile"
                  className="h-24 w-24 rounded-lg border border-slate-200 bg-slate-50 object-cover shadow-sm"
                />
                <div>
                  <label className="employer-secondary-action cursor-pointer">
                    <Upload className="h-4 w-4" />
                    Upload image
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                  <p className="mt-2 text-xs font-semibold text-slate-500">
                    JPG, PNG, or WebP. Maximum 5MB.
                  </p>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">Contact name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="field-control"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">Company name</label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => handleInputChange("companyName", e.target.value)}
                    className="field-control"
                    placeholder="Company name"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">Company description</label>
                <textarea
                  value={formData.companyDescription}
                  onChange={(e) => handleInputChange("companyDescription", e.target.value)}
                  className="field-control min-h-36 resize-none"
                  placeholder="What do you build, who do you serve, and why should candidates be excited to join?"
                />
              </div>

              <button type="button" onClick={handleSave} disabled={saving} className="employer-action w-full sm:w-auto">
                {saving ? (
                  <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {saving ? "Saving..." : "Complete setup"}
                {!saving && <ArrowRight className="h-4 w-4" />}
              </button>
            </div>
          </section>
        </main>
      </div>
    );
  }

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

  return (
    <DashboardLayout activeMenu="company-profile">
      {user && (
        <div className="employer-shell mb-16">
          <div className="employer-panel overflow-hidden">
            <div className="flex flex-col gap-5 border-b border-slate-100 bg-white/70 px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
              <div>
                <p className="employer-kicker">Company</p>
                <h1 className="mt-2 text-3xl font-black text-slate-950">
                  Employer profile
                </h1>
                <p className="mt-2 text-sm text-slate-500">
                  The public identity attached to your jobs and candidate reviews.
                </p>
              </div>
              <button onClick={() => setEditMode(true)} className="employer-action">
                <Edit3 className="w-4 h-4" />
                Edit profile
              </button>
            </div>

            <div className="grid gap-8 p-5 sm:p-8 lg:grid-cols-[300px_1fr]">
              <aside className="employer-card p-6">
                <img
                  src={getProfileAssetUrl(profileData.avatar)}
                  alt="Company profile"
                  className="h-24 w-24 rounded-lg border border-slate-200 bg-white object-cover shadow-sm"
                />
                <h2 className="mt-5 text-2xl font-black text-slate-950">
                  {profileData.companyName || "Company profile"}
                </h2>
                <p className="mt-2 text-sm font-semibold text-teal-700">
                  Employer account
                </p>
                <div className="mt-5 flex items-center text-sm text-slate-600">
                  <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="break-all">{profileData.email}</span>
                </div>
              </aside>

              <section className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="employer-card p-5">
                    <p className="text-xs font-bold uppercase text-slate-400">Contact name</p>
                    <p className="mt-2 font-semibold text-slate-950">{profileData.name || "N/A"}</p>
                  </div>
                  <div className="employer-card p-5">
                    <p className="text-xs font-bold uppercase text-slate-400">Company name</p>
                    <p className="mt-2 font-semibold text-slate-950">{profileData.companyName || "N/A"}</p>
                  </div>
                </div>

                <div className="employer-card p-5 sm:p-6">
                  <p className="text-xs font-bold uppercase text-slate-400">About company</p>
                  <p className="mt-3 text-sm leading-7 text-slate-700">
                    {profileData.companyDescription}
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default EmployerProfilePage;
