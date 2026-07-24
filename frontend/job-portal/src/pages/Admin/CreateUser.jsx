import { useState } from "react";
import toast from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";

const CreateUserModal = ({ onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "jobseeker",
    companyName: "",
    companyDescription: "",
  });
  const [avatar, setAvatar] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setAvatar(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("email", formData.email);
      data.append("password", formData.password);
      data.append("role", formData.role);

      if (formData.role === "employer") {
        data.append("companyName", formData.companyName);
        data.append("companyDescription", formData.companyDescription);
        if (avatar) data.append("avatar", avatar);
      }

      const res = await axiosInstance.post("/api/admin/users", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(res.data.message || "User created successfully");
      onCreate(res.data.user);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to create user");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 mx-4 transform scale-100 animate-fade-in">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Create User
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            className="border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none placeholder-gray-400 transition-all"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            className="border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none placeholder-gray-400 transition-all"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none placeholder-gray-400 transition-all"
            required
          />
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none placeholder-gray-400 transition-all"
            required
          >
            <option value="admin">Admin</option>
            <option value="jobseeker">Job Seeker</option>
            <option value="employer">Employer</option>
          </select>

          {formData.role === "employer" && (
            <>
              <input
                type="text"
                name="companyName"
                placeholder="Company Name"
                value={formData.companyName}
                onChange={handleChange}
                className="border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none placeholder-gray-400 transition-all"
                required
              />
              <textarea
                name="companyDescription"
                placeholder="Company Description"
                value={formData.companyDescription}
                onChange={handleChange}
                className="border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none placeholder-gray-400 transition-all resize-none"
                rows={3}
                required
              />
              <label className="text-sm font-semibold text-gray-700">
                Employer profile image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="border border-gray-300 px-4 py-2 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none placeholder-gray-400 transition-all"
              />
            </>
          )}

          <div className="flex justify-end gap-4 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium transition"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-semibold transition shadow-md"
              disabled={saving}
            >
              {saving ? "Creating..." : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUserModal;
