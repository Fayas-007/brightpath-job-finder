const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    requirements: { type: String, required: true },
    location: { type: String },
    category: { type: String },
    type: {
      type: String,
      enum: ["Remote", "Full-Time", "Part-Time", "Internship", "Contract"],
      required: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    salaryMin: { type: Number },
    salaryMax: { type: Number },
    isClosed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Optimize retrieving open jobs in newest-first order.
jobSchema.index({ isClosed: 1, createdAt: -1, _id: -1 });

// Optimize finding jobs belonging to an employer.
jobSchema.index({ company: 1, createdAt: -1 });

// Optimize filtering by category and job type.
jobSchema.index({ isClosed: 1, category: 1, type: 1, createdAt: -1 });

module.exports = mongoose.model("Job", jobSchema);
