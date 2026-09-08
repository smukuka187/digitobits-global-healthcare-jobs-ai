import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Trash2, Users, X, Loader2 } from "lucide-react";
import { COUNTRIES, PROFESSIONS, JOB_TYPES, WORK_MODES } from "@/lib/healthcareData";

export default function SearchProfiles() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", countries: [], profession: "", jobType: "", workMode: "", remoteOnly: false, active: true });

  const load = async () => {
    setLoading(true);
    try { setProfiles(await base44.entities.SearchProfile.list("-created_date")); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!form.name) return;
    setSaving(true);
    try {
      await base44.entities.SearchProfile.create(form);
      setForm({ name: "", countries: [], profession: "", jobType: "", workMode: "", remoteOnly: false, active: true });
      setShowForm(false);
      await load();
    } catch (e) { alert(e.message); } finally { setSaving(false); }
  };

  const remove = async (id) => { await base44.entities.SearchProfile.delete(id); setProfiles((p) => p.filter((x) => x.id !== id)); };
  const toggleCountry = (code) => setForm((f) => ({ ...f, countries: f.countries.includes(code) ? f.countries.filter((c) => c !== code) : [...f.countries, code] }));

  if (loading) return <div className="flex h-96 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-teal-600" /></div>;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Search Profiles</h1>
          <p className="mt-1 text-sm text-slate-500">Create multiple saved searches for different goals.</p>
        </div>
        <button onClick={() => setShowForm((s) => !s)} className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700">
          <Plus className="h-4 w-4" /> New profile
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">New search profile</h2>
            <button onClick={() => setShowForm(false)}><X className="h-4 w-4 text-slate-400" /></button>
          </div>
          <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Profile name (e.g. UK Nursing)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-slate-400">Countries</label>
            <div className="flex flex-wrap gap-1.5">
              {COUNTRIES.map((c) => (
                <button key={c.code} onClick={() => toggleCountry(c.code)} className={`rounded-lg border px-2 py-1 text-xs ${form.countries.includes(c.code) ? "border-teal-500 bg-teal-50 text-teal-700" : "border-slate-200 text-slate-600"}`}>
                  {c.flag} {c.name}
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <select className="rounded-lg border border-slate-200 px-3 py-2 text-sm" value={form.profession} onChange={(e) => setForm({ ...form, profession: e.target.value })}>
              <option value="">Profession</option>
              {PROFESSIONS.map((p) => <option key={p.category} value={p.category}>{p.category}</option>)}
            </select>
            <select className="rounded-lg border border-slate-200 px-3 py-2 text-sm" value={form.jobType} onChange={(e) => setForm({ ...form, jobType: e.target.value })}>
              <option value="">Job type</option>
              {JOB_TYPES.map((j) => <option key={j} value={j}>{j}</option>)}
            </select>
            <select className="rounded-lg border border-slate-200 px-3 py-2 text-sm" value={form.workMode} onChange={(e) => setForm({ ...form, workMode: e.target.value })}>
              <option value="">Work mode</option>
              {WORK_MODES.map((w) => <option key={w} value={w}>{w}</option>)}
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" checked={form.remoteOnly} onChange={(e) => setForm({ ...form, remoteOnly: e.target.checked })} className="rounded border-slate-300 text-teal-600" /> Remote only</label>
          <button onClick={create} disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Save profile
          </button>
        </div>
      )}

      {profiles.length === 0 && !showForm ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <Users className="mx-auto mb-2 h-8 w-8 text-slate-300" />
          <p className="text-slate-500">No search profiles yet.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {profiles.map((p) => (
            <div key={p.id} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm font-semibold text-slate-900">{p.name}</div>
                  <div className="mt-1 text-xs text-slate-500">{p.profession || "Any profession"} · {p.jobType || "Any type"} · {p.workMode || "Any mode"}</div>
                </div>
                <button onClick={() => remove(p.id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 className="h-4 w-4" /></button>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {(p.countries || []).map((c) => { const co = COUNTRIES.find((x) => x.code === c); return co ? <span key={c} className="text-base">{co.flag}</span> : null; })}
                {!p.countries?.length && <span className="text-xs text-slate-400">Worldwide</span>}
                {p.remoteOnly && <span className="rounded-full bg-teal-50 px-2 py-0.5 text-xs text-teal-700">Remote only</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}