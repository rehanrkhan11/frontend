// src/pages/auth/RegisterPage.jsx
// ─────────────────────────────────────────────────────────────
// Registration form for patients and doctors.
// Submits to /api/auth/register.
// ─────────────────────────────────────────────────────────────

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { Stethoscope, Eye, EyeOff, Loader2 } from "lucide-react";

const SPECIALIZATIONS = [
  "General Physician", "Cardiologist", "Dermatologist", "Neurologist",
  "Orthopedic Surgeon", "Pediatrician", "Psychiatrist", "Gynecologist",
  "ENT Specialist", "Ophthalmologist", "Urologist", "Endocrinologist",
];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [role, setRole]   = useState("patient");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "", email: "", password: "", confirmPassword: "",
    phone: "", specialization: "",
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (role === "doctor" && !form.specialization) {
      toast.error("Please select a specialization");
      return;
    }

    setLoading(true);
    try {
      const payload = { ...form, role };
      delete payload.confirmPassword;
      const user = await register(payload);
      toast.success("Account created! Welcome aboard 🎉");
      navigate(user.role === "doctor" ? "/doctor" : "/patient");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-lg animate-in">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center">
            <Stethoscope size={20} className="text-white" />
          </div>
          <p className="font-display text-xl font-bold text-slate-900">HealthCare+</p>
        </div>

        <div className="card p-8">
          <h2 className="font-display text-2xl font-bold text-slate-900 mb-1">Create account</h2>
          <p className="text-slate-500 text-sm mb-6">Join HealthCare+ today</p>

          {/* Role tabs */}
          <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
            {["patient", "doctor"].map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all
                  ${role === r ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"}`}
              >
                {r === "patient" ? "I'm a Patient" : "I'm a Doctor"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="label">Full name</label>
                <input name="name" className="input" placeholder="John Doe" value={form.name} onChange={handleChange} required />
              </div>

              <div className="col-span-2">
                <label className="label">Email address</label>
                <input name="email" type="email" className="input" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
              </div>

              <div>
                <label className="label">Phone number</label>
                {/* TODO: Add phone number formatting / validation */}
                <input name="phone" className="input" placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={handleChange} />
              </div>

              {/* Doctor: specialization */}
              {role === "doctor" && (
                <div>
                  <label className="label">Specialization</label>
                  <select name="specialization" className="input bg-white" value={form.specialization} onChange={handleChange} required>
                    <option value="">Select…</option>
                    {SPECIALIZATIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className={role === "doctor" ? "col-span-2" : ""}>
                <label className="label">Password</label>
                <div className="relative">
                  <input name="password" type={showPw ? "text" : "password"} className="input pr-11"
                    placeholder="Min 6 characters" value={form.password} onChange={handleChange} required />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className={role === "doctor" ? "col-span-2" : ""}>
                <label className="label">Confirm password</label>
                <input name="confirmPassword" type="password" className="input"
                  placeholder="Re-enter password" value={form.confirmPassword} onChange={handleChange} required />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 mt-2">
              {loading ? <><Loader2 size={16} className="animate-spin" /> Creating account…</> : "Create Account"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-5">
          Already have an account?{" "}
          <Link to="/login" className="text-teal-600 font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
