import { lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";

import ProtectedRoute from "./routes/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import RedirectIfAuthenticated from "./routes/RedirectIfAuthenticated";

const LandingPage = lazy(() => import("./pages/LandingPage/LandingPage"));
const SignUp = lazy(() => import("./pages/Auth/SignUp"));
const Login = lazy(() => import("./pages/Auth/Login"));
const ForgotPassword = lazy(() => import("./pages/Auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/Auth/ResetPassword"));

const JobSeekerDashboard = lazy(() => import("./pages/JobSeeker/JobSeekerDashboard"));
const JobDetails = lazy(() => import("./pages/JobSeeker/JobDetails"));
const SavedJobs = lazy(() => import("./pages/JobSeeker/SavedJobs"));
const AppliedJobs = lazy(() => import("./pages/JobSeeker/AppliedJobs"));
const UserProfile = lazy(() => import("./pages/JobSeeker/UserProfile"));
const ProfileView = lazy(() => import("./pages/JobSeeker/ProfileView"));

const EmployerDashboard = lazy(() => import("./pages/Employer/EmployerDashboard"));
const JobPostingForm = lazy(() => import("./pages/Employer/JobPostingForm"));
const ManageJobs = lazy(() => import("./pages/Employer/ManageJobs"));
const ApplicationViewer = lazy(() => import("./pages/Employer/ApplicationViewer"));
const EmployerProfilePage = lazy(() => import("./pages/Employer/EmployerProfilePage"));

const AdminDashboard = lazy(() => import("./pages/Admin/AdminDashboard"));
const ManageUsers = lazy(() => import("./pages/Admin/ManageUsers"));
const AdminManageJobs = lazy(() => import("./pages/Admin/adminManageJobs"));
const ManageApplication = lazy(() => import("./pages/Admin/ManageApplication"));
const AdminApplicationDetails = lazy(() => import("./pages/Admin/AdminApplicationDetails"));

const RouteLoader = () => (
  <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
    <div className="rounded-lg border border-slate-200 bg-white px-6 py-5 text-center shadow-sm">
      <div className="mx-auto h-9 w-9 animate-spin rounded-full border-b-2 border-blue-600" />
      <p className="mt-4 text-sm font-bold text-slate-600">Loading BrightPath...</p>
    </div>
  </div>
);

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<RouteLoader />}>
          <Routes>
            {/* Public Routes */}
            <Route
              path="/"
              element={
                <RedirectIfAuthenticated>
                  <LandingPage />
                </RedirectIfAuthenticated>
              }
            />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* Job Seeker Routes */}
            <Route element={<ProtectedRoute requiredRole="jobseeker" />}>
              <Route path="/find-jobs" element={<JobSeekerDashboard />} />
              <Route path="/job/:jobId" element={<JobDetails />} />
              <Route path="/saved-jobs" element={<SavedJobs />} />
              <Route path="/applied-jobs" element={<AppliedJobs />} />
              <Route path="/profile" element={<ProfileView />} />
              <Route path="/edit-profile" element={<UserProfile />} />
            </Route>

            {/* Employer Routes */}
            <Route element={<ProtectedRoute requiredRole="employer" />}>
              <Route path="/employer-dashboard" element={<EmployerDashboard />} />
              <Route path="/post-job" element={<JobPostingForm />} />
              <Route path="/manage-jobs" element={<ManageJobs />} />
              <Route path="/applicants" element={<ApplicationViewer />} />
              <Route path="/applicants/:jobId" element={<ApplicationViewer />} />
              <Route path="/company-profile" element={<EmployerProfilePage />} />
            </Route>

            {/* Admin Routes */}
            <Route element={<ProtectedRoute requiredRole="admin" />}>
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              <Route path="/manage-users" element={<ManageUsers />} />
              <Route path="/admin/manage-jobs" element={<AdminManageJobs />} />
              <Route path="/admin/manage-applications" element={<ManageApplication />} />
              <Route path="/admin/applications/:id" element={<AdminApplicationDetails />} />
            </Route>

            {/* Catch-all Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Router>

      <Toaster
        toastOptions={{
          className: "",
          style: {
            fontSize: "13px",
          },
        }}
      />
    </AuthProvider>
  );
};

export default App;
