
import { useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  Plus,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatRelativeTime } from "../../utils/dateUtils";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import DashboardLayout from "../../components/layout/DashboardLayout";
import JobDashboardCard from "../../components/Cards/JobDashboardCard";
import ApplicantDashboardCard from "../../components/Cards/ApplicantDashboardCard";

/* ---------------------------------------------
   Typography and shared components
--------------------------------------------- */

const StatItem = ({ label, value, description, featured = false }) => (
  <div
    className={`min-w-0 p-5 sm:p-7 ${
      featured
        ? "bg-[#ffd23f] text-[#0a1f6b]"
        : "bg-white text-[#0a1f6b]"
    }`}
  >
    <p
      className={`text-[11px] font-bold uppercase tracking-[0.13em] ${
        featured ? "text-[#0a1f6b]/75" : "text-slate-500"
      }`}
    >
      {label}
    </p>

    <p className="mt-5 text-4xl font-extrabold leading-none tracking-normal sm:text-5xl">
      {value}
    </p>

    <p
      className={`mt-3 text-xs leading-5 sm:text-sm ${
        featured ? "text-[#0a1f6b]/75" : "text-slate-500"
      }`}
    >
      {description}
    </p>
  </div>
);

const SectionHeading = ({ eyebrow, title, description }) => (
  <div>
    <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#1646e0] sm:text-[11px]">
      {eyebrow}
    </p>

    <h2 className="mt-2 text-2xl font-extrabold leading-tight tracking-normal text-[#0a1f6b] sm:text-[30px]">
      {title}
    </h2>

    <p className="mt-2 text-sm leading-6 text-slate-500">
      {description}
    </p>
  </div>
);

const EmptyState = ({ title, description, action, onAction }) => (
  <div className="px-5 py-12 text-center sm:px-8">
    <h4 className="text-base font-extrabold tracking-normal text-[#0a1f6b] sm:text-lg">
      {title}
    </h4>

    <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
      {description}
    </p>

    {action && (
      <button
        type="button"
        onClick={onAction}
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#1646e0] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#0a1f6b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1646e0]"
      >
        <Plus className="h-4 w-4" />
        {action}
      </button>
    )}
  </div>
);

const DashboardSkeleton = () => (
  <div className="animate-pulse space-y-9">
    <div className="h-[340px] rounded-2xl bg-[#dfe8fb] sm:h-[300px]" />

    <div className="grid grid-cols-1 overflow-hidden rounded-2xl border border-[#0a1f6b]/10 sm:grid-cols-3">
      {[1, 2, 3].map((item) => (
        <div key={item} className="h-40 bg-white p-6">
          <div className="h-3 w-28 rounded bg-slate-200" />
          <div className="mt-7 h-10 w-20 rounded bg-slate-200" />
          <div className="mt-4 h-3 w-36 rounded bg-slate-100" />
        </div>
      ))}
    </div>

    <div className="grid gap-6 xl:grid-cols-2">
      {[1, 2].map((item) => (
        <div
          key={item}
          className="h-80 rounded-2xl border border-slate-100 bg-white p-6"
        >
          <div className="h-5 w-40 rounded bg-slate-200" />
          <div className="mt-8 space-y-4">
            {[1, 2, 3].map((row) => (
              <div key={row} className="h-16 rounded-lg bg-slate-100" />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

/* ---------------------------------------------
   Employer Dashboard
--------------------------------------------- */

const EmployerDashboard = () => {
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const getDashboardOverView = useCallback(async () => {
    try {
      setIsLoading(true);
      setHasError(false);

      const response = await axiosInstance.get(
        API_PATHS.DASHBOARD.OVERVIEW
      );

      if (response.status === 200) {
        setDashboardData(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch employer dashboard:", error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    getDashboardOverView();
  }, [getDashboardOverView]);

  const recentJobs =
    dashboardData?.data?.recentJobs?.slice(0, 3) || [];

  const recentApplications =
    dashboardData?.data?.recentApplications?.slice(0, 3) || [];

  const activeJobs = dashboardData?.counts?.totalActiveJobs || 0;
  const applications = dashboardData?.counts?.totalApplications || 0;
  const hired = dashboardData?.counts?.totalHired || 0;

  const hireRate = applications
    ? Math.round((hired / applications) * 100)
    : 0;

  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <DashboardLayout activeMenu="dashboard">
      <div className="mx-auto w-full max-w-[1440px] space-y-10 pb-12">

        {isLoading ? (
          <DashboardSkeleton />
        ) : hasError && !dashboardData ? (
          /* Error state */
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-20 text-center">
            <h2 className="text-2xl font-extrabold tracking-normal text-[#0a1f6b] sm:text-3xl">
              Something went wrong.
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              We couldn't load your hiring information. Please try again.
            </p>

            <button
              type="button"
              onClick={getDashboardOverView}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#1646e0] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#0a1f6b]"
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </button>
          </div>
        ) : (
          <>
            {/* ---------------------------------
                HERO
            --------------------------------- */}

            <section className="overflow-hidden rounded-2xl bg-[#0a1f6b] text-white">
              <div className="grid grid-cols-1 gap-9 p-6 sm:p-9 lg:grid-cols-[minmax(0,1fr)_290px] lg:items-center lg:gap-12 lg:p-12 xl:p-14">

                {/* Headline */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5">
                    <span className="h-2 w-2 flex-shrink-0 rounded-full bg-[#ffd23f]" />

                    <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#ffd23f] sm:text-xs">
                      Employer workspace
                    </p>
                  </div>

                  <p className="mt-8 text-xs font-medium text-white/55 sm:text-sm">
                    {today}
                  </p>

                  <h1 className="mt-3 max-w-[760px] text-[clamp(2.4rem,5vw,4.5rem)] font-extrabold leading-[1.04] tracking-normal">
                    <span className="block">
                      Find the right people.
                    </span>

                    <span className="mt-1 block text-[#ffd23f]">
                      Build what's next.
                    </span>
                  </h1>

                  <p className="mt-6 max-w-[450px] text-sm leading-7 text-white/65 sm:text-base sm:leading-8">
                    Your hiring activity, open positions and latest
                    candidates — everything you need to move your team
                    forward.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-5 rounded-xl border border-white/15 bg-white/[0.06] p-5 sm:p-6 lg:p-6">
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-white/55">
                      Get started
                    </p>

                    <h2 className="mt-3 text-xl font-extrabold leading-snug tracking-normal text-white sm:text-2xl">
                      Ready to find your next great hire?
                    </h2>
                  </div>

                  <div className="flex flex-col gap-3">
                    <button
                      type="button"
                      onClick={() => navigate("/post-job")}
                      className="flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#ffd23f] px-5 py-3.5 text-sm font-extrabold text-[#0a1f6b] transition-colors hover:bg-[#f5c400] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    >
                      <Plus className="h-4 w-4" />
                      Post a job
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate("/manage-jobs")}
                      className="flex min-h-12 w-full items-center justify-center gap-2 rounded-lg border border-white/70 bg-white px-5 py-3.5 text-sm font-extrabold text-[#0a1f6b] transition-colors hover:bg-[#eef3ff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    >
                      Manage jobs
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>

                  <p className="text-center text-[11px] font-medium text-white/45">
                    Your next great hire starts with an opportunity.
                  </p>
                </div>
              </div>
            </section>

            {/* ---------------------------------
                HIRING OVERVIEW
            --------------------------------- */}

            <section>
              <div className="mb-5">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#1646e0] sm:text-[11px]">
                  Performance snapshot
                </p>

                <h2 className="mt-2 text-2xl font-extrabold leading-tight tracking-normal text-[#0a1f6b] sm:text-[30px]">
                  Hiring at a glance
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  A summary of your current recruitment performance.
                </p>
              </div>

              <div className="grid grid-cols-1 overflow-hidden rounded-2xl border border-[#0a1f6b]/10 shadow-[0_3px_16px_rgba(10,31,107,0.035)] sm:grid-cols-3">
                <StatItem
                  label="Active positions"
                  value={activeJobs}
                  description="Currently open for applications"
                  featured
                />

                <div className="border-t border-[#0a1f6b]/10 sm:border-l sm:border-t-0">
                  <StatItem
                    label="Applications received"
                    value={applications}
                    description="Candidates who have applied"
                  />
                </div>

                <div className="border-t border-[#0a1f6b]/10 sm:border-l sm:border-t-0">
                  <StatItem
                    label="Successful hires"
                    value={hired}
                    description={
                      applications
                        ? `${hireRate}% of all applications`
                        : "Candidates marked as hired"
                    }
                  />
                </div>
              </div>
            </section>

            {/* ---------------------------------
                RECENT HIRING ACTIVITY
            --------------------------------- */}

            <section>
              <SectionHeading
                eyebrow="Recruitment activity"
                title="Your hiring activity"
                description="Keep track of your latest job listings and incoming candidates."
              />

              <div className="mt-6 grid grid-cols-1 items-start gap-6 xl:grid-cols-2">

                {/* Recent jobs */}
                <section className="min-w-0 overflow-hidden rounded-2xl border border-[#0a1f6b]/10 bg-white">
                  <div className="px-5 py-6 sm:px-7">
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#1646e0]">
                      Job listings
                    </p>

                    <h3 className="mt-2 text-xl font-extrabold tracking-normal text-[#0a1f6b]">
                      Recent job posts
                    </h3>

                    <p className="mt-1.5 text-sm text-slate-500">
                      The latest positions published by your team.
                    </p>
                  </div>

                  <div className="border-t border-slate-100 px-3 py-3 sm:px-4">
                    {recentJobs.length > 0 ? (
                      <div className="space-y-1">
                        {recentJobs.map((job, index) => (
                          <JobDashboardCard
                            key={job?._id || index}
                            job={job}
                          />
                        ))}
                      </div>
                    ) : (
                      <EmptyState
                        title="No jobs published yet."
                        description="Create your first job listing and start attracting candidates."
                        action="Publish your first job"
                        onAction={() => navigate("/post-job")}
                      />
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate("/manage-jobs")}
                    className="flex w-full items-center justify-between border-t border-slate-100 px-6 py-4 text-sm font-bold text-[#1646e0] transition-colors hover:bg-[#f5f8ff] hover:text-[#0a1f6b]"
                  >
                    View all job listings
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </section>

                {/* Recent applications */}
                <section className="min-w-0 overflow-hidden rounded-2xl border border-[#0a1f6b]/10 bg-white">
                  <div className="px-5 py-6 sm:px-7">
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#1646e0]">
                      Candidates
                    </p>

                    <h3 className="mt-2 text-xl font-extrabold tracking-normal text-[#0a1f6b]">
                      Recent applications
                    </h3>

                    <p className="mt-1.5 text-sm text-slate-500">
                      The latest candidates applying to your positions.
                    </p>
                  </div>

                  <div className="border-t border-slate-100 px-3 py-3 sm:px-4">
                    {recentApplications.length > 0 ? (
                      <div className="space-y-1">
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
                        title="No applications received yet."
                        description="New candidates will appear here when they apply to your published positions."
                      />
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate("/manage-jobs")}
                    className="flex w-full items-center justify-between border-t border-slate-100 px-6 py-4 text-sm font-bold text-[#1646e0] transition-colors hover:bg-[#f5f8ff] hover:text-[#0a1f6b]"
                  >
                    Review applications
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </section>
              </div>
            </section>

            {/* ---------------------------------
                FINAL ACTION
            --------------------------------- */}

            <section className="flex flex-col justify-between gap-5 rounded-2xl border border-[#0a1f6b]/10 bg-[#eaf0ff] px-6 py-7 sm:flex-row sm:items-center sm:px-8">
              <div className="max-w-xl">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#1646e0]">
                  Grow your team
                </p>

                <h2 className="mt-2 text-xl font-extrabold tracking-normal text-[#0a1f6b] sm:text-2xl">
                  Have another role to fill?
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Publish a new opportunity and connect with your next great hire.
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate("/post-job")}
                className="inline-flex flex-shrink-0 items-center justify-center gap-2 rounded-lg bg-[#0a1f6b] px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-[#1646e0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1646e0]"
              >
                Create a job listing
                <ArrowRight className="h-4 w-4" />
              </button>
            </section>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default EmployerDashboard;
