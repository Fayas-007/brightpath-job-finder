import { createElement, useEffect, useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  Camera,
  CheckCircle2,
  FileText,
  GraduationCap,
  Mail,
  Plus,
  Save,
  Trash2,
  Upload,
  UserRound,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../utils/axiosInstance";
import { getAssetUrl } from "../../utils/apiPaths";
import toast from "react-hot-toast";
import Navbar from "../../components/layout/Navbar";
import { useNavigate } from "react-router-dom";
import Footer from "../LandingPage/components/Footer";

const emptyEducation = () => ({
  id: Date.now() + Math.random(),
  degree: "",
  institution: "",
  startYear: "",
  endYear: "",
});

const emptyExperience = () => ({
  id: Date.now() + Math.random(),
  title: "",
  company: "",
  startDate: "",
  endDate: "",
});

const SectionHeader = ({ icon: IconComponent, eyebrow, title }) => (
  <div className="mb-4 flex items-center gap-3">
    <div className="rounded-lg bg-blue-50 p-2.5 text-blue-700">
      {createElement(IconComponent, { className: "h-5 w-5" })}
    </div>
    <div>
      <p className="text-xs font-black uppercase tracking-wide text-blue-600">
        {eyebrow}
      </p>
      <h2 className="text-xl font-black text-slate-950">{title}</h2>
    </div>
  </div>
);

const UserProfile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    avatar: "",
    resume: "",
    resumeName: "",
    companyName: "",
    companyDescription: "",
    education: [emptyEducation()],
    experience: [emptyExperience()],
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        avatar: user.avatar || "",
        resume: user.resume || "",
        resumeName: user.resumeName || "",
        companyName: user.companyName || "",
        companyDescription: user.companyDescription || "",
        education:
          user.education?.length > 0
            ? user.education.map((edu) => ({ ...edu, id: Date.now() + Math.random() }))
            : [emptyEducation()],
        experience:
          user.experience?.length > 0
            ? user.experience.map((exp) => ({ ...exp, id: Date.now() + Math.random() }))
            : [emptyExperience()],
      });
    }
  }, [user]);

  const completionItems = useMemo(
    () => [
      { label: "Photo", complete: Boolean(formData.avatar) },
      { label: "Resume", complete: Boolean(formData.resume) },
      {
        label: "Education",
        complete: formData.education.some((edu) => edu.degree || edu.institution),
      },
      {
        label: "Experience",
        complete: formData.experience.some((exp) => exp.title || exp.company),
      },
    ],
    [formData]
  );

  const completionScore = Math.round(
    (completionItems.filter((item) => item.complete).length / completionItems.length) * 100
  );

  const formatDateForInput = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleInputChange = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleAddItem = (type) => {
    const emptyItem = type === "education" ? emptyEducation() : emptyExperience();
    handleInputChange(type, [...formData[type], emptyItem]);
  };

  const handleRemoveItem = (type, id) =>
    handleInputChange(type, formData[type].filter((item) => item.id !== id));

  const handleItemChange = (type, id, field, value) =>
    handleInputChange(
      type,
      formData[type].map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;

    if (type === "resume") {
      const fileName = file.name.toLowerCase();
      const isValid = [".pdf", ".doc", ".docx"].some((ext) => fileName.endsWith(ext));
      if (!isValid) {
        toast.error("Please upload a PDF, DOC, or DOCX resume.");
        return;
      }
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(type === "resume" ? "Resume must be 5MB or smaller." : "Image must be 5MB or smaller.");
      return;
    }

    handleInputChange(type, file);
  };

  const getFileUrl = (fileUrl) => getAssetUrl(fileUrl);

  const getDisplayResumeName = (resume, resumeName) => {
    if (resume instanceof File) return resume.name;
    if (resumeName) return resumeName;
    if (!resume) return "";

    const fileName = decodeURIComponent(resume.split("/").pop() || resume);
    return fileName.replace(/-\d{13}-\d+(\.[^.]+)$/i, "$1");
  };

  const removeLocalId = (item) => {
    const cleanItem = { ...item };
    delete cleanItem.id;
    return cleanItem;
  };

  const avatarSrc =
    formData.avatar instanceof File
      ? URL.createObjectURL(formData.avatar)
      : formData.avatar
      ? getAssetUrl(formData.avatar)
      : "/default-avatar.png";

  const handleSave = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", formData.name || "");
      fd.append("email", formData.email || "");

      if (user.role === "employer") {
        fd.append("companyName", formData.companyName || "");
        fd.append("companyDescription", formData.companyDescription || "");
      }

      if (user.role === "jobseeker") {
        const filteredEducation = formData.education.filter(
          (edu) => edu.degree || edu.institution || edu.startYear || edu.endYear
        );
        const filteredExperience = formData.experience.filter(
          (exp) => exp.title || exp.company || exp.startDate || exp.endDate
        );

        fd.append(
          "education",
          JSON.stringify(filteredEducation.map(removeLocalId))
        );
        fd.append(
          "experience",
          JSON.stringify(filteredExperience.map(removeLocalId))
        );
      }

      if (formData.avatar instanceof File) fd.append("avatar", formData.avatar);
      if (formData.resume instanceof File) fd.append("resume", formData.resume);

      const res = await axiosInstance.put("/api/user/profile", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.status === 200) {
        toast.success("Profile updated!");
        updateUser(res.data);
        navigate("/profile");
      }
    } catch (err) {
      console.error(err.response?.data || err);
      toast.error(
        err.response?.data?.message || "Update failed! Please check your inputs."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-with-footer app-background app-background-jobseeker">
      <Navbar />
      <main className="page-footer-main mx-auto max-w-6xl px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-lg border border-blue-100 bg-white shadow-sm">
          <div className="border-b border-blue-100 bg-gradient-to-r from-blue-50 via-white to-teal-50 px-5 py-6 sm:px-7">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 flex-col items-start gap-4 sm:flex-row sm:items-center">
                <img
                  src={avatarSrc}
                  alt="Avatar"
                  className="h-20 w-20 flex-shrink-0 rounded-lg border border-white object-cover shadow-lg shadow-blue-100 sm:h-24 sm:w-24"
                />
                <div className="min-w-0">
                  <p className="text-xs font-black uppercase tracking-wide text-blue-600">
                    Career profile editor
                  </p>
                  <h1 className="mt-2 break-words text-2xl font-black leading-tight text-slate-950 sm:text-3xl">
                    Keep your profile ready to apply.
                  </h1>
                  <p className="mt-2 flex min-w-0 items-center gap-2 break-all text-sm font-semibold text-slate-600 sm:break-normal">
                    <Mail className="h-4 w-4 flex-shrink-0 text-blue-600" />
                    {formData.email || "Email"}
                  </p>
                </div>
              </div>

              <div className="w-full lg:max-w-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-black text-slate-950">Readiness</p>
                  <p className="text-sm font-black text-blue-700">{completionScore}%</p>
                </div>
                <div className="mt-3 h-2 rounded-full bg-white ring-1 ring-blue-100">
                  <div
                    className="h-full rounded-full bg-blue-600"
                    style={{ width: `${completionScore}%` }}
                  />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {completionItems.map((item) => (
                    <span
                      key={item.label}
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-black ${
                        item.complete
                          ? "bg-teal-50 text-teal-700 ring-1 ring-teal-100"
                          : "bg-white text-slate-400 ring-1 ring-slate-200"
                      }`}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {item.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <label className="mt-5 inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-blue-100 bg-white px-4 py-2.5 text-sm font-black text-blue-700 transition hover:bg-blue-50">
              <Camera className="h-4 w-4" />
              Change photo
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, "avatar")}
                className="hidden"
              />
            </label>
          </div>

          <div className="grid gap-5 p-4 sm:p-6">
              <section className="rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
                <SectionHeader icon={UserRound} eyebrow="Basics" title="Account details" />
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="grid gap-2">
                    <span className="text-sm font-bold text-slate-700">Full name</span>
                    <input
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className="field-control"
                      placeholder="Your full name"
                    />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-sm font-bold text-slate-700">Email address</span>
                    <input
                      value={formData.email}
                      className="field-control cursor-not-allowed bg-slate-50 text-slate-500"
                      disabled
                    />
                  </label>
                </div>
              </section>

              <section className="rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
                <SectionHeader icon={FileText} eyebrow="Resume" title="Application resume" />
                <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0">
                    <p className="break-words font-black text-slate-950">
                      {formData.resume
                        ? getDisplayResumeName(formData.resume, formData.resumeName)
                        : "No resume uploaded"}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-500">
                      PDF, DOC, or DOCX up to 5MB.
                    </p>
                    {formData.resume && typeof formData.resume === "string" && (
                      <a
                        href={getFileUrl(formData.resume)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex text-sm font-black text-blue-600 hover:text-blue-700"
                      >
                        View current resume
                      </a>
                    )}
                  </div>
                  <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-black text-white shadow-sm hover:bg-blue-700">
                    <Upload className="h-4 w-4" />
                    {formData.resume ? "Replace resume" : "Upload resume"}
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => handleFileChange(e, "resume")}
                      className="hidden"
                    />
                  </label>
                </div>
              </section>

              {user?.role === "jobseeker" && (
                <>
                  <section className="rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <SectionHeader icon={GraduationCap} eyebrow="Background" title="Education" />
                      <button
                        onClick={() => handleAddItem("education")}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-black text-blue-700 hover:bg-blue-100"
                      >
                        <Plus className="h-4 w-4" />
                        Add education
                      </button>
                    </div>

                    <div className="grid gap-3">
                      {formData.education.map((edu) => (
                        <div key={edu.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                          <div className="grid gap-3 md:grid-cols-2">
                            <input
                              placeholder="Degree"
                              value={edu.degree}
                              onChange={(e) => handleItemChange("education", edu.id, "degree", e.target.value)}
                              className="field-control"
                            />
                            <input
                              placeholder="Institution"
                              value={edu.institution}
                              onChange={(e) => handleItemChange("education", edu.id, "institution", e.target.value)}
                              className="field-control"
                            />
                            <input
                              placeholder="Start year"
                              value={edu.startYear}
                              onChange={(e) => handleItemChange("education", edu.id, "startYear", e.target.value)}
                              className="field-control"
                            />
                            <input
                              placeholder="End year"
                              value={edu.endYear}
                              onChange={(e) => handleItemChange("education", edu.id, "endYear", e.target.value)}
                              className="field-control"
                            />
                          </div>
                          <button
                            onClick={() => handleRemoveItem("education", edu.id)}
                            className="mt-3 inline-flex items-center gap-2 text-sm font-black text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <SectionHeader icon={BriefcaseBusiness} eyebrow="Work history" title="Experience" />
                      <button
                        onClick={() => handleAddItem("experience")}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-teal-100 bg-teal-50 px-4 py-2 text-sm font-black text-teal-700 hover:bg-teal-100"
                      >
                        <Plus className="h-4 w-4" />
                        Add experience
                      </button>
                    </div>

                    <div className="grid gap-3">
                      {formData.experience.map((exp) => (
                        <div key={exp.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                          <div className="grid gap-3 md:grid-cols-2">
                            <input
                              placeholder="Job title"
                              value={exp.title}
                              onChange={(e) => handleItemChange("experience", exp.id, "title", e.target.value)}
                              className="field-control"
                            />
                            <input
                              placeholder="Company"
                              value={exp.company}
                              onChange={(e) => handleItemChange("experience", exp.id, "company", e.target.value)}
                              className="field-control"
                            />
                            <input
                              type="date"
                              value={formatDateForInput(exp.startDate)}
                              onChange={(e) => handleItemChange("experience", exp.id, "startDate", e.target.value)}
                              className="field-control"
                            />
                            <input
                              type="date"
                              value={formatDateForInput(exp.endDate)}
                              onChange={(e) => handleItemChange("experience", exp.id, "endDate", e.target.value)}
                              className="field-control"
                            />
                          </div>
                          <button
                            onClick={() => handleRemoveItem("experience", exp.id)}
                            className="mt-3 inline-flex items-center gap-2 text-sm font-black text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </section>
                </>
              )}

              <div className="sticky bottom-4 z-10 flex flex-col-reverse gap-3 rounded-lg border border-slate-200 bg-white/95 p-3 shadow-xl backdrop-blur sm:flex-row sm:justify-end">
                <button
                  onClick={() => navigate("/profile")}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-100"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-black text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <Save className="h-5 w-5" />
                  )}
                  {saving ? "Saving..." : "Save changes"}
                </button>
              </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default UserProfile;
