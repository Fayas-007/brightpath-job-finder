import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";
import {
  Field,
  Modal,
  fileClass,
  inputClass,
  textareaClass,
} from "../../components/common/ModalKit";

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

      const res = await axiosInstance.put(
        `/api/admin/users/${user._id}`,
        payload,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

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
    <Modal
      label="Users"
      title="Edit user"
      onClose={onClose}
      onSubmit={handleSubmit}
      submitText={saving ? "Saving..." : "Save changes"}
      submitting={saving}
    >
      <Field label="Full name" required>
        <input
          type="text"
          name="name"
          placeholder="Full name"
          value={formData.name}
          onChange={handleChange}
          className={inputClass}
          required
        />
      </Field>

      <Field label="Email address" required>
        <input
          type="email"
          name="email"
          placeholder="name@example.com"
          value={formData.email}
          onChange={handleChange}
          className={inputClass}
          required
        />
      </Field>

      <Field label="Password" hint="Leave blank to keep the current password.">
        <input
          type="password"
          name="password"
          placeholder="New password"
          value={formData.password}
          onChange={handleChange}
          className={inputClass}
        />
      </Field>

      <Field label="Role" required>
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className={inputClass}
          required
        >
          <option value="admin">Admin</option>
          <option value="jobseeker">Job Seeker</option>
          <option value="employer">Employer</option>
        </select>
      </Field>

      {formData.role === "employer" && (
        <>
          <Field label="Company name" required>
            <input
              type="text"
              name="companyName"
              placeholder="Company name"
              value={formData.companyName}
              onChange={handleChange}
              className={inputClass}
              required
            />
          </Field>

          <Field label="Company description">
            <textarea
              name="companyDescription"
              placeholder="What the company does"
              value={formData.companyDescription}
              onChange={handleChange}
              className={textareaClass}
              rows={3}
            />
          </Field>

          <Field label="Employer profile image">
            <div className="space-y-3">
              {avatarPreview && (
                <img
                  src={avatarPreview}
                  alt="Profile preview"
                  className="h-24 w-24 rounded-md border border-[#0f1115]/10 bg-[#f4f4f5] object-contain"
                />
              )}

              <input
                type="file"
                accept=".png,.jpg,.jpeg"
                onChange={handleFileChange}
                className={fileClass}
              />
            </div>
          </Field>
        </>
      )}
    </Modal>
  );
};

export default EditUserModal;