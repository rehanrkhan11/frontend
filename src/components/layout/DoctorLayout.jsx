// src/components/layout/DoctorLayout.jsx
// ─────────────────────────────────────────────────────────────
// Sidebar + topbar shell for all Doctor pages
// ─────────────────────────────────────────────────────────────

import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard, Users, LogOut, Menu, X,
  Stethoscope, Bell, ChevronRight,
} from "lucide-react";

const navItems = [
  { to: "/doctor",         icon: LayoutDashboard, label: "Dashboard"      },
  { to: "/doctor/patients", icon: Users,           label: "My Patients"   },
];

export default function DoctorLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const Sidebar = ({ mobile = false }) => (
    <aside
      className={`flex flex-col h-full bg-white border-r border-slate-100
        ${mobile ? "w-72 shadow-2xl" : "w-64"}`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
        <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center flex-shrink-0">
          <Stethoscope size={18} className="text-white" />
        </div>
        <div>
          <p className="font-display font-bold text-slate-900 leading-none">HealthCare+</p>
          <p className="text-xs text-indigo-600 font-medium mt-0.5">Doctor Portal</p>
        </div>
        {mobile && (
          <button onClick={() => setSidebarOpen(false)} className="ml-auto text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Doctor info */}
      <div className="px-4 py-4 border-b border-slate-100">
        <div className="flex items-center gap-3 px-2 py-2.5 rounded-xl bg-slate-50">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm flex-shrink-0">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">{user?.name}</p>
            <p className="text-xs text-indigo-600 truncate">{user?.specialization || "Doctor"}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/doctor"}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
              ${isActive
                ? "bg-indigo-50 text-indigo-700"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={18} className={isActive ? "text-indigo-600" : "text-slate-400"} />
                {label}
                {isActive && <ChevronRight size={14} className="ml-auto text-indigo-400" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                     text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <LogOut size={18} />
          Log out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar />
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-50"><Sidebar mobile /></div>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-slate-100 px-4 lg:px-6 h-14 flex items-center gap-4 flex-shrink-0">
          <button className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-600" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>
          <div className="flex-1" />
          {/* TODO: Wire up real notifications */}
          <button className="relative p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
            <Bell size={18} />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="max-w-5xl mx-auto animate-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
