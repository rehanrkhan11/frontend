// src/pages/patient/MedicalHistory.jsx
// ─────────────────────────────────────────────────────────────
// Shows the patient's full medical history including
// diagnoses, doctor notes, and prescriptions.
// Fetches from GET /api/medical-records
// ─────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import PatientLayout from "../../components/layout/PatientLayout";
import EmptyState    from "../../components/shared/EmptyState";
import api           from "../../services/api";
import toast         from "react-hot-toast";
import {
  FileText, Pill, ChevronDown, ChevronUp,
  Loader2, Calendar, User, Stethoscope,
} from "lucide-react";
import { format } from "date-fns";

function PrescriptionCard({ prescription }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-violet-50 rounded-xl border border-violet-100">
      <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Pill size={14} className="text-violet-600" />
      </div>
      <div className="min-w-0">
        <p className="font-semibold text-slate-800 text-sm">{prescription.medication}</p>
        <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1">
          <span className="text-xs text-slate-500">Dosage: <span className="font-medium text-slate-700">{prescription.dosage}</span></span>
          <span className="text-xs text-slate-500">Frequency: <span className="font-medium text-slate-700">{prescription.frequency}</span></span>
          <span className="text-xs text-slate-500">Duration: <span className="font-medium text-slate-700">{prescription.duration}</span></span>
        </div>
        {prescription.instructions && (
          <p className="text-xs text-amber-600 mt-1 italic">{prescription.instructions}</p>
        )}
      </div>
    </div>
  );
}

function RecordCard({ record }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <button
        className="w-full flex items-center gap-4 p-5 hover:bg-slate-50 transition-colors text-left"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="w-11 h-11 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
          <Stethoscope size={20} className="text-violet-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-slate-900">{record.diagnosis}</h4>
          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <User size={12} /> {record.doctor?.name}
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <Calendar size={12} /> {format(new Date(record.date), "MMMM d, yyyy")}
            </span>
            {record.prescriptions?.length > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 text-xs font-medium">
                <Pill size={11} /> {record.prescriptions.length} prescription{record.prescriptions.length > 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
        {expanded
          ? <ChevronUp size={18} className="text-slate-400 flex-shrink-0" />
          : <ChevronDown size={18} className="text-slate-400 flex-shrink-0" />
        }
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-slate-100 space-y-4 pt-4 animate-in">
          {/* Notes */}
          {record.notes && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Doctor's Notes</p>
              <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 rounded-xl p-3">{record.notes}</p>
            </div>
          )}

          {/* Symptoms */}
          {record.symptoms?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Symptoms</p>
              <div className="flex flex-wrap gap-2">
                {record.symptoms.map((s, i) => (
                  <span key={i} className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-medium border border-amber-100">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Prescriptions */}
          {record.prescriptions?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Prescriptions</p>
              <div className="space-y-2">
                {record.prescriptions.map((p) => (
                  <PrescriptionCard key={p._id} prescription={p} />
                ))}
              </div>
            </div>
          )}

          {/* Follow-up */}
          {record.followUpDate && (
            <div className="flex items-center gap-2 text-sm text-teal-700 bg-teal-50 rounded-xl p-3">
              <Calendar size={15} />
              <span>Follow-up scheduled: <strong>{format(new Date(record.followUpDate), "MMMM d, yyyy")}</strong></span>
            </div>
          )}

          {/* TODO: Add download as PDF button */}
          {/* <button className="btn-outline text-xs">Download PDF</button> */}
        </div>
      )}
    </div>
  );
}

export default function MedicalHistory() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const { data } = await api.get("/medical-records");
        setRecords(data);
      } catch {
        toast.error("Failed to load medical records");
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, []);

  const filtered = records.filter(
    (r) =>
      r.diagnosis?.toLowerCase().includes(search.toLowerCase()) ||
      r.doctor?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PatientLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="page-title">Medical History</h2>
          <p className="text-muted mt-1">Your complete consultation and prescription history</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <input
          className="input pl-10"
          placeholder="Search by diagnosis or doctor name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <FileText size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={28} className="animate-spin text-teal-600" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={search ? "No matching records" : "No medical records yet"}
          description={search ? "Try a different search term." : "Your records will appear here after a consultation."}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((record) => (
            <RecordCard key={record._id} record={record} />
          ))}
        </div>
      )}
    </PatientLayout>
  );
}
