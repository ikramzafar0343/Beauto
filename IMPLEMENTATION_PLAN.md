# Rube.app Clone - Comprehensive Implementation Plan

## Executive Summary

This document outlines the complete implementation plan to transform the existing Beauto application into a full Rube.app clone with all visible features, workflow patterns, UX flows, and integration behaviors.

## Feature Mapping: Rube.app → Current Implementation

### ✅ Already Implemented
- Basic chat interface with AI agents
- Composio integration for tool access
- Marketplace page for browsing integrations
- OAuth connector flows (via Composio)
- Basic workflow execution
- Scheduled actions system
- Multi-language support

### ❌ Missing Features (To Implement)

#### 1. Dynamic Prompt Builder & Workflow Converter
**Rube.app Feature**: Natural language input → structured multi-step workflow with visual representation
**Current State**: Basic chat with tool detection, no structured workflow visualization
**Implementation Required**:
- Workflow parser that converts natural language to structured steps
- Visual workflow builder UI
- Step-by-step execution timeline
- Workflow templates library

#### 2. Real-Time Execution Timeline/Logs
**Rube.app Feature**: Live execution view showing each step's status, logs, and results
**Current State**: Basic execution, no real-time UI updates
**Implementation Required**:
- WebSocket/SSE connection for real-time updates
- Execution timeline component
- Step-by-step log viewer
- Error handling and retry UI

#### 3. Enhanced MCP Integration
**Rube.app Feature**: Cross-client MCP exposure (Cursor, Claude, ChatGPT, etc.)
**Current State**: Basic MCP via Composio, no cross-client support
**Implementation Required**:
- MCP server endpoint for external clients
- Authentication and session management
- Tool discovery API
- WebSocket MCP protocol support

#### 4. Model Switching & Management
**Rube.app Feature**: Toggle between ChatGPT and Gemini with admin controls
**Current State**: Hardcoded OpenAI usage
**Implementation Required**:
- Model selection UI
- Runtime model switching
- Fallback logic
- Admin model management panel

#### 5. Workflow Builder UI
**Rube.app Feature**: Visual drag-and-drop workflow editor
**Current State**: Text-based chat only
**Implementation Required**:
- Visual workflow canvas
- Node-based editor
- Action chaining UI
- Conditional logic builder

#### 6. Enhanced Scheduling System
**Rube.app Feature**: Rich scheduling UI with cron expressions and triggers
**Current State**: Basic scheduled actions
**Implementation Required**:
- Scheduling UI with calendar
- Cron expression builder
- Event-based triggers
- Recurring workflow support

#### 7. Session Memory & Context
**Rube.app Feature**: Persistent context across conversations
**Current State**: Basic chat history
**Implementation Required**:
- Context management system
- Long-term memory storage
- Context retrieval and summarization
- Multi-session context linking

## Database Schema

### New Tables Required

