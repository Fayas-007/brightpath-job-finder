import { useEffect, useRef, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import toast from "react-hot-toast";
import { Eye, Printer, Search, Trash } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";

const STATUS_OPTIONS = ["Applied", "In Review", "Accepted", "Rejected"];

const statusStyle = {
  Applied: "bg-blue-50 text-blue-700",
  "In Review": "bg-amber-50 text-amber-700",
  Accepted: "bg-green-50 text-green-700",
  Rejected: "bg-red-50 text-red-700",
};

const ManageApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [searchField, setSearchField] = useState("all");
  const tableRef = useRef();
  const navigate = useNavigate();

  const fetchApplications = async () => {
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
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleStatusChange = async (appId, newStatus) => {
    try {
      await axiosInstance.put(`/api/admin/applications/${appId}/status`, { status: newStatus });
      toast.success("Status updated");
      setApplications((prev) =>
        prev.map((app) => (app._id === appId ? { ...app, status: newStatus } : app))
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (appId) => {
    const confirmed = window.confirm("Delete this application? This action cannot be undone.");
    if (!confirmed) return;

    try {
      await axiosInstance.delete(`/api/admin/applications/${appId}`);
      toast.success("Application deleted");
      setApplications((prev) => prev.filter((app) => app._id !== appId));
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to delete application");
    }
  };

  const filterApplications = (list, text, field) => {
    const t = text.toLowerCase().trim();
    if (!t) return list;
    return list.filter((app) => {
      if (field === "all") {
        return (
          app.applicant?.name?.toLowerCase().includes(t) ||
          app.job?.title?.toLowerCase().includes(t) ||
          app.status?.toLowerCase().includes(t)
        );
      }
      if (field === "applicant") return app.applicant?.name?.toLowerCase().includes(t);
      if (field === "job") return app.job?.title?.toLowerCase().includes(t);
      if (field === "status") return app.status?.toLowerCase().includes(t);
      return true;
    });
  };

  const handlePrint = (ref) => {
    const printContents = ref.current.innerHTML;
    const newWindow = window.open("", "_blank");
    newWindow.document.write(`<html><body>${printContents}</body></html>`);
    newWindow.document.close();
    newWindow.focus();
    newWindow.print();
    newWindow.close();
  };

  const visibleApplications = filterApplications(applications, searchText, searchField);

  return (
    <div className="app-background app-background-admin">
      <Navbar />
      <main className="mx-auto max-w-screen-2xl px-4 pb-12 pt-24 sm:px-6 lg:px-8">
        <div className="mb-6">
          <span className="text-sm font-bold uppercase text-blue-600">Admin tools</span>
          <h1 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">
            Manage Applications
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Track every application and keep candidate status current.
          </p>
        </div>

        <section className="page-panel rounded-lg p-5">
          <div className="mb-5 grid gap-3 md:grid-cols-[1fr_220px_auto]">
            <label className="flex items-center rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
              <Search className="mr-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search applications"
                className="w-full bg-transparent text-sm font-semibold outline-none"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </label>
            <select
              className="field-control"
              value={searchField}
              onChange={(e) => setSearchField(e.target.value)}
            >
              <option value="all">All</option>
              <option value="applicant">Applicant</option>
              <option value="job">Job</option>
              <option value="status">Status</option>
            </select>
            <button
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-100"
              onClick={() => handlePrint(tableRef)}
            >
              <Printer className="h-4 w-4" />
              Print
            </button>
          </div>

          {loading ? (
            <div className="py-16 text-center font-semibold text-blue-600">Loading applications...</div>
          ) : visibleApplications.length === 0 ? (
            <div className="py-16 text-center text-slate-500">No applications found</div>
          ) : (
            <div ref={tableRef} className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
              <table className="soft-table">
                <thead>
                  <tr>
                    <th>Applicant</th>
                    <th>Job</th>
                    <th>Status</th>
                    <th>Applied At</th>
                    <th className="no-print">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleApplications.map((app) => (
                    <tr key={app._id}>
                      <td className="font-bold text-slate-950">{app.applicant?.name || "N/A"}</td>
                      <td>{app.job?.title || "N/A"}</td>
                      <td>
                        <select
                          className={`rounded-lg border-0 px-3 py-1.5 text-xs font-bold outline-none ${statusStyle[app.status] || "bg-slate-100 text-slate-700"}`}
                          value={app.status}
                          onChange={(e) => handleStatusChange(app._id, e.target.value)}
                        >
                          {STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </td>
                      <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                      <td className="no-print">
                        <div className="flex items-center gap-2">
                          <button
                            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                            onClick={() => navigate(`/admin/applications/${app._id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                            onClick={() => handleDelete(app._id)}
                          >
                            <Trash className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default ManageApplications;
