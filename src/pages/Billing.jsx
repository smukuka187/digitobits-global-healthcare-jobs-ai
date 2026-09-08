import React, { useEffect, useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { PLANS, getPlan, formatLimit } from "@/lib/plans";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { CreditCard, Check, Crown, Sparkles, Gift, Copy, X, Receipt } from "lucide-react";

export default function Billing() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { subscription, planId, plan, loading, refresh, setSubscription } = useSubscription();
  const [payments, setPayments] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [busy, setBusy] = useState(false);

  const loadExtras = async () => {
    try {
      const [pays, refs] = await Promise.all([
        base44.entities.Payment.list("-paymentDate", 20),
        base44.entities.Referral.list("-created_date", 20),
      ]);
      setPayments(pays);
      setReferrals(refs);
    } catch (e) {
      console.error(e);
    }
  };
  useEffect(() => {
    loadExtras();
  }, []);

  const referralCode = useMemo(() => {
    if (!user?.id) return "DGT-DEMO";
    return `DGT-${user.id.slice(0, 6).toUpperCase()}`;
  }, [user]);

  const usageUsed = subscription?.monthlyRecommendationsUsed || 0;
  const usageLimit = plan && formatLimit(plan && (PLAN_FEATURES_LIMIT(planId)));

  const subscribe = async (newPlanId) => {
    if (newPlanId === planId) return;
    setBusy(true);
    try {
      const p = getPlan(newPlanId);
      const renewal = new Date();
      renewal.setMonth(renewal.getMonth() + 1);
      const renewalDate = renewal.toISOString().slice(0, 10);
      const base = {
        plan: newPlanId,
        planName: p.name,
        price: p.price,
        currency: p.currency,
        status: "active",
        renewalDate,
        paymentProvider: "stripe",
        alertLevel: subscription?.alertLevel || "balanced",
        monthlyRecommendationsUsed: 0,
      };
      let result;
      if (subscription) {
        result = await base44.entities.Subscription.update(subscription.id, base);
      } else {
        result = await base44.entities.Subscription.create({
          ...base,
          startDate: new Date().toISOString(),
        });
      }
      setSubscription(result);
      toast({
        title: `You're on ${p.name}`,
        description:
          p.price > 0
            ? "Live card billing activates once your Stripe account is verified."
            : "Downgraded to the Free plan.",
      });
      loadExtras();
    } catch (e) {
      toast({ title: "Could not update plan", description: e.message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const cancel = async () => {
    if (!subscription) return;
    setBusy(true);
    try {
      const result = await base44.entities.Subscription.update(subscription.id, {
        status: "cancelled",
        cancelledAt: new Date().toISOString(),
      });
      setSubscription(result);
      toast({ title: "Subscription cancelled", description: "You'll keep access until your renewal date." });
    } catch (e) {
      toast({ title: "Could not cancel", description: e.message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const setAlertLevel = async (level) => {
    if (!subscription) return;
    const result = await base44.entities.Subscription.update(subscription.id, { alertLevel: level });
    setSubscription(result);
  };

  const copyCode = () => {
    navigator.clipboard?.writeText(referralCode);
    toast({ title: "Referral code copied" });
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-teal-600" />
      </div>
    );
  }

  const limitNum = subscription?.monthlyRecommendationsLimit || (planId === "free" ? 3 : planId === "basic" ? 10 : Infinity);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Subscription & Billing</h1>
        <p className="mt-1 text-sm text-slate-500">
          Your AI healthcare career agent — choose the plan that fits your journey.
        </p>
      </div>

      {/* Current plan */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-teal-600 to-emerald-700 p-6 text-white">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-teal-100">
              <Crown className="h-4 w-4" /> Current plan
            </div>
            <div className="mt-1 text-3xl font-bold">
              {plan.name} <span className="text-lg font-normal text-teal-100">— ${plan.price}/month</span>
            </div>
            <div className="mt-1 text-sm text-teal-100">
              {subscription?.status === "cancelled" ? "Cancelled" : "Active"}
              {subscription?.renewalDate && ` · Renews ${subscription.renewalDate}`}
            </div>
          </div>
          <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
            <div className="text-xs uppercase tracking-wide text-teal-100">AI recommendations</div>
            <div className="text-xl font-bold">
              {usageUsed} / {formatLimit(limitNum)}
            </div>
          </div>
        </div>

        {/* Alert level */}
        <div className="mt-5 border-t border-white/20 pt-4">
          <div className="mb-2 text-xs uppercase tracking-wide text-teal-100">Alert sensitivity</div>
          <div className="flex flex-wrap gap-2">
            {[
              { id: "conservative", label: "Conservative · 90–100%", min: 90 },
              { id: "balanced", label: "Balanced · 80–100%", min: 80 },
              { id: "broad", label: "Broad · 70–100%", min: 70 },
            ].map((l) => (
              <button
                key={l.id}
                onClick={() => setAlertLevel(l.id)}
                className={`rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                  (subscription?.alertLevel || "balanced") === l.id
                    ? "bg-white text-teal-700"
                    : "bg-white/15 text-white hover:bg-white/25"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Plan comparison */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PLANS.map((p) => {
          const current = p.id === planId;
          return (
            <div
              key={p.id}
              className={`flex flex-col rounded-2xl border bg-white p-5 ${
                p.popular ? "border-teal-400 ring-1 ring-teal-200" : "border-slate-200"
              }`}
            >
              <div className="mb-1 flex items-center justify-between">
                <span className="text-2xl">{p.icon}</span>
                {p.popular && (
                  <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-semibold text-teal-700">
                    POPULAR
                  </span>
                )}
              </div>
              <div className="text-lg font-semibold text-slate-900">{p.name}</div>
              <div className="text-2xl font-bold text-slate-900">
                ${p.price}
                <span className="text-sm font-normal text-slate-400">/mo</span>
              </div>
              <div className="mt-1 text-xs text-slate-500">{p.tagline}</div>
              <ul className="mt-4 flex-1 space-y-1.5">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-slate-600">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-600" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                className="mt-5 w-full"
                variant={current ? "outline" : p.popular ? "default" : "secondary"}
                disabled={current || busy}
                onClick={() => subscribe(p.id)}
              >
                {current ? "Current plan" : p.price > 0 ? `Upgrade to ${p.name}` : "Downgrade"}
              </Button>
            </div>
          );
        })}
      </div>

      {/* Payment history + referral */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Receipt className="h-4 w-4 text-teal-600" /> Payment history
          </div>
          {payments.length === 0 ? (
            <p className="text-xs text-slate-500">No payments yet. Your subscription history will appear here.</p>
          ) : (
            <div className="space-y-2">
              {payments.map((pay) => (
                <div key={pay.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-xs">
                  <div>
                    <div className="font-medium text-slate-700">{pay.plan || "Plan"}</div>
                    <div className="text-slate-400">{pay.paymentDate ? new Date(pay.paymentDate).toLocaleDateString() : ""}</div>
                  </div>
                  <div className="font-semibold text-slate-700">
                    {(pay.amount || 0).toFixed(2)} {pay.currency || "USD"}
                  </div>
                </div>
              ))}
            </div>
          )}
          {subscription?.status === "active" && subscription?.plan !== "free" && (
            <button
              onClick={cancel}
              disabled={busy}
              className="mt-4 inline-flex items-center gap-1 text-xs text-rose-600 hover:underline disabled:opacity-50"
            >
              <X className="h-3.5 w-3.5" /> Cancel subscription
            </button>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Gift className="h-4 w-4 text-teal-600" /> Refer & earn
          </div>
          <p className="text-xs text-slate-500">
            Invite 3 healthcare workers who subscribe and receive <strong>1 month of Premium free</strong>.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <code className="flex-1 rounded-xl bg-slate-50 px-3 py-2 text-sm font-mono text-slate-700">{referralCode}</code>
            <Button size="sm" variant="secondary" onClick={copyCode}>
              <Copy className="h-3.5 w-3.5" /> Copy
            </Button>
          </div>
          <div className="mt-4 text-xs text-slate-500">
            {referrals.length} referral{referrals.length === 1 ? "" : "s"} ·{" "}
            {referrals.filter((r) => r.rewardStatus === "rewarded").length} rewarded
          </div>
        </div>
      </div>
    </div>
  );
}

function PLAN_FEATURES_LIMIT(planId) {
  const limits = { free: 3, basic: 10, professional: Infinity, premium: Infinity };
  return limits[planId] ?? 3;
}