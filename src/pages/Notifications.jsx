import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Bell, Check } from "lucide-react";

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try { setItems(await base44.entities.Notification.list("-created_date")); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const markRead = async (id) => {
    await base44.entities.Notification.update(id, { read: true });
    setItems((s) => s.map((x) => (x.id === id ? { ...x, read: true } : x)));
  };
  const markAll = async () => {
    for (const n of items.filter((x) => !x.read)) await base44.entities.Notification.update(n.id, { read: true });
    setItems((s) => s.map((x) => ({ ...x, read: true })));
  };

  if (loading) return <div className="flex h-96 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-teal-600" /></div>;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
        {items.some((x) => !x.read) && <button onClick={markAll} className="inline-flex items-center gap-1 text-sm text-teal-600 hover:underline"><Check className="h-4 w-4" /> Mark all read</button>}
      </div>
      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <Bell className="mx-auto mb-2 h-8 w-8 text-slate-300" />
          <p className="text-slate-500">No notifications yet. New matches and application updates will appear here.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((n) => (
            <div key={n.id} className={`flex items-start gap-3 rounded-2xl border bg-white p-4 ${n.read ? "border-slate-200" : "border-teal-200 bg-teal-50/30"}`}>
              <div className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${n.read ? "bg-slate-200" : "bg-teal-500"}`} />
              <div className="min-w-0 flex-1">
                <div className="text-sm text-slate-700">{n.message}</div>
                <div className="mt-1 text-xs text-slate-400">{new Date(n.created_date).toLocaleString()}</div>
              </div>
              {n.relatedJobId && <Link to={`/jobs/${n.relatedJobId}`} className="text-xs text-teal-600 hover:underline">View</Link>}
              {!n.read && <button onClick={() => markRead(n.id)} className="text-xs text-slate-400 hover:text-teal-600">Mark read</button>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}