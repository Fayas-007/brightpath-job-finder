import { useCallback, useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  Grid,
  List,
  Search,
  X,
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import FilterContent from "./components/FilterContent";
import SearchHeader from "./components/SearchHeader";
import Navbar from "../../components/layout/Navbar";
import JobCard from "../../components/Cards/JobCard";
import Footer from "../LandingPage/components/Footer";

const PAGE_SIZE = 12;

const EMPTY_FILTERS = {
  keyword: "",
  location: "",
  category: "",
  type: "",
  minSalary: "",
  maxSalary: "",
};

const EMPTY_PAGINATION = {
  page: 1,
  limit: PAGE_SIZE,
  total: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,
};

/* ---------------------------------------------
   Small components
--------------------------------------------- */

const SkeletonCard = () => (
  <div className="animate-pulse rounded-2xl border border-[#0a1f6b]/10 bg-white p-5">
    <div className="flex items-center gap-3">
      <div className="h-12 w-12 rounded-xl bg-slate-200" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-3/4 rounded bg-slate-200" />
        <div className="h-3 w-1/2 rounded bg-slate-100" />
      </div>
    </div>
    <div className="mt-5 space-y-2">
      <div className="h-3 w-full rounded bg-slate-100" />
      <div className="h-3 w-5/6 rounded bg-slate-100" />
    </div>
    <div className="mt-5 flex gap-2">
      <div className="h-6 w-16 rounded-full bg-slate-200" />
      <div className="h-6 w-20 rounded-full bg-slate-200" />
    </div>
  </div>
);

const Chip = ({ label, onRemove }) => (
  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#1646e0]/25 bg-[#eef3ff] py-1 pl-3 pr-1.5 text-[13px] font-semibold text-[#0a1f6b]">
    {label}
    <button
      type="button"
      onClick={onRemove}
      aria-label={`Remove filter ${label}`}
      className="flex h-5 w-5 items-center justify-center rounded-full text-[#1646e0] transition-colors hover:bg-[#1646e0] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#1646e0]"
    >
      <X className="h-3 w-3" />
    </button>
  </span>
);

const PageButton = ({ onClick, disabled, children, label }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-label={label}
    className="inline-flex items-center gap-1.5 rounded-lg border border-[#0a1f6b]/15 bg-white px-4 py-2.5 text-sm font-bold text-[#0a1f6b] transition-colors hover:border-[#1646e0] hover:text-[#1646e0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1646e0] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[#0a1f6b]/15 disabled:hover:text-[#0a1f6b]"
  >
    {children}
  </button>
);

/* ---------------------------------------------
   Job seeker dashboard
--------------------------------------------- */

const JobSeekerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(EMPTY_PAGINATION);

  const [viewMode, setViewMode] = useState("grid");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [filters, setFilters] = useState(EMPTY_FILTERS);

  const [expandedSections, setExpandedSections] = useState({
    jobType: true,
    salary: true,
    categories: true,
  });

  // Ignore responses from older requests so fast typing can't show stale jobs.
  const requestId = useRef(0);

  const fetchJobs = useCallback(async (filterParams, page) => {
    const id = ++requestId.current;

    try {
      setLoading(true);
      setHasError(false);

      const params = new URLSearchParams();

      Object.entries(filterParams).forEach(([key, value]) => {
        if (value !== "" && value !== null && value !== undefined) {
          params.append(key, value);
        }
      });

      params.append("page", String(page));
      params.append("limit", String(PAGE_SIZE));

      const response = await axiosInstance.get(
        `${API_PATHS.JOBS.GET_ALL_JOBS}?${params.toString()}`
      );

      if (id !== requestId.current) return;

      // Support both the paginated response and the previous array format.
      const jobsData = Array.isArray(response.data)
        ? response.data
        : response.data?.jobs || [];

      setJobs(jobsData);

      setPagination(
        response.data?.pagination || {
          ...EMPTY_PAGINATION,
          total: jobsData.length,
          totalPages: jobsData.length > 0 ? 1 : 0,
        }
      );
    } catch (err) {
      if (id !== requestId.current) return;

      console.error("Error fetching jobs:", err);
      setHasError(true);
      setJobs([]);
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, []);

  // Debounce filter changes to reduce unnecessary API requests.
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchJobs(filters, currentPage);
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [filters, user, currentPage, fetchJobs]);

  // Lock page scroll and close with Escape while the mobile drawer is open.
  useEffect(() => {
    if (!showMobileFilters) return undefined;

    const onKey = (e) => {
      if (e.key === "Escape") setShowMobileFilters(false);
    };

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [showMobileFilters]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const clearAllFilters = () => {
    setFilters(EMPTY_FILTERS);
    setCurrentPage(1);
  };

  const changePage = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Save or unsave a job. Updates the card in place, no refetch or flicker.
  const toggleSaveJob = async (jobId, isSaved) => {
    try {
      if (isSaved) {
        await axiosInstance.delete(API_PATHS.JOBS.UNSAVE_JOB(jobId));
        toast.success("Job removed successfully!");
      } else {
        await axiosInstance.post(API_PATHS.JOBS.SAVE_JOB(jobId));
        toast.success("Job saved successfully!");
      }

      setJobs((prev) =>
        prev.map((job) =>
          job._id === jobId ? { ...job, isSaved: !isSaved } : job
        )
      );
    } catch (err) {
      console.error("Error saving job:", err);
      toast.error("Something went wrong! Try again later");
    }
  };

  /* Active filter chips (keyword, location, type, category, salary) */
  const hasSalary = filters.minSalary !== "" || filters.maxSalary !== "";

  const activeChips = [
    filters.keyword && {
      key: "keyword",
      label: `"${filters.keyword}"`,
      remove: () => handleFilterChange("keyword", ""),
    },
    filters.location && {
      key: "location",
      label: filters.location,
      remove: () => handleFilterChange("location", ""),
    },
    filters.type && {
      key: "type",
      label: filters.type,
      remove: () => handleFilterChange("type", ""),
    },
    filters.category && {
      key: "category",
      label: filters.category,
      remove: () => handleFilterChange("category", ""),
    },
    hasSalary && {
      key: "salary",
      label: `Salary ${filters.minSalary || 0} – ${filters.maxSalary || "any"}`,
      remove: () => {
        handleFilterChange("minSalary", "");
        handleFilterChange("maxSalary", "");
      },
    },
  ].filter(Boolean);

  const from =
    jobs.length > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0;
  const to = (pagination.page - 1) * pagination.limit + jobs.length;

  const firstLoad = loading && jobs.length === 0;

  const gridClass =
    viewMode === "grid"
      ? "grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3 lg:gap-5"
      : "space-y-4";

  return (
    <div className="page-with-footer bg-[#f3f5fa]">
      <Navbar transparent />

      <main className="page-footer-main">
        <SearchHeader
          filters={filters}
          handleFilterChange={handleFilterChange}
          onClear={clearAllFilters}
          total={pagination.total}
        />

        <div className="mx-auto flex w-full max-w-[1920px] gap-6 px-5 pb-12 pt-8 sm:px-8 lg:gap-8 lg:px-12 xl:px-16">
          {/* Desktop filters */}
          <aside className="hidden w-80 flex-shrink-0 lg:block">
            <div className="sticky top-24 overflow-hidden rounded-2xl border border-[#0a1f6b]/10 bg-white shadow-[0_10px_28px_-18px_rgba(10,31,107,0.35)]">
              <FilterContent
                toggleSection={toggleSection}
                clearAllFilters={clearAllFilters}
                expandedSections={expandedSections}
                filters={filters}
                handleFilterChange={handleFilterChange}
              />
            </div>
          </aside>

          {/* Results */}
          <section className="min-w-0 flex-1" aria-live="polite">
            {/* Toolbar: one white bar with count, view toggle and active filters */}
            <div className="mb-5 rounded-2xl border border-[#0a1f6b]/10 bg-white px-4 py-3 shadow-[0_10px_28px_-18px_rgba(10,31,107,0.35)] sm:px-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-slate-600">
                  {firstLoad ? (
                    "Loading jobs..."
                  ) : (
                    <>
                      Showing{" "}
                      <span className="font-extrabold text-[#0a1f6b]">
                        {from}–{to}
                      </span>{" "}
                      of{" "}
                      <span className="font-extrabold text-[#0a1f6b]">
                        {pagination.total}
                      </span>{" "}
                      jobs
                    </>
                  )}
                </p>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowMobileFilters(true)}
                    className="inline-flex items-center gap-2 rounded-lg border border-[#0a1f6b]/15 bg-white px-4 py-2 text-sm font-bold text-[#0a1f6b] transition-colors hover:border-[#1646e0] hover:text-[#1646e0] lg:hidden"
                  >
                    <Filter className="h-4 w-4" />
                    Filters
                  </button>

                  <div className="flex items-center rounded-lg border border-[#0a1f6b]/15 bg-white p-1">
                    {[
                      { mode: "grid", label: "Grid view", Icon: Grid },
                      { mode: "list", label: "List view", Icon: List },
                    ].map(({ mode, label, Icon }) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setViewMode(mode)}
                        aria-label={label}
                        aria-pressed={viewMode === mode}
                        className={`rounded-md p-2 transition-colors ${
                          viewMode === mode
                            ? "bg-[#0a1f6b] text-white"
                            : "text-slate-500 hover:bg-[#eef3ff] hover:text-[#1646e0]"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Active filters */}
              {activeChips.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[#0a1f6b]/10 pt-3">
                  {activeChips.map((chip) => (
                    <Chip
                      key={chip.key}
                      label={chip.label}
                      onRemove={chip.remove}
                    />
                  ))}

                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="ml-1 rounded-md text-[13px] font-bold text-[#1646e0] underline underline-offset-4 hover:text-[#0a1f6b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1646e0]"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>

            {/* Body */}
            {firstLoad ? (
              <div className={gridClass}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : hasError ? (
              <div className="rounded-2xl border border-[#0a1f6b]/10 bg-white px-6 py-16 text-center">
                <h3 className="text-xl font-extrabold text-[#0a1f6b]">
                  We couldn't load the jobs
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  Check your connection and try again.
                </p>
                <button
                  type="button"
                  onClick={() => fetchJobs(filters, currentPage)}
                  className="mt-6 rounded-lg bg-[#0a1f6b] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[#1646e0]"
                >
                  Try again
                </button>
              </div>
            ) : jobs.length === 0 ? (
              <div className="rounded-2xl border border-[#0a1f6b]/10 bg-white px-6 py-16 text-center lg:py-20">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#eef3ff] text-[#1646e0]">
                  <Search className="h-6 w-6" />
                </span>

                <h3 className="mt-5 text-xl font-extrabold text-[#0a1f6b] lg:text-2xl">
                  No jobs found
                </h3>

                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                  Try a different keyword, or remove a filter to see more roles.
                </p>

                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="mt-6 rounded-lg bg-[#1646e0] px-6 py-3 text-sm font-extrabold text-white transition-colors hover:bg-[#0f36b8]"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <>
                <div
                  className={`${gridClass} transition-opacity duration-200 ${
                    loading ? "opacity-60" : "opacity-100"
                  }`}
                >
                  {jobs.map((job) => (
                    <JobCard
                      key={job._id}
                      job={job}
                      onClick={() => navigate(`/job/${job._id}`)}
                      onToggleSave={() => toggleSaveJob(job._id, job.isSaved)}
                    />
                  ))}
                </div>

                {pagination.totalPages > 1 && (
                  <nav
                    aria-label="Pagination"
                    className="mt-10 flex flex-wrap items-center justify-center gap-3"
                  >
                    <PageButton
                      label="Previous page"
                      onClick={() => changePage(Math.max(1, currentPage - 1))}
                      disabled={!pagination.hasPreviousPage || loading}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </PageButton>

                    <span className="px-2 text-sm font-semibold text-slate-600">
                      Page{" "}
                      <span className="text-[#0a1f6b]">{pagination.page}</span>{" "}
                      of {pagination.totalPages}
                    </span>

                    <PageButton
                      label="Next page"
                      onClick={() => changePage(currentPage + 1)}
                      disabled={!pagination.hasNextPage || loading}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </PageButton>
                  </nav>
                )}
              </>
            )}
          </section>
        </div>
      </main>

      <Footer />

      {/* Mobile filter drawer */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-[#0a1f6b]/30 backdrop-blur-sm"
            onClick={() => setShowMobileFilters(false)}
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label="Filters"
            className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-white shadow-2xl"
          >
            <div className="flex-1 overflow-y-auto">
              <FilterContent
                toggleSection={toggleSection}
                clearAllFilters={clearAllFilters}
                expandedSections={expandedSections}
                filters={filters}
                handleFilterChange={handleFilterChange}
                onClose={() => setShowMobileFilters(false)}
              />
            </div>

            <div className="border-t border-[#0a1f6b]/10 p-4">
              <button
                type="button"
                onClick={() => setShowMobileFilters(false)}
                className="w-full rounded-lg bg-[#0a1f6b] px-5 py-3.5 text-sm font-extrabold text-white transition-colors hover:bg-[#1646e0]"
              >
                Show {pagination.total} {pagination.total === 1 ? "job" : "jobs"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobSeekerDashboard;