# Beauto

Beauto is a workflow automation studio built with Next.js and Supabase. It lets you turn natural-language instructions into structured multi-step workflows, connect external tools via Composio, and run workflows with a step-by-step execution timeline.

## Features

- Workflow Studio at `/studio` to generate, edit, and run workflows
- Integrations via Composio (email, GitHub, Slack, etc. depending on your connected toolkits)
- Supabase Auth + Postgres persistence
- Real-time workflow execution timeline (SSE)
- Optional AI providers (OpenAI / Gemini) for parsing and generation

## Getting Started

### Prerequisites

- Node.js 18+ (CI uses Node 20)
- A Supabase project (URL + anon key required)
- Composio API key (required for integrations)
- OpenAI and/or Gemini API key (optional; used by AI-powered features)

### Install

```bash
git clone https://github.com/ikramzafar0343/Beauto.git
cd Beauto
npm ci
```

If `npm ci` fails due to peer dependency resolution, try:

```bash
npm install --legacy-peer-deps
```

### Configure environment

1. Copy the example file and fill in your own values:

```bash
cp .env.example .env.local
```

2. Run the app:

```bash
npm run dev
```

Open http://localhost:3000.

### Supabase setup

- SQL migrations live in [supabase/migrations](./supabase/migrations).
- Setup guides:
  - [QUICK_START_SUPABASE.md](./QUICK_START_SUPABASE.md)
  - [SETUP_GUIDE.md](./SETUP_GUIDE.md)
  - [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

## Environment Variables

Beauto validates runtime configuration in [env.ts](./src/lib/config/env.ts).

### Required

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon/public key

### Recommended / Feature-gated

- `SUPABASE_SERVICE_ROLE_KEY` - Required for server-side admin operations
- `COMPOSIO_API_KEY` - Required for Composio tool integrations
- `ENCRYPTION_KEY` - Recommended if you store encrypted secrets/tokens (min 16 chars)
- `CRON_SECRET` - Protects cron endpoints if enabled (min 8 chars)

### Optional

- `NEXT_PUBLIC_APP_URL` - App URL (used for callbacks; defaults to localhost in dev)
- `OPENAI_API_KEY`, `OPENAI_MODEL` - OpenAI provider settings
- `GEMINI_API_KEY`, `GEMINI_MODEL` - Gemini provider settings
- `DEFAULT_LLM_PROVIDER` - `openai` or `gemini`
- `COMPOSIO_MCP_CONFIG_ID` - Composio MCP config id
- `MCP_TOKEN_TTL_HOURS` - Token TTL configuration

## Scripts

- `npm run dev` - Start dev server
- `npm run build` - Production build
- `npm run start` - Start production server
- `npm run lint` - ESLint
- `npm run typecheck` - TypeScript typecheck
- `npm run test` - Unit tests (Vitest)
- `npm run test:e2e` - E2E tests (Playwright)

## Project Structure

```
src/
  app/          Next.js App Router pages and API routes
  components/   UI and feature components
  lib/          Supabase clients, workflow engine, helpers
  middleware.ts Auth and request middleware
supabase/
  migrations/   Database schema migrations
tests/
  e2e/          Playwright smoke tests
```

## Documentation

- Feature overview: [docs/FEATURE_MAPPING.md](./docs/FEATURE_MAPPING.md)
- Implementation notes: [docs/IMPLEMENTATION_PLAN.md](./docs/IMPLEMENTATION_PLAN.md)
- Sanity checklist: [docs/SANITY_CHECKLIST.md](./docs/SANITY_CHECKLIST.md)

## Security Notes

- Never commit `.env.local` or API keys.
- If credentials were ever committed to git history, rotate them immediately in the provider dashboards.
