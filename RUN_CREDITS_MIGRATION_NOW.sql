-- ============================================================================
-- QUICK FIX: Run this SQL in Supabase SQL Editor to create user_credits table
-- ============================================================================
-- Copy and paste this entire file into Supabase Dashboard → SQL Editor → New Query
-- Then click "Run" to execute
-- ============================================================================

-- Create user_credits table
CREATE TABLE IF NOT EXISTS user_credits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  daily_credits INTEGER NOT NULL DEFAULT 200,
  used_credits INTEGER NOT NULL DEFAULT 0,
  last_reset_date DATE NOT NULL DEFAULT CURRENT_DATE,
  subscription_plan VARCHAR(50) DEFAULT 'free',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Add subscription_plan column if table already exists but column is missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_credits' AND column_name = 'subscription_plan'
  ) THEN
    ALTER TABLE user_credits ADD COLUMN subscription_plan VARCHAR(50) DEFAULT 'free';
  END IF;
END $$;

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_user_credits_user_id ON user_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_user_credits_reset_date ON user_credits(last_reset_date);
CREATE INDEX IF NOT EXISTS idx_user_credits_subscription_plan ON user_credits(subscription_plan);

-- Function to get or create user credits
CREATE OR REPLACE FUNCTION get_user_credits(p_user_id UUID)
RETURNS TABLE (
  daily_credits INTEGER,
  used_credits INTEGER,
  available_credits INTEGER,
  last_reset_date DATE
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_credits user_credits%ROWTYPE;
  v_today DATE := CURRENT_DATE;
BEGIN
  -- Get or create credits record
  SELECT * INTO v_credits
  FROM user_credits
  WHERE user_id = p_user_id;
  
  -- If no record exists, create one
  IF NOT FOUND THEN
    INSERT INTO user_credits (user_id, daily_credits, used_credits, last_reset_date)
    VALUES (p_user_id, 200, 0, v_today)
    RETURNING * INTO v_credits;
  END IF;
  
  -- Reset credits if it's a new day
  IF v_credits.last_reset_date < v_today THEN
    UPDATE user_credits
    SET 
      used_credits = 0,
      last_reset_date = v_today,
      updated_at = NOW()
    WHERE user_id = p_user_id
    RETURNING * INTO v_credits;
  END IF;
  
  RETURN QUERY SELECT 
    v_credits.daily_credits,
    v_credits.used_credits,
    (v_credits.daily_credits - v_credits.used_credits) as available_credits,
    v_credits.last_reset_date;
END;
$$;

-- Function to deduct credits
CREATE OR REPLACE FUNCTION deduct_credits(p_user_id UUID, p_amount INTEGER)
RETURNS TABLE (
  success BOOLEAN,
  available_credits INTEGER,
  message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_credits user_credits%ROWTYPE;
  v_today DATE := CURRENT_DATE;
  v_available INTEGER;
BEGIN
  -- Get current credits (with auto-reset)
  SELECT * INTO v_credits
  FROM user_credits
  WHERE user_id = p_user_id;
  
  -- If no record, create one
  IF NOT FOUND THEN
    INSERT INTO user_credits (user_id, daily_credits, used_credits, last_reset_date)
    VALUES (p_user_id, 200, 0, v_today)
    RETURNING * INTO v_credits;
  END IF;
  
  -- Reset if new day
  IF v_credits.last_reset_date < v_today THEN
    UPDATE user_credits
    SET 
      used_credits = 0,
      last_reset_date = v_today,
      updated_at = NOW()
    WHERE user_id = p_user_id
    RETURNING * INTO v_credits;
  END IF;
  
  -- Calculate available credits
  v_available := v_credits.daily_credits - v_credits.used_credits;
  
  -- Check if enough credits
  IF v_available < p_amount THEN
    RETURN QUERY SELECT 
      false as success,
      v_available as available_credits,
      format('Insufficient credits. You have %s credits, but need %s. Please upgrade your plan.', v_available, p_amount) as message;
    RETURN;
  END IF;
  
  -- Deduct credits
  UPDATE user_credits
  SET 
    used_credits = used_credits + p_amount,
    updated_at = NOW()
  WHERE user_id = p_user_id
  RETURNING * INTO v_credits;
  
  v_available := v_credits.daily_credits - v_credits.used_credits;
  
  RETURN QUERY SELECT 
    true as success,
    v_available as available_credits,
    format('Credits deducted. %s credits remaining.', v_available) as message;
END;
$$;

-- Enable RLS
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view their own credits" ON user_credits;
CREATE POLICY "Users can view their own credits"
ON user_credits
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own credits" ON user_credits;
CREATE POLICY "Users can update their own credits"
ON user_credits
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION get_user_credits(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION deduct_credits(UUID, INTEGER) TO authenticated;

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_user_credits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_user_credits_updated_at ON user_credits;
CREATE TRIGGER trigger_update_user_credits_updated_at
BEFORE UPDATE ON user_credits
FOR EACH ROW
EXECUTE FUNCTION update_user_credits_updated_at();

-- ============================================================================
-- DONE! The user_credits table and functions are now created.
-- ============================================================================
