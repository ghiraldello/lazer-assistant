# EOD Assistant

Automate your End of Day (EOD) reports by pulling data from **GitHub** and **Jira**, then using **AI** to generate professional Slack-ready summaries.

## Features

- **GitHub Integration** — Fetches your commits for any given day
- **Jira Integration** — Pulls your in-progress tickets via JQL
- **AI-Powered Reports** — Uses Claude (Anthropic) to generate natural, professional EOD summaries
- **Multi-Project Support** — Configure multiple projects with different repos, Jira boards, and Slack channels
- **Editable Reports** — Review and edit generated reports before sharing
- **Slack Integration** — Copy to clipboard or post directly via webhook
- **Report History** — Browse and re-use previously generated reports

## Tech Stack

- **Next.js 15** (App Router, TypeScript)
- **Tailwind CSS v4** + shadcn/ui components
- **SQLite** via Prisma (zero-config, file-based database)
- **OpenRouter** (Claude Sonnet via OpenRouter, or any LLM)
- **GitHub REST API** / **Jira REST API v3** / **Slack Webhooks**

## Quick Start

### Prerequisites

- **Node.js** 18+ (recommended: 20+)
- **pnpm** (`npm install -g pnpm`)

### 1. Clone and install

```bash
git clone <your-repo-url> eod-assistant
cd eod-assistant
pnpm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

| Variable | Required | Description |
|---|---|---|
| `GITHUB_TOKEN` | Yes | [GitHub Personal Access Token](https://github.com/settings/tokens) with `repo` scope |
| `GITHUB_USERNAME` | Yes | Your GitHub username |
| `JIRA_EMAIL` | Yes | Your Atlassian account email |
| `JIRA_API_TOKEN` | Yes | [Jira API Token](https://id.atlassian.com/manage-profile/security/api-tokens) |
| `LLM_API_KEY` | Yes | API key for OpenRouter or your LLM provider |
| `LLM_BASE_URL` | No | Defaults to `https://openrouter.ai/api/v1` |
| `LLM_MODEL` | No | Defaults to `anthropic/claude-sonnet-4-20250514` |
| `SLACK_DEFAULT_WEBHOOK_URL` | No | [Slack Incoming Webhook](https://api.slack.com/messaging/webhooks) |
| `DATABASE_URL` | No | Defaults to `file:./dev.db` (SQLite) |

### 3. Set up the database

```bash
pnpm db:migrate
```

### 4. Start the dev server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### 1. Add a Project

Go to **Projects** and click **Add Project**. Fill in:

- **Project Name** — e.g. "Product Middleware"
- **Client Name** — e.g. "Lazer"
- **GitHub Owner/Repo** — e.g. `your-org` / `your-repo`
- **Jira Domain/Project Key** — e.g. `company.atlassian.net` / `ICGI`
- **Slack Webhook URL** (optional) — for direct posting

### 2. Generate an EOD Report

1. Go to the **Dashboard**
2. Select your project and date
3. Review the fetched commits and Jira tickets (toggle items on/off)
4. Optionally add context (meetings, blockers, plans for tomorrow)
5. Click **Generate EOD Report** (or press `Cmd+Enter`)
6. Edit the generated report as needed
7. **Copy** to clipboard or **Post to Slack** directly

### 3. View Report History

Go to **Reports** to see all previously generated EOD reports. You can expand and copy any past report.

## Project Structure

```
eod-assistant/
├── prisma/               # Database schema and migrations
├── src/
│   ├── app/              # Next.js App Router pages and API routes
│   │   ├── api/          # REST API endpoints
│   │   ├── projects/     # Project configuration pages
│   │   └── reports/      # Report history page
│   ├── components/       # React components
│   │   ├── ui/           # shadcn/ui base components
│   │   ├── projects/     # Project form components
│   │   └── report/       # Report editor component
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Server-side utilities
│   │   ├── github.ts     # GitHub API client
│   │   ├── jira.ts       # Jira API client
│   │   ├── llm.ts         # LLM integration (OpenRouter)
│   │   ├── slack.ts      # Slack webhook client
│   │   ├── prompts.ts    # AI prompt templates
│   │   └── prisma.ts     # Database client
│   └── types/            # TypeScript type definitions
├── .env.example          # Environment variables template
└── package.json
```

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/github?owner=x&repo=y&date=YYYY-MM-DD` | Fetch commits |
| `GET` | `/api/jira?domain=x&projectKey=y` | Fetch in-progress tickets |
| `POST` | `/api/generate` | Generate EOD report via AI |
| `POST` | `/api/slack` | Post message to Slack |
| `GET` | `/api/projects` | List all projects |
| `POST` | `/api/projects` | Create a project |
| `PUT` | `/api/projects/:id` | Update a project |
| `DELETE` | `/api/projects/:id` | Delete a project |
| `GET` | `/api/reports` | List report history |

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Cmd/Ctrl + Enter` | Generate EOD report |

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
