# Add Your Service Role Key

## ✅ Anon Key Added!

Your anon/public key has been added to `.env.local`.

## ⚠️ You Still Need: Service Role Key

You need to add one more key: **service_role key**

## How to Get Service Role Key:

1. **Go to Supabase Dashboard**: https://app.supabase.com
2. **Open your project**
3. **Go to**: Settings ⚙️ → API
4. **Find**: "service_role" key
5. **Click**: Eye icon 👁️ or "Reveal" button
6. **Copy**: The entire key (it's very long, starts with `eyJ...`)

## Update .env.local:

Open `.env.local` and find this line:
```
SUPABASE_SERVICE_ROLE_KEY=PASTE_NEW_SERVICE_ROLE_KEY_HERE_FROM_SUPABASE_DASHBOARD
```

Replace `PASTE_NEW_SERVICE_ROLE_KEY_HERE_FROM_SUPABASE_DASHBOARD` with your actual service_role key.

## Your .env.local Should Look Like:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

## After Adding Service Role Key:

1. **Save** `.env.local`
2. **Restart** your development server:
   ```bash
   # Stop: Ctrl+C
   # Start: npm run dev
   ```
3. **Test** by trying to sign in or sign up

## ⚠️ Important:

- **Keep service_role key secret!** Never share it publicly
- It has admin access to your database
- Don't commit it to Git (`.env.local` should be in `.gitignore`)
