# Troubleshooting Guide

## Error: ERR_NAME_NOT_RESOLVED / Failed to fetch

### What This Error Means

This error occurs when the application cannot connect to your Supabase backend. The most common causes are:

1. **Supabase project is paused** - Free tier projects pause after 7 days of inactivity (MOST COMMON)
2. **Missing environment variables** - Supabase URL/keys not configured
3. **Invalid Supabase URL** - URL is malformed or incorrect
4. **Project deleted** - The Supabase project no longer exists
5. **Network connectivity issues** - Cannot reach Supabase servers

### Quick Fix

**If you see a URL like `https://jlbkrxstpbprlilgbrfz.supabase.co` in the error:**

1. **Check if your Supabase project is paused** (MOST COMMON ISSUE):
   - Go to [Supabase Dashboard](https://app.supabase.com)
   - Look for your project
   - If you see "Project Paused" or a "Restore" button, click it
   - Wait 1-2 minutes for the project to restore
   - Try again

2. **If project is active, verify your `.env.local` file:**
   - Check if `.env.local` exists in the root directory
   - Verify it contains:
     ```env
     NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
     ```

3. **Restart your development server:**
   ```bash
   # Stop the server (Ctrl+C)
   # Then restart:
   npm run dev
   ```

4. **Use the Connection Test** (on sign-in page):
   - If you see the error, scroll down to the "Test Supabase Connection" section
   - Click "Test Connection" to diagnose the issue

### Detailed Steps

#### Step 1: Verify Environment Variables

Check that your `.env.local` file is in the correct location:
```
orchids-rube-app-clone-main/
├── .env.local          ← Should be here
├── package.json
├── src/
└── ...
```

#### Step 2: Validate Supabase URL Format

Your Supabase URL should look like:
- ✅ `https://abcdefghijklmnop.supabase.co`
- ✅ `https://abcdefghijklmnop.supabase.in`
- ❌ `https://supabase.com/project/...`
- ❌ `http://localhost:54321` (unless using local Supabase)

#### Step 3: Check Browser Console

Open browser DevTools (F12) and check:
1. **Console tab** - Look for error messages
2. **Network tab** - Check if requests to Supabase are failing
3. Look for the actual URL being requested

#### Step 4: Test Supabase Connection

You can test if your Supabase URL is accessible:

```bash
# In terminal, test the URL:
curl https://your-project-id.supabase.co/rest/v1/

# Should return a response (even if it's an error about missing auth)
```

### Common Issues

#### Issue 1: Environment Variables Not Loading

**Symptoms:**
- Error shows `undefined` or empty string for URL
- Works in some files but not others

**Solution:**
- Make sure `.env.local` is in the root directory
- Restart the dev server after changing `.env.local`
- Check for typos in variable names (must be exact: `NEXT_PUBLIC_SUPABASE_URL`)

#### Issue 2: Invalid URL Format

**Symptoms:**
- Error mentions "Invalid URL" or "ERR_NAME_NOT_RESOLVED"
- URL looks wrong in error message

**Solution:**
- Ensure URL starts with `https://`
- Remove any trailing slashes
- Verify the project ID is correct

#### Issue 3: Supabase Project Paused (MOST COMMON)

**Symptoms:**
- URL looks correct: `https://xxxxx.supabase.co`
- Error: `ERR_NAME_NOT_RESOLVED`
- Project appears in dashboard but shows as paused

**Solution:**
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Find your project in the list
3. If it shows "Paused" or has a "Restore" button:
   - Click "Restore project" or "Resume"
   - Wait 1-2 minutes for restoration
   - The domain will become accessible again
4. Free tier projects pause after 7 days of inactivity
5. To prevent pausing, use the project regularly or upgrade to a paid plan

#### Issue 4: Supabase Project Deleted

**Symptoms:**
- URL looks correct but project doesn't exist
- 404 or connection refused errors
- Project not found in dashboard

**Solution:**
- Verify project exists in Supabase dashboard
- If deleted, create a new project and update `.env.local`
- Ensure project is in the correct region

### Still Having Issues?

1. **Check the error message** - The improved error handling will show the actual URL being used
2. **Verify in Supabase Dashboard** - Go to Settings → API and confirm your credentials
3. **Check Network Tab** - See what URL the browser is actually trying to connect to
4. **Review SETUP_GUIDE.md** - For complete setup instructions

### Getting Help

If you're still stuck:
1. Check the browser console for the full error message
2. Verify your `.env.local` file (without exposing secrets)
3. Check if the Supabase project is active in the dashboard
