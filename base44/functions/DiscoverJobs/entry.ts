import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

// AI job-discovery agent: searches the web for currently OPEN (non-expired)
// healthcare job listings and adds the ones not already in our database.
// Callable by the daily workflow (service role, no user) and by admins directly.
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    // Workflow invocations carry no user; allow those. Block authenticated non-admins.
    const user = await base44.auth.me().catch(() => null);
    if (user && user.role !== 'admin') return Response.json({ error: 'Forbidden — admins only' }, { status: 403 });
    const body = await req.json().catch(() => ({}));
    const focus = body.focus || 'currently open healthcare roles worldwide';

    const schema = {
      type: "object",
      properties: {
        jobs: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" }, profession: { type: "string" }, specialization: { type: "string" },
              employer: { type: "string" }, employerWebsite: { type: "string" },
              description: { type: "string" }, requirements: { type: "string" },
              country: { type: "string" }, countryName: { type: "string" }, city: { type: "string" },
              workMode: { type: "string", enum: ["on-site", "hybrid", "remote"] },
              jobType: { type: "string" },
              salaryMin: { type: "number" }, salaryMax: { type: "number" }, currency: { type: "string" },
              salaryPeriod: { type: "string", enum: ["year", "month", "hour"] },
              visaSponsorship: { type: "string", enum: ["mentioned", "not_mentioned", "not_available"] },
              relocation: { type: "string", enum: ["available", "not_mentioned", "not_available"] },
              internationalApplicants: { type: "string", enum: ["accepted", "local_only", "not_mentioned"] },
              remoteWorldwide: { type: "boolean" }, remoteTimezone: { type: "string" }, remoteHours: { type: "string" },
              experienceYears: { type: "number" },
              postedDate: { type: "string", format: "date" },
              source: { type: "string" }, sourceUrl: { type: "string" },
              isActive: { type: "boolean" }
            },
            required: ["title", "profession", "country", "workMode"]
          }
        }
      },
      required: ["jobs"]
    };

    const prompt = `You are an AI healthcare job-discovery agent for Digitobits, a global healthcare jobs platform. Search the web for CURRENTLY OPEN, ACTIVE healthcare job listings — nursing, caregiving, medical, allied health, clinical and remote healthcare roles — from job boards and employer career sites worldwide.

CRITICAL RULES:
- Only include jobs that are CURRENTLY OPEN and ACTIVELY ACCEPTING APPLICATIONS. EXCLUDE any listing that is closed, filled, expired, or whose application deadline has passed (overdue). For closed/expired ones set isActive=false; we only store isActive=true listings.
- Use real, accurate data: real employer names, real locations, and the real source URL where the posting was found. Never fabricate employers or URLs.
- Prefer recent postings (within the last 30 days) and set postedDate accordingly.
- Spread globally across continents and work modes (on-site, hybrid, remote).
- Return up to 20 distinct, high-quality listings.

Focus area: ${focus}`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: schema,
      add_context_from_internet: true,
      model: "gemini_3_flash"
    });

    const discovered = (result.jobs || []).filter((j) => j.isActive !== false && j.title && j.profession && j.country && j.workMode);

    // Deduplicate against existing jobs by sourceUrl.
    const existing = new Set();
    if (discovered.length) {
      const recent = await base44.asServiceRole.entities.Job.list('-created_date', 500);
      for (const j of recent) if (j.sourceUrl) existing.add(j.sourceUrl);
    }
    const fresh = discovered.filter((j) => !j.sourceUrl || !existing.has(j.sourceUrl));

    const payload = fresh.map((j) => {
      const { isActive, ...rest } = j;
      if (!rest.visaSponsorship) rest.visaSponsorship = "not_mentioned";
      if (!rest.relocation) rest.relocation = "not_mentioned";
      if (!rest.internationalApplicants) rest.internationalApplicants = "not_mentioned";
      if (!rest.source) rest.source = "AI Discovery";
      if (!rest.postedDate) rest.postedDate = new Date().toISOString().slice(0, 10);
      return rest;
    });

    let created = 0;
    if (payload.length) {
      const res = await base44.asServiceRole.entities.Job.bulkCreate(payload);
      created = res.length;
    }
    return Response.json({ discovered: discovered.length, created, duplicates: discovered.length - fresh.length });
  } catch (error) {
    console.error('DiscoverJobs error', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}