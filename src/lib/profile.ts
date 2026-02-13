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
 * Get the user profile / credentials for a specific user.
 * Each user has their own isolated profile — no env var fallbacks.
 */
export async function getUserCredentials(
  userId: string
): Promise<UserCredentials> {
  const profile = await prisma.userProfile.findUnique({
    where: { userId },
  });

  return {
    githubToken: profile?.githubToken || null,
    githubUsername: profile?.githubUsername || null,
    jiraEmail: profile?.jiraEmail || null,
    jiraApiToken: profile?.jiraApiToken || null,
    llmApiKey: profile?.llmApiKey || null,
    llmBaseUrl: profile?.llmBaseUrl || null,
    llmModel: profile?.llmModel || null,
  };
}
