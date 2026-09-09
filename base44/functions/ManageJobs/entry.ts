import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

// Admin job management: create single, bulk create, CSV import, list, delete.
// mode: "create" | "bulk" | "import" | "list" | "delete"
const JOB_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" }, profession: { type: "string" }, specialization: { type: "string" },
    employer: { type: "string" }, employerWebsite: { type: "string" },
    description: { type: "string" }, requirements: { type: "string" },
    continent: { type: "string" }, country: { type: "string" }, countryName: { type: "string" }, city: { type: "string" },
    workMode: { type: "string", enum: ["on-site", "hybrid", "remote"] },
    jobType: { type: "string" }, category: { type: "string" },
    salaryMin: { type: "number" }, salaryMax: { type: "number" }, currency: { type: "string" },
    salaryPeriod: { type: "string", enum: ["year", "month", "hour"] },
    visaSponsorship: { type: "string", enum: ["mentioned", "not_mentioned", "not_available"] },
    relocation: { type: "string", enum: ["available", "not_mentioned", "not_available"] },
    internationalApplicants: { type: "string", enum: ["accepted", "local_only", "not_mentioned"] },
    remoteWorldwide: { type: "boolean" }, remoteTimezone: { type: "string" }, remoteHours: { type: "string" },
    registrationRequired: { type: "string" }, qualificationRequired: { type: "string" },
    experienceYears: { type: "number" },
    postedDate: { type: "string", format: "date" },
    source: { type: "string" }, sourceUrl: { type: "string" },
    fraudRisk: { type: "string", enum: ["low", "medium", "high"] }, fraudNotes: { type: "string" }
  },
  required: ["title", "profession", "country", "workMode"]
};

const required = (j) => j && j.title && j.profession && j.country && j.workMode;

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admins only' }, { status: 403 });
    const body = await req.json();
    const mode = body.mode;

    if (mode === 'create') {
      if (!required(body.job)) return Response.json({ error: 'title, profession, country, workMode required' }, { status: 400 });
      const job = await base44.asServiceRole.entities.Job.create(body.job);
      return Response.json({ job });
    }

    if (mode === 'bulk') {
      const jobs = Array.isArray(body.jobs) ? body.jobs : [];
      const valid = jobs.filter(required);
      if (!valid.length) return Response.json({ error: 'No valid jobs (title, profession, country, workMode required)' }, { status: 400 });
      const created = await base44.asServiceRole.entities.Job.bulkCreate(valid);
      return Response.json({ created: created.length, skipped: jobs.length - valid.length });
    }

    if (mode === 'import') {
      const fileUrl = body.fileUrl;
      if (!fileUrl) return Response.json({ error: 'fileUrl required' }, { status: 400 });
      const extraction = await base44.asServiceRole.integrations.Core.ExtractDataFromUploadedFile({
        file_url: fileUrl,
        json_schema: { type: "object", properties: { jobs: { type: "array", items: JOB_SCHEMA } }, required: ["jobs"] }
      });
      const out = extraction.output;
      const list = Array.isArray(out) ? out : (out && Array.isArray(out.jobs) ? out.jobs : []);
      const valid = list.filter(required);
      if (!valid.length) return Response.json({ error: 'No valid job rows found. Ensure the file has title, profession, country and workMode columns.', total: list.length }, { status: 400 });
      const created = await base44.asServiceRole.entities.Job.bulkCreate(valid);
      return Response.json({ created: created.length, skipped: list.length - valid.length, total: list.length });
    }

    if (mode === 'list') {
      const limit = Math.min(Number(body.limit) || 50, 200);
      const jobs = await base44.asServiceRole.entities.Job.list('-created_date', limit);
      return Response.json({ jobs });
    }

    if (mode === 'delete') {
      if (!body.id) return Response.json({ error: 'id required' }, { status: 400 });
      await base44.asServiceRole.entities.Job.delete(body.id);
      return Response.json({ deleted: body.id });
    }

    return Response.json({ error: 'unknown mode' }, { status: 400 });
  } catch (error) {
    console.error('ManageJobs error', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}