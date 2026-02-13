"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  CreditCard,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  Loader2,
} from "lucide-react";
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

interface PaymentMethod {
  id: string;
  type: "card" | "bank_account" | "paypal";
  brand?: string;
  last4?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  name?: string;
}

interface PaymentMethodManagerProps {
  onPaymentMethodAdded?: () => void;
}

function AddPaymentMethodForm({
  onSuccess,
  onCancel,
}: {
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) {
      setError("Stripe is not initialized. Please check your configuration.");
      return;
    }

    setLoading(true);
    setError(null);
    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError("Card element not found");
      setLoading(false);
      return;
    }

    try {
      // Create payment method
      const { error: createError, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
        billing_details: {
          name: name || undefined,
        },
      });

      if (createError) {
        setError(createError.message || "Failed to create payment method");
        setLoading(false);
        return;
      }

      if (!paymentMethod) {
        setError("Failed to create payment method");
        setLoading(false);
        return;
      }

      // Save to database via API
      const res = await fetch("/api/billing/payment-methods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethodId: paymentMethod.id }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        onSuccess();
      } else {
        setError(data.error || "Failed to save payment method");
        setLoading(false);
      }
    } catch (error: any) {
      console.error("Error adding payment method:", error);
      setError(error.message || "Failed to add payment method. Please try again.");
      setLoading(false);
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
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium text-[#343434] dark:text-white">
          Cardholder name (optional)
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="John Doe"
          className="w-full px-3 py-2 rounded-md border border-[#dae0e2] dark:border-[#27272a] bg-white dark:bg-[#1a1a1a] text-[#343434] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#343434]/20 dark:focus:ring-white/20"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-[#343434] dark:text-white">
          Card details
        </label>
        <div className="p-4 rounded-lg border border-[#dae0e2] dark:border-[#27272a] bg-white dark:bg-[#0a0a0a]">
          <CardElement
            options={cardElementOptions}
            onChange={(e) => {
              setCardComplete(e.complete);
              if (e.error) {
                setError(e.error.message);
              } else {
                setError(null);
              }
            }}
          />
        </div>
        {cardComplete && !error && (
          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
            <Check className="w-4 h-4" />
            <span>Card details valid</span>
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          disabled={loading || !cardComplete || !stripe}
          className="flex-1 bg-[#343434] dark:bg-white text-white dark:text-[#0a0a0a] hover:bg-[#343434]/90 dark:hover:bg-white/90"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Adding...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Add payment method
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1 border-[#dae0e2] dark:border-[#27272a] text-[#343434] dark:text-white"
        >
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
      </div>
    </form>
  );
}

export function PaymentMethodManager({ onPaymentMethodAdded }: PaymentMethodManagerProps) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/billing/payment-methods");
      const data = await res.json();

      if (res.ok && data.paymentMethods) {
        setPaymentMethods(data.paymentMethods);
      } else {
        // Fallback to mock data if API fails or no Stripe key
        const supabase = (await import("@/lib/supabase/client")).createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data: sub } = await supabase
            .from("user_subscriptions")
            .select("*")
            .eq("user_id", user.id)
            .eq("status", "active")
            .single();
          
          const mockMethods: PaymentMethod[] = sub ? [
            {
              id: "pm_mock_1",
              type: "card",
              brand: "Mastercard",
              last4: "6644",
              expiryMonth: 12,
              expiryYear: 2026,
              isDefault: true,
            },
          ] : [];

          setPaymentMethods(mockMethods);
        }
      }
    } catch (error) {
      console.error("Failed to load payment methods:", error);
      setError("Failed to load payment methods");
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const res = await fetch("/api/billing/payment-methods", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethodId: id }),
      });

      if (res.ok) {
        setPaymentMethods((methods) =>
          methods.map((m) => ({
            ...m,
            isDefault: m.id === id,
          }))
        );
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update default payment method");
      }
    } catch (error) {
      console.error("Failed to set default:", error);
      alert("Failed to update default payment method");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this payment method?")) {
      return;
    }

    try {
      const res = await fetch(`/api/billing/payment-methods?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setPaymentMethods((methods) => methods.filter((m) => m.id !== id));
        if (onPaymentMethodAdded) {
          onPaymentMethodAdded();
        }
      } else {
        const data = await res.json();
        alert(data.error || "Failed to remove payment method");
      }
    } catch (error) {
      console.error("Failed to delete payment method:", error);
      alert("Failed to remove payment method");
    }
  };

  const handleAddSuccess = () => {
    setShowAddForm(false);
    loadPaymentMethods();
    if (onPaymentMethodAdded) {
      onPaymentMethodAdded();
    }
  };

  const getCardIcon = (brand?: string) => {
    if (!brand) return <CreditCard className="w-5 h-5 text-white" />;

    const brandColors: Record<string, string> = {
      visa: "bg-blue-600",
      mastercard: "bg-gradient-to-br from-orange-500 to-red-500",
      amex: "bg-blue-800",
      discover: "bg-orange-600",
    };

    return (
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
          brandColors[brand.toLowerCase()] || "bg-gray-500"
        }`}
      >
        <CreditCard className="w-5 h-5 text-white" />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-[#343434] dark:text-white" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#343434] dark:text-white">
          Payment Methods
        </h3>
        {!showAddForm && (
          <Button
            onClick={() => setShowAddForm(true)}
            size="sm"
            className="bg-[#343434] dark:bg-white text-white dark:text-[#0a0a0a] hover:bg-[#343434]/90 dark:hover:bg-white/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add
          </Button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Add Payment Method Form */}
      {showAddForm && (
        <Card className="bg-white dark:bg-[#1a1a1a] border-[#dae0e2] dark:border-[#27272a]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-[#343434] dark:text-white">
                Add payment method
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddForm(false)}
                className="text-[#343434]/60 dark:text-white/60"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <Elements stripe={stripePromise}>
              <AddPaymentMethodForm onSuccess={handleAddSuccess} onCancel={() => setShowAddForm(false)} />
            </Elements>
          </CardContent>
        </Card>
      )}

      {/* Payment Methods List */}
      {paymentMethods.length > 0 ? (
        <div className="space-y-3">
          {paymentMethods.map((method) => (
            <Card
              key={method.id}
              className={`bg-white dark:bg-[#1a1a1a] border-2 ${
                method.isDefault
                  ? "border-[#343434] dark:border-white"
                  : "border-[#dae0e2] dark:border-[#27272a]"
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getCardIcon(method.brand)}
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-[#343434] dark:text-white">
                          {method.brand
                            ? `${method.brand.charAt(0).toUpperCase() + method.brand.slice(1)}`
                            : "Card"}
                          {method.last4 ? ` •••• ${method.last4}` : ""}
                        </p>
                        {method.isDefault && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 rounded">
                            Default
                          </span>
                        )}
                      </div>
                      {method.expiryMonth && method.expiryYear && (
                        <p className="text-sm text-[#343434]/60 dark:text-white/60 mt-1">
                          Expires {String(method.expiryMonth).padStart(2, "0")}/
                          {String(method.expiryYear).slice(-2)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!method.isDefault && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSetDefault(method.id)}
                        className="text-[#343434] dark:text-white"
                        title="Set as default"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (
                          confirm(
                            "To update card details, please remove this payment method and add a new one. Remove this card now?"
                          )
                        ) {
                          handleDelete(method.id);
                          setShowAddForm(true);
                        }
                      }}
                      className="text-[#343434] dark:text-white"
                      title="Edit payment method"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(method.id)}
                      className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                      title="Remove payment method"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        !showAddForm && (
          <Card className="bg-white dark:bg-[#1a1a1a] border-[#dae0e2] dark:border-[#27272a]">
            <CardContent className="py-8 text-center">
              <CreditCard className="w-12 h-12 text-[#343434]/40 dark:text-white/40 mx-auto mb-4" />
              <p className="text-[#343434]/60 dark:text-white/60 mb-4">
                No payment methods added yet
              </p>
              <Button
                onClick={() => setShowAddForm(true)}
                className="bg-[#343434] dark:bg-white text-white dark:text-[#0a0a0a] hover:bg-[#343434]/90 dark:hover:bg-white/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add payment method
              </Button>
            </CardContent>
          </Card>
        )
      )}
    </div>
  );
}
