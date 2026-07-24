import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { Lock, Loader, CheckCircle, AlertCircle } from "lucide-react";
import { API_PATHS } from "../../utils/apiPaths";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await axiosInstance.post(`${API_PATHS.AUTH.RESET_PASSWORD}/${token}`, { newPassword: password });
      setSuccess("Password reset successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired token");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-10 rounded-2xl shadow-md max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Reset Password</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-3 rounded-xl flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? <Loader className="w-5 h-5 animate-spin" /> : "Reset Password"}
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
