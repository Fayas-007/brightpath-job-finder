import { ArrowLeft, Save, Upload } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getAssetUrl as buildAssetUrl } from "../../utils/apiPaths";

/* Same heading and type system as Manage jobs and the profile page. */
const DISPLAY_FONT = {
  fontFamily: "'Bricolage Grotesque', 'Hanken Grotesk', system-ui, sans-serif",
};
const BODY_FONT = { fontFamily: "'Hanken Grotesk', system-ui, sans-serif" };

const inputClass =
  "min-h-11 w-full rounded-lg border border-[#0a1f6b]/15 bg-white px-4 text-sm text-[#0a1f6b] outline-none transition-colors placeholder:text-slate-400 hover:border-[#0a1f6b]/30 focus:border-[#1646e0] focus:ring-4 focus:ring-[#1646e0]/10";

const secondaryButton =
  "inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#0a1f6b]/20 bg-white px-5 text-sm font-semibold text-[#0a1f6b] transition-colors hover:bg-[#eef3ff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1646e0] disabled:cursor-not-allowed disabled:opacity-60";

const primaryButton =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#ffd23f] px-6 text-sm font-bold text-[#0a1f6b] transition-colors hover:bg-[#f5c400] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0a1f6b] disabled:cursor-not-allowed disabled:opacity-60";

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

const LogoFrame = ({ src, busy }) => (
  <div className="relative h-40 w-40 p-3">
    <span className="absolute left-0 top-0 h-4 w-4 border-l-2 border-t-2 border-[#1646e0]" />
    <span className="absolute right-0 top-0 h-4 w-4 border-r-2 border-t-2 border-[#1646e0]" />
    <span className="absolute bottom-0 left-0 h-4 w-4 border-b-2 border-l-2 border-[#1646e0]" />
    <span className="absolute bottom-0 right-0 h-4 w-4 border-b-2 border-r-2 border-[#1646e0]" />
    <img
      src={src}
      alt="Company logo"
      className="h-full w-full rounded-md bg-white object-cover"
    />
    {busy && (
      <div className="absolute inset-3 flex items-center justify-center rounded-md bg-white/70">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#1646e0] border-t-transparent" />
      </div>
    )}
  </div>
);

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
        <div
          style={BODY_FONT}
          className="mx-auto w-full max-w-[1440px] space-y-7 pb-12"
        >
          {/* Page heading */}
          <section className="relative overflow-hidden rounded-2xl border border-[#0a1f6b]/10 bg-[#f5f8ff] px-6 py-7 sm:px-9 sm:py-9">
            <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <div className="mb-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.13em] text-[#1646e0]">
                  <span className="h-2 w-2 rounded-full bg-[#ffd23f]" />
                  Profile editor
                </div>

                <h1
                  style={DISPLAY_FONT}
                  className="text-4xl font-bold leading-[1.05] tracking-normal text-[#0a1f6b] sm:text-5xl"
                >
                  Update your
                  <br className="hidden sm:block" /> company profile.
                </h1>

                <p className="mt-4 max-w-lg text-[15px] leading-6 text-slate-600">
                  Keep the information candidates see current and trustworthy.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className={`${secondaryButton} self-start lg:self-auto`}
              >
                <ArrowLeft className="h-4 w-4" />
                Back to profile
              </button>
            </div>

            <div className="pointer-events-none absolute -bottom-16 right-8 hidden h-56 w-56 rounded-full border-[32px] border-white/60 lg:block" />
            <div className="pointer-events-none absolute -bottom-8 right-32 hidden h-28 w-28 rounded-full bg-[#ffd23f]/20 lg:block" />
          </section>

          <div className="grid grid-cols-1 items-start gap-7 lg:grid-cols-[340px_minmax(0,1fr)]">
            {/* Logo */}
            <section className="overflow-hidden rounded-2xl border border-[#0a1f6b]/10 bg-white">
              <header className="border-b border-[#0a1f6b]/10 px-6 py-5">
                <h2
                  style={DISPLAY_FONT}
                  className="text-xl font-bold text-[#0a1f6b]"
                >
                  Company logo
                </h2>
              </header>

              <div className="p-6">
                <LogoFrame
                  src={
                    imagePreview?.avatar || getProfileAssetUrl(formData?.avatar)
                  }
                  busy={saving}
                />

                <label className={`${secondaryButton} mt-6 w-full`}>
                  <Upload className="h-4 w-4" />
                  Choose image
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>

                <p className="mt-3 text-xs text-slate-500">
                  JPG, PNG or WebP, up to 5MB.
                </p>
              </div>
            </section>

            {/* Form */}
            <section className="min-w-0 overflow-hidden rounded-2xl border border-[#0a1f6b]/10 bg-white">
              <header className="border-b border-[#0a1f6b]/10 px-6 py-5 sm:px-8">
                <h2
                  style={DISPLAY_FONT}
                  className="text-2xl font-bold text-[#0a1f6b]"
                >
                  Company details
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Shown to candidates on every job you post.
                </p>
              </header>

              <div className="space-y-6 p-6 sm:p-8">
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Contact name" htmlFor="edit-name">
                    <input
                      id="edit-name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className={inputClass}
                      placeholder="Your name"
                    />
                  </Field>

                  <Field
                    label="Email address"
                    htmlFor="edit-email"
                    hint="Your sign-in email can't be changed here."
                  >
                    <input
                      id="edit-email"
                      type="email"
                      value={formData.email}
                      disabled
                      className={`${inputClass} cursor-not-allowed bg-[#f5f8ff] text-slate-500 hover:border-[#0a1f6b]/15`}
                    />
                  </Field>
                </div>

                <Field label="Company name" htmlFor="edit-company">
                  <input
                    id="edit-company"
                    type="text"
                    value={formData.companyName}
                    onChange={(e) =>
                      handleInputChange("companyName", e.target.value)
                    }
                    className={inputClass}
                    placeholder="Company name"
                  />
                </Field>

                <Field label="Company description" htmlFor="edit-description">
                  <textarea
                    id="edit-description"
                    value={formData.companyDescription}
                    onChange={(e) =>
                      handleInputChange("companyDescription", e.target.value)
                    }
                    rows={7}
                    className={`${inputClass} resize-none py-3 leading-6`}
                    placeholder="Describe your company, culture, and hiring focus."
                  />
                </Field>

                <div className="flex flex-col-reverse gap-3 border-t border-[#0a1f6b]/10 pt-6 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={saving}
                    className={secondaryButton}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className={primaryButton}
                  >
                    {saving ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#0a1f6b] border-t-transparent" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {saving ? "Saving..." : "Save changes"}
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default EditProfileDetails;