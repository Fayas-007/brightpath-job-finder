require("dotenv").config();
const express = require("express");
const cors = require("cors");
const {
  authRateLimiter,
  corsOptions,
  limitWriteRequests,
  securityHeaders,
  uploadRateLimiter,
} = require("./middlewares/securityMiddleware");
const {
  streamUploadedFile,
  uploadDir,
  usesGridFsUploads,
} = require("./utils/uploadPath");

const connectDB = require("./config/db");
const User = require("./models/User");
const Application = require("./models/Application");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const jobRoutes = require("./routes/jobRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const savedJobsRoutes = require("./routes/savedJobsRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const adminRoutes = require("./routes/adminRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();

app.set("trust proxy", 1);

app.use(securityHeaders);
app.use(cors(corsOptions));
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: false, limit: "100kb" }));
app.use("/api/auth/login", authRateLimiter);
app.use("/api/auth/register", authRateLimiter);
app.use("/api/auth/forgot-password", authRateLimiter);
app.use("/api/auth/reset-password", authRateLimiter);
app.use("/api/auth/upload-image", uploadRateLimiter);
app.use("/api/upload", uploadRateLimiter);
app.use("/api/user/profile", uploadRateLimiter);
app.use("/api", limitWriteRequests);

const ensureDatabase = async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("MongoDB request failed:", err.message);
    res.status(503).json({
      message: "Database connection unavailable. Check the backend MONGO_URI environment variable.",
    });
  }
};

app.use("/api", ensureDatabase);

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/save-jobs", savedJobsRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/notifications", notificationRoutes);

const isPrivateResume = async (filename) => {
  const resumeUrl = `/uploads/${filename}`;

  const [userResumeExists, applicationResumeExists] = await Promise.all([
    User.exists({ resume: resumeUrl }),
    Application.exists({ resume: resumeUrl }),
  ]);

  return Boolean(userResumeExists || applicationResumeExists);
};

if (usesGridFsUploads) {
  app.get("/uploads/:filename", ensureDatabase, async (req, res) => {
    try {
      const filename = req.params.filename;

      // Never expose files currently referenced as resumes publicly.
      if (await isPrivateResume(filename)) {
        return res.status(403).json({
          message: "This file requires authorized access.",
        });
      }

      const fileSent = await streamUploadedFile(filename, res);

      if (!fileSent && !res.headersSent) {
        return res.status(404).json({ message: "File not found" });
      }
    } catch (err) {
      console.error("Uploaded file stream failed:", err.message);

      if (!res.headersSent) {
        return res.status(500).json({
          message: "File could not be loaded",
        });
      }
    }
  });
} else {
  app.get("/uploads/:filename", ensureDatabase, async (req, res) => {
    try {
      const filename = req.params.filename;

      // Never expose files currently referenced as resumes publicly.
      if (await isPrivateResume(filename)) {
        return res.status(403).json({
          message: "This file requires authorized access.",
        });
      }

      const path = require("path");
      const filePath = path.resolve(uploadDir, filename);
      const relativePath = path.relative(uploadDir, filePath);

      // Prevent path traversal outside the uploads directory.
      if (
        !relativePath ||
        relativePath.startsWith("..") ||
        path.isAbsolute(relativePath)
      ) {
        return res.status(400).json({ message: "Invalid filename" });
      }

      res.setHeader(
        "Cache-Control",
        "public, max-age=31536000, s-maxage=31536000, immutable"
      );

      res.sendFile(filePath, (err) => {
        if (err && !res.headersSent) {
          res.status(err.statusCode === 404 ? 404 : 500).json({
            message: err.statusCode === 404
              ? "File not found"
              : "File could not be loaded",
          });
        }
      });
    } catch (err) {
      console.error("Uploaded file request failed:", err.message);

      if (!res.headersSent) {
        res.status(500).json({ message: "File could not be loaded" });
      }
    }
  });
}

app.get("/", (req, res) => {
  res.send("Server is running...");
});

const PORT = process.env.PORT || 5000;

// Vercel imports the Express app as a serverless function, while local and normal Node hosts run app.listen.
if (process.env.NODE_ENV !== "test" && !process.env.VERCEL) {
  connectDB()
    .then(() => {
      app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((err) => {
      console.error("MongoDB startup failed:", err.message);
    });
}

module.exports = app;
