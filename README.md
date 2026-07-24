# BrightPath

BrightPath is a full stack job portal built with React and Express. It supports job seekers, employers, and admins with job discovery, applications, resume submission, saved jobs, profile management, employer job posting, applicant review, and notifications.

## Tech Stack

- Frontend: React 18, Vite, React Router, Axios, Tailwind CSS, Lucide React, Recharts
- Backend: Node.js, Express.js, MongoDB, Mongoose, JWT authentication, Multer, Nodemailer
- Database: MongoDB Atlas or local MongoDB
- Runtime uploads: profile images and resumes are stored in local `uploads` folders during development

## Project Structure

```text
BrightPathLatest/
  backend/
    config/
    controllers/
    middlewares/
    models/
    routes/
    utils/
    server.js
    .env.example
  frontend/
    job-portal/
      public/
      src/
      .env.example
      package.json
  uploads/
  .gitignore
  README.md
```

## Application Walkthrough

### Landing Page

![BrightPath landing page](docs/screenshots/landing-page.png)

The landing page introduces BrightPath with a clear brand, a focused message, and two direct actions: find jobs for candidates or post a job for employers. The page is designed to quickly explain the platform without making the visitor search for the next step.

### Login

![BrightPath login page](docs/screenshots/login-page.png)

The login screen keeps the flow simple for returning users. It supports role-based entry into the right workspace after authentication.

### Create Account

![BrightPath sign up page](docs/screenshots/signup-page.png)

The registration page lets a user choose between job seeker and employer accounts. Profile image upload is optional, while required fields are validated before account creation.

### Job Seeker: Find Jobs

![Job seeker find jobs screen](docs/screenshots/jobseeker-find-jobs.png)

The job seeker workspace focuses on job discovery. Candidates can search by title, company, keyword, or location, apply filters, switch job list layout, save roles, and open job details from one place.

### Job Seeker: Profile And Resume

![Job seeker profile screen](docs/screenshots/jobseeker-profile.png)

The profile area stores the candidate identity, resume, education, experience, skills, projects, and social links. The saved resume is used during the application flow so a candidate can apply faster without uploading the same file every time.

### Employer: Dashboard

![Employer dashboard screen](docs/screenshots/employer-dashboard.png)

The employer dashboard gives a quick view of posted jobs, applications, active roles, and hiring activity. It is the main starting point for managing hiring work.

### Employer: Post A Job

![Employer post job screen](docs/screenshots/employer-post-job.png)

The job posting screen is structured so employers can publish clear roles with title, category, location, salary, description, and requirements. Employer company details are checked before posting so jobs have the right public identity.

### Employer: Manage Jobs

![Employer manage jobs screen](docs/screenshots/employer-manage-jobs.png)

The manage jobs page helps employers review their posted roles, track status, and open applicants for each job. It keeps job management separate from candidate review.

### Employer: Company Profile

![Employer company profile screen](docs/screenshots/employer-company-profile.png)

The employer profile represents the company-facing identity used on job posts and applicant review. Employers can update company name, description, contact details, and profile image from this area.

### Admin: Overview

![Admin dashboard screen](docs/screenshots/admin-dashboard.png)

The admin dashboard summarizes platform activity and gives the admin a central place to monitor users, jobs, and applications.

### Admin: Users

![Admin users screen](docs/screenshots/admin-users.png)

The users page lets admins review registered accounts across job seekers, employers, and admins. Sensitive fields such as passwords are excluded from API responses.

### Admin: Jobs

![Admin jobs screen](docs/screenshots/admin-jobs.png)

The admin jobs page provides oversight of posted jobs, including job status and employer-related information.

### Admin: Applications

![Admin applications screen](docs/screenshots/admin-applications.png)

The admin applications page shows submitted applications and their current review state. Submitted resumes are treated as the main application record so employer and admin review uses the resume attached at apply time.

## Environment Setup

Create a real `.env` file from the examples. Do not commit real `.env` files to GitHub.

Backend:

```bash
cd backend
copy .env.example .env
```

Frontend:

```bash
cd frontend/job-portal
copy .env.example .env
```

Backend variables:

```env
PORT=8000
MONGO_URI=your_main_mongodb_connection_string
MONGO_URI_TEST=your_test_mongodb_connection_string
JWT_SECRET=your_long_random_jwt_secret
FRONTEND_URL=http://localhost:5173
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
```

Frontend variables:

```env
VITE_API_BASE_URL=http://localhost:8000
```

For Gmail SMTP, use a Gmail App Password, not your normal Gmail password.

## Install Dependencies

Install backend dependencies:

```bash
cd backend
npm install
```

Install frontend dependencies:

```bash
cd frontend/job-portal
npm install
```

## Run Locally

Start the backend:

```bash
cd backend
npm run dev
```

Start the frontend in another terminal:

```bash
cd frontend/job-portal
npm run dev
```

Local URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`

## Build And Check

Frontend lint:

```bash
cd frontend/job-portal
npm run lint
```

Frontend production build:

```bash
cd frontend/job-portal
npm run build
```

Backend tests:

```bash
cd backend
npm test
```

The backend tests need a reachable `MONGO_URI_TEST`.

## GitHub Upload Notes

Before pushing to GitHub, make sure these are not committed:

- `.env`
- `.env.test`
- `node_modules/`
- `dist/`
- `uploads/`
- log files

The project `.gitignore` already includes these patterns.

## Deployment Notes

BrightPath can be deployed with either a normal Node backend host or Vercel serverless functions.

### Backend On Vercel

The backend includes Vercel support through:

```text
backend/api/index.js
backend/vercel.json
```

`backend/server.js` exports the Express app for Vercel. The server only calls `app.listen(...)` when it is running locally or on a normal Node host. Vercel sets the `VERCEL` environment variable, so Vercel can import the app without trying to start a separate long-running server.

Use these backend project settings on Vercel:

```text
Root Directory: backend
Framework Preset: Other
Install Command: npm install
Build Command: leave empty
Output Directory: leave empty
```

Required backend environment variables:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_jwt_secret
PORT=8000
FRONTEND_URL=https://your-frontend-url.vercel.app
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
```

### Frontend On Vercel

Use these frontend project settings on Vercel:

```text
Root Directory: frontend/job-portal
Framework Preset: Vite
Install Command: npm install
Build Command: npm run build
Output Directory: dist
```

Required frontend environment variable:

```env
VITE_API_BASE_URL=https://your-backend-url.vercel.app
```

### Normal Node Hosts

The same backend still works on Render, Railway, Koyeb, or another normal Node host. Those hosts do not set `VERCEL`, so `server.js` will run `app.listen(...)` normally.

For normal Node hosts, use:

```text
Root Directory: backend
Build Command: npm install
Start Command: npm start
```

Important: local uploads are not permanent on many hosting platforms, and Vercel functions should not be used for persistent uploaded files. For a real production deployment, move resume and image uploads to Cloudinary, AWS S3, or another persistent file storage service.
