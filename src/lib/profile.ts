import { prisma } from "./prisma";

export interface UserCredentials {
  githubToken: string | null;
  githubUsername: string | null;
  jiraEmail: string | null;
  jiraApiToken: string | null;
  llmApiKey: string | null;
  llmBaseUrl: string | null;
  llmModel: string | null;
}

/**
 * Get the current user profile from DB, falling back to env vars.
 * Since this is a single-user app, we always use the first (and only) profile.
 */
export async function getUserCredentials(): Promise<UserCredentials> {
  const profile = await prisma.userProfile.findFirst({
    orderBy: { createdAt: "asc" },
  });

  return {
    githubToken: profile?.githubToken || process.env.GITHUB_TOKEN || null,
    githubUsername: profile?.githubUsername || process.env.GITHUB_USERNAME || null,
    jiraEmail: profile?.jiraEmail || process.env.JIRA_EMAIL || null,
    jiraApiToken: profile?.jiraApiToken || process.env.JIRA_API_TOKEN || null,
    llmApiKey: profile?.llmApiKey || process.env.LLM_API_KEY || null,
    llmBaseUrl: profile?.llmBaseUrl || process.env.LLM_BASE_URL || null,
    llmModel: profile?.llmModel || process.env.LLM_MODEL || null,
  };
}

/**
 * Get the GitHub avatar URL for the current user.
 */
export async function getGitHubAvatarUrl(): Promise<string | null> {
  const creds = await getUserCredentials();
  if (!creds.githubUsername) return null;
  return `https://github.com/${creds.githubUsername}.png?size=80`;
}
