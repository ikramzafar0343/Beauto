import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const PLAN_CREDITS: Record<string, number> = {
  starter: 1000,
  pro: 5000,
  enterprise: 10000,
};

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { plan, isYearly = false } = body;

    if (!plan || !PLAN_CREDITS[plan.toLowerCase()]) {
      return NextResponse.json(
        { error: "Invalid plan selected" },
        { status: 400 }
      );
    }

    const planName = plan.toLowerCase();
    const credits = PLAN_CREDITS[planName];

    // Calculate period end date (30 days for monthly, 365 days for yearly)
    const periodEnd = new Date();
    periodEnd.setDate(periodEnd.getDate() + (isYearly ? 365 : 30));

    // Upsert subscription
    const { data: subscription, error: subError } = await supabase
      .from("user_subscriptions")
      .upsert({
        user_id: user.id,
        plan: planName,
        status: "active",
        is_yearly: isYearly,
        current_period_start: new Date().toISOString(),
        current_period_end: periodEnd.toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: "user_id",
      })
      .select()
      .single();

    if (subError) {
      console.error("Subscription upsert error:", subError);
      return NextResponse.json(
        { error: "Failed to create subscription" },
        { status: 500 }
      );
    }

    // Update user credits with new plan credits
    // First, try to get existing credits
    const { data: existingCredits } = await supabase
      .from("user_credits")
      .select("*")
      .eq("user_id", user.id)
      .single();

    const { error: creditsError } = await supabase
      .from("user_credits")
      .upsert({
        user_id: user.id,
        daily_credits: credits, // Monthly credits for paid plans
        used_credits: existingCredits?.used_credits || 0,
        subscription_plan: planName,
        last_reset_date: new Date().toISOString().split("T")[0],
        updated_at: new Date().toISOString(),
      }, {
        onConflict: "user_id",
      });

    if (creditsError) {
      console.error("Credits update error:", creditsError);
      // Don't fail the request, subscription is created
    }

    return NextResponse.json({
      success: true,
      subscription: {
        plan: planName,
        status: "active",
        credits,
        periodEnd: periodEnd.toISOString(),
      },
    });
  } catch (error: any) {
    console.error("Subscription upgrade error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upgrade subscription" },
      { status: 500 }
    );
  }
}
