import { ArrowLeft, Bookmark, Grid, List } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { useEffect, useState } from "react";
import Navbar from "../../components/layout/Navbar";
import JobCard from "../../components/Cards/JobCard";
import toast from "react-hot-toast";
import Footer from "../LandingPage/components/Footer";

const DISPLAY_FONT = { fontFamily: "'Outfit', 'Inter', system-ui, sans-serif" };

const PAGE_BG = "bg-[#f3f5fa]";

const SavedJobs = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [savedJobList, setSavedJobList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");

  const getSavedJobs = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(API_PATHS.JOBS.GET_SAVED_JOBS);
      setSavedJobList(response.data);
    } catch (error) {
      console.error("Error fetching saved jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsaveJob = async (jobId) => {
    try {
      await axiosInstance.delete(API_PATHS.JOBS.UNSAVE_JOB(jobId));
      toast.success("Job removed successfully!");

      // Remove the job locally instead of refetching
      setSavedJobList((prev) =>
        prev.filter((savedJob) => savedJob?.job?._id !== jobId)
      );
    } catch {
      toast.error("Something went wrong! Try again later");
    }
  };

  useEffect(() => {
    if (user) {
      getSavedJobs();
    }
  }, [user]);

  // Skip saved entries whose job was deleted
  const visibleJobs = (savedJobList || []).filter((savedJob) => savedJob?.job);

  return (
    <div className={`page-with-footer ${PAGE_BG}`}>
      <Navbar />

      <div className="page-footer-main mx-auto w-full max-w-screen-2xl px-4 pb-14 pt-24 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b-2 border-[#0a1f6b] pb-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              aria-label="Go back"
              className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-[#0a1f6b] bg-white text-[#0a1f6b] transition-colors hover:bg-[#ffd23f]"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <div>
              <h1
                style={DISPLAY_FONT}
                className="text-3xl font-extrabold tracking-[-0.01em] text-[#0a1f6b] sm:text-4xl"
              >
                Saved jobs
              </h1>
              {!loading && (
                <p className="mt-0.5 text-sm text-slate-500">
                  {visibleJobs.length} {visibleJobs.length === 1 ? "job" : "jobs"} saved
                </p>
              )}
            </div>
          </div>

          <div className="flex rounded-xl border-2 border-[#0a1f6b] bg-white p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              aria-label="Grid view"
              aria-pressed={viewMode === "grid"}
              className={`rounded-lg p-2 transition-colors ${
                viewMode === "grid"
                  ? "bg-[#0a1f6b] text-white"
                  : "text-slate-500 hover:bg-[#eef3ff]"
              }`}
            >
              <Grid className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => setViewMode("list")}
              aria-label="List view"
              aria-pressed={viewMode === "list"}
              className={`rounded-lg p-2 transition-colors ${
                viewMode === "list"
                  ? "bg-[#0a1f6b] text-white"
                  : "text-slate-500 hover:bg-[#eef3ff]"
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="rounded-2xl border-2 border-[#0a1f6b]/15 bg-white px-6 py-16 text-center text-sm font-medium text-slate-500">
            Loading saved jobs...
          </div>
        ) : visibleJobs.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-[#0a1f6b]/25 bg-white px-6 py-16 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#dbe6ff]">
              <Bookmark className="h-6 w-6 text-[#1646e0]" />
            </div>

            <h2
              style={DISPLAY_FONT}
              className="text-2xl font-extrabold text-[#0a1f6b]"
            >
              No saved jobs yet
            </h2>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-600">
              Tap the bookmark on any job to keep it here for later.
            </p>

            <button
              type="button"
              onClick={() => navigate("/find-jobs")}
              className="mt-6 rounded-xl border-2 border-[#0a1f6b] bg-[#ffd23f] px-6 py-2.5 text-sm font-bold text-[#0a1f6b] transition-colors hover:bg-[#f5c400]"
            >
              Browse jobs
            </button>
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3"
                : "flex flex-col gap-4"
            }
          >
            {visibleJobs.map((savedJob) => (
              <JobCard
                key={savedJob._id}
                job={savedJob.job}
                onClick={() => navigate(`/job/${savedJob.job._id}`)}
                onToggleSave={() => handleUnsaveJob(savedJob.job._id)}
                saved
              />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default SavedJobs;