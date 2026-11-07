import { useCallback, useEffect, useMemo, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { ArrowRight, Loader, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/layout/AdminLayout";
import Avatar from "../../components/common/Avatar";
import { Count, MaskText, Reveal } from "../../components/common/motion";

/* ---------------------------------------------
   Constants
--------------------------------------------- */

// "In Review" is deliberately more orange than the brand yellow.
const STATUS_META = {
  Applied: { color: "#71717a", note: "Awaiting first look" },
  "In Review": { color: "#e08a00", note: "Being assessed" },
  Accepted: { color: "#2f8f6b", note: "Moved forward" },
  Rejected: { color: "#c8412f", note: "Closed out" },
};

const STATUS_ORDER = ["Applied", "In Review", "Accepted", "Rejected"];

const normalizeRole = (role = "") => role.toLowerCase().replace(/\s+/g, "");

const isJobSeeker = (u) => normalizeRole(u.role) === "jobseeker";
const isEmployer = (u) =>
  ["employer", "recruiter"].includes(normalizeRole(u.role));
const isAdmin = (u) => normalizeRole(u.role) === "admin";

/* ---------------------------------------------
   Shared components
--------------------------------------------- */

const Label = ({ children, className = "" }) => (
  <p
    className={`font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500 ${className}`}
  >
    {children}
  </p>
);

const Card = ({ className = "", children }) => (
  <section
    className={`min-w-0 rounded-md border border-[#0f1115]/10 bg-white ${className}`}
  >
    {children}
  </section>
);

const CardHeader = ({ label, title, action, onAction }) => (
  <div className="flex items-end justify-between gap-4 border-b border-zinc-100 px-5 py-4">
    <div>
      <Label>{label}</Label>
      <h2 className="mt-1.5 text-base font-bold tracking-normal text-[#0f1115]">
        {title}
      </h2>
    </div>

    {action && (
      <button
        type="button"
        onClick={onAction}
        className="group inline-flex items-center gap-1.5 rounded-sm font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-[#1646e0] transition-colors hover:text-[#0f1115] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1646e0]"
      >
        {action}
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </button>
    )}
  </div>
);

const Tag = ({ children, tone = "neutral" }) => {
  const tones = {
    neutral: "border-zinc-300 text-zinc-600",
    accent: "border-[#1646e0]/30 bg-[#1646e0]/10 text-[#1646e0]",
    ink: "border-[#0f1115] bg-[#0f1115] text-white",
    onDark: "border-[#5b8cff]/40 bg-[#5b8cff]/15 text-[#8fb0ff]",
  };

  return (
    <span
      className={`inline-flex flex-shrink-0 items-center rounded-sm border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.1em] ${tones[tone]}`}
    >
      {children}
    </span>
  );
};

const roleTone = (role = "") => {
  const value = normalizeRole(role);
  if (value === "admin") return "ink";
  if (value === "employer" || value === "recruiter") return "accent";
  return "neutral";
};

const EmptyRow = ({ text }) => (
  <p className="px-5 py-10 text-center text-sm text-zinc-500">{text}</p>
);

/* ---------------------------------------------
   Admin Dashboard
--------------------------------------------- */

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastSync, setLastSync] = useState(null);
  const navigate = useNavigate();

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      const res = await axiosInstance.get("/api/admin/dashboard");

      setData(res.data);
      setLastSync(new Date());
    } catch (err) {
      console.error(err);

      if (err.response?.status === 403) {
        navigate("/", { replace: true });
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const users = useMemo(() => data?.users || [], [data]);
  const jobs = useMemo(() => data?.jobs || [], [data]);
  const applications = useMemo(() => data?.applications || [], [data]);

  const statusCounts = useMemo(
    () =>
      STATUS_ORDER.map((status) => ({
        status,
        count: applications.filter((app) => app.status === status).length,
        ...STATUS_META[status],
      })),
    [applications]
  );

  const roleGroups = useMemo(
    () => [
      {
        label: "Job seekers",
        count: users.filter(isJobSeeker).length,
        color: "#71717a",
      },
      {
        label: "Employers",
        count: users.filter(isEmployer).length,
        color: "#1646e0",
      },
      {
        label: "Admins",
        count: users.filter(isAdmin).length,
        color: "#0f1115",
      },
    ],
    [users]
  );

  // Lookup map instead of scanning users for every job row.
  const companyById = useMemo(
    () =>
      users.reduce((map, u) => {
        if (u.companyName) map[u._id] = u.companyName;
        return map;
      }, {}),
    [users]
  );

  const badges = {
    users: users.length,
    jobs: jobs.length,
    applications: applications.length,
  };

  /* First load */
  if (loading && !data) {
    return (
      <AdminLayout title="Overview">
        <div className="flex h-[60vh] items-center justify-center">
          <Loader className="h-8 w-8 animate-spin text-[#1646e0]" />
        </div>
      </AdminLayout>
    );
  }

  /* Error */
  if (!data) {
    return (
      <AdminLayout title="Overview">
        <div className="mx-auto mt-16 max-w-md rounded-md border border-[#0f1115]/10 bg-white px-6 py-14 text-center">
          <Label className="text-[#c8412f]">Connection problem</Label>

          <h2 className="mt-3 text-xl font-bold text-[#0f1115]">
            The overview didn't load.
          </h2>

          <p className="mt-2 text-sm leading-6 text-zinc-500">
            Check your connection and try again.
          </p>

          <button
            type="button"
            onClick={fetchDashboardData}
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-[#0f1115] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#1646e0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0f1115]"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        </div>
      </AdminLayout>
    );
  }

  const countOf = (status) =>
    statusCounts.find((item) => item.status === status)?.count || 0;

  const pending = countOf("Applied") + countOf("In Review");

  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const syncTime = lastSync
    ? lastSync.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "--:--";

  return (
    <AdminLayout title="Overview" badges={badges}>
      <div className="relative z-10 mx-auto w-full max-w-[1400px] space-y-6">
        {/* ---------------------------------
            TITLE ROW
        --------------------------------- */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Reveal variant="fade">
              <Label>{today}</Label>
            </Reveal>

            <h1 className="mt-2 text-3xl font-extrabold tracking-normal text-[#0f1115] sm:text-4xl">
              <MaskText delay={100}>Moderation console</MaskText>
            </h1>
          </div>

          <Reveal variant="fade" delay={250}>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-md border border-[#0f1115]/10 bg-white px-3 py-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2f8f6b] opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#2f8f6b]" />
                </span>

                <span className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-600">
                  Live · synced {syncTime}
                </span>
              </div>

              <button
                type="button"
                onClick={fetchDashboardData}
                disabled={loading}
                className="flex h-9 w-9 items-center justify-center rounded-md border border-[#0f1115]/10 bg-white text-[#0f1115] transition-colors hover:bg-[#0f1115] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1646e0] disabled:opacity-50"
                aria-label="Refresh overview"
              >
                <RefreshCw
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
              </button>
            </div>
          </Reveal>
        </div>

        {/* ---------------------------------
            QUEUE + TOTALS
        --------------------------------- */}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          {/* Moderation queue */}
          <Reveal variant="wipe" delay={150} className="h-full">
            <section className="flex h-full min-w-0 flex-col justify-between rounded-md border-l-4 border-[#5b8cff] bg-[#0f1115] p-6 text-white sm:p-7">
              <div>
                <div className="flex items-center justify-between gap-3">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#8fb0ff]">
                    Needs attention
                  </p>

                  <Tag tone="onDark">Queue</Tag>
                </div>

                <p className="mt-6 font-mono text-6xl font-bold leading-none tabular-nums sm:text-7xl">
                  <Count value={pending} />
                </p>

                <p className="mt-3 text-sm leading-6 text-white/60">
                  {pending === 1 ? "application is" : "applications are"}{" "}
                  waiting on a decision.
                </p>
              </div>

              <div className="mt-8 space-y-4">
                <div className="grid grid-cols-2 gap-px overflow-hidden rounded-md bg-white/10">
                  <div className="bg-[#0f1115] px-4 py-3">
                    <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-white/50">
                      Applied
                    </p>
                    <p className="mt-1 font-mono text-xl font-bold tabular-nums">
                      {countOf("Applied")}
                    </p>
                  </div>

                  <div className="bg-[#0f1115] px-4 py-3">
                    <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-white/50">
                      In review
                    </p>
                    <p className="mt-1 font-mono text-xl font-bold tabular-nums">
                      {countOf("In Review")}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigate("/admin/manage-applications")}
                  className="group flex w-full items-center justify-between rounded-md bg-white px-5 py-3 text-sm font-bold text-[#0f1115] transition-colors hover:bg-zinc-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  Open the queue
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            </section>
          </Reveal>

          {/* Totals */}
          <Reveal delay={300} className="h-full">
            <Card className="flex h-full flex-col">
              <CardHeader label="Platform totals" title="Records on the platform" />

              <div className="grid flex-1 grid-cols-1 divide-y divide-zinc-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                {[
                  {
                    label: "Users",
                    value: users.length,
                    note: "Registered accounts",
                    path: "/manage-users",
                  },
                  {
                    label: "Jobs",
                    value: jobs.length,
                    note: "Listings posted",
                    path: "/admin/manage-jobs",
                  },
                  {
                    label: "Applications",
                    value: applications.length,
                    note: "Submitted so far",
                    path: "/admin/manage-applications",
                  },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => navigate(item.path)}
                    className="group flex min-w-0 flex-col justify-between p-5 text-left transition-colors hover:bg-[#f4f4f5] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#1646e0] sm:p-6"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <Label>{item.label}</Label>
                      <ArrowRight className="h-3.5 w-3.5 text-zinc-400 transition-all group-hover:translate-x-0.5 group-hover:text-[#1646e0]" />
                    </div>

                    <div className="mt-8">
                      <p className="font-mono text-5xl font-bold leading-none tabular-nums text-[#0f1115]">
                        <Count value={item.value} />
                      </p>
                      <p className="mt-2 text-xs text-zinc-500">{item.note}</p>
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          </Reveal>
        </div>

        {/* ---------------------------------
            PIPELINE + ROLES
        --------------------------------- */}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          <Reveal className="h-full">
            <Card className="h-full">
              <CardHeader
                label="Hiring pipeline"
                title="Where applications stand"
                action="Review"
                onAction={() => navigate("/admin/manage-applications")}
              />

              <div className="px-5 pb-2 pt-6">
                <div className="flex h-4 w-full gap-[2px] overflow-hidden rounded-sm bg-zinc-100">
                  {applications.length > 0 &&
                    statusCounts
                      .filter((item) => item.count > 0)
                      .map((item, index) => (
                        <div
                          key={item.status}
                          className="m-grow h-full"
                          style={{
                            width: `${(item.count / applications.length) * 100}%`,
                            backgroundColor: item.color,
                            transitionDelay: `${300 + index * 100}ms`,
                          }}
                          title={`${item.status}: ${item.count}`}
                        />
                      ))}
                </div>
              </div>

              <ul className="px-5 pb-3 pt-2">
                {statusCounts.map((item, index) => {
                  const share = applications.length
                    ? Math.round((item.count / applications.length) * 100)
                    : 0;

                  return (
                    <li
                      key={item.status}
                      className="m-item flex items-center gap-4 border-b border-zinc-100 py-3.5 last:border-b-0"
                      style={{ transitionDelay: `${250 + index * 70}ms` }}
                    >
                      <span
                        className="h-2.5 w-2.5 flex-shrink-0 rounded-sm"
                        style={{ backgroundColor: item.color }}
                      />

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-[#0f1115]">
                          {item.status}
                        </p>
                        <p className="text-xs text-zinc-500">{item.note}</p>
                      </div>

                      <p className="w-12 text-right font-mono text-xs tabular-nums text-zinc-500">
                        {share}%
                      </p>

                      <p className="w-12 text-right font-mono text-lg font-bold tabular-nums text-[#0f1115]">
                        {item.count}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </Card>
          </Reveal>

          <Reveal delay={120} className="h-full">
            <Card className="h-full">
              <CardHeader
                label="Accounts"
                title="Users by role"
                action="Manage"
                onAction={() => navigate("/manage-users")}
              />

              <ul className="space-y-6 px-5 py-6">
                {roleGroups.map((group, index) => {
                  const share = users.length
                    ? Math.round((group.count / users.length) * 100)
                    : 0;

                  return (
                    <li key={group.label}>
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="text-sm font-bold text-[#0f1115]">
                          {group.label}
                        </p>

                        <p className="font-mono text-xs tabular-nums text-zinc-500">
                          <span className="text-base font-bold text-[#0f1115]">
                            {group.count}
                          </span>{" "}
                          / {share}%
                        </p>
                      </div>

                      <div className="mt-2.5 h-1.5 overflow-hidden rounded-sm bg-zinc-100">
                        <div
                          className="m-grow h-full"
                          style={{
                            width: `${share}%`,
                            backgroundColor: group.color,
                            transitionDelay: `${400 + index * 120}ms`,
                          }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </Card>
          </Reveal>
        </div>

        {/* ---------------------------------
            RECENT ACTIVITY
        --------------------------------- */}

        <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-2">
          <Reveal>
            <Card className="overflow-hidden">
              <CardHeader
                label="Latest accounts"
                title="Recent users"
                action="All users"
                onAction={() => navigate("/manage-users")}
              />

              {users.length > 0 ? (
                <ul>
                  {users.slice(0, 6).map((user, index) => (
                    <li
                      key={user._id}
                      className="m-item border-b border-zinc-100 last:border-b-0"
                      style={{ transitionDelay: `${200 + index * 60}ms` }}
                    >
                      <button
                        type="button"
                        onClick={() => navigate("/manage-users")}
                        className="flex w-full items-center gap-4 px-5 py-3.5 text-left transition-colors hover:bg-[#f4f4f5] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#1646e0]"
                      >
                        <Avatar user={user} />

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-[#0f1115]">
                            {user.name}
                          </p>
                          <p className="truncate font-mono text-[11px] text-zinc-500">
                            {user.email}
                          </p>
                        </div>

                        <Tag tone={roleTone(user.role)}>{user.role}</Tag>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyRow text="No users have registered yet." />
              )}
            </Card>
          </Reveal>

          <Reveal delay={120}>
            <Card className="overflow-hidden">
              <CardHeader
                label="Latest listings"
                title="Recent jobs"
                action="All jobs"
                onAction={() => navigate("/admin/manage-jobs")}
              />

              {jobs.length > 0 ? (
                <ul>
                  {jobs.slice(0, 6).map((job, index) => (
                    <li
                      key={job._id}
                      className="m-item border-b border-zinc-100 last:border-b-0"
                      style={{ transitionDelay: `${200 + index * 60}ms` }}
                    >
                      <button
                        type="button"
                        onClick={() => navigate("/admin/manage-jobs")}
                        className="flex w-full items-center gap-4 px-5 py-3.5 text-left transition-colors hover:bg-[#f4f4f5] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#1646e0]"
                      >
                        <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md border border-zinc-300 font-mono text-[10px] font-bold text-zinc-600">
                          {String(index + 1).padStart(2, "0")}
                        </span>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-[#0f1115]">
                            {job.title}
                          </p>
                          <p className="truncate text-xs text-zinc-500">
                            {companyById[job.company] || "Company not listed"}
                          </p>
                        </div>

                        {job.type && <Tag>{job.type}</Tag>}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyRow text="No jobs have been posted yet." />
              )}
            </Card>
          </Reveal>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;