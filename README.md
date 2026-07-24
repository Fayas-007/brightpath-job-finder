# BrightPath

BrightPath is a full stack job portal built with React and Express. It supports job seekers, employers, and admins with job discovery, applications, resume submission, saved jobs, profile management, employer job posting, applicant review, and notifications.

## Screenshots

### Landing Page

![BrightPath landing page](docs/screenshots/landing-page.png)

### Login

![BrightPath login page](docs/screenshots/login-page.png)

### Create Account

![BrightPath sign up page](docs/screenshots/signup-page.png)

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

Recommended simple deployment:

- Deploy backend to Render, Railway, or a similar Node.js host.
- Deploy frontend to Vercel or Netlify.
- Set backend environment variables on the backend host.
- Set `VITE_API_BASE_URL` on the frontend host to the deployed backend URL.
- Update `FRONTEND_URL` on the backend host to the deployed frontend URL.

Important: local uploads are not permanent on many hosting platforms. For a real production deployment, move resume and image uploads to Cloudinary, AWS S3, or another persistent file storage service.
