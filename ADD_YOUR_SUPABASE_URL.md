# Add Your Supabase URL to the Project

## Your Supabase URL

You have provided this Supabase URL:
```
https://taeqitqdbenjsfrszpbu.supabase.co
```

## Step 1: Get Your API Keys

You need to get the API keys for this project:

1. **Go to Supabase Dashboard**: https://app.supabase.com
2. **Find your project** with URL: `taeqitqdbenjsfrszpbu`
3. **Click on the project** to open it
4. **Go to Settings** (gear icon in left sidebar)
5. **Click "API"** in the settings menu
6. **Copy these values:**
   - **anon public key** - Click "Reveal" and copy the entire key
   - **service_role key** - Click "Reveal" and copy the entire key (keep secret!)

## Step 2: Create .env.local File

1. **Open your project folder** in a code editor
2. **Create a new file** named `.env.local` in the root directory
   - Same folder as `package.json`
   - File name must be exactly `.env.local` (not `.env.local.txt`)

## Step 3: Add Your Credentials

Copy and paste this into your `.env.local` file, then replace the keys with your actual values:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://taeqitqdbenjsfrszpbu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=paste-your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=paste-your-service-role-key-here

# Composio API Key (Required for integrations)
COMPOSIO_API_KEY=your_composio_api_key

# Optional: OpenAI API Key (for AI features)
OPENAI_API_KEY=your_openai_api_key

# Optional: Google Gemini API Key (for image/video generation)
GEMINI_API_KEY=your_gemini_api_key
```

**Important:**
- Replace `paste-your-anon-key-here` with your actual anon key from Supabase
- Replace `paste-your-service-role-key-here` with your actual service_role key
- No spaces around the `=` sign
- No quotes around the values
- Each key should be on a single line

## Step 4: Save and Restart

1. **Save the `.env.local` file**
2. **Stop your development server** (if running):
   - Press `Ctrl + C` in the terminal
3. **Start the server again**:
   ```bash
   npm run dev
   ```

## Step 5: Verify It Works

1. Open your browser: http://localhost:3000
2. Try to sign in or sign up
3. If you see errors, check:
   - The URL is correct: `https://taeqitqdbenjsfrszpbu.supabase.co`
   - The keys are complete (they're very long strings)
   - No extra spaces or characters
   - File is saved as `.env.local` (not `.env.local.txt`)

## Quick Checklist

- [ ] Logged into Supabase Dashboard
- [ ] Found project: `taeqitqdbenjsfrszpbu`
- [ ] Went to Settings → API
- [ ] Copied anon/public key
- [ ] Copied service_role key
- [ ] Created `.env.local` file in root directory
- [ ] Added URL: `https://taeqitqdbenjsfrszpbu.supabase.co`
- [ ] Added anon key
- [ ] Added service_role key
- [ ] Saved the file
- [ ] Restarted development server (`npm run dev`)
- [ ] Tested the connection

## Example .env.local File

Here's what your complete `.env.local` should look like (with example keys):

```env
NEXT_PUBLIC_SUPABASE_URL=https://taeqitqdbenjsfrszpbu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhZXFpdHFkYmVuanNmcntzYnB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTY4OTUyMzQsImV4cCI6MjAzMjQ3MTIzNH0.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhZXFpdHFkYmVuanNmcntzYnB1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxNjg5NTIzNCwiZXhwIjoyMDMyNDcxMjM0fQ.yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
COMPOSIO_API_KEY=your_composio_key_here
```

**Note:** The keys above are examples. You must use your actual keys from the Supabase dashboard.

## Need Help?

- **Can't find the keys?** See [HOW_TO_GET_SUPABASE_CREDENTIALS.md](./HOW_TO_GET_SUPABASE_CREDENTIALS.md)
- **Getting errors?** See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- **Project paused?** See [SUPABASE_PAUSED_FIX.md](./SUPABASE_PAUSED_FIX.md)
