# Storage Bucket Setup Guide

## Problem
You're getting a `403` error: "new row violates row-level security policy" when trying to upload files.

## Solution

### Option 1: Run SQL Migration (Recommended)

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase/migrations/001_storage_bucket_policies.sql` OR `QUICK_FIX_STORAGE_RLS.sql`
4. **IMPORTANT**: Replace `'beauto'` with your actual bucket name if different (check your `.env.local` file for `SUPABASE_STORAGE_BUCKET`)
5. Click **Run** to execute the SQL
6. **Note**: If you get an error about "must be owner of table objects", that's normal - RLS is already enabled by Supabase. The migration will just create the policies.

### Option 2: Create Bucket and Policies via Dashboard

1. **Create the Bucket**:
   - Go to Supabase Dashboard > **Storage**
   - Click **New bucket**
   - Name it `beauto` (or your configured bucket name)
   - Keep it **Private** (not public)
   - Click **Create bucket**

2. **Set up RLS Policies**:
   - Go to Supabase Dashboard > **Storage** > **Policies**
   - Select your bucket (`beauto`)
   - Click **New Policy**
   - Create the following policies:

   **Policy 1: Allow Upload**
   - Policy name: `Users can upload files to their own folder`
   - Allowed operation: `INSERT`
   - Target roles: `authenticated`
   - Policy definition:
     ```sql
     bucket_id = 'beauto' AND
     name LIKE auth.uid()::text || '/%'
     ```

   **Policy 2: Allow Read**
   - Policy name: `Users can read their own files`
   - Allowed operation: `SELECT`
   - Target roles: `authenticated`
   - Policy definition:
     ```sql
     bucket_id = 'beauto' AND
     name LIKE auth.uid()::text || '/%'
     ```

   **Policy 3: Allow Update**
   - Policy name: `Users can update their own files`
   - Allowed operation: `UPDATE`
   - Target roles: `authenticated`
   - Policy definition (USING clause):
     ```sql
     bucket_id = 'beauto' AND
     name LIKE auth.uid()::text || '/%'
     ```
   - Policy definition (WITH CHECK clause):
     ```sql
     bucket_id = 'beauto' AND
     name LIKE auth.uid()::text || '/%'
     ```

   **Policy 4: Allow Delete**
   - Policy name: `Users can delete their own files`
   - Allowed operation: `DELETE`
   - Target roles: `authenticated`
   - Policy definition:
     ```sql
     bucket_id = 'beauto' AND
     name LIKE auth.uid()::text || '/%'
     ```

### Verify Setup

After running the migration or creating policies manually:

1. Make sure the bucket name in your `.env.local` matches the bucket name in the policies
2. Try uploading a file again
3. The upload should now work without RLS errors

## Notes

- Files are stored in the format: `{user_id}/{timestamp}-{uuid}.{extension}`
- Each user can only access files in their own folder (enforced by RLS)
- The bucket should be **Private** (not public) for security
- If you're using a different bucket name, update it in both the SQL migration and your `.env.local` file
