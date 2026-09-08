import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import {
  Users, DollarSign, Briefcase, FileText, TrendingUp, Award, Lock, Crown,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

export default function Admin() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.role !== "admin") {
      setLoading(false);
      return;
    }
    base44.functions
      .invoke("AdminStats")
      .then((res) => setStats(res.data))
      .catch((e) => setError(e.message || "Failed to load"))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) {
    return <div className="flex h-96 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-teal-600" /></div>;
  }

  if (user?.role !== "admin") {
    return (
      <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-10 text-center">
        <Lock className="mx-auto mb-2 h-8 w-8 text-slate-300" />
        <h1 className="text-lg font-semibold text-slate-900">Admins only</h1>
        <p className="mt-1 text-sm text-slate-500">You need an admin account to view this dashboard.</p>
      </div>
    );
  }

  if (error) {
    return <div className="mx-auto max-w-md rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">{error}</div>;
  }
  if (!stats) return null;

  const planData = [
    { name: "Free", value: stats.subscriptions.free, fill: "#94a3b8" },
    { name: "Basic", value: stats.subscriptions.basic, fill: "#5eead4" },
    { name: "Pro", value: stats.subscriptions.professional, fill: "#14b8a6" },
    { name: "Premium", value: stats.subscriptions.premium, fill: "#0d9488" },
  ];
  const countryData = Object.entries(stats.jobs.byCountry)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, value]) => ({ name, value }));

  const cards = [
    { label: "Total users", value: stats.users.total, icon: Users, color: "text-teal-600 bg-teal-50" },
    { label: "Monthly revenue", value: `$${stats.revenue.mrr}`, icon: DollarSign, color: "text-emerald-600 bg-emerald-50" },
    { label: "Total revenue", value: `$${stats.revenue.totalRevenue}`, icon: TrendingUp, color: "text-blue-600 bg-blue-50" },
    { label: "Jobs discovered", value: stats.jobs.total, icon: Briefcase, color: "text-violet-600 bg-violet-50" },
    { label: "Applications", value: stats.applications.total, icon: FileText, color: "text-amber-600 bg-amber-50" },
    { label: "Offers", value: stats.applications.offers, icon: Award, color: "text-rose-600 bg-rose-50" },
    { label: "Free→Paid", value: `${stats.funnel.conversion}%`, icon: Crown, color: "text-indigo-600 bg-indigo-50" },
    { label: "ARPU", value: `$${stats.funnel.arpu}`, icon: DollarSign, color: "text-slate-600 bg-slate-100" },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Platform health, subscriptions, revenue and job analytics.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className={`mb-2 inline-flex h-9 w-9 items-center justify-center rounded-xl ${c.color}`}>
              <c.icon className="h-4 w-4" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{c.value}</div>
            <div className="text-xs text-slate-500">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-slate-900">Subscribers by plan</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={planData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" allowDecimals={false} />
                <Tooltip cursor={{ fill: "#f8fafc" }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 grid grid-cols-4 gap-2 text-center text-xs">
            {planData.map((p) => (
              <div key={p.name} className="rounded-lg bg-slate-50 p-2">
                <div className="font-semibold text-slate-800">{p.value}</div>
                <div className="text-slate-400">{p.name}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-slate-900">Jobs by country</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={countryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 12 }} stroke="#94a3b8" allowDecimals={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} stroke="#94a3b8" width={90} />
                <Tooltip cursor={{ fill: "#f8fafc" }} />
                <Bar dataKey="value" fill="#14b8a6" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="mb-3 text-sm font-semibold text-slate-900">Application pipeline</h2>
        <div className="flex flex-wrap gap-2">
          {Object.entries(stats.applications.byStatus).map(([status, count]) => (
            <span key={status} className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1 text-xs text-slate-600">
              <span className="font-semibold text-slate-800">{count}</span> {status.replace(/_/g, " ")}
            </span>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Applied" value={stats.applications.applied} />
          <Stat label="Interviews" value={stats.applications.interviews} />
          <Stat label="Offers" value={stats.applications.offers} />
          <Stat label="Profiles" value={stats.profiles} />
        </div>
      </div>

      <div className="text-center text-xs text-slate-400">
        Need to manage plans or invite admins? <Link to="/billing" className="text-teal-600 hover:underline">View billing</Link>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3 text-center">
      <div className="text-xl font-bold text-slate-900">{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  );
}