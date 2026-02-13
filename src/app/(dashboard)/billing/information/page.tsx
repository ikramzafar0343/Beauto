"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChevronRight, Edit } from "lucide-react";
import Link from "next/link";

export default function BillingInformationPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [billingInfo, setBillingInfo] = useState({
    name: "",
    email: "",
    address: "",
  });

  useEffect(() => {
    loadBillingInfo();
  }, []);

  const loadBillingInfo = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setBillingInfo({
          name: user.user_metadata?.full_name || user.email?.split("@")[0] || "",
          email: user.email || "",
          address: "R-123 Sector 10 North Karachi Karachi-74200-PK", // Mock data
        });
      }
    } catch (error) {
      console.error("Failed to load billing info:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // In a real app, save to database
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert("Billing information updated successfully!");
      router.push("/billing");
    } catch (error) {
      console.error("Failed to update billing info:", error);
      alert("Failed to update billing information. Please try again.");
    } finally {
      setSaving(false);
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
    <div className="max-w-2xl mx-auto px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[#343434]/60 dark:text-white/60 mb-6">
        <Link href="/billing" className="hover:text-[#343434] dark:hover:text-white">
          Billing
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-[#343434] dark:text-white">Billing information</span>
      </div>

      {/* Title */}
      <h1 className="text-3xl font-bold text-[#343434] dark:text-white mb-8">
        Billing Information
      </h1>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-[#343434] dark:text-white">
            Name
          </Label>
          <Input
            id="name"
            value={billingInfo.name}
            onChange={(e) => setBillingInfo({ ...billingInfo, name: e.target.value })}
            className="bg-white dark:bg-[#1a1a1a] border-[#dae0e2] dark:border-[#27272a] text-[#343434] dark:text-white"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-[#343434] dark:text-white">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={billingInfo.email}
            onChange={(e) => setBillingInfo({ ...billingInfo, email: e.target.value })}
            className="bg-white dark:bg-[#1a1a1a] border-[#dae0e2] dark:border-[#27272a] text-[#343434] dark:text-white"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address" className="text-[#343434] dark:text-white">
            Billing address
          </Label>
          <Textarea
            id="address"
            value={billingInfo.address}
            onChange={(e) => setBillingInfo({ ...billingInfo, address: e.target.value })}
            rows={3}
            className="bg-white dark:bg-[#1a1a1a] border-[#dae0e2] dark:border-[#27272a] text-[#343434] dark:text-white"
            required
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            disabled={saving}
            className="flex-1 bg-[#343434] dark:bg-white text-white dark:text-[#0a0a0a] hover:bg-[#343434]/90 dark:hover:bg-white/90"
          >
            {saving ? "Saving..." : "Save changes"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="flex-1 border-[#dae0e2] dark:border-[#27272a] text-[#343434] dark:text-white"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
