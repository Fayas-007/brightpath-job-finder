import { useState, useMemo, useEffect } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  ChevronUp,
  ChevronDown,
  Users,
  BriefcaseBusiness,
  CircleCheck,
  CirclePause,
  ArrowUpRight,
  MapPin,
  CalendarDays,
  X,
  RefreshCw,
  SlidersHorizontal,
  Inbox,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { formatDate } from "../../utils/dateUtils";
import toast from "react-hot-toast";
import DashboardLayout from "../../components/layout/DashboardLayout";

const DISPLAY_FONT = {
  fontFamily: "'Bricolage Grotesque', 'Hanken Grotesk', system-ui, sans-serif",
};

const BODY_FONT = {
  fontFamily: "'Hanken Grotesk', system-ui, sans-serif",
};

const ITEMS_PER_PAGE = 8;

/* ---------- Small components ---------- */

const StatusBadge = ({ status }) => {
  const isActive = status === "Active";

  return (
    <div className="flex flex-col items-start gap-1">
      <span
        className={`inline-flex items-center gap-2 text-sm font-bold ${
          isActive ? "text-[#187447]" : "text-slate-500"
        }`}
      >
        <span
          className={`relative flex h-2.5 w-2.5 items-center justify-center rounded-full ${
            isActive ? "bg-[#22965b]" : "bg-slate-400"
          }`}
        >
          {isActive && (
            <span className="absolute h-2.5 w-2.5 animate-ping rounded-full bg-[#22965b]/30" />
          )}
        </span>
        {isActive ? "Active" : "Closed"}
      </span>

      <span className="pl-[18px] text-[11px] font-medium text-slate-400">
        {isActive ? "Accepting applications" : "Not accepting applications"}
      </span>
    </div>
  );
};

const MetricCard = ({ label, value, description, icon: Icon, accent }) => (
  <div className="relative overflow-hidden rounded-xl border border-[#0a1f6b]/10 bg-white p-5">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-sm font-semibold text-slate-500">{label}</p>

        <p
          style={DISPLAY_FONT}
          className="mt-3 text-3xl font-bold leading-none text-[#0a1f6b]"
        >
          {value}
        </p>

        <p className="mt-2 text-xs text-slate-500">{description}</p>
      </div>

      <div
        className={`flex h-10 w-10 items-center justify-center rounded-lg ${accent}`}
      >
        <Icon className="h-5 w-5" />
      </div>
    </div>
  </div>
);

