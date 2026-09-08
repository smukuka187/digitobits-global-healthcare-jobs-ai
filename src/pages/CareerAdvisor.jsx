import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useSubscription } from "@/hooks/useSubscription";
import { Loader2, Send, Sparkles, Lock, ArrowRight } from "lucide-react";

export default function CareerAdvisor() {
  const { isPremium, loading: subLoading } = useSubscription();
  const [profile, setProfile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    base44.entities.CandidateProfile.list().then((p) => setProfile(p[0] || null)).catch(() => {});
  }, []);
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text) => {
    const q = (text ?? input).trim();
    if (!q || busy) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text: q }]);
    setBusy(true);
    try {
      const res = await base44.functions.invoke("CareerAdvisor", { question: q, profile });
      const answer = res.data?.answer || res.data?.error || "Sorry, I couldn't generate a response.";
      setMessages((m) => [...m, { role: "assistant", text: answer }]);
    } catch (e) {
      setMessages((m) => [...m, { role: "assistant", text: "Something went wrong. Please try again." }]);
    } finally {
      setBusy(false);
    }
  };

  if (subLoading) {
    return <div className="flex h-96 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-teal-600" /></div>;
  }

  if (!isPremium) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="rounded-3xl bg-gradient-to-br from-amber-500 to-orange-600 p-6 text-white">
          <div className="flex items-center gap-2 text-amber-100"><Sparkles className="h-4 w-4" /> Premium feature</div>
          <h1 className="mt-1 text-2xl font-bold">AI Career Advisor</h1>
          <p className="mt-1 text-sm text-amber-50/90">Ask about jobs you're qualified for, countries with opportunities, visa sponsorship, missing skills, and CV improvements.</p>
        </div>
        <div className="rounded-2xl border border-dashed border-amber-300 bg-amber-50/50 p-8 text-center">
          <Lock className="mx-auto mb-2 h-6 w-6 text-amber-600" />
          <p className="text-sm text-slate-700">The AI Career Advisor is available on the <strong>Premium</strong> plan.</p>
          <Link to="/billing" className="mt-3 inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700">Upgrade to Premium <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </div>
    );
  }

  const suggestions = [
    "What healthcare jobs am I most qualified for?",
    "Which countries have the most opportunities for my profession?",
    "Show me remote healthcare jobs.",
    "Which jobs offer visa sponsorship?",
    "What skills am I missing?",
    "How can I improve my CV?",
  ];

  return (
    <div className="mx-auto flex h-[calc(100vh-7rem)] max-w-3xl flex-col">
      <div className="mb-4 rounded-3xl bg-gradient-to-br from-teal-600 to-emerald-700 p-5 text-white">
        <div className="flex items-center gap-2 text-teal-100"><Sparkles className="h-4 w-4" /> Premium</div>
        <h1 className="mt-1 text-xl font-bold">AI Career Advisor</h1>
        <p className="text-sm text-teal-50/90">Your personal healthcare career strategist.</p>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4">
        {messages.length === 0 && (
          <div className="space-y-3">
            <p className="text-sm text-slate-500">Try one of these:</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button key={s} onClick={() => send(s)} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-700 hover:border-teal-300 hover:bg-teal-50">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${m.role === "user" ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-700"}`}>
              <div className="whitespace-pre-wrap">{m.text}</div>
            </div>
          </div>
        ))}
        {busy && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-2xl bg-slate-100 px-3.5 py-2.5 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" /> Thinking...
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      <form onSubmit={(e) => { e.preventDefault(); send(); }} className="mt-3 flex items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask your AI career advisor..."
          className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-teal-400 focus:outline-none focus:ring-1 focus:ring-teal-400"
        />
        <button type="submit" disabled={busy || !input.trim()} className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50">
          <Send className="h-4 w-4" /> Send
        </button>
      </form>
    </div>
  );
}