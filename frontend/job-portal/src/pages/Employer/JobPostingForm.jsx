import DashboardLayout from "../../components/layout/DashboardLayout";
import { useState, useEffect } from "react";
import { AlertCircle, MapPin, Briefcase, Users, Eye, Send } from "lucide-react";
import { API_PATHS } from "../../utils/apiPaths";
import { useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { CATEGORIES, JOB_TYPES } from "../../utils/data";
import toast from "react-hot-toast";
import InputField from "../../components/Input/InputField";
import SelectField from "../../components/Input/SelectField";
import TextareaField from "../../components/Input/TextareaField";
import JobPostingPreview from "../../components/Cards/JobPostingPreview";
import { isEmployerProfileComplete } from "../../utils/helper";

const JobPostingForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const jobId = location.state?.jobId || null; // null if creating a new job

  const [user, setUser] = useState(null); // company info (from logged-in user)
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
      }
    };
    fetchUser();
  }, []);

  // Fetch job details if editing
  useEffect(() => {
    if (!jobId) return;

    const fetchJobDetails = async () => {
      try {
        const response = await axiosInstance.get(API_PATHS.JOBS.GET_JOB_BY_ID(jobId));
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

  // Check if company profile is complete
  const hasCompanyDetails = () => isEmployerProfileComplete(user);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateForm = (data) => {
    const errors = {};
    if (!data.jobTitle.trim()) errors.jobTitle = "Job title is required";
    if (!data.location.trim()) errors.location = "Location is required";
    if (!data.category) errors.category = "Please select a category";
    if (!data.jobType) errors.jobType = "Please select a job type";
    if (!data.description.trim()) errors.description = "Job description is required";
    if (!data.requirements.trim()) errors.requirements = "Job requirements are required";

    const hasMinSalary = data.salaryMin !== "";
    const hasMaxSalary = data.salaryMax !== "";

    if (hasMinSalary !== hasMaxSalary)
      errors.salary = "Enter both minimum and maximum salary, or leave both blank";
    else if (hasMinSalary && Number(data.salaryMin) >= Number(data.salaryMax))
      errors.salary = "Maximum salary must be greater than minimum salary";

    return errors;
  };

  const isFormValid = () => Object.keys(validateForm(formData)).length === 0 && hasCompanyDetails();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!hasCompanyDetails()) {
      toast.error("Complete your company profile before posting a job.");
      navigate("/company-profile");
      return;
    }

    const nextErrors = validateForm(formData);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      toast.error("Please fix the highlighted fields.");
      return;
    }

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
      toast.error(err?.response?.data?.message || "Failed to post or update job");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isPreview)
    return (
      <DashboardLayout activeMenu="post-job">
        <JobPostingPreview formData={formData} setIsPreview={setIsPreview} />
      </DashboardLayout>
    );

  return (
    <DashboardLayout activeMenu="post-job">
      <div className="employer-shell mb-16">
        <div className="employer-panel overflow-hidden">
          <div className="grid gap-8 p-5 sm:p-8 lg:grid-cols-[1fr_300px]">
            <section>
              <div className="flex flex-col gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="employer-kicker">Job editor</p>
                <h2 className="mt-2 text-3xl font-black text-slate-950">
                  {jobId ? "Edit Job" : "Post a Job"}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Write a clear role, check the preview, then publish when it is ready.
                </p>
              </div>
              <button
                onClick={() => setIsPreview(true)}
                disabled={!isFormValid()}
                className="employer-secondary-action"
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </button>
            </div>

            {!hasCompanyDetails() && (
              <div className="my-6 flex flex-col gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <span>Complete your company profile before posting a job.</span>
                <button
                  type="button"
                  onClick={() => navigate("/company-profile")}
                  className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-bold text-white hover:bg-amber-700"
                >
                  Complete Profile
                </button>
              </div>
            )}

            {/* Form Fields */}
            <div className="space-y-6 pt-6">
              <InputField
                label="Job Title"
                placeholder="Senior Frontend Developer"
                value={formData.jobTitle}
                onChange={(e) => handleInputChange("jobTitle", e.target.value)}
                error={errors.jobTitle}
                icon={Briefcase}
                required
              />

              <InputField
                label="Location"
                placeholder="e.g., Colombo, Sri Lanka"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                error={errors.location}
                icon={MapPin}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SelectField
                  label="Category"
                  value={formData.category}
                  onChange={(e) => handleInputChange("category", e.target.value)}
                  options={CATEGORIES}
                  placeholder="Select a category"
                  error={errors.category}
                  icon={Users}
                  required
                />
                <SelectField
                  label="Job Type"
                  value={formData.jobType}
                  onChange={(e) => handleInputChange("jobType", e.target.value)}
                  options={JOB_TYPES}
                  placeholder="Select job type"
                  error={errors.jobType}
                  icon={Briefcase}
                  required
                />
              </div>

              <TextareaField
                label="Job Description"
                placeholder="Outline responsibilities, daily tasks, and role highlights..."
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                error={errors.description}
                helperText="Include key responsibilities and expectations"
                required
              />

              <TextareaField
                label="Requirements"
                placeholder="e.g., Required skills, experience, education..."
                value={formData.requirements}
                onChange={(e) => handleInputChange("requirements", e.target.value)}
                error={errors.requirements}
                helperText="Specify required skills, qualifications, and preferred experience"
                required
              />

             {/* Salary Fields */}
<div className="space-y-2">
  <label className="block text-sm font-medium text-gray-700">
    Salary Range (Optional)
  </label>
  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
    {["Min", "Max"].map((type, idx) => (
      <div key={idx} className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
          LKR
        </div>
        <input
          type="number"
          placeholder={`${type} salary (LKR)`}
          value={type === "Min" ? formData.salaryMin : formData.salaryMax}
          onChange={(e) =>
            handleInputChange(
              type === "Min" ? "salaryMin" : "salaryMax",
              e.target.value
            )
          }
          className="w-full pl-12 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm hover:shadow-md"
        />
      </div>
    ))}
  </div>
  {errors.salary && (
    <div className="flex items-center text-sm text-red-600 mt-1">
      <AlertCircle className="h-4 w-4 mr-1" />
      {errors.salary}
    </div>
  )}
</div>


              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !isFormValid()}
                className={`flex w-full items-center justify-center rounded-lg px-6 py-3 font-black text-white transition-all duration-300 ${
                  hasCompanyDetails()
                    ? "bg-teal-700 hover:bg-teal-600"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                ) : (
                  <Send className="h-5 w-5 mr-2" />
                )}
                {isSubmitting ? "Publishing Job..." : jobId ? "Update Job" : "Publish Job"}
              </button>
            </div>
            </section>

            <aside className="employer-card h-fit p-5">
              <p className="text-sm font-black text-slate-950">Publishing checklist</p>
              <div className="mt-4 space-y-3">
                {[
                  ["Company profile", hasCompanyDetails()],
                  ["Role basics", Boolean(formData.jobTitle && formData.location)],
                  ["Description", Boolean(formData.description && formData.requirements)],
                  ["Preview ready", isFormValid()],
                ].map(([label, done]) => (
                  <div key={label} className="flex items-center gap-3 text-sm font-semibold text-slate-600">
                    <span className={`h-2.5 w-2.5 rounded-full ${done ? "bg-teal-600" : "bg-slate-300"}`} />
                    {label}
                  </div>
                ))}
              </div>
            </aside>
        </div>
      </div>
      </div>
    </DashboardLayout>
  );
};

export default JobPostingForm;
