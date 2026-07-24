import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";

const EditUserModal = ({ user, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: user.name || "",
    email: user.email || "",
    password: "",
    role: user.role || "jobseeker",
    companyName: user.companyName || "",
    companyDescription: user.companyDescription || "",
  });

  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user.avatar || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFormData({
      name: user.name || "",
      email: user.email || "",
      password: "",
      role: user.role || "jobseeker",
      companyName: user.companyName || "",
      companyDescription: user.companyDescription || "",
    });
    setAvatarPreview(user.avatar || "");
    setAvatar(null);
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = new FormData();
      payload.append("name", formData.name);
      payload.append("email", formData.email);
      payload.append("role", formData.role);

      if (formData.password) payload.append("password", formData.password);
      if (formData.role === "employer") {
        payload.append("companyName", formData.companyName);
        payload.append("companyDescription", formData.companyDescription);
      }
      if (avatar) payload.append("avatar", avatar);

      const res = await axiosInstance.put(`/api/admin/users/${user._id}`, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(res.data.message || "User updated successfully");
      onUpdate(res.data.user);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 mx-4 overflow-y-auto max-h-[90vh] transform scale-100 animate-fade-in">
        <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">
          Edit User
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
            placeholder="Password (leave blank to keep current)"
            value={formData.password}
            onChange={handleChange}
            className="border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none placeholder-gray-400 transition-all"
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
              />
              <div className="flex flex-col gap-2">
                <label className="font-medium text-gray-700">Employer Profile Image</label>
                {avatarPreview && (
                  <img
                    src={avatarPreview}
                    alt="Profile Preview"
                    className="w-28 h-28 object-contain border rounded-md"
                  />
                )}
                <input
                  type="file"
                  accept=".png,.jpg,.jpeg"
                  onChange={handleFileChange}
                  className="border border-gray-300 px-4 py-2 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none placeholder-gray-400 transition-all"
                />
              </div>
            </>
          )}

          <div className="flex justify-end gap-4 mt-6">
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
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;
