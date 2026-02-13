import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("Upload auth error:", authError);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File size exceeds 10MB limit" }, { status: 400 });
    }

    // Generate unique filename
    const fileExt = file.name.split(".").pop() || "bin";
    const fileName = `${user.id}/${Date.now()}-${crypto.randomUUID()}.${fileExt}`;

    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Use Uint8Array instead of Buffer for better compatibility
    const uint8Array = new Uint8Array(arrayBuffer);

    // Use bucket from env or default to "beauto"
    const bucketName = process.env.SUPABASE_STORAGE_BUCKET || "beauto";

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, uint8Array, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

    if (error) {
      console.error("Supabase storage upload error:", error);
      
      // Check if bucket doesn't exist
      if (error.message?.includes("Bucket not found") || error.message?.includes("does not exist")) {
        return NextResponse.json({ 
          error: `Storage bucket '${bucketName}' not found. Please create it in Supabase Storage or set SUPABASE_STORAGE_BUCKET environment variable.` 
        }, { status: 500 });
      }
      
      // Check for permission errors (RLS policy violation)
      const status = (error as unknown as { status?: number; statusCode?: number | string }).status ??
        (error as unknown as { statusCode?: number | string }).statusCode;

      if (error.message?.includes("new row violates row-level security") || 
          error.message?.includes("RLS") || 
          status === "403" ||
          status === 403) {
        return NextResponse.json({ 
          error: `Storage bucket RLS policies not configured. Please run the migration file 'supabase/migrations/001_storage_bucket_policies.sql' in your Supabase SQL Editor, or create the bucket '${bucketName}' with proper RLS policies in Supabase Dashboard > Storage.` 
        }, { status: 403 });
      }
      
      return NextResponse.json({ 
        error: error.message || "Failed to upload file" 
      }, { status: 500 });
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    return NextResponse.json({
      url: publicUrl,
      name: file.name,
      type: file.type,
      size: file.size,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ 
      error: error.message || "Failed to upload file. Please try again." 
    }, { status: 500 });
  }
}
