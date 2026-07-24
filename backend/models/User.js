const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const educationSchema = new mongoose.Schema({
  degree: { type: String, required: true },
  institution: { type: String, required: true },
  startYear: Number,
  endYear: Number,
  description: String,
});

const experienceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  startDate: Date,
  endDate: Date,
  description: String,
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["jobseeker", "employer", "admin"], required: true },
    avatar: String,
    resume: String,
    resumeName: String,

    // Only employer-specific fields
    companyName: String,
    companyDescription: String,

    // Only jobseeker-specific fields
    education: { type: [educationSchema], required: function() { return this.role === "jobseeker"; } },
    experience: { type: [experienceSchema], required: function() { return this.role === "jobseeker"; } },

    // Forgot password fields
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  { timestamps: true }
);

// Encrypt password before save
userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Match entered password
userSchema.methods.matchPassword = function(enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
