// apps/web/app/api/stripe/webhook/route.ts
import { getStripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { PlanType } from '@tiarh/ui';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getPlanLimits(): Record<string, { plan: PlanType; nb_agents_max: number }> {
  return {
    [process.env.STRIPE_PRICE_STARTER_MONTHLY ?? '']: { plan: 'starter', nb_agents_max: 350 },
    [process.env.STRIPE_PRICE_PRO_MONTHLY ?? '']:     { plan: 'pro',     nb_agents_max: 2000 },
    [process.env.STRIPE_PRICE_STARTER_YEARLY ?? '']:  { plan: 'starter', nb_agents_max: 350 },
    [process.env.STRIPE_PRICE_PRO_YEARLY ?? '']:      { plan: 'pro',     nb_agents_max: 2000 },
  };
}

export async function POST(req: Request) {
  const stripe = getStripe();
  const body = await req.text();
  const sig = req.headers.get('stripe-signature') ?? '';
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  let event: ReturnType<typeof stripe.webhooks.constructEvent>;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = await createClient();
  const planLimits = getPlanLimits();

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as { customer: string; subscription: string; metadata: Record<string, string> };
    const priceId = session.metadata['price_id'] ?? '';
    const planData = planLimits[priceId] ?? { plan: 'free' as PlanType, nb_agents_max: 50 };

    await supabase.from('collectivites').update({
      plan: planData.plan,
      nb_agents_max: planData.nb_agents_max,
      stripe_customer_id: session.customer,
      stripe_subscription_id: session.subscription,
    }).eq('stripe_customer_id', session.customer);
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as { id: string };
    await supabase.from('collectivites').update({
      plan: 'free',
      nb_agents_max: 50,
      stripe_subscription_id: null,
    }).eq('stripe_subscription_id', sub.id);
  }

  return NextResponse.json({ received: true });
}
