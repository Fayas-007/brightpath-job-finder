import { Save, Upload, X } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getAssetUrl as buildAssetUrl } from "../../utils/apiPaths";

const EditProfileDetails = ({
  formData,
  imagePreview,
  handleImageChange,
  handleInputChange,
  handleSave,
  handleCancel,
  saving,
}) => {
  const getProfileAssetUrl = (url) => {
    if (!url) return "/default-logo.png";
    if (url.startsWith("blob:")) return "/default-logo.png";
    return buildAssetUrl(url);
  };

  return (
    <DashboardLayout activeMenu="company-profile">
      {formData && (
        <div className="employer-shell mb-16">
          <div className="employer-panel overflow-hidden">
            <div className="flex flex-col gap-4 border-b border-slate-100 bg-white/70 px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
              <div>
                <p className="employer-kicker">Profile editor</p>
                <h1 className="mt-2 text-3xl font-black text-slate-950">
                  Update company profile
                </h1>
                <p className="mt-2 text-sm text-slate-500">
                  Keep the information candidates see current and trustworthy.
                </p>
              </div>
            </div>

            <div className="grid gap-8 p-5 sm:p-8 lg:grid-cols-[320px_1fr]">
              <aside className="employer-card h-fit p-6">
                <div className="relative h-28 w-28">
                  <img
                    src={imagePreview?.avatar || getProfileAssetUrl(formData?.avatar)}
                    alt="Company profile"
                    className="h-28 w-28 rounded-lg border border-slate-200 bg-white object-cover shadow-sm"
                  />
                  {saving && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-slate-950/45">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    </div>
                  )}
                </div>
                <label className="employer-secondary-action mt-5 w-full cursor-pointer">
                  <Upload className="h-4 w-4" />
                  Choose image
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                <p className="mt-3 text-xs font-semibold text-slate-500">
                  JPG, PNG, or WebP. Maximum 5MB.
                </p>
              </aside>

              <section className="space-y-6">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      Contact name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className="field-control"
                      placeholder="Enter your name"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      Email address
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      disabled
                      className="field-control cursor-not-allowed bg-slate-100 text-slate-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Company name
                  </label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => handleInputChange("companyName", e.target.value)}
                    className="field-control"
                    placeholder="Company name"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Company description
                  </label>
                  <textarea
                    value={formData.companyDescription}
                    onChange={(e) => handleInputChange("companyDescription", e.target.value)}
                    rows={6}
                    className="field-control resize-none"
                    placeholder="Describe your company, culture, and hiring focus."
                  />
                </div>

                <div className="flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
                  <button onClick={handleCancel} className="employer-secondary-action">
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                  <button onClick={handleSave} disabled={saving} className="employer-action">
                    {saving ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {saving ? "Saving..." : "Save changes"}
                  </button>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default EditProfileDetails;
