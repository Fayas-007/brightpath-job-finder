const express = require("express");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/User"); // Make sure this points to your User model
const { 
  register, 
  login, 
  getMe, 
  forgotPassword, 
  resetPassword 
} = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");
const { getPublicUploadUrl } = require("../utils/uploadPath");

const router = express.Router();

// -------------------- AUTH ROUTES --------------------
router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);

const uploadImage = (req, res, next) => {
  upload.single("image")(req, res, (err) => upload.handleError(err, req, res, next));
};

// -------------------- IMAGE UPLOAD --------------------
router.post("/upload-image", uploadImage, (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  res.status(200).json({ imageUrl: getPublicUploadUrl(req.file) });
});

// Forgot password & reset password routes
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);




module.exports = router;
