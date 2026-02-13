# Database Migrations

## Single Migration File

This directory contains **one consolidated migration file** that sets up the entire database schema:

- **`000_complete_schema.sql`** - Complete, optimized database schema

## What's Included

This single migration includes:

- ✅ Core chat system (chats, messages)
- ✅ User credits & subscriptions system
- ✅ Workflow system (workflows, executions, steps, schedules, templates)
- ✅ User preferences & model configurations
- ✅ Analytics & feedback
- ✅ Scheduled actions
- ✅ AI task ideas
- ✅ MCP sessions & access tokens
- ✅ Connector secrets
- ✅ Context memory
- ✅ Support system (channels, conversations, messages)
- ✅ Teams (teams, members, invitations)
- ✅ Agents (custom chats)
- ✅ Storage bucket RLS policies
- ✅ All indexes optimized for performance
- ✅ All RLS policies
- ✅ Helper functions (credit system, team recursion fix)

## Running the Migration

### Option 1: Supabase Dashboard (Recommended)

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor** → **New Query**
3. Open `000_complete_schema.sql`
4. Copy the entire contents
5. Paste into the SQL Editor
6. Click **"Run"** to execute

### Option 2: Supabase CLI

```bash
supabase db reset
```

This will run all migrations in order.

## Performance Optimizations

- **Composite indexes** for common query patterns (user_id + created_at DESC)
- **Partial indexes** for filtered queries (e.g., active workflows)
- **Covering indexes** for joins
- **SECURITY DEFINER functions** to prevent RLS recursion
- **Strategic ANALYZE** statements for query optimizer

## Idempotency

All operations are idempotent:
- `CREATE TABLE IF NOT EXISTS`
- `CREATE INDEX IF NOT EXISTS`
- `DROP POLICY IF EXISTS` before creating
- `CREATE OR REPLACE FUNCTION`

You can run this migration multiple times safely.

## Notes

- The storage bucket name is set to `'beauto'` in the RLS policies. Change it if your bucket has a different name.
- Ensure the storage bucket exists in Supabase Dashboard → Storage before running the migration.
- RLS is enabled on `storage.objects` by default in Supabase, so we don't need to enable it.
