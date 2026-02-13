"use client";

import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ExternalLink } from "lucide-react";
import Link from "next/link";

export function SupabaseConfigCheck() {
  const [showWarning, setShowWarning] = useState(false);
  const [supabaseUrl, setSupabaseUrl] = useState<string | null>(null);

  useEffect(() => {
    // Check if Supabase URL is configured
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    setSupabaseUrl(url || null);

    if (!url) {
      setShowWarning(true);
    } else {
      // Validate URL format
      try {
        const parsedUrl = new URL(url);
        if (!parsedUrl.hostname.includes('supabase.co') && !parsedUrl.hostname.includes('supabase.in')) {
          setShowWarning(true);
        }
      } catch {
        setShowWarning(true);
      }
    }
  }, []);

  if (!showWarning) return null;

  return (
    <Alert className="m-4 border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800">
      <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
      <AlertTitle className="text-yellow-800 dark:text-yellow-200">
        Supabase Configuration Required
      </AlertTitle>
      <AlertDescription className="text-yellow-700 dark:text-yellow-300 mt-2">
        {!supabaseUrl ? (
          <>
            <p className="mb-2">
              Supabase environment variables are not configured. Please create a <code className="bg-yellow-100 dark:bg-yellow-900 px-1 rounded">.env.local</code> file in the root directory.
            </p>
            <p className="mb-2">Required variables:</p>
            <ul className="list-disc list-inside mb-2 space-y-1">
              <li><code>NEXT_PUBLIC_SUPABASE_URL</code></li>
              <li><code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code></li>
            </ul>
          </>
        ) : (
          <p>
            The Supabase URL appears to be invalid: <code className="bg-yellow-100 dark:bg-yellow-900 px-1 rounded">{supabaseUrl}</code>
          </p>
        )}
        <Link
          href="/SETUP_GUIDE.md"
          target="_blank"
          className="inline-flex items-center gap-1 mt-2 text-yellow-800 dark:text-yellow-200 hover:underline font-medium"
        >
          View Setup Guide <ExternalLink className="w-3 h-3" />
        </Link>
      </AlertDescription>
    </Alert>
  );
}
