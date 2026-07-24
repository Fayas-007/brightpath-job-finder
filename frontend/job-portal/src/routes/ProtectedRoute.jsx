import { useAuth } from "../context/AuthContext";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { isEmployerProfileComplete } from "../utils/helper";

const ProtectedRoute = ({ requiredRole }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (requiredRole && user?.role !== requiredRole)
    return <Navigate to="/" replace />;
  if (
    requiredRole === "employer" &&
    location.pathname !== "/company-profile" &&
    !isEmployerProfileComplete(user)
  ) {
    return <Navigate to="/company-profile" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
