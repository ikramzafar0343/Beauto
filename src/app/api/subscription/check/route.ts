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
    const { data: subscription, error: subError } = await supabase
      .from("user_subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (subError && subError.code !== "PGRST116") {
      // PGRST116 = no rows returned, which is fine (free user)
      console.error("Subscription check error:", subError);
    }

    // Return subscription info or default to free
    return NextResponse.json({
      plan: subscription?.plan || "free",
      status: subscription?.status || "active",
      isYearly: subscription?.is_yearly || false,
      currentPeriodEnd: subscription?.current_period_end || null,
    });
  } catch (error: any) {
    console.error("Failed to check subscription:", error);
    return NextResponse.json(
      { error: error.message || "Failed to check subscription" },
      { status: 500 }
    );
  }
}
