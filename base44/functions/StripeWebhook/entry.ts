import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { secrets } from "base44:runtime";

const PLAN_NAMES = { basic: "Basic", professional: "Professional", premium: "Premium" };
const PLAN_PRICES = { basic: 2, professional: 5, premium: 10 };

async function hmacSha256Hex(key, message) {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export default async function(req) {
  try {
    const sig = req.headers.get("stripe-signature");
    const secret = secrets.get("STRIPE_WEBHOOK_SECRET");
    if (!sig || !secret) {
      return Response.json({ error: "Missing signature or secret" }, { status: 400 });
    }
    const rawBody = await req.text();

    let timestamp;
    let signature;
    for (const part of sig.split(",")) {
      const [k, v] = part.trim().split("=");
      if (k === "t") timestamp = v;
      if (k === "v1") signature = v;
    }
    if (!timestamp || !signature) {
      return Response.json({ error: "Invalid signature format" }, { status: 400 });
    }

    const expected = await hmacSha256Hex(secret, `${timestamp}.${rawBody}`);
    if (expected !== signature) {
      return Response.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(rawBody);
    const base44 = createClientFromRequest(req);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = session.metadata?.user_id;
      const planId = session.metadata?.plan_id;
      if (userId && planId && PLAN_NAMES[planId]) {
        const renewal = new Date();
        renewal.setMonth(renewal.getMonth() + 1);
        const payload = {
          plan: planId,
          planName: PLAN_NAMES[planId],
          price: PLAN_PRICES[planId],
          currency: "USD",
          status: "active",
          renewalDate: renewal.toISOString().slice(0, 10),
          paymentProvider: "stripe",
          stripeSubscriptionId: session.subscription || "",
          alertLevel: "balanced",
          monthlyRecommendationsUsed: 0,
          created_by_id: userId,
        };

        const existing = await base44.asServiceRole.entities.Subscription.filter({ created_by_id: userId });
        let subRecord;
        if (existing[0]) {
          subRecord = await base44.asServiceRole.entities.Subscription.update(existing[0].id, payload);
        } else {
          subRecord = await base44.asServiceRole.entities.Subscription.create({
            ...payload,
            startDate: new Date().toISOString(),
          });
        }

        await base44.asServiceRole.entities.Payment.create({
          subscriptionId: subRecord.id,
          plan: planId,
          amount: PLAN_PRICES[planId],
          currency: "USD",
          status: "succeeded",
          paymentDate: new Date().toISOString(),
          stripePaymentId: session.id,
          description: `${PLAN_NAMES[planId]} subscription`,
          created_by_id: userId,
        });
      }
    } else if (event.type === "customer.subscription.deleted") {
      const sub = event.data.object;
      const userId = sub.metadata?.user_id;
      if (userId) {
        const existing = await base44.asServiceRole.entities.Subscription.filter({ created_by_id: userId });
        if (existing[0]) {
          await base44.asServiceRole.entities.Subscription.update(existing[0].id, {
            status: "cancelled",
            cancelledAt: new Date().toISOString(),
          });
        }
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook error", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}