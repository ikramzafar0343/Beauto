import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const CREDITS_PER_SEARCH = 25;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const amount = body.amount || CREDITS_PER_SEARCH;

    // Deduct credits using the function
    const { data, error } = await supabase.rpc("deduct_credits", {
      p_user_id: user.id,
      p_amount: amount,
    });

    if (error) {
      console.error("RPC deduct_credits error:", error);
      // If function doesn't exist, try direct table update as fallback
      if (error.message?.includes("function") || error.message?.includes("does not exist")) {
        console.warn("deduct_credits function not found, using fallback method");
        
        // Fallback: Direct table update
        const { data: currentCredits } = await supabase
          .from("user_credits")
          .select("daily_credits, used_credits, last_reset_date")
          .eq("user_id", user.id)
          .single();

        if (!currentCredits) {
          // Create new record
          const { data: newCredits, error: insertError } = await supabase
            .from("user_credits")
            .insert({
              user_id: user.id,
              daily_credits: 200,
              used_credits: amount,
              last_reset_date: new Date().toISOString().split("T")[0],
            })
            .select()
            .single();

          if (insertError) throw insertError;
          
          return NextResponse.json({
            success: true,
            available_credits: 200 - amount,
            message: `Credits deducted. ${200 - amount} credits remaining.`,
          });
        }

        // Check if reset needed
        const today = new Date().toISOString().split("T")[0];
        const resetNeeded = currentCredits.last_reset_date !== today;

        const newUsed = resetNeeded ? amount : currentCredits.used_credits + amount;
        const available = currentCredits.daily_credits - newUsed;

        if (available < 0) {
          return NextResponse.json(
            {
              success: false,
              available_credits: resetNeeded ? currentCredits.daily_credits : (currentCredits.daily_credits - currentCredits.used_credits),
              message: `Insufficient credits. You have ${resetNeeded ? currentCredits.daily_credits : (currentCredits.daily_credits - currentCredits.used_credits)} credits, but need ${amount}. Please upgrade your plan.`,
            },
            { status: 402 }
          );
        }

        const { error: updateError } = await supabase
          .from("user_credits")
          .update({
            used_credits: newUsed,
            last_reset_date: resetNeeded ? today : currentCredits.last_reset_date,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user.id);

        if (updateError) throw updateError;

        return NextResponse.json({
          success: true,
          available_credits: available,
          message: `Credits deducted. ${available} credits remaining.`,
        });
      }
      throw error;
    }

    const result = data?.[0] || {
      success: false,
      available_credits: 0,
      message: "Failed to deduct credits",
    };

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          available_credits: result.available_credits,
          message: result.message,
        },
        { status: 402 } // Payment Required
      );
    }

    return NextResponse.json({
      success: true,
      available_credits: result.available_credits,
      message: result.message,
    });
  } catch (error: any) {
    console.error("Failed to deduct credits:", error);
    return NextResponse.json(
      { error: error.message || "Failed to deduct credits" },
      { status: 500 }
    );
  }
}
