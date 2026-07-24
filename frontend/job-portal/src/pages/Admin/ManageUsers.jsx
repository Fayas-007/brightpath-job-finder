import { useEffect, useState, useRef } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { Edit3, Search, Trash2, UserPlus, Printer } from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "../../components/layout/Navbar";
import EditUserModal from "./EditUser";
import CreateUserModal from "./CreateUser";

const ManageUsers = () => {
  const normalUsersRef = useRef();
  const employersRef = useRef();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [creatingUser, setCreatingUser] = useState(false);

  const [searchNormalText, setSearchNormalText] = useState("");
  const [searchNormalField, setSearchNormalField] = useState("all");
  const [searchEmployerText, setSearchEmployerText] = useState("");
  const [searchEmployerField, setSearchEmployerField] = useState("all");

  const fetchUsers = async () => {
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
  };

  useEffect(() => {
    fetchUsers();
  }, []);

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

  // Separate users
  const normalUsers = users.filter(u => u.role === "admin" || u.role === "jobseeker");
  const employers = users.filter(u => u.role === "employer");

  const filterUsers = (list, text, field) => {
    const t = text.toLowerCase().trim();
    if (!t) return list;
    return list.filter(u => {
      if (field === "all") {
        return (
          u.name.toLowerCase().includes(t) ||
          u.email.toLowerCase().includes(t) ||
          (u.role?.toLowerCase().includes(t)) ||
          (u.companyName?.toLowerCase().includes(t))
        );
      } else if (field === "name") return u.name.toLowerCase().includes(t);
      else if (field === "email") return u.email.toLowerCase().includes(t);
      else if (field === "role") return u.role?.toLowerCase().includes(t);
      else if (field === "companyName") return u.companyName?.toLowerCase().includes(t);
      return true;
    });
  };

  const renderFilterRow = (searchText, setSearchText, searchField, setSearchField, fields) => (
    <div className="mb-4 grid gap-3 no-print sm:grid-cols-[1fr_180px]">
      <input
        type="text"
        placeholder="Search users"
        className="field-control"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
      />
      <select
        className="field-control"
        value={searchField}
        onChange={(e) => setSearchField(e.target.value)}
      >
        {fields.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
      </select>
    </div>
  );

  const renderTable = (data, showCompany = false) => (
    <div className="mb-4 overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="soft-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              {showCompany && <th>Company</th>}
              <th>Role</th>
              <th className="no-print">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map(user => (
              <tr key={user._id}>
                <td className="font-bold text-slate-950">{user.name}</td>
                <td>{user.email}</td>
                {showCompany && <td>{user.companyName || "N/A"}</td>}
                <td className="capitalize">{user.role}</td>
                <td className="no-print">
                  <div className="flex gap-2">
                  <button
                    className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                    onClick={() => setEditingUser(user)}
                  ><Edit3 className="w-4 h-4"/></button>
                  <button
                    className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                    onClick={() => handleDelete(user._id)}
                  ><Trash2 className="w-4 h-4"/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Print function with improved PDF design and footer
const handlePrint = (ref) => {
  const printContents = ref.current.innerHTML;
  const newWindow = window.open("", "_blank");
  newWindow.document.write(`
    <html>
      <head>
        <style>
          html, body {
            margin: 20px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #fff;
            color: #333;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }

          th, td {
            padding: 12px 15px;
            text-align: left;
            border: 1px solid #ddd;
            font-size: 14px;
          }

          th {
            background-color: #000; /* black header */
            color: #fff;
            text-transform: uppercase;
          }
          
          h2 { text-align: center; margin-bottom: 20px; color: black; text-transform: uppercase; letter-spacing: 1px; }

          tbody tr:nth-child(even) {
            background-color: #f3f3f3;
          }

          tbody tr:hover {
            background-color: #e0e7ff;
          }

          /* Hide elements with class 'no-print' (search bars, action buttons) */
          .no-print {
            display: none !important;
          }

          /* Hide action column (optional if th still visible) */
          th.no-print, td.no-print {
            display: none !important;
          }

          @media print {
            body {
              -webkit-print-color-adjust: exact;
            }
          }
        </style>
      </head>
      <body>
        ${printContents}
      </body>
    </html>
  `);
  newWindow.document.close();
  newWindow.focus();
  newWindow.print();
  newWindow.close();
};





  return (
    <div className="app-background app-background-admin">
      <Navbar />
      <main className="mx-auto max-w-screen-2xl px-4 pb-12 pt-24 sm:px-6 lg:px-8">

        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="text-sm font-bold uppercase text-blue-600">Admin tools</span>
            <h1 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">
              Manage Users
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Create accounts, update roles, and keep employer profiles tidy.
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setCreatingUser(true)} className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-700">
              <UserPlus className="w-4 h-4"/> Create User
            </button>
          </div>
        </div>

        {loading ? (
          <div className="page-panel rounded-lg py-20 text-center font-semibold text-blue-600">Loading users...</div>
        ) : (
          <>
            <section ref={normalUsersRef} className="page-panel mb-8 rounded-lg p-5">
              <div className="mb-4 flex items-center gap-3">
                <Search className="h-5 w-5 text-slate-400" />
                <h2 className="text-2xl font-black text-slate-950">Admins and Users</h2>
              </div>
              {renderFilterRow(searchNormalText, setSearchNormalText, searchNormalField, setSearchNormalField, [
                { value: "all", label: "All" },
                { value: "name", label: "Name" },
                { value: "email", label: "Email" },
                { value: "role", label: "Role" },
              ])}
              {filterUsers(normalUsers, searchNormalText, searchNormalField).length === 0 ? (
                <div className="text-center py-10 text-slate-500">No admins or users found</div>
              ) : (
                renderTable(filterUsers(normalUsers, searchNormalText, searchNormalField))
              )}
              <div className="flex justify-end no-print">
              <button
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100"
                onClick={() => handlePrint(normalUsersRef, "Admins & Users")}
              >
                <Printer className="w-4 h-4"/> Print
              </button>
              </div>
            </section>

            <section ref={employersRef} className="page-panel rounded-lg p-5">
              <div className="mb-4 flex items-center gap-3">
                <Search className="h-5 w-5 text-slate-400" />
                <h2 className="text-2xl font-black text-slate-950">Employers</h2>
              </div>
              {renderFilterRow(searchEmployerText, setSearchEmployerText, searchEmployerField, setSearchEmployerField, [
                { value: "all", label: "All" },
                { value: "name", label: "Name" },
                { value: "email", label: "Email" },
                { value: "companyName", label: "Company Name" },
              ])}
              {filterUsers(employers, searchEmployerText, searchEmployerField).length === 0 ? (
                <div className="text-center py-10 text-slate-500">No employers found</div>
              ) : (
                renderTable(filterUsers(employers, searchEmployerText, searchEmployerField), true)
              )}
              <div className="flex justify-end no-print">
              <button
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100"
                onClick={() => handlePrint(employersRef, "Employers")}
              >
                <Printer className="w-4 h-4"/> Print
              </button>
              </div>
            </section>
          </>
        )}

        {editingUser && (
          <EditUserModal
            user={editingUser}
            onClose={() => setEditingUser(null)}
            onUpdate={(updatedUser) => setUsers(prev => prev.map(u => u._id === updatedUser._id ? updatedUser : u))}
          />
        )}
        {creatingUser && (
          <CreateUserModal
            onClose={() => setCreatingUser(false)}
            onCreate={(newUser) => setUsers(prev => [newUser, ...prev])}
          />
        )}
      </main>
    </div>
  );
};

export default ManageUsers;
