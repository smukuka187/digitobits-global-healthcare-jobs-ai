import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import JobCard from "@/components/JobCard";
import { computeMatchScore } from "@/lib/match";
import {
  CONTINENTS, COUNTRIES, PROFESSIONS, JOB_TYPES, WORK_MODES, COUNTRY_BY_CODE
} from "@/lib/healthcareData";
import { useLanguage } from "@/lib/i18n";

export default function Jobs() {
  const { t } = useLanguage();
  const [params, setParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [profile, setProfile] = useState(null);
  const [savedIds, setSavedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [q, setQ] = useState("");
  const [continent, setContinent] = useState("");
  const [country, setCountry] = useState(params.get("country") || "");
  const [profession, setProfession] = useState("");
  const [jobType, setJobType] = useState("");
  const [workMode, setWorkMode] = useState("");
  const [category, setCategory] = useState(params.get("category") || "");
  const [visaOnly, setVisaOnly] = useState(false);
  const [remoteOnly, setRemoteOnly] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [jobList, profiles, saved] = await Promise.all([
        base44.entities.Job.list("-posted_date", 200),
        base44.entities.CandidateProfile.list(),
        base44.entities.SavedJob.list(),
      ]);
      setJobs(jobList);
      setProfile(profiles[0] || null);
      setSavedIds(new Set(saved.map((s) => s.jobId)));
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  useEffect(() => {
    setCountry(params.get("country") || "");
    setCategory(params.get("category") || "");
  }, [params]);

  const filtered = useMemo(() => {
    let list = [...jobs];
    if (q) {
      const s = q.toLowerCase();
      list = list.filter((j) =>
        j.title?.toLowerCase().includes(s) ||
        j.employer?.toLowerCase().includes(s) ||
        j.countryName?.toLowerCase().includes(s) ||
        j.specialization?.toLowerCase().includes(s)
      );
    }
    if (continent) list = list.filter((j) => COUNTRY_BY_CODE[j.country]?.continent === continent);
    if (country) list = list.filter((j) => j.country === country);
    if (profession) list = list.filter((j) => j.profession === profession);
    if (jobType) list = list.filter((j) => j.jobType === jobType);
    if (workMode) list = list.filter((j) => j.workMode === workMode);
    if (category) list = list.filter((j) => j.category === category);
    if (visaOnly) list = list.filter((j) => j.visaSponsorship === "mentioned");
    if (remoteOnly) list = list.filter((j) => j.workMode === "remote");
    return list.map((j) => ({ ...j, _match: profile ? computeMatchScore(j, profile) : null }))
      .sort((a, b) => (b._match?.overall || 0) - (a._match?.overall || 0));
  }, [jobs, q, continent, country, profession, jobType, workMode, category, visaOnly, remoteOnly, profile]);

  const toggleSave = async (job) => {
    if (savedIds.has(job.id)) {
      const rec = await base44.entities.SavedJob.filter({ jobId: job.id });
      if (rec[0]) await base44.entities.SavedJob.delete(rec[0].id);
      setSavedIds((s) => { const n = new Set(s); n.delete(job.id); return n; });
    } else {
      await base44.entities.SavedJob.create({
        jobId: job.id, jobTitle: job.title, employer: job.employer,
        country: job.country, countryName: job.countryName, workMode: job.workMode,
        matchScore: job._match?.overall, jobSnapshot: job
      });
      setSavedIds((s) => new Set(s).add(job.id));
    }
  };

  const clearAll = () => {
    setQ(""); setContinent(""); setCountry(""); setProfession("");
    setJobType(""); setWorkMode(""); setCategory(""); setVisaOnly(false); setRemoteOnly(false);
    setParams({});
  };

  const activeFilters = [continent, country, profession, jobType, workMode, category].filter(Boolean).length + (visaOnly ? 1 : 0) + (remoteOnly ? 1 : 0);

  const FilterPanel = () => (
    <div className="space-y-5">
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">{t("country")}</label>
        <select value={country} onChange={(e) => setCountry(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
          <option value="">{t("all")}</option>
          {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
        </select>
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">Continent</label>
        <select value={continent} onChange={(e) => setContinent(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
          <option value="">{t("all")}</option>
          {CONTINENTS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">{t("profession")}</label>
        <select value={profession} onChange={(e) => setProfession(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
          <option value="">{t("all")}</option>
          {PROFESSIONS.map((p) => <option key={p.category} value={p.category}>{p.icon} {p.category}</option>)}
        </select>
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">{t("job_type")}</label>
        <select value={jobType} onChange={(e) => setJobType(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
          <option value="">{t("all")}</option>
          {JOB_TYPES.map((j) => <option key={j} value={j}>{j}</option>)}
        </select>
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">{t("work_mode")}</label>
        <div className="flex gap-2">
          {WORK_MODES.map((m) => (
            <button key={m} onClick={() => setWorkMode(workMode === m ? "" : m)}
              className={`flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium capitalize transition ${workMode === m ? "border-teal-500 bg-teal-50 text-teal-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
              {m}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" checked={visaOnly} onChange={(e) => setVisaOnly(e.target.checked)} className="rounded border-slate-300 text-teal-600" />
          Visa sponsorship only
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" checked={remoteOnly} onChange={(e) => setRemoteOnly(e.target.checked)} className="rounded border-slate-300 text-teal-600" />
          Remote only
        </label>
      </div>
      {activeFilters > 0 && (
        <button onClick={clearAll} className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 py-2 text-sm text-slate-500 hover:bg-slate-50">
          <X className="h-3.5 w-3.5" /> {t("clear")}
        </button>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{t("find_jobs")}</h1>
        <p className="mt-1 text-sm text-slate-500">Search healthcare opportunities across {COUNTRIES.length}+ countries.</p>
      </div>

      <div className="mb-5 flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={q} onChange={(e) => setQ(e.target.value)}
            placeholder={t("search_placeholder")}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
          />
        </div>
        <button onClick={() => setShowFilters((s) => !s)}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 lg:hidden">
          <SlidersHorizontal className="h-4 w-4" /> {t("filters")} {activeFilters > 0 && <span className="rounded-full bg-teal-600 px-1.5 text-xs text-white">{activeFilters}</span>}
        </button>
      </div>

      <div className="flex gap-6">
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-20 rounded-2xl border border-slate-200 bg-white p-5">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700"><SlidersHorizontal className="h-4 w-4" /> {t("filters")}</div>
            <FilterPanel />
          </div>
        </aside>

        {showFilters && (
          <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-5 lg:hidden">
            <FilterPanel />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="mb-3 text-sm text-slate-500">{filtered.length} jobs found</div>
          {loading ? (
            <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-teal-600" /></div>
          ) : filtered.length ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((job) => (
                <JobCard key={job.id} job={job} profile={profile} saved={savedIds.has(job.id)} onToggleSave={toggleSave} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">{t("no_jobs")}</div>
          )}
        </div>
      </div>
    </div>
  );
}