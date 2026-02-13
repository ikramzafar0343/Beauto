import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
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

const PLAN_PRICES: Record<string, { monthly: number; yearly: number }> = {
  starter: {
    monthly: 5000, // $50.00 in cents
    yearly: 50000, // $500.00 in cents
  },
  pro: {
    monthly: 12500, // $125.00 in cents
    yearly: 125000, // $1250.00 in cents
  },
};

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { plan, isYearly, userId } = body;

    if (!plan || !PLAN_PRICES[plan.toLowerCase()]) {
      return NextResponse.json(
        { error: "Invalid plan selected" },
        { status: 400 }
      );
    }

    if (userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const planPrices = PLAN_PRICES[plan.toLowerCase()];
    const amount = isYearly ? planPrices.yearly : planPrices.monthly;

    // Initialize Stripe
    const stripe = getStripe();

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      metadata: {
        userId: user.id,
        plan: plan.toLowerCase(),
        isYearly: isYearly ? "true" : "false",
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error: any) {
    console.error("Payment intent creation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create payment intent" },
      { status: 500 }
    );
  }
}