```sql
-- Workflows table
CREATE TABLE workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  description TEXT,
  steps JSONB NOT NULL, -- Array of workflow steps
  status TEXT DEFAULT 'draft', -- draft, active, paused, archived
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workflow Executions table
CREATE TABLE workflow_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID REFERENCES workflows(id),
  user_id UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'pending', -- pending, running, completed, failed, cancelled
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Execution Steps table (for timeline)
CREATE TABLE execution_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  execution_id UUID REFERENCES workflow_executions(id),
  step_index INTEGER NOT NULL,
  step_name TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, running, completed, failed, skipped
  input_data JSONB,
  output_data JSONB,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  logs TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workflow Templates table
CREATE TABLE workflow_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  steps JSONB NOT NULL,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Model Configurations table
CREATE TABLE model_configurations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  default_model TEXT DEFAULT 'openai', -- openai, gemini
  fallback_model TEXT DEFAULT 'gemini',
  model_settings JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Context Memory table
CREATE TABLE context_memory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT,
  content TEXT NOT NULL,
  metadata JSONB,
  embedding VECTOR(1536), -- For semantic search
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- MCP Sessions table
CREATE TABLE mcp_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  client_type TEXT, -- cursor, claude, chatgpt, etc.
  session_token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## API Routes to Implement

### Workflow Management
- `POST /api/workflows` - Create workflow
- `GET /api/workflows` - List workflows
- `GET /api/workflows/[id]` - Get workflow details
- `PUT /api/workflows/[id]` - Update workflow
- `DELETE /api/workflows/[id]` - Delete workflow
- `POST /api/workflows/[id]/execute` - Execute workflow
- `POST /api/workflows/parse` - Parse natural language to workflow

### Execution Management
- `GET /api/executions` - List executions
- `GET /api/executions/[id]` - Get execution details
- `GET /api/executions/[id]/timeline` - Get execution timeline
- `POST /api/executions/[id]/cancel` - Cancel execution
- `GET /api/executions/[id]/logs` - Get execution logs (SSE)

### Model Management
- `GET /api/models` - Get available models
- `POST /api/models/switch` - Switch default model
- `GET /api/models/config` - Get model configuration

### MCP Server
- `GET /api/mcp/session` - Create MCP session
- `GET /api/mcp/tools` - List available tools
- `POST /api/mcp/execute` - Execute tool via MCP
- `WebSocket /api/mcp/stream` - MCP WebSocket endpoint

### Templates
- `GET /api/templates` - List workflow templates
- `GET /api/templates/[id]` - Get template details
- `POST /api/templates/[id]/use` - Use template to create workflow

## Frontend Components to Build

### 1. Workflow Builder Component
- Visual canvas with drag-and-drop
- Node editor for actions
- Connection lines between steps
- Step configuration panel
- Save/load functionality

### 2. Execution Timeline Component
- Real-time step status indicators
- Expandable log viewer
- Error display and retry buttons
- Progress indicators
- Execution metrics

### 3. Model Switcher Component
- Model selection dropdown
- Model status indicators
- Fallback configuration
- Usage statistics

### 4. Workflow Parser UI
- Natural language input
- Parsed workflow preview
- Step-by-step confirmation
- Edit before execution

### 5. MCP Client Connector
- Connection status
- Available tools list
- Tool execution interface
- Session management

## Implementation Phases

### Phase 1: Core Workflow System (Week 1)
1. Database schema setup
2. Workflow parser (natural language → structured workflow)
3. Basic workflow execution engine
4. Execution logging system

### Phase 2: Real-Time Updates (Week 1-2)
1. WebSocket/SSE infrastructure
2. Execution timeline component
3. Real-time status updates
4. Log streaming

### Phase 3: Visual Workflow Builder (Week 2)
1. Canvas component
2. Node-based editor
3. Step configuration UI
4. Workflow templates

### Phase 4: Model Management (Week 2-3)
1. Model switching logic
2. Model selection UI
3. Fallback mechanisms
4. Admin panel

### Phase 5: MCP Cross-Client Support (Week 3)
1. MCP server endpoint
2. Authentication system
3. Tool discovery API
4. WebSocket MCP protocol

### Phase 6: Enhanced Features (Week 3-4)
1. Scheduling UI improvements
2. Context memory system
3. Workflow templates library
4. Advanced error handling

### Phase 7: Testing & Polish (Week 4)
1. Unit tests
2. Integration tests
3. E2E tests
4. Performance optimization
5. Documentation

## Technical Stack Additions

### Backend
- `ws` or `socket.io` for WebSocket support
- `node-cron` for advanced scheduling
- `pgvector` for semantic search (context memory)
- `zod` for workflow schema validation

### Frontend
- `react-flow` or `react-diagrams` for workflow builder
- `socket.io-client` for WebSocket client
- `react-query` for data fetching and caching
- `zustand` or `jotai` for state management

## Security Considerations

1. **OAuth Token Storage**: Encrypt tokens at rest
2. **MCP Sessions**: Secure token generation and expiration
3. **Workflow Access**: User-based access control
4. **API Rate Limiting**: Prevent abuse
5. **Input Validation**: Sanitize all user inputs
6. **Error Messages**: Don't expose sensitive information

## Deployment Strategy

### CI/CD Pipeline
1. GitHub Actions for automated testing
2. Vercel for frontend deployment
3. Database migrations on deploy
4. Environment variable management
5. Rollback procedures

### Monitoring
1. Error tracking (Sentry)
2. Performance monitoring
3. Usage analytics
4. Cost tracking (API usage)

## Success Metrics

1. **Feature Parity**: 100% of visible Rube.app features
2. **Performance**: <2s workflow execution start
3. **Reliability**: 99.9% uptime
4. **User Experience**: <3 clicks to execute workflow
5. **Test Coverage**: >80% code coverage

## Next Steps

1. Review and approve this plan
2. Set up development environment
3. Create feature branches
4. Begin Phase 1 implementation
5. Daily progress reviews
