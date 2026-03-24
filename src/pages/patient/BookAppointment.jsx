// src/pages/patient/BookAppointment.jsx
// ─────────────────────────────────────────────────────────────
// Patient selects a doctor, date, time slot, and reason.
// Submits to POST /api/appointments.
// ─────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PatientLayout from "../../components/layout/PatientLayout";
import api from "../../services/api";
import toast from "react-hot-toast";
import {
  User, Calendar, Clock, FileText,
  ChevronRight, Loader2, Stethoscope,
} from "lucide-react";

const TIME_SLOTS = [
  "9:00 AM","10:00 AM","11:00 AM","12:00 PM",
  "2:00 PM","3:00 PM","4:00 PM","5:00 PM",
];

export default function BookAppointment() {
  const navigate = useNavigate();

  const [doctors,        setDoctors]        = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [date,           setDate]           = useState("");
  const [time,           setTime]           = useState("");
  const [reason,         setReason]         = useState("");
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [submitting,     setSubmitting]     = useState(false);
  const [step,           setStep]           = useState(1); // 1=doctor, 2=datetime, 3=confirm

  // ── Load available doctors ───────────────────────────────
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const { data } = await api.get("/users/doctors");
        setDoctors(data);
      } catch {
        toast.error("Failed to load doctors");
      } finally {
        setLoadingDoctors(false);
      }
    };
    fetchDoctors();
  }, []);

  // ── Submit appointment ───────────────────────────────────
  const handleSubmit = async () => {
    if (!selectedDoctor || !date || !time || !reason.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/appointments", {
        doctorId: selectedDoctor._id,
        date,
        time,
        reason,
      });
      toast.success("Appointment booked successfully!");
      navigate("/patient");
    } catch (err) {
      toast.error(err.response?.data?.message || "Booking failed");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Step indicator ───────────────────────────────────────
  const steps = ["Choose Doctor", "Date & Time", "Confirm"];

  return (
    <PatientLayout>
      <div className="mb-6">
        <h2 className="page-title">Book an Appointment</h2>
        <p className="text-muted mt-1">Schedule a consultation with our specialists</p>
      </div>

      {/* Progress steps */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`flex items-center gap-2 ${i + 1 <= step ? "text-teal-600" : "text-slate-400"}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all
                ${i + 1 < step  ? "bg-teal-600 border-teal-600 text-white"
                : i + 1 === step ? "border-teal-600 text-teal-600"
                :                  "border-slate-200 text-slate-400"}`}>
                {i + 1 < step ? "✓" : i + 1}
              </div>
              <span className="text-xs font-medium hidden sm:block">{s}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 w-8 ${i + 1 < step ? "bg-teal-600" : "bg-slate-200"}`} />
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Step 1: Select doctor ──────────────────────── */}
        <div className={`lg:col-span-1 card overflow-hidden ${step !== 1 && step !== 3 ? "hidden lg:block" : ""}`}>
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="section-title">Available Doctors</h3>
          </div>
          <div className="p-3 space-y-2 max-h-[440px] overflow-y-auto">
            {loadingDoctors ? (
              <div className="flex justify-center py-12">
                <Loader2 size={24} className="animate-spin text-teal-600" />
              </div>
            ) : doctors.length === 0 ? (
              <p className="text-center text-slate-500 py-8 text-sm">No doctors available</p>
            ) : (
              doctors.map((doc) => (
                <button
                  key={doc._id}
                  onClick={() => { setSelectedDoctor(doc); setStep(2); }}
                  className={`w-full text-left p-3 rounded-xl border-2 transition-all
                    ${selectedDoctor?._id === doc._id
                      ? "border-teal-500 bg-teal-50"
                      : "border-transparent bg-slate-50 hover:border-teal-200 hover:bg-teal-50/50"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                      <User size={16} className="text-teal-700" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 text-sm truncate">{doc.name}</p>
                      <p className="text-xs text-teal-600">{doc.specialization}</p>
                      {doc.experience > 0 && (
                        <p className="text-xs text-slate-400">{doc.experience} yrs experience</p>
                      )}
                    </div>
                    {selectedDoctor?._id === doc._id && (
                      <ChevronRight size={16} className="ml-auto text-teal-500 flex-shrink-0" />
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* ── Step 2: Date, time, reason ─────────────────── */}
        <div className={`lg:col-span-2 card ${step === 1 ? "hidden lg:block" : ""}`}>
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
            <Stethoscope size={18} className="text-teal-600" />
            <h3 className="section-title">
              {selectedDoctor ? `Booking with ${selectedDoctor.name}` : "Appointment Details"}
            </h3>
          </div>

          <div className="p-6 space-y-5">
            {/* Date */}
            <div>
              <label className="label flex items-center gap-2">
                <Calendar size={15} className="text-teal-600" /> Appointment Date
              </label>
              <input
                type="date"
                className="input"
                value={date}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => { setDate(e.target.value); setStep(Math.max(step, 2)); }}
              />
            </div>

            {/* Time slots */}
            <div>
              <label className="label flex items-center gap-2">
                <Clock size={15} className="text-teal-600" /> Preferred Time
              </label>
              {/* TODO: Fetch real available slots from doctor's schedule */}
              <div className="grid grid-cols-4 gap-2">
                {TIME_SLOTS.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setTime(slot)}
                    className={`py-2 px-2 rounded-xl text-xs font-semibold border-2 transition-all
                      ${time === slot
                        ? "border-teal-500 bg-teal-50 text-teal-700"
                        : "border-slate-200 text-slate-600 hover:border-teal-300"
                      }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="label flex items-center gap-2">
                <FileText size={15} className="text-teal-600" /> Reason for Visit
              </label>
              <textarea
                className="input resize-none"
                rows={4}
                placeholder="Describe your symptoms or reason for the consultation…"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            {/* Confirmation summary */}
            {selectedDoctor && date && time && (
              <div className="bg-teal-50 border border-teal-100 rounded-xl p-4">
                <p className="text-xs font-semibold text-teal-700 mb-2 uppercase tracking-wide">Summary</p>
                <div className="space-y-1 text-sm text-teal-800">
                  <p><span className="font-medium">Doctor:</span> {selectedDoctor.name} ({selectedDoctor.specialization})</p>
                  <p><span className="font-medium">Date:</span> {new Date(date).toLocaleDateString("en-US", { weekday:"long", year:"numeric", month:"long", day:"numeric" })}</p>
                  <p><span className="font-medium">Time:</span> {time}</p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSubmit}
                disabled={submitting || !selectedDoctor || !date || !time || !reason.trim()}
                className="btn-primary flex-1 justify-center py-3"
              >
                {submitting
                  ? <><Loader2 size={16} className="animate-spin" /> Booking…</>
                  : "Confirm Appointment"
                }
              </button>
              <button onClick={() => navigate("/patient")} className="btn-outline">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </PatientLayout>
  );
}
