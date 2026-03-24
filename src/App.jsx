// src/App.jsx
// ─────────────────────────────────────────────────────────────
// Root component: sets up AuthProvider + all React Router routes
// ─────────────────────────────────────────────────────────────

import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Auth pages
import LoginPage        from "./pages/auth/LoginPage";
import RegisterPage     from "./pages/auth/RegisterPage";

// Patient pages
import PatientDashboard from "./pages/patient/PatientDashboard";
import BookAppointment  from "./pages/patient/BookAppointment";
import MedicalHistory   from "./pages/patient/MedicalHistory";
import Chatbot          from "./pages/patient/Chatbot";

// Doctor pages
import DoctorDashboard  from "./pages/doctor/DoctorDashboard";
import PatientRecords   from "./pages/doctor/PatientRecords";

// Shared
import NotFound         from "./pages/NotFound";
import LoadingScreen    from "./components/shared/LoadingScreen";

// ── Protected route guard ────────────────────────────────────
function ProtectedRoute({ children, allowedRole }) {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!user)   return <Navigate to="/login" replace />;
  if (allowedRole && user.role !== allowedRole) {
    // Redirect to correct dashboard if wrong role
    return <Navigate to={user.role === "doctor" ? "/doctor" : "/patient"} replace />;
  }
  return children;
}

// ── Public route guard (redirect if already logged in) ───────
function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (user) return <Navigate to={user.role === "doctor" ? "/doctor" : "/patient"} replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* ── Public / Auth ─────────────────────────────────── */}
      <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      {/* ── Patient routes ────────────────────────────────── */}
      <Route path="/patient" element={
        <ProtectedRoute allowedRole="patient"><PatientDashboard /></ProtectedRoute>
      } />
      <Route path="/patient/book-appointment" element={
        <ProtectedRoute allowedRole="patient"><BookAppointment /></ProtectedRoute>
      } />
      <Route path="/patient/medical-history" element={
        <ProtectedRoute allowedRole="patient"><MedicalHistory /></ProtectedRoute>
      } />
   {/*<Route path="/patient/chatbot" element={
        <ProtectedRoute allowedRole="patient"><Chatbot /></ProtectedRoute>
      } />*/ }   

      {/* ── Doctor routes ─────────────────────────────────── */}
      <Route path="/doctor" element={
        <ProtectedRoute allowedRole="doctor"><DoctorDashboard /></ProtectedRoute>
      } />
      <Route path="/doctor/patient-records/:patientId" element={
        <ProtectedRoute allowedRole="doctor"><PatientRecords /></ProtectedRoute>
      } />

      {/* ── 404 ───────────────────────────────────────────── */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
