import { useEffect, useState } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { validateEmail } from "../../utils/helper";
import { useAuth } from "../../context/AuthContext";
import { API_PATHS } from "../../utils/apiPaths";
import axiosInstance from "../../utils/axiosInstance";
import { Link } from "react-router-dom";
import { isEmployerProfileComplete } from "../../utils/helper";
const Login = () => {
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [formState, setFormState] = useState({
    loading: false,
    errors: {},
    showPassword: false,
    success: false,
  });

  const validatePassword = (password) => {
    if (!password) return "Password is required";
    return "";
  };

  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
      setFormData((prev) => ({
        ...prev,
        email: rememberedEmail,
        rememberMe: true,
      }));
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (formState.errors[name]) {
      setFormState((prev) => ({
        ...prev,
        errors: { ...prev.errors, [name]: "" },
      }));
    }
  };

  const validateForm = () => {
    const errors = {
      email: validateEmail(formData.email),
      password: validatePassword(formData.password),
    };

    Object.keys(errors).forEach((key) => {
      if (!errors[key]) delete errors[key];
    });

    setFormState((prev) => ({ ...prev, errors }));
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setFormState((prev) => ({ ...prev, loading: true }));

    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
        email: formData.email,
        password: formData.password,
      });

      const { token, user } = response.data;

      setFormState((prev) => ({
        ...prev,
        loading: false,
        success: true,
        errors: {},
      }));

      if (token && user) {
        if (formData.rememberMe) {
          localStorage.setItem("rememberedEmail", formData.email);
        } else {
          localStorage.removeItem("rememberedEmail");
        }
        login(user, token, formData.rememberMe);

        setTimeout(() => {
          if (user.role === "admin") window.location.href = "/admin-dashboard";
          else if (user.role === "employer")
            window.location.href = isEmployerProfileComplete(user)
              ? "/employer-dashboard"
              : "/company-profile";
          else window.location.href = "/find-jobs";
        }, 1500);
      }
    } catch (error) {
      setFormState((prev) => ({
        ...prev,
        loading: false,
        errors: {
          submit:
            error.response?.data?.message ||
            "Login failed. Please check your credentials.",
        },
      }));
    }
  };

  if (formState.success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-white via-slate-100 to-blue-50 px-4">
        <div className="relative w-full max-w-md animate-[fadeIn_0.35s_ease-out] overflow-hidden rounded-3xl border border-blue-200/50 bg-white/80 p-10 text-center shadow-2xl backdrop-blur-md">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />

          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
            Welcome Back,{" "}
            <span className="text-blue-500">{formData.email.split("@")[0]}</span>!
          </h2>
          <p className="text-gray-600 mb-6">
            You have successfully logged in. Preparing your dashboard...
          </p>

          <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full mx-auto animate-spin mb-4"></div>
          <p className="text-sm text-gray-500">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-white via-slate-100 to-blue-50 px-4">
      <div className="relative w-full max-w-md animate-[fadeIn_0.35s_ease-out] rounded-3xl border border-blue-200/50 bg-white/80 p-10 shadow-2xl backdrop-blur-md">
        {/* Subtle static gradient circles for style */}
        <div className="absolute top-0 -left-10 w-36 h-36 bg-gradient-to-tr from-blue-200 to-purple-200 rounded-full opacity-20"></div>
        <div className="absolute bottom-0 -right-10 w-36 h-36 bg-gradient-to-tr from-pink-200 to-yellow-200 rounded-full opacity-20"></div>

        {/* Welcome message */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Let's Get Started
          </h1>
          <p className="text-gray-600">
            Sign in to manage your profile and discover new opportunities.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-4 py-3 rounded-xl border text-gray-900 bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors ${
                  formState.errors.email ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter your email"
              />
            </div>
            {formState.errors.email && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {formState.errors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5" />
              <input
                type={formState.showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-12 py-3 rounded-xl border text-gray-900 bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors ${
                  formState.errors.password ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() =>
                  setFormState((prev) => ({
                    ...prev,
                    showPassword: !prev.showPassword,
                  }))
                }
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-400 hover:text-blue-600"
              >
                {formState.showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {formState.errors.password && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {formState.errors.password}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between gap-4">
            <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold text-slate-600">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-300"
              />
              Remember me
            </label>
            <Link
              to="/forgot-password"
              className="text-sm font-semibold text-blue-500 transition-colors hover:text-blue-700"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Submit Error */}
          {formState.errors.submit && (
            <div className="bg-red-100 border border-red-300 rounded-lg p-3">
              <p className="text-red-600 text-sm flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" />
                {formState.errors.submit}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={formState.loading}
            className="w-full bg-gradient-to-r from-blue-400 to-purple-300 text-white py-3 rounded-xl font-semibold hover:from-blue-500 hover:to-purple-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {formState.loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <a
                href="/signup"
                className="text-blue-400 hover:text-blue-600 font-medium"
              >
                Create one here
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
