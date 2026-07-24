import { createElement, useEffect, useState } from "react";
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  ClipboardList,
  Plus,
  Users,
} from "lucide-react";
import { formatRelativeTime } from "../../utils/dateUtils";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import DashboardLayout from "../../components/layout/DashboardLayout";
import LoadingSpinner from "../../components/LoadingSpinner";
import JobDashboardCard from "../../components/Cards/JobDashboardCard";
import ApplicantDashboardCard from "../../components/Cards/ApplicantDashboardCard";

const Panel = ({ title, subtitle, action, children }) => (
  <section className="employer-card overflow-hidden">
    {(title || action) && (
      <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          {title && <h3 className="text-lg font-black text-slate-950">{title}</h3>}
          {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
        </div>
        {action}
      </div>
    )}
    <div className="p-5 sm:p-6">{children}</div>
  </section>
);

const StatCard = ({ title, value, icon: Icon, helper }) => (
  <div className="employer-card p-5">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-bold text-slate-500">{title}</p>
        <p className="mt-3 text-3xl font-black text-slate-950">{value}</p>
        <p className="mt-2 text-xs font-semibold text-slate-400">{helper}</p>
      </div>
      <div className="rounded-lg bg-teal-50 p-3 text-teal-700">
        {createElement(Icon, { className: "h-6 w-6" })}
      </div>
    </div>
  </div>
);

const EmptyState = ({ icon: Icon, title, text, action }) => (
  <div className="flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/70 p-6 text-center">
    <div className="rounded-lg bg-white p-3 text-slate-400 shadow-sm">
      {createElement(Icon, { className: "h-7 w-7" })}
    </div>
    <h4 className="mt-4 text-base font-black text-slate-950">{title}</h4>
    <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">{text}</p>
    {action}
  </div>
);

const EmployerDashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const getDashboardOverView = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get(API_PATHS.DASHBOARD.OVERVIEW);
      if (response.status === 200) setDashboardData(response.data);
    } catch (error) {
      console.error("Failed to fetch employer dashboard:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getDashboardOverView();
  }, []);

  const recentJobs = dashboardData?.data?.recentJobs?.slice(0, 3) || [];
  const recentApplications = dashboardData?.data?.recentApplications?.slice(0, 3) || [];

  return (
    <DashboardLayout activeMenu="dashboard">
      <div className="employer-shell mb-24 space-y-6">
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            <section className="employer-panel overflow-hidden">
              <div className="grid gap-6 p-5 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <p className="employer-kicker">Hiring command center</p>
                  <h1 className="mt-3 text-3xl font-black leading-tight text-slate-950 sm:text-4xl">
                    Keep roles moving without hunting through tabs.
                  </h1>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                    Post openings, monitor applicants, and close roles from one focused workspace.
                  </p>
                </div>
                <button onClick={() => navigate("/post-job")} className="employer-action w-full lg:w-auto">
                  <Plus className="h-4 w-4" />
                  Post a job
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </section>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <StatCard
                title="Active jobs"
                value={dashboardData?.counts?.totalActiveJobs || 0}
                icon={Briefcase}
                helper="Open roles candidates can apply to"
              />
              <StatCard
                title="Applications"
                value={dashboardData?.counts?.totalApplications || 0}
                icon={Users}
                helper="Total applications received"
              />
              <StatCard
                title="Hired"
                value={dashboardData?.counts?.totalHired || 0}
                icon={CheckCircle2}
                helper="Candidates marked as hired"
              />
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <Panel
                title="Recent job posts"
                subtitle="Latest roles published by your team"
                action={
                  <button onClick={() => navigate("/manage-jobs")} className="employer-secondary-action px-3 py-2">
                    View all
                  </button>
                }
              >
                {recentJobs.length ? (
                  <div className="space-y-3">
                    {recentJobs.map((job, index) => (
                      <JobDashboardCard key={job?._id || index} job={job} />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={Briefcase}
                    title="No jobs posted yet"
                    text="Create your first role so candidates can start applying."
                    action={
                      <button onClick={() => navigate("/post-job")} className="employer-action mt-5">
                        <Plus className="h-4 w-4" />
                        Post first job
                      </button>
                    }
                  />
                )}
              </Panel>

              <Panel
                title="Recent applications"
                subtitle="Newest candidate activity"
                action={
                  <button onClick={() => navigate("/manage-jobs")} className="employer-secondary-action px-3 py-2">
                    Review jobs
                  </button>
                }
              >
                {recentApplications.length ? (
                  <div className="space-y-3">
                    {recentApplications.map((data, index) => (
                      <ApplicantDashboardCard
                        key={data?._id || index}
                        applicant={data?.applicant || ""}
                        position={data?.job?.title || ""}
                        time={formatRelativeTime(data?.updatedAt)}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={ClipboardList}
                    title="No applications yet"
                    text="Applications will appear here once candidates apply to your open jobs."
                  />
                )}
              </Panel>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default EmployerDashboard;
