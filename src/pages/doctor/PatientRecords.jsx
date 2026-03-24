// src/pages/doctor/PatientRecords.jsx
// ─────────────────────────────────────────────────────────────
// Doctor views the full medical history of a specific patient.
// Route: /doctor/patient-records/:patientId
// ─────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DoctorLayout from "../../components/layout/DoctorLayout";
import EmptyState   from "../../components/shared/EmptyState";
import api          from "../../services/api";
import toast        from "react-hot-toast";
import {
  FileText, Pill, ArrowLeft, Loader2,
  Calendar, User, Stethoscope, ChevronDown, ChevronUp,
} from "lucide-react";
import { format } from "date-fns";

function RecordCard({ record }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card overflow-hidden">
      <button
        className="w-full flex items-center gap-4 p-5 hover:bg-slate-50 transition-colors text-left"
        onClick={() => setOpen(!open)}
      >
        <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
          <Stethoscope size={18} className="text-indigo-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-900">{record.diagnosis}</p>
          <p className="text-xs text-slate-500 mt-0.5">
            {format(new Date(record.date), "MMMM d, yyyy")} · {record.prescriptions?.length || 0} prescription(s)
          </p>
        </div>
        {open ? <ChevronUp size={18} className="text-slate-400 flex-shrink-0" /> : <ChevronDown size={18} className="text-slate-400 flex-shrink-0" />}
      </button>

      {open && (
        <div className="px-5 pb-5 pt-4 border-t border-slate-100 space-y-4 animate-in">
          {record.notes && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Notes</p>
              <p className="text-sm text-slate-700 bg-slate-50 rounded-xl p-3 leading-relaxed">{record.notes}</p>
            </div>
          )}
          {record.symptoms?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Symptoms</p>
              <div className="flex flex-wrap gap-2">
                {record.symptoms.map((s, i) => (
                  <span key={i} className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-medium border border-amber-100">{s}</span>
                ))}
              </div>
            </div>
          )}
          {record.prescriptions?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Prescriptions</p>
              <div className="space-y-2">
                {record.prescriptions.map((p, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-violet-50 rounded-xl border border-violet-100">
                    <Pill size={15} className="text-violet-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{p.medication}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{p.dosage} · {p.frequency} · {p.duration}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function PatientRecords() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [records,  setRecords]  = useState([]);
  const [patient,  setPatient]  = useState(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get(`/medical-records?patientId=${patientId}`);
        setRecords(data);
        if (data.length > 0) setPatient(data[0].patient);
      } catch {
        toast.error("Failed to load patient records");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [patientId]);

  return (
    <DoctorLayout>
      <button onClick={() => navigate("/doctor")} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-5 transition-colors">
        <ArrowLeft size={16} /> Back to dashboard
      </button>

      {/* Patient info header */}
      {patient && (
        <div className="card p-5 mb-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <User size={22} className="text-indigo-600" />
          </div>
          <div>
            <h2 className="page-title leading-none">{patient.name}</h2>
            <div className="flex gap-4 mt-1">
              <span className="text-xs text-slate-500">{patient.email}</span>
              {patient.bloodGroup && (
                <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                  {patient.bloodGroup}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h3 className="section-title">Medical Records ({records.length})</h3>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={28} className="animate-spin text-indigo-600" />
        </div>
      ) : records.length === 0 ? (
        <EmptyState icon={FileText} title="No medical records" description="No records found for this patient yet." />
      ) : (
        <div className="space-y-3">
          {records.map((r) => <RecordCard key={r._id} record={r} />)}
        </div>
      )}
    </DoctorLayout>
  );
}
