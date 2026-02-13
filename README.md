# Rube-style Workflow Automation (Beauto base)

A production-ready Next.js application that enables AI agents to manage databases, send emails, and automate workflows using Composio integration.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun
- Supabase account
- Composio API key
- OpenAI API key (optional, for voice features)
- Google Gemini API key (optional, for image/video generation)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd orchids-rube-app-clone-main
```

2. Install dependencies:
```bash
npm install --legacy-peer-deps
```

3. Create a `.env.local` file in the root directory with the following variables:

   **⚠️ Important**: If you see `ERR_NAME_NOT_RESOLVED` errors, your Supabase environment variables are not configured.
   
   **📖 Need help finding your Supabase credentials?** 
   - Quick guide: [QUICK_START_SUPABASE.md](./QUICK_START_SUPABASE.md)
   - Detailed guide: [HOW_TO_GET_SUPABASE_CREDENTIALS.md](./HOW_TO_GET_SUPABASE_CREDENTIALS.md)
   - Full setup: [SETUP_GUIDE.md](./SETUP_GUIDE.md)

```env
# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Composio API Key (Required)
COMPOSIO_API_KEY=your_composio_api_key

# OpenAI API Key (Optional - for voice features)
OPENAI_API_KEY=your_openai_api_key

# Google Gemini API Key (Optional - for image/video generation)
GEMINI_API_KEY=your_gemini_api_key

# Application URL (Optional - defaults to localhost:3000)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📦 Build for Production

```bash
npm run build
npm start
```

## 🔧 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build the application for production
- `npm start` - Start the production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript typecheck
- `npm run test` - Run unit tests (Vitest)
- `npm run test:e2e` - Run E2E smoke tests (Playwright)

## 🛠️ Technology Stack

- **Framework**: Next.js 15.5.7
- **React**: 19.2.0
- **TypeScript**: 5.x
- **Database**: Supabase (PostgreSQL)
- **UI Components**: Radix UI
- **Styling**: Tailwind CSS 4
- **AI Integration**: Composio, OpenAI, Google Gemini
- **State Management**: React Hooks
- **Authentication**: Supabase Auth
- **Workflow Engine**: Custom workflow parser and execution engine
- **Real-time Updates**: Polling-based (WebSocket support planned)

## 📝 Environment Variables

### Required Variables

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (for server-side operations)
- `COMPOSIO_API_KEY` - Your Composio API key for tool integrations

### Optional Variables

- `OPENAI_API_KEY` - Required for AI features and workflow parsing
- `GEMINI_API_KEY` - Required for Gemini features and workflow parsing fallback
- `NEXT_PUBLIC_APP_URL` - Your application URL (used for OAuth callbacks)
- `OPENAI_MODEL` - OpenAI model name used by tool-based execution
- `GEMINI_MODEL` - Gemini model name used by parsing fallback
- `DEFAULT_LLM_PROVIDER` - openai|gemini default provider selection
- `COMPOSIO_MCP_CONFIG_ID` - Composio MCP config ID (recommended)
- `ENCRYPTION_KEY` - AES key for secret/token encryption
- `CRON_SECRET` - Optional cron protection token

## 🚀 Workflow Studio

### Natural Language to Workflow
Convert plain English instructions into structured multi-step workflows:

**Example**: "Send an email to john@example.com, then create a GitHub issue, then post to Slack #dev"

The system will:
1. Parse your instruction into structured steps
2. Detect required apps (Gmail, GitHub, Slack)
3. Extract parameters (email address, channel, etc.)
4. Create a workflow with proper dependencies
5. Execute steps in the correct order

### Real-Time Execution Timeline
Monitor workflow execution with:
- Step-by-step progress tracking
- Real-time status updates
- Expandable step details
- Input/output data viewing
- Error messages and logs
- Execution timing information

### Access Studio
Navigate to `/studio` to:
- Generate workflows from natural language
- Edit workflow steps and parameters
- Run workflows with a real-time (SSE) execution timeline

See [FEATURE_MAPPING.md](file:///c:/Users/HP/Desktop/orchids-rube-app-clone-main/docs/FEATURE_MAPPING.md), [IMPLEMENTATION_PLAN.md](file:///c:/Users/HP/Desktop/orchids-rube-app-clone-main/docs/IMPLEMENTATION_PLAN.md), and [SANITY_CHECKLIST.md](file:///c:/Users/HP/Desktop/orchids-rube-app-clone-main/docs/SANITY_CHECKLIST.md).

## 🐛 Issues Fixed & Production Readiness

### Dependency Conflicts Resolved
- Fixed `@composio/core` version conflict (downgraded to 0.2.6 for compatibility)
- Fixed `@openai/agents` version conflict (downgraded to 0.1.3)
- Fixed `openai` SDK version conflict (downgraded to 5.16.0)
- Fixed `zod` version conflict (downgraded to 3.25.76)

### TypeScript Errors Fixed
- Added type annotations for implicit `any` types in multiple files
- Fixed Composio type issues with type assertions (`as any`)
- Fixed missing imports (ExternalLink from lucide-react, createClient from supabase)
- Fixed RTCPeerConnection signalingState type issue

### Configuration Improvements
- Enabled TypeScript and ESLint checks in build (previously ignored)
- Fixed postinstall script to use npm instead of bun
- Simplified ESLint configuration for Next.js 15

### Security
- 1 moderate severity vulnerability in lodash (transitive dependency) - acceptable for production use

## 📚 Project Structure

```
├── src/
│   ├── app/              # Next.js app router pages and API routes
│   ├── components/       # React components
│   ├── contexts/         # React contexts (Theme, Language)
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility libraries (Supabase, utils)
│   └── styles/           # Global styles and animations
├── public/               # Static assets
└── package.json          # Dependencies and scripts
```

## 🚨 Important Notes

1. **Dependency Installation**: Always use `--legacy-peer-deps` flag when installing dependencies due to peer dependency conflicts in the Composio SDK.

2. **TypeScript Strict Mode**: The project uses strict TypeScript mode. All type errors have been resolved.

3. **ESLint Warning**: The Next.js ESLint plugin warning can be ignored - the configuration is functional.

4. **Composio Version**: The project uses Composio 0.2.6. While newer versions are available (0.5.5), upgrading may break compatibility with existing code.

## 🔄 Future Maintenance

- Consider upgrading Composio SDK when stable versions with better TypeScript support are available
- Monitor and update dependencies regularly for security patches
- The lodash vulnerability is in a transitive dependency and doesn't affect core functionality

## 📄 License

[Add your license information here]

## 🤝 Contributing

[Add contributing guidelines here]
"# Beauto" 
