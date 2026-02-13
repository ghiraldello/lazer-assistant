// ============================================
// GitHub Types
// ============================================

export interface GitHubCommit {
  sha: string;
  message: string;
  date: string;
  url: string;
  filesChanged?: string[];
}

export interface GitHubCommitsResponse {
  commits: GitHubCommit[];
  repo: string;
  author: string;
  dateRange: {
    since: string;
    until: string;
  };
}

// ============================================
// Jira Types
// ============================================

export interface JiraTicket {
  key: string;
  summary: string;
  status: string;
  type: string;
  url: string;
  priority?: string;
}

export interface JiraTicketsResponse {
  tickets: JiraTicket[];
  project: string;
  assignee: string;
}

// ============================================
// Report Types
// ============================================

export interface GenerateReportRequest {
  projectId: string;
  projectName: string;
  commits: GitHubCommit[];
  tickets: JiraTicket[];
  additionalContext?: string;
}

export interface GenerateReportResponse {
  content: string;
  model: string;
}

// ============================================
// Slack Types
// ============================================

export interface SlackPostRequest {
  webhookUrl: string;
  message: string;
}

export interface SlackPostResponse {
  success: boolean;
  error?: string;
}

// ============================================
// Project Types (for API)
// ============================================

export interface ProjectFormData {
  name: string;
  clientName: string;
  githubOwner: string;
  githubRepo: string;
  githubBranch?: string;
  jiraProjectKey: string;
  jiraDomain: string;
  slackWebhookUrl?: string;
}
