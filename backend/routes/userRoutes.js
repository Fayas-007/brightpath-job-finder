const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const {
  updateProfile,
  deleteResume,
  getPublicProfile,
} = require("../controllers/userController");

const upload = require("../middlewares/uploadMiddleware");

const router = express.Router();

const uploadProfileFiles = (req, res, next) => {
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "resume", maxCount: 1 },
  ])(req, res, (err) => upload.handleError(err, req, res, next));
};

// Protected route: update profile (avatar + resume)
router.put(
  "/profile",
  protect,
  uploadProfileFiles,
  updateProfile
);

// Delete resume
router.post("/resume", protect, deleteResume);

// Profile details
router.get("/:id", protect, getPublicProfile);

module.exports = router;
