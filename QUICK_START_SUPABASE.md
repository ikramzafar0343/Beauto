# Quick Start: Add Supabase Credentials

## 🎯 What You Need

1. A Supabase account (free at https://app.supabase.com)
2. A Supabase project (create one if you don't have it)
3. Your project's API credentials

## 📍 Where to Find Credentials in Supabase

### Exact Location:

1. **Login**: https://app.supabase.com
2. **Select your project** (or create new one)
3. **Left sidebar** → Scroll down → Click **"Settings"** ⚙️
4. **Settings menu** → Click **"API"**
5. **You'll see:**
   - **Project URL** - Copy this (starts with `https://`)
   - **Project API keys** section:
     - **anon public** - Copy this (click "Reveal" if hidden)
     - **service_role** - Copy this (click "Reveal" if hidden) ⚠️ Secret!

## 📝 Add to Your Project

1. **Create file**: `.env.local` in root directory (same folder as `package.json`)

2. **Add this content** (replace with YOUR values):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

3. **Save the file**

4. **Restart your server**:
   ```bash
   # Stop: Ctrl+C
   # Start: npm run dev
   ```

## ✅ Done!

Your app should now connect to Supabase.

**Need more details?** See [HOW_TO_GET_SUPABASE_CREDENTIALS.md](./HOW_TO_GET_SUPABASE_CREDENTIALS.md)
