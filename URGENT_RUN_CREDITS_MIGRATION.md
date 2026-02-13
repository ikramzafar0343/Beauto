# ⚠️ URGENT: Run Database Migration

## Problem
The `user_credits` table is missing from your database, causing all credit-related API calls to fail with:
```
Could not find the table 'public.user_credits' in the schema cache
```

## Solution

### Step 1: Run Credits Migration

1. Open your **Supabase Dashboard**
2. Go to **SQL Editor** → **New Query**
3. Open the file: `RUN_CREDITS_MIGRATION_NOW.sql`
4. **Copy the entire contents** of that file
5. **Paste it into the SQL Editor**
6. Click **"Run"** to execute

This will create:
- ✅ `user_credits` table
- ✅ `get_user_credits()` function
- ✅ `deduct_credits()` function
- ✅ RLS policies
- ✅ Indexes

### Step 2: Run Subscription Migration (Optional, for payment system)

If you want to use the payment system:

1. In the same SQL Editor, create a **New Query**
2. Open the file: `RUN_SUBSCRIPTION_MIGRATION_NOW.sql`
3. **Copy the entire contents** of that file
4. **Paste it into the SQL Editor**
5. Click **"Run"** to execute

This will create:
- ✅ `user_subscriptions` table
- ✅ RLS policies
- ✅ Indexes

## Verification

After running the migration, test by:

1. Refresh your application
2. Check the browser console - errors should be gone
3. Try sending a message in chat - credits should be deducted
4. Check `/api/credits/check` - should return 200 status

## Quick Test Query

Run this in SQL Editor to verify the table exists:

```sql
SELECT * FROM user_credits LIMIT 1;
```

If it runs without error, the table exists! ✅
