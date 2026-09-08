import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useSubscription } from "@/hooks/useSubscription";
import JobCard from "@/components/JobCard";
import { computeMatchScore } from "@/lib/match";
import { Sparkles, Lock, ArrowRight, X } from "lucide-react";

export default function JobsForYou() {
  const { limit, planId, isFree } = useSubscription();
  const [jobs, setJobs] = useState([]);
  const [profile, setProfile] = useState(null);
  const [savedIds, setSavedIds] = useState(new Set());
  const [hidden, setHidden] = useState(new Set());
  const [loading, setLoading] = useState(true);

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
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const ranked = useMemo(() => {
    if (!profile) return [];
    return jobs
      .map((j) => ({ ...j, _match: computeMatchScore(j, profile) }))
      .filter((j) => j._match)
      .sort((a, b) => (b._match?.overall || 0) - (a._match?.overall || 0));
  }, [jobs, profile]);

  const limitNum = limit("recommendationsLimit");
  const visible = ranked.filter((j) => !hidden.has(j.id)).slice(0, limitNum === Infinity ? ranked.length : limitNum);
  const lockedCount = limitNum === Infinity ? 0 : Math.max(0, ranked.length - limitNum);

  const toggleSave = async (job) => {
    if (savedIds.has(job.id)) {
      const rec = await base44.entities.SavedJob.filter({ jobId: job.id });
      if (rec[0]) await base44.entities.SavedJob.delete(rec[0].id);
      setSavedIds((s) => {
        const n = new Set(s);
        n.delete(job.id);
        return n;
      });
    } else {
      await base44.entities.SavedJob.create({
        jobId: job.id,
        jobTitle: job.title,
        employer: job.employer,
        country: job.country,
        countryName: job.countryName,
        workMode: job.workMode,
        matchScore: job._match?.overall,
        jobSnapshot: job,
      });
      setSavedIds((s) => new Set(s).add(job.id));
    }
  };

  const notInterested = (id) => {
    setHidden((s) => new Set(s).add(id));
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-teal-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="rounded-3xl bg-gradient-to-br from-teal-600 to-emerald-700 p-6 text-white">
        <div className="flex items-center gap-2 text-teal-100">
          <Sparkles className="h-4 w-4" /> AI Recommendations
        </div>
        <h1 className="mt-1 text-2xl font-bold">Jobs recommended for you</h1>
        <p className="mt-1 text-sm text-teal-50/90">
          Ranked by your CV, experience, interests, preferred countries and work preferences.
        </p>
      </div>

      {!profile ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-slate-500">Build your profile and upload your CV to unlock personalized matches.</p>
          <Link
            to="/profile"
            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
          >
            Upload CV <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
          No matches yet. Try broadening your profile or preferred countries.
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((job) => (
              <div key={job.id} className="relative">
                <JobCard
                  job={job}
                  profile={profile}
                  saved={savedIds.has(job.id)}
                  onToggleSave={toggleSave}
                />
                <button
                  onClick={() => notInterested(job.id)}
                  title="Not interested"
                  className="absolute right-3 top-3 rounded-lg bg-white/80 p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>

          {lockedCount > 0 && (
            <div className="rounded-2xl border border-dashed border-teal-300 bg-teal-50/50 p-6 text-center">
              <Lock className="mx-auto mb-2 h-6 w-6 text-teal-600" />
              <p className="text-sm text-slate-700">
                <strong>{lockedCount} more high-match jobs</strong> match your profile.
              </p>
              <Link
                to="/billing"
                className="mt-3 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
              >
                Upgrade to see them all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}