// apps/web/lib/stripe.ts
import Stripe from 'stripe';

let _instance: Stripe | undefined;

export function getStripe(): Stripe {
  if (_instance) return _instance;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not set at runtime');
  }
  // The SDK's apiVersion literal-union may lag behind newer dashboard versions; cast to any to opt out.
  _instance = new Stripe(key, {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    apiVersion: '2026-04-22.dahlia' as any,
    typescript: true,
  });
  return _instance;
}

export function getPriceIds() {
  return {
    starter_monthly: process.env.STRIPE_PRICE_STARTER_MONTHLY,
    pro_monthly:     process.env.STRIPE_PRICE_PRO_MONTHLY,
    starter_yearly:  process.env.STRIPE_PRICE_STARTER_YEARLY,
    pro_yearly:      process.env.STRIPE_PRICE_PRO_YEARLY,
  } as const;
}
