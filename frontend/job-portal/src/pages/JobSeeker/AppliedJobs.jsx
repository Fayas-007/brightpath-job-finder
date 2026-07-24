import { ArrowLeft, Bookmark, Grid, List } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "../../components/layout/Navbar";
import Footer from "../LandingPage/components/Footer";
import axiosInstance from "../../utils/axiosInstance";
import { getAssetUrl } from "../../utils/apiPaths";

const AppliedJobsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");

const fetchApplications = async () => {
  try {
    const res = await axiosInstance.get("/api/applications/my");
    setApplications(res.data);
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    if (user) fetchApplications();
  }, [user]);

  if (loading)
    return (
      <p className="mt-24 text-center text-gray-500 text-lg">
        Loading applied jobs...
      </p>
    );

  return (
    <div className="page-with-footer app-background app-background-jobseeker">
      <Navbar />

      <div className="page-footer-main mx-auto max-w-screen-2xl px-4 pt-24 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-white/20 bg-white p-4 shadow-sm sm:p-6">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="group flex items-center space-x-2 px-3.5 py-2.5 text-sm font-medium text-gray-600 hover:text-white bg-white/50 hover:bg-gradient-to-r hover:from-blue-500 hover:to-blue-600 border border-gray-200 hover:border-transparent rounded-xl transition-all duration-300 shadow-lg shadow-gray-100 hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              </button>

              <h1 className="text-lg lg:text-xl font-semibold leading-tight text-gray-900">
                Applied Jobs
              </h1>
            </div>

            {/* View toggle */}
            <div className="flex items-center gap-3 lg:gap-4">
              <div className="flex items-center border border-gray-200 rounded-xl p-1 bg-white">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === "grid"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === "list"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-0 pb-8 space-y-8">
            {applications.length === 0 ? (
              <div className="text-center py-16 lg:py-20 bg-white/60 backdrop-blur-xl rounded-2xl border border-white/20">
                <div className="text-gray-300 mb-6">
                  <Bookmark className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-3">
                  You haven't applied to any jobs yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Start applying to jobs to see them listed here.
                </p>
                <button
                  onClick={() => navigate(`/find-jobs`)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                >
                  Browse Jobs
                </button>
              </div>
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-4 lg:gap-6"
                    : "space-y-4 lg:space-y-6"
                }
              >
                {applications.map((app) => {
                  const companyImage = app.job.company?.avatar;
                  const companyImageUrl = getAssetUrl(companyImage);

                  return (
                  <div
                    key={app._id}
                    className="flex flex-col justify-between gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg sm:p-6 lg:flex-row lg:items-center"
                  >
                    {/* Job Info */}
                    <div className="flex min-w-0 flex-1 items-start gap-4">
<div className="w-16 h-16 flex-shrink-0">
  <img
    src={companyImage ? companyImageUrl : "/default-logo.png"}
    alt={app.job.company?.companyName || "Company"}
    className="w-full h-full object-cover rounded-lg"
  />
</div>

                      {/* Job Text Info */}
                      <div className="min-w-0 space-y-1">
                        <h2 className="break-words text-lg font-bold text-gray-900 transition-colors hover:text-blue-600 lg:text-xl">
                          {app.job.title}
                        </h2>
                        <p className="break-words font-medium text-gray-700">
                          {app.job.company?.companyName}
                        </p>
                        <p className="text-gray-500 text-sm">{app.job.location}</p>
                        <p className="text-gray-500 text-sm">
                          {app.job.type || "Full-Time"}
                        </p>
                      </div>
                    </div>

                    {/* Application Status */}
                    <div className="mt-4 lg:mt-0 flex items-center space-x-3">
                      {app.status === "Applied" && (
                        <span className="px-4 py-1.5 rounded-full text-sm font-semibold text-blue-700 bg-blue-50 shadow-sm">
                          Applied
                        </span>
                      )}
                      {app.status === "In Review" && (
                        <span className="px-4 py-1.5 rounded-full text-sm font-semibold text-yellow-700 bg-yellow-50 shadow-sm">
                          In Review
                        </span>
                      )}
                      {app.status === "Rejected" && (
                        <span className="px-4 py-1.5 rounded-full text-sm font-semibold text-red-700 bg-red-50 shadow-sm">
                          Rejected
                        </span>
                      )}
                      {app.status === "Accepted" && (
                        <span className="px-4 py-1.5 rounded-full text-sm font-semibold text-green-700 bg-green-50 shadow-sm">
                          Accepted
                        </span>
                      )}
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AppliedJobsPage;
