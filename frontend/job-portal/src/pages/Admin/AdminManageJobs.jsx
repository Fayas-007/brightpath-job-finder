import { useCallback, useEffect, useMemo, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import {
  Edit3,
  Lock,
  Plus,
  Printer,
  Search,
  Trash2,
  Unlock,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import AdminLayout from "../../components/layout/AdminLayout";
import CreateJobModal from "../Admin/CreateJob";
import EditJobModal from "../Admin/EditJob";
import { MaskText, Reveal } from "../../components/common/motion";

/* ---------------------------------------------
   Helpers
--------------------------------------------- */

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const SEARCH_FIELDS = [
  { value: "all", label: "All fields" },
  { value: "title", label: "Job title" },
  { value: "company", label: "Company" },
  { value: "category", label: "Category" },
  { value: "type", label: "Job type" },
];

const getSearchValues = (job, field) => {
  const values = {
    title: job.title,
    company: job.company?.name,
    category: job.category,
    type: job.type,
  };

  return field === "all" ? Object.values(values) : [values[field]];
};

const filterJobs = (list, text, field) => {
  const term = text.toLowerCase().trim();

  if (!term) return list;

  return list.filter((job) =>
    getSearchValues(job, field).some((value) =>
      (value || "").toLowerCase().includes(term)
    )
  );
};

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString("en-GB") : "N/A";

const handlePrint = (list) => {
  const rows = list
    .map(
      (job) => `
        <tr>
          <td>${escapeHtml(job.title || "N/A")}</td>
          <td>${escapeHtml(job.company?.name || "N/A")}</td>
          <td>${escapeHtml(job.category || "N/A")}</td>
          <td>${escapeHtml(job.type || "N/A")}</td>
          <td>${job.isClosed ? "Closed" : "Open"}</td>
          <td>${escapeHtml(formatDate(job.createdAt))}</td>
        </tr>`
    )
    .join("");

  const printWindow = window.open("", "_blank");

  if (!printWindow) {
    toast.error("Allow pop-ups to print this list");
    return;
  }

  printWindow.document.write(`
    <html>
      <head>
        <title>Job list</title>
        <style>
          html, body {
            margin: 24px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: #0f1115;
            background: #fff;
          }
          h1 {
            margin: 0 0 4px;
            font-size: 22px;
            letter-spacing: 0.04em;
            text-transform: uppercase;
          }
          p { margin: 0 0 20px; font-size: 12px; color: #71717a; }
          table { width: 100%; border-collapse: collapse; }
          th, td {
            padding: 10px 14px;
            text-align: left;
            border: 1px solid #e4e4e7;
            font-size: 13px;
          }
          th {
            background: #0f1115;
            color: #fff;
            text-transform: uppercase;
            font-size: 11px;
            letter-spacing: 0.08em;
          }
          tbody tr:nth-child(even) { background: #f4f4f5; }
          @media print { body { -webkit-print-color-adjust: exact; } }
        </style>
      </head>
      <body>
        <h1>Job list</h1>
        <p>${list.length} records · printed ${new Date().toLocaleDateString("en-GB")}</p>
        <table>
          <thead>
            <tr>
              <th>Job title</th>
              <th>Company</th>
              <th>Category</th>
              <th>Type</th>
              <th>Status</th>
              <th>Posted on</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
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

const Tag = ({ children, tone = "neutral" }) => {
  const tones = {
    neutral: "border-zinc-300 text-zinc-600",
    success: "border-[#2f8f6b]/30 bg-[#2f8f6b]/10 text-[#2f8f6b]",
    danger: "border-[#c8412f]/30 bg-[#c8412f]/10 text-[#c8412f]",
  };

  return (
    <span
      className={`inline-flex flex-shrink-0 items-center rounded-sm border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.1em] ${tones[tone]}`}
    >
      {children}
    </span>
  );
};

const SkeletonRows = () => (
  <div className="animate-pulse divide-y divide-zinc-100">
    {[1, 2, 3, 4].map((row) => (
      <div key={row} className="flex items-center gap-4 px-5 py-4">
        <div className="flex-1 space-y-2">
          <div className="h-3 w-48 rounded-sm bg-zinc-200" />
          <div className="h-3 w-32 rounded-sm bg-zinc-100" />
        </div>
        <div className="h-5 w-16 rounded-sm bg-zinc-200" />
        <div className="h-5 w-16 rounded-sm bg-zinc-200" />
      </div>
    ))}
  </div>
);

const TH_CLASS =
  "px-5 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500";

const ICON_BUTTON =
  "flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-zinc-600 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2";

/* ---------------------------------------------
   Manage Jobs
--------------------------------------------- */

const AdminManageJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingJob, setEditingJob] = useState(null);
  const [creatingJob, setCreatingJob] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchField, setSearchField] = useState("all");

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/api/admin/jobs");
      setJobs(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleToggleStatus = async (jobId) => {
    try {
      const res = await axiosInstance.put(`/api/admin/jobs/${jobId}/toggle`);
      toast.success(res.data.message);
      setJobs((prev) =>
        prev.map((job) =>
          job._id === jobId ? { ...job, isClosed: res.data.job.isClosed } : job
        )
      );
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to toggle job status");
    }
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm("Delete this job? This action cannot be undone.")) {
      return;
    }

    try {
      await axiosInstance.delete(`/api/admin/jobs/${jobId}`);
      toast.success("Job deleted successfully");
      fetchJobs();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to delete job");
    }
  };

  const visibleJobs = useMemo(
    () => filterJobs(jobs, searchText, searchField),
    [jobs, searchText, searchField]
  );

  return (
    <AdminLayout title="Jobs" badges={{ jobs: jobs.length }}>
      <div className="relative z-10 mx-auto w-full max-w-[1400px] space-y-6">
        {/* Title row */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Reveal variant="fade">
              <Label>Moderation</Label>
            </Reveal>

            <h1 className="mt-2 text-3xl font-extrabold tracking-normal text-[#0f1115] sm:text-4xl">
              <MaskText delay={100}>Manage jobs</MaskText>
            </h1>

            <Reveal variant="fade" delay={200}>
              <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-500">
                Review listings, open or close them, and keep job data tidy.
              </p>
            </Reveal>
          </div>

          <Reveal variant="fade" delay={250}>
            <button
              type="button"
              onClick={() => setCreatingJob(true)}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-[#0f1115] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#1646e0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0f1115]"
            >
              <Plus className="h-4 w-4" />
              Create job
            </button>
          </Reveal>
        </div>

        <Reveal delay={150}>
          <section className="min-w-0 overflow-hidden rounded-md border border-[#0f1115]/10 bg-white">
            {/* Header */}
            <div className="flex flex-col gap-4 border-b border-zinc-100 px-5 py-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <Label>Listings</Label>

                <h2 className="mt-1.5 flex items-center gap-3 text-base font-bold tracking-normal text-[#0f1115]">
                  All jobs
                  <span className="rounded-sm bg-[#0f1115] px-2 py-0.5 font-mono text-[11px] font-bold tabular-nums text-white">
                    {jobs.length}
                  </span>
                </h2>
              </div>

              <button
                type="button"
                onClick={() => handlePrint(visibleJobs)}
                disabled={visibleJobs.length === 0}
                className="inline-flex items-center justify-center gap-2 rounded-md border border-[#0f1115]/20 px-3.5 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-[#0f1115] transition-colors hover:bg-[#0f1115] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1646e0] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Printer className="h-3.5 w-3.5" />
                Print
              </button>
            </div>

            {/* Search */}
            <div className="grid gap-3 border-b border-zinc-100 px-5 py-3.5 sm:grid-cols-[minmax(0,1fr)_180px]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Search jobs"
                  aria-label="Search jobs"
                  className="h-10 w-full rounded-md border border-[#0f1115]/20 bg-white pl-9 pr-9 text-sm text-[#0f1115] placeholder:text-zinc-400 focus:border-[#1646e0] focus:outline-none focus:ring-2 focus:ring-[#1646e0]/20"
                />

                {searchText && (
                  <button
                    type="button"
                    onClick={() => setSearchText("")}
                    className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-sm text-zinc-500 hover:bg-zinc-100"
                    aria-label="Clear search"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <select
                value={searchField}
                onChange={(e) => setSearchField(e.target.value)}
                aria-label="Search field"
                className="h-10 rounded-md border border-[#0f1115]/20 bg-white px-3 text-sm text-[#0f1115] focus:border-[#1646e0] focus:outline-none focus:ring-2 focus:ring-[#1646e0]/20"
              >
                {SEARCH_FIELDS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Body */}
            {loading ? (
              <SkeletonRows />
            ) : visibleJobs.length === 0 ? (
              <p className="px-5 py-14 text-center text-sm text-zinc-500">
                {searchText
                  ? "No jobs match your search."
                  : "No jobs have been posted yet."}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[820px] text-left">
                  <thead>
                    <tr className="bg-[#ececef]">
                      <th className={TH_CLASS}>Job title</th>
                      <th className={TH_CLASS}>Company</th>
                      <th className={TH_CLASS}>Category</th>
                      <th className={TH_CLASS}>Type</th>
                      <th className={TH_CLASS}>Status</th>
                      <th className={TH_CLASS}>Posted on</th>
                      <th className={`${TH_CLASS} text-right`}>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {visibleJobs.map((job, index) => (
                      <tr
                        key={job._id}
                        className="m-row border-t border-zinc-100 transition-colors hover:bg-[#f4f4f5]"
                        style={{
                          "--m-row-delay": `${Math.min(index, 12) * 35}ms`,
                        }}
                      >
                        <td className="px-5 py-3 text-sm font-bold text-[#0f1115]">
                          {job.title || "N/A"}
                        </td>

                        <td className="px-5 py-3 text-sm text-zinc-600">
                          {job.company?.name || (
                            <span className="text-zinc-400">Not listed</span>
                          )}
                        </td>

                        <td className="px-5 py-3 text-sm text-zinc-600">
                          {job.category || "N/A"}
                        </td>

                        <td className="px-5 py-3">
                          {job.type ? <Tag>{job.type}</Tag> : "N/A"}
                        </td>

                        <td className="px-5 py-3">
                          <Tag tone={job.isClosed ? "danger" : "success"}>
                            {job.isClosed ? "Closed" : "Open"}
                          </Tag>
                        </td>

                        <td className="px-5 py-3 font-mono text-xs tabular-nums text-zinc-600">
                          {formatDate(job.createdAt)}
                        </td>

                        <td className="px-5 py-3">
                          <div className="flex justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setEditingJob(job)}
                              className={`${ICON_BUTTON} hover:border-[#0f1115]/15 hover:bg-white hover:text-[#0f1115] focus-visible:outline-[#1646e0]`}
                              aria-label={`Edit ${job.title}`}
                              title="Edit"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleToggleStatus(job._id)}
                              className={`${ICON_BUTTON} hover:border-[#e08a00]/30 hover:bg-[#e08a00]/10 hover:text-[#e08a00] focus-visible:outline-[#e08a00]`}
                              aria-label={
                                job.isClosed
                                  ? `Reopen ${job.title}`
                                  : `Close ${job.title}`
                              }
                              title={job.isClosed ? "Reopen" : "Close"}
                            >
                              {job.isClosed ? (
                                <Unlock className="h-4 w-4" />
                              ) : (
                                <Lock className="h-4 w-4" />
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(job._id)}
                              className={`${ICON_BUTTON} hover:border-[#c8412f]/30 hover:bg-[#c8412f]/10 hover:text-[#c8412f] focus-visible:outline-[#c8412f]`}
                              aria-label={`Delete ${job.title}`}
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Footer */}
            {!loading && jobs.length > 0 && (
              <div className="border-t border-zinc-100 px-5 py-3">
                <p className="font-mono text-[11px] tabular-nums text-zinc-500">
                  Showing {visibleJobs.length} of {jobs.length}
                </p>
              </div>
            )}
          </section>
        </Reveal>
      </div>

      {editingJob && (
        <EditJobModal
          job={editingJob}
          onClose={() => setEditingJob(null)}
          onUpdate={(updatedJob) =>
            setJobs((prev) =>
              prev.map((j) => (j._id === updatedJob._id ? updatedJob : j))
            )
          }
        />
      )}

      {creatingJob && (
        <CreateJobModal
          onClose={() => setCreatingJob(false)}
          onCreate={(newJob) => setJobs((prev) => [newJob, ...prev])}
        />
      )}
    </AdminLayout>
  );
};

export default AdminManageJobs;