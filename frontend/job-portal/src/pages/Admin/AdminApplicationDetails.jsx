import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import Navbar from "../../components/layout/Navbar";
import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";

const STATUS_COLORS = {
  Applied: "bg-blue-100 text-blue-800",
  "In Review": "bg-yellow-100 text-yellow-800",
  Accepted: "bg-green-100 text-green-800",
  Rejected: "bg-red-100 text-red-800",
};

const AdminApplicationDetails = () => {
  const { id } = useParams();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloadingResume, setDownloadingResume] = useState(false);
  const navigate = useNavigate();

  const fetchApplication = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/api/admin/applications/${id}`);
      setApplication(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch application");
      navigate("/admin-dashboard");
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchApplication();
  }, [fetchApplication]);

  if (loading)
    return (
      <div className="app-background app-background-admin flex h-screen items-center justify-center">
        <span className="text-indigo-600 font-semibold animate-pulse text-lg">
          Loading application...
        </span>
      </div>
    );

  if (!application) return null;

  const submittedResume = application.resume || "";
  const submittedResumeName = application.resumeName || "";
  const displayResumeName = submittedResumeName ||
    decodeURIComponent(submittedResume.split("/").pop() || "").replace(/-\d{13}-\d+(\.[^.]+)$/i, "$1");

  const handleDownloadResume = async () => {
    if (!submittedResume) {
      toast.error("Submitted resume unavailable.");
      return;
    }

    try {
      setDownloadingResume(true);
      const response = await axiosInstance.get(
        API_PATHS.APPLICATIONS.DOWNLOAD_RESUME(application._id),
        { responseType: "blob" }
      );
      const resumeBlobUrl = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = resumeBlobUrl;
      link.download = displayResumeName || "resume";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => window.URL.revokeObjectURL(resumeBlobUrl), 1000);
    } catch (err) {
      console.error("Failed to download submitted resume:", err);
      toast.error("The submitted resume file is no longer available.");
    } finally {
      setDownloadingResume(false);
    }
  };

  return (
    <div className="app-background app-background-admin text-slate-900">
      <Navbar />
      <main className="mx-auto max-w-4xl space-y-6 px-4 pb-12 pt-24 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate("/admin-dashboard")}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-100"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <h1 className="text-3xl font-black text-slate-950 md:text-4xl">
          Application Details
        </h1>

        <div className="page-panel space-y-6 rounded-lg p-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <p className="text-lg text-slate-700">
                <span className="font-semibold">Applicant:</span>{" "}
                {application.applicant?.name || "N/A"} (
                {application.applicant?.email || "N/A"})
              </p>
              <p className="text-lg text-slate-700">
                <span className="font-semibold">Job:</span>{" "}
                {application.job?.title || "N/A"}
              </p>
            </div>
            <div
              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                STATUS_COLORS[application.status] || "bg-gray-100 text-gray-800"
              }`}
            >
              {application.status}
            </div>
          </div>

          <hr className="border-slate-200" />

          <p className="text-sm text-slate-500">
            <span className="font-semibold">Applied At:</span>{" "}
            {new Date(application.createdAt).toLocaleString()}
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-lg border border-slate-200 bg-white/70 p-4">
              <h2 className="mb-2 text-lg font-black text-slate-950">Resume</h2>
              {submittedResume ? (
                <div>
                  <p className="font-semibold text-slate-900">{displayResumeName}</p>
                  <button
                    type="button"
                    onClick={handleDownloadResume}
                    disabled={downloadingResume}
                    className="mt-2 inline-flex font-bold text-blue-600 hover:text-blue-700"
                  >
                    {downloadingResume ? "Opening..." : "Download Resume"}
                  </button>
                </div>
              ) : (
                <p className="text-slate-500">No resume uploaded</p>
              )}
            </div>

            <div className="rounded-lg border border-slate-200 bg-white/70 p-4">
              <h2 className="mb-2 text-lg font-black text-slate-950">
                Cover Letter
              </h2>
              <p className="text-slate-600">{application.coverLetter || "N/A"}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminApplicationDetails;
