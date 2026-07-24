const fs = require("fs");
const path = require("path");
const User = require("../models/User");
const Application = require("../models/Application");

const uploadDir = path.resolve(__dirname, "../uploads");

const deleteUploadedFile = (fileUrl) => {
  if (!fileUrl) return;

  const fileName = path.basename(fileUrl);
  const filePath = path.resolve(uploadDir, fileName);

  if (!filePath.startsWith(uploadDir)) return;
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
};

const isTemporaryBrowserUrl = (url) =>
  typeof url === "string" && url.startsWith("blob:");

// @desc Update user profile (name, avatar, company, education, experience)
exports.updateProfile = async (req, res) => {
  try {
    const {
      name,
      avatar,
      companyName,
      companyDescription,
      education,
      experience,
    } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (isTemporaryBrowserUrl(avatar)) {
      return res.status(400).json({
        message: "Please wait for image upload to finish before saving profile",
      });
    }

    // Update basic info
    user.name = name || user.name;
    if (avatar && typeof avatar === "string") user.avatar = avatar;

    // Update avatar if uploaded
    if (req.files?.avatar?.length) {
      if (user.avatar) {
        deleteUploadedFile(user.avatar);
      }
      user.avatar = `/uploads/${req.files.avatar[0].filename}`;
    }

    // Update resume if uploaded
    if (req.files?.resume?.length) {
      if (user.resume) {
        const resumeInUse = await Application.exists({
          applicant: user._id,
          resume: user.resume,
        });

        if (!resumeInUse) deleteUploadedFile(user.resume);
      }
      user.resume = `/uploads/${req.files.resume[0].filename}`;
      user.resumeName = req.files.resume[0].originalname;
    }

    // Employer fields
    if (user.role === "employer") {
      user.companyName = companyName || user.companyName;
      user.companyDescription = companyDescription || user.companyDescription;
    }

    // Jobseeker fields
    if (user.role === "jobseeker") {
      if (education) user.education = JSON.parse(education);
      if (experience) user.experience = JSON.parse(experience);
    }

    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar || "",
      resume: user.resume || "",
      resumeName: user.resumeName || "",
      role: user.role,
      companyName: user.companyName || "",
      companyDescription: user.companyDescription || "",
      education: user.education || [],
      experience: user.experience || [],
    });
  } catch (err) {
    console.error("updateProfile error:", err);
    res.status(500).json({ message: err.message });
  }
};

// @desc Delete resume
exports.deleteResume = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role !== "jobseeker")
      return res.status(403).json({ message: "Only jobseekers can delete resume" });

    if (!user.resume) {
      return res.status(400).json({ message: "No resume found on this profile" });
    }

    const currentResume = user.resume;
    const resumeInUse = await Application.exists({
      applicant: user._id,
      resume: currentResume,
    });

    if (!resumeInUse) {
      deleteUploadedFile(currentResume);
    }

    user.resume = "";
    user.resumeName = "";
    await user.save();

    res.json({ message: "Resume deleted successfully" });
  } catch (err) {
    console.error("deleteResume error:", err);
    res.status(500).json({ message: err.message });
  }
};

// @desc Get public profile
exports.getPublicProfile = async (req, res) => {
  try {
    const isSelf = req.user._id.toString() === req.params.id;
    const isAdmin = req.user.role === "admin";
    const privateFields = "-password -resetPasswordToken -resetPasswordExpires";
    const publicFields = "name avatar role companyName companyDescription";

    const user = await User.findById(req.params.id).select(
      isSelf || isAdmin ? privateFields : publicFields
    );

    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("getPublicProfile error:", err);
    res.status(500).json({ message: err.message });
  }
};
