import DashboardLayout from "../../components/layout/DashboardLayout";
import { useState, useEffect } from "react";
import { Eye, Send, AlertCircle } from "lucide-react";
import { API_PATHS } from "../../utils/apiPaths";
import { useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { CATEGORIES, JOB_TYPES } from "../../utils/data";
import toast from "react-hot-toast";
import JobPostingPreview from "../../components/Cards/JobPostingPreview";
import { isEmployerProfileComplete } from "../../utils/helper";

/*
  60-30-10: white + #f5f8ff (60), navy text/headings (30),
  yellow on the one primary action (10). Red is reserved for
  required-field stars and errors.
*/

/*
  Fonts. Add once to index.html <head>:
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500..800&family=Hanken+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />

  Bricolage Grotesque: headings (tight, characterful, optical sizing).
  Hanken Grotesk: labels, inputs and body (open, very readable at 15-16px).
*/
const DISPLAY_FONT = {
  fontFamily: "'Bricolage Grotesque', 'Hanken Grotesk', system-ui, sans-serif",
};
const BODY_FONT = {
  fontFamily: "'Hanken Grotesk', system-ui, sans-serif",
};

const FOCUS =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1646e0]";

const REQUIRED_KEYS = [
  "jobTitle",
  "location",
  "category",
  "jobType",
  "description",
  "requirements",
];

// Order used to send focus to the first field with an error.
const FIELD_ORDER = [...REQUIRED_KEYS, "salary"];

const inputClass = (hasError) =>
  `w-full rounded-lg border bg-white px-4 py-3 text-base leading-6 text-[#0a1f6b] placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-4 ${
    hasError
      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
      : "border-[#0a1f6b]/20 hover:border-[#0a1f6b]/40 focus:border-[#1646e0] focus:ring-[#1646e0]/15"
  }`;

/* ---------- Building blocks ---------- */

const RequiredStar = () => (
  <>
    <span aria-hidden="true" className="text-lg font-bold leading-none text-red-600">
      *
    </span>
    <span className="sr-only">(required)</span>
  </>
);

const FieldError = ({ children }) => (
  <p
    role="alert"
    className="mt-2 flex items-center gap-1.5 text-sm font-medium text-red-600"
  >
    <AlertCircle className="h-4 w-4 flex-shrink-0" />
    {children}
  </p>
);

// `id` links the label to a single input. Pass `labelId` instead for groups.
const Field = ({ id, labelId, label, required, optional, error, hint, children }) => {
  const Label = id ? "label" : "span";

  return (
    <div>
      <Label
        id={labelId}
        htmlFor={id}
        className="mb-2 flex items-center gap-1 text-[15px] font-semibold text-[#0a1f6b]"
      >
        {label}
        {required && <RequiredStar />}
        {optional && (
          <span className="ml-1 text-[13px] font-medium text-slate-500">
            Optional
          </span>
        )}
      </Label>

      {children}

      {hint && !error && (
        <p className="mt-2 text-sm leading-5 text-slate-500">{hint}</p>
      )}
      {error && <FieldError>{error}</FieldError>}
    </div>
  );
};

// Title and help text on the left, fields on the right (stacked on mobile).
const Section = ({ title, description, children }) => (
  <section className="grid gap-6 px-6 py-8 sm:px-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12">
    <div>
      <h2 style={DISPLAY_FONT} className="text-xl font-semibold leading-7 tracking-[-0.015em] text-[#0a1f6b]">
        {title}
      </h2>
      <p className="mt-1.5 text-[15px] leading-6 text-slate-500">{description}</p>
    </div>

    <div className="grid content-start gap-6">{children}</div>
  </section>
);

/* ---------- Page ---------- */

const JobPostingForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const jobId = location.state?.jobId || null; // null if creating a new job

  const [user, setUser] = useState(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [formData, setFormData] = useState({
    jobTitle: "",
    location: "",
    category: "",
    jobType: "",
    description: "",
    requirements: "",
    salaryMin: "",
    salaryMax: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreview, setIsPreview] = useState(false);

  // Fetch company info (current user)
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axiosInstance.get(API_PATHS.AUTH.GET_PROFILE);
        setUser(response.data);
      } catch (err) {
        console.error("Failed to fetch user:", err);
        setUser(null);
      } finally {
        setIsProfileLoading(false);
      }
    };

    fetchUser();
  }, []);

  // Fetch job details if editing
  useEffect(() => {
    if (!jobId) return;

    const fetchJobDetails = async () => {
      try {
        const response = await axiosInstance.get(
          API_PATHS.JOBS.GET_JOB_BY_ID(jobId)
        );
        const jobData = response.data;

        if (jobData) {
          setFormData({
            jobTitle: jobData.title,
            location: jobData.location,
            category: jobData.category,
            jobType: jobData.type,
            description: jobData.description,
            requirements: jobData.requirements,
            salaryMin: jobData.salaryMin || "",
            salaryMax: jobData.salaryMax || "",
          });
        }
      } catch (err) {
        console.error("Error fetching job details:", err);
        toast.error("Failed to load job details.");
      }
    };

    fetchJobDetails();
  }, [jobId]);

  const hasCompanyDetails = () => isEmployerProfileComplete(user);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
    if (errors.salary && (field === "salaryMin" || field === "salaryMax")) {
      setErrors((prev) => ({ ...prev, salary: "" }));
    }
  };

  const validateForm = (data) => {
    const errors = {};
    if (!data.jobTitle.trim()) errors.jobTitle = "Enter a job title";
    if (!data.location.trim()) errors.location = "Enter a location";
    if (!data.category) errors.category = "Select a category";
    if (!data.jobType) errors.jobType = "Select a job type";
    if (!data.description.trim())
      errors.description = "Enter a job description";
    if (!data.requirements.trim())
      errors.requirements = "Enter the job requirements";

    const hasMinSalary = data.salaryMin !== "";
    const hasMaxSalary = data.salaryMax !== "";

    if (hasMinSalary !== hasMaxSalary)
      errors.salary =
        "Enter both minimum and maximum salary, or leave both blank";
    else if (hasMinSalary && Number(data.salaryMin) >= Number(data.salaryMax))
      errors.salary = "Maximum salary must be greater than minimum salary";

    return errors;
  };

  // Shows errors and moves focus to the first one.
  const flagErrors = (nextErrors) => {
    setErrors(nextErrors);
    toast.error("Fix the highlighted fields.");

    const first = FIELD_ORDER.find((key) => nextErrors[key]);
    const target = document.getElementById(
      first === "salary" ? "salaryMin" : first
    );

    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
      target.focus?.({ preventScroll: true });
    }
  };

  const handlePreview = () => {
    if (!hasCompanyDetails()) {
      toast.error("Complete your company profile before posting a job.");
      return;
    }

    const nextErrors = validateForm(formData);
    if (Object.keys(nextErrors).length > 0) {
      flagErrors(nextErrors);
      return;
    }

    setIsPreview(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!hasCompanyDetails()) {
      toast.error("Complete your company profile before posting a job.");
      navigate("/company-profile");
      return;
    }

    const nextErrors = validateForm(formData);
    if (Object.keys(nextErrors).length > 0) {
      flagErrors(nextErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    const payload = {
      title: formData.jobTitle,
      location: formData.location,
      category: formData.category,
      type: formData.jobType,
      description: formData.description,
      requirements: formData.requirements,
      salaryMin: formData.salaryMin,
      salaryMax: formData.salaryMax,
    };

    try {
      if (jobId) {
        await axiosInstance.put(API_PATHS.JOBS.UPDATE_JOB(jobId), payload);
        toast.success("Job updated successfully!");
      } else {
        await axiosInstance.post(API_PATHS.JOBS.POST_JOB, payload);
        toast.success("Job posted successfully!");
      }
      navigate("/manage-jobs");
    } catch (err) {
      console.error("Job submission failed:", err);
      toast.error(
        err?.response?.data?.message || "Failed to post or update job"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isProfileLoading) {
    return (
      <DashboardLayout activeMenu="post-job">
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1646e0] border-t-transparent" />
        </div>
      </DashboardLayout>
    );
  }

  if (isPreview)
    return (
      <DashboardLayout activeMenu="post-job">
        <JobPostingPreview formData={formData} setIsPreview={setIsPreview} />
      </DashboardLayout>
    );

  const filledCount = REQUIRED_KEYS.filter((key) =>
    String(formData[key]).trim()
  ).length;
  const allFilled = filledCount === REQUIRED_KEYS.length;

  return (
    <DashboardLayout activeMenu="post-job">
      <div style={BODY_FONT} className="mx-auto w-full max-w-4xl pb-16">
        {/* Header */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1
              style={DISPLAY_FONT}
              className="text-4xl font-bold leading-[1.05] tracking-[-0.03em] text-[#0a1f6b] sm:text-5xl"
            >
              {jobId ? "Edit job" : "Post a job"}
            </h1>
            <p className="mt-3 text-base text-slate-600">
              Fields marked with{" "}
              <span aria-hidden="true" className="font-bold text-red-600">
                *
              </span>
              <span className="sr-only">an asterisk</span> are required.
            </p>
          </div>

          <button
            type="button"
            onClick={handlePreview}
            className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#0a1f6b]/25 bg-white px-5 text-[15px] font-semibold text-[#0a1f6b] transition-colors hover:bg-[#eef3ff] ${FOCUS}`}
          >
            <Eye className="h-4 w-4" />
            Preview
          </button>
        </div>

        {/* Company profile warning */}
        {!hasCompanyDetails() && (
          <div className="mt-6 flex flex-col gap-4 rounded-xl border border-[#ffd23f] bg-[#fff8dc] p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#0a1f6b]" />
              <div>
                <p className="font-bold text-[#0a1f6b]">
                  Complete your company profile to publish
                </p>
                <p className="mt-0.5 text-[15px] text-[#0a1f6b]/75">
                  Candidates need to see who is hiring.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate("/company-profile")}
              className="inline-flex min-h-11 flex-shrink-0 items-center justify-center rounded-lg bg-[#0a1f6b] px-5 text-[15px] font-semibold text-white transition-colors hover:bg-[#1646e0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0a1f6b]"
            >
              Complete profile
            </button>
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="mt-6 divide-y divide-[#0a1f6b]/10 rounded-2xl border border-[#0a1f6b]/10 bg-white"
        >
          <Section
            title="Role"
            description="What the job is and where it is based."
          >
            <Field id="jobTitle" label="Job title" required error={errors.jobTitle}>
              <input
                id="jobTitle"
                type="text"
                value={formData.jobTitle}
                onChange={(e) => handleInputChange("jobTitle", e.target.value)}
                placeholder="e.g. Senior Frontend Developer"
                aria-invalid={Boolean(errors.jobTitle)}
                className={inputClass(errors.jobTitle)}
              />
            </Field>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Field id="location" label="Location" required error={errors.location}>
                <input
                  id="location"
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  placeholder="e.g. Colombo, Sri Lanka"
                  aria-invalid={Boolean(errors.location)}
                  className={inputClass(errors.location)}
                />
              </Field>

              <Field id="category" label="Category" required error={errors.category}>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => handleInputChange("category", e.target.value)}
                  aria-invalid={Boolean(errors.category)}
                  className={inputClass(errors.category)}
                >
                  <option value="">Select a category</option>
                  {CATEGORIES.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.value}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <Field
              labelId="jobType-label"
              label="Job type"
              required
              error={errors.jobType}
            >
              <div
                id="jobType"
                role="radiogroup"
                aria-labelledby="jobType-label"
                tabIndex={-1}
                className="flex flex-wrap gap-2 focus:outline-none"
              >
                {JOB_TYPES.map((type) => {
                  const selected = formData.jobType === type.value;

                  return (
                    <button
                      key={type.value}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => handleInputChange("jobType", type.value)}
                      className={`min-h-11 rounded-lg border px-4 text-[15px] font-semibold transition-colors ${FOCUS} ${
                        selected
                          ? "border-[#0a1f6b] bg-[#0a1f6b] text-white"
                          : errors.jobType
                          ? "border-red-400 bg-white text-[#0a1f6b] hover:bg-[#eef3ff]"
                          : "border-[#0a1f6b]/20 bg-white text-[#0a1f6b] hover:border-[#0a1f6b]/40 hover:bg-[#eef3ff]"
                      }`}
                    >
                      {type.value}
                    </button>
                  );
                })}
              </div>
            </Field>
          </Section>

          <Section
            title="Details"
            description="What the person will do and what you need from them."
          >
            <Field
              id="description"
              label="Job description"
              required
              error={errors.description}
              hint="Key responsibilities and what a normal week looks like."
            >
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Outline responsibilities, daily tasks and role highlights..."
                aria-invalid={Boolean(errors.description)}
                className={`${inputClass(errors.description)} min-h-40 resize-y leading-6`}
              />
            </Field>

            <Field
              id="requirements"
              label="Requirements"
              required
              error={errors.requirements}
              hint="Required skills, qualifications and preferred experience."
            >
              <textarea
                id="requirements"
                value={formData.requirements}
                onChange={(e) =>
                  handleInputChange("requirements", e.target.value)
                }
                placeholder="e.g. 2+ years with React, comfortable with REST APIs..."
                aria-invalid={Boolean(errors.requirements)}
                className={`${inputClass(errors.requirements)} min-h-40 resize-y leading-6`}
              />
            </Field>
          </Section>

          <Section
            title="Pay"
            description="Optional. Add both amounts, or leave both blank."
          >
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {[
                ["Minimum salary", "salaryMin"],
                ["Maximum salary", "salaryMax"],
              ].map(([label, key]) => (
                <Field key={key} id={key} label={label} optional>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[15px] font-semibold text-slate-500">
                      LKR
                    </span>
                    <input
                      id={key}
                      type="number"
                      min="0"
                      value={formData[key]}
                      onChange={(e) => handleInputChange(key, e.target.value)}
                      placeholder="0"
                      aria-invalid={Boolean(errors.salary)}
                      className={`${inputClass(errors.salary)} pl-14`}
                    />
                  </div>
                </Field>
              ))}
            </div>

            {errors.salary && (
              <div className="-mt-3">
                <FieldError>{errors.salary}</FieldError>
              </div>
            )}
          </Section>

          {/* Action bar */}
          <div className="sticky bottom-0 z-10 flex flex-col gap-4 rounded-b-2xl bg-white/95 px-6 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <p className="text-[15px] tabular-nums text-slate-600" aria-live="polite">
              <span
                className={`font-bold ${
                  allFilled ? "text-[#187447]" : "text-[#0a1f6b]"
                }`}
              >
                {filledCount} of {REQUIRED_KEYS.length}
              </span>{" "}
              required fields complete
            </p>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => navigate("/manage-jobs")}
                className={`inline-flex min-h-11 items-center justify-center rounded-lg px-5 text-[15px] font-semibold text-slate-600 transition-colors hover:text-[#0a1f6b] ${FOCUS}`}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#ffd23f] px-7 text-[15px] font-bold text-[#0a1f6b] transition-colors hover:bg-[#f5c400] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0a1f6b]"
              >
                {isSubmitting ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#0a1f6b] border-t-transparent" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {isSubmitting
                  ? "Publishing..."
                  : jobId
                  ? "Update job"
                  : "Publish job"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default JobPostingForm;