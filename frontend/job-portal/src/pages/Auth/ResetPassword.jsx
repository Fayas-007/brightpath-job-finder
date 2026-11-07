import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import {
  Lock,
  Eye,
  EyeOff,
  Loader,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { API_PATHS } from "../../utils/apiPaths";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await axiosInstance.post(`${API_PATHS.AUTH.RESET_PASSWORD}/${token}`, {
        newPassword: password,
        confirmPassword,
      });
      setSuccess("Password reset successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired token");
    } finally {
      setLoading(false);
    }
  };

  const mismatch = confirmPassword.length > 0 && password !== confirmPassword;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-10 rounded-2xl shadow-md max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Reset Password</h2>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* New password */}
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 w-5 h-5" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              autoComplete="new-password"
              className="w-full pl-10 pr-11 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((show) => !show)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Confirm password */}
          <div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 w-5 h-5" />
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                autoComplete="new-password"
                aria-invalid={mismatch}
                className={`w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 ${
                  mismatch
                    ? "border-red-400 focus:ring-red-200"
                    : "border-gray-300 focus:ring-blue-300"
                }`}
                required
              />
            </div>

            {mismatch && (
              <p className="mt-1 text-xs text-red-600">
                Passwords do not match.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !password || !confirmPassword}
            className="w-full bg-blue-500 text-white py-3 rounded-xl flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              "Reset Password"
            )}
          </button>

          {success && (
            <p className="text-green-600 flex items-center mt-2">
              <CheckCircle className="w-4 h-4 mr-1" /> {success}
            </p>
          )}
          {error && (
            <p className="text-red-600 flex items-center mt-2">
              <AlertCircle className="w-4 h-4 mr-1" /> {error}
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;