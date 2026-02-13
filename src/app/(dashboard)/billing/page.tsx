"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  CreditCard, 
  ChevronDown, 
  ChevronUp, 
  Search,
  Calendar,
  CheckCircle2,
  Globe,
  Edit
} from "lucide-react";
import Link from "next/link";

interface Subscription {
  plan: string;
  price: number;
  period: string;
  nextBillingDate: string;
  status: string;
}

interface PaymentMethod {
  type: string;
  last4: string;
  brand: string;
  expiryMonth?: number;
  expiryYear?: number;
}

interface BillingInfo {
  name: string;
  email: string;
  address?: string;
}

interface Invoice {
  id: string;
  date: string;
  amount: number;
  currency: string;
  status: string;
  service: string;
}

export default function BillingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [billingInfo, setBillingInfo] = useState<BillingInfo | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        router.push("/auth/sign-in");
        return;
      }

      setUser(currentUser);

      // Load subscription
      const { data: subData } = await supabase
        .from("user_subscriptions")
        .select("*")
        .eq("user_id", currentUser.id)
        .eq("status", "active")
        .single();

      if (subData) {
        const planPrices: Record<string, { monthly: number; yearly: number }> = {
          starter: { monthly: 50, yearly: 500 },
          pro: { monthly: 125, yearly: 1250 },
          enterprise: { monthly: 0, yearly: 0 },
        };

        const price = subData.is_yearly 
          ? planPrices[subData.plan]?.yearly || 0
          : planPrices[subData.plan]?.monthly || 0;

        const nextBilling = new Date(subData.current_period_end);
        
        setSubscription({
          plan: subData.plan.charAt(0).toUpperCase() + subData.plan.slice(1),
          price,
          period: subData.is_yearly ? "per year" : "per month",
          nextBillingDate: nextBilling.toLocaleDateString("en-US", { 
            year: "numeric", 
            month: "long", 
            day: "numeric" 
          }),
          status: subData.status,
        });

        // Mock payment method (in real app, fetch from Stripe)
        setPaymentMethod({
          type: "card",
          last4: "6644",
          brand: "Mastercard",
          expiryMonth: 12,
          expiryYear: 2026,
        });

        // Load billing info
        const { data: { user: userData } } = await supabase.auth.getUser();
        if (userData) {
          setBillingInfo({
            name: userData.user_metadata?.full_name || userData.email?.split("@")[0] || "User",
            email: userData.email || "",
            address: "R-123 Sector 10 North Karachi Karachi-74200-PK", // Mock data
          });
        }

        // Load invoices
        try {
          const invoicesRes = await fetch("/api/billing/invoices");
          const invoicesData = await invoicesRes.json();
          if (invoicesData.invoices) {
            setInvoices(invoicesData.invoices);
          }
        } catch (err) {
          console.error("Failed to load invoices:", err);
        }
      } else {
        // Free user - no subscription
        setSubscription(null);
      }
    } catch (error) {
      console.error("Failed to load billing data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm("Are you sure you want to cancel your subscription? You'll lose access to premium features.")) {
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("user_subscriptions")
        .update({ status: "cancelled" })
        .eq("user_id", user.id);

      if (error) throw error;

      alert("Subscription cancelled successfully.");
      loadBillingData();
    } catch (error: any) {
      console.error("Failed to cancel subscription:", error);
      alert("Failed to cancel subscription. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#343434]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#343434] dark:text-white mb-2">Billing</h1>
          <p className="text-[#343434]/60 dark:text-white/60">Manage your subscription and payment methods</p>
        </div>
        {subscription && (
          <Button
            onClick={handleCancelSubscription}
            variant="outline"
            className="border-[#dae0e2] dark:border-[#27272a] text-[#343434] dark:text-white hover:bg-[#f8f9fa] dark:hover:bg-[#27272a]"
          >
            Cancel subscription
          </Button>
        )}
      </div>

      {/* Subscription Overview */}
      {subscription ? (
        <Card className="bg-white dark:bg-[#1a1a1a] border-[#dae0e2] dark:border-[#27272a]">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl font-bold text-[#343434] dark:text-white mb-2">
                  Beauto {subscription.plan}
                </CardTitle>
                <p className="text-xl font-semibold text-[#343434] dark:text-white mb-1">
                  ${subscription.price.toFixed(2)} {subscription.period}
                </p>
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="flex items-center gap-1 text-sm text-[#343434]/60 dark:text-white/60 hover:text-[#343434] dark:hover:text-white mt-2"
                >
                  View details
                  {showDetails ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
                {showDetails && (
                  <div className="mt-4 space-y-2 text-sm text-[#343434]/60 dark:text-white/60">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      <span>Charged in USD</span>
                    </div>
                  </div>
                )}
                <p className="text-sm text-[#343434]/60 dark:text-white/60 mt-2">
                  Your next billing date is {subscription.nextBillingDate}.
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Payment Method Summary */}
            {paymentMethod && (
              <div className="flex items-center justify-between pt-4 border-t border-[#dae0e2] dark:border-[#27272a]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-[#343434] dark:text-white">
                      {paymentMethod?.brand} •••• {paymentMethod?.last4}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-white dark:bg-[#1a1a1a] border-[#dae0e2] dark:border-[#27272a]">
          <CardContent className="py-12 text-center">
            <p className="text-[#343434]/60 dark:text-white/60 mb-4">No active subscription</p>
            <Link href="/pricing">
              <Button className="bg-[#343434] dark:bg-white text-white dark:text-[#0a0a0a]">
                View Plans
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Billing Information */}
      <Card className="bg-white dark:bg-[#1a1a1a] border-[#dae0e2] dark:border-[#27272a]">
        <CardHeader>
          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-[#343434]/60 dark:text-white/60">
            Billing Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {billingInfo && (
            <>
              <div className="flex items-center justify-between py-2">
                <span className="text-[#343434]/60 dark:text-white/60">Name</span>
                <span className="font-medium text-[#343434] dark:text-white">{billingInfo.name}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-[#343434]/60 dark:text-white/60">Email</span>
                <span className="font-medium text-[#343434] dark:text-white">{billingInfo.email}</span>
              </div>
              {billingInfo.address && (
                <div className="flex items-center justify-between py-2">
                  <span className="text-[#343434]/60 dark:text-white/60">Billing address</span>
                  <span className="font-medium text-[#343434] dark:text-white text-right max-w-md">
                    {billingInfo.address}
                  </span>
                </div>
              )}
              <Link href="/billing/information">
                <Button variant="ghost" className="text-[#343434] dark:text-white w-full justify-start mt-2">
                  <Edit className="w-4 h-4 mr-2" />
                  Update information
                </Button>
              </Link>
            </>
          )}
        </CardContent>
      </Card>

      {/* Invoice History */}
      <Card className="bg-white dark:bg-[#1a1a1a] border-[#dae0e2] dark:border-[#27272a]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-[#343434]/60 dark:text-white/60">
              Invoice History
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-[#343434]/60 dark:text-white/60">
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {invoices.length > 0 ? (
            <div className="space-y-4">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="p-4 rounded-lg border border-[#dae0e2] dark:border-[#27272a] bg-[#f8f9fa] dark:bg-[#0a0a0a]"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#343434]/60 dark:text-white/60" />
                      <span className="text-sm text-[#343434]/60 dark:text-white/60">{invoice.date}</span>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        invoice.status === "Paid"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                      }`}
                    >
                      {invoice.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-[#343434] dark:text-white">{invoice.service}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-medium text-[#343434] dark:text-white">
                          {invoice.currency === "USD" ? "$" : invoice.currency} {invoice.amount.toFixed(2)}
                        </span>
                        {invoice.currency !== "USD" && (
                          <>
                            <span className="text-[#343434]/40 dark:text-white/40">↔</span>
                            <span className="text-sm text-[#343434]/60 dark:text-white/60">$20.00</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-[#343434]/60 dark:text-white/60 py-8">No invoices yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
