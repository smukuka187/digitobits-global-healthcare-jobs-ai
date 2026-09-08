import React, { useState } from "react";
import { NavLink, Outlet, Link, useNavigate } from "react-router-dom";
import {
  Stethoscope, LayoutDashboard, Search, Bookmark, FileText,
  Users, User, Bell, Menu, X, LogOut
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useLanguage } from "@/lib/i18n";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Layout() {
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const nav = [
    { to: "/", icon: LayoutDashboard, key: "nav_dashboard", end: true },
    { to: "/jobs", icon: Search, key: "nav_jobs" },
    { to: "/saved", icon: Bookmark, key: "nav_saved" },
    { to: "/applications", icon: FileText, key: "nav_applications" },
    { to: "/profiles", icon: Users, key: "nav_profiles" },
    { to: "/profile", icon: User, key: "nav_profile" },
  ];

  const handleLogout = () => logout();

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-sm">
          <Stethoscope className="h-5 w-5" />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-bold text-slate-900">Digitobits</div>
          <div className="text-[11px] text-teal-600">HealthCare Jobs AI</div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {nav.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.end}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive ? "bg-teal-50 text-teal-700" : "text-slate-600 hover:bg-slate-100"
              }`
            }
          >
            <n.icon className="h-4.5 w-4.5" style={{ width: 18, height: 18 }} />
            {t(n.key)}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-100 p-3">
        <div className="mb-2 flex items-center gap-2 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-600">
            {(user?.full_name || user?.email || "U").charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-medium text-slate-700">{user?.full_name || "User"}</div>
            <div className="truncate text-[10px] text-slate-400">{user?.email}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-500 transition hover:bg-slate-100"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/60">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-200 bg-white lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-white shadow-xl">
            <button onClick={() => setOpen(false)} className="absolute right-3 top-4 text-slate-400">
              <X className="h-5 w-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-slate-200 bg-white/80 px-4 backdrop-blur lg:px-8">
          <button onClick={() => setOpen(true)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden">
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-1.5 text-sm text-slate-400">
            <span className="hidden sm:inline">Connecting healthcare professionals to opportunities worldwide</span>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <LanguageSwitcher />
            <button
              onClick={() => navigate("/notifications")}
              className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
              title="Notifications"
            >
              <Bell className="h-4 w-4" />
            </button>
          </div>
        </header>

        <main className="px-4 py-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}