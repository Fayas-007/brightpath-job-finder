import { useState } from "react";
import { Mail, Loader, CheckCircle, AlertCircle } from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { validateEmail } from "../../utils/helper";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }

    setLoading(true);

    try {
      const response = await axiosInstance.post(
        API_PATHS.AUTH.FORGOT_PASSWORD,
        { email }
      );
      setLoading(false);
      setSuccess(true);
      toast.success(response.data.message);
    } catch (err) {
      setLoading(false);
      setError(
        err.response?.data?.message || "Failed to send reset email. Try again."
      );
      toast.error(err.response?.data?.message || "Failed to send reset email");
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-white via-slate-100 to-blue-50 px-4">
        <div className="relative w-full max-w-md animate-[fadeIn_0.35s_ease-out] overflow-hidden rounded-3xl border border-blue-200/50 bg-white/80 p-10 text-center shadow-2xl backdrop-blur-md">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
            Check your inbox!
          </h2>
          <p className="text-gray-600 mb-4">
            We have sent a password reset link to <b>{email}</b>.
          </p>
          <p className="text-sm text-gray-500">
            The link is valid for 1 hour.
          </p>
          <Link
            to="/login"
            className="mt-6 inline-block px-6 py-3 bg-blue-400 text-white rounded-xl hover:bg-blue-500 transition"
          >
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-white via-slate-100 to-blue-50 px-4">
      <div className="relative w-full max-w-md animate-[fadeIn_0.35s_ease-out] rounded-3xl border border-blue-200/50 bg-white/80 p-10 shadow-2xl backdrop-blur-md">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Forgot Password
          </h1>
          <p className="text-gray-600">
            Enter your email to receive a password reset link.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className={`w-full pl-10 pr-4 py-3 rounded-xl border text-gray-900 bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors ${
                  error ? "border-red-500" : "border-gray-300"
                }`}
              />
            </div>
            {error && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-400 to-purple-300 text-white py-3 rounded-xl font-semibold hover:from-blue-500 hover:to-purple-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              <span>Send Reset Link</span>
            )}
          </button>

          <div className="text-center">
            <p className="text-gray-600">
              Remembered your password?{" "}
              <Link
                to="/login"
                className="text-blue-400 hover:text-blue-600 font-medium"
              >
                Sign In
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
