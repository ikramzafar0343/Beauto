"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, CreditCard, CheckCircle2, Lock, Sparkles } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Card, CardContent } from "@/components/ui/card";

// Initialize Stripe
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  plan: {
    name: string;
    price: number;
    yearlyPrice?: number;
    isYearly?: boolean;
  };
  userId: string;
  onSuccess: () => void;
}

function PaymentForm({ plan, userId, onSuccess, onClose }: Omit<PaymentModalProps, "open">) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [cardComplete, setCardComplete] = useState(false);

  useEffect(() => {
    // Create payment intent when component mounts
    const createPaymentIntent = async () => {
      try {
        const res = await fetch("/api/payment/create-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            plan: plan.name.toLowerCase(),
            isYearly: plan.isYearly || false,
            userId,
          }),
        });

        const data = await res.json();
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          setError(data.error || "Failed to initialize payment");
        }
      } catch (err) {
        setError("Failed to initialize payment. Please try again.");
        console.error("Payment intent error:", err);
      }
    };

    if (stripe && elements) {
      createPaymentIntent();
    }
  }, [plan, userId, stripe, elements]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || !clientSecret) return;

    setLoading(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setError("Card element not found");
      setLoading(false);
      return;
    }

    try {
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
          },
        }
      );

      if (stripeError) {
        setError(stripeError.message || "Payment failed");
        setLoading(false);
      } else if (paymentIntent?.status === "succeeded") {
        // Payment succeeded
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || "Payment failed. Please try again.");
      setLoading(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: "16px",
        fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
        fontSmoothing: "antialiased",
        color: "#ffffff",
        backgroundColor: "transparent",
        "::placeholder": {
          color: "#6b7280",
          fontWeight: "400",
        },
        iconColor: "#ffffff",
        ":-webkit-autofill": {
          color: "#ffffff",
        },
      },
      invalid: {
        color: "#ef4444",
        iconColor: "#ef4444",
        "::placeholder": {
          color: "#ef4444",
        },
      },
      complete: {
        iconColor: "#10b981",
      },
    },
    hidePostalCode: true,
  };

  const handleCardChange = (event: any) => {
    setError(null);
    setCardComplete(event.complete);
  };

  const price = plan.isYearly ? plan.yearlyPrice : plan.price;
  const period = plan.isYearly ? "/yr" : "/mo";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
          <div className="w-4 h-4 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-red-400 text-xs">!</span>
          </div>
          <span>{error}</span>
        </div>
      )}

      {/* Card Details Section */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-white/90">
          Card Details
        </Label>
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/0 rounded-lg border border-white/10" />
          <div className="relative p-4 bg-[#1a1a1a] border border-white/10 rounded-lg backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="w-4 h-4 text-white/60" />
              <span className="text-xs text-white/50">Secure payment powered by Stripe</span>
            </div>
            <div className="bg-[#0a0a0a] rounded-md p-4 border border-white/10 focus-within:border-white/20 transition-colors">
              <CardElement 
                options={cardElementOptions}
                onChange={handleCardChange}
              />
            </div>
            {cardComplete && (
              <div className="mt-3 flex items-center gap-2 text-xs text-green-400">
                <CheckCircle2 className="w-3 h-3" />
                <span>Card details valid</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Plan Summary */}
      <Card className="bg-[#1a1a1a] border-white/10">
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/60">Plan</span>
              <span className="font-medium text-white">{plan.name}</span>
            </div>
            <div className="h-px bg-white/5" />
            <div className="flex items-center justify-between">
              <span className="text-white/60 text-sm">Amount</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-semibold text-white">${price}</span>
                <span className="text-sm text-white/50">{period}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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

      {/* Action Buttons */}
      <DialogFooter className="flex-col sm:flex-row gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={loading}
          className="w-full sm:w-auto border-white/10 bg-transparent hover:bg-white/5 text-white/70 hover:text-white"
        >
          Skip for now (Free Plan)
        </Button>
        <Button
          type="submit"
          disabled={!stripe || loading || !clientSecret || !cardComplete}
          className="w-full sm:w-auto bg-white hover:bg-white/90 text-[#0a0a0a] font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Lock className="w-4 h-4 mr-2" />
              Pay ${price}{period}
            </>
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}

export default function PaymentModal({
  open,
  onClose,
  plan,
  userId,
  onSuccess,
}: PaymentModalProps) {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSuccess = async () => {
    setSuccess(true);
    setError(null);
    
    // Call subscription upgrade API
    try {
      const res = await fetch("/api/subscription/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: plan.name.toLowerCase(),
          isYearly: plan.isYearly || false,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Wait a moment to show success message
        setTimeout(() => {
          onSuccess();
          setSuccess(false);
        }, 2000);
      } else {
        setError(data.error || "Failed to activate subscription");
        setSuccess(false);
      }
    } catch (err: any) {
      console.error("Subscription activation error:", err);
      setError("Failed to activate subscription. Please contact support.");
      setSuccess(false);
    }
  };

  const price = plan.isYearly ? plan.yearlyPrice : plan.price;
  const period = plan.isYearly ? "/yr" : "/mo";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[540px] bg-[#0a0a0a] border-white/10 p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-white/10">
          <DialogTitle className="text-2xl font-semibold text-white">
            {success ? "Payment Successful!" : "Complete Your Subscription"}
          </DialogTitle>
          <DialogDescription className="text-white/60 text-sm mt-2">
            {success
              ? "Your subscription is now active. Redirecting to dashboard..."
              : `Subscribe to ${plan.name} plan to unlock all features. Or continue with 200 free credits per day.`}
          </DialogDescription>
        </DialogHeader>

        {/* Content */}
        <div className="px-6 py-6">
          {error && !success && (
            <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {success ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl" />
                <CheckCircle2 className="relative w-16 h-16 text-green-400" />
              </div>
              <p className="text-lg font-semibold text-white mb-2">
                Payment processed successfully!
              </p>
              <p className="text-sm text-white/60 text-center max-w-sm">
                Your {plan.name} subscription is now active. You'll be redirected to your dashboard shortly.
              </p>
            </div>
          ) : (
            <Elements stripe={stripePromise}>
              <PaymentForm
                plan={plan}
                userId={userId}
                onSuccess={handleSuccess}
                onClose={onClose}
              />
            </Elements>
          )}
        </div>

        {/* Footer Security Badge */}
        {!success && (
          <div className="px-6 pb-6 pt-0">
            <div className="flex items-center justify-center gap-2 text-xs text-white/40">
              <Lock className="w-3 h-3" />
              <span>Secured by Stripe • Your payment information is encrypted</span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
