import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import {
  Stethoscope, Search, SlidersHorizontal, Loader2, Plane, MapPin,
  Briefcase, X, CheckCircle2,
} from "lucide-react";
import { COUNTRIES, PROFESSIONS, COUNTRY_BY_CODE, formatSalary } from "@/lib/healthcareData";
import PublicJobCard from "@/components/PublicJobCard";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";

const WORK_MODES = ["on-site", "hybrid", "remote"];

export default function PublicJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [country, setCountry] = useState("");
  const [profession, setProfession] = useState("");
  const [workMode, setWorkMode] = useState("");
  const [visaOnly, setVisaOnly] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    base44.entities.Job.list("-postedDate", 200)
      .then(setJobs)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const ql = q.toLowerCase();
    return jobs.filter((j) => {
      if (ql && !`${j.title} ${j.employer} ${j.countryName || ""} ${j.profession || ""}`.toLowerCase().includes(ql)) return false;
      if (country && j.country !== country) return false;
      if (profession && j.profession !== profession) return false;
      if (workMode && j.workMode !== workMode) return false;
      if (visaOnly && j.visaSponsorship !== "mentioned") return false;
      return true;
    });
  }, [jobs, q, country, profession, workMode, visaOnly]);

  const hasFilters = q || country || profession || workMode || visaOnly;
  const clear = () => { setQ(""); setCountry(""); setProfession(""); setWorkMode(""); setVisaOnly(false); };

  const Filters = () => (
    <div className="space-y-3">
      <Filter label="Profession">
        <select value={profession} onChange={(e) => setProfession(e.target.value)} className="inp">
          <option value="">All</option>
          {PROFESSIONS.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </Filter>
      <Filter label="Country">
        <select value={country} onChange={(e) => setCountry(e.target.value)} className="inp">
          <option value="">All</option>
          {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
        </select>
      </Filter>
      <Filter label="Work mode">
        <select value={workMode} onChange={(e) => setWorkMode(e.target.value)} className="inp">
          <option value="">All</option>
          {WORK_MODES.map((w) => <option key={w} value={w}>{w}</option>)}
        </select>
      </Filter>
      <label className="flex items-center gap-2 pt-1 text-sm text-slate-600">
        <input type="checkbox" checked={visaOnly} onChange={(e) => setVisaOnly(e.target.checked)} className="rounded border-slate-300 text-teal-600" />
        Visa sponsorship only
      </label>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/60">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white">
              <Stethoscope className="h-4 w-4" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-bold text-slate-900">Digitobits</div>
              <div className="text-[10px] text-teal-600">HealthCare Jobs AI</div>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/login" className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100">Sign in</Link>
            <Link to="/register" className="rounded-lg bg-teal-600 px-3.5 py-1.5 text-sm font-semibold text-white hover:bg-teal-700">Get started</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-slate-200 bg-gradient-to-b from-teal-50/50 to-transparent">
        <div className="mx-auto max-w-6xl px-4 py-10 text-center">
          <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">Global Healthcare Jobs, matched by AI</h1>
          <p className="mx-auto mt-3 max-w-2xl text-slate-600">
            Browse verified on-site, hybrid and remote healthcare opportunities worldwide. Create a free account to unlock AI-matched roles, CV optimization and application tracking.
          </p>
          <div className="mx-auto mt-6 flex max-w-xl items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by title, employer or country…"
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
          </div>
        </div>
      </section>

      {/* Body */}
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-20 rounded-2xl border border-slate-200 bg-white p-5">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-800"><SlidersHorizontal className="h-4 w-4 text-teal-600" /> Filters</div>
                {hasFilters && <button onClick={clear} className="text-xs text-teal-600 hover:underline">Clear</button>}
              </div>
              <Filters />
            </div>
          </aside>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm text-slate-500">{loading ? "Loading…" : `${filtered.length} job${filtered.length !== 1 ? "s" : ""} found`}</p>
              <button onClick={() => setMobileOpen(true)} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm lg:hidden">
                <SlidersHorizontal className="h-4 w-4" /> Filters {hasFilters && <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />}
              </button>
            </div>
            {loading ? (
              <div className="flex h-64 items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-teal-600" /></div>
            ) : filtered.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-sm text-slate-400">
                No jobs match your filters. <button onClick={clear} className="text-teal-600 hover:underline">Clear filters</button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {filtered.map((j) => <PublicJobCard key={j.id} job={j} onOpen={setSelected} />)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 text-center">
          <h2 className="text-xl font-semibold text-slate-900">Ready to apply with AI on your side?</h2>
          <p className="mt-1 text-sm text-slate-500">Create a free account to unlock AI job matching, CV optimization and application tracking.</p>
          <Link to="/register" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700">Get started free</Link>
        </div>
      </section>

      {/* Mobile filter drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 right-0 w-72 bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-800"><SlidersHorizontal className="h-4 w-4 text-teal-600" /> Filters</div>
              <button onClick={() => setMobileOpen(false)}><X className="h-5 w-5 text-slate-400" /></button>
            </div>
            {hasFilters && <button onClick={clear} className="mb-3 text-xs text-teal-600 hover:underline">Clear all</button>}
            <Filters />
            <button onClick={() => setMobileOpen(false)} className="mt-5 w-full rounded-lg bg-teal-600 py-2 text-sm font-semibold text-white">Show {filtered.length} jobs</button>
          </aside>
        </div>
      )}

      {/* Detail dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto max-w-2xl">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">{selected.title}</DialogTitle>
                <DialogDescription className="text-sm text-slate-600">
                  {selected.employer} · {COUNTRY_BY_CODE[selected.country]?.flag} {selected.countryName}{selected.city ? `, ${selected.city}` : ""}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 text-sm">
                <div className="flex flex-wrap gap-2">
                  <Badge><Briefcase className="h-3 w-3" /> {selected.workMode}</Badge>
                  {selected.visaSponsorship === "mentioned" && <Badge tone="teal"><Plane className="h-3 w-3" /> Visa sponsorship</Badge>}
                  {selected.relocation === "available" && <Badge><MapPin className="h-3 w-3" /> Relocation</Badge>}
                </div>
                <div>
                  <div className="mb-1 font-semibold text-slate-700">Salary</div>
                  <p className="text-slate-600">{selected.salaryMin ? formatSalary(selected.salaryMin, selected.salaryMax, selected.currency, selected.salaryPeriod) : "Not specified"}</p>
                </div>
                {selected.description && (
                  <div>
                    <div className="mb-1 font-semibold text-slate-700">Description</div>
                    <p className="whitespace-pre-line text-slate-600">{selected.description}</p>
                  </div>
                )}
                {selected.requirements && (
                  <div>
                    <div className="mb-1 font-semibold text-slate-700">Requirements</div>
                    <p className="whitespace-pre-line text-slate-600">{selected.requirements}</p>
                  </div>
                )}
                <div className="rounded-xl border border-teal-200 bg-teal-50 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-teal-800"><CheckCircle2 className="h-4 w-4" /> Create an account to apply</div>
                  <p className="mt-1 text-xs text-teal-700">Sign up free to get an AI match score, prepare your application, and track this role.</p>
                  <div className="mt-3 flex gap-2">
                    <Link to="/register" className="rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-700">Get started</Link>
                    <Link to="/login" className="rounded-lg border border-teal-200 px-3 py-1.5 text-xs font-medium text-teal-700 hover:bg-teal-50">Sign in</Link>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <style>{`.inp{width:100%;border-radius:0.5rem;border:1px solid hsl(var(--border));background:#fff;padding:0.45rem 0.6rem;font-size:0.8rem;outline:none}.inp:focus{border-color:#2dd4bf;box-shadow:0 0 0 2px rgba(45,212,191,0.15)}`}</style>
    </div>
  );
}

function Filter({ label, children }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</label>
      {children}
    </div>
  );
}

function Badge({ children, tone }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${tone === "teal" ? "bg-teal-50 text-teal-700" : "bg-slate-100 text-slate-600"}`}>
      {children}
    </span>
  );
}