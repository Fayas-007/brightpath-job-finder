import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Loader } from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import AdminLayout from "../../components/layout/AdminLayout";
import { MaskText, Reveal } from "../../components/common/motion";

/* ---------------------------------------------
   Constants
--------------------------------------------- */

const LIST_PATH = "/admin/manage-applications";

const STATUS_STYLE = {
  Applied: "border-[#71717a]/30 bg-[#71717a]/10 text-[#71717a]",
  "In Review": "border-[#e08a00]/30 bg-[#e08a00]/10 text-[#b86f00]",
  Accepted: "border-[#2f8f6b]/30 bg-[#2f8f6b]/10 text-[#2f8f6b]",
  Rejected: "border-[#c8412f]/30 bg-[#c8412f]/10 text-[#c8412f]",
};

/* ---------------------------------------------
   Small components
--------------------------------------------- */

const Label = ({ children, className = "" }) => (
  <p
    className={`font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500 ${className}`}
  >
    {children}
  </p>
);

const Initial = ({ name = "" }) => (
  <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-md bg-[#0f1115] font-mono text-lg font-bold uppercase text-white">
    {name.trim().charAt(0) || "?"}
  </span>
);

const StatusTag = ({ status }) => (
  <span
    className={`inline-flex flex-shrink-0 items-center rounded-sm border px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.1em] ${
      STATUS_STYLE[status] || "border-zinc-300 bg-zinc-100 text-zinc-600"
    }`}
  >
    {status || "Unknown"}
  </span>
);

const Panel = ({ label, title, children }) => (
  <section className="min-w-0 rounded-md border border-[#0f1115]/10 bg-white">
    <div className="border-b border-zinc-100 px-5 py-4">
      <Label>{label}</Label>
      <h2 className="mt-1.5 text-base font-bold tracking-normal text-[#0f1115]">
        {title}
      </h2>
    </div>

    <div className="px-5 py-5">{children}</div>
  </section>
);

/* ---------------------------------------------
   Application details
--------------------------------------------- */

const AdminApplicationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloadingResume, setDownloadingResume] = useState(false);

  const fetchApplication = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/api/admin/applications/${id}`);
      setApplication(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch application");
      navigate(LIST_PATH);
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchApplication();
  }, [fetchApplication]);

  if (loading) {
    return (
      <AdminLayout title="Applications">
        <div className="flex h-[60vh] items-center justify-center">
          <Loader className="h-8 w-8 animate-spin text-[#1646e0]" />
        </div>
      </AdminLayout>
    );
  }

  if (!application) return null;

  const submittedResume = application.resume || "";
  const submittedResumeName = application.resumeName || "";
  const displayResumeName =
    submittedResumeName ||
    decodeURIComponent(submittedResume.split("/").pop() || "").replace(
      /-\d{13}-\d+(\.[^.]+)$/i,
      "$1"
    );

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

  const appliedAt = application.createdAt
    ? new Date(application.createdAt).toLocaleString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "N/A";

  return (
    <AdminLayout title="Applications">
      <div className="relative z-10 mx-auto w-full max-w-4xl space-y-6">
        {/* Title row */}
        <div className="space-y-5">
          <Reveal variant="fade">
            <button
              type="button"
              onClick={() => navigate(LIST_PATH)}
              className="inline-flex items-center gap-2 rounded-md border border-[#0f1115]/20 bg-white px-3.5 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-[#0f1115] transition-colors hover:bg-[#0f1115] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1646e0]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Applications
            </button>
          </Reveal>

          <div>
            <Reveal variant="fade" delay={100}>
              <Label>Moderation</Label>
            </Reveal>

            <h1 className="mt-2 text-3xl font-extrabold tracking-normal text-[#0f1115] sm:text-4xl">
              <MaskText delay={150}>Application details</MaskText>
            </h1>
          </div>
        </div>

        {/* Summary */}
        <Reveal delay={150}>
          <section className="min-w-0 rounded-md border border-[#0f1115]/10 bg-white">
            <div className="flex flex-col gap-4 border-b border-zinc-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-4">
                <Initial name={application.applicant?.name} />

                <div className="min-w-0">
                  <p className="truncate text-lg font-bold text-[#0f1115]">
                    {application.applicant?.name || "N/A"}
                  </p>
                  <p className="truncate font-mono text-xs text-zinc-500">
                    {application.applicant?.email || "N/A"}
                  </p>
                </div>
              </div>

              <StatusTag status={application.status} />
            </div>

            <dl className="grid grid-cols-1 divide-y divide-zinc-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
              <div className="px-5 py-4">
                <dt>
                  <Label>Applied for</Label>
                </dt>
                <dd className="mt-1.5 text-sm font-bold text-[#0f1115]">
                  {application.job?.title || "N/A"}
                </dd>
              </div>

              <div className="px-5 py-4">
                <dt>
                  <Label>Applied at</Label>
                </dt>
                <dd className="mt-1.5 text-sm font-bold text-[#0f1115]">
                  {appliedAt}
                </dd>
              </div>
            </dl>
          </section>
        </Reveal>

        {/* Documents */}
        <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2">
          <Reveal delay={250}>
            <Panel label="Document" title="Resume">
              {submittedResume ? (
                <div className="space-y-4">
                  <p className="break-words font-mono text-xs text-zinc-600">
                    {displayResumeName}
                  </p>

                  <button
                    type="button"
                    onClick={handleDownloadResume}
                    disabled={downloadingResume}
                    className="inline-flex items-center gap-2 rounded-md bg-[#0f1115] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#1646e0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0f1115] disabled:cursor-wait disabled:opacity-60"
                  >
                    <Download className="h-4 w-4" />
                    {downloadingResume ? "Opening..." : "Download resume"}
                  </button>
                </div>
              ) : (
                <p className="text-sm text-zinc-500">No resume was uploaded.</p>
              )}
            </Panel>
          </Reveal>

          <Reveal delay={370}>
            <Panel label="Message" title="Cover letter">
              {application.coverLetter ? (
                <p className="whitespace-pre-wrap break-words text-sm leading-6 text-zinc-600">
                  {application.coverLetter}
                </p>
              ) : (
                <p className="text-sm text-zinc-500">
                  No cover letter was included.
                </p>
              )}
            </Panel>
          </Reveal>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminApplicationDetails;