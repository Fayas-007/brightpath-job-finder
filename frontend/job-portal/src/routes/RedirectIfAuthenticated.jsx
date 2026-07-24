import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { isEmployerProfileComplete } from "../utils/helper";

const RedirectIfAuthenticated = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      if (user.role === "admin") navigate("/admin-dashboard");
      else if (user.role === "employer") {
        navigate(isEmployerProfileComplete(user) ? "/employer-dashboard" : "/company-profile");
      }
      else navigate("/find-jobs");
    }
  }, [loading, isAuthenticated, user, navigate]);

  if (loading) return null;

  return children;
};

export default RedirectIfAuthenticated;
