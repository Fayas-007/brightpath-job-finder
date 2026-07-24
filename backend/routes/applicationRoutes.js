const express = require("express");
const {
  applyToJob,
  getMyApplications,
  getApplicantsForJob,
  getApplicationById,
  downloadApplicationResume,
  updateStatus,
} = require("../controllers/applicationController");
const { protect } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

const router = express.Router();

const uploadResume = (req, res, next) => {
  upload.single("resume")(req, res, (err) => upload.handleError(err, req, res, next));
};

router.post("/:jobId", protect, uploadResume, applyToJob);
router.get("/my", protect, getMyApplications);
router.get("/job/:jobId", protect, getApplicantsForJob);
router.get("/:id/resume", protect, downloadApplicationResume);
router.get("/:id", protect, getApplicationById);
router.put("/:id/status", protect, updateStatus);

module.exports = router;
