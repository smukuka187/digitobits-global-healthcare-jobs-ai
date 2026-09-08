// Lightweight heuristic match score for fast feed rendering.
// The detailed AI-driven score is generated on the Job detail page.
import { COUNTRY_BY_CODE } from "./healthcareData";

export function computeMatchScore(job, profile) {
  if (!profile) return null;
  const scores = {};
  // Specialization / profession
  const profMatch = profile.specialties?.some((s) =>
    job.specialization?.toLowerCase().includes(s.toLowerCase()) ||
    job.profession?.toLowerCase().includes(s.toLowerCase())
  );
  scores.specialization = profMatch ? 95 : (profile.specialties?.length ? 55 : 70);

  // Experience
  scores.experience = job.experienceYears && profile.yearsExperience != null
    ? Math.min(100, Math.round((profile.yearsExperience / Math.max(job.experienceYears, 1)) * 100))
    : 80;

  // Qualification
  scores.qualification = profile.qualifications?.length ? 90 : 60;

  // Skills (use specialties as proxy)
  scores.skills = profMatch ? 95 : 70;

  // Location / preferred countries
  const prefers = profile.preferredCountries || [];
  scores.location = prefers.includes(job.country) ? 100 : (prefers.length === 0 ? 80 : 50);

  // Registration
  scores.registration = job.registrationRequired
    ? (profile.registrationType ? 75 : 35)
    : 90;

  // Work authorization
  scores.workAuthorization =
    job.visaSponsorship === "mentioned" ? 70 :
    job.visaSponsorship === "not_available" ? (profile.location === job.country ? 95 : 40) : 75;

  // Salary (assume acceptable)
  scores.salary = 90;

  const overall = Math.round(
    Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length
  );
  return { overall, breakdown: scores };
}

export function scoreColor(score) {
  if (score >= 85) return "text-emerald-600";
  if (score >= 70) return "text-teal-600";
  if (score >= 50) return "text-amber-600";
  return "text-rose-600";
}

export function scoreRing(score) {
  if (score >= 85) return "#059669";
  if (score >= 70) return "#0d9488";
  if (score >= 50) return "#d97706";
  return "#e11d48";
}