import { useCallback, useEffect, useMemo, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import {
  Edit3,
  Printer,
  Search,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import AdminLayout from "../../components/layout/AdminLayout";
import EditUserModal from "./EditUser";
import CreateUserModal from "./CreateUser";
import Avatar from "../../components/common/Avatar";
import { MaskText, Reveal } from "../../components/common/motion";

/* ---------------------------------------------
   Helpers
--------------------------------------------- */

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const normalizeRole = (role = "") => role.toLowerCase().replace(/\s+/g, "");

const isAdmin = (u) => normalizeRole(u.role) === "admin";
const isJobSeeker = (u) => normalizeRole(u.role) === "jobseeker";
const isEmployer = (u) =>
  ["employer", "recruiter"].includes(normalizeRole(u.role));

const SEARCH_KEYS = {
  name: ["name"],
  email: ["email"],
  role: ["role"],
  companyName: ["companyName"],
  all: ["name", "email", "role", "companyName"],
};

const filterUsers = (list, text, field) => {
  const term = text.toLowerCase().trim();

  if (!term) return list;

  const keys = SEARCH_KEYS[field] || SEARCH_KEYS.all;

  return list.filter((u) =>
    keys.some((key) => (u[key] || "").toLowerCase().includes(term))
  );
};

const roleTone = (role = "") => {
  const value = normalizeRole(role);
  if (value === "admin") return "ink";
  if (value === "employer" || value === "recruiter") return "accent";
  return "neutral";
};

const handlePrint = (title, list, showCompany) => {
  const rows = list
    .map(
      (u) => `
        <tr>
          <td>${escapeHtml(u.name)}</td>
          <td>${escapeHtml(u.email)}</td>
          ${showCompany ? `<td>${escapeHtml(u.companyName || "N/A")}</td>` : ""}
          <td style="text-transform:capitalize">${escapeHtml(u.role)}</td>
        </tr>`
    )
    .join("");

  const printWindow = window.open("", "_blank");

  if (!printWindow) {
    toast.error("Allow pop-ups to print this list");
    return;
  }

  printWindow.document.write(`
    <html>
      <head>
        <title>${escapeHtml(title)}</title>
        <style>
          html, body {
            margin: 24px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: #0f1115;
            background: #fff;
          }
          h1 {
            margin: 0 0 4px;
            font-size: 22px;
            letter-spacing: 0.04em;
            text-transform: uppercase;
          }
          p { margin: 0 0 20px; font-size: 12px; color: #71717a; }
          table { width: 100%; border-collapse: collapse; }
          th, td {
            padding: 10px 14px;
            text-align: left;
            border: 1px solid #e4e4e7;
            font-size: 13px;
          }
          th {
            background: #0f1115;
            color: #fff;
            text-transform: uppercase;
            font-size: 11px;
            letter-spacing: 0.08em;
          }
          tbody tr:nth-child(even) { background: #f4f4f5; }
          @media print { body { -webkit-print-color-adjust: exact; } }
        </style>
      </head>
      <body>
        <h1>${escapeHtml(title)}</h1>
        <p>${list.length} records · printed ${new Date().toLocaleDateString("en-GB")}</p>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              ${showCompany ? "<th>Company</th>" : ""}
              <th>Role</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
};

/* ---------------------------------------------
   Small components
--------------------------------------------- */

const Label = ({ children, className = "" }) => (
  <p
    className={`font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500 ${className}`}
  >
    {children}
  </p>
);

const Tag = ({ children, tone = "neutral" }) => {
  const tones = {
    neutral: "border-zinc-300 text-zinc-600",
    accent: "border-[#1646e0]/30 bg-[#1646e0]/10 text-[#1646e0]",
    ink: "border-[#0f1115] bg-[#0f1115] text-white",
  };

  return (
    <span
      className={`inline-flex flex-shrink-0 items-center rounded-sm border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.1em] ${tones[tone]}`}
    >
      {children}
    </span>
  );
};

const SkeletonRows = () => (
  <div className="animate-pulse divide-y divide-zinc-100">
    {[1, 2, 3, 4].map((row) => (
      <div key={row} className="flex items-center gap-4 px-5 py-4">
        <div className="h-9 w-9 rounded-md bg-zinc-200" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-40 rounded-sm bg-zinc-200" />
          <div className="h-3 w-56 rounded-sm bg-zinc-100" />
        </div>
        <div className="h-5 w-16 rounded-sm bg-zinc-200" />
      </div>
    ))}
  </div>
);

const TH_CLASS =
  "px-5 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500";

/* ---------------------------------------------
   User section (own search state, table, print)
--------------------------------------------- */

const UserSection = ({
  label,
  title,
  users,
  fields,
  showCompany = false,
  emptyText,
  loading,
  delay = 0,
  onEdit,
  onDelete,
}) => {
  const [text, setText] = useState("");
  const [field, setField] = useState("all");

  const filtered = useMemo(
    () => filterUsers(users, text, field),
    [users, text, field]
  );

  return (
    <Reveal delay={delay}>
      <section className="min-w-0 overflow-hidden rounded-md border border-[#0f1115]/10 bg-white">
        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-zinc-100 px-5 py-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Label>{label}</Label>

            <h2 className="mt-1.5 flex items-center gap-3 text-base font-bold tracking-normal text-[#0f1115]">
              {title}
              <span className="rounded-sm bg-[#0f1115] px-2 py-0.5 font-mono text-[11px] font-bold tabular-nums text-white">
                {users.length}
              </span>
            </h2>
          </div>

          <button
            type="button"
            onClick={() => handlePrint(title, filtered, showCompany)}
            disabled={filtered.length === 0}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-[#0f1115]/20 px-3.5 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-[#0f1115] transition-colors hover:bg-[#0f1115] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1646e0] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Printer className="h-3.5 w-3.5" />
            Print
          </button>
        </div>

        {/* Search */}
        <div className="grid gap-3 border-b border-zinc-100 px-5 py-3.5 sm:grid-cols-[minmax(0,1fr)_180px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Search users"
              aria-label={`Search ${title}`}
              className="h-10 w-full rounded-md border border-[#0f1115]/20 bg-white pl-9 pr-9 text-sm text-[#0f1115] placeholder:text-zinc-400 focus:border-[#1646e0] focus:outline-none focus:ring-2 focus:ring-[#1646e0]/20"
            />

            {text && (
              <button
                type="button"
                onClick={() => setText("")}
                className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-sm text-zinc-500 hover:bg-zinc-100"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <select
            value={field}
            onChange={(e) => setField(e.target.value)}
            aria-label="Search field"
            className="h-10 rounded-md border border-[#0f1115]/20 bg-white px-3 text-sm text-[#0f1115] focus:border-[#1646e0] focus:outline-none focus:ring-2 focus:ring-[#1646e0]/20"
          >
            {fields.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>

        {/* Body */}
        {loading ? (
          <SkeletonRows />
        ) : filtered.length === 0 ? (
          <p className="px-5 py-14 text-center text-sm text-zinc-500">
            {text ? "No records match your search." : emptyText}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead>
                <tr className="bg-[#ececef]">
                  <th className={TH_CLASS}>Name</th>
                  <th className={TH_CLASS}>Email</th>
                  {showCompany && <th className={TH_CLASS}>Company</th>}
                  <th className={TH_CLASS}>Role</th>
                  <th className={`${TH_CLASS} text-right`}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((user, index) => (
                  <tr
                    key={user._id}
                    className="m-row border-t border-zinc-100 transition-colors hover:bg-[#f4f4f5]"
                    style={{ "--m-row-delay": `${Math.min(index, 12) * 35}ms` }}
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar user={user} />
                        <span className="text-sm font-bold text-[#0f1115]">
                          {user.name}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-3 font-mono text-xs text-zinc-600">
                      {user.email}
                    </td>

                    {showCompany && (
                      <td className="px-5 py-3 text-sm text-zinc-600">
                        {user.companyName || (
                          <span className="text-zinc-400">Not listed</span>
                        )}
                      </td>
                    )}

                    <td className="px-5 py-3">
                      <Tag tone={roleTone(user.role)}>{user.role}</Tag>
                    </td>

                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onEdit(user)}
                          className="flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-zinc-600 transition-colors hover:border-[#0f1115]/15 hover:bg-white hover:text-[#0f1115] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1646e0]"
                          aria-label={`Edit ${user.name}`}
                          title="Edit"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onDelete(user._id)}
                          className="flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-zinc-600 transition-colors hover:border-[#c8412f]/30 hover:bg-[#c8412f]/10 hover:text-[#c8412f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c8412f]"
                          aria-label={`Delete ${user.name}`}
                          title="Delete"
                        >
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

        {/* Footer */}
        {!loading && users.length > 0 && (
          <div className="border-t border-zinc-100 px-5 py-3">
            <p className="font-mono text-[11px] tabular-nums text-zinc-500">
              Showing {filtered.length} of {users.length}
            </p>
          </div>
        )}
      </section>
    </Reveal>
  );
};

/* ---------------------------------------------
   Section config
--------------------------------------------- */

const MEMBER_FIELDS = [
  { value: "all", label: "All fields" },
  { value: "name", label: "Name" },
  { value: "email", label: "Email" },
  { value: "role", label: "Role" },
];

const EMPLOYER_FIELDS = [
  { value: "all", label: "All fields" },
  { value: "name", label: "Name" },
  { value: "email", label: "Email" },
  { value: "companyName", label: "Company name" },
];

/* ---------------------------------------------
   Manage Users
--------------------------------------------- */

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [creatingUser, setCreatingUser] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/api/admin/users");
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDelete = async (userId) => {
    const confirmed = window.confirm(
      "Delete this user and all related data? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      await axiosInstance.delete(`/api/admin/users/${userId}`);
      toast.success("User deleted");
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to delete user");
    }
  };

  const members = useMemo(
    () => users.filter((u) => isAdmin(u) || isJobSeeker(u)),
    [users]
  );

  const employers = useMemo(() => users.filter(isEmployer), [users]);

  return (
    <AdminLayout title="Users" badges={{ users: users.length }}>
      <div className="relative z-10 mx-auto w-full max-w-[1400px] space-y-6">
        {/* Title row */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Reveal variant="fade">
              <Label>Moderation</Label>
            </Reveal>

            <h1 className="mt-2 text-3xl font-extrabold tracking-normal text-[#0f1115] sm:text-4xl">
              <MaskText delay={100}>Manage users</MaskText>
            </h1>

            <Reveal variant="fade" delay={200}>
              <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-500">
                Create accounts, update roles and keep employer profiles tidy.
              </p>
            </Reveal>
          </div>

          <Reveal variant="fade" delay={250}>
            <button
              type="button"
              onClick={() => setCreatingUser(true)}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-[#0f1115] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#1646e0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0f1115]"
            >
              <UserPlus className="h-4 w-4" />
              Create user
            </button>
          </Reveal>
        </div>

        <UserSection
          label="Members"
          title="Admins and users"
          users={members}
          loading={loading}
          emptyText="No admins or users found."
          fields={MEMBER_FIELDS}
          delay={150}
          onEdit={setEditingUser}
          onDelete={handleDelete}
        />

        <UserSection
          label="Companies"
          title="Employers"
          users={employers}
          loading={loading}
          showCompany
          emptyText="No employers found."
          fields={EMPLOYER_FIELDS}
          delay={120}
          onEdit={setEditingUser}
          onDelete={handleDelete}
        />
      </div>

      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onUpdate={(updatedUser) =>
            setUsers((prev) =>
              prev.map((u) => (u._id === updatedUser._id ? updatedUser : u))
            )
          }
        />
      )}

      {creatingUser && (
        <CreateUserModal
          onClose={() => setCreatingUser(false)}
          onCreate={(newUser) => setUsers((prev) => [newUser, ...prev])}
        />
      )}
    </AdminLayout>
  );
};

export default ManageUsers;