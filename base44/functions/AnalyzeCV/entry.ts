import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

const SCHEMA = {
  type: "object",
  properties: {
    fullName: { type: "string" },
    professionalTitle: { type: "string" },
    qualifications: { type: "array", items: { type: "string" } },
    certifications: { type: "array", items: { type: "string" } },
    registrationType: { type: "string" },
    registrationNumber: { type: "string" },
    registrationCountry: { type: "string" },
    yearsExperience: { type: "number" },
    specialties: { type: "array", items: { type: "string" } },
    clinicalExperience: { type: "string" },
    languages: { type: "array", items: { type: "string" } },
    location: { type: "string" },
    workAuthorization: { type: "string" },
    availability: { type: "string" },
    summary: { type: "string" }
  },
  required: ["fullName", "professionalTitle"]
};

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const cvUrl = body.cvUrl;
    if (!cvUrl) return Response.json({ error: 'cvUrl required' }, { status: 400 });

    const prompt = `You are a healthcare recruitment expert. Analyze this CV/resume of a healthcare professional. Extract the structured information below. Only include facts explicitly stated in the document. NEVER invent qualifications, certifications, registrations or experience that are not present. If a field is unknown, return an empty string or empty array. Identify healthcare-specific qualifications (nursing, medical, allied health), professional registrations, clinical specialties, and relevant experience (hospital, care-home, elderly-care, home-care, pandemic, infection-control, emergency).`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      file_urls: [cvUrl],
      response_json_schema: SCHEMA
    });

    return Response.json({ analysis: result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}