// __tests__/TC012_AdminDeleteJob.test.js
require("dotenv").config({ path: ".env.test" });
const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../server");
const Job = require("../models/Job");
const User = require("../models/User");

let adminToken;
let jobId;
let employerId;

beforeAll(async () => {
  // Connect to test DB
  await mongoose.connect(process.env.MONGO_URI_TEST, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // Create an admin user
  const adminUser = await User.create({
    name: "Test Admin",
    email: "admin@test.com",
    password: "Admin123",
    role: "admin",
  });

  // Log in as admin to get JWT token
  const res = await request(app)
    .post("/api/auth/login")
    .send({ email: "admin@test.com", password: "Admin123" });

  adminToken = res.body.token;

  // Create employer
  const employer = await User.create({
    _id: "69009229d2ea0e004628cd31", // using your given id
    name: "Rizan",
    email: "rizan@gmail.com",
    password: "Employer123",
    role: "employer",
    avatar: "http://localhost:8000/uploads/facebook-profile.jpg",
    companyName: "Facebook",
    companyDescription: "Facebook is the best social media platform!",
  });

  employerId = employer._id;

  // Create job with provided details
  const job = await Job.create({
    _id: "690260fe69d07f441bd0a45b", // given job id
    title: "Senior Fullstack Developer",
    description: "Looking for a skilled fullstack developer to join our Colombo team.",
    requirements: "Node.js, React.js, MongoDB",
    location: "Kandy, Sri Lanka",
    type: "Full-Time",
    category: "Software Development",
    salaryMin: 70000,
    salaryMax: 150000,
    company: employerId,
  });

  jobId = job._id;
});

afterAll(async () => {
  // Clean up DB
  await Job.deleteMany({});
  await User.deleteMany({});
  await mongoose.connection.close();
});

describe("TC012 - Admin Delete Job", () => {
  it("should delete the job successfully", async () => {
    const res = await request(app)
      .delete(`/api/admin/jobs/${jobId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Job deleted successfully");

    // Confirm deletion
    const jobInDb = await Job.findById(jobId);
    expect(jobInDb).toBeNull();
  });

  it("should return 404 for non-existent job", async () => {
    const res = await request(app)
      .delete(`/api/admin/jobs/${new mongoose.Types.ObjectId()}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Job not found");
  });
});
