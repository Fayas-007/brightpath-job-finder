const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    applicant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    resume: { type: String, required: true },
    resumeName: String,
    status: {
      type: String,
      enum: ["Applied", "In Review", "Rejected", "Accepted"],
      default: "Applied",
    },
  },
  { timestamps: true }
);
applicationSchema.index({ job: 1 });
// Find a jobseeker's applications, newest first.
applicationSchema.index({ applicant: 1, createdAt: -1 });

// Find a specific jobseeker's application for a job.
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });
module.exports = mongoose.model("Application", applicationSchema);
