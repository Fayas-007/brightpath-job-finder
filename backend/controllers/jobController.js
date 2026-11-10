const Job = require("../models/Job");
const User = require("../models/User");
const Application = require("../models/Application");
const SavedJob = require("../models/SavedJob");
const { deleteJobsAndRelatedData } = require("../utils/cleanupRelatedData");

const isValidAssetUrl = (url) =>
  typeof url === "string" && Boolean(url.trim()) && !url.startsWith("blob:");

const isEmployerProfileComplete = (user) =>
  Boolean(
    user?.companyName?.trim() &&
      user?.companyDescription?.trim() &&
      isValidAssetUrl(user?.avatar)
  );

const normalizeJobPayload = (body) => ({
  title: body.title?.trim(),
  location: body.location?.trim(),
  category: body.category,
  type: body.type,
  description: body.description?.trim(),
  requirements: body.requirements?.trim(),
  salaryMin: body.salaryMin === "" || body.salaryMin === undefined ? undefined : Number(body.salaryMin),
  salaryMax: body.salaryMax === "" || body.salaryMax === undefined ? undefined : Number(body.salaryMax),
});

const validateJobPayload = (payload) => {
  if (!payload.title) return "Job title is required";
  if (!payload.location) return "Location is required";
  if (!payload.category) return "Category is required";
  if (!payload.type) return "Job type is required";
  if (!payload.description) return "Job description is required";
  if (!payload.requirements) return "Job requirements are required";

  const hasMinSalary = payload.salaryMin !== undefined;
  const hasMaxSalary = payload.salaryMax !== undefined;

  if (hasMinSalary !== hasMaxSalary) {
    return "Enter both minimum and maximum salary, or leave both blank";
  }

  if (hasMinSalary && (!Number.isFinite(payload.salaryMin) || !Number.isFinite(payload.salaryMax))) {
    return "Salary must be a valid number";
  }

  if (hasMinSalary && payload.salaryMin >= payload.salaryMax) {
    return "Maximum salary must be greater than minimum salary";
  }

  return "";
};

