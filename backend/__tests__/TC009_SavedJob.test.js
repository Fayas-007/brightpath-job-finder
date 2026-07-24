require("dotenv").config({ path: ".env.test" });
const request = require("supertest");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const app = require("../server");
const User = require("../models/User");
const Job = require("../models/Job");
const SavedJob = require("../models/SavedJob");

let jobSeeker, employer, job, token;

beforeAll(async () => {
  // Connect to test DB
  await mongoose.connect(process.env.MONGO_URI_TEST, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // 💼 Create an employer
  employer = await User.create({
    name: "Test Employer",
    email: "employer@example.com",
    password: "123456",
    role: "employer",
    companyName: "ABC Tech",
    companyDescription: "A tech company",
  });

  // 🧑 Create a jobseeker
  jobSeeker = await User.create({
    name: "Test Seeker",
    email: "seeker@example.com",
    password: "123456",
    role: "jobseeker",
    education: [
      { degree: "BSc IT", institution: "University", startYear: 2020, endYear: 2024 }
    ],
    experience: [
      { title: "Intern", company: "XYZ", startDate: new Date(), endDate: new Date() }
    ],
  });

  // Generate JWT manually (for jobseeker)
  token = jwt.sign({ id: jobSeeker._id, role: "jobseeker" }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  //  Create a test job by employer
  job = await Job.create({
    title: "Frontend Developer",
    description: "React developer role",
    requirements: "React, JS, CSS",
    location: "Colombo",
    category: "IT",
    type: "Full-Time",
    company: employer._id,
  });
});

afterAll(async () => {
  await User.deleteMany({});
  await Job.deleteMany({});
  await SavedJob.deleteMany({});
  await mongoose.connection.close();
});

describe("TC009 - Save Job (Bookmark) Test", () => {
  test("should successfully save a job when jobseeker clicks bookmark", async () => {
    const res = await request(app)
      .post(`/api/save-jobs/${job._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("job", job._id.toString());
    expect(res.body).toHaveProperty("jobseeker", jobSeeker._id.toString());
  });
});
