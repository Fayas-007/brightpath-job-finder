import { useState, useEffect } from "react";
import { Search, Filter, Grid, List, X } from "lucide-react";
import LoadingSpinner from "../../components/LoadingSpinner";
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

const JobSeekerDashboard = () => {
  const { user } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [, setError] = useState(null);

  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    keyword: "",
    location: "",
    category: "",
    type: "",
    minSalary: "",
    maxSalary: "",
  });

  const [expandedSections, setExpandedSections] = useState({
    jobType: true,
    salary: true,
    categories: true,
  });

  const fetchJobs = async (filterParams = {}) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filterParams.keyword) params.append("keyword", filterParams.keyword);
      if (filterParams.location) params.append("location", filterParams.location);
      if (filterParams.minSalary) params.append("minSalary", filterParams.minSalary);
      if (filterParams.maxSalary) params.append("maxSalary", filterParams.maxSalary);
      if (filterParams.type) params.append("type", filterParams.type);
      if (filterParams.category) params.append("category", filterParams.category);
      const response = await axiosInstance.get(
        `${API_PATHS.JOBS.GET_ALL_JOBS}?${params.toString()}`
      );

      const jobsData = Array.isArray(response.data)
        ? response.data
        : response.data.jobs || [];

      setJobs(jobsData);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setError("Failed to fetch jobs. Please try again later.");
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const apiFilters = {
        keyword: filters.keyword,
        location: filters.location,
        minSalary: filters.minSalary,
        maxSalary: filters.maxSalary,
        category: filters.category,
        type: filters.type,
        experience: filters.experience,
        remoteOnly: filters.remoteOnly,
      };

      const hasFilters = Object.values(apiFilters).some(
        (value) => value !== "" && value !== false && value !== null && value !== undefined
      );

      if (hasFilters) {
        fetchJobs(apiFilters);
      } else {
        fetchJobs();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [filters, user]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const clearAllFilters = () => {
    setFilters({
      keyword: "",
      location: "",
      category: "",
      type: "",
      minSalary: "",
      maxSalary: "",
    });
  };

  const MobileFilterOverlay = () => (
    <div className={`fixed inset-0 z-50 lg:hidden ${showMobileFilters ? "" : "hidden"}`}>
      <div className="fixed inset-0 bg-blue-950/15 backdrop-blur-sm" onClick={() => setShowMobileFilters(false)} />
      <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="font-bold text-gray-900 text-lg">Filters</h3>
          <button
            onClick={() => setShowMobileFilters(false)}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto h-full pb-20">
          <FilterContent
            toggleSection={toggleSection}
            clearAllFilters={clearAllFilters}
            expandedSections={expandedSections}
            filters={filters}
            handleFilterChange={handleFilterChange}
          />
        </div>
      </div>
    </div>
  );

  const toggleSaveJob = async (jobId, isSaved) => {
    try {
      if (isSaved) {
        await axiosInstance.delete(API_PATHS.JOBS.UNSAVE_JOB(jobId));
        toast.success("Job removed successfully!");
      } else {
        await axiosInstance.post(API_PATHS.JOBS.SAVE_JOB(jobId));
        toast.success("Job saved successfully!");
      }
      fetchJobs();
    } catch (err) {
      console.error("Error saving job:", err);
      toast.error("Something went wrong! Try again later");
    }
  };

  if (jobs.length == 0 && loading) return <LoadingSpinner />;

  return (
    <div className="page-with-footer app-background app-background-jobseeker">
      <Navbar />

      <main className="page-footer-main">
        <div className="mt-16 w-full">
          <div className="mx-auto max-w-screen-2xl px-4 py-5 sm:px-6 lg:px-8">
            <SearchHeader 
              filters={filters} 
              handleFilterChange={handleFilterChange} 
              onClear={clearAllFilters}
            />
          </div>
        </div>

        <div className="w-full">
          <div className="flex gap-6 lg:gap-8 px-4 sm:px-6 lg:px-8 pb-8 pt-1">
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="page-panel sticky top-24 rounded-lg p-6">
              <h3 className="mb-6 text-xl font-black text-slate-950">Filter Jobs</h3>
              <FilterContent
                toggleSection={toggleSection}
                clearAllFilters={clearAllFilters}
                expandedSections={expandedSections}
                filters={filters}
                handleFilterChange={handleFilterChange}
              />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 lg:mb-8 gap-4">
              <div>
                <p className="text-sm text-slate-600 lg:text-base">
                  Showing <span className="font-black text-slate-950">{jobs.length}</span> jobs
                </p>
              </div>

              <div className="flex items-center justify-between lg:justify-end gap-4">
                <button
                  onClick={() => setShowMobileFilters(true)}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-700 transition-colors hover:bg-slate-100 lg:hidden"
                >
                  <Filter className="w-4 h-4" /> Filters
                </button>

                <div className="flex items-center gap-3 lg:gap-4">
                  <div className="flex items-center rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 rounded-lg transition-colors ${
                        viewMode === "grid"
                          ? "bg-blue-600 text-white shadow-sm shadow-blue-100"
                          : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                      }`}
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 rounded-lg transition-colors ${
                        viewMode === "list"
                          ? "bg-blue-600 text-white shadow-sm shadow-blue-100"
                          : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                      }`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {jobs.length === 0 ? (
              <div className="rounded-lg border border-slate-200 bg-white py-16 text-center shadow-sm lg:py-20">
                <div className="mb-6 text-slate-400">
                  <Search className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="mb-3 text-xl font-black text-slate-950 lg:text-2xl">No jobs found</h3>
                <p className="mb-6 text-slate-600">Try adjusting your search criteria or filters.</p>
                <button
                  onClick={clearAllFilters}
                  className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className={viewMode === "grid" 
    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6" 
    : "space-y-4 lg:space-y-6"}>
                {jobs.map((job) => (
                  <JobCard
                    key={job._id}
                    job={job}
                    onClick={() => navigate(`/job/${job._id}`)}
                    onToggleSave={() => toggleSaveJob(job._id, job.isSaved)}
                  />
                ))}
              </div>
            )}
          </div>
          </div>
        </div>
      </main>

      <Footer />
      <MobileFilterOverlay />
    </div>
  );
};

export default JobSeekerDashboard;
