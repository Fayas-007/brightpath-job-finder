import { useState, useEffect } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";
import { CATEGORIES, JOB_TYPES } from "../../utils/data";

const CreateJobModal = ({ onClose, onCreate }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("Full-Time");
  const [category, setCategory] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [companyId, setCompanyId] = useState("");
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
      const res = await axiosInstance.post("/api/admin/jobs", {
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
      toast.success("Job created successfully");
      onCreate(res.data);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to create job");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Create Job
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <select
            value={companyId}
            onChange={(e) => setCompanyId(e.target.value)}
            className="border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none placeholder-gray-400 transition-all"
            required
          >
            <option value="">Select Employer *</option>
            {employers.map((e) => (
              <option key={e._id} value={e._id}>
                {e.name}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Job Title *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none placeholder-gray-400 transition-all"
            required
          />
          <textarea
            placeholder="Job Description *"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none placeholder-gray-400 transition-all resize-none"
            rows={4}
            required
          />
          <textarea
            placeholder="Requirements *"
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            className="border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none placeholder-gray-400 transition-all resize-none"
            rows={4}
            required
          />
          <input
            type="text"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none placeholder-gray-400 transition-all"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none placeholder-gray-400 transition-all"
              required
            >
              <option value="">Select Category *</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>

            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none placeholder-gray-400 transition-all"
              required
            >
              <option value="">Select Job Type *</option>
              {JOB_TYPES.map((jt) => (
                <option key={jt.value} value={jt.value}>
                  {jt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Salary Min"
              value={salaryMin}
              onChange={(e) => setSalaryMin(e.target.value)}
              className="border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none placeholder-gray-400 transition-all w-1/2"
            />
            <input
              type="number"
              placeholder="Salary Max"
              value={salaryMax}
              onChange={(e) => setSalaryMax(e.target.value)}
              className="border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none placeholder-gray-400 transition-all w-1/2"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-semibold transition shadow-md"
          >
            {loading ? "Creating..." : "Create Job"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateJobModal;
