-- CreateTable
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "githubToken" TEXT,
    "githubUsername" TEXT,
    "jiraEmail" TEXT,
    "jiraApiToken" TEXT,
    "llmApiKey" TEXT,
    "llmBaseUrl" TEXT,
    "llmModel" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
