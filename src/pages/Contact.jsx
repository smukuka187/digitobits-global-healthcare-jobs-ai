import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Stethoscope, Mail, MessageSquare, Send, Loader2, CheckCircle2, Linkedin, Twitter, Globe } from "lucide-react";
import PublicFooter from "@/components/PublicFooter";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setSending(true);
    // Open the visitor's email client with a prefilled message — works without a backend.
    const body = encodeURIComponent(`${form.message}\n\n— ${form.name} (${form.email})`);
    const subject = encodeURIComponent(form.subject || "Enquiry via Digitobits HealthCare Jobs AI");
    setTimeout(() => {
      window.location.href = `mailto:hello@digitobits.health?subject=${subject}&body=${body}`;
      setSending(false);
      setSent(true);
    }, 400);
  };

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
            <Link to="/about" className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100">About</Link>
            <Link to="/register" className="rounded-lg bg-teal-600 px-3.5 py-1.5 text-sm font-semibold text-white hover:bg-teal-700">Get started</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">Contact Us</h1>
        <p className="mt-3 text-lg text-slate-600">
          Questions about a listing, your subscription, or partnering with Digitobits? We'd love to hear from you.
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.3fr]">
          {/* Contact methods */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900"><Mail className="h-4 w-4 text-teal-600" /> Email</div>
              <a href="mailto:hello@digitobits.health" className="mt-2 block text-sm text-teal-600 hover:underline">hello@digitobits.health</a>
              <p className="mt-1 text-xs text-slate-400">We typically reply within 1–2 business days.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900"><MessageSquare className="h-4 w-4 text-teal-600" /> Social</div>
              <div className="mt-3 flex flex-col gap-2 text-sm">
                <a href="https://www.linkedin.com" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-slate-600 hover:text-teal-600"><Linkedin className="h-4 w-4" /> LinkedIn</a>
                <a href="https://twitter.com" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-slate-600 hover:text-teal-600"><Twitter className="h-4 w-4" /> Twitter / X</a>
                <a href="/jobs-board" className="inline-flex items-center gap-2 text-slate-600 hover:text-teal-600"><Globe className="h-4 w-4" /> Browse the job board</a>
              </div>
            </div>
          </div>

          {/* Contact form */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            {sent ? (
              <div className="flex h-full flex-col items-center justify-center py-10 text-center">
                <CheckCircle2 className="h-10 w-10 text-teal-600" />
                <h2 className="mt-3 text-lg font-semibold text-slate-900">Thanks for reaching out</h2>
                <p className="mt-1 text-sm text-slate-500">Your email app should have opened with your message. If not, email us directly at hello@digitobits.health.</p>
                <button onClick={() => { setSent(false); setForm({ name: "", email: "", subject: "", message: "" }); }} className="mt-4 text-sm text-teal-600 hover:underline">Send another message</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">Name</label>
                    <input required value={form.name} onChange={(e) => update("name", e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100" placeholder="Your name" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">Email</label>
                    <input required type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100" placeholder="you@example.com" />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">Subject</label>
                  <input value={form.subject} onChange={(e) => update("subject", e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100" placeholder="How can we help?" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">Message</label>
                  <textarea required rows={5} value={form.message} onChange={(e) => update("message", e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100" placeholder="Tell us more…" />
                </div>
                <button type="submit" disabled={sending} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60">
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} {sending ? "Opening your email…" : "Send message"}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}