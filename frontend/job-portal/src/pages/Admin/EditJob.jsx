import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";
import { CATEGORIES, JOB_TYPES } from "../../utils/data";
import {
  Field,
  Modal,
  Section,
  Select,
  inputClass,
  textareaClass,
} from "../../components/common/ModalKit";

const EditJobModal = ({ job, onClose, onUpdate }) => {
  const [title, setTitle] = useState(job?.title || "");
  const [description, setDescription] = useState(job?.description || "");
  const [requirements, setRequirements] = useState(job?.requirements || "");
  const [location, setLocation] = useState(job?.location || "");
  const [type, setType] = useState(job?.type || "Full-Time");
  const [category, setCategory] = useState(job?.category || "");
  const [salaryMin, setSalaryMin] = useState(job?.salaryMin || "");
  const [salaryMax, setSalaryMax] = useState(job?.salaryMax || "");
  const [companyId, setCompanyId] = useState(job?.company?._id || "");
  const [employers, setEmployers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEmployers = async () => {
      try {
        const res = await axiosInstance.get("/api/admin/users");
        setEmployers(res.data.filter((u) => u.role === "employer"));
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch employers");
      }
    };
    fetchEmployers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || !requirements || !companyId) {
      return toast.error("Please fill all required fields");
    }
    try {
      setLoading(true);
      const res = await axiosInstance.put(`/api/admin/jobs/${job._id}`, {
        title,
        description,
        requirements,
        location,
        type,
        category,
        salaryMin: salaryMin ? Number(salaryMin) : undefined,
        salaryMax: salaryMax ? Number(salaryMax) : undefined,
        companyId,
      });
      toast.success("Job updated successfully");
      onUpdate(res.data.job);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update job");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      size="lg"
      label="Jobs"
      title="Edit job"
      onClose={onClose}
      onSubmit={handleSubmit}
      submitText={loading ? "Updating..." : "Update job"}
      submitting={loading}
    >
      <Section title="Role">
        <Field label="Job title" required>
          <input
            type="text"
            placeholder="e.g. Frontend Developer"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
            required
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Employer" required>
            <Select
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              required
            >
              <option value="">Select employer</option>
              {employers.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.name || emp.companyName}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Location">
            <input
              type="text"
              placeholder="e.g. Colombo, Remote"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label="Category" required>
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="">Select category</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Job type" required>
            <Select
              value={type}
              onChange={(e) => setType(e.target.value)}
              required
            >
              <option value="">Select job type</option>
              {JOB_TYPES.map((jt) => (
                <option key={jt.value} value={jt.value}>
                  {jt.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </Section>

      <Section title="Details">
        <Field label="Description" required>
          <textarea
            placeholder="What the role involves"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`${textareaClass} min-h-[150px]`}
            rows={6}
            required
          />
        </Field>

        <Field label="Requirements" required>
          <textarea
            placeholder="Skills and experience needed"
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            className={`${textareaClass} min-h-[150px]`}
            rows={6}
            required
          />
        </Field>
      </Section>

      <Section title="Salary">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Minimum">
            <input
              type="number"
              placeholder="0"
              value={salaryMin}
              onChange={(e) => setSalaryMin(e.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label="Maximum">
            <input
              type="number"
              placeholder="0"
              value={salaryMax}
              onChange={(e) => setSalaryMax(e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>
      </Section>
    </Modal>
  );
};

export default EditJobModal;