// src/pages/patient/PatientDashboard.jsx
// ─────────────────────────────────────────────────────────────
// Main dashboard for the patient: stats, upcoming appointments,
// and recent medical records.
// Data is fetched from the backend API.
// ─────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PatientLayout from "../../components/layout/PatientLayout";
import StatusBadge   from "../../components/shared/StatusBadge";
import EmptyState    from "../../components/shared/EmptyState";
import { useAuth }   from "../../context/AuthContext";
import api           from "../../services/api";
import toast         from "react-hot-toast";
import {
  Calendar, FileText, MessageSquare,
  Clock, Loader2, ChevronRight, Pill,
} from "lucide-react";
import { format } from "date-fns";

export default function PatientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [records,      setRecords]      = useState([]);
  const [loading,      setLoading]      = useState(true);

  // ── Fetch data on mount ──────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [apptRes, recRes] = await Promise.all([
          api.get("/appointments"),
          api.get("/medical-records"),
        ]);
        setAppointments(apptRes.data);
        setRecords(recRes.data);
      } catch {
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const upcoming = appointments.filter((a) => a.status === "scheduled");

  if (loading) {
    return (
      <PatientLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 size={28} className="animate-spin text-teal-600" />
        </div>
      </PatientLayout>
    );
  }

  return (
    <PatientLayout>
      {/* ── Welcome banner ───────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-600 to-teal-700 p-6 mb-6 text-white">
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10" />
        <div className="absolute -right-4 bottom-0 w-24 h-24 rounded-full bg-white/5" />
        <div className="relative z-10">
          <p className="text-teal-200 text-sm font-medium mb-1">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
          <h2 className="font-display text-2xl font-bold mb-1">
            Good {new Date().getHours() < 12 ? "morning" : "afternoon"}, {user?.name?.split(" ")[0]}!
          </h2>
          <p className="text-teal-100 text-sm">
            {upcoming.length > 0
              ? `You have ${upcoming.length} upcoming appointment${upcoming.length > 1 ? "s" : ""}.`
              : "No upcoming appointments. Book one today!"}
          </p>
        </div>
      </div>

      {/* ── Quick stats ───────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          {
            icon: Calendar, label: "Upcoming",
            value: upcoming.length, color: "teal",
            action: () => navigate("/patient/book-appointment"),
            actionLabel: "Book new",
          },
          {
            icon: FileText, label: "Records",
            value: records.length, color: "violet",
            action: () => navigate("/patient/medical-history"),
            actionLabel: "View all",
          },
          {
            icon: MessageSquare, label: "AI Assistant",
            value: "AI", color: "amber",
            action: () => navigate("/patient/chatbot"),
            actionLabel: "Chat now",
          },
        ].map(({ icon: Icon, label, value, color, action, actionLabel }) => (
          <div key={label} className="card p-5">
            <div className={`w-10 h-10 rounded-xl bg-${color}-50 flex items-center justify-center mb-3`}>
              <Icon size={20} className={`text-${color}-600`} />
            </div>
            <p className="text-slate-500 text-xs font-medium mb-1">{label}</p>
            <p className="font-display text-3xl font-bold text-slate-900 mb-3">{value}</p>
            <button onClick={action} className="text-xs font-semibold text-teal-600 hover:underline flex items-center gap-1">
              {actionLabel} <ChevronRight size={13} />
            </button>
          </div>
        ))}
      </div>

      {/* ── Upcoming appointments ────────────────────────── */}
      <div className="card mb-6">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="section-title">Upcoming Appointments</h3>
          <button onClick={() => navigate("/patient/book-appointment")} className="btn-primary py-1.5 px-4 text-xs">
            + Book
          </button>
        </div>
        <div className="p-4">
          {upcoming.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No upcoming appointments"
              description="Book a consultation with one of our doctors."
              action={
                <button onClick={() => navigate("/patient/book-appointment")} className="btn-primary">
                  Book Appointment
                </button>
              }
            />
          ) : (
            <div className="space-y-3">
              {upcoming.slice(0, 5).map((appt) => (
                <div key={appt._id} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center flex-shrink-0">
                    <Clock size={18} className="text-teal-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 text-sm">{appt.doctor?.name}</p>
                    <p className="text-xs text-slate-500 truncate">{appt.reason}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-medium text-slate-700">
                      {format(new Date(appt.date), "MMM d, yyyy")}
                    </p>
                    <p className="text-xs text-slate-500">{appt.time}</p>
                  </div>
                  <StatusBadge status={appt.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Recent medical records ────────────────────────── */}
      <div className="card">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="section-title">Recent Medical Records</h3>
          <button onClick={() => navigate("/patient/medical-history")} className="text-sm text-teal-600 font-semibold hover:underline flex items-center gap-1">
            View all <ChevronRight size={14} />
          </button>
        </div>
        <div className="p-4">
          {records.length === 0 ? (
            <EmptyState icon={FileText} title="No medical records yet" description="Your records will appear here after a consultation." />
          ) : (
            <div className="space-y-3">
              {records.slice(0, 3).map((rec) => (
                <div
                  key={rec._id}
                  onClick={() => navigate("/patient/medical-history")}
                  className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
                    <Pill size={18} className="text-violet-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 text-sm">{rec.diagnosis}</p>
                    <p className="text-xs text-slate-500">{rec.doctor?.name}</p>
                    {rec.prescriptions?.length > 0 && (
                      <p className="text-xs text-violet-600 font-medium mt-1">
                        {rec.prescriptions.length} prescription{rec.prescriptions.length > 1 ? "s" : ""}
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 flex-shrink-0">
                    {format(new Date(rec.date), "MMM d")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PatientLayout>
  );
}
