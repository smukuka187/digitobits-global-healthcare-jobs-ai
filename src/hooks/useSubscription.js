import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { PLAN_FEATURES, PLANS } from "@/lib/plans";

export function useSubscription() {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await base44.entities.Subscription.list("-created_date", 1);
      setSubscription(list[0] || null);
    } catch (e) {
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const planId = subscription?.plan || "free";
  const plan = PLANS.find((p) => p.id === planId) || PLANS[0];
  const features = PLAN_FEATURES[planId] || PLAN_FEATURES.free;

  const hasFeature = useCallback(
    (feature) => Boolean(features[feature]),
    [features]
  );

  const limit = useCallback((name) => features[name], [features]);

  return {
    subscription,
    loading,
    refresh: load,
    setSubscription,
    planId,
    plan,
    features,
    isFree: planId === "free",
    isBasic: planId === "basic",
    isProfessional: planId === "professional",
    isPremium: planId === "premium",
    isPaid: planId === "basic" || planId === "professional" || planId === "premium",
    hasFeature,
    limit,
  };
}