import React from "react";
import { useNavigate } from "react-router-dom";
import { Globe2 } from "lucide-react";
import { COUNTRIES, CONTINENTS } from "@/lib/healthcareData";

export default function WorldMap({ jobs }) {
  const navigate = useNavigate();
  const counts = {};
  for (const j of jobs) counts[j.country] = (counts[j.country] || 0) + 1;
  const total = jobs.length;

  return (
    <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-teal-50/40 p-6">
      <div className="mb-5 flex items-center gap-2">
        <Globe2 className="h-5 w-5 text-teal-600" />
        <h2 className="text-lg font-semibold text-slate-900">Global Job Map</h2>
        <span className="ml-auto rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
          {total} jobs worldwide
        </span>
      </div>
      <div className="space-y-4">
        {CONTINENTS.filter((c) => COUNTRIES.some((co) => co.continent === c && counts[co.code])).map((continent) => (
          <div key={continent}>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{continent}</div>
            <div className="flex flex-wrap gap-2">
              {COUNTRIES.filter((c) => c.continent === continent && counts[c.code])
                .sort((a, b) => counts[b.code] - counts[a.code])
                .map((c) => (
                  <button
                    key={c.code}
                    onClick={() => navigate(`/jobs?country=${c.code}`)}
                    className="group inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm transition hover:border-teal-400 hover:shadow-sm"
                  >
                    <span className="text-base">{c.flag}</span>
                    <span className="font-medium text-slate-700 group-hover:text-teal-700">{c.name}</span>
                    <span className="rounded-full bg-teal-50 px-2 py-0.5 text-xs font-semibold text-teal-700">
                      {counts[c.code]}
                    </span>
                  </button>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}