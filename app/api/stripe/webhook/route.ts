import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      if (session.customer && session.subscription) {
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );
        await supabaseAdmin
          .from("profiles")
          .update({
            stripe_subscription_id: subscription.id,
            stripe_subscription_status: subscription.status,
          })
          .eq("stripe_customer_id", session.customer as string);
      }
      break;
    }

    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object;
      await supabaseAdmin
        .from("profiles")
        .update({
          stripe_subscription_status: subscription.status,
        })
        .eq("stripe_subscription_id", subscription.id);
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object;
      if (invoice.customer) {
        await supabaseAdmin
          .from("profiles")
          .update({ stripe_subscription_status: "past_due" })
          .eq("stripe_customer_id", invoice.customer as string);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
