import { useCallback, useEffect, useMemo, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import toast from "react-hot-toast";
import { Eye, Printer, Search, Trash2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/layout/AdminLayout";
import { MaskText, Reveal } from "../../components/common/motion";

/* ---------------------------------------------
   Constants
--------------------------------------------- */

const STATUS_OPTIONS = ["Applied", "In Review", "Accepted", "Rejected"];

// Same semantic colours as the dashboard pipeline.
const STATUS_STYLE = {
  Applied: "border-[#71717a]/30 bg-[#71717a]/10 text-[#71717a]",
  "In Review": "border-[#e08a00]/30 bg-[#e08a00]/10 text-[#b86f00]",
  Accepted: "border-[#2f8f6b]/30 bg-[#2f8f6b]/10 text-[#2f8f6b]",
  Rejected: "border-[#c8412f]/30 bg-[#c8412f]/10 text-[#c8412f]",
};

const SEARCH_FIELDS = [
  { value: "all", label: "All fields" },
  { value: "applicant", label: "Applicant" },
  { value: "job", label: "Job" },
  { value: "status", label: "Status" },
];

/* ---------------------------------------------
   Helpers
--------------------------------------------- */

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString("en-GB") : "N/A";

const getSearchValues = (app, field) => {
  const values = {
    applicant: app.applicant?.name,
    job: app.job?.title,
    status: app.status,
  };

  return field === "all" ? Object.values(values) : [values[field]];
};

const filterApplications = (list, text, field) => {
  const term = text.toLowerCase().trim();

  if (!term) return list;

  return list.filter((app) =>
    getSearchValues(app, field).some((value) =>
      (value || "").toLowerCase().includes(term)
    )
  );
};

const handlePrint = (list) => {
  const rows = list
    .map(
      (app) => `
        <tr>
          <td>${escapeHtml(app.applicant?.name || "N/A")}</td>
          <td>${escapeHtml(app.job?.title || "N/A")}</td>
          <td>${escapeHtml(app.status || "N/A")}</td>
          <td>${escapeHtml(formatDate(app.createdAt))}</td>
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
        <title>Application list</title>
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
        <h1>Application list</h1>
        <p>${list.length} records · printed ${new Date().toLocaleDateString("en-GB")}</p>
        <table>
          <thead>
            <tr>
              <th>Applicant</th>
              <th>Job</th>
              <th>Status</th>
              <th>Applied at</th>
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

const Initial = ({ name = "" }) => (
  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-[#0f1115] font-mono text-sm font-bold uppercase text-white">
    {name.trim().charAt(0) || "?"}
  </span>
);

const SkeletonRows = () => (
  <div className="animate-pulse divide-y divide-zinc-100">
    {[1, 2, 3, 4].map((row) => (
      <div key={row} className="flex items-center gap-4 px-5 py-4">
        <div className="h-9 w-9 rounded-md bg-zinc-200" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-40 rounded-sm bg-zinc-200" />
          <div className="h-3 w-56 rounded-sm bg-zinc-100" />
        </div>
        <div className="h-6 w-24 rounded-sm bg-zinc-200" />
      </div>
    ))}
  </div>
);

const TH_CLASS =
  "px-5 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500";

const ICON_BUTTON =
  "flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-zinc-600 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2";

/* ---------------------------------------------
   Manage Applications
--------------------------------------------- */

const ManageApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [searchField, setSearchField] = useState("all");
  const navigate = useNavigate();

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/api/admin/applications");
      setApplications(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch applications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleStatusChange = async (appId, newStatus) => {
    try {
      setUpdatingId(appId);
      await axiosInstance.put(`/api/admin/applications/${appId}/status`, {
        status: newStatus,
      });
      toast.success("Status updated");
      setApplications((prev) =>
        prev.map((app) =>
          app._id === appId ? { ...app, status: newStatus } : app
        )
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (appId) => {
    const confirmed = window.confirm(
      "Delete this application? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      await axiosInstance.delete(`/api/admin/applications/${appId}`);
      toast.success("Application deleted");
      setApplications((prev) => prev.filter((app) => app._id !== appId));
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message || "Failed to delete application"
      );
    }
  };

  const visibleApplications = useMemo(
    () => filterApplications(applications, searchText, searchField),
    [applications, searchText, searchField]
  );

  return (
    <AdminLayout
      title="Applications"
      badges={{ applications: applications.length }}
    >
      <div className="relative z-10 mx-auto w-full max-w-[1400px] space-y-6">
        {/* Title row */}
        <div>
          <Reveal variant="fade">
            <Label>Moderation</Label>
          </Reveal>

          <h1 className="mt-2 text-3xl font-extrabold tracking-normal text-[#0f1115] sm:text-4xl">
            <MaskText delay={100}>Manage applications</MaskText>
          </h1>

          <Reveal variant="fade" delay={200}>
            <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-500">
              Track every application and keep candidate status current.
            </p>
          </Reveal>
        </div>

        <Reveal delay={150}>
          <section className="min-w-0 overflow-hidden rounded-md border border-[#0f1115]/10 bg-white">
            {/* Header */}
            <div className="flex flex-col gap-4 border-b border-zinc-100 px-5 py-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <Label>Candidates</Label>

                <h2 className="mt-1.5 flex items-center gap-3 text-base font-bold tracking-normal text-[#0f1115]">
                  All applications
                  <span className="rounded-sm bg-[#0f1115] px-2 py-0.5 font-mono text-[11px] font-bold tabular-nums text-white">
                    {applications.length}
                  </span>
                </h2>
              </div>

              <button
                type="button"
                onClick={() => handlePrint(visibleApplications)}
                disabled={visibleApplications.length === 0}
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
                  placeholder="Search applications"
                  aria-label="Search applications"
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
            ) : visibleApplications.length === 0 ? (
              <p className="px-5 py-14 text-center text-sm text-zinc-500">
                {searchText
                  ? "No applications match your search."
                  : "No applications have been submitted yet."}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left">
                  <thead>
                    <tr className="bg-[#ececef]">
                      <th className={TH_CLASS}>Applicant</th>
                      <th className={TH_CLASS}>Job</th>
                      <th className={TH_CLASS}>Status</th>
                      <th className={TH_CLASS}>Applied at</th>
                      <th className={`${TH_CLASS} text-right`}>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {visibleApplications.map((app, index) => (
                      <tr
                        key={app._id}
                        className="m-row border-t border-zinc-100 transition-colors hover:bg-[#f4f4f5]"
                        style={{
                          "--m-row-delay": `${Math.min(index, 12) * 35}ms`,
                        }}
                      >
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <Initial name={app.applicant?.name} />
                            <span className="text-sm font-bold text-[#0f1115]">
                              {app.applicant?.name || "N/A"}
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-3 text-sm text-zinc-600">
                          {app.job?.title || "N/A"}
                        </td>

                        <td className="px-5 py-3">
                          <select
                            value={app.status}
                            disabled={updatingId === app._id}
                            onChange={(e) =>
                              handleStatusChange(app._id, e.target.value)
                            }
                            aria-label={`Status for ${
                              app.applicant?.name || "applicant"
                            }`}
                            className={`h-8 cursor-pointer rounded-sm border px-2 font-mono text-[10px] font-bold uppercase tracking-[0.1em] focus:outline-none focus:ring-2 focus:ring-[#1646e0]/30 disabled:cursor-wait disabled:opacity-60 ${
                              STATUS_STYLE[app.status] ||
                              "border-zinc-300 bg-zinc-100 text-zinc-600"
                            }`}
                          >
                            {STATUS_OPTIONS.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td className="px-5 py-3 font-mono text-xs tabular-nums text-zinc-600">
                          {formatDate(app.createdAt)}
                        </td>

                        <td className="px-5 py-3">
                          <div className="flex justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                navigate(`/admin/applications/${app._id}`)
                              }
                              className={`${ICON_BUTTON} hover:border-[#0f1115]/15 hover:bg-white hover:text-[#0f1115] focus-visible:outline-[#1646e0]`}
                              aria-label={`View application from ${
                                app.applicant?.name || "applicant"
                              }`}
                              title="View"
                            >
                              <Eye className="h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(app._id)}
                              className={`${ICON_BUTTON} hover:border-[#c8412f]/30 hover:bg-[#c8412f]/10 hover:text-[#c8412f] focus-visible:outline-[#c8412f]`}
                              aria-label={`Delete application from ${
                                app.applicant?.name || "applicant"
                              }`}
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
            {!loading && applications.length > 0 && (
              <div className="border-t border-zinc-100 px-5 py-3">
                <p className="font-mono text-[11px] tabular-nums text-zinc-500">
                  Showing {visibleApplications.length} of {applications.length}
                </p>
              </div>
            )}
          </section>
        </Reveal>
      </div>
    </AdminLayout>
  );
};

export default ManageApplications;