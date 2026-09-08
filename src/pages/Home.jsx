import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Sparkles, TrendingUp, FileText, Send, Award, ArrowRight, Stethoscope, Search } from "lucide-react";
import WorldMap from "@/components/WorldMap";
import JobCard from "@/components/JobCard";
import MatchRing from "@/components/MatchRing";
import { computeMatchScore } from "@/lib/match";
import { CATEGORIES } from "@/lib/healthcareData";
import { useLanguage } from "@/lib/i18n";

export default function Home() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [jobs, setJobs] = useState([]);
  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [savedIds, setSavedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [jobList, profiles, apps, saved] = await Promise.all([
        base44.entities.Job.list("-posted_date", 100),
        base44.entities.CandidateProfile.list(),
        base44.entities.Application.list(),
        base44.entities.SavedJob.list(),
      ]);
      setJobs(jobList);
      setProfile(profiles[0] || null);
      setApplications(apps);
      setSavedIds(new Set(saved.map((s) => s.jobId)));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const recommended = useMemo(() => {
    if (!jobs.length) return [];
    const scored = jobs.map((j) => ({ ...j, _match: profile ? computeMatchScore(j, profile) : null }))
      .filter((j) => j._match)
      .sort((a, b) => b._match.overall - a._match.overall);
    return scored.slice(0, 6);
  }, [jobs, profile]);

  const stats = useMemo(() => {
    const applied = applications.filter((a) => ["applied", "assessment", "interview", "second_interview", "offer"].includes(a.status)).length;
    const interviews = applications.filter((a) => ["interview", "second_interview"].includes(a.status)).length;
    const offers = applications.filter((a) => a.status === "offer").length;
    const pending = applications.filter((a) => ["prepared", "awaiting_approval"].includes(a.status)).length;
    return { discovered: jobs.length, applied, interviews, offers, pending };
  }, [jobs, applications]);

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

  if (loading) {
    return <div className="flex h-96 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-teal-600" /></div>;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Hero */}
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-700 p-8 text-white shadow-lg lg:p-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" /> AI-powered global healthcare employment
            </div>
            <h1 className="text-3xl font-bold leading-tight lg:text-4xl">
              Hello, {user?.full_name?.split(" ")[0] || "there"} 👋
            </h1>
            <p className="mt-2 text-teal-50/90">
              Finding healthcare opportunities worldwide — hospitals, care homes, NGOs, remote and emergency response roles.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link to="/jobs" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-teal-700 transition hover:bg-teal-50">
                <Search className="h-4 w-4" /> {t("find_jobs")}
              </Link>
              {!profile && (
                <Link to="/profile" className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/25">
                  <FileText className="h-4 w-4" /> {t("upload_cv")}
                </Link>
              )}
            </div>
          </div>
          {profile && (
            <div className="flex items-center gap-4 rounded-2xl bg-white/10 p-5 backdrop-blur">
              <MatchRing score={profile.employabilityScore || 0} size={84} stroke={7} />
              <div>
                <div className="text-xs uppercase tracking-wide text-teal-100">{t("employability")}</div>
                <div className="text-2xl font-bold">{profile.employabilityScore || "—"}<span className="text-base font-normal text-teal-100">/100</span></div>
                <Link to="/profile" className="mt-1 inline-flex items-center gap-1 text-xs text-teal-50 hover:underline">
                  Improve score <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {[
          { label: "Jobs discovered", value: stats.discovered, icon: TrendingUp, color: "text-teal-600 bg-teal-50" },
          { label: t("applications"), value: stats.applied, icon: FileText, color: "text-blue-600 bg-blue-50" },
          { label: t("interviews"), value: stats.interviews, icon: Send, color: "text-violet-600 bg-violet-50" },
          { label: t("offers"), value: stats.offers, icon: Award, color: "text-amber-600 bg-amber-50" },
          { label: "Pending approval", value: stats.pending, icon: Sparkles, color: "text-rose-600 bg-rose-50" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className={`mb-2 inline-flex h-9 w-9 items-center justify-center rounded-xl ${s.color}`}>
              <s.icon className="h-4.5 w-4.5" style={{ width: 18, height: 18 }} />
            </div>
            <div className="text-2xl font-bold text-slate-900">{s.value}</div>
            <div className="text-xs text-slate-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Categories */}
      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Browse by category</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {CATEGORIES.map((c) => (
            <Link key={c.id} to={`/jobs?category=${c.id}`}
              className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-teal-300 hover:shadow-sm">
              <span className="text-2xl">{c.icon}</span>
              <span className="text-sm font-medium text-slate-700 group-hover:text-teal-700">{c.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* World map */}
      <WorldMap jobs={jobs} />

      {/* Recommended */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">{t("recommended")}</h2>
          <Link to="/jobs" className="inline-flex items-center gap-1 text-sm font-medium text-teal-600 hover:underline">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {profile ? (
          recommended.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recommended.map((job) => (
                <JobCard key={job.id} job={job} profile={profile} saved={savedIds.has(job.id)} onToggleSave={toggleSave} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
              <Stethoscope className="mx-auto mb-2 h-8 w-8 text-slate-300" />
              Complete your profile to see personalized matches.
            </div>
          )
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <p className="text-slate-500">Build your profile and upload your CV to unlock AI-matched opportunities.</p>
            <Link to="/profile" className="mt-3 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700">
              <FileText className="h-4 w-4" /> {t("upload_cv")}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}