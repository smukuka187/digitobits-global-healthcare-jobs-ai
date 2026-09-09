import React from "react";
import { Link } from "react-router-dom";
import { Stethoscope } from "lucide-react";

export default function PublicFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white">
                <Stethoscope className="h-4 w-4" />
              </div>
              <div className="leading-tight">
                <div className="text-sm font-bold text-slate-900">Digitobits</div>
                <div className="text-[10px] text-teal-600">HealthCare Jobs AI</div>
              </div>
            </div>
            <p className="mt-3 text-sm text-slate-500">
              AI-powered global healthcare job board connecting professionals with on-site, hybrid, and remote opportunities worldwide.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:gap-12">
            <div>
              <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Platform</div>
              <ul className="space-y-2 text-sm">
                <li><Link to="/jobs-board" className="text-slate-600 hover:text-teal-600">Browse Jobs</Link></li>
                <li><Link to="/register" className="text-slate-600 hover:text-teal-600">Get Started</Link></li>
                <li><Link to="/login" className="text-slate-600 hover:text-teal-600">Sign In</Link></li>
              </ul>
            </div>
            <div>
              <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Company</div>
              <ul className="space-y-2 text-sm">
                <li><Link to="/about" className="text-slate-600 hover:text-teal-600">About</Link></li>
                <li><Link to="/contact" className="text-slate-600 hover:text-teal-600">Contact</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-slate-100 pt-6 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} Digitobits Global HealthCare Jobs AI. All rights reserved.
        </div>
      </div>
    </footer>
  );
}