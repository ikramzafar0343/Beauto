import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user subscription
    const { data: subscription } = await supabase
      .from("user_subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!subscription) {
      return NextResponse.json({ invoices: [] });
    }

    // Mock invoices - in production, fetch from Stripe
    const invoices = [
      {
        id: `inv_${subscription.id.slice(0, 8)}`,
        date: new Date(subscription.current_period_start).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        amount: subscription.is_yearly
          ? (subscription.plan === "starter" ? 500 : subscription.plan === "pro" ? 1250 : 0)
          : (subscription.plan === "starter" ? 50 : subscription.plan === "pro" ? 125 : 0),
        currency: "USD",
        status: subscription.status === "active" ? "Paid" : subscription.status,
        service: `${subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)} Plan`,
      },
    ];

    return NextResponse.json({ invoices });
  } catch (error: any) {
    console.error("Failed to fetch invoices:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}
