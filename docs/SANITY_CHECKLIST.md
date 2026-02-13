# Sanity Checklist

## 1) Composio OAuth connector flows
- Open `/marketplace`
- Pick a toolkit (Slack/Gmail/GitHub/etc) → click Connect
- Confirm redirect to provider OAuth and back to `/api/composio/callback`
- Re-open the toolkit card and verify it shows as connected

## 2) Natural language → structured workflows
- Open `/studio`
- Enter an instruction (e.g. “Summarize new GitHub issues and post to Slack”)
- Click Generate, then Save
- Verify workflow appears in the left workflow list and steps are editable

## 3) Real-time execution timeline
- In `/studio`, open a saved workflow
- Click Run
- Verify right-hand timeline updates in real-time (step_started/step_completed)
- Verify the run is persisted (timeline is also queryable via `/api/executions/:id/timeline`)

## 4) ChatGPT + Gemini toggling + fallback
- Open `/settings/models`
- Set Default Provider to OpenAI, Fallback Provider to Gemini
- Trigger workflow parsing (Generate in `/studio`) and verify parsing works
- Force an OpenAI failure (invalid OPENAI_API_KEY) and verify Gemini fallback parsing works

## 5) Deployment checks (Vercel)
- Configure env vars from `.env.example`
- Ensure `vercel.json` crons are enabled
- Trigger cron endpoints:
  - `/api/scheduled-actions/execute`
  - `/api/cron/run`
- Verify scheduled runs create workflow executions

## 6) MCP cross-client config
- Open `/settings/mcp` and generate a token
- Copy the config snippet into your MCP client (Cursor/Claude/etc)
- Verify tool discovery / calls go through `/api/mcp` (Bearer token) and reach Composio MCP

