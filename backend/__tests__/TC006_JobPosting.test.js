require("dotenv").config({ path: ".env.test" });
const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../server");
const User = require("../models/User");
const Job = require("../models/Job");

let recruiterToken;

beforeAll(async () => {
  // Connect to test DB
await mongoose.connect(process.env.MONGO_URI_TEST, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

  // Clear previous test data
  await User.deleteMany();
  await Job.deleteMany();

  // Create recruiter
    const recruiter = await User.create({
    name: "Test Recruiter",
    email: "recruiter@test.com",
    password: "Password123!",
    role: "employer",
    avatar: "http://localhost:8000/uploads/test-profile.png",
    companyName: "Test Company",
    companyDescription: "This is a test company",
    });
    
  // Login recruiter to get token
  const res = await request(app)
    .post("/api/auth/login")
    .send({ email: "recruiter@test.com", password: "Password123!" });

  recruiterToken = res.body.token;
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("TC006: Job Posting (Recruiter)", () => {
  it("should allow recruiter to post a job", async () => {
    const jobData = {
      title: "Senior Frontend Developer",
      location: "Colombo",
      category: "IT",
      type: "Full-Time",
      description: "Develop amazing web apps",
      requirements: "React, Node.js",
      salaryMin: 50000,
      salaryMax: 100000,
    };

    const res = await request(app)
      .post("/api/jobs")
      .set("Authorization", `Bearer ${recruiterToken}`)
      .send(jobData);

    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe(jobData.title);
    expect(res.body.company).toBeDefined();
  });

  it("should appear in public job listings", async () => {
    const res = await request(app).get("/api/jobs");

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].title).toBe("Senior Frontend Developer");
  });
});
