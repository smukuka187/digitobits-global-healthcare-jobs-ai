import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import {
  Upload, Loader2, Sparkles, Award, FileText, BadgeCheck, Save, Plus, X
} from "lucide-react";
import { COUNTRIES, PROFESSIONS, ALL_SPECIALIZATIONS, CURRENCIES } from "@/lib/healthcareData";
import MatchRing from "@/components/MatchRing";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [scoring, setScoring] = useState(false);
  const [saving, setSaving] = useState(false);
  const [employability, setEmployability] = useState(null);

  const blank = {
    fullName: "", professionalTitle: "", qualifications: [], certifications: [],
    registrationType: "", registrationNumber: "", registrationCountry: "", licenseExpiry: "",
    yearsExperience: 0, specialties: [], clinicalExperience: "", languages: [],
    location: "", locationName: "", workAuthorization: "", availability: "",
    preferredCountries: [], cvUrl: "", cvAnalysis: null, employabilityScore: null, employabilityBreakdown: null
  };
  const [form, setForm] = useState(blank);

  const load = async () => {
    setLoading(true);
    try {
      const list = await base44.entities.CandidateProfile.list();
      const p = list[0] || null;
      setProfile(p);
      setForm({ ...blank, ...(p || {}) });
      if (p?.employabilityBreakdown) setEmployability({ score: p.employabilityScore, breakdown: p.employabilityBreakdown });
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const updateArr = (k, v) => setForm((f) => ({ ...f, [k]: Array.isArray(v) ? v : v.split(",").map((s) => s.trim()).filter(Boolean) }));

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      update("cvUrl", file_url);
      await analyze(file_url);
    } catch (err) { alert("Upload failed: " + err.message); }
    finally { setUploading(false); }
  };

  const analyze = async (cvUrl) => {
    setAnalyzing(true);
    try {
      const res = await base44.functions.invoke("AnalyzeCV", { cvUrl });
      const a = res.data.analysis;
      setForm((f) => ({
        ...f,
        cvUrl,
        fullName: a.fullName || f.fullName,
        professionalTitle: a.professionalTitle || f.professionalTitle,
        qualifications: a.qualifications || f.qualifications,
        certifications: a.certifications || f.certifications,
        registrationType: a.registrationType || f.registrationType,
        registrationNumber: a.registrationNumber || f.registrationNumber,
        registrationCountry: a.registrationCountry || f.registrationCountry,
        yearsExperience: a.yearsExperience ?? f.yearsExperience,
        specialties: a.specialties || f.specialties,
        clinicalExperience: a.clinicalExperience || f.clinicalExperience,
        languages: a.languages || f.languages,
        location: a.location || f.location,
        workAuthorization: a.workAuthorization || f.workAuthorization,
        availability: a.availability || f.availability,
        cvAnalysis: a
      }));
    } catch (err) { alert("AI analysis failed: " + err.message); }
    finally { setAnalyzing(false); }
  };

  const save = async () => {
    setSaving(true);
    try {
      if (profile) {
        const updated = await base44.entities.CandidateProfile.update(profile.id, form);
        setProfile(updated);
      } else {
        const created = await base44.entities.CandidateProfile.create(form);
        setProfile(created);
      }
    } catch (err) { alert("Save failed: " + err.message); }
    finally { setSaving(false); }
  };

  const computeEmployability = async () => {
    setScoring(true);
    try {
      const res = await base44.functions.invoke("JobAssistant", { mode: "employability", profile: form });
      const r = res.data.result;
      setEmployability(r);
      const updated = { ...form, employabilityScore: r.score, employabilityBreakdown: r.breakdown };
      setForm(updated);
      if (profile) {
        const u = await base44.entities.CandidateProfile.update(profile.id, { employabilityScore: r.score, employabilityBreakdown: r.breakdown });
        setProfile(u);
      }
    } catch (err) { alert("Scoring failed: " + err.message); }
    finally { setScoring(false); }
  };

  if (loading) return <div className="flex h-96 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-teal-600" /></div>;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
        <p className="mt-1 text-sm text-slate-500">Build your candidate profile. Upload your CV and let AI extract the details.</p>
      </div>

      {/* CV upload + employability */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800"><FileText className="h-4 w-4 text-teal-600" /> CV</div>
          {form.cvUrl ? (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <a href={form.cvUrl} target="_blank" rel="noreferrer" className="truncate text-teal-600 hover:underline">View uploaded CV</a>
              <button onClick={() => analyze(form.cvUrl)} disabled={analyzing} className="ml-auto inline-flex items-center gap-1 text-xs text-teal-600 hover:underline disabled:opacity-50">
                {analyzing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />} Re-analyze
              </button>
            </div>
          ) : (
            <p className="text-xs text-slate-400">PDF, DOCX or TXT</p>
          )}
          <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 px-4 py-4 text-sm text-slate-500 transition hover:border-teal-400 hover:bg-teal-50/40">
            {uploading || analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {uploading ? "Uploading…" : analyzing ? "AI analyzing CV…" : "Upload CV & analyze"}
            <input type="file" accept=".pdf,.docx,.txt,.doc" className="hidden" onChange={handleUpload} />
          </label>
          {form.cvAnalysis?.summary && <div className="mt-3 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">{form.cvAnalysis.summary}</div>}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800"><Award className="h-4 w-4 text-teal-600" /> Employability score</div>
          <div className="flex items-center gap-4">
            <MatchRing score={form.employabilityScore || 0} size={72} stroke={7} />
            <button onClick={computeEmployability} disabled={scoring} className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-2 text-xs font-semibold text-white hover:bg-teal-700 disabled:opacity-60">
              {scoring ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />} {form.employabilityScore ? "Recompute" : "Compute"}
            </button>
          </div>
          {employability?.breakdown && (
            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1.5">
              {Object.entries(employability.breakdown).map(([k, v]) => (
                <div key={k} className="flex justify-between text-xs"><span className="text-slate-500 capitalize">{k.replace(/([A-Z])/g, " $1")}</span><span className="font-semibold">{v}</span></div>
              ))}
            </div>
          )}
          {employability?.recommendations?.length > 0 && (
            <div className="mt-3 rounded-lg bg-slate-50 p-3"><div className="mb-1 text-xs font-semibold text-slate-600">Recommendations</div><ul className="list-inside list-disc text-xs text-slate-500">{employability.recommendations.map((r, n) => <li key={n}>{r}</li>)}</ul></div>
          )}
        </div>
      </div>

      {/* Form */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name"><input className="inp" value={form.fullName} onChange={(e) => update("fullName", e.target.value)} /></Field>
          <Field label="Professional title"><input className="inp" value={form.professionalTitle} onChange={(e) => update("professionalTitle", e.target.value)} placeholder="e.g. Registered Nurse" /></Field>
          <Field label="Years of experience"><input type="number" className="inp" value={form.yearsExperience} onChange={(e) => update("yearsExperience", Number(e.target.value))} /></Field>
          <Field label="Location (country)">
            <select className="inp" value={form.location} onChange={(e) => update("location", e.target.value)}>
              <option value="">Select</option>
              {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
            </select>
          </Field>
        </div>

        <Field label="Qualifications (comma separated)">
          <input className="inp" value={(form.qualifications || []).join(", ")} onChange={(e) => updateArr("qualifications", e.target.value)} placeholder="BSc Nursing, Diploma in Midwifery" />
        </Field>
        <Field label="Certifications (comma separated)">
          <input className="inp" value={(form.certifications || []).join(", ")} onChange={(e) => updateArr("certifications", e.target.value)} placeholder="BLS, ACLS, Infection Control" />
        </Field>
        <Field label="Specialties (comma separated)">
          <input className="inp" value={(form.specialties || []).join(", ")} onChange={(e) => updateArr("specialties", e.target.value)} placeholder="ICU, Geriatric, Emergency" />
        </Field>
        <Field label="Languages (comma separated)">
          <input className="inp" value={(form.languages || []).join(", ")} onChange={(e) => updateArr("languages", e.target.value)} placeholder="English, French, Bemba" />
        </Field>
        <Field label="Clinical / care experience">
          <textarea className="inp" rows={3} value={form.clinicalExperience} onChange={(e) => update("clinicalExperience", e.target.value)} placeholder="Hospital, care-home, elderly-care, pandemic response…" />
        </Field>
        <Field label="Preferred countries (comma separated codes, e.g. GB, CA)">
          <input className="inp" value={(form.preferredCountries || []).join(", ")} onChange={(e) => updateArr("preferredCountries", e.target.value)} />
        </Field>

        {/* Registration */}
        <div className="rounded-xl bg-slate-50 p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800"><BadgeCheck className="h-4 w-4 text-teal-600" /> Professional registration</div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Registration type"><input className="inp" value={form.registrationType} onChange={(e) => update("registrationType", e.target.value)} placeholder="Nursing Council" /></Field>
            <Field label="Registration number"><input className="inp" value={form.registrationNumber} onChange={(e) => update("registrationNumber", e.target.value)} /></Field>
            <Field label="Country of registration">
              <select className="inp" value={form.registrationCountry} onChange={(e) => update("registrationCountry", e.target.value)}>
                <option value="">Select</option>
                {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="License expiry"><input type="date" className="inp" value={form.licenseExpiry} onChange={(e) => update("licenseExpiry", e.target.value)} /></Field>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Work authorization"><input className="inp" value={form.workAuthorization} onChange={(e) => update("workAuthorization", e.target.value)} placeholder="Eligible to work in EU" /></Field>
          <Field label="Availability"><input className="inp" value={form.availability} onChange={(e) => update("availability", e.target.value)} placeholder="Immediate / 1 month notice" /></Field>
        </div>

        <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save profile
        </button>
      </div>

      <style>{`.inp{width:100%;border-radius:0.5rem;border:1px solid hsl(var(--border));background:#fff;padding:0.5rem 0.75rem;font-size:0.875rem;outline:none}.inp:focus{border-color:#2dd4bf;box-shadow:0 0 0 2px rgba(45,212,191,0.15)}`}</style>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</label>
      {children}
    </div>
  );
}