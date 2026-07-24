require("dotenv").config({ path: ".env.test" });
const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../server");
const User = require("../models/User");
const Job = require("../models/Job");
const Application = require("../models/Application");

let jobSeekerToken;
let jobId;

beforeAll(async () => {
  // Connect to test DB
  await mongoose.connect(process.env.MONGO_URI_TEST, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // Clear previous data
  await User.deleteMany();
  await Job.deleteMany();
  await Application.deleteMany();

  // Create employer with required fields
  const employer = await User.create({
    name: "Test Employer",
    email: "employer@test.com",
    password: "Password123!",
    role: "employer",
    avatar: "http://localhost:8000/uploads/test-profile.png",
    companyName: "Employer Co",
    companyDescription: "This is a test employer",
  });

  // Create a job
  const job = await Job.create({
    title: "Backend Developer",
    location: "Colombo",
    category: "IT",
    type: "Full-Time",
    description: "Develop backend systems",
    requirements: "Node.js, MongoDB",
    salaryMin: 40000,
    salaryMax: 80000,
    company: employer._id,
  });
  jobId = job._id;

  // Create job seeker WITH resume
  const jobSeeker = await User.create({
    name: "Test JobSeeker",
    email: "fayasshibly7777@gmail.com",
    password: "Password123!",
    role: "jobseeker",
    resume: "/uploads/test-resume.pdf",
  });

  // Login job seeker
  const res = await request(app)
    .post("/api/auth/login")
    .send({ email: "fayasshibly7777@gmail.com", password: "Password123!" });

  jobSeekerToken = res.body.token;
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("TC008: Apply for a Job (With Resume Only)", () => {
  it("Applied successfully!", async () => {
    const res = await request(app)
      .post(`/api/applications/${jobId}`)
      .set("Authorization", `Bearer ${jobSeekerToken}`)
      .send();

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toMatch(/Applied successfully/);
    expect(res.body.application.job).toBe(String(jobId));
    expect(res.body.application.resume).toBe("/uploads/test-resume.pdf");
  });
});
