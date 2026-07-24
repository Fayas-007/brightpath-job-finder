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

    const {
    keyword,
    location,
    category,
    type,
    minSalary,
    maxSalary,
  } = req.query;

  const query = {
    isClosed: false,
    ...(keyword && { title: { $regex: keyword, $options: "i" } }),
    ...(location && { location: { $regex: location, $options: "i" } }),
    ...(category && { category }),
    ...(type && { type }),
  };

  if (minSalary || maxSalary) {
    query.$and = [];

    if (minSalary) {
      query.$and.push({ salaryMax: { $gte: Number(minSalary) } });
    }

    if (maxSalary) {
      query.$and.push({ salaryMin: { $lte: Number(maxSalary) } });
    }

    if (query.$and.length === 0) {
      delete query.$and;
    }
  }

  try {
    const jobs = await Job.find(query).populate(
      "company",
      "name companyName avatar"
    );

    let savedJobIds = [];
    let appliedJobStatusMap = {};

    const viewerId = req.user?.role === "jobseeker" ? req.user._id : null;

    if (viewerId) {
      // Saved Jobs
      const savedJobs = await SavedJob.find({ jobseeker: viewerId }).select("job");
      savedJobIds = savedJobs.map((s) => String(s.job));

      // Applications
      const applications = await Application.find({ applicant: viewerId }).select("job status");
      applications.forEach((app) => {
        appliedJobStatusMap[String(app.job)] = app.status;
      });
    }

    // Add isSaved and applicationStatus to each job
    const jobsWithExtras = jobs.map((job) => {
      const jobIdStr = String(job._id);
      return {
        ...job.toObject(),
        isSaved: savedJobIds.includes(jobIdStr),
        applicationStatus: appliedJobStatusMap[jobIdStr] || null,
      };
    });

    res.json(jobsWithExtras);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get jobs for logged in user (Employer can see posted jobs)
exports.getJobsEmployer = async (req, res) => {
  try {
    const userId = req.user._id;
    const { role } = req.user;

    if (role !== "employer") {
      return res.status(403).json({ message: "Access denied" });
    }

    // Get all jobs posted by employer
    const jobs = await Job.find({ company: userId })
      .populate("company", "name companyName avatar")
      .lean(); // .lean() makes jobs plain JS objects so we can add new fields

    // Count applications for each job
    const jobsWithApplicationCounts = await Promise.all(
      jobs.map(async (job) => {
        const applicationCount = await Application.countDocuments({
          job: job._id,
        });
        return {
          ...job,
          applicationCount,
        };
      })
    );

    res.json(jobsWithApplicationCounts);
  } catch (err) {
    res.status(500).json({ message: err.message });
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
