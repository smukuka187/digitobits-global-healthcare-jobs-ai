import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

// Unified AI assistant for healthcare job matching, application preparation,
// interview prep, fraud assessment, and employability scoring.
// mode: "match" | "prepare" | "interview" | "fraud" | "employability"
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const mode = body.mode;
    if (!mode) return Response.json({ error: 'mode required' }, { status: 400 });

    const job = body.job || {};
    const profile = body.profile || {};

    if (mode === 'match') {
      const schema = {
        type: "object",
        properties: {
          overall: { type: "number" },
          breakdown: {
            type: "object",
            properties: {
              skills: { type: "number" }, experience: { type: "number" },
              qualification: { type: "number" }, specialization: { type: "number" },
              location: { type: "number" }, registration: { type: "number" },
              workAuthorization: { type: "number" }, salary: { type: "number" }
            }
          },
          explanation: { type: "string" },
          issues: { type: "array", items: { type: "string" } },
          qualificationMatch: { type: "string" }
        },
        required: ["overall", "explanation"]
      };
      const prompt = `You are a healthcare recruitment matching engine. Compare the candidate profile to the job and produce a match score from 0-100 with a breakdown (each sub-score 0-100). Explain why it matches and flag issues needing attention (e.g. registration, qualification equivalency, visa). Never claim eligibility that isn't verified.\n\nJOB:\n${JSON.stringify(job)}\n\nCANDIDATE:\n${JSON.stringify(profile)}`;
      const result = await base44.asServiceRole.integrations.Core.InvokeLLM({ prompt, response_json_schema: schema });
      return Response.json({ result });

    } else if (mode === 'prepare') {
      const schema = {
        type: "object",
        properties: {
          coverLetter: { type: "string" },
          applicationAnswers: { type: "string" },
          qualityCheck: { type: "string" },
          warnings: { type: "array", items: { type: "string" } }
        },
        required: ["coverLetter"]
      };
      const prompt = `You are an AI application assistant for healthcare roles. Write a tailored cover letter and suggested application answers for this candidate applying to this job. Use ONLY truthful information from the candidate profile — never fabricate qualifications or experience. Provide a quality check and list any warnings (missing registration, qualification gaps, etc.).\n\nJOB:\n${JSON.stringify(job)}\n\nCANDIDATE:\n${JSON.stringify(profile)}`;
      const result = await base44.asServiceRole.integrations.Core.InvokeLLM({ prompt, response_json_schema: schema });
      return Response.json({ result });

    } else if (mode === 'interview') {
      const schema = {
        type: "object",
        properties: {
          questions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                question: { type: "string" },
                category: { type: "string" },
                suggestedApproach: { type: "string" }
              },
              required: ["question"]
            }
          },
          tips: { type: "string" }
        },
        required: ["questions"]
      };
      const prompt = `You are an AI interview coach for healthcare roles. Generate likely interview questions for this job and candidate: technical, clinical/nursing, caregiving, behavioral, scenario, and employer-specific. For each, give a suggested approach. Provide general tips.\n\nJOB:\n${JSON.stringify(job)}\n\nCANDIDATE:\n${JSON.stringify(profile)}`;
      const result = await base44.asServiceRole.integrations.Core.InvokeLLM({ prompt, response_json_schema: schema });
      return Response.json({ result });

    } else if (mode === 'fraud') {
      const schema = {
        type: "object",
        properties: {
          riskLevel: { type: "string", enum: ["low", "medium", "high"] },
          reasons: { type: "array", items: { type: "string" } },
          recommendation: { type: "string" }
        },
        required: ["riskLevel", "recommendation"]
      };
      const prompt = `You are a job fraud detection system for healthcare recruitment. Assess this job posting for scam risk: employer identity, website/email domain, payment requests, suspicious visa claims, unrealistic salaries, requests for sensitive info. Provide a risk level and recommendation. Never guarantee a job is legitimate; provide a risk assessment.\n\nJOB:\n${JSON.stringify(job)}`;
      const result = await base44.asServiceRole.integrations.Core.InvokeLLM({ prompt, response_json_schema: schema });
      return Response.json({ result });

    } else if (mode === 'employability') {
      const schema = {
        type: "object",
        properties: {
          score: { type: "number" },
          breakdown: {
            type: "object",
            properties: {
              qualification: { type: "number" }, experience: { type: "number" },
              clinicalSkills: { type: "number" }, cvQuality: { type: "number" },
              internationalReadiness: { type: "number" }, language: { type: "number" },
              registration: { type: "number" }, remoteReadiness: { type: "number" }
            }
          },
          recommendations: { type: "array", items: { type: "string" } }
        },
        required: ["score", "breakdown", "recommendations"]
      };
      const prompt = `You are a global healthcare career advisor. Compute a Global Healthcare Employability Score (0-100) with the breakdown below, and recommend legitimate improvements. Base scores only on the provided profile; never fabricate.\n\nCANDIDATE:\n${JSON.stringify(profile)}`;
      const result = await base44.asServiceRole.integrations.Core.InvokeLLM({ prompt, response_json_schema: schema });
      return Response.json({ result });
    }

    return Response.json({ error: 'unknown mode' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}