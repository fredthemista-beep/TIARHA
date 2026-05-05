// apps/web/lib/stripe.ts
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia',
  typescript: true,
});

export const PRICE_IDS = {
  starter_monthly:  process.env.STRIPE_PRICE_STARTER_MONTHLY!,
  pro_monthly:      process.env.STRIPE_PRICE_PRO_MONTHLY!,
  starter_yearly:   process.env.STRIPE_PRICE_STARTER_YEARLY!,
  pro_yearly:       process.env.STRIPE_PRICE_PRO_YEARLY!,
} as const;
