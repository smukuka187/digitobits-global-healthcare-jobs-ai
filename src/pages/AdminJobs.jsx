import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import {
  Lock, Loader2, Plus, UploadCloud, Trash2, Sparkles, FileSpreadsheet,
  CheckCircle2, AlertTriangle, Briefcase, RefreshCw,
} from "lucide-react";
import { COUNTRIES, PROFESSIONS, CURRENCIES, COUNTRY_BY_CODE } from "@/lib/healthcareData";

const WORK_MODES = ["on-site", "hybrid", "remote"];
const PERIODS = ["year", "month", "hour"];
const VISA = ["mentioned", "not_mentioned", "not_available"];
const RELOC = ["available", "not_mentioned", "not_available"];
const INTL = ["accepted", "local_only", "not_mentioned"];
const FRAUD = ["low", "medium", "high"];

const blank = {
  title: "", profession: "", specialization: "", employer: "", employerWebsite: "",
  description: "", requirements: "", country: "", countryName: "", city: "",
  workMode: "on-site", jobType: "", salaryMin: "", salaryMax: "", currency: "USD", salaryPeriod: "year",
  visaSponsorship: "not_mentioned", relocation: "not_mentioned", internationalApplicants: "not_mentioned",
  remoteWorldwide: false, remoteTimezone: "", remoteHours: "",
  registrationRequired: "", qualificationRequired: "", experienceYears: "",
  postedDate: new Date().toISOString().slice(0, 10), source: "Manual", sourceUrl: "",
  fraudRisk: "low", fraudNotes: "",
};

