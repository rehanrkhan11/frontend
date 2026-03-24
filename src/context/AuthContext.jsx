// src/context/AuthContext.jsx
// ─────────────────────────────────────────────────────────────
// Provides auth state (user, token) and auth actions globally.
// Wrap your app with <AuthProvider> in App.jsx.
// ─────────────────────────────────────────────────────────────

import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true); // checking persisted session

  // ── On mount: restore session from localStorage ──────────
  useEffect(() => {
    const restoreSession = async () => {
      const savedToken = localStorage.getItem("token");
      if (!savedToken) {
        setLoading(false);
        return;
      }
      try {
        // Verify token is still valid by fetching current user
        const { data } = await api.get("/auth/me");
        setUser(data);
        setToken(savedToken);
      } catch {
        // Token expired or invalid — clear storage
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  // ── Login ────────────────────────────────────────────────
  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("token", data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  // ── Register ─────────────────────────────────────────────
  const register = async (formData) => {
    const { data } = await api.post("/auth/register", formData);
    localStorage.setItem("token", data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  // ── Logout ───────────────────────────────────────────────
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    // TODO: If using refresh tokens, also invalidate on the server
  };

  // ── Update local user state (after profile edit) ─────────
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook for easy access
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
