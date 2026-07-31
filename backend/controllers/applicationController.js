const Application = require("../models/Application");
const Job = require("../models/Job");
const Notification = require("../models/Notification");
const sendEmail = require("../utils/sendEmail");
const {
  deleteUploadedFile,
  getPublicUploadUrl,
  getUploadedFileName,
  streamUploadedFile,
} = require("../utils/uploadPath");

const VALID_STATUSES = ["Applied", "In Review", "Rejected", "Accepted"];

const deleteIncomingResume = async (req) => {
  if (req.file) await deleteUploadedFile(getPublicUploadUrl(req.file));
};

const createNotification = async (data) => {
  try {
    await Notification.create(data);
  } catch (err) {
    console.error("Notification create failed:", err.message);
  }
};

// @desc    Apply to a job
exports.applyToJob = async (req, res) => {
  try {
    // Only jobseekers can apply
    if (req.user.role !== "jobseeker") {
      await deleteIncomingResume(req);
      return res.status(403).json({ message: "Only job seekers can apply" });
    }

    const user = req.user;
    const uploadedResume = req.file ? getPublicUploadUrl(req.file) : "";
    const uploadedResumeName = req.file?.originalname || "";
    let resumeForApplication = uploadedResume || user.resume;
    const resumeNameForApplication = uploadedResumeName || user.resumeName || "";

    if (!resumeForApplication) {
      return res.status(400).json({ message: "Resume is required to apply for a job" });
    }

    // Prevent duplicate applications
    const existing = await Application.findOne({
      job: req.params.jobId,
      applicant: req.user._id,
    });

    if (existing) {
      await deleteIncomingResume(req);
      return res.status(400).json({ message: "Already applied to this job" });
    }

    // Find the job
    const job = await Job.findById(req.params.jobId).populate("company", "companyName name email");
    if (!job) {
      await deleteIncomingResume(req);
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.isClosed) {
      await deleteIncomingResume(req);
      return res.status(400).json({ message: "This job is closed and no longer accepts applications" });
    }

    const previousResume = user.resume;
    const previousResumeInUse = uploadedResume && previousResume
      ? await Application.exists({ applicant: user._id, resume: previousResume })
      : null;

    // Create the application
    const application = await Application.create({
      job: job._id,
      applicant: req.user._id,
      resume: resumeForApplication,
      resumeName: resumeNameForApplication,
    });

    await createNotification({
      recipient: req.user._id,
      actor: job.company?._id || job.company,
      application: application._id,
      job: job._id,
      type: "application_submitted",
      title: "Application submitted",
      message: `Your application for ${job.title} was submitted successfully.`,
      link: "/applied-jobs",
    });

    if (uploadedResume) {
      try {
        user.resume = uploadedResume;
        user.resumeName = uploadedResumeName;
        await user.save();
        if (previousResume && !previousResumeInUse) await deleteUploadedFile(previousResume);
      } catch (profileError) {
        console.error("Failed to save latest resume to profile:", {
          userId: req.user._id,
          resume: uploadedResume,
          error: profileError.message,
        });
      }
    }

    const salaryText =
      job.salaryMin && job.salaryMax
        ? `LKR ${Number(job.salaryMin).toLocaleString()} - ${Number(job.salaryMax).toLocaleString()}`
        : "Not specified";

    // Email HTML template
    const emailHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Application Confirmation</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        background-color: #f4f6f8;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        color: #333;
      }
      a { text-decoration: none; }
      .container {
        max-width: 650px;
        margin: 40px auto;
        background-color: #ffffff;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 8px 25px rgba(0,0,0,0.1);
      }
      .header {
        background: linear-gradient(90deg, #4f46e5, #6366f1);
        color: #fff;
        text-align: center;
        padding: 30px 20px;
        font-size: 28px;
        font-weight: 700;
        letter-spacing: 1px;
      }
      .content {
        padding: 30px 25px;
        line-height: 1.7;
      }
      h2 { font-size: 22px; margin-top: 0; color: #111827; }
      h3 { font-size: 18px; margin-bottom: 12px; color: #4f46e5; }
      p { font-size: 16px; margin: 12px 0; }
      ul {
        list-style: none;
        padding: 0;
        margin: 15px 0;
        border-left: 4px solid #4f46e5;
        padding-left: 15px;
      }
      li { margin-bottom: 8px; font-size: 15px; }
      
    .button {
        display: inline-block;
        background: linear-gradient(90deg, #6366f1, #4f46e5);
        color: #ffffff;         
        font-size: 16px;
        font-weight: 700;        
        padding: 18px 40px;
        border-radius: 50px;
        text-align: center;
        margin-top: 25px;
        box-shadow: 0 6px 15px rgba(99,102,241,0.3);
        transition: all 0.3s ease;
    }
    .button:hover {
        background: linear-gradient(90deg, #4f46e5, #6366f1);
        transform: translateY(-3px);
        box-shadow: 0 8px 20px rgba(99,102,241,0.4);
        color: #ffffff;          
    }
      .footer {
        text-align: center;
        font-size: 13px;
        color: #6b7280;
        padding: 20px;
        background-color: #f9fafb;
        border-top: 1px solid #e5e7eb;
      }

      @media screen and (max-width: 640px) {
        .container { margin: 20px; }
        .header { font-size: 24px; padding: 25px 15px; }
        h2 { font-size: 20px; }
        h3 { font-size: 16px; }
        .button { padding: 16px 30px; font-size: 15px; }
      }
    </style>
    </head>
    <body>
    <div class="container">
      <div class="header">BrightPath</div>
      <div class="content">
        <h2>Hello ${req.user.name},</h2>
        <p>Your application for <strong>"${job.title}"</strong> at <strong>${job.company.companyName || job.company.name}</strong> has been successfully submitted.</p>
        
        <h3>Application Details</h3>
        <ul>
          <li><strong>Job Title:</strong> ${job.title}</li>
          <li><strong>Category:</strong> ${job.category || "N/A"}</li>
          <li><strong>Type:</strong> ${job.type || "N/A"}</li>
          <li><strong>Location:</strong> ${job.location || "N/A"}</li>
          <li><strong>Salary:</strong> ${salaryText}</li>
        </ul>

        <p>The employer will review your application and contact you if shortlisted. Click the button below to view the job posting:</p>
        
       <a href="${process.env.FRONTEND_URL}/job/${job._id}" class="button">View Job Posting</a>

        <p style="margin-top:30px;">Thank you for using <strong>BrightPath</strong> to advance your career!</p>
      </div>
      <div class="footer">
        BrightPath &copy; ${new Date().getFullYear()} | Empowering Job Seekers
      </div>
    </div>
    </body>
    </html>
    `;


    // Send confirmation email as best effort. The application should stay successful
    // even if SMTP is unavailable or the email credentials need attention.
    try {
      await sendEmail(req.user.email, `Application Confirmation - ${job.title}`, emailHTML);
    } catch (emailError) {
      console.error("Application confirmation email failed:", {
        applicationId: application._id,
        userId: req.user._id,
        jobId: job._id,
        error: emailError.message,
      });
    }

    // Respond with success
    res.status(201).json({
      message: "Applied successfully!",
      application,
      user: { resume: user.resume || "", resumeName: user.resumeName || "" },
    });

  } catch (err) {
    await deleteIncomingResume(req);
    console.error("applyToJob error:", err);
    res.status(500).json({ message: err.message });
  }
};
// @desc    Get logged-in user's applications
exports.getMyApplications = async (req, res) => {
  try {
    const apps = await Application.find({ applicant: req.user._id })
      .populate({
        path: "job",
        populate: {
          path: "company",
          select: "companyName avatar",
        },
      })
      .sort({ createdAt: -1 });

    res.json(apps);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};


// @desc    Get all applicants for a job (Employer)
exports.getApplicantsForJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    
    if (!job || job.company.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to view applicants" });
    }
    
    const applications = await Application.find({ job: req.params.jobId })
      .populate("job", "title location category type")
      .populate("applicant", "name email avatar");

    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get application by ID (Jobseeker or Employer)
exports.getApplicationById = async (req, res) => {
  try {
    const app = await Application.findById(req.params.id)
      .populate("job", "title company")
      .populate("applicant", "name email avatar");

    if (!app) return res.status(404).json({ message: "Application not found.", id: req.params.id });

    const isOwner =
      app.applicant._id.toString() === req.user._id.toString() ||
      app.job.company.toString() === req.user._id.toString();

    if (!isOwner) {
      return res.status(403).json({ message: "Not authorized to view this application" });
    }

    res.json(app);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Download the resume submitted with an application
exports.downloadApplicationResume = async (req, res) => {
  try {
    const app = await Application.findById(req.params.id).populate("job", "company");

    if (!app) {
      return res.status(404).json({ message: "Application not found" });
    }

    const isApplicant = app.applicant.toString() === req.user._id.toString();
    const isEmployer = app.job?.company?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isApplicant && !isEmployer && !isAdmin) {
      return res.status(403).json({ message: "Not authorized to view this resume" });
    }

    if (!app.resume) {
      return res.status(404).json({ message: "Submitted resume unavailable" });
    }

    const fileName = getUploadedFileName(app.resume);
    const fileSent = await streamUploadedFile(app.resume, res, {
      downloadName: app.resumeName || fileName,
    });

    if (!fileSent) {
      return res.status(404).json({
        message: "The submitted resume file is no longer available",
      });
    }
  } catch (err) {
    console.error("downloadApplicationResume error:", err);
    res.status(500).json({ message: err.message });
  }
};

// @desc    Update application status (Employer)
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ message: "Invalid application status" });
    }

    const app = await Application.findById(req.params.id)
      .populate("job", "title company")
      .populate("applicant", "_id");

    if (!app || app.job.company.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this application" });
    }

    const previousStatus = app.status;
    app.status = status;
    await app.save({ validateModifiedOnly: true });

    if (previousStatus !== status) {
      await createNotification({
        recipient: app.applicant._id,
        actor: req.user._id,
        application: app._id,
        job: app.job._id,
        type: "application_status_updated",
        title: "Application status updated",
        message: `Your application for ${app.job.title} is now ${status}.`,
        link: "/applied-jobs",
      });
    }

    res.json({ message: "Application status updated", status });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
