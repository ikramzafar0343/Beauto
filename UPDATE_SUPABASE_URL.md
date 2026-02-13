# Update Your Supabase URL

## ⚠️ Important: You Need New API Keys

When you switch Supabase projects, you must also update the anon and service role keys. Each Supabase project has its own keys.

## Quick Steps

1. Update `NEXT_PUBLIC_SUPABASE_URL` in `.env.local`
2. Get the new project's API keys from Supabase Dashboard (Settings → API)
3. Update `NEXT_PUBLIC_SUPABASE_ANON_KEY` and (optionally) `SUPABASE_SERVICE_ROLE_KEY`
4. Restart your dev server

## Get Your New API Keys

1. Go to: https://app.supabase.com
2. Find your project
3. Click on it
4. Go to: **Settings** → **API**
5. Copy:
   - **anon public key** (click "Reveal")
   - **service_role key** (click "Reveal")

## Example `.env.local`

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000

NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_new_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_new_service_role_key

COMPOSIO_API_KEY=your_composio_api_key
OPENAI_API_KEY=your_openai_api_key
GEMINI_API_KEY=your_gemini_api_key
```

Never commit `.env.local` to git. If any credentials were previously committed, rotate them immediately.
