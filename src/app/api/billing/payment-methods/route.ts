import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Stripe from "stripe";

function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured. Please add it to your environment variables.");
  }
  return new Stripe(secretKey, {
    apiVersion: "2024-11-20.acacia",
  });
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      // Return empty array if Stripe is not configured
      return NextResponse.json({ paymentMethods: [] });
    }

    // Get user's Stripe customer ID
    const { data: subscription } = await supabase
      .from("user_subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .single();

    if (!subscription?.stripe_customer_id) {
      return NextResponse.json({ paymentMethods: [] });
    }

    try {
      // Initialize Stripe
      const stripe = getStripe();

      // Fetch payment methods from Stripe
      const paymentMethods = await stripe.paymentMethods.list({
        customer: subscription.stripe_customer_id,
        type: "card",
      });

      // Get customer to check default payment method
      const customer = await stripe.customers.retrieve(subscription.stripe_customer_id);

      const defaultPaymentMethodId =
        typeof customer === "object" && !customer.deleted
          ? (customer.invoice_settings?.default_payment_method as string) || null
          : null;

      const formattedMethods = paymentMethods.data.map((pm) => ({
        id: pm.id,
        type: pm.type,
        brand: pm.card?.brand,
        last4: pm.card?.last4,
        expiryMonth: pm.card?.exp_month,
        expiryYear: pm.card?.exp_year,
        isDefault: pm.id === defaultPaymentMethodId,
      }));

      return NextResponse.json({ paymentMethods: formattedMethods });
    } catch (stripeError: any) {
      // If Stripe error, return empty array
      console.error("Stripe error:", stripeError);
      return NextResponse.json({ paymentMethods: [] });
    }
  } catch (error: any) {
    console.error("Failed to fetch payment methods:", error);
    return NextResponse.json({ paymentMethods: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Stripe is not configured. Please add STRIPE_SECRET_KEY to your environment variables." },
        { status: 500 }
      );
    }

    const { paymentMethodId } = await request.json();

    if (!paymentMethodId) {
      return NextResponse.json({ error: "Payment method ID required" }, { status: 400 });
    }

    // Get or create Stripe customer
    const { data: subscription } = await supabase
      .from("user_subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .single();

    // Initialize Stripe
    const stripe = getStripe();

    let customerId = subscription?.stripe_customer_id;

    if (!customerId) {
      // Create Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id,
        },
      });
      customerId = customer.id;

      // Save customer ID to database
      await supabase
        .from("user_subscriptions")
        .upsert({
          user_id: user.id,
          stripe_customer_id: customerId,
        });
    }

    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    // Set as default if it's the first payment method
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: "card",
    });

    if (paymentMethods.data.length === 1) {
      await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed to add payment method:", error);
    return NextResponse.json(
      { error: error.message || "Failed to add payment method" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Stripe is not configured. Please add STRIPE_SECRET_KEY to your environment variables." },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const paymentMethodId = searchParams.get("id");

    if (!paymentMethodId) {
      return NextResponse.json({ error: "Payment method ID required" }, { status: 400 });
    }

    // Initialize Stripe
    const stripe = getStripe();

    // Detach payment method from customer
    await stripe.paymentMethods.detach(paymentMethodId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed to delete payment method:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete payment method" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { paymentMethodId } = await request.json();

    if (!paymentMethodId) {
      return NextResponse.json({ error: "Payment method ID required" }, { status: 400 });
    }

    // Get customer ID
    const { data: subscription } = await supabase
      .from("user_subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .single();

    if (!subscription?.stripe_customer_id) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    // Initialize Stripe
    const stripe = getStripe();

    // Set as default payment method
    await stripe.customers.update(subscription.stripe_customer_id, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed to update payment method:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update payment method" },
      { status: 500 }
    );
  }
}
