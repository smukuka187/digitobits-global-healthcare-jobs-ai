import React from "react";
import { Link } from "react-router-dom";
import { Bookmark, MapPin, Briefcase, ShieldCheck, ShieldAlert } from "lucide-react";
import MatchRing from "./MatchRing";
import { COUNTRY_BY_CODE, formatSalary } from "@/lib/healthcareData";
import { scoreColor } from "@/lib/match";

export default function JobCard({ job, profile, saved, onToggleSave }) {
  const country = COUNTRY_BY_CODE[job.country] || {};
  const match = profile ? (job._match ?? null) : null;
  const fraudColor =
    job.fraudRisk === "high" ? "text-rose-600" : job.fraudRisk === "medium" ? "text-amber-600" : "text-emerald-600";
  const FraudIcon = job.fraudRisk === "low" ? ShieldCheck : ShieldAlert;

  return (
    <div className="group relative rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:border-teal-300 hover:shadow-[0_8px_30px_-12px_rgba(13,148,136,0.25)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-1 flex items-center gap-2 text-xs text-slate-500">
            <span className="font-medium text-teal-700">{job.profession}</span>
            {job.specialization && <span className="truncate">· {job.specialization}</span>}
          </div>
          <Link to={`/jobs/${job.id}`} className="block">
            <h3 className="truncate text-lg font-semibold text-slate-900 group-hover:text-teal-700">{job.title}</h3>
          </Link>
          <p className="mt-0.5 truncate text-sm text-slate-600">{job.employer}</p>
        </div>
        {match != null && (
          <div className="shrink-0 text-center">
            <MatchRing score={match.overall} size={52} />
            <span className={`text-[10px] font-medium ${scoreColor(match.overall)}`}>Match</span>
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1">
          <span>{country.flag}</span> {job.countryName || country.name}{job.city ? `, ${job.city}` : ""}
        </span>
        <span className="inline-flex items-center gap-1"><Briefcase className="h-3 w-3" /> {job.workMode}</span>
        {job.jobType && <span>{job.jobType}</span>}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="text-sm font-medium text-slate-700">
          {job.salaryMin ? formatSalary(job.salaryMin, job.salaryMax, job.currency, job.salaryPeriod) : "Salary not specified"}
        </div>
        <div className="flex items-center gap-3">
          {job.visaSponsorship === "mentioned" && (
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">Visa sponsorship</span>
          )}
          <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${fraudColor}`} title="Fraud risk assessment">
            <FraudIcon className="h-3.5 w-3.5" /> {job.fraudRisk || "low"} risk
          </span>
          <button
            onClick={() => onToggleSave?.(job)}
            className={`rounded-lg p-1.5 transition ${saved ? "text-teal-600" : "text-slate-400 hover:text-teal-600"}`}
            title={saved ? "Saved" : "Save"}
          >
            <Bookmark className="h-4 w-4" fill={saved ? "currentColor" : "none"} />
          </button>
        </div>
      </div>
    </div>
  );
}