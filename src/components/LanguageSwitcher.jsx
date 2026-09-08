import React, { useState, useRef, useEffect } from "react";
import { Globe, Check } from "lucide-react";
import { LANGUAGES, useLanguage } from "@/lib/i18n";

export default function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  const current = LANGUAGES.find((l) => l.code === lang);
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm text-slate-600 transition hover:bg-slate-100"
      >
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline">{current?.label}</span>
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-1 w-40 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => { setLang(l.code); setOpen(false); }}
              className="flex w-full items-center justify-between px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              {l.label}
              {l.code === lang && <Check className="h-4 w-4 text-teal-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}