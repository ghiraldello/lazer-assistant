import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/profile - Get current user profile (single-user app)
 * Returns actual credential values since this is a local app.
 */
export async function GET() {
  try {
    let profile = await prisma.userProfile.findFirst({
      orderBy: { createdAt: "asc" },
    });

    if (!profile) {
      // Auto-create a profile seeded from env vars
      profile = await prisma.userProfile.create({
        data: {
          githubToken: process.env.GITHUB_TOKEN || null,
          githubUsername: process.env.GITHUB_USERNAME || null,
          jiraEmail: process.env.JIRA_EMAIL || null,
          jiraApiToken: process.env.JIRA_API_TOKEN || null,
          llmApiKey: process.env.LLM_API_KEY || null,
          llmBaseUrl: process.env.LLM_BASE_URL || null,
          llmModel: process.env.LLM_MODEL || null,
        },
      });
    }

    return NextResponse.json({
      id: profile.id,
      githubUsername: profile.githubUsername,
      githubToken: profile.githubToken,
      jiraEmail: profile.jiraEmail,
      jiraApiToken: profile.jiraApiToken,
      llmApiKey: profile.llmApiKey,
      llmBaseUrl: profile.llmBaseUrl,
      llmModel: profile.llmModel,
      hasGithubToken: !!profile.githubToken,
      hasJiraApiToken: !!profile.jiraApiToken,
      hasLlmApiKey: !!profile.llmApiKey,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Profile GET error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * PUT /api/profile - Update user profile
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    let profile = await prisma.userProfile.findFirst({
      orderBy: { createdAt: "asc" },
    });

    const data: Record<string, string | null> = {};

    // Only update fields that are explicitly provided (not undefined)
    if (body.githubUsername !== undefined) data.githubUsername = body.githubUsername || null;
    if (body.githubToken !== undefined) data.githubToken = body.githubToken || null;
    if (body.jiraEmail !== undefined) data.jiraEmail = body.jiraEmail || null;
    if (body.jiraApiToken !== undefined) data.jiraApiToken = body.jiraApiToken || null;
    if (body.llmApiKey !== undefined) data.llmApiKey = body.llmApiKey || null;
    if (body.llmBaseUrl !== undefined) data.llmBaseUrl = body.llmBaseUrl || null;
    if (body.llmModel !== undefined) data.llmModel = body.llmModel || null;

    if (profile) {
      profile = await prisma.userProfile.update({
        where: { id: profile.id },
        data,
      });
    } else {
      profile = await prisma.userProfile.create({ data });
    }

    return NextResponse.json({
      id: profile.id,
      githubUsername: profile.githubUsername,
      githubToken: profile.githubToken,
      jiraEmail: profile.jiraEmail,
      jiraApiToken: profile.jiraApiToken,
      llmApiKey: profile.llmApiKey,
      llmBaseUrl: profile.llmBaseUrl,
      llmModel: profile.llmModel,
      hasGithubToken: !!profile.githubToken,
      hasJiraApiToken: !!profile.jiraApiToken,
      hasLlmApiKey: !!profile.llmApiKey,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Profile PUT error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
