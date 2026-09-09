import React from "react";
import { Link } from "react-router-dom";
import { Stethoscope, Globe, Sparkles, ShieldCheck, Users } from "lucide-react";
import PublicFooter from "@/components/PublicFooter";

export default function About() {
  return (
    <div className="min-h-screen bg-slate-50/60">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <Link to="/jobs-board" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white">
              <Stethoscope className="h-4 w-4" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-bold text-slate-900">Digitobits</div>
              <div className="text-[10px] text-teal-600">HealthCare Jobs AI</div>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/jobs-board" className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100">Browse Jobs</Link>
            <Link to="/contact" className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100">Contact</Link>
            <Link to="/register" className="rounded-lg bg-teal-600 px-3.5 py-1.5 text-sm font-semibold text-white hover:bg-teal-700">Get started</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">About Digitobits Global HealthCare Jobs AI</h1>
        <p className="mt-4 text-lg text-slate-600">
          Digitobits Global HealthCare Jobs AI is an AI-powered career platform that connects healthcare professionals
          around the world with on-site, hybrid, and remote job opportunities. We aggregate verified nursing,
          caregiving, medical, and allied health listings from across the globe and present them on a single,
          searchable board that anyone can browse without signing up.
        </p>

        <div className="mt-6 space-y-4 text-slate-600 leading-relaxed">
          <p>
            For registered candidates, the platform goes far beyond a job board. Our AI engine analyses your uploaded
            CV, builds a structured candidate profile, and scores your employability across qualifications,
            experience, registration, languages, and location. It then matches you against every listing with a
            transparent compatibility breakdown, surfaces the roles that fit you best, and flags the gaps you should
            address to become more competitive. When you find a role you want, the application assistant drafts a
            tailored cover letter and suggested application answers for your review, while the interview coach
            prepares likely questions and recommended approaches. Nothing is ever submitted without your explicit
            approval, keeping you in full control of every application.
          </p>
          <p>
            Digitobits is built for healthcare professionals at every stage of their career — newly qualified nurses,
            experienced clinicians, caregivers, and allied health workers seeking their next opportunity at home or
            abroad. Employers and recruiters benefit from a curated, fraud-screened talent pool, while administrators
            gain a real-time dashboard covering jobs discovered, applications, subscriptions, and revenue. With
            multi-currency salary display, visa-sponsorship and relocation filters, remote timezone compatibility
            checks, and cost-of-living context, the platform is designed to make international healthcare hiring
            safer and more transparent for everyone involved.
          </p>
          <p>
            Digitobits Global HealthCare Jobs AI is built and maintained by the Digitobits team, a group focused on
            applying practical AI to global healthcare recruitment. We are committed to accuracy, fairness, and
            candidate privacy, and we continuously improve the platform to help healthcare workers find meaningful
            work and help employers find the right people.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            { icon: Globe, title: "Global reach", text: "Jobs across every continent with on-site, hybrid, and remote options." },
            { icon: Sparkles, title: "AI matching", text: "Transparent compatibility scores and tailored application support." },
            { icon: ShieldCheck, title: "Safer hiring", text: "Fraud-risk screening and verified, currently-open listings." },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border border-slate-200 bg-white p-5">
              <f.icon className="h-5 w-5 text-teal-600" />
              <div className="mt-2 font-semibold text-slate-900">{f.title}</div>
              <p className="mt-1 text-sm text-slate-500">{f.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-teal-200 bg-teal-50 p-6 text-center">
          <Users className="mx-auto h-6 w-6 text-teal-600" />
          <h2 className="mt-2 text-lg font-semibold text-slate-900">Ready to find your next healthcare role?</h2>
          <p className="mt-1 text-sm text-slate-600">Create a free account to unlock AI job matching, CV optimization, and application tracking.</p>
          <Link to="/register" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700">Get started free</Link>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}