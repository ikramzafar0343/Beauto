# Quick Database Setup - "ikram zafar" Project

## 🎯 Problem
You're getting 404 errors because database tables don't exist in your new Supabase project.

## ✅ Solution: Run SQL Script

### Step 1: Open Supabase SQL Editor

1. Go to: **https://app.supabase.com**
2. Click on project: **"ikram zafar"**
3. **Left sidebar** → Click **"SQL Editor"**

### Step 2: Copy the SQL Script

**Option A: Use the file I created**
- Open: `supabase/migrations/003_complete_database_setup.sql`
- Copy ALL the content (Ctrl+A, Ctrl+C)

**Option B: I can paste it here for you**
- Just ask and I'll provide the complete SQL

### Step 3: Run in Supabase

1. In **Supabase SQL Editor**, click **"New query"**
2. **Paste** the SQL script
3. Click **"Run"** button (or press `Ctrl+Enter`)
4. Wait 10-30 seconds

### Step 4: Verify

1. Go to **Table Editor** in Supabase
2. You should see tables like:
   - `chats` ✅
   - `messages` ✅
   - `workflows` ✅
   - `workflow_executions` ✅
   - And many more...

### Step 5: Test

1. Refresh your app
2. Try signing in
3. 404 errors should be gone! ✅

## 📋 What Gets Created

The script creates **20+ tables** including:
- Chats and messages
- Workflows and executions
- User preferences
- Analytics
- Scheduled actions
- MCP sessions
- And more...

Plus security policies and indexes!

## ⚠️ Important

- Run this **ONCE** per project
- Safe to run multiple times (uses `IF NOT EXISTS`)
- Takes about 10-30 seconds

## Need the SQL Script?

The complete script is in:
`supabase/migrations/003_complete_database_setup.sql`

Or I can provide it here if you prefer!
