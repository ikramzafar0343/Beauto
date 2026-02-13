# Feature Mapping (Rube.app → This Repo)

## Marketplace + Connectors
- Marketplace browsing UI: [marketplace/page.tsx](file:///c:/Users/HP/Desktop/orchids-rube-app-clone-main/src/app/marketplace/page.tsx)
- Toolkit catalog API: [toolkits/route.ts](file:///c:/Users/HP/Desktop/orchids-rube-app-clone-main/src/app/api/composio/toolkits/route.ts)
- Integration detail/tools discovery API: [tools/route.ts](file:///c:/Users/HP/Desktop/orchids-rube-app-clone-main/src/app/api/composio/tools/route.ts)
- OAuth connect flow (single-click connect): [connect/route.ts](file:///c:/Users/HP/Desktop/orchids-rube-app-clone-main/src/app/api/composio/connect/route.ts), [callback/route.ts](file:///c:/Users/HP/Desktop/orchids-rube-app-clone-main/src/app/api/composio/callback/route.ts)

## Natural Language → Workflow
- Parser (pattern + LLM fallback): [parser.ts](file:///c:/Users/HP/Desktop/orchids-rube-app-clone-main/src/lib/workflow/parser.ts)
- Parse API (OpenAI default, Gemini fallback, per-user model config): [parse/route.ts](file:///c:/Users/HP/Desktop/orchids-rube-app-clone-main/src/app/api/workflows/parse/route.ts)
- Studio UI (“instruction → draft workflow → save”): [studio/page.tsx](file:///c:/Users/HP/Desktop/orchids-rube-app-clone-main/src/app/studio/page.tsx)

## Workflow Builder (Prompt Builder UX)
- Workflow Studio layout + step editor (edit params per step): [studio/page.tsx](file:///c:/Users/HP/Desktop/orchids-rube-app-clone-main/src/app/studio/page.tsx)
- Workflow CRUD APIs: [workflows/route.ts](file:///c:/Users/HP/Desktop/orchids-rube-app-clone-main/src/app/api/workflows/route.ts), [workflows/[id]/route.ts](file:///c:/Users/HP/Desktop/orchids-rube-app-clone-main/src/app/api/workflows/%5Bid%5D/route.ts)

## Execution Timeline / Logs
- Streaming execution (SSE) + DB timeline persistence: [execute-stream/route.ts](file:///c:/Users/HP/Desktop/orchids-rube-app-clone-main/src/app/api/workflows/%5Bid%5D/execute-stream/route.ts)
- Timeline API (polling compatible): [timeline/route.ts](file:///c:/Users/HP/Desktop/orchids-rube-app-clone-main/src/app/api/executions/%5Bid%5D/timeline/route.ts)
- Timeline UI (SSE in Studio; polling component remains): [ExecutionTimeline.tsx](file:///c:/Users/HP/Desktop/orchids-rube-app-clone-main/src/components/workflow/ExecutionTimeline.tsx)

## MCP (Cross-client access)
- MCP token issuance UI: [settings/mcp/page.tsx](file:///c:/Users/HP/Desktop/orchids-rube-app-clone-main/src/app/settings/mcp/page.tsx)
- Token management API: [mcp/tokens/route.ts](file:///c:/Users/HP/Desktop/orchids-rube-app-clone-main/src/app/api/mcp/tokens/route.ts)
- MCP proxy endpoint (Bearer token → Composio MCP): [mcp/route.ts](file:///c:/Users/HP/Desktop/orchids-rube-app-clone-main/src/app/api/mcp/route.ts)

## Model Switching (OpenAI default + Gemini fallback)
- Runtime layer: [runtime.ts](file:///c:/Users/HP/Desktop/orchids-rube-app-clone-main/src/lib/models/runtime.ts)
- Per-user config API: [models/config/route.ts](file:///c:/Users/HP/Desktop/orchids-rube-app-clone-main/src/app/api/models/config/route.ts)
- Settings UI: [settings/models/page.tsx](file:///c:/Users/HP/Desktop/orchids-rube-app-clone-main/src/app/settings/models/page.tsx)

## Scheduling
- Scheduled actions APIs: [scheduled-actions/route.ts](file:///c:/Users/HP/Desktop/orchids-rube-app-clone-main/src/app/api/scheduled-actions/route.ts), [scheduled-actions/execute/route.ts](file:///c:/Users/HP/Desktop/orchids-rube-app-clone-main/src/app/api/scheduled-actions/execute/route.ts)
- Scheduled workflows (cron): [workflows/[id]/schedule/route.ts](file:///c:/Users/HP/Desktop/orchids-rube-app-clone-main/src/app/api/workflows/%5Bid%5D/schedule/route.ts), [cron/run/route.ts](file:///c:/Users/HP/Desktop/orchids-rube-app-clone-main/src/app/api/cron/run/route.ts)

