# EOD Assistant

Automate your End of Day (EOD) reports by pulling data from **GitHub** and **Jira**, then using **AI** to generate professional Slack-ready summaries.

## Features

- **GitHub OAuth Login** — Each user signs in with their GitHub account
- **Per-User Data Isolation** — Credentials, projects, and reports are private to each user
- **GitHub Integration** — Fetches your commits for any given day
- **Jira Integration** — Pulls your in-progress tickets via JQL
- **AI-Powered Reports** — Uses LLM (Claude, OpenAI, etc.) to generate natural, professional EOD summaries
- **Multi-Project Support** — Configure multiple projects with different repos, Jira boards, and Slack channels
- **Editable Reports** — Review and edit generated reports before sharing
- **Slack Integration** — Copy to clipboard or post directly via webhook
- **Report History** — Browse and re-use previously generated reports

## Tech Stack

- **Next.js 16** (App Router, TypeScript)
- **NextAuth.js v5** (GitHub OAuth)
- **Tailwind CSS v4** + shadcn/ui components
- **Turso** (remote SQLite) via Prisma
- **OpenAI SDK** (compatible with LiteLLM, OpenRouter, or direct OpenAI)
- **GitHub REST API** / **Jira REST API v3** / **Slack Webhooks**

## Quick Start

### Prerequisites

- **Node.js** 18+ (recommended: 20+)
- **pnpm** (`npm install -g pnpm`)
- A **GitHub OAuth App** (see below)
- A **Turso** database (free tier at [turso.tech](https://turso.tech))

### 1. Clone and install

```bash
git clone <your-repo-url> eod-assistant
cd eod-assistant
pnpm install
```

### 2. Create a GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Set:
   - **Application name**: `EOD Assistant`
   - **Homepage URL**: `http://localhost:3000` (or your production URL)
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Copy the **Client ID** and generate a **Client Secret**

### 3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` with your values:

| Variable | Required | Description |
|---|---|---|
| `AUTH_GITHUB_ID` | Yes | GitHub OAuth App Client ID |
| `AUTH_GITHUB_SECRET` | Yes | GitHub OAuth App Client Secret |
| `AUTH_SECRET` | Yes | Random string for session encryption (`openssl rand -base64 32`) |
| `TURSO_DATABASE_URL` | Yes | Turso database URL (or `file:./dev.db` for local dev) |
| `TURSO_AUTH_TOKEN` | Yes* | Turso auth token (*not needed for local file DB) |

> **Note**: GitHub tokens, Jira credentials, and LLM API keys are now managed per-user through the **Settings** page inside the app. No need to configure them as environment variables.

### 4. Set up the database

```bash
pnpm db:migrate
```

### 5. Start the dev server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. You'll be redirected to sign in with GitHub.

## Usage

### 1. Sign In

Click **Sign in with GitHub** to authenticate. Each user gets their own isolated workspace.

### 2. Configure Credentials

Go to **Settings** to add your personal API credentials:
- **GitHub** Personal Access Token and username
- **Jira** email and API token
- **LLM** API key, base URL, and model

### 3. Add a Project

Go to **Projects** and click **Add Project**. Fill in:

- **Project Name** — e.g. "Product Middleware"
- **Client Name** — e.g. "Lazer"
- **GitHub Owner/Repo** — e.g. `your-org` / `your-repo`
- **Jira Domain/Project Key** — e.g. `company.atlassian.net` / `ICGI`
- **Slack Webhook URL** (optional) — for direct posting

### 4. Generate an EOD Report

1. Go to the **Dashboard**
2. Select your project and date
3. Review the fetched commits and Jira tickets (toggle items on/off)
4. Optionally add context (meetings, blockers, plans for tomorrow)
5. Click **Generate EOD Report** (or press `Cmd+Enter`)
6. Edit the generated report as needed
7. **Copy** to clipboard or **Post to Slack** directly

### 5. View Report History

Go to **Reports** to see all previously generated EOD reports.

## Deployment (Vercel + Turso)

1. Push the project to GitHub
2. Import the repo in [Vercel](https://vercel.com)
3. Add the following environment variables:
   - `AUTH_GITHUB_ID`
   - `AUTH_GITHUB_SECRET`
   - `AUTH_SECRET`
   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`
4. Update your GitHub OAuth App callback URL to `https://your-domain.vercel.app/api/auth/callback/github`
5. Deploy!

## Project Structure

```
eod-assistant/
├── prisma/               # Database schema and migrations
├── src/
│   ├── app/              # Next.js App Router pages and API routes
│   │   ├── api/          # REST API endpoints
│   │   │   └── auth/     # NextAuth.js handler
│   │   ├── login/        # Login page
│   │   ├── projects/     # Project configuration pages
│   │   ├── reports/      # Report history page
│   │   └── settings/     # User credential settings
│   ├── components/       # React components
│   │   ├── ui/           # shadcn/ui base components
│   │   └── projects/     # Project form components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Server-side utilities
│   │   ├── github.ts     # GitHub API client
│   │   ├── jira.ts       # Jira API client
│   │   ├── llm.ts        # LLM integration
│   │   ├── slack.ts      # Slack webhook client
│   │   ├── prompts.ts    # AI prompt templates
│   │   ├── prisma.ts     # Database client
│   │   ├── profile.ts    # User credential helpers
│   │   └── auth-helpers.ts # Auth utilities
│   ├── auth.ts           # NextAuth.js configuration
│   ├── middleware.ts      # Route protection
│   └── types/            # TypeScript type definitions
├── .env.example          # Environment variables template
└── package.json
```

## API Endpoints

All API endpoints require authentication (via session cookie).

| Method | Endpoint | Description |
|---|---|---|
| `GET/POST` | `/api/auth/*` | NextAuth.js authentication |
| `GET` | `/api/profile` | Get user profile |
| `PUT` | `/api/profile` | Update user profile |
| `GET` | `/api/github?owner=x&repo=y&date=YYYY-MM-DD` | Fetch commits |
| `GET` | `/api/github/contributions?owner=x&repo=y` | Fetch contribution heatmap |
| `GET` | `/api/jira?domain=x&projectKey=y` | Fetch in-progress tickets |
| `POST` | `/api/generate` | Generate EOD report via AI |
| `POST` | `/api/slack` | Post message to Slack |
| `GET` | `/api/projects` | List user's projects |
| `POST` | `/api/projects` | Create a project |
| `PUT` | `/api/projects/:id` | Update a project |
| `DELETE` | `/api/projects/:id` | Delete a project |
| `GET` | `/api/reports` | List user's report history |

## Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm db:migrate   # Run database migrations
pnpm db:studio    # Open Prisma Studio (database GUI)
pnpm lint         # Run ESLint
```

## License

MIT
