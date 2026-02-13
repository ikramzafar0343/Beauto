# Setup Guide - Environment Variables

## Error: ERR_NAME_NOT_RESOLVED / Failed to fetch

This error occurs when Supabase environment variables are not configured. Follow these steps to fix it:

## Step 1: Create .env.local File

Create a file named `.env.local` in the root directory of your project (same level as `package.json`).

## Step 2: Get Your Supabase Credentials

**📖 For detailed step-by-step instructions with screenshots, see [HOW_TO_GET_SUPABASE_CREDENTIALS.md](./HOW_TO_GET_SUPABASE_CREDENTIALS.md)**

### Quick Steps:

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. **Create a new project** (or select existing one):
   - Click "New Project"
   - Enter project name and database password
   - Wait 2-3 minutes for creation
3. **Get your credentials**:
   - Click **"Settings"** (gear icon) in left sidebar
   - Click **"API"** in settings menu
   - Copy these values:
     - **Project URL** (looks like `https://xxxxx.supabase.co`) → `NEXT_PUBLIC_SUPABASE_URL`
     - **anon/public key** (click "Reveal" to show) → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - **service_role key** (click "Reveal" to show) → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ Keep secret!

## Step 3: Add Environment Variables

Add these to your `.env.local` file:

```env
# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Composio API Key (Required)
COMPOSIO_API_KEY=your_composio_api_key

# OpenAI API Key (Optional - for AI features)
OPENAI_API_KEY=your_openai_api_key

# Google Gemini API Key (Optional - for Gemini features)
GEMINI_API_KEY=your_gemini_api_key

# Application URL (Optional)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 4: Restart Development Server

After creating/updating `.env.local`:

1. Stop your development server (Ctrl+C)
2. Restart it:
   ```bash
   npm run dev
   ```

**Important**: Environment variables are only loaded when the server starts. You must restart after changing `.env.local`.

## Step 5: Verify Configuration

Check that your environment variables are loaded:

1. Open browser console (F12)
2. Check for any Supabase connection errors
3. Try signing up again

## Common Issues

### Issue: Still getting ERR_NAME_NOT_RESOLVED

**Solution**: 
- Make sure `.env.local` is in the root directory (not in `src/`)
- Check that the Supabase URL starts with `https://` and ends with `.supabase.co`
- Restart the dev server after creating/updating `.env.local`

### Issue: Variables not loading

**Solution**:
- Ensure the file is named exactly `.env.local` (not `.env` or `.env.example`)
- Check for typos in variable names (they must match exactly)
- Restart the dev server

### Issue: Supabase URL format

**Correct format**: `https://xxxxxxxxxxxxx.supabase.co`
**Wrong formats**: 
- `http://...` (must be https)
- Missing `.supabase.co` domain
- Extra slashes or spaces

## Getting API Keys

### Supabase
1. Visit: https://app.supabase.com
2. Create/select project
3. Settings → API → Copy keys

### Composio
1. Visit: https://app.composio.dev
2. Settings → API Keys → Create new key

### OpenAI
1. Visit: https://platform.openai.com/api-keys
2. Create new secret key

### Google Gemini
1. Visit: https://aistudio.google.com/app/apikey
2. Create API key

## Security Notes

⚠️ **Never commit `.env.local` to git!**

The `.env.local` file should already be in `.gitignore`. If not, add it:

```gitignore
.env.local
.env*.local
```

## Need Help?

If you're still having issues:
1. Check the browser console for detailed error messages
2. Verify your Supabase project is active
3. Ensure your Supabase URL is accessible (try opening it in a browser)
4. Check network connectivity
