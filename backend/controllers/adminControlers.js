const User = require("../models/User");
const Job = require("../models/Job");
const Application = require("../models/Application");
const Notification = require("../models/Notification");
const bcrypt = require("bcryptjs");
const { getPublicUploadUrl } = require("../utils/uploadPath");
const {
  deleteJobsAndRelatedData,
  deleteUserRelatedData,
} = require("../utils/cleanupRelatedData");

const createNotification = async (data) => {
  try {
    await Notification.create(data);
  } catch (err) {
    console.error("Notification create failed:", err.message);
  }
};

// 🧭 Admin Dashboard data
exports.getDashboardData = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password -resetPasswordToken -resetPasswordExpires")
      .sort({ createdAt: -1 });
    const jobs = await Job.find().sort({ createdAt: -1 });
    const applications = await Application.find();

    res.json({ users, jobs, applications });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, "-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};



// Get all jobs (with company name)
exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate("company", "name email companyName avatar")
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (error) {
    console.error("Error fetching jobs:", error.message);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};



// Create a new user
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, companyName, companyDescription } = req.body;

    if (!password) return res.status(400).json({ message: "Password is required" });

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) return res.status(400).json({ message: "Email already exists" });

    // Create full URL for employer profile image if uploaded
    let avatarUrl;
    if (role === "employer" && req.file) {
      avatarUrl = getPublicUploadUrl(req.file);
    }

    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password,
      role,
      companyName: role === "employer" ? companyName : undefined,
      companyDescription: role === "employer" ? companyDescription : undefined,
      avatar: role === "employer" ? avatarUrl : undefined,
    });

    await newUser.save();

    const userToReturn = newUser.toObject();
    delete userToReturn.password;

    res.status(201).json({ message: "User created successfully", user: userToReturn });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create user" });
  }
};


// Delete user
// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Prevent deleting last admin
    if (user.role === "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });
      if (adminCount <= 1) {
        return res.status(400).json({ message: "Cannot delete the last admin" });
      }
    }

    await deleteUserRelatedData(user);

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete user" });
  }
};



// Update user
exports.updateUser = async (req, res) => {
  try {
    const { name, email, password, role, companyName, companyDescription } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Update basic fields
    if (name) user.name = name;
    if (email) user.email = email.toLowerCase();
    if (role) user.role = role;
    if (password) user.password = password; // pre-save hook hashes

    // Update employer-specific fields if role is employer
    if (role === "employer") {
      user.companyName = companyName || user.companyName;
      user.companyDescription = companyDescription || user.companyDescription;

      // Update logo if a new file is uploaded
      if (req.file) {
        user.avatar = getPublicUploadUrl(req.file);
      }
    } else {
      // Clear employer fields if changing to non-employer
      user.companyName = undefined;
      user.companyDescription = undefined;
    }

    await user.save();

    const userToReturn = user.toObject();
    delete userToReturn.password;

    res.json({ message: "User updated successfully", user: userToReturn });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update user" });
  }
};


