"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, XCircle, Loader2, ExternalLink } from "lucide-react";
import Link from "next/link";

export function SupabaseConnectionTest() {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    details?: string;
  } | null>(null);

  const testConnection = async () => {
    setTesting(true);
    setResult(null);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!supabaseUrl) {
      setResult({
        success: false,
        message: "Supabase URL is not configured",
        details: "Please set NEXT_PUBLIC_SUPABASE_URL in your .env.local file",
      });
      setTesting(false);
      return;
    }

    try {
      // Test if the domain resolves
      const url = new URL(supabaseUrl);
      const testUrl = `${url.origin}/rest/v1/`;

      const response = await fetch(testUrl, {
        method: "GET",
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
        },
      });

      // Even if we get an error response, it means the server is reachable
      if (response.status >= 400 && response.status < 500) {
        // 4xx errors mean the server responded (connection works)
        setResult({
          success: true,
          message: "Connection successful!",
          details: `Supabase server at ${supabaseUrl} is reachable.`,
        });
      } else if (response.ok) {
        setResult({
          success: true,
          message: "Connection successful!",
          details: `Supabase server at ${supabaseUrl} is reachable and responding.`,
        });
      } else {
        setResult({
          success: true,
          message: "Connection successful!",
          details: `Supabase server responded (status: ${response.status}).`,
        });
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (errorMessage.includes("ERR_NAME_NOT_RESOLVED") || errorMessage.includes("Failed to fetch")) {
        setResult({
          success: false,
          message: "Cannot resolve Supabase domain",
          details: `The domain ${supabaseUrl} cannot be resolved. This usually means:
1. The Supabase project is paused (free tier projects pause after inactivity)
2. The project URL is incorrect
3. The project has been deleted

Go to https://app.supabase.com to check your project status.`,
        });
      } else {
        setResult({
          success: false,
          message: "Connection failed",
          details: errorMessage,
        });
      }
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-[#343434] dark:text-white">
            Test Supabase Connection
          </h3>
          <p className="text-xs text-[#343434]/60 dark:text-white/60 mt-1">
            Verify that your Supabase URL is accessible
          </p>
        </div>
        <Button
          onClick={testConnection}
          disabled={testing}
          variant="outline"
          size="sm"
        >
          {testing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Testing...
            </>
          ) : (
            "Test Connection"
          )}
        </Button>
      </div>

      {result && (
        <Alert
          className={
            result.success
              ? "border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800"
              : "border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800"
          }
        >
          {result.success ? (
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          ) : (
            <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          )}
          <AlertTitle
            className={
              result.success
                ? "text-green-800 dark:text-green-200"
                : "text-red-800 dark:text-red-200"
            }
          >
            {result.message}
          </AlertTitle>
          <AlertDescription
            className={
              result.success
                ? "text-green-700 dark:text-green-300 mt-2"
                : "text-red-700 dark:text-red-300 mt-2"
            }
          >
            <p className="whitespace-pre-line">{result.details}</p>
            {!result.success && (
              <div className="mt-3">
                <Link
                  href="https://app.supabase.com"
                  target="_blank"
                  className="inline-flex items-center gap-1 text-sm font-medium text-red-800 dark:text-red-200 hover:underline"
                >
                  Open Supabase Dashboard <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
