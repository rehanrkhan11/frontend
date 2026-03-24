// src/components/shared/LoadingScreen.jsx
// Full-page loading spinner shown while auth session is being restored

export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-teal-100 border-t-teal-600 animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Loading…</p>
      </div>
    </div>
  );
}
