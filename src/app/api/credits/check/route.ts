import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check user subscription to determine credit limits
    const { data: subscription } = await supabase
      .from("user_subscriptions")
      .select("plan, status")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();

    // Determine credit limits based on subscription
    const planCredits: Record<string, number> = {
      starter: 1000, // 1000 credits per month for Starter
      pro: 5000, // 5000 credits per month for Pro
      enterprise: 10000, // 10000 credits per month for Enterprise
    };

    const defaultCredits = subscription?.plan && planCredits[subscription.plan]
      ? planCredits[subscription.plan]
      : 200; // Free users get 200 credits per day

    // Use the function to get credits (auto-resets if needed)
    let data, error;
    try {
      const result = await supabase.rpc("get_user_credits", {
        p_user_id: user.id,
      });
      data = result.data;
      error = result.error;
    } catch (e: any) {
      error = e;
    }

    // Fallback if function doesn't exist
    if (error && (error.message?.includes("function") || error.message?.includes("does not exist"))) {
      console.warn("get_user_credits function not found, using fallback method");
      
      const { data: creditsData, error: selectError } = await supabase
        .from("user_credits")
        .select("daily_credits, used_credits, last_reset_date, subscription_plan")
        .eq("user_id", user.id)
        .single();

      if (selectError && selectError.code !== "PGRST116") {
        // PGRST116 = no rows returned, which is fine
        throw selectError;
      }

      // Check if subscription changed or credits need update
      const needsUpdate = !creditsData || 
        (subscription?.plan && creditsData.subscription_plan !== subscription.plan) ||
        (!subscription && creditsData.subscription_plan !== "free");

      if (!creditsData || needsUpdate) {
        // Create or update record with correct credits
        const creditsToSet = subscription?.plan && planCredits[subscription.plan]
          ? planCredits[subscription.plan]
          : 200;

        const { data: newCredits, error: upsertError } = await supabase
          .from("user_credits")
          .upsert({
            user_id: user.id,
            daily_credits: creditsToSet,
            used_credits: creditsData?.used_credits || 0,
            last_reset_date: creditsData?.last_reset_date || new Date().toISOString().split("T")[0],
            subscription_plan: subscription?.plan || "free",
            updated_at: new Date().toISOString(),
          }, {
            onConflict: "user_id",
          })
          .select()
          .single();

        if (upsertError) throw upsertError;

        const today = new Date().toISOString().split("T")[0];
        const resetNeeded = newCredits.last_reset_date !== today;

        return NextResponse.json({
          daily_credits: creditsToSet,
          used_credits: resetNeeded ? 0 : (newCredits.used_credits || 0),
          available_credits: resetNeeded ? creditsToSet : (creditsToSet - (newCredits.used_credits || 0)),
          last_reset_date: resetNeeded ? today : newCredits.last_reset_date,
        });
      }

      // Check if reset needed (for free users, reset daily; for paid, reset monthly)
      const today = new Date().toISOString().split("T")[0];
      const isFreeUser = !subscription || subscription.plan === "free";
      const resetNeeded = isFreeUser
        ? creditsData.last_reset_date !== today
        : false; // Paid users reset monthly via subscription period

      let usedCredits = creditsData.used_credits;
      let resetDate = creditsData.last_reset_date;

      if (resetNeeded) {
        // Reset credits
        usedCredits = 0;
        resetDate = today;
        await supabase
          .from("user_credits")
          .update({
            used_credits: 0,
            last_reset_date: today,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user.id);
      }

      return NextResponse.json({
        daily_credits: creditsData.daily_credits,
        used_credits: usedCredits,
        available_credits: creditsData.daily_credits - usedCredits,
        last_reset_date: resetDate,
      });
    }

    if (error) throw error;

    const credits = data?.[0] || {
      daily_credits: 200,
      used_credits: 0,
      available_credits: 200,
      last_reset_date: new Date().toISOString().split("T")[0],
    };

    return NextResponse.json({
      daily_credits: credits.daily_credits,
      used_credits: credits.used_credits,
      available_credits: credits.available_credits,
      last_reset_date: credits.last_reset_date,
    });
  } catch (error: any) {
    console.error("Failed to check credits:", error);
    return NextResponse.json(
      { error: error.message || "Failed to check credits" },
      { status: 500 }
    );
  }
}
