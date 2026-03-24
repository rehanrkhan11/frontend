// src/pages/NotFound.jsx
import { useNavigate } from "react-router-dom";
import { Stethoscope, ArrowLeft } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center animate-in">
        <div className="w-20 h-20 rounded-3xl bg-teal-100 flex items-center justify-center mx-auto mb-6">
          <Stethoscope size={36} className="text-teal-600" />
        </div>
        <h1 className="font-display text-7xl font-bold text-slate-900 mb-2">404</h1>
        <p className="text-slate-500 mb-8">Oops! This page doesn't exist.</p>
        <button onClick={() => navigate(-1)} className="btn-primary">
          <ArrowLeft size={16} /> Go Back
        </button>
      </div>
    </div>
  );
}