const SortButton = ({
  label,
  field,
  sortField,
  sortDirection,
  onSort,
}) => {
  const isSelected = sortField === field;

  return (
    <button
      type="button"
      onClick={() => onSort(field)}
      className={`inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.09em] transition-colors ${
        isSelected
          ? "text-white"
          : "text-white/80 hover:text-white"
      }`}
    >
      {label}

      {isSelected ? (
        sortDirection === "asc" ? (
          <ChevronUp className="h-3.5 w-3.5 text-[#ffd23f]" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-[#ffd23f]" />
        )
      ) : (
        <ChevronUp className="h-3.5 w-3.5 text-white/45" />
      )}
    </button>
  );
};

const EmptyState = ({ hasFilters, onClear, onCreate }) => (
  <div className="flex min-h-[340px] flex-col items-center justify-center px-6 py-12 text-center">
    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#eef3ff] text-[#1646e0]">
      {hasFilters ? (
        <Search className="h-6 w-6" />
      ) : (
        <Inbox className="h-6 w-6" />
      )}
    </div>

    <h3
      style={DISPLAY_FONT}
      className="mt-5 text-2xl font-bold text-[#0a1f6b]"
    >
      {hasFilters ? "No matching jobs" : "Your hiring board is empty"}
    </h3>

    <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
      {hasFilters
        ? "Try changing your search or status filter to find the job you're looking for."
        : "Your published opportunities will appear here. Create your first listing to start attracting candidates."}
    </p>

    {hasFilters ? (
      <button
        type="button"
        onClick={onClear}
        className="mt-5 inline-flex items-center gap-2 rounded-lg border border-[#0a1f6b]/20 px-5 py-2.5 text-sm font-semibold text-[#0a1f6b] transition-colors hover:bg-[#eef3ff]"
      >
        <X className="h-4 w-4" />
        Clear filters
      </button>
    ) : (
      <button
        type="button"
        onClick={onCreate}
        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#ffd23f] px-5 py-3 text-sm font-bold text-[#0a1f6b] transition-colors hover:bg-[#f5c400]"
      >
        <Plus className="h-4 w-4" />
        Post your first job
      </button>
    )}
  </div>
);

/* ---------- Main page ---------- */

const ManageJobs = () => {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState("datePosted");
  const [sortDirection, setSortDirection] = useState("desc");
  const [isLoading, setIsLoading] = useState(true);
  const [updatingJobId, setUpdatingJobId] = useState(null);
  const [deletingJobId, setDeletingJobId] = useState(null);

  /* ---------- Fetch jobs ---------- */

  const getPostedJobs = async (showLoader = true) => {
    if (showLoader) setIsLoading(true);

    try {
      const response = await axiosInstance.get(
        API_PATHS.JOBS.GET_JOBS_EMPLOYER
      );

      if (response.status === 200) {
        const formattedJobs = (response.data || []).map((job) => ({
          id: job._id,
          title: job.title || "Untitled position",
          company:
            job.company?.companyName || job.company?.name || "Company",
          location: job.location || "Location not specified",
          status: job.isClosed ? "Closed" : "Active",
          applicants: Number(job.applicationCount || 0),
          datePosted: formatDate(job.createdAt),
          createdAt: job.createdAt,
          logo: job.company?.avatar,
          category: job.category || "",
          type: job.type || "",
        }));

        setJobs(formattedJobs);
      }
    } catch (error) {
      console.error("Error fetching posted jobs:", error);
      toast.error(
        error.response?.data?.message || "Unable to load your job listings."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getPostedJobs();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- Metrics ---------- */

  const metrics = useMemo(() => {
    const active = jobs.filter((job) => job.status === "Active").length;
    const closed = jobs.filter((job) => job.status === "Closed").length;

    const applicants = jobs.reduce(
      (total, job) => total + job.applicants,
      0
    );

    return {
      total: jobs.length,
      active,
      closed,
      applicants,
    };
  }, [jobs]);

  /* ---------- Filtering and sorting ---------- */

  const filteredAndSortedJobs = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    const filtered = jobs.filter((job) => {
      const matchesSearch =
        job.title.toLowerCase().includes(query) ||
        job.company.toLowerCase().includes(query) ||
        job.location.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" || job.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    return [...filtered].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === "applicants") {
        aValue = Number(aValue);
        bValue = Number(bValue);
      }

      if (sortField === "datePosted") {
        aValue = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        bValue = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      }

      if (aValue == null) aValue = "";
      if (bValue == null) bValue = "";

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = String(bValue).toLowerCase();
      }

      const comparison =
        aValue > bValue ? 1 : aValue < bValue ? -1 : 0;

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [jobs, searchTerm, statusFilter, sortField, sortDirection]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  /* ---------- Pagination ---------- */

  const totalPages = Math.ceil(
    filteredAndSortedJobs.length / ITEMS_PER_PAGE
  );

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  const paginatedJobs = filteredAndSortedJobs.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  /* ---------- Actions ---------- */

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((direction) =>
        direction === "asc" ? "desc" : "asc"
      );
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleStatusChange = async (jobId) => {
    setUpdatingJobId(jobId);

    try {
      await axiosInstance.put(API_PATHS.JOBS.TOGGLE_CLOSE(jobId));

      toast.success("Job status updated successfully.");
      await getPostedJobs(false);
    } catch (error) {
      console.error("Error toggling job status:", error);
      toast.error(
        error.response?.data?.message || "Unable to update job status."
      );
    } finally {
      setUpdatingJobId(null);
    }
  };

  const handleDeleteJob = async (jobId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this job listing? This action cannot be undone."
    );

    if (!confirmed) return;

    setDeletingJobId(jobId);

    try {
      await axiosInstance.delete(API_PATHS.JOBS.DELETE_JOB(jobId));

      setJobs((previousJobs) =>
        previousJobs.filter((job) => job.id !== jobId)
      );

      toast.success("Job listing deleted successfully.");
    } catch (error) {
      console.error("Error deleting job:", error);
      toast.error(
        error.response?.data?.message || "Unable to delete this job."
      );
    } finally {
      setDeletingJobId(null);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setCurrentPage(1);
  };

  const hasFilters =
    searchTerm.trim() !== "" || statusFilter !== "All";

  /* ---------- Render ---------- */

  return (
    <DashboardLayout activeMenu="manage-jobs">
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
                Hiring workspace
              </div>

              <h1
                style={DISPLAY_FONT}
                className="text-4xl font-bold leading-[1.05] tracking-normal text-[#0a1f6b] sm:text-5xl"
              >
                Manage your
                <br className="hidden sm:block" /> open positions.
              </h1>

              <p className="mt-4 max-w-lg text-[15px] leading-6 text-slate-600">
                Keep your opportunities organized, monitor candidate activity,
                and make updates to your job listings.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/post-job")}
              className="inline-flex min-h-12 items-center justify-center gap-2 self-start rounded-lg bg-[#ffd23f] px-6 text-sm font-bold text-[#0a1f6b] transition-colors hover:bg-[#f5c400] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0a1f6b] lg:self-auto"
            >
              <Plus className="h-4 w-4" />
              Post a new job
            </button>
          </div>

          <div className="pointer-events-none absolute -bottom-16 right-8 hidden h-56 w-56 rounded-full border-[32px] border-white/60 lg:block" />
          <div className="pointer-events-none absolute -bottom-8 right-32 hidden h-28 w-28 rounded-full bg-[#ffd23f]/20 lg:block" />
        </section>

        {/* Overview */}
        <section>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2
                style={DISPLAY_FONT}
                className="text-xl font-bold leading-tight text-[#0a1f6b]"
              >
                Your hiring overview
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                A snapshot of your current job listings.
              </p>
            </div>

            <span className="text-xs font-semibold text-slate-400">
              {metrics.total} total{" "}
              {metrics.total === 1 ? "listing" : "listings"}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Total positions"
              value={metrics.total}
              description="All your job listings"
              icon={BriefcaseBusiness}
              accent="bg-[#eef3ff] text-[#1646e0]"
            />

            <MetricCard
              label="Active positions"
              value={metrics.active}
              description="Currently accepting applications"
              icon={CircleCheck}
              accent="bg-[#eaf5ee] text-[#187447]"
            />

            <MetricCard
              label="Closed positions"
              value={metrics.closed}
              description="No longer accepting applications"
              icon={CirclePause}
              accent="bg-[#f1f2f5] text-slate-600"
            />

            <MetricCard
              label="Total applicants"
              value={metrics.applicants}
              description="Across all your positions"
              icon={Users}
              accent="bg-[#fff6d8] text-[#9a7000]"
            />
          </div>
        </section>

        {/* Job listings */}
        <section className="overflow-hidden rounded-2xl border border-[#0a1f6b]/10 bg-white">
          {/* List heading */}
          <div className="flex flex-col gap-3 border-b border-[#0a1f6b]/10 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <div>
              <h2
                style={DISPLAY_FONT}
                className="text-2xl font-bold leading-tight text-[#0a1f6b]"
              >
                Job listings
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                View and manage every opportunity you've published.
              </p>
            </div>

            <button
              type="button"
              onClick={() => getPostedJobs()}
              disabled={isLoading}
              className="inline-flex min-h-10 items-center justify-center gap-2 self-start rounded-lg border border-[#0a1f6b]/20 px-4 text-sm font-semibold text-[#0a1f6b] transition-colors hover:bg-[#eef3ff] disabled:opacity-50 sm:self-auto"
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>

          {/* Search and filters */}
          <div className="flex flex-col gap-3 border-b border-[#0a1f6b]/10 bg-[#fafbfe] px-5 py-4 sm:flex-row sm:items-center sm:px-7">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by job title, company or location..."
                className="min-h-11 w-full rounded-lg border border-[#0a1f6b]/15 bg-white pl-10 pr-4 text-sm text-[#0a1f6b] outline-none transition-colors placeholder:text-slate-400 hover:border-[#0a1f6b]/30 focus:border-[#1646e0] focus:ring-4 focus:ring-[#1646e0]/10"
              />
            </div>

            <div className="relative sm:w-48">
              <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="min-h-11 w-full appearance-none rounded-lg border border-[#0a1f6b]/15 bg-white pl-9 pr-9 text-sm font-semibold text-[#0a1f6b] outline-none transition-colors hover:border-[#0a1f6b]/30 focus:border-[#1646e0] focus:ring-4 focus:ring-[#1646e0]/10"
              >
                <option value="All">All statuses</option>
                <option value="Active">Active</option>
                <option value="Closed">Closed</option>
              </select>

              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          {/* Results bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-7">
            <p className="text-sm text-slate-500">
              Showing{" "}
              <span className="font-bold text-[#0a1f6b]">
                {filteredAndSortedJobs.length === 0
                  ? 0
                  : startIndex + 1}
                {"–"}
                {Math.min(
                  startIndex + ITEMS_PER_PAGE,
                  filteredAndSortedJobs.length
                )}
              </span>{" "}
              of{" "}
              <span className="font-bold text-[#0a1f6b]">
                {filteredAndSortedJobs.length}
              </span>{" "}
              positions
            </p>

            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs font-bold text-[#1646e0] transition-colors hover:text-[#0a1f6b]"
              >
                Clear filters
              </button>
            )}
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="space-y-0">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="flex animate-pulse items-center gap-4 border-t border-slate-100 px-5 py-6 sm:px-7"
                >
                  <div className="h-11 w-11 rounded-lg bg-slate-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-40 rounded bg-slate-100" />
                    <div className="h-3 w-28 rounded bg-slate-100" />
                  </div>
                  <div className="hidden h-6 w-16 rounded bg-slate-100 sm:block" />
                  <div className="hidden h-6 w-20 rounded bg-slate-100 md:block" />
                </div>
              ))}
            </div>
          ) : filteredAndSortedJobs.length === 0 ? (
            <EmptyState
              hasFilters={hasFilters}
              onClear={clearFilters}
              onCreate={() => navigate("/post-job")}
            />
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="bg-[#0a1f6b]">
                      <th className="px-7 py-5">
                        <SortButton
                          label="Position"
                          field="title"
                          sortField={sortField}
                          sortDirection={sortDirection}
                          onSort={handleSort}
                        />
                      </th>

                      <th className="px-5 py-5">
                        <SortButton
                          label="Status"
                          field="status"
                          sortField={sortField}
                          sortDirection={sortDirection}
                          onSort={handleSort}
                        />
                      </th>

                      <th className="px-5 py-5">
                        <SortButton
                          label="Applicants"
                          field="applicants"
                          sortField={sortField}
                          sortDirection={sortDirection}
                          onSort={handleSort}
                        />
                      </th>

                      <th className="px-5 py-5">
                        <SortButton
                          label="Date posted"
                          field="datePosted"
                          sortField={sortField}
                          sortDirection={sortDirection}
                          onSort={handleSort}
                        />
                      </th>

                      <th className="px-7 py-5 text-right">
                        <span className="text-[11px] font-bold uppercase tracking-[0.09em] text-white">
                          Actions
                        </span>
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedJobs.map((job, index) => (
                      <tr
                        key={job.id}
                        className={`group border-b border-[#0a1f6b]/[0.07] transition-colors last:border-b-0 ${
                          index % 2 === 0
                            ? "bg-white hover:bg-[#f2f6ff]"
                            : "bg-[#f7f9fd] hover:bg-[#edf3ff]"
                        }`}
                      >
                        {/* Position */}
                        <td className="px-7 py-6">
                          <div className="flex min-w-[250px] items-center gap-4">
                            <div className="h-10 w-[3px] flex-shrink-0 rounded-full bg-[#1646e0]/70 transition-colors group-hover:bg-[#ffd23f]" />

                            <div className="min-w-0">
                              <p className="truncate text-[14px] font-bold text-[#0a1f6b] transition-colors group-hover:text-[#1646e0]">
                                {job.title}
                              </p>

                              <p className="mt-1 text-xs font-semibold text-slate-500">
                                {job.company}
                              </p>

                              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-400">
                                <MapPin className="h-3.5 w-3.5 text-[#1646e0]/70" />
                                {job.location}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-6">
                          <StatusBadge status={job.status} />
                        </td>

                        {/* Applicants */}
                        <td className="px-5 py-6">
                          <button
                            type="button"
                            onClick={() => navigate(`/applicants/${job.id}`)}
                            className="group/applicants inline-flex items-center gap-2 text-sm font-bold text-[#1646e0] transition-colors hover:text-[#0a1f6b]"
                          >
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eaf0ff] text-[#1646e0] transition-colors group-hover/applicants:bg-[#dce7ff]">
                              <Users className="h-4 w-4" />
                            </span>

                            <span>{job.applicants}</span>

                            <ArrowUpRight className="h-3.5 w-3.5 text-[#1646e0]/50 transition-transform group-hover/applicants:-translate-y-0.5 group-hover/applicants:translate-x-0.5 group-hover/applicants:text-[#1646e0]" />
                          </button>
                        </td>

                        {/* Date */}
                        <td className="px-5 py-6">
                          <div className="inline-flex items-center gap-2.5 text-xs font-semibold text-slate-600">
                            <CalendarDays className="h-4 w-4 text-[#1646e0]/75" />
                            {job.datePosted || "—"}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-7 py-6">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              title="Edit job"
                              aria-label={`Edit ${job.title}`}
                              onClick={() =>
                                navigate("/post-job", {
                                  state: { jobId: job.id },
                                })
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-lg text-[#1646e0] transition-all hover:bg-[#eaf0ff] hover:text-[#0a1f6b]"
                            >
                              <Edit className="h-[17px] w-[17px]" />
                            </button>

                            <button
                              type="button"
                              disabled={updatingJobId === job.id}
                              onClick={() => handleStatusChange(job.id)}
                              className={`inline-flex h-9 items-center justify-center gap-2 rounded-lg px-3 text-xs font-bold transition-all disabled:opacity-50 ${
                                job.status === "Active"
                                  ? "bg-[#fff5d6] text-[#805d00] hover:bg-[#ffe9a3]"
                                  : "bg-[#e6f6ed] text-[#187447] hover:bg-[#d3efdf]"
                              }`}
                            >
                              {updatingJobId === job.id ? (
                                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                              ) : job.status === "Active" ? (
                                <CirclePause className="h-3.5 w-3.5" />
                              ) : (
                                <CircleCheck className="h-3.5 w-3.5" />
                              )}

                              {job.status === "Active" ? "Close" : "Activate"}
                            </button>

                            <button
                              type="button"
                              title="Delete job"
                              aria-label={`Delete ${job.title}`}
                              disabled={deletingJobId === job.id}
                              onClick={() => handleDeleteJob(job.id)}
                              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                            >
                              {deletingJobId === job.id ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile and tablet cards */}
              <div className="divide-y divide-[#0a1f6b]/10 lg:hidden">
                {paginatedJobs.map((job) => (
                  <article
                    key={job.id}
                    className="bg-white p-5 transition-colors hover:bg-[#f6f8fd] sm:p-6"
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-[3px] flex-shrink-0 rounded-full bg-[#1646e0]" />

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="text-sm font-bold text-[#0a1f6b]">
                              {job.title}
                            </h3>

                            <p className="mt-1 text-xs font-semibold text-slate-500">
                              {job.company}
                            </p>
                          </div>

                          <StatusBadge status={job.status} />
                        </div>

                        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-[#1646e0]" />
                            {job.location}
                          </span>

                          <span className="inline-flex items-center gap-1">
                            <CalendarDays className="h-3.5 w-3.5 text-[#1646e0]" />
                            {job.datePosted || "—"}
                          </span>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
                          <button
                            type="button"
                            onClick={() => navigate(`/applicants/${job.id}`)}
                            className="inline-flex items-center gap-2 text-sm font-bold text-[#1646e0]"
                          >
                            <Users className="h-4 w-4" />
                            {job.applicants} applicants
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </button>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              title="Edit job"
                              aria-label={`Edit ${job.title}`}
                              onClick={() =>
                                navigate("/post-job", {
                                  state: { jobId: job.id },
                                })
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-lg text-[#1646e0] hover:bg-[#eaf0ff]"
                            >
                              <Edit className="h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              title={
                                job.status === "Active"
                                  ? "Close job"
                                  : "Activate job"
                              }
                              disabled={updatingJobId === job.id}
                              onClick={() => handleStatusChange(job.id)}
                              className="flex h-9 w-9 items-center justify-center rounded-lg text-[#886300] hover:bg-[#fff6d8] disabled:opacity-50"
                            >
                              {updatingJobId === job.id ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                              ) : job.status === "Active" ? (
                                <CirclePause className="h-4 w-4" />
                              ) : (
                                <CircleCheck className="h-4 w-4" />
                              )}
                            </button>

                            <button
                              type="button"
                              title="Delete job"
                              aria-label={`Delete ${job.title}`}
                              disabled={deletingJobId === job.id}
                              onClick={() => handleDeleteJob(job.id)}
                              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                            >
                              {deletingJobId === job.id ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col gap-4 border-t border-[#0a1f6b]/10 bg-[#f6f8fd] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                  <p className="text-xs font-medium text-slate-500">
                    Page{" "}
                    <span className="font-bold text-[#0a1f6b]">
                      {currentPage}
                    </span>{" "}
                    of{" "}
                    <span className="font-bold text-[#0a1f6b]">
                      {totalPages}
                    </span>
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentPage((page) => Math.max(1, page - 1))
                      }
                      disabled={currentPage === 1}
                      className="min-h-9 rounded-lg border border-[#0a1f6b]/15 bg-white px-4 text-xs font-bold text-[#0a1f6b] transition-colors hover:bg-[#eaf0ff] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Previous
                    </button>

                    {Array.from(
                      { length: totalPages },
                      (_, index) => index + 1
                    ).map((page) => (
                      <button
                        key={page}
                        type="button"
                        onClick={() => setCurrentPage(page)}
                        aria-current={
                          currentPage === page ? "page" : undefined
                        }
                        className={`h-9 min-w-9 rounded-lg px-2 text-xs font-bold transition-colors ${
                          currentPage === page
                            ? "bg-[#1646e0] text-white shadow-sm"
                            : "border border-[#0a1f6b]/15 bg-white text-[#0a1f6b] hover:bg-[#eaf0ff]"
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      type="button"
                      onClick={() =>
                        setCurrentPage((page) =>
                          Math.min(totalPages, page + 1)
                        )
                      }
                      disabled={currentPage === totalPages}
                      className="min-h-9 rounded-lg border border-[#0a1f6b]/15 bg-white px-4 text-xs font-bold text-[#0a1f6b] transition-colors hover:bg-[#eaf0ff] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </section>

        {/* Bottom note */}
        <div className="flex flex-col gap-2 border-l-[3px] border-[#ffd23f] py-1 pl-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-[#0a1f6b]">
            Keep your opportunities up to date.
          </p>

          <p className="text-xs text-slate-500">
            Candidates see the latest information on your active listings.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ManageJobs;