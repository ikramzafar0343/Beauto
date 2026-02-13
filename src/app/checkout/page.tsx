"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Check, Loader2, ArrowLeft, CreditCard, AlertCircle, Zap, Lock, Sparkles, Receipt } from "lucide-react";
import Link from "next/link";
import { BillingModal } from "@/components/billing/BillingModal";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

function CheckoutForm({
  plan,
  isYearly,
  price,
  userId,
  onSuccess,
  onError,
  processing,
  setProcessing,
  setClientSecret,
  clientSecret,
  cardComplete,
  setCardComplete,
}: {
  plan: { name: string; monthlyPrice: number; yearlyPrice: number; credits: number; features: string[] };
  isYearly: boolean;
  price: number;
  userId: string;
  onSuccess: () => void;
  onError: (error: string) => void;
  processing: boolean;
  setProcessing: (processing: boolean) => void;
  setClientSecret: (secret: string | null) => void;
  clientSecret: string | null;
  cardComplete: boolean;
  setCardComplete: (complete: boolean) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();

  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        const res = await fetch("/api/payment/create-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            plan: plan.name.toLowerCase(),
            isYearly,
            userId,
          }),
        });

        const data = await res.json();
        if (res.ok && data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          onError(data.error || "Failed to initialize payment");
        }
      } catch (err: any) {
        onError("Failed to initialize payment. Please try again.");
      }
    };

    if (userId && !clientSecret) {
      createPaymentIntent();
    }
  }, [userId, isYearly, plan.name, clientSecret, setClientSecret, onError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || !clientSecret) return;

    setProcessing(true);
    onError("");

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setProcessing(false);
      return;
    }

    try {
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (confirmError) {
        onError(confirmError.message || "Payment failed");
        setProcessing(false);
        return;
      }

      if (paymentIntent?.status === "succeeded") {
        onSuccess();
      } else {
        onError("Payment was not successful. Please try again.");
        setProcessing(false);
      }
    } catch (err: any) {
      onError(err.message || "Payment failed. Please try again.");
      setProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: "16px",
        fontFamily: '"Inter", system-ui, sans-serif',
        color: "#343434",
        "::placeholder": {
          color: "#9ca3af",
        },
      },
      invalid: {
        color: "#ef4444",
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Card Details */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-[#343434] dark:text-white">
          Card Details
        </label>
        <div className="relative">
          <div className="p-4 rounded-lg border border-[#dae0e2] dark:border-[#27272a] bg-white dark:bg-[#0a0a0a]">
            <div className="flex items-center gap-2 mb-3">
              <Lock className="w-4 h-4 text-[#343434]/60 dark:text-white/60" />
              <span className="text-xs text-[#343434]/60 dark:text-white/60">
                Secure payment powered by Stripe
              </span>
            </div>
            <CardElement
              options={cardElementOptions}
              onChange={(e) => setCardComplete(e.complete)}
            />
          </div>
        </div>
      </div>

      {/* Plan Summary */}
      <div className="bg-[#f8f9fa] dark:bg-[#1a1a1a] p-4 rounded-lg border border-[#dae0e2] dark:border-[#27272a]">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-[#343434]/60 dark:text-white/60">Plan</span>
          <span className="font-medium text-[#343434] dark:text-white">{plan.name}</span>
        </div>
        <div className="h-px bg-[#dae0e2] dark:bg-[#27272a] my-2" />
        <div className="flex items-center justify-between">
          <span className="text-[#343434]/60 dark:text-white/60 text-sm">Amount</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-semibold text-[#343434] dark:text-white">
              ${price}
            </span>
            <span className="text-sm text-[#343434]/50 dark:text-white/50">
              {isYearly ? "/yr" : "/mo"}
            </span>
          </div>
        </div>
      </div>

      {/* Free Plan Banner */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Sparkles className="w-3 h-3 text-blue-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-blue-300 font-medium mb-1">
              Free Plan Available
            </p>
            <p className="text-xs text-blue-300/70 leading-relaxed">
              You can skip payment and use 200 free credits per day. You can upgrade anytime from your dashboard.
            </p>
          </div>
        </div>
      </div>

      {/* Payment Button */}
      <Button
        type="submit"
        disabled={!stripe || processing || !clientSecret || !cardComplete}
        className="w-full bg-[#343434] dark:bg-white text-white dark:text-[#0a0a0a] hover:bg-[#343434]/90 dark:hover:bg-white/90 h-12 text-lg font-medium"
      >
        {processing ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Lock className="w-5 h-5 mr-2" />
            Pay ${price}{isYearly ? "/yr" : "/mo"}
          </>
        )}
      </Button>

      {/* Security Footer */}
      <div className="flex items-center justify-center gap-2 text-xs text-[#343434]/60 dark:text-white/60">
        <Lock className="w-3 h-3" />
        <span>Secured by Stripe • Your payment information is encrypted</span>
      </div>
    </form>
  );
}

const PLAN_DETAILS: Record<string, {
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  credits: number;
  features: string[];
}> = {
  starter: {
    name: "Starter",
    monthlyPrice: 50,
    yearlyPrice: 500,
    credits: 1000,
    features: [
      "3 integrations (apps)",
      "Onboarding support",
      "Up to 3 licenses",
      "Monthly credit card payment",
      "Add-on: Video support ($10/mo)",
      "License Add-on: $10 / license"
    ],
  },
  pro: {
    name: "Pro",
    monthlyPrice: 125,
    yearlyPrice: 1250,
    credits: 5000,
    features: [
      "10 integrations (apps)",
      "Onboarding + Chatagent + Human support",
      "Up to 10 licenses",
      "Monthly credit card payment",
      "Add-on: Video support ($10/mo)",
      "License Add-on: $5 / license"
    ],
  },
};

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planParam = searchParams.get("plan");
  const [isYearly, setIsYearly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [cardComplete, setCardComplete] = useState(false);
  const [showBillingModal, setShowBillingModal] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push(`/auth/sign-in?redirect=/checkout?plan=${planParam}`);
          return;
        }

        setUserId(user.id);
        setLoading(false);
      } catch (err) {
        console.error("Auth check error:", err);
        setError("Failed to verify authentication");
        setLoading(false);
      }
    };

    if (planParam && PLAN_DETAILS[planParam.toLowerCase()]) {
      checkAuth();
    } else {
      setError("Invalid plan selected");
      setLoading(false);
    }
  }, [planParam, router]);

  const handlePaymentSuccess = async () => {
    try {
      // Call subscription upgrade API
      const res = await fetch("/api/subscription/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: planParam?.toLowerCase(),
          isYearly,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Redirect to dashboard with success message
        router.push("/dashboard?upgraded=true");
      } else {
        setError(data.error || "Failed to activate subscription");
        setProcessing(false);
      }
    } catch (err: any) {
      console.error("Subscription activation error:", err);
      setError("Failed to activate subscription. Please contact support.");
      setProcessing(false);
    }
  };

  const handleSkipPayment = () => {
    // Redirect to dashboard with free plan
    router.push("/dashboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#343434] dark:text-white" />
          <p className="text-[#343434]/60 dark:text-white/60">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (error && !planParam) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[#343434] dark:text-white mb-2">Invalid Plan</h1>
          <p className="text-[#343434]/60 dark:text-white/60 mb-6">{error}</p>
          <Link href="/pricing">
            <Button>Back to Pricing</Button>
          </Link>
        </div>
      </div>
    );
  }

  const plan = planParam ? PLAN_DETAILS[planParam.toLowerCase()] : null;
  if (!plan) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[#343434] dark:text-white mb-2">Plan Not Found</h1>
          <p className="text-[#343434]/60 dark:text-white/60 mb-6">The selected plan is not available.</p>
          <Link href="/pricing">
            <Button>Back to Pricing</Button>
          </Link>
        </div>
      </div>
    );
  }

  const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
  const savings = isYearly ? Math.round((plan.monthlyPrice * 12 - plan.yearlyPrice) / (plan.monthlyPrice * 12) * 100) : 0;

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a]">
      {/* Navigation */}
      <nav className="border-b border-[#dae0e2] dark:border-[#27272a] sticky top-0 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl z-50">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-[#343434] dark:text-white">
            Beauto
          </Link>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => setShowBillingModal(true)}
              className="text-[#343434] dark:text-white"
            >
              <Receipt className="w-4 h-4 mr-2" />
              Billing
            </Button>
            <Link href="/pricing">
              <Button variant="ghost" className="text-[#343434] dark:text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Pricing
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#343434] dark:text-white mb-4">
            Complete Your Subscription
          </h1>
          <p className="text-xl text-[#343434]/60 dark:text-white/60">
            Choose your billing cycle and complete payment to unlock all features
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <span className={`text-sm ${!isYearly ? 'text-[#343434] dark:text-white font-medium' : 'text-[#343434]/60 dark:text-white/60'}`}>
            Monthly
          </span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className={`relative w-14 h-7 rounded-full transition-colors ${
              isYearly ? 'bg-[#343434] dark:bg-white' : 'bg-[#dae0e2] dark:bg-[#27272a]'
            }`}
          >
            <span
              className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white dark:bg-[#0a0a0a] transition-transform ${
                isYearly ? 'translate-x-7' : 'translate-x-0'
              }`}
            />
          </button>
          <span className={`text-sm ${isYearly ? 'text-[#343434] dark:text-white font-medium' : 'text-[#343434]/60 dark:text-white/60'}`}>
            Yearly
            {savings > 0 && <span className="ml-1 text-green-500 text-xs">(Save {savings}%)</span>}
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Plan Summary */}
          <div className="rounded-2xl border-2 border-[#dae0e2] dark:border-[#27272a] bg-white dark:bg-[#1a1a1a] p-8">
            <h2 className="text-2xl font-bold text-[#343434] dark:text-white mb-4">
              {plan.name} Plan
            </h2>
            <div className="mb-6">
              <div className="flex items-baseline mb-2">
                <span className="text-5xl font-bold text-green-500">
                  ${price}
                </span>
                <span className="text-[#343434]/60 dark:text-white/60 ml-2">
                  {isYearly ? "/yr" : "/mo"}
                </span>
              </div>
              {isYearly && (
                <p className="text-sm text-[#343434]/60 dark:text-white/60">
                  ${Math.round(price / 12)}/month billed annually
                </p>
              )}
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                <span className="font-semibold text-[#343434] dark:text-white">
                  {plan.credits.toLocaleString()} Credits
                </span>
              </div>
              <p className="text-sm text-[#343434]/60 dark:text-white/60">
                {isYearly ? "Per year" : "Per month"}
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-[#343434] dark:text-white mb-3">What's included:</h3>
              {plan.features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-[#343434] dark:text-white">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Section */}
          <div className="rounded-2xl border-2 border-[#dae0e2] dark:border-[#27272a] bg-white dark:bg-[#1a1a1a] p-8">
            <h2 className="text-2xl font-bold text-[#343434] dark:text-white mb-6">
              Complete Your Subscription
            </h2>
            <p className="text-[#343434]/60 dark:text-white/60 mb-6">
              Subscribe to {plan.name} plan to unlock all features. Or continue with 200 free credits per day.
            </p>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm mb-6">
                {error}
              </div>
            )}

            {userId && (
              <Elements stripe={stripePromise}>
                <CheckoutForm
                  plan={plan}
                  isYearly={isYearly}
                  price={price}
                  userId={userId}
                  onSuccess={handlePaymentSuccess}
                  onError={setError}
                  processing={processing}
                  setProcessing={setProcessing}
                  setClientSecret={setClientSecret}
                  clientSecret={clientSecret}
                  cardComplete={cardComplete}
                  setCardComplete={setCardComplete}
                />
              </Elements>
            )}

            <div className="mt-6">
              <Button
                onClick={handleSkipPayment}
                variant="outline"
                className="w-full border-[#dae0e2] dark:border-[#27272a] text-[#343434] dark:text-white hover:bg-[#f8f9fa] dark:hover:bg-[#27272a]"
                disabled={processing}
              >
                Skip for now (Free Plan)
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Billing Modal */}
      <BillingModal open={showBillingModal} onClose={() => setShowBillingModal(false)} />
    </div>
  );
}