// @desc    Create a new job (Employer only)
exports.createJob = async (req, res) => {
  try {
    if (req.user.role !== "employer") {
      return res.status(403).json({ message: "Only employers can post jobs" });
    }

    if (!isEmployerProfileComplete(req.user)) {
      return res.status(400).json({
        message: "Complete your company profile before posting a job",
      });
    }

    const payload = normalizeJobPayload(req.body);
    const validationError = validateJobPayload(payload);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const job = await Job.create({ ...payload, company: req.user._id });
    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getJobs = async (req, res) => {
  try {
    const {
      keyword,
      location,
      category,
      type,
      minSalary,
      maxSalary,
    } = req.query;

    // Pagination
    const parsedPage = Number.parseInt(req.query.page, 10);
    const parsedLimit = Number.parseInt(req.query.limit, 10);

    const page = Number.isInteger(parsedPage) && parsedPage > 0
      ? parsedPage
      : 1;

    const limit = Number.isInteger(parsedLimit) && parsedLimit > 0
      ? Math.min(parsedLimit, 50)
      : 12;

    const skip = (page - 1) * limit;

    // Build filters
    const query = {
      isClosed: false,
    };

    if (keyword?.trim()) {
  const escaped = keyword.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = { $regex: escaped, $options: "i" };

  query.$or = [
    { title: regex },
    { description: regex },
    { requirements: regex },
    { category: regex },
  ];
}
    if (location?.trim()) {
      query.location = {
        $regex: location.trim(),
        $options: "i",
      };
    }

    if (category) query.category = category;
    if (type) query.type = type;

    // Salary range overlap
    const salaryConditions = [];

    if (minSalary !== undefined && minSalary !== "") {
      const min = Number(minSalary);

      if (!Number.isFinite(min)) {
        return res.status(400).json({
          message: "Invalid minimum salary",
        });
      }

      salaryConditions.push({
        salaryMax: { $gte: min },
      });
    }

    if (maxSalary !== undefined && maxSalary !== "") {
      const max = Number(maxSalary);

      if (!Number.isFinite(max)) {
        return res.status(400).json({
          message: "Invalid maximum salary",
        });
      }

      salaryConditions.push({
        salaryMin: { $lte: max },
      });
    }

    if (salaryConditions.length > 0) {
      query.$and = salaryConditions;
    }

    // Fetch only the requested page and count all matching jobs.
    const [jobs, total] = await Promise.all([
      Job.find(query)
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(limit)
        .populate("company", "name companyName avatar")
        .lean(),

      Job.countDocuments(query),
    ]);

    const viewerId =
      req.user?.role === "jobseeker" ? req.user._id : null;

    let savedJobIds = new Set();
    let appliedJobStatusMap = new Map();

    if (viewerId) {
      const [savedJobs, applications] = await Promise.all([
        SavedJob.find({ jobseeker: viewerId })
          .select("job")
          .lean(),

        Application.find({
          applicant: viewerId,
          job: { $in: jobs.map((job) => job._id) },
        })
          .select("job status")
          .lean(),
      ]);

      savedJobIds = new Set(
        savedJobs.map((savedJob) => String(savedJob.job))
      );

      appliedJobStatusMap = new Map(
        applications.map((application) => [
          String(application.job),
          application.status,
        ])
      );
    }

    const jobsWithExtras = jobs.map((job) => {
      const jobId = String(job._id);

      return {
        ...job,
        isSaved: savedJobIds.has(jobId),
        applicationStatus: appliedJobStatusMap.get(jobId) || null,
      };
    });

    return res.json({
      jobs: jobsWithExtras,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
      },
    });
  } catch (err) {
    console.error("Error fetching jobs:", err);

    return res.status(500).json({
      message: "Failed to fetch jobs",
    });
  }
};

// @desc    Get jobs for logged in user (Employer can see posted jobs)
// @desc    Get jobs for logged-in employer with application counts
exports.getJobsEmployer = async (req, res) => {
  try {
    const userId = req.user._id;

    if (req.user.role !== "employer") {
      return res.status(403).json({ message: "Access denied" });
    }

    const jobs = await Job.aggregate([
      {
        $match: { company: userId },
      },
      {
        $lookup: {
          from: Application.collection.name,
          localField: "_id",
          foreignField: "job",
          as: "applications",
        },
      },
      {
        $addFields: {
          applicationCount: { $size: "$applications" },
        },
      },
      {
        $project: {
          applications: 0,
        },
      },
      {
        $sort: { createdAt: -1, _id: -1 },
      },
    ]);

    res.json(jobs);
  } catch (err) {
    console.error("Error fetching employer jobs:", err);

    res.status(500).json({
      message: "Failed to fetch employer jobs",
    });
  }
};


// @desc    Get single job by ID
exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate(
      "company",
      "name companyName avatar"
    );

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    let applicationStatus = null;
    const viewerId = req.user?.role === "jobseeker" ? req.user._id : null;

    if (viewerId) {
      const application = await Application.findOne({
        job: job._id,
        applicant: viewerId,
      }).select("status");

      if (application) {
        applicationStatus = application.status;
      }
    }

    res.json({
      ...job.toObject(),
      applicationStatus,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// @desc    Update a job (Employer only)
exports.updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    if (job.company.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this job" });
    }

    const payload = normalizeJobPayload(req.body);
    const validationError = validateJobPayload(payload);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    Object.assign(job, payload);
    const updated = await job.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Delete a job (Employer only)
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    if (job.company.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this job" });
    }

    const cleanup = await deleteJobsAndRelatedData({ _id: job._id });
    res.json({ message: "Job deleted successfully", cleanup });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Toggle Close Status for a job (Employer only)
exports.toggleCloseJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    if (job.company.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to close this job" });
    }

    job.isClosed = !job.isClosed;
    await job.save();

    res.json({ message: "Job marked as closed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
