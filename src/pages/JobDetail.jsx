import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import {
  ArrowLeft, MapPin, Briefcase, Bookmark, Send, MessageSquare, ShieldAlert,
  ShieldCheck, Globe, Clock, Plane, FileCheck, Sparkles, Loader2, CheckCircle2, AlertTriangle, Lock
} from "lucide-react";
import MatchRing from "@/components/MatchRing";
import {
  COUNTRY_BY_CODE, formatSalary, convertSalary, COST_OF_LIVING,
  getTimezoneCompatibility, CURRENCIES
} from "@/lib/healthcareData";
import { useCurrency } from "@/lib/currency";
import { useSubscription } from "@/hooks/useSubscription";

const STATUS_OPTIONS = ["discovered", "saved", "reviewing", "prepared", "awaiting_approval", "applied", "assessment", "interview", "second_interview", "offer", "rejected", "withdrawn"];

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currency, setCurrency, currencies } = useCurrency();
  const { hasFeature } = useSubscription();
  const [job, setJob] = useState(null);
  const [profile, setProfile] = useState(null);
  const [saved, setSaved] = useState(false);
  const [savedId, setSavedId] = useState(null);
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);

  const [match, setMatch] = useState(null);
  const [matchLoading, setMatchLoading] = useState(false);
  const [prep, setPrep] = useState(null);
  const [prepLoading, setPrepLoading] = useState(false);
  const [interview, setInterview] = useState(null);
  const [interviewLoading, setInterviewLoading] = useState(false);
  const [fraud, setFraud] = useState(null);
  const [fraudLoading, setFraudLoading] = useState(false);
  const [approved, setApproved] = useState(false);
  const prepRef = useRef(null);

  const load = async () => {
    setLoading(true);
    try {
      const [j, profiles, savedList, apps] = await Promise.all([
        base44.entities.Job.get(id),
        base44.entities.CandidateProfile.list(),
        base44.entities.SavedJob.filter({ jobId: id }),
        base44.entities.Application.filter({ jobId: id }),
      ]);
      setJob(j);
      setProfile(profiles[0] || null);
      setSaved(savedList.length > 0);
      setSavedId(savedList[0]?.id || null);
      setApplication(apps[0] || null);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [id]);

  const country = job ? COUNTRY_BY_CODE[job.country] || {} : {};

  const runMatch = async () => {
    if (!profile) { navigate("/profile"); return; }
    setMatchLoading(true);
    try {
      const res = await base44.functions.invoke("JobAssistant", { mode: "match", job, profile });
      setMatch(res.data.result);
    } catch (e) { setMatch({ explanation: "Unable to compute match: " + e.message }); }
    finally { setMatchLoading(false); }
  };

  const runPrep = async () => {
    if (!profile) { navigate("/profile"); return; }
    setPrepLoading(true);
    try {
      const res = await base44.functions.invoke("JobAssistant", { mode: "prepare", job, profile });
      setPrep(res.data.result);
      if (!application) {
        const app = await base44.entities.Application.create({
          jobId: job.id, jobTitle: job.title, employer: job.employer,
          country: job.country, countryName: job.countryName, workMode: job.workMode,
          status: "prepared", coverLetter: res.data.result.coverLetter,
          applicationAnswers: res.data.result.applicationAnswers,
          qualityCheck: res.data.result.qualityCheck,
          preparedAt: new Date().toISOString()
        });
        setApplication(app);
      } else {
        const app = await base44.entities.Application.update(application.id, {
          status: "prepared", coverLetter: res.data.result.coverLetter,
          applicationAnswers: res.data.result.applicationAnswers,
          qualityCheck: res.data.result.qualityCheck,
          preparedAt: new Date().toISOString()
        });
        setApplication(app);
      }
    } catch (e) { setPrep({ coverLetter: "Unable to prepare: " + e.message }); }
    finally { setPrepLoading(false); }
  };

  const runInterview = async () => {
    setInterviewLoading(true);
    try {
      const res = await base44.functions.invoke("JobAssistant", { mode: "interview", job, profile: profile || {} });
      setInterview(res.data.result);
    } catch (e) { setInterview({ questions: [], tips: "Unable to load: " + e.message }); }
    finally { setInterviewLoading(false); }
  };

  const runFraud = async () => {
    setFraudLoading(true);
    try {
      const res = await base44.functions.invoke("JobAssistant", { mode: "fraud", job });
      setFraud(res.data.result);
    } catch (e) { setFraud({ riskLevel: "unknown", recommendation: "Unable to assess: " + e.message, reasons: [] }); }
    finally { setFraudLoading(false); }
  };

  const toggleSave = async () => {
    if (saved) {
      if (savedId) await base44.entities.SavedJob.delete(savedId);
      setSaved(false); setSavedId(null);
    } else {
      const rec = await base44.entities.SavedJob.create({
        jobId: job.id, jobTitle: job.title, employer: job.employer,
        country: job.country, countryName: job.countryName, workMode: job.workMode,
        jobSnapshot: job
      });
      setSaved(true); setSavedId(rec.id);
    }
  };

  const submitApplication = async () => {
    if (!application) return;
    const app = await base44.entities.Application.update(application.id, {
      status: "applied", submittedAt: new Date().toISOString()
    });
    setApplication(app);
    setApproved(false);
  };

  const applyNow = async () => {
    if (!hasFeature("applicationPrep")) { navigate("/billing"); return; }
    if (!profile) { navigate("/profile"); return; }
    await runPrep();
    prepRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const updateStatus = async (status) => {
    if (!application) return;
    const app = await base44.entities.Application.update(application.id, { status });
    setApplication(app);
  };

  if (loading) return <div className="flex h-96 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-teal-600" /></div>;
  if (!job) return <div className="p-8 text-center text-slate-500">Job not found.</div>;

  const tzCompat = job.workMode === "remote" && profile?.location
    ? getTimezoneCompatibility(COUNTRY_BY_CODE[profile.location]?.timezone, job.remoteTimezone, job.remoteHours)
    : null;
  const convertedMin = job.salaryMin ? convertSalary(job.salaryMin, job.currency, currency) : null;
  const convertedMax = job.salaryMax ? convertSalary(job.salaryMax, job.currency, currency) : null;
  const col = COST_OF_LIVING[job.country];

  const FraudBadge = () => {
    const r = job.fraudRisk || "low";
    const map = { low: { c: "text-emerald-600 bg-emerald-50", I: ShieldCheck }, medium: { c: "text-amber-600 bg-amber-50", I: AlertTriangle }, high: { c: "text-rose-600 bg-rose-50", I: ShieldAlert } };
    const m = map[r];
    return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${m.c}`}><m.I className="h-3.5 w-3.5" /> {r} fraud risk</span>;
  };

  return (
    <div className="mx-auto max-w-5xl">
      <button onClick={() => navigate(-1)} className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-teal-600">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      {/* Header */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 lg:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-700">{job.profession}</span>
              {job.specialization && <span className="text-xs text-slate-500">· {job.specialization}</span>}
            </div>
            <h1 className="text-2xl font-bold text-slate-900 lg:text-3xl">{job.title}</h1>
            <p className="mt-1 text-slate-600">{job.employer}</p>
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500">
              <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {country.flag} {job.countryName}{job.city ? `, ${job.city}` : ""}</span>
              <span className="inline-flex items-center gap-1.5"><Briefcase className="h-4 w-4" /> {job.workMode}</span>
              {job.jobType && <span>{job.jobType}</span>}
              <span className="text-slate-400">· Posted {job.postedDate ? new Date(job.postedDate).toLocaleDateString() : "recently"}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleSave} className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition ${saved ? "border-teal-500 bg-teal-50 text-teal-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
              <Bookmark className="h-4 w-4" fill={saved ? "currentColor" : "none"} /> {saved ? "Saved" : "Save"}
            </button>
            <button onClick={applyNow} disabled={prepLoading} className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:opacity-60">
              {prepLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} {application ? "Continue" : "Apply Now"}
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="text-xs text-slate-400">Salary</div>
            <div className="mt-1 font-semibold text-slate-800">{job.salaryMin ? formatSalary(job.salaryMin, job.salaryMax, job.currency, job.salaryPeriod) : "Not specified"}</div>
            {convertedMin && currency !== job.currency && (
              <div className="text-xs text-slate-500">≈ {CURRENCIES[currency].symbol}{convertedMin.toLocaleString()}{convertedMax ? `–${convertedMax.toLocaleString()}` : ""} {job.salaryPeriod === "hour" ? "/hr" : job.salaryPeriod === "month" ? "/mo" : "/yr"}</div>
            )}
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="text-xs text-slate-400">Visa sponsorship</div>
            <div className="mt-1 font-semibold text-slate-800">{job.visaSponsorship === "mentioned" ? "Available" : job.visaSponsorship === "not_available" ? "Not available" : "Not mentioned"}</div>
            <div className="text-xs text-slate-500">International applicants: {job.internationalApplicants === "accepted" ? "Accepted" : job.internationalApplicants === "local_only" ? "Local only" : "Not stated"}</div>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="text-xs text-slate-400">Relocation</div>
            <div className="mt-1 font-semibold text-slate-800">{job.relocation === "available" ? "Available" : job.relocation === "not_available" ? "Not available" : "Not mentioned"}</div>
            <div className="mt-1"><FraudBadge /></div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs">
            {Object.values(currencies).map((c) => <option key={c.code} value={c.code}>Display in {c.code}</option>)}
          </select>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-6 lg:col-span-2">
          <Section title="Job description">
            <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">{job.description}</p>
          </Section>
          <Section title="Requirements">
            <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">{job.requirements}</p>
            {job.registrationRequired && (
              <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                <strong>Registration required:</strong> {job.registrationRequired}
              </div>
            )}
          </Section>

          {/* AI Match */}
          <Section title="AI Match Score" icon={Sparkles} action={
            <button onClick={runMatch} disabled={matchLoading} className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-700 disabled:opacity-60">
              {matchLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />} {match ? "Recompute" : "Compute"}
            </button>
          }>
            {!match && !matchLoading && <p className="text-sm text-slate-400">Run the AI matcher to see your compatibility breakdown.</p>}
            {matchLoading && <div className="flex items-center gap-2 text-sm text-slate-400"><Loader2 className="h-4 w-4 animate-spin" /> Analyzing compatibility…</div>}
            {match && (
              <div>
                <div className="flex items-center gap-5">
                  <MatchRing score={match.overall} size={88} stroke={8} />
                  <div>
                    <div className="text-sm font-semibold text-slate-700">{match.explanation}</div>
                    {match.qualificationMatch && <div className="mt-1 text-xs text-slate-500">Qualification match: {match.qualificationMatch}</div>}
                  </div>
                </div>
                {match.breakdown && (
                  <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-4">
                    {Object.entries(match.breakdown).map(([k, v]) => (
                      <div key={k}>
                        <div className="flex justify-between text-xs text-slate-500"><span className="capitalize">{k.replace(/([A-Z])/g, " $1")}</span><span className="font-semibold">{v}%</span></div>
                        <div className="mt-1 h-1.5 rounded-full bg-slate-100"><div className="h-1.5 rounded-full bg-teal-500" style={{ width: `${v}%` }} /></div>
                      </div>
                    ))}
                  </div>
                )}
                {match.issues?.length > 0 && (
                  <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3">
                    <div className="mb-1 text-xs font-semibold text-amber-800">Issues needing attention</div>
                    <ul className="list-inside list-disc text-sm text-amber-700">{match.issues.map((i, n) => <li key={n}>{i}</li>)}</ul>
                  </div>
                )}
              </div>
            )}
          </Section>

          {/* Application prep */}
          <div ref={prepRef} className="scroll-mt-24" />
          <Section title="AI Application Assistant" icon={FileCheck} action={
            hasFeature("applicationPrep") ? (
              <button onClick={runPrep} disabled={prepLoading} className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-700 disabled:opacity-60">
                {prepLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileCheck className="h-3.5 w-3.5" />} {prep ? "Regenerate" : "Prepare"}
              </button>
            ) : (
              <Link to="/billing" className="inline-flex items-center gap-1.5 rounded-lg border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-700 hover:bg-teal-100">
                <Lock className="h-3.5 w-3.5" /> Upgrade
              </Link>
            )
          }>
            {!prep && !prepLoading && <p className="text-sm text-slate-400">{hasFeature("applicationPrep") ? "Generate a tailored cover letter and application answers from your profile." : "Application preparation is available on Professional and Premium."}</p>}
            {prepLoading && <div className="flex items-center gap-2 text-sm text-slate-400"><Loader2 className="h-4 w-4 animate-spin" /> Preparing your application…</div>}
            {prep && (
              <div className="space-y-4">
                <div>
                  <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Cover letter</div>
                  <div className="rounded-xl bg-slate-50 p-3 text-sm leading-relaxed text-slate-700 whitespace-pre-line">{prep.coverLetter}</div>
                </div>
                {prep.applicationAnswers && (
                  <div>
                    <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Suggested application answers</div>
                    <div className="rounded-xl bg-slate-50 p-3 text-sm leading-relaxed text-slate-700 whitespace-pre-line">{prep.applicationAnswers}</div>
                  </div>
                )}
                {prep.qualityCheck && (
                  <div className="rounded-xl border border-teal-200 bg-teal-50 p-3 text-sm text-teal-800"><strong>Quality check:</strong> {prep.qualityCheck}</div>
                )}
                {prep.warnings?.length > 0 && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-3"><div className="text-xs font-semibold text-amber-800">Warnings</div><ul className="list-inside list-disc text-sm text-amber-700">{prep.warnings.map((w, n) => <li key={n}>{w}</li>)}</ul></div>
                )}
                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700"><CheckCircle2 className="h-4 w-4 text-teal-600" /> User approval required</div>
                  <p className="text-xs text-slate-500">Review the prepared application. Nothing is submitted without your approval.</p>
                  <label className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                    <input type="checkbox" checked={approved} onChange={(e) => setApproved(e.target.checked)} className="rounded border-slate-300 text-teal-600" />
                    I have reviewed and approve this application
                  </label>
                  <button onClick={submitApplication} disabled={!approved} className="mt-3 inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50">
                    <Send className="h-4 w-4" /> Mark as applied
                  </button>
                </div>
              </div>
            )}
          </Section>

          {/* Interview prep */}
          <Section title="AI Interview Preparation" icon={MessageSquare} action={
            hasFeature("interviewPrep") ? (
              <button onClick={runInterview} disabled={interviewLoading} className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-700 disabled:opacity-60">
                {interviewLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <MessageSquare className="h-3.5 w-3.5" />} {interview ? "Regenerate" : "Generate"}
              </button>
            ) : (
              <Link to="/billing" className="inline-flex items-center gap-1.5 rounded-lg border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-700 hover:bg-teal-100">
                <Lock className="h-3.5 w-3.5" /> Upgrade
              </Link>
            )
          }>
            {!interview && !interviewLoading && <p className="text-sm text-slate-400">{hasFeature("interviewPrep") ? "Generate likely interview questions with suggested approaches." : "Interview preparation is available on Professional and Premium."}</p>}
            {interviewLoading && <div className="flex items-center gap-2 text-sm text-slate-400"><Loader2 className="h-4 w-4 animate-spin" /> Preparing questions…</div>}
            {interview && (
              <div className="space-y-3">
                {interview.questions?.map((q, n) => (
                  <div key={n} className="rounded-xl border border-slate-200 p-3">
                    <div className="flex items-center gap-2"><span className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-medium text-teal-700">{q.category || "General"}</span></div>
                    <div className="mt-1.5 text-sm font-medium text-slate-800">{n + 1}. {q.question}</div>
                    {q.suggestedApproach && <div className="mt-1 text-sm text-slate-500"><strong className="text-slate-600">Approach:</strong> {q.suggestedApproach}</div>}
                  </div>
                ))}
                {interview.tips && <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">{interview.tips}</div>}
              </div>
            )}
          </Section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Registration check */}
          {job.registrationRequired && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800"><FileCheck className="h-4 w-4 text-teal-600" /> Registration requirement</div>
              <div className="text-sm text-slate-600">{job.registrationRequired}</div>
              <div className="mt-2 rounded-lg bg-slate-50 p-2.5 text-xs text-slate-500">
                Your profile: {profile?.registrationType ? `${profile.registrationType} (${profile.registrationCountry || ""})` : "Registration information not provided."}
              </div>
              <div className="mt-2 text-xs font-medium text-amber-700">⚠ Verify eligibility before applying.</div>
            </div>
          )}

          {/* Visa / relocation */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800"><Plane className="h-4 w-4 text-teal-600" /> International details</div>
            <Row label="Visa sponsorship" value={job.visaSponsorship === "mentioned" ? "Mentioned" : job.visaSponsorship === "not_available" ? "No sponsorship" : "Not stated"} />
            <Row label="Relocation" value={job.relocation === "available" ? "Available" : job.relocation === "not_available" ? "Not available" : "Not mentioned"} />
            <Row label="International applicants" value={job.internationalApplicants === "accepted" ? "Accepted" : job.internationalApplicants === "local_only" ? "Local only" : "Not stated"} />
            {job.remoteWorldwide && <Row label="Remote" value="Worldwide" />}
          </div>

          {/* Remote timezone */}
          {job.workMode === "remote" && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800"><Clock className="h-4 w-4 text-teal-600" /> Time zone compatibility</div>
              <Row label="Employer timezone" value={job.remoteTimezone || "Not specified"} />
              {job.remoteHours && <Row label="Working hours" value={job.remoteHours} />}
              {tzCompat && (
                <div className="mt-2 rounded-lg bg-slate-50 p-2.5 text-xs">
                  <span className="font-medium text-slate-700">Compatibility: {tzCompat.label}</span>
                  {tzCompat.note && <span className="text-slate-400"> · {tzCompat.note}</span>}
                </div>
              )}
            </div>
          )}

          {/* Cost of living */}
          {col != null && job.workMode !== "remote" && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800"><Globe className="h-4 w-4 text-teal-600" /> Cost of living (estimate)</div>
              <div className="text-xs text-slate-500">Index {col}/100 — {col > 70 ? "High" : col > 45 ? "Moderate" : "Lower"} cost of living relative to global average.</div>
              <div className="mt-1 text-[11px] text-slate-400">Estimate only; verify with local sources.</div>
            </div>
          )}

          {/* Fraud assessment */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800"><ShieldAlert className="h-4 w-4 text-teal-600" /> Fraud risk assessment</div>
            <FraudBadge />
            <button onClick={runFraud} disabled={fraudLoading} className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-60">
              {fraudLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />} Run AI assessment
            </button>
            {fraud && (
              <div className="mt-3 space-y-2 text-sm">
                <div className="font-medium text-slate-700">Risk: <span className="capitalize">{fraud.riskLevel}</span></div>
                {fraud.reasons?.length > 0 && <ul className="list-inside list-disc text-slate-500 text-xs">{fraud.reasons.map((r, n) => <li key={n}>{r}</li>)}</ul>}
                <div className="rounded-lg bg-slate-50 p-2.5 text-xs text-slate-600">{fraud.recommendation}</div>
              </div>
            )}
          </div>

          {/* Application status */}
          {application && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="mb-2 text-sm font-semibold text-slate-800">Application status</div>
              <select value={application.status} onChange={(e) => updateStatus(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm capitalize">
                {STATUS_OPTIONS.map((s) => <option key={s} value={s} className="capitalize">{s.replace(/_/g, " ")}</option>)}
              </select>
              <Link to="/applications" className="mt-2 block text-center text-xs text-teal-600 hover:underline">View in tracker →</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function tLabel(k) { return k; }

function Section({ title, icon: Icon, action, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">{Icon && <Icon className="h-4 w-4 text-teal-600" />}{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 py-1.5 text-sm last:border-0">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-700">{value}</span>
    </div>
  );
}