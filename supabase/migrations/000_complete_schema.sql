-- ============================================================================
-- COMPLETE DATABASE SCHEMA - PRODUCTION READY & OPTIMIZED
-- ============================================================================
-- This is the single, consolidated migration file that includes:
--   - Core chat system
--   - Workflow system
--   - User credits & subscriptions
--   - Storage bucket policies
--   - All indexes, RLS policies, and functions
--
-- Optimizations:
--   - Composite indexes for common query patterns
--   - SECURITY DEFINER functions to prevent RLS recursion
--   - Idempotent operations (IF NOT EXISTS, DROP IF EXISTS)
--   - Logical ordering for performance
--   - Strategic indexes for fast queries
-- ============================================================================

-- ============================================================================
-- EXTENSIONS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- HELPER FUNCTIONS (RLS Recursion Fix)
-- ============================================================================
-- These functions bypass RLS to prevent infinite recursion in team policies

CREATE OR REPLACE FUNCTION is_team_member(team_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM team_members
    WHERE team_id = team_uuid
    AND user_id = user_uuid
    AND status = 'active'
  );
END;
$$;

CREATE OR REPLACE FUNCTION is_team_owner(team_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM teams
    WHERE id = team_uuid
    AND owner_id = user_uuid
  );
END;
$$;

-- ============================================================================
-- TRIGGER FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_user_credits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_user_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TABLES - CORE CHAT SYSTEM
-- ============================================================================

CREATE TABLE IF NOT EXISTS chats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New conversation',
  custom_chat_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  connection_url TEXT,
  requires_auth BOOLEAN NOT NULL DEFAULT FALSE,
  tools_used JSONB NOT NULL DEFAULT '[]'::JSONB,
  toolkit TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- TABLES - USER CREDITS & SUBSCRIPTIONS
-- ============================================================================

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

CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan VARCHAR(50) NOT NULL DEFAULT 'free',
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  is_yearly BOOLEAN NOT NULL DEFAULT false,
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  current_period_end TIMESTAMPTZ NOT NULL,
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ============================================================================
-- TABLES - WORKFLOW SYSTEM
-- ============================================================================

CREATE TABLE IF NOT EXISTS workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  steps JSONB NOT NULL DEFAULT '[]'::JSONB,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workflow_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID REFERENCES workflows(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  input_data JSONB,
  output_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS execution_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  execution_id UUID NOT NULL REFERENCES workflow_executions(id) ON DELETE CASCADE,
  step_index INTEGER NOT NULL,
  step_name TEXT NOT NULL,
  step_type TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'skipped')),
  input_data JSONB,
  output_data JSONB,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  logs TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workflow_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  steps JSONB NOT NULL DEFAULT '[]'::JSONB,
  icon TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workflow_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  cron TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  next_run_at TIMESTAMPTZ,
  last_run_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, workflow_id)
);

-- ============================================================================
-- TABLES - USER PREFERENCES & SETTINGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  language TEXT NOT NULL DEFAULT 'English',
  timezone TEXT NOT NULL DEFAULT 'UTC',
  chat_instructions TEXT NOT NULL DEFAULT '',
  default_prompts TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  plan TEXT NOT NULL DEFAULT 'starter',
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS model_configurations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  default_model TEXT NOT NULL DEFAULT 'openai',
  fallback_model TEXT NOT NULL DEFAULT 'gemini',
  model_settings JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ============================================================================
-- TABLES - ANALYTICS & FEEDBACK
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  toolkit TEXT,
  action_name TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS message_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chat_id UUID,
  message_id TEXT,
  user_query TEXT,
  message_content TEXT,
  feedback_type TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- TABLES - SCHEDULED ACTIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS scheduled_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chat_id UUID REFERENCES chats(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL,
  action_description TEXT NOT NULL,
  scheduled_time TIMESTAMPTZ NOT NULL,
  toolkit TEXT,
  action_params JSONB,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  executed_at TIMESTAMPTZ,
  result JSONB,
  error TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- TABLES - AI TASK IDEAS
-- ============================================================================

CREATE TABLE IF NOT EXISTS ai_task_ideas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT,
  integration TEXT,
  action_data JSONB,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'dismissed', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- TABLES - MCP & CONNECTORS
-- ============================================================================

CREATE TABLE IF NOT EXISTS mcp_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_type TEXT,
  session_token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mcp_access_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_type TEXT,
  token_hash TEXT UNIQUE NOT NULL,
  token_prefix TEXT NOT NULL,
  composio_session_id TEXT,
  composio_mcp_url TEXT,
  composio_mcp_headers JSONB,
  composio_mcp_headers_encrypted TEXT,
  expires_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS connector_secrets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  connector_id TEXT NOT NULL,
  encrypted_value TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, connector_id)
);

-- ============================================================================
-- TABLES - CONTEXT & MEMORY
-- ============================================================================

CREATE TABLE IF NOT EXISTS context_memory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT,
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- TABLES - SUPPORT SYSTEM
-- ============================================================================

CREATE TABLE IF NOT EXISTS support_channels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  channel_type TEXT NOT NULL,
  channel_name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  config JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS support_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  channel_id UUID NOT NULL REFERENCES support_channels(id) ON DELETE CASCADE,
  channel_type TEXT NOT NULL,
  customer_name TEXT,
  customer_email TEXT,
  customer_handle TEXT,
  subject TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'pending')),
  last_message_at TIMESTAMPTZ,
  external_id TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS support_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES support_conversations(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('customer', 'agent')),
  sender_name TEXT,
  content TEXT NOT NULL,
  external_id TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- TABLES - TEAMS
-- ============================================================================

CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive')),
  invited_by UUID REFERENCES auth.users(id),
  joined_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

CREATE TABLE IF NOT EXISTS team_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(team_id, email)
);

-- ============================================================================
-- TABLES - AGENTS (CUSTOM CHATS)
-- ============================================================================

CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  logo TEXT,
  website_url TEXT,
  brand_voice TEXT,
  target_audience TEXT,
  colors TEXT[] NOT NULL DEFAULT '{}',
  description TEXT,
  custom_knowledge TEXT,
  files JSONB NOT NULL DEFAULT '[]'::JSONB,
  crawled_content TEXT,
  selected_integrations TEXT[] NOT NULL DEFAULT '{}',
  agent_type TEXT NOT NULL DEFAULT 'general',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- CREDIT SYSTEM FUNCTIONS
-- ============================================================================

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
  SELECT * INTO v_credits
  FROM user_credits
  WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    INSERT INTO user_credits (user_id, daily_credits, used_credits, last_reset_date)
    VALUES (p_user_id, 200, 0, v_today)
    RETURNING * INTO v_credits;
  END IF;
  
  IF v_credits.last_reset_date < v_today THEN
    UPDATE user_credits
    SET used_credits = 0, last_reset_date = v_today, updated_at = NOW()
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
  SELECT * INTO v_credits
  FROM user_credits
  WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    INSERT INTO user_credits (user_id, daily_credits, used_credits, last_reset_date)
    VALUES (p_user_id, 200, 0, v_today)
    RETURNING * INTO v_credits;
  END IF;
  
  IF v_credits.last_reset_date < v_today THEN
    UPDATE user_credits
    SET used_credits = 0, last_reset_date = v_today, updated_at = NOW()
    WHERE user_id = p_user_id
    RETURNING * INTO v_credits;
  END IF;
  
  v_available := v_credits.daily_credits - v_credits.used_credits;
  
  IF v_available < p_amount THEN
    RETURN QUERY SELECT 
      false as success,
      v_available as available_credits,
      format('Insufficient credits. You have %s credits, but need %s. Please upgrade your plan.', v_available, p_amount) as message;
    RETURN;
  END IF;
  
  UPDATE user_credits
  SET used_credits = used_credits + p_amount, updated_at = NOW()
  WHERE user_id = p_user_id
  RETURNING * INTO v_credits;
  
  v_available := v_credits.daily_credits - v_credits.used_credits;
  
  RETURN QUERY SELECT 
    true as success,
    v_available as available_credits,
    format('Credits deducted. %s credits remaining.', v_available) as message;
END;
$$;

-- ============================================================================
-- INDEXES - OPTIMIZED FOR PERFORMANCE
-- ============================================================================

-- Credits & Subscriptions
CREATE INDEX IF NOT EXISTS idx_user_credits_user_id ON user_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_user_credits_reset_date ON user_credits(last_reset_date);
CREATE INDEX IF NOT EXISTS idx_user_credits_subscription_plan ON user_credits(subscription_plan);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_plan ON user_subscriptions(plan);

-- Chats
CREATE INDEX IF NOT EXISTS idx_chats_user_id ON chats(user_id);
CREATE INDEX IF NOT EXISTS idx_chats_user_updated ON chats(user_id, updated_at DESC);

-- Messages
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_chat_created ON messages(chat_id, created_at DESC);

-- Workflows
CREATE INDEX IF NOT EXISTS idx_workflows_user_id ON workflows(user_id);
CREATE INDEX IF NOT EXISTS idx_workflows_user_status ON workflows(user_id, status);
CREATE INDEX IF NOT EXISTS idx_workflows_user_active ON workflows(user_id) WHERE status = 'active';

-- Workflow Executions
CREATE INDEX IF NOT EXISTS idx_executions_user_id ON workflow_executions(user_id);
CREATE INDEX IF NOT EXISTS idx_executions_user_created ON workflow_executions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_executions_user_workflow_created ON workflow_executions(user_id, workflow_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_executions_user_active ON workflow_executions(user_id, created_at DESC) WHERE status IN ('pending', 'running');

-- Execution Steps
CREATE INDEX IF NOT EXISTS idx_execution_steps_execution_id ON execution_steps(execution_id);
CREATE INDEX IF NOT EXISTS idx_execution_steps_status ON execution_steps(status);

-- Workflow Schedules
CREATE INDEX IF NOT EXISTS idx_workflow_schedules_user_id ON workflow_schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_workflow_schedules_next_run ON workflow_schedules(next_run_at) WHERE enabled = TRUE;

-- Scheduled Actions
CREATE INDEX IF NOT EXISTS idx_scheduled_actions_user_id ON scheduled_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_actions_user_created ON scheduled_actions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scheduled_actions_status ON scheduled_actions(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_actions_scheduled_time ON scheduled_actions(scheduled_time) WHERE status = 'pending';

-- AI Task Ideas
CREATE INDEX IF NOT EXISTS idx_ai_task_ideas_user_id ON ai_task_ideas(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_task_ideas_user_created ON ai_task_ideas(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_task_ideas_status ON ai_task_ideas(status);

-- Teams
CREATE INDEX IF NOT EXISTS idx_teams_owner_id ON teams(owner_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_status ON team_members(status);
CREATE INDEX IF NOT EXISTS idx_team_invitations_team_id ON team_invitations(team_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_token ON team_invitations(token);
CREATE INDEX IF NOT EXISTS idx_team_invitations_email ON team_invitations(email);

-- Agents
CREATE INDEX IF NOT EXISTS idx_agents_user_id ON agents(user_id);

-- MCP
CREATE INDEX IF NOT EXISTS idx_mcp_sessions_token ON mcp_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_mcp_sessions_user_id ON mcp_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_mcp_access_tokens_user_id ON mcp_access_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_mcp_access_tokens_token_prefix ON mcp_access_tokens(token_prefix);

-- Context Memory
CREATE INDEX IF NOT EXISTS idx_context_memory_user_id ON context_memory(user_id);
CREATE INDEX IF NOT EXISTS idx_context_memory_session_id ON context_memory(session_id);

-- Analytics
CREATE INDEX IF NOT EXISTS idx_user_analytics_user_id ON user_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_analytics_created_at ON user_analytics(created_at);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

DROP TRIGGER IF EXISTS trigger_update_user_credits_updated_at ON user_credits;
CREATE TRIGGER trigger_update_user_credits_updated_at
BEFORE UPDATE ON user_credits
FOR EACH ROW
EXECUTE FUNCTION update_user_credits_updated_at();

DROP TRIGGER IF EXISTS trigger_update_user_subscriptions_updated_at ON user_subscriptions;
CREATE TRIGGER trigger_update_user_subscriptions_updated_at
BEFORE UPDATE ON user_subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_user_subscriptions_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY - ENABLE
-- ============================================================================

ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE execution_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_task_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE mcp_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mcp_access_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE connector_secrets ENABLE ROW LEVEL SECURITY;
ALTER TABLE context_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES - CREDITS & SUBSCRIPTIONS
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their own credits" ON user_credits;
CREATE POLICY "Users can view their own credits" ON user_credits
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own credits" ON user_credits;
CREATE POLICY "Users can update their own credits" ON user_credits
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own subscription" ON user_subscriptions;
CREATE POLICY "Users can view their own subscription" ON user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own subscription" ON user_subscriptions;
CREATE POLICY "Users can update their own subscription" ON user_subscriptions
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- RLS POLICIES - CHATS & MESSAGES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their own chats" ON chats;
CREATE POLICY "Users can view their own chats" ON chats
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own chats" ON chats;
CREATE POLICY "Users can create their own chats" ON chats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own chats" ON chats;
CREATE POLICY "Users can update their own chats" ON chats
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own chats" ON chats;
CREATE POLICY "Users can delete their own chats" ON chats
  FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view messages in their chats" ON messages;
CREATE POLICY "Users can view messages in their chats" ON messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM chats WHERE chats.id = messages.chat_id AND chats.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can create messages in their chats" ON messages;
CREATE POLICY "Users can create messages in their chats" ON messages
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM chats WHERE chats.id = messages.chat_id AND chats.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can update messages in their chats" ON messages;
CREATE POLICY "Users can update messages in their chats" ON messages
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM chats WHERE chats.id = messages.chat_id AND chats.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can delete messages in their chats" ON messages;
CREATE POLICY "Users can delete messages in their chats" ON messages
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM chats WHERE chats.id = messages.chat_id AND chats.user_id = auth.uid())
  );

-- ============================================================================
-- RLS POLICIES - WORKFLOWS
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their own workflows" ON workflows;
CREATE POLICY "Users can view their own workflows" ON workflows
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own workflows" ON workflows;
CREATE POLICY "Users can create their own workflows" ON workflows
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own workflows" ON workflows;
CREATE POLICY "Users can update their own workflows" ON workflows
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own workflows" ON workflows;
CREATE POLICY "Users can delete their own workflows" ON workflows
  FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own executions" ON workflow_executions;
CREATE POLICY "Users can view their own executions" ON workflow_executions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own executions" ON workflow_executions;
CREATE POLICY "Users can create their own executions" ON workflow_executions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own execution steps" ON execution_steps;
CREATE POLICY "Users can view their own execution steps" ON execution_steps
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workflow_executions 
      WHERE workflow_executions.id = execution_steps.execution_id 
      AND workflow_executions.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create their own execution steps" ON execution_steps;
CREATE POLICY "Users can create their own execution steps" ON execution_steps
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM workflow_executions 
      WHERE workflow_executions.id = execution_steps.execution_id 
      AND workflow_executions.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Anyone can view templates" ON workflow_templates;
CREATE POLICY "Anyone can view templates" ON workflow_templates
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage their own workflow schedules" ON workflow_schedules;
CREATE POLICY "Users can manage their own workflow schedules" ON workflow_schedules
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- RLS POLICIES - USER PREFERENCES & SETTINGS
-- ============================================================================

DROP POLICY IF EXISTS "Users can manage their own preferences" ON user_preferences;
CREATE POLICY "Users can manage their own preferences" ON user_preferences
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own model config" ON model_configurations;
CREATE POLICY "Users can manage their own model config" ON model_configurations
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- RLS POLICIES - ANALYTICS & FEEDBACK
-- ============================================================================

DROP POLICY IF EXISTS "Users can manage their own analytics" ON user_analytics;
CREATE POLICY "Users can manage their own analytics" ON user_analytics
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own feedback" ON message_feedback;
CREATE POLICY "Users can manage their own feedback" ON message_feedback
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- RLS POLICIES - SCHEDULED ACTIONS
-- ============================================================================

DROP POLICY IF EXISTS "Users can manage their own scheduled actions" ON scheduled_actions;
CREATE POLICY "Users can manage their own scheduled actions" ON scheduled_actions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- RLS POLICIES - AI TASK IDEAS
-- ============================================================================

DROP POLICY IF EXISTS "Users can manage their own ideas" ON ai_task_ideas;
CREATE POLICY "Users can manage their own ideas" ON ai_task_ideas
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- RLS POLICIES - MCP & CONNECTORS
-- ============================================================================

DROP POLICY IF EXISTS "Users can manage their own MCP sessions" ON mcp_sessions;
CREATE POLICY "Users can manage their own MCP sessions" ON mcp_sessions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own MCP tokens" ON mcp_access_tokens;
CREATE POLICY "Users can manage their own MCP tokens" ON mcp_access_tokens
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own connector secrets" ON connector_secrets;
CREATE POLICY "Users can manage their own connector secrets" ON connector_secrets
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- RLS POLICIES - CONTEXT MEMORY
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their own context" ON context_memory;
CREATE POLICY "Users can view their own context" ON context_memory
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own context" ON context_memory;
CREATE POLICY "Users can create their own context" ON context_memory
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- RLS POLICIES - SUPPORT SYSTEM
-- ============================================================================

DROP POLICY IF EXISTS "Users can manage their own support channels" ON support_channels;
CREATE POLICY "Users can manage their own support channels" ON support_channels
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own support conversations" ON support_conversations;
CREATE POLICY "Users can manage their own support conversations" ON support_conversations
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own support messages" ON support_messages;
CREATE POLICY "Users can manage their own support messages" ON support_messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM support_conversations 
      WHERE support_conversations.id = support_messages.conversation_id 
      AND support_conversations.user_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM support_conversations 
      WHERE support_conversations.id = support_messages.conversation_id 
      AND support_conversations.user_id = auth.uid()
    )
  );

-- ============================================================================
-- RLS POLICIES - TEAMS (Using SECURITY DEFINER functions to prevent recursion)
-- ============================================================================

DROP POLICY IF EXISTS "Users can view teams they own or are members of" ON teams;
CREATE POLICY "Users can view teams they own or are members of" ON teams
  FOR SELECT USING (
    owner_id = auth.uid() OR
    is_team_member(teams.id, auth.uid())
  );

DROP POLICY IF EXISTS "Users can create teams" ON teams;
CREATE POLICY "Users can create teams" ON teams
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Team owners can update their teams" ON teams;
CREATE POLICY "Team owners can update their teams" ON teams
  FOR UPDATE USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Team owners can delete their teams" ON teams;
CREATE POLICY "Team owners can delete their teams" ON teams
  FOR DELETE USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can view team members of their teams" ON team_members;
CREATE POLICY "Users can view team members of their teams" ON team_members
  FOR SELECT USING (
    user_id = auth.uid() OR
    is_team_owner(team_members.team_id, auth.uid())
  );

DROP POLICY IF EXISTS "Team owners can manage team members" ON team_members;
CREATE POLICY "Team owners can manage team members" ON team_members
  FOR ALL USING (
    is_team_owner(team_members.team_id, auth.uid())
  ) WITH CHECK (
    is_team_owner(team_members.team_id, auth.uid())
  );

DROP POLICY IF EXISTS "Team owners can manage invitations" ON team_invitations;
CREATE POLICY "Team owners can manage invitations" ON team_invitations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM teams 
      WHERE teams.id = team_invitations.team_id 
      AND teams.owner_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM teams 
      WHERE teams.id = team_invitations.team_id 
      AND teams.owner_id = auth.uid()
    )
  );

-- ============================================================================
-- RLS POLICIES - AGENTS
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their own agents" ON agents;
CREATE POLICY "Users can view their own agents" ON agents
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own agents" ON agents;
CREATE POLICY "Users can create their own agents" ON agents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own agents" ON agents;
CREATE POLICY "Users can update their own agents" ON agents
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own agents" ON agents;
CREATE POLICY "Users can delete their own agents" ON agents
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- STORAGE BUCKET RLS POLICIES
-- ============================================================================
-- Note: RLS is already enabled on storage.objects by default in Supabase
-- These policies allow authenticated users to manage files in their own folders

DROP POLICY IF EXISTS "Users can upload files to their own folder" ON storage.objects;
CREATE POLICY "Users can upload files to their own folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'beauto' AND
  name LIKE auth.uid()::text || '/%'
);

DROP POLICY IF EXISTS "Users can read their own files" ON storage.objects;
CREATE POLICY "Users can read their own files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'beauto' AND
  name LIKE auth.uid()::text || '/%'
);

DROP POLICY IF EXISTS "Users can update their own files" ON storage.objects;
CREATE POLICY "Users can update their own files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'beauto' AND
  name LIKE auth.uid()::text || '/%'
)
WITH CHECK (
  bucket_id = 'beauto' AND
  name LIKE auth.uid()::text || '/%'
);

DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;
CREATE POLICY "Users can delete their own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'beauto' AND
  name LIKE auth.uid()::text || '/%'
);

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

GRANT EXECUTE ON FUNCTION get_user_credits(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION deduct_credits(UUID, INTEGER) TO authenticated;

-- ============================================================================
-- ANALYZE TABLES FOR QUERY OPTIMIZER
-- ============================================================================

ANALYZE chats;
ANALYZE messages;
ANALYZE user_credits;
ANALYZE user_subscriptions;
ANALYZE workflows;
ANALYZE workflow_executions;
ANALYZE execution_steps;
ANALYZE scheduled_actions;
ANALYZE ai_task_ideas;
ANALYZE teams;
ANALYZE team_members;
ANALYZE agents;

-- ============================================================================
-- COMPLETE
-- ============================================================================
