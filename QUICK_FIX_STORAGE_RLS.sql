-- ============================================================================
-- QUICK FIX: Storage Bucket RLS Policies
-- ============================================================================
-- Copy and paste this entire file into Supabase SQL Editor and run it.
-- This will fix the "new row violates row-level security policy" error.
--
-- NOTE: RLS is already enabled on storage.objects by Supabase by default.
-- We only need to create the policies, not enable RLS.
-- ============================================================================

-- Step 1: Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Users can upload files to their own folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can read their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;

-- Step 3: Create policies using string matching (more reliable)
-- Replace 'beauto' with your actual bucket name if different

CREATE POLICY "Users can upload files to their own folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'beauto' AND
  name LIKE auth.uid()::text || '/%'
);

CREATE POLICY "Users can read their own files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'beauto' AND
  name LIKE auth.uid()::text || '/%'
);

CREATE POLICY "Users can update their own files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'beauto' AND
  name LIKE auth.uid()::text || '/%'
)
WITH CHECK (
  bucket_id = 'beauto' AND
  name LIKE auth.uid()::text || '/%'
);

CREATE POLICY "Users can delete their own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'beauto' AND
  name LIKE auth.uid()::text || '/%'
);

-- ============================================================================
-- DONE! Your storage bucket should now allow authenticated users to upload files.
-- Try uploading a file again - it should work now.
-- ============================================================================