// Create a new job
exports.createJob = async (req, res) => {
  try {
    const {
      title,
      description,
      requirements,
      location,
      type,
      category,
      salaryMin,
      salaryMax,
      companyId, // <- add this
    } = req.body;

    if (!title || !description || !requirements || !companyId) {
      return res.status(400).json({ message: "Please fill all required fields including company" });
    }

    // Verify company exists and is an employer
    const company = await User.findById(companyId);
    if (!company || company.role !== "employer") {
      return res.status(400).json({ message: "Invalid employer selected" });
    }

    const newJob = new Job({
      title,
      description,
      requirements,
      location,
      type,
      category,
      salaryMin,
      salaryMax,
      company: company._id, // link to employer
    });

    await newJob.save();
    await newJob.populate("company", "name email avatar");

    res.status(201).json(newJob);
  } catch (err) {
    console.error("Error creating job:", err);
    res.status(500).json({ message: "Failed to create job" });
  }
};
// Update a job
exports.updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      requirements,
      location,
      type,
      category,
      salaryMin,
      salaryMax,
      companyId,
    } = req.body;

    const job = await Job.findById(id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    // Update fields if provided
    if (title) job.title = title;
    if (description) job.description = description;
    if (requirements) job.requirements = requirements;
    if (location !== undefined) job.location = location;
    if (type) job.type = type;
    if (category) job.category = category;
    if (salaryMin !== undefined) job.salaryMin = salaryMin;
    if (salaryMax !== undefined) job.salaryMax = salaryMax;

    // If companyId is provided, validate employer
    if (companyId) {
      const company = await User.findById(companyId);
      if (!company || company.role !== "employer") {
        return res.status(400).json({ message: "Invalid employer selected" });
      }
      job.company = company._id;
    }

    await job.save();
    await job.populate("company", "name email avatar");

    res.json({ message: "Job updated successfully", job });
  } catch (err) {
    console.error("Error updating job:", err);
    res.status(500).json({ message: "Failed to update job" });
  }
};
// Toggle job status (close/open) for admin
exports.toggleJobStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await Job.findById(id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    job.isClosed = !job.isClosed; // flip status
    await job.save();
    await job.populate("company", "name email avatar");

    res.json({ message: `Job ${job.isClosed ? "closed" : "activated"} successfully`, job });
  } catch (err) {
    console.error("Error toggling job status:", err);
    res.status(500).json({ message: "Failed to toggle job status" });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    const cleanup = await deleteJobsAndRelatedData({ _id: job._id });
    res.json({ message: "Job deleted successfully", cleanup });
  } catch (err) {
    console.error("Error deleting job:", err);
    res.status(500).json({ message: "Failed to delete job" });
  }
};


// -------------------- Admin Application Routes --------------------

// Get all applications
exports.getAllApplications = async (req, res) => {
  try {
    const applications = await Application.find()
      .populate("job", "title company")
      .populate("applicant", "name email")
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (err) {
    console.error("Error fetching applications:", err);
    res.status(500).json({ message: "Failed to fetch applications" });
  }
};

exports.getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;
    const application = await Application.findById(id)
      .populate("job", "title company")
      .populate("applicant", "name email");

    if (!application) return res.status(404).json({ message: "Application not found" });

    res.json(application);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch application" });
  }
};


// Get applications for a specific job
exports.getApplicantsForJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const applications = await Application.find({ job: jobId })
      .populate("applicant", "name email")
      .populate("job", "title");

    res.json(applications);
  } catch (err) {
    console.error("Error fetching applicants:", err);
    res.status(500).json({ message: "Failed to fetch applicants" });
  }
};

// Update application status (admin)
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["Applied", "In Review", "Rejected", "Accepted"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const application = await Application.findById(id)
      .populate("job", "title")
      .populate("applicant", "_id");
    if (!application) return res.status(404).json({ message: "Application not found" });

    const previousStatus = application.status;
    application.status = status;
    await application.save({ validateModifiedOnly: true });

    if (previousStatus !== status) {
      await createNotification({
        recipient: application.applicant._id,
        actor: req.user._id,
        application: application._id,
        job: application.job?._id,
        type: "application_status_updated",
        title: "Application status updated",
        message: `Your application for ${application.job?.title || "a job"} is now ${status}.`,
        link: "/applied-jobs",
      });
    }

    res.json({ message: "Status updated successfully", application });
  } catch (err) {
    console.error("Error updating application:", err);
    res.status(500).json({ message: "Failed to update status" });
  }
};

// Delete an application
exports.deleteApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ message: "Application not found" });

    await Application.findByIdAndDelete(req.params.id);
    res.json({ message: "Application deleted successfully" });
  } catch (err) {
    console.error("Error deleting application:", err);
    res.status(500).json({ message: "Failed to delete application" });
  }
};
