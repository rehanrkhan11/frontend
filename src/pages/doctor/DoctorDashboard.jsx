// src/pages/doctor/DoctorDashboard.jsx
// ─────────────────────────────────────────────────────────────
// Doctor's main dashboard: today's appointments, all upcoming,
// and ability to complete an appointment with medical record.
// ─────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DoctorLayout from "../../components/layout/DoctorLayout";
import StatusBadge  from "../../components/shared/StatusBadge";
import EmptyState   from "../../components/shared/EmptyState";
import { useAuth }  from "../../context/AuthContext";
import api          from "../../services/api";
import toast        from "react-hot-toast";
import {
  Calendar, Clock, Users, CheckCircle,
  Loader2, Plus, Trash2, XCircle, User,
} from "lucide-react";
import { format, isToday } from "date-fns";

// ── Complete Appointment Modal ───────────────────────────────
function CompleteModal({ appointment, onClose, onDone }) {
  const [diagnosis,     setDiagnosis]     = useState("");
  const [notes,         setNotes]         = useState("");
  const [symptoms,      setSymptoms]      = useState("");
  const [prescriptions, setPrescriptions] = useState([]);
  const [followUpDate,  setFollowUpDate]  = useState("");
  const [submitting,    setSubmitting]    = useState(false);

  const addPrescription = () =>
    setPrescriptions([...prescriptions, { medication: "", dosage: "", frequency: "", duration: "" }]);

  const removePrescription = (i) =>
    setPrescriptions(prescriptions.filter((_, idx) => idx !== i));

  const updatePrescription = (i, field, value) => {
    const updated = [...prescriptions];
    updated[i][field] = value;
    setPrescriptions(updated);
  };

  const handleSubmit = async () => {
    if (!diagnosis.trim() || !notes.trim()) {
      toast.error("Diagnosis and notes are required");
      return;
    }
    setSubmitting(true);
    try {
      // Create medical record (this also marks appointment completed on backend)
      await api.post("/medical-records", {
        appointmentId: appointment._id,
        patientId:     appointment.patient._id,
        diagnosis,
        notes,
        symptoms: symptoms.split(",").map((s) => s.trim()).filter(Boolean),
        prescriptions,
        followUpDate: followUpDate || undefined,
      });

      // Also update appointment status explicitly
      await api.patch(`/appointments/${appointment._id}/status`, { status: "completed" });

      toast.success("Appointment completed and record saved!");
      onDone();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save record");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in">
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h3 className="section-title">Complete Appointment</h3>
            <p className="text-xs text-slate-500 mt-0.5">Patient: {appointment.patient?.name}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400">
            <XCircle size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="label">Diagnosis <span className="text-red-500">*</span></label>
            <input className="input" placeholder="e.g., Common Cold, Hypertension" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} />
          </div>

          <div>
            <label className="label">Symptoms (comma-separated)</label>
            <input className="input" placeholder="e.g., Fever, Headache, Cough" value={symptoms} onChange={(e) => setSymptoms(e.target.value)} />
          </div>

          <div>
            <label className="label">Doctor's Notes <span className="text-red-500">*</span></label>
            <textarea className="input resize-none" rows={4} placeholder="Observations, recommendations, treatment plan…" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          <div>
            <label className="label">Follow-up Date (optional)</label>
            {/* TODO: Add reminder/notification trigger for follow-up */}
            <input type="date" className="input" min={new Date().toISOString().split("T")[0]} value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} />
          </div>

          {/* Prescriptions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="label mb-0">Prescriptions</label>
              <button type="button" onClick={addPrescription} className="btn-outline py-1.5 px-3 text-xs gap-1.5">
                <Plus size={13} /> Add Medication
              </button>
            </div>
            {prescriptions.length === 0 && (
              <p className="text-xs text-slate-400 italic">No prescriptions added</p>
            )}
            <div className="space-y-3">
              {prescriptions.map((p, i) => (
                <div key={i} className="relative bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <button
                    onClick={() => removePrescription(i)}
                    className="absolute top-3 right-3 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                  <div className="grid grid-cols-2 gap-3 pr-6">
                    <div className="col-span-2">
                      <label className="label text-xs">Medication</label>
                      <input className="input text-sm" placeholder="e.g., Paracetamol" value={p.medication}
                        onChange={(e) => updatePrescription(i, "medication", e.target.value)} />
                    </div>
                    <div>
                      <label className="label text-xs">Dosage</label>
                      <input className="input text-sm" placeholder="e.g., 500mg" value={p.dosage}
                        onChange={(e) => updatePrescription(i, "dosage", e.target.value)} />
                    </div>
                    <div>
                      <label className="label text-xs">Frequency</label>
                      <input className="input text-sm" placeholder="e.g., Twice daily" value={p.frequency}
                        onChange={(e) => updatePrescription(i, "frequency", e.target.value)} />
                    </div>
                    <div className="col-span-2">
                      <label className="label text-xs">Duration</label>
                      <input className="input text-sm" placeholder="e.g., 5 days" value={p.duration}
                        onChange={(e) => updatePrescription(i, "duration", e.target.value)} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={handleSubmit} disabled={submitting} className="btn-primary flex-1 justify-center py-3">
              {submitting ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : <><CheckCircle size={16} /> Complete & Save Record</>}
            </button>
            <button onClick={onClose} className="btn-outline">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Appointment row ──────────────────────────────────────────
function AppointmentRow({ appt, onComplete, onCancel }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
        <User size={18} className="text-indigo-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-800 text-sm">{appt.patient?.name}</p>
        <p className="text-xs text-slate-500 truncate">{appt.reason}</p>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Calendar size={11} /> {format(new Date(appt.date), "MMM d, yyyy")}
          </span>
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Clock size={11} /> {appt.time}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <StatusBadge status={appt.status} />
        {appt.status === "scheduled" && (
          <>
            <button onClick={() => onComplete(appt)} className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors">
              Complete
            </button>
            <button onClick={() => onCancel(appt._id)} className="text-xs font-semibold text-red-500 bg-red-50 border border-red-100 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors">
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function DoctorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [appointments,  setAppointments]  = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [tab,           setTab]           = useState("upcoming"); // upcoming | all
  const [modalAppt,     setModalAppt]     = useState(null);

  const fetchAppointments = async () => {
    try {
      const { data } = await api.get("/appointments");
      setAppointments(data);
    } catch {
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAppointments(); }, []);

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this appointment?")) return;
    try {
      await api.patch(`/appointments/${id}/status`, { status: "cancelled" });
      toast.success("Appointment cancelled");
      fetchAppointments();
    } catch {
      toast.error("Failed to cancel");
    }
  };

  const todayAppts    = appointments.filter((a) => a.status === "scheduled" && isToday(new Date(a.date)));
  const upcomingAppts = appointments.filter((a) => a.status === "scheduled");
  const allAppts      = tab === "upcoming" ? upcomingAppts : appointments;

  return (
    <DoctorLayout>
      {/* Welcome */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 p-6 mb-6 text-white">
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10" />
        <p className="text-indigo-200 text-sm font-medium mb-1">
          {format(new Date(), "EEEE, MMMM d")}
        </p>
        <h2 className="font-display text-2xl font-bold mb-1">Welcome, {user?.name?.split(" ").slice(0, 2).join(" ")}!</h2>
        <p className="text-indigo-100 text-sm">
          {todayAppts.length > 0
            ? `You have ${todayAppts.length} appointment${todayAppts.length > 1 ? "s" : ""} today.`
            : "No appointments scheduled for today."}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Today",     value: todayAppts.length,                                    color: "indigo" },
          { label: "Upcoming",  value: upcomingAppts.length,                                 color: "teal"   },
          { label: "Completed", value: appointments.filter((a) => a.status === "completed").length, color: "emerald"},
          { label: "Cancelled", value: appointments.filter((a) => a.status === "cancelled").length, color: "red"    },
        ].map(({ label, value, color }) => (
          <div key={label} className="card p-4">
            <p className="text-muted text-xs">{label}</p>
            <p className={`font-display text-3xl font-bold text-${color}-600 mt-1`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Appointments table */}
      <div className="card">
        <div className="flex items-center gap-1 p-2 border-b border-slate-100">
          {[
            { key: "upcoming", label: "Upcoming" },
            { key: "all",      label: "All Appointments" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 py-2 px-4 rounded-xl text-sm font-semibold transition-all
                ${tab === key ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:text-slate-700"}`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="p-4">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 size={28} className="animate-spin text-indigo-600" />
            </div>
          ) : allAppts.length === 0 ? (
            <EmptyState icon={Calendar} title={tab === "upcoming" ? "No upcoming appointments" : "No appointments yet"} />
          ) : (
            <div className="space-y-3">
              {allAppts.map((appt) => (
                <AppointmentRow
                  key={appt._id}
                  appt={appt}
                  onComplete={setModalAppt}
                  onCancel={handleCancel}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Complete appointment modal */}
      {modalAppt && (
        <CompleteModal
          appointment={modalAppt}
          onClose={() => setModalAppt(null)}
          onDone={fetchAppointments}
        />
      )}
    </DoctorLayout>
  );
}
