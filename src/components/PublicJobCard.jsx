import React from "react";
import { MapPin, Briefcase, Plane } from "lucide-react";
import { COUNTRY_BY_CODE, formatSalary } from "@/lib/healthcareData";

export default function PublicJobCard({ job, onOpen }) {
  const country = COUNTRY_BY_CODE[job.country] || {};
  return (
    <button
      onClick={() => onOpen(job)}
      className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 text-left transition hover:border-teal-300 hover:shadow-sm"
    >
      <div className="mb-1.5 flex items-center gap-2">
        <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-teal-700">{job.profession}</span>
        {job.specialization && <span className="text-xs text-slate-400">· {job.specialization}</span>}
      </div>
      <h3 className="line-clamp-2 text-base font-semibold text-slate-900 group-hover:text-teal-700">{job.title}</h3>
      <p className="mt-0.5 truncate text-sm text-slate-600">{job.employer}</p>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {country.flag} {job.countryName}{job.city ? `, ${job.city}` : ""}</span>
        <span className="inline-flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" /> {job.workMode}</span>
        {job.visaSponsorship === "mentioned" && <span className="inline-flex items-center gap-1 text-teal-600"><Plane className="h-3.5 w-3.5" /> Visa</span>}
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
        <span className="text-sm font-semibold text-slate-700">{job.salaryMin ? formatSalary(job.salaryMin, job.salaryMax, job.currency, job.salaryPeriod) : "Salary not specified"}</span>
        <span className="text-xs font-medium text-teal-600 group-hover:underline">View details →</span>
      </div>
    </button>
  );
}