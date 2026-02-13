import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured. Please add it to your environment variables.");
  }
  return new Stripe(secretKey, {
    apiVersion: "2024-12-18.acacia",
  });
}

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "No signature" },
      { status: 400 }
    );
  }

  // Initialize Stripe
  const stripe = getStripe();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const userId = paymentIntent.metadata.userId;
        const plan = paymentIntent.metadata.plan;
        const isYearly = paymentIntent.metadata.isYearly === "true";

        if (!userId || !plan) {
          console.error("Missing metadata in payment intent");
          break;
        }

        // Update user subscription in database
        const { error: updateError } = await supabaseAdmin
          .from("user_subscriptions")
          .upsert({
            user_id: userId,
            plan: plan,
            status: "active",
            is_yearly: isYearly,
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(
              Date.now() + (isYearly ? 365 : 30) * 24 * 60 * 60 * 1000
            ).toISOString(),
            updated_at: new Date().toISOString(),
          }, {
            onConflict: "user_id",
          });

        if (updateError) {
          console.error("Failed to update subscription:", updateError);
        } else {
          // Update user credits based on plan
          const planCredits: Record<string, number> = {
            starter: 1000, // 1000 credits per month for Starter
            pro: 5000, // 5000 credits per month for Pro
          };

          const credits = planCredits[plan] || 200;

          // Update or create user credits
          const { error: creditsError } = await supabaseAdmin
            .from("user_credits")
            .upsert({
              user_id: userId,
              daily_credits: credits,
              used_credits: 0,
              subscription_plan: plan,
              last_reset_date: new Date().toISOString().split("T")[0],
              updated_at: new Date().toISOString(),
            }, {
              onConflict: "user_id",
            });

          if (creditsError) {
            console.error("Failed to update credits:", creditsError);
          }
        }

        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.error("Payment failed:", paymentIntent.id);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
