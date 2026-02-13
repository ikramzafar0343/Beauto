# Update to "ikram zafar" Supabase Project

## Your New Project
- **Project Name**: ikram zafar
- **Need to update**: Supabase URL and API keys

## Step 1: Find Your Project Credentials

1. **Go to Supabase Dashboard**: https://app.supabase.com
2. **Find your project**: "ikram zafar"
3. **Click on it** to open
4. **Go to**: Settings ⚙️ → API

## Step 2: Copy These Values

You need to copy 3 things:

### 1. Project URL
- Look for **"Project URL"** or **"Config"** section
- Copy the URL (looks like: `https://xxxxx.supabase.co`)
- This goes in: `NEXT_PUBLIC_SUPABASE_URL`

### 2. Anon/Public Key
- Look for **"anon public"** or **"public"** key
- Click the **eye icon** 👁️ or **"Reveal"** button
- Copy the entire key (very long, starts with `eyJ...`)
- This goes in: `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Service Role Key
- Look for **"service_role"** key
- Click the **eye icon** 👁️ or **"Reveal"** button
- Copy the entire key (very long, starts with `eyJ...`)
- ⚠️ Keep this secret!
- This goes in: `SUPABASE_SERVICE_ROLE_KEY`

## Step 3: Update .env.local File

Open `.env.local` and update these 3 lines:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-new-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-new-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-new-service-role-key-here
```

**Replace with your actual values from the "ikram zafar" project.**

## Step 4: Save and Restart

1. **Save** the `.env.local` file
2. **Stop** your server: `Ctrl + C`
3. **Start** again: `npm run dev`

## Quick Checklist

- [ ] Found project "ikram zafar" in Supabase dashboard
- [ ] Went to Settings → API
- [ ] Copied Project URL
- [ ] Copied anon/public key (clicked Reveal)
- [ ] Copied service_role key (clicked Reveal)
- [ ] Updated `.env.local` with all 3 values
- [ ] Saved the file
- [ ] Restarted development server
- [ ] Tested sign in/sign up

## Need Help Finding the Keys?

See [HOW_TO_GET_SUPABASE_CREDENTIALS.md](./HOW_TO_GET_SUPABASE_CREDENTIALS.md) for detailed step-by-step instructions with screenshots.

## After Updating

Once you've updated the keys:
1. Restart your server
2. Try signing up with a new account
3. Then try signing in

If you see any errors, check:
- Keys are complete (very long strings)
- No extra spaces
- URL is correct format (starts with `https://`)
