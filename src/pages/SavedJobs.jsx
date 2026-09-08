import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Bookmark, Trash2, ChevronRight } from "lucide-react";
import { COUNTRY_BY_CODE } from "@/lib/healthcareData";

export default function SavedJobs() {
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try { setSaved(await base44.entities.SavedJob.list("-created_date")); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const remove = async (id) => {
    await base44.entities.SavedJob.delete(id);
    setSaved((s) => s.filter((x) => x.id !== id));
  };

  if (loading) return <div className="flex h-96 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-teal-600" /></div>;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Saved Jobs</h1>
        <p className="mt-1 text-sm text-slate-500">Opportunities you've bookmarked.</p>
      </div>
      {saved.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <Bookmark className="mx-auto mb-2 h-8 w-8 text-slate-300" />
          <p className="text-slate-500">No saved jobs yet.</p>
          <Link to="/jobs" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-teal-600 hover:underline">Browse jobs <ChevronRight className="h-4 w-4" /></Link>
        </div>
      ) : (
        <div className="space-y-3">
          {saved.map((s) => {
            const c = COUNTRY_BY_CODE[s.country] || {};
            return (
              <div key={s.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4">
                <Link to={`/jobs/${s.jobId}`} className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-slate-900 hover:text-teal-700">{s.jobTitle}</div>
                  <div className="text-xs text-slate-500">{s.employer} · {c.flag} {s.countryName} · {s.workMode}</div>
                  {s.matchScore != null && <div className="mt-1 text-xs text-teal-600">Match {s.matchScore}%</div>}
                </Link>
                <button onClick={() => remove(s.id)} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 className="h-4 w-4" /></button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}