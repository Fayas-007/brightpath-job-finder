const User = require("../models/User");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const { validatePassword } = require("../utils/passwordPolicy");
const { buildResetEmail } = require("../utils/emailTemplates");

// Generate token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "60d" });
};

// @desc Register new user
exports.register = async (req, res) => {
  try {
    let { name, email, password, avatar, role } = req.body;

    name = name?.trim();
    email = email?.trim().toLowerCase();
    role = role?.trim().toLowerCase();

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Name, email, password, and role are required" });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }

    // Choose the role
    if (!["jobseeker", "employer"].includes(role)) {
      return res.status(400).json({ message: "Please choose Job Seeker or Employer" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const user = await User.create({
      name,
      email,
      password,
      role,
      avatar: avatar?.startsWith("blob:") ? "" : avatar || "",
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      token: generateToken(user._id),
      companyName: user.companyName || "",
      companyDescription: user.companyDescription || "",
      resume: user.resume || "",
      resumeName: user.resumeName || "",
    });
  } catch (err) {
    const statusCode = err.name === "ValidationError" ? 400 : 500;
    res.status(statusCode).json({ message: err.message });
  }
};

// @desc Login user
exports.login = async (req, res) => {
  let { email, password } = req.body;

  try {
    email = email?.trim().toLowerCase(); // make login case-insensitive

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        companyName: user.companyName,
        companyDescription: user.companyDescription,
        resume: user.resume || "",
        resumeName: user.resumeName || "",
        education: user.education || [],
        experience: user.experience || [],
      },
    });
  } catch (err) {
    console.error("login error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc Get logged-in user
exports.getMe = async (req, res) => {
  res.json(req.user);
};

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

// @desc Send password reset email
exports.forgotPassword = async (req, res) => {
  const email = req.body?.email?.trim().toLowerCase();

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  // Same response whether or not the account exists
  const genericResponse = {
    message: "If an account exists for that email, a reset link has been sent",
  };

  try {
    const user = await User.findOne({ email });
    if (!user) return res.json(genericResponse);

    const resetToken = crypto.randomBytes(32).toString("hex");

    // Store only the hash; the raw token goes in the email
    user.resetPasswordToken = hashToken(resetToken);
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save({ validateBeforeSave: false });

    const baseUrl = (process.env.FRONTEND_URL || "").replace(/\/+$/, "");
    const resetLink = `${baseUrl}/reset-password/${resetToken}`;
    const { html, text } = buildResetEmail({
      resetLink,
      name: user.name,
      email: user.email,
      expiresInMinutes: 60,
    });

    try {
      await sendEmail(user.email, "BrightPath Password Reset", html, text);
    } catch (mailError) {
      // Don't leave a usable token behind if the email never went out
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save({ validateBeforeSave: false });

      console.error("forgotPassword email error:", mailError.message);
      return res
        .status(500)
        .json({ message: "We couldn't send the email. Please try again later." });
    }

    res.json(genericResponse);
  } catch (err) {
    console.error("forgotPassword error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc Reset password
exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword, confirmPassword } = req.body;

  try {
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }

    // Confirm password is checked on the server too, not just in the browser
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const user = await User.findOne({
      resetPasswordToken: hashToken(token),
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Reject the password the user already has
    const isSamePassword = await user.matchPassword(newPassword);
    if (isSamePassword) {
      return res.status(400).json({
        message: "New password must be different from your current password",
      });
    }

    user.password = newPassword; // hashed in pre-save hook
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save({ validateBeforeSave: false });

    res.json({ message: "Password has been reset successfully" });
  } catch (err) {
    console.error("resetPassword error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};