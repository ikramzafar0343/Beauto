# Fix: Supabase Project Paused (ERR_NAME_NOT_RESOLVED)

## Quick Solution

If you're seeing `ERR_NAME_NOT_RESOLVED` with a Supabase URL like `https://jlbkrxstpbprlilgbrfz.supabase.co`, your project is likely **paused**.

## Why Projects Pause

Supabase free tier projects automatically pause after **7 days of inactivity** to save resources. When paused, the domain becomes unreachable, causing `ERR_NAME_NOT_RESOLVED` errors.

## How to Fix

### Step 1: Check Project Status

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Log in to your account
3. Look for your project in the project list

### Step 2: Restore the Project

If you see:
- **"Project Paused"** badge
- **"Restore"** or **"Resume"** button
- Project appears grayed out

**Click the "Restore" button** and wait 1-2 minutes.

### Step 3: Verify Restoration

1. Wait for the project to fully restore (you'll see a loading indicator)
2. Once restored, the project status should show as "Active"
3. Try your application again - it should work now

## Prevention

To prevent projects from pausing:

1. **Use the project regularly** - Any activity keeps it active
2. **Set up a keep-alive** - Make periodic requests to your API
3. **Upgrade to a paid plan** - Paid plans don't pause automatically

## Alternative: Create New Project

If you can't restore the project:

1. Create a new Supabase project
2. Update your `.env.local` with the new credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://new-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=new-anon-key
   ```
3. Restart your dev server

## Still Not Working?

1. **Check the connection test** on the sign-in page
2. **Verify your URL** matches exactly what's in Supabase dashboard
3. **Check your internet connection**
4. **Try accessing the URL directly** in a browser:
   - `https://your-project-id.supabase.co/rest/v1/`
   - Should return a response (even if it's an error)

## Need Help?

- Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for more details
- Visit [Supabase Support](https://supabase.com/support)