export default function AdminJobs() {
  const { user } = useAuth();
  const [tab, setTab] = useState("add");
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const [uploading, setUploading] = useState(false);
  const [importRes, setImportRes] = useState(null);

  const [jobs, setJobs] = useState([]);
  const [listLoading, setListLoading] = useState(false);

  const [discovering, setDiscovering] = useState(false);
  const [discoveryRes, setDiscoveryRes] = useState(null);

  const u = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const loadList = async () => {
    setListLoading(true);
    try {
      const res = await base44.functions.invoke("ManageJobs", { mode: "list", limit: 100 });
      setJobs(res.data.jobs);
    } catch (e) { setMsg({ type: "error", text: e.message }); }
    finally { setListLoading(false); }
  };

  useEffect(() => {
    if (user?.role === "admin" && tab === "manage" && jobs.length === 0) loadList();
  }, [tab, user]);

  const submitCreate = async () => {
    if (!form.title || !form.profession || !form.country || !form.workMode) {
      setMsg({ type: "error", text: "Title, profession, country and work mode are required." });
      return;
    }
    setSaving(true);
    try {
      const c = COUNTRY_BY_CODE[form.country];
      const payload = { ...form, countryName: form.countryName || c?.name || "" };
      await base44.functions.invoke("ManageJobs", { mode: "create", job: payload });
      setMsg({ type: "success", text: "Job created." });
      setForm(blank);
    } catch (e) { setMsg({ type: "error", text: e.message }); }
    finally { setSaving(false); }
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setImportRes(null);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const res = await base44.functions.invoke("ManageJobs", { mode: "import", fileUrl: file_url });
      setImportRes({ ok: true, ...res.data });
      loadList();
    } catch (err) { setImportRes({ ok: false, error: err.message }); }
    finally { setUploading(false); e.target.value = ""; }
  };

  const removeJob = async (id) => {
    if (!confirm("Delete this job?")) return;
    try {
      await base44.functions.invoke("ManageJobs", { mode: "delete", id });
      setJobs((j) => j.filter((x) => x.id !== id));
    } catch (e) { setMsg({ type: "error", text: e.message }); }
  };

  const runDiscovery = async () => {
    setDiscovering(true);
    setDiscoveryRes(null);
    try {
      const res = await base44.functions.invoke("DiscoverJobs", { focus: "currently open healthcare roles worldwide" });
      setDiscoveryRes({ ok: true, ...res.data });
      loadList();
    } catch (e) { setDiscoveryRes({ ok: false, error: e.message }); }
    finally { setDiscovering(false); }
  };

  if (user?.role !== "admin") {
    return (
      <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-10 text-center">
        <Lock className="mx-auto mb-2 h-8 w-8 text-slate-300" />
        <h1 className="text-lg font-semibold text-slate-900">Admins only</h1>
        <p className="mt-1 text-sm text-slate-500">You need an admin account to manage jobs.</p>
      </div>
    );
  }

  const tabs = [
    { id: "add", label: "Add job", icon: Plus },
    { id: "bulk", label: "Bulk upload", icon: UploadCloud },
    { id: "manage", label: "Manage jobs", icon: FileSpreadsheet },
    { id: "discovery", label: "AI discovery", icon: Sparkles },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Job Management</h1>
        <p className="mt-1 text-sm text-slate-500">Add jobs one by one, bulk upload from a file, manage listings, or let the AI discover jobs online.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-medium transition ${tab === t.id ? "bg-teal-600 text-white" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}
          >
            <t.icon className="h-4 w-4" /> {t.label}
          </button>
        ))}
      </div>

      {msg && (
        <div className={`flex items-center gap-2 rounded-xl p-3 text-sm ${msg.type === "success" ? "border border-teal-200 bg-teal-50 text-teal-700" : "border border-rose-200 bg-rose-50 text-rose-700"}`}>
          {msg.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />} {msg.text}
        </div>
      )}

      {/* Add single job */}
      {tab === "add" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5">
          <Section title="Core details">
            <Grid>
              <Field label="Title *"><input className="inp" value={form.title} onChange={(e) => u("title", e.target.value)} placeholder="Registered Nurse" /></Field>
              <Field label="Profession *">
                <select className="inp" value={form.profession} onChange={(e) => u("profession", e.target.value)}>
                  <option value="">Select</option>
                  {PROFESSIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </Field>
              <Field label="Specialization"><input className="inp" value={form.specialization} onChange={(e) => u("specialization", e.target.value)} /></Field>
              <Field label="Employer"><input className="inp" value={form.employer} onChange={(e) => u("employer", e.target.value)} /></Field>
              <Field label="Employer website"><input className="inp" value={form.employerWebsite} onChange={(e) => u("employerWebsite", e.target.value)} /></Field>
              <Field label="Work mode *">
                <select className="inp" value={form.workMode} onChange={(e) => u("workMode", e.target.value)}>
                  {WORK_MODES.map((w) => <option key={w} value={w}>{w}</option>)}
                </select>
              </Field>
              <Field label="Job type"><input className="inp" value={form.jobType} onChange={(e) => u("jobType", e.target.value)} placeholder="Full-time / Contract" /></Field>
              <Field label="Country *">
                <select className="inp" value={form.country} onChange={(e) => { u("country", e.target.value); const c = COUNTRY_BY_CODE[e.target.value]; if (c) u("countryName", c.name); }}>
                  <option value="">Select</option>
                  {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
                </select>
              </Field>
              <Field label="City"><input className="inp" value={form.city} onChange={(e) => u("city", e.target.value)} /></Field>
            </Grid>
          </Section>

          <Section title="Description & requirements">
            <Field label="Description"><textarea className="inp" rows={4} value={form.description} onChange={(e) => u("description", e.target.value)} /></Field>
            <Field label="Requirements"><textarea className="inp" rows={3} value={form.requirements} onChange={(e) => u("requirements", e.target.value)} /></Field>
          </Section>

          <Section title="Compensation & relocation">
            <Grid>
              <Field label="Salary min"><input type="number" className="inp" value={form.salaryMin} onChange={(e) => u("salaryMin", Number(e.target.value))} /></Field>
              <Field label="Salary max"><input type="number" className="inp" value={form.salaryMax} onChange={(e) => u("salaryMax", Number(e.target.value))} /></Field>
              <Field label="Currency">
                <select className="inp" value={form.currency} onChange={(e) => u("currency", e.target.value)}>
                  {Object.values(CURRENCIES).map((c) => <option key={c.code} value={c.code}>{c.code}</option>)}
                </select>
              </Field>
              <Field label="Salary period">
                <select className="inp" value={form.salaryPeriod} onChange={(e) => u("salaryPeriod", e.target.value)}>
                  {PERIODS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </Field>
              <Field label="Visa sponsorship">
                <select className="inp" value={form.visaSponsorship} onChange={(e) => u("visaSponsorship", e.target.value)}>
                  {VISA.map((v) => <option key={v} value={v}>{v.replace(/_/g, " ")}</option>)}
                </select>
              </Field>
              <Field label="Relocation">
                <select className="inp" value={form.relocation} onChange={(e) => u("relocation", e.target.value)}>
                  {RELOC.map((v) => <option key={v} value={v}>{v.replace(/_/g, " ")}</option>)}
                </select>
              </Field>
              <Field label="International applicants">
                <select className="inp" value={form.internationalApplicants} onChange={(e) => u("internationalApplicants", e.target.value)}>
                  {INTL.map((v) => <option key={v} value={v}>{v.replace(/_/g, " ")}</option>)}
                </select>
              </Field>
              <Field label="Experience (years)"><input type="number" className="inp" value={form.experienceYears} onChange={(e) => u("experienceYears", Number(e.target.value))} /></Field>
            </Grid>
          </Section>

          <Section title="Remote & registration">
            <Grid>
              <Field label="Remote worldwide">
                <select className="inp" value={form.remoteWorldwide ? "yes" : "no"} onChange={(e) => u("remoteWorldwide", e.target.value === "yes")}>
                  <option value="no">No</option><option value="yes">Yes</option>
                </select>
              </Field>
              <Field label="Remote timezone"><input className="inp" value={form.remoteTimezone} onChange={(e) => u("remoteTimezone", e.target.value)} placeholder="UTC±" /></Field>
              <Field label="Remote hours"><input className="inp" value={form.remoteHours} onChange={(e) => u("remoteHours", e.target.value)} /></Field>
              <Field label="Registration required"><input className="inp" value={form.registrationRequired} onChange={(e) => u("registrationRequired", e.target.value)} /></Field>
              <Field label="Qualification required"><input className="inp" value={form.qualificationRequired} onChange={(e) => u("qualificationRequired", e.target.value)} /></Field>
              <Field label="Posted date"><input type="date" className="inp" value={form.postedDate} onChange={(e) => u("postedDate", e.target.value)} /></Field>
              <Field label="Source"><input className="inp" value={form.source} onChange={(e) => u("source", e.target.value)} /></Field>
              <Field label="Source URL"><input className="inp" value={form.sourceUrl} onChange={(e) => u("sourceUrl", e.target.value)} /></Field>
              <Field label="Fraud risk">
                <select className="inp" value={form.fraudRisk} onChange={(e) => u("fraudRisk", e.target.value)}>
                  {FRAUD.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </Field>
              <Field label="Fraud notes"><input className="inp" value={form.fraudNotes} onChange={(e) => u("fraudNotes", e.target.value)} /></Field>
            </Grid>
          </Section>

          <button onClick={submitCreate} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Create job
          </button>
        </div>
      )}

      {/* Bulk upload */}
      {tab === "bulk" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800"><UploadCloud className="h-4 w-4 text-teal-600" /> Bulk upload from CSV / Excel</div>
          <p className="text-sm text-slate-500">Upload a CSV or Excel file. Each row becomes a job. Required columns: <code className="rounded bg-slate-100 px-1">title, profession, country, workMode</code>. Optional: specialization, employer, employerWebsite, description, requirements, city, jobType, salaryMin, salaryMax, currency, salaryPeriod, visaSponsorship, relocation, internationalApplicants, remoteWorldwide, remoteTimezone, remoteHours, registrationRequired, qualificationRequired, experienceYears, postedDate, source, sourceUrl, fraudRisk, fraudNotes.</p>
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 px-4 py-8 text-sm text-slate-500 transition hover:border-teal-400 hover:bg-teal-50/40">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSpreadsheet className="h-5 w-5" />}
            {uploading ? "Processing…" : "Choose CSV / Excel file"}
            <input type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleImport} />
          </label>
          {importRes && (
            <div className={`rounded-xl p-4 text-sm ${importRes.ok ? "border border-teal-200 bg-teal-50 text-teal-700" : "border border-rose-200 bg-rose-50 text-rose-700"}`}>
              {importRes.ok ? (
                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Imported <strong>{importRes.created}</strong> job(s){importRes.skipped ? `, skipped ${importRes.skipped} invalid row(s)` : ""}.</div>
              ) : (
                <div className="flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> {importRes.error}</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Manage jobs */}
      {tab === "manage" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800"><Briefcase className="h-4 w-4 text-teal-600" /> Manage jobs <span className="text-slate-400">({jobs.length})</span></div>
            <button onClick={loadList} disabled={listLoading} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
              <RefreshCw className={`h-3.5 w-3.5 ${listLoading ? "animate-spin" : ""}`} /> Refresh
            </button>
          </div>
          {listLoading ? (
            <div className="flex h-40 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-teal-600" /></div>
          ) : jobs.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">No jobs yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs uppercase text-slate-400">
                    <th className="py-2 pr-3">Title</th><th className="py-2 pr-3">Employer</th><th className="py-2 pr-3">Country</th><th className="py-2 pr-3">Mode</th><th className="py-2 pr-3">Source</th><th className="py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((j) => {
                    const c = COUNTRY_BY_CODE[j.country] || {};
                    return (
                      <tr key={j.id} className="border-b border-slate-50">
                        <td className="py-2 pr-3 font-medium text-slate-800">{j.title}</td>
                        <td className="py-2 pr-3 text-slate-600">{j.employer || "—"}</td>
                        <td className="py-2 pr-3 text-slate-600">{c.flag} {j.countryName || j.country}</td>
                        <td className="py-2 pr-3 text-slate-600">{j.workMode}</td>
                        <td className="py-2 pr-3 text-slate-500">{j.source || "—"}</td>
                        <td className="py-2 text-right">
                          <button onClick={() => removeJob(j.id)} className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50" title="Delete"><Trash2 className="h-4 w-4" /></button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* AI discovery */}
      {tab === "discovery" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800"><Sparkles className="h-4 w-4 text-teal-600" /> AI Job Discovery Agent</div>
          <p className="text-sm text-slate-500">The agent searches the web for currently open, active healthcare job listings worldwide and adds the ones we don't already have — automatically skipping any closed, filled or expired (overdue) postings. It also runs automatically every day at 8am.</p>
          <button onClick={runDiscovery} disabled={discovering} className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60">
            {discovering ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} {discovering ? "Searching the web…" : "Run discovery now"}
          </button>
          {discovering && <p className="text-xs text-slate-400">This performs a live web search via AI and may take 20–40 seconds.</p>}
          {discoveryRes && (
            <div className={`rounded-xl p-4 text-sm ${discoveryRes.ok ? "border border-teal-200 bg-teal-50 text-teal-700" : "border border-rose-200 bg-rose-50 text-rose-700"}`}>
              {discoveryRes.ok ? (
                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Found <strong>{discoveryRes.discovered}</strong> active listing(s); added <strong>{discoveryRes.created}</strong> new job(s){discoveryRes.duplicates ? `, ${discoveryRes.duplicates} already existed` : ""}.</div>
              ) : (
                <div className="flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> {discoveryRes.error}</div>
              )}
            </div>
          )}
        </div>
      )}

      <style>{`.inp{width:100%;border-radius:0.5rem;border:1px solid hsl(var(--border));background:#fff;padding:0.5rem 0.75rem;font-size:0.875rem;outline:none}.inp:focus{border-color:#2dd4bf;box-shadow:0 0 0 2px rgba(45,212,191,0.15)}`}</style>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">{title}</div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
function Grid({ children }) { return <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{children}</div>; }
function Field({ label, children }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</label>
      {children}
    </div>
  );
}