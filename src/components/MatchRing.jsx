import React from "react";
import { scoreRing } from "@/lib/match";

export default function MatchRing({ score, size = 56, stroke = 5, label = true }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score || 0));
  const offset = c - (pct / 100) * c;
  const color = scoreRing(score || 0);
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="currentColor" strokeWidth={stroke} fill="none" className="text-slate-100" />
        <circle
          cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none"
          strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-semibold text-slate-800" style={{ fontSize: size * 0.26 }}>{pct}</span>
        {label && <span className="text-slate-400" style={{ fontSize: size * 0.13 }}>%</span>}
      </div>
    </div>
  );
}