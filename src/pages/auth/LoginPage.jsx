// src/pages/auth/LoginPage.jsx
// ─────────────────────────────────────────────────────────────
// Login form for both patients and doctors.
// Tabs switch between roles; submits to /api/auth/login.
// ─────────────────────────────────────────────────────────────

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { Stethoscope, Eye, EyeOff, User, Loader2 } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate   = useNavigate();

  const [role, setRole]         = useState("patient");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name}!`);
      navigate(user.role === "doctor" ? "/doctor" : "/patient");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* ── Left decorative panel (desktop only) ─────────── */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-teal-600 to-teal-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "32px 32px" }} />
        <div className="relative z-10 flex flex-col justify-center px-16">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mb-8">
            <Stethoscope size={28} className="text-white" />
          </div>
          <h1 className="font-display text-5xl font-bold text-white leading-tight mb-4">
            Your health,<br />our priority.
          </h1>
          <p className="text-teal-100 text-lg leading-relaxed max-w-sm">
            Book appointments, access your medical history, and chat with AI — all in one place.
          </p>
          <div className="mt-12 grid grid-cols-2 gap-4">
            {[
              { label: "Verified Doctors", value: "200+" },
              { label: "Happy Patients",   value: "10K+" },
              { label: "Specializations",  value: "50+"  },
              { label: "Available 24/7",   value: "Yes"  },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/10 backdrop-blur rounded-2xl p-4">
                <p className="font-display text-2xl font-bold text-white">{value}</p>
                <p className="text-teal-200 text-sm mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right: Login form ─────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md animate-in">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center">
              <Stethoscope size={20} className="text-white" />
            </div>
            <p className="font-display text-xl font-bold text-slate-900">HealthCare+</p>
          </div>

          <h2 className="font-display text-3xl font-bold text-slate-900 mb-1">Sign in</h2>
          <p className="text-slate-500 text-sm mb-8">Welcome back! Select your role to continue.</p>

          {/* Role tabs */}
          <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
            {["patient", "doctor"].map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all
                  ${role === r ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"}`}
              >
                <User size={15} />
                {r === "patient" ? "Patient" : "Doctor"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email address</label>
              <input
                type="email"
                className="input"
                placeholder={role === "patient" ? "patient@example.com" : "doctor@example.com"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label mb-0">Password</label>
                {/* TODO: Implement forgot password flow */}
                <button type="button" className="text-xs text-teal-600 hover:underline font-medium">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  className="input pr-11"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 mt-2">
              {loading ? <><Loader2 size={16} className="animate-spin" /> Signing in…</> : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="text-teal-600 font-semibold hover:underline">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
