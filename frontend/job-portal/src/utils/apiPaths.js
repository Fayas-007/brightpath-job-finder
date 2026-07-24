export const BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8000").replace(/\/$/, "");

export const getAssetUrl = (url) => {
  if (!url || url.startsWith("blob:")) return "";
  if (url.startsWith("http")) return url;
  return `${BASE_URL}${url}`;
};

export const API_PATHS = {
  AUTH: {
    REGISTER: "/api/auth/register",
    LOGIN: "/api/auth/login",
    GET_PROFILE: "/api/auth/me",
    UPDATE_PROFILE: "/api/user/profile",
    DELETE_RESUME: "/api/user/resume",
FORGOT_PASSWORD: "/api/auth/forgot-password",
RESET_PASSWORD: "/api/auth/reset-password",
  },

  DASHBOARD: {
    OVERVIEW: `/api/analytics/overview`,
  },

  USERS: {
  GET_ME: "/api/auth/profile",
},
  JOBS: {
    GET_ALL_JOBS: '/api/jobs',
    GET_JOB_BY_ID: (id) => `/api/jobs/${id}`, // ✅ Fixed key name
    POST_JOB: "/api/jobs",
    GET_JOBS_EMPLOYER: "/api/jobs/get-jobs-employer",
    UPDATE_JOB: (id) => `/api/jobs/${id}`,
    TOGGLE_CLOSE: (id) => `/api/jobs/${id}/toggle-close`,
    DELETE_JOB: (id) => `/api/jobs/${id}`,
    SAVE_JOB: (id) => `/api/save-jobs/${id}`,
    UNSAVE_JOB: (id) => `/api/save-jobs/${id}`,
    GET_SAVED_JOBS: '/api/save-jobs/my',
  },

  APPLICATIONS: {
    APPLY_TO_JOB: (id) => `/api/applications/${id}`,
    GET_ALL_APPLICATIONS: (id) => `/api/applications/job/${id}`,
    DOWNLOAD_RESUME: (id) => `/api/applications/${id}/resume`,
    UPDATE_STATUS: (id) => `/api/applications/${id}/status`,
  },

  NOTIFICATIONS: {
    GET_MY: "/api/notifications",
    MARK_READ: (id) => `/api/notifications/${id}/read`,
    MARK_ALL_READ: "/api/notifications/read-all",
  },

  IMAGE: {
    UPLOAD_IMAGE: "/api/auth/upload-image",
  },
};
