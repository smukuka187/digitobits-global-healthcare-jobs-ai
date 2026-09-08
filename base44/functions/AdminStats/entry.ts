import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin") return Response.json({ error: "Forbidden" }, { status: 403 });

    const [users, subs, jobs, apps, payments, profiles] = await Promise.all([
      base44.asServiceRole.entities.User.list("-created_date", 500),
      base44.asServiceRole.entities.Subscription.list("-created_date", 500),
      base44.asServiceRole.entities.Job.list("-created_date", 500),
      base44.asServiceRole.entities.Application.list("-created_date", 500),
      base44.asServiceRole.entities.Payment.list("-paymentDate", 500),
      base44.asServiceRole.entities.CandidateProfile.list("-created_date", 500),
    ]);

    const planCounts = { free: 0, basic: 0, professional: 0, premium: 0 };
    let mrr = 0;
    for (const s of subs) {
      if (planCounts[s.plan] != null) planCounts[s.plan]++;
      if (s.status === "active" && s.price) mrr += s.price;
    }

    const countryCount = {};
    for (const j of jobs) {
      const c = j.countryName || j.country || "Unknown";
      countryCount[c] = (countryCount[c] || 0) + 1;
    }

    const statusCount = {};
    for (const a of apps) {
      statusCount[a.status] = (statusCount[a.status] || 0) + 1;
    }

    const professionCount = {};
    for (const j of jobs) {
      const p = j.profession || "Unknown";
      professionCount[p] = (professionCount[p] || 0) + 1;
    }

    const totalRevenue = payments
      .filter((p) => p.status === "succeeded")
      .reduce((s, p) => s + (p.amount || 0), 0);

    const paid = subs.filter((s) => s.status === "active" && s.plan !== "free").length;
    const conversion = users.length ? Math.round((paid / users.length) * 1000) / 10 : 0;
    const arpu = paid ? Math.round((mrr / paid) * 100) / 100 : 0;

    return Response.json({
      users: {
        total: users.length,
        admins: users.filter((u) => u.role === "admin").length,
        regular: users.filter((u) => u.role !== "admin").length,
      },
      subscriptions: {
        ...planCounts,
        total: subs.length,
        active: subs.filter((s) => s.status === "active").length,
        cancelled: subs.filter((s) => s.status === "cancelled").length,
        paid,
      },
      revenue: { mrr, totalRevenue, payments: payments.length },
      jobs: { total: jobs.length, byCountry: countryCount, byProfession: professionCount },
      applications: {
        total: apps.length,
        byStatus: statusCount,
        applied: apps.filter((a) => ["applied", "assessment", "interview", "second_interview", "offer"].includes(a.status)).length,
        interviews: apps.filter((a) => ["interview", "second_interview"].includes(a.status)).length,
        offers: apps.filter((a) => a.status === "offer").length,
      },
      profiles: profiles.length,
      funnel: { conversion, arpu },
    });
  } catch (error) {
    console.error("AdminStats error", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}