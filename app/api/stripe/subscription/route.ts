import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_subscription_id, stripe_subscription_status")
    .eq("id", user.id)
    .single();

  if (!profile?.stripe_subscription_id) {
    return NextResponse.json({
      status: profile?.stripe_subscription_status || null,
      hasSubscription: false,
      cancelAtPeriodEnd: false,
      currentPeriodEnd: null,
    });
  }

  // Fetch live subscription data from Stripe
  try {
    const subscription = await stripe.subscriptions.retrieve(
      profile.stripe_subscription_id
    );

    return NextResponse.json({
      status: subscription.status,
      hasSubscription: true,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      cancelAt: subscription.cancel_at
        ? new Date(subscription.cancel_at * 1000).toISOString()
        : null,
    });
  } catch {
    return NextResponse.json({
      status: profile.stripe_subscription_status,
      hasSubscription: !!profile.stripe_subscription_id,
      cancelAtPeriodEnd: false,
      cancelAt: null,
    });
  }
}
