import { useEffect, useRef, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { Edit3, Plus, Printer, Search, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "../../components/layout/Navbar";
import CreateJobModal from "../Admin/CreateJob";
import EditJobModal from "../Admin/EditJob";

const AdminManageJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingJob, setEditingJob] = useState(null);
  const [creatingJob, setCreatingJob] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchField, setSearchField] = useState("all");
  const tableRef = useRef();

  const fetchJobs = async () => {
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
  };

  useEffect(() => {
    fetchJobs();
  }, []);

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
    if (!window.confirm("Delete this job?")) return;
    try {
      await axiosInstance.delete(`/api/admin/jobs/${jobId}`);
      toast.success("Job deleted successfully");
      fetchJobs();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to delete job");
    }
  };

  const filterJobs = (list, text, field) => {
    const t = text.toLowerCase().trim();
    if (!t) return list;
    return list.filter((job) => {
      if (field === "all") {
        return (
          job.title?.toLowerCase().includes(t) ||
          job.company?.name?.toLowerCase().includes(t) ||
          job.category?.toLowerCase().includes(t) ||
          job.type?.toLowerCase().includes(t)
        );
      }
      if (field === "title") return job.title?.toLowerCase().includes(t);
      if (field === "company") return job.company?.name?.toLowerCase().includes(t);
      if (field === "category") return job.category?.toLowerCase().includes(t);
      if (field === "type") return job.type?.toLowerCase().includes(t);
      return true;
    });
  };

  const handlePrint = (ref) => {
    const printContents = ref.current.innerHTML;
    const newWindow = window.open("", "_blank");
    newWindow.document.write(`
      <html><head><title>Job List</title></head><body>${printContents}</body></html>
    `);
    newWindow.document.close();
    newWindow.focus();
    newWindow.print();
    newWindow.close();
  };

  const visibleJobs = filterJobs(jobs, searchText, searchField);

  return (
    <div className="app-background app-background-admin">
      <Navbar />
      <main className="mx-auto max-w-screen-2xl px-4 pb-12 pt-24 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="text-sm font-bold uppercase text-blue-600">Admin tools</span>
            <h1 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">
              Manage Jobs
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Review listings, update status, and keep job data organized.
            </p>
          </div>
          <button
            onClick={() => setCreatingJob(true)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Create Job
          </button>
        </div>

        <section className="page-panel rounded-lg p-5">
          <div className="mb-5 grid gap-3 md:grid-cols-[1fr_220px_auto]">
            <label className="flex items-center rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
              <Search className="mr-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search jobs"
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
              <option value="title">Job title</option>
              <option value="company">Company</option>
              <option value="category">Category</option>
              <option value="type">Job type</option>
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
            <div className="py-16 text-center font-semibold text-blue-600">Loading jobs...</div>
          ) : visibleJobs.length === 0 ? (
            <div className="py-16 text-center text-slate-500">No jobs found</div>
          ) : (
            <div ref={tableRef} className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
              <table className="soft-table">
                <thead>
                  <tr>
                    <th>Job Title</th>
                    <th>User</th>
                    <th>Category</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Posted On</th>
                    <th className="no-print">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleJobs.map((job) => (
                    <tr key={job._id}>
                      <td className="font-bold text-slate-950">{job.title || "N/A"}</td>
                      <td>{job.company?.name || "N/A"}</td>
                      <td>{job.category || "N/A"}</td>
                      <td>{job.type || "N/A"}</td>
                      <td>
                        <span
                          className={`rounded-lg px-3 py-1 text-xs font-bold ${
                            job.isClosed ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"
                          }`}
                        >
                          {job.isClosed ? "Closed" : "Open"}
                        </span>
                      </td>
                      <td>{job.createdAt ? new Date(job.createdAt).toLocaleDateString() : "N/A"}</td>
                      <td className="no-print">
                        <div className="flex items-center gap-2">
                          <button className="rounded-lg p-2 text-blue-600 hover:bg-blue-50" onClick={() => setEditingJob(job)}>
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button className="rounded-lg p-2 text-amber-600 hover:bg-amber-50" onClick={() => handleToggleStatus(job._id)}>
                            <X className="h-4 w-4" />
                          </button>
                          <button className="rounded-lg p-2 text-red-600 hover:bg-red-50" onClick={() => handleDelete(job._id)}>
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
        </section>

        {editingJob && (
          <EditJobModal
            job={editingJob}
            onClose={() => setEditingJob(null)}
            onUpdate={(updatedJob) =>
              setJobs((prev) => prev.map((j) => (j._id === updatedJob._id ? updatedJob : j)))
            }
          />
        )}
        {creatingJob && (
          <CreateJobModal
            onClose={() => setCreatingJob(false)}
            onCreate={(newJob) => setJobs((prev) => [newJob, ...prev])}
          />
        )}
      </main>
    </div>
  );
};

export default AdminManageJobs;
