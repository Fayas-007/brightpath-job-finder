import { createElement, useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import {
  ArrowRight,
  BriefcaseBusiness,
  ClipboardList,
  Loader,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";

const StatCard = ({ title, value, icon: Icon, path, tone, onClick }) => {
  const tones = {
    blue: "bg-blue-50 text-blue-700",
    teal: "bg-teal-50 text-teal-700",
    amber: "bg-amber-50 text-amber-700",
  };

  return (
    <button
      type="button"
      onClick={() => onClick(path)}
      className="group rounded-lg border border-slate-200 bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">{title}</p>
          <p className="mt-3 text-3xl font-black text-slate-950">{value}</p>
        </div>
        <span className={`flex h-11 w-11 items-center justify-center rounded-lg ${tones[tone]}`}>
          {createElement(Icon, { className: "h-5 w-5" })}
        </span>
      </div>
      <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-slate-600 group-hover:text-slate-950">
        View details
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </button>
  );
};

const TableCard = ({ title, children }) => (
  <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
    <div className="border-b border-slate-100 px-5 py-4">
      <h2 className="text-lg font-black text-slate-950">{title}</h2>
    </div>
    <div className="overflow-x-auto">{children}</div>
  </section>
);

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await axiosInstance.get("/api/admin/dashboard");
        setData(res.data);
      } catch (err) {
        console.error(err);
        if (err.response?.status === 403) {
          navigate("/", { replace: true });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="app-background app-background-admin flex h-screen items-center justify-center">
        <Loader className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!data) return null;

  const applicationStatus = ["Applied", "In Review", "Rejected", "Accepted"];
  const chartData = applicationStatus.map((status) => ({
    status,
    count: data?.applications?.filter((app) => app.status === status).length || 0,
  }));

  return (
    <div className="app-background app-background-admin">
      <Navbar />

      <main className="mx-auto max-w-screen-2xl px-4 pb-12 pt-24 sm:px-6 lg:px-8">
        <div className="mb-8">
          <span className="text-sm font-bold uppercase text-blue-600">
            Platform control
          </span>
          <h1 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">
            Admin Dashboard
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            Monitor users, jobs, and applications from one clean operational
            view.
          </p>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            title="Total Users"
            value={data?.users?.length || 0}
            icon={Users}
            path="/manage-users"
            tone="blue"
            onClick={navigate}
          />
          <StatCard
            title="Jobs Posted"
            value={data?.jobs?.length || 0}
            icon={BriefcaseBusiness}
            path="/admin/manage-jobs"
            tone="teal"
            onClick={navigate}
          />
          <StatCard
            title="Applications"
            value={data?.applications?.length || 0}
            icon={ClipboardList}
            path="/admin/manage-applications"
            tone="amber"
            onClick={navigate}
          />
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <TableCard title="Recent Users">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-5 py-3 text-left text-sm font-bold text-slate-600">Name</th>
                  <th className="px-5 py-3 text-left text-sm font-bold text-slate-600">Email</th>
                  <th className="px-5 py-3 text-left text-sm font-bold text-slate-600">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data?.users?.slice(0, 5).map((user) => (
                  <tr key={user._id} className="hover:bg-slate-50">
                    <td className="px-5 py-3 text-sm font-semibold text-slate-950">{user.name}</td>
                    <td className="px-5 py-3 text-sm text-slate-600">{user.email}</td>
                    <td className="px-5 py-3 text-sm capitalize text-slate-600">{user.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableCard>

          <TableCard title="Recent Jobs">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-5 py-3 text-left text-sm font-bold text-slate-600">Title</th>
                  <th className="px-5 py-3 text-left text-sm font-bold text-slate-600">Company</th>
                  <th className="px-5 py-3 text-left text-sm font-bold text-slate-600">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data?.jobs?.slice(0, 5).map((job) => (
                  <tr key={job._id} className="hover:bg-slate-50">
                    <td className="px-5 py-3 text-sm font-semibold text-slate-950">{job.title}</td>
                    <td className="px-5 py-3 text-sm text-slate-600">
                      {data?.users?.find((u) => u._id === job.company)?.companyName || "N/A"}
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-600">{job.type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableCard>
        </div>

        <section className="page-panel rounded-lg p-5">
          <div className="mb-5">
            <h2 className="text-lg font-black text-slate-950">
              Application Status
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Current distribution across hiring stages.
            </p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <XAxis dataKey="status" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  boxShadow: "0 10px 25px rgba(15, 23, 42, 0.08)",
                }}
              />
              <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;
