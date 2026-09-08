import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { FileText, Send, Award, Clock, ChevronRight } from "lucide-react";

const STATUS_OPTIONS = ["discovered", "saved", "reviewing", "prepared", "awaiting_approval", "applied", "assessment", "interview", "second_interview", "offer", "rejected", "withdrawn"];
const STAGE_COLORS = {
  prepared: "bg-blue-50 text-blue-700", awaiting_approval: "bg-amber-50 text-amber-700",
  applied: "bg-teal-50 text-teal-700", assessment: "bg-violet-50 text-violet-700",
  interview: "bg-indigo-50 text-indigo-700", second_interview: "bg-indigo-50 text-indigo-700",
  offer: "bg-emerald-50 text-emerald-700", rejected: "bg-rose-50 text-rose-700", withdrawn: "bg-slate-100 text-slate-500"
};

export default function Applications() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      setApps(await base44.entities.Application.list("-updated_date"));
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const stats = useMemo(() => ({
    total: apps.length,
    applied: apps.filter((a) => ["applied", "assessment", "interview", "second_interview", "offer"].includes(a.status)).length,
    interviews: apps.filter((a) => ["interview", "second_interview"].includes(a.status)).length,
    offers: apps.filter((a) => a.status === "offer").length,
    pending: apps.filter((a) => ["prepared", "awaiting_approval"].includes(a.status)).length,
  }), [apps]);

  const updateStatus = async (id, status) => {
    const updated = await base44.entities.Application.update(id, { status });
    setApps((a) => a.map((x) => (x.id === id ? updated : x)));
  };

  if (loading) return <div className="flex h-96 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-teal-600" /></div>;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Application Tracker</h1>
        <p className="mt-1 text-sm text-slate-500">Track every application from discovery to offer.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {[
          { label: "Total", value: stats.total, icon: FileText, c: "text-slate-600 bg-slate-100" },
          { label: "Applied", value: stats.applied, icon: Send, c: "text-teal-600 bg-teal-50" },
          { label: "Pending approval", value: stats.pending, icon: Clock, c: "text-amber-600 bg-amber-50" },
          { label: "Interviews", value: stats.interviews, icon: FileText, c: "text-indigo-600 bg-indigo-50" },
          { label: "Offers", value: stats.offers, icon: Award, c: "text-emerald-600 bg-emerald-50" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className={`mb-2 inline-flex h-9 w-9 items-center justify-center rounded-xl ${s.c}`}><s.icon className="h-4 w-4" /></div>
            <div className="text-2xl font-bold text-slate-900">{s.value}</div>
            <div className="text-xs text-slate-500">{s.label}</div>
          </div>
        ))}
      </div>

      {apps.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <FileText className="mx-auto mb-2 h-8 w-8 text-slate-300" />
          <p className="text-slate-500">No applications yet.</p>
          <Link to="/jobs" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-teal-600 hover:underline">Find jobs <ChevronRight className="h-4 w-4" /></Link>
        </div>
      ) : (
        <div className="space-y-3">
          {apps.map((a) => (
            <div key={a.id} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <Link to={`/jobs/${a.jobId}`} className="text-sm font-semibold text-slate-900 hover:text-teal-700">{a.jobTitle}</Link>
                  <div className="text-xs text-slate-500">{a.employer} · {a.countryName || ""} · {a.workMode}</div>
                  {a.matchScore != null && <div className="mt-1 text-xs text-teal-600">Match {a.matchScore}%</div>}
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${STAGE_COLORS[a.status] || "bg-slate-100 text-slate-600"}`}>{a.status.replace(/_/g, " ")}</span>
                  <select value={a.status} onChange={(e) => updateStatus(a.id, e.target.value)} className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs capitalize">
                    {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
                  </select>
                  <Link to={`/jobs/${a.jobId}`} className="text-xs text-teal-600 hover:underline">View</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}