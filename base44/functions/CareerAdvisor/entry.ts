import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { question, profile } = body || {};
    if (!question || !String(question).trim()) {
      return Response.json({ error: "A question is required" }, { status: 400 });
    }

    // Profile may come from the frontend (RLS-scoped); fall back to fetching it.
    let profileData = profile;
    if (!profileData) {
      try {
        const me = await base44.auth.me();
        if (me) {
          const list = await base44.entities.CandidateProfile.list();
          profileData = list[0] || null;
        }
      } catch (_e) {
        profileData = null;
      }
    }

    const jobs = await base44.asServiceRole.entities.Job.list("-posted_date", 60);
    const jobContext = jobs
      .map((j) =>
        `- ${j.title} — ${j.employer || "Employer"} (${j.countryName || j.country}, ${j.workMode}, ${j.profession || "n/a"}${j.visaSponsorship === "mentioned" ? ", visa sponsorship mentioned" : ""}${j.remoteWorldwide ? ", remote worldwide" : ""})`
      )
      .join("\n");

    const profileText = profileData
      ? `Profession: ${profileData.professionalTitle || "n/a"}, Years experience: ${profileData.yearsExperience ?? "n/a"}, Specialties: ${(profileData.specialties || []).join(", ") || "n/a"}, Languages: ${(profileData.languages || []).join(", ") || "n/a"}, Preferred countries: ${(profileData.preferredCountries || []).join(", ") || "n/a"}, Interests: ${(profileData.interests || []).join(", ") || "n/a"}, Registration: ${profileData.registrationType || "n/a"}`
      : "No candidate profile yet.";

    const prompt = `You are the AI Career Advisor for Digitobits Global HealthCare Jobs, a global healthcare employment platform.

Candidate profile:
${profileText}

Currently available healthcare jobs:
${jobContext}

Instructions:
- Answer the candidate's question using ONLY their real profile and the real jobs listed above.
- Be specific, practical and encouraging. Reference actual job titles/countries when relevant.
- Never invent jobs, employers, salaries, qualifications or experiences the candidate does not have.
- If a question can't be answered from the available data, say so honestly and suggest next steps.
- Keep answers concise (3-6 short paragraphs) and actionable.

Candidate question: ${question}`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      model: "automatic",
    });

    const answer = typeof result === "string" ? result : result?.answer || JSON.stringify(result);
    return Response.json({ answer });
  } catch (error) {
    console.error("CareerAdvisor error", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}