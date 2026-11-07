import { useState } from "react";
import toast from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";
import {
  Field,
  Modal,
  fileClass,
  inputClass,
  textareaClass,
} from "../../components/common/ModalKit";

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
    <Modal
      label="Users"
      title="Create user"
      onClose={onClose}
      onSubmit={handleSubmit}
      submitText={saving ? "Creating..." : "Create user"}
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

      <Field label="Password" required>
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className={inputClass}
          required
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

          <Field label="Company description" required>
            <textarea
              name="companyDescription"
              placeholder="What the company does"
              value={formData.companyDescription}
              onChange={handleChange}
              className={textareaClass}
              rows={3}
              required
            />
          </Field>

          <Field label="Employer profile image">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className={fileClass}
            />
          </Field>
        </>
      )}
    </Modal>
  );
};

export default CreateUserModal;