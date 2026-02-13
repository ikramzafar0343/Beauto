# Setup Database for "ikram zafar" Project

## Problem: 404 Errors

You're seeing 404 errors because the database tables don't exist in your new Supabase project "ikram zafar".

**Error examples:**
- `404 (Not Found)` for `/rest/v1/workflows`
- `404 (Not Found)` for `/rest/v1/workflow_executions`
- `404 (Not Found)` for `/rest/v1/chats`

## Solution: Run Database Migration

You need to create all the required tables in your Supabase project.

## Step-by-Step Instructions

### Step 1: Open Supabase SQL Editor

1. Go to: **https://app.supabase.com**
2. **Find your project**: "ikram zafar"
3. **Click on it** to open
4. **Left sidebar** → Click **"SQL Editor"** (or go to: **Database** → **SQL Editor**)

### Step 2: Open the Migration File

1. In your project folder, open: `supabase/migrations/003_complete_database_setup.sql`
2. **Copy ALL the SQL code** from that file
3. Or I can provide it here - it's a complete database setup script

### Step 3: Run the SQL Script

1. **In Supabase SQL Editor**, click **"New query"**
2. **Paste** the entire SQL script
3. **Click "Run"** (or press `Ctrl+Enter`)
4. **Wait** for it to complete (should take 10-30 seconds)

### Step 4: Verify Tables Were Created

1. In Supabase, go to: **Table Editor** (left sidebar)
2. You should see these tables:
   - ✅ `chats`
   - ✅ `messages`
   - ✅ `workflows`
   - ✅ `workflow_executions`
   - ✅ `execution_steps`
   - ✅ `user_preferences`
   - ✅ `user_analytics`
   - ✅ `scheduled_actions`
   - ✅ And many more...

### Step 5: Test Your App

1. **Refresh** your browser
2. **Try signing in** again
3. The 404 errors should be gone!

## Quick Copy-Paste Method

If you want, I can provide the complete SQL script here. Just:

1. Copy it
2. Paste in Supabase SQL Editor
3. Run it
4. Done!

## What the Script Creates

The migration script creates:

### Core Tables:
- `chats` - Chat conversations
- `messages` - Chat messages
- `workflows` - Workflow definitions
- `workflow_executions` - Workflow runs
- `execution_steps` - Step-by-step execution logs

### User Tables:
- `user_preferences` - User settings
- `model_configurations` - AI model settings
- `user_analytics` - Usage analytics

### System Tables:
- `scheduled_actions` - Scheduled tasks
- `workflow_schedules` - Workflow schedules
- `mcp_sessions` - MCP sessions
- `mcp_access_tokens` - MCP tokens
- `connector_secrets` - Encrypted secrets
- `context_memory` - AI context memory

### Support Tables (Optional):
- `support_channels` - Support channels
- `support_conversations` - Support conversations
- `support_messages` - Support messages

Plus:
- ✅ All indexes for performance
- ✅ Row Level Security (RLS) enabled
- ✅ Security policies configured

## Need Help?

If you get errors when running the SQL:
1. Check the error message
2. Some tables might already exist (that's OK - the script uses `IF NOT EXISTS`)
3. Make sure you're in the correct project: "ikram zafar"

## After Running the Script

Once the tables are created:
1. ✅ 404 errors will disappear
2. ✅ You can sign in/sign up
3. ✅ You can create workflows
4. ✅ You can use the chat feature
5. ✅ Everything should work!

Let me know if you need the SQL script pasted here, or if you encounter any errors!
