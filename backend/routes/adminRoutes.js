// routes/admin/userRoutes.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const { admin } = require("../middlewares/adminMiddleware");
const adminController = require("../controllers/adminControlers");
const Job = require("../models/Job"); // ✅ import Job model
const upload = require("../middlewares/uploadMiddleware");

const uploadAvatar = (req, res, next) => {
  upload.single("avatar")(req, res, (err) => upload.handleError(err, req, res, next));
};

// -------------------- Admin User Routes --------------------
router.get("/dashboard", protect, admin, adminController.getDashboardData);
router.get("/users", protect, admin, adminController.getAllUsers);

router.post("/users", protect, admin, uploadAvatar, adminController.createUser);
router.put("/users/:id", protect, admin, uploadAvatar, adminController.updateUser);

router.delete("/users/:id", protect, admin, adminController.deleteUser);

// -------------------- Admin Job Routes --------------------

// Get all jobs
router.get("/jobs", protect, admin, async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 }).populate("company", "name email");
    res.json(jobs);
  } catch (err) {
    console.error("Error fetching jobs:", err);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

// Create a job
router.post("/jobs", protect, admin, adminController.createJob);
// Update a job
router.put("/jobs/:id", protect, admin, adminController.updateJob);
//changisn the is closed of the job
router.put("/jobs/:id/toggle", protect, admin, adminController.toggleJobStatus);
// Delete a job
router.delete("/jobs/:id", protect, admin, adminController.deleteJob);


// Admin Application Routes
router.get("/applications", protect, admin, adminController.getAllApplications);
router.get("/applications/:id", protect, admin, adminController.getApplicationById);
router.get("/applications/job/:jobId", protect, admin, adminController.getApplicantsForJob);
router.put("/applications/:id/status", protect, admin, adminController.updateApplicationStatus);
router.delete("/applications/:id", protect, admin, adminController.deleteApplication);



module.exports = router;
