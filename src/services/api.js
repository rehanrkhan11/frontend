// src/services/api.js
// ─────────────────────────────────────────────────────────────
// Axios instance pre-configured with:
//   - Base URL pointing to backend
//   - JWT token auto-injection via request interceptor
//   - 401 auto-logout via response interceptor
// ─────────────────────────────────────────────────────────────

import axios from "axios";

// TODO: In production set VITE_API_URL to your deployed backend URL
//       e.g., https://yourapi.com/api
const BASE_URL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000, // 15 seconds — adjust as needed
});

// ── Request interceptor: inject JWT ─────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: handle 401 globally ───────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired — clear auth and redirect to login
      localStorage.removeItem("token");
      // Only redirect if not already on auth pages
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
