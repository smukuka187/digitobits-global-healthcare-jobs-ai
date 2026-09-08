import { secrets } from "base44:runtime";

const PRICES = {
  basic: "price_1UDQIQKCbYFTqEfIg7BzNaUv",
  professional: "price_1UDQIQKCbYFTqEfIYlOwrRQD",
  premium: "price_1UDQIRKCbYFTqEfIuCBc69gM",
};

const PLAN_NAMES = { basic: "Basic", professional: "Professional", premium: "Premium" };

export default async function(req) {
  try {
    const body = await req.json();
    const { planId, userId, email } = body || {};
    if (!planId || !PRICES[planId]) {
      return Response.json({ error: "Invalid plan" }, { status: 400 });
    }
    if (!userId) {
      return Response.json({ error: "User required" }, { status: 400 });
    }

    const origin = req.headers.get("origin") || "https://neat-global-health-path.base44.app";
    const stripeKey = secrets.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      return Response.json({ error: "Stripe not configured" }, { status: 500 });
    }

    const headers = {
      Authorization: `Bearer ${stripeKey}`,
      "Stripe-Version": "2025-10-29.clover",
      "Idempotency-Key": crypto.randomUUID(),
    };

    const params = new URLSearchParams();
    params.set("mode", "subscription");
    params.set("line_items[0][price]", PRICES[planId]);
    params.set("line_items[0][quantity]", "1");
    params.set("success_url", `${origin}/billing?success=1`);
    params.set("cancel_url", `${origin}/billing?canceled=1`);
    params.set("metadata[base44_app_id]", process.env.BASE44_APP_ID);
    params.set("metadata[user_id]", userId);
    params.set("metadata[plan_id]", planId);
    params.set("subscription_data[metadata][base44_app_id]", process.env.BASE44_APP_ID);
    params.set("subscription_data[metadata][user_id]", userId);
    params.set("subscription_data[metadata][plan_id]", planId);
    if (email) params.set("customer_email", email);

    const r = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers,
      body: params,
    });
    const session = await r.json();
    if (!r.ok) {
      console.error("Stripe checkout error", session.error);
      return Response.json({ error: session.error?.message || "Checkout failed" }, { status: 400 });
    }
    return Response.json({ url: session.url });
  } catch (error) {
    console.error("CreateCheckout error", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}