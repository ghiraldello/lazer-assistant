import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/auth-helpers";

/**
 * GET /api/profile - Get current authenticated user's profile
 */
export async function GET() {
  try {
    const userIdOrError = await getAuthUserId();
    if (userIdOrError instanceof NextResponse) return userIdOrError;
    const userId = userIdOrError;

    let profile = await prisma.userProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      profile = await prisma.userProfile.create({
        data: { userId },
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
 * PUT /api/profile - Update authenticated user's profile
 */
export async function PUT(request: NextRequest) {
  try {
    const userIdOrError = await getAuthUserId();
    if (userIdOrError instanceof NextResponse) return userIdOrError;
    const userId = userIdOrError;

    const body = await request.json();

    const data: Record<string, string | null> = {};

    if (body.githubUsername !== undefined)
      data.githubUsername = body.githubUsername || null;
    if (body.githubToken !== undefined)
      data.githubToken = body.githubToken || null;
    if (body.jiraEmail !== undefined)
      data.jiraEmail = body.jiraEmail || null;
    if (body.jiraApiToken !== undefined)
      data.jiraApiToken = body.jiraApiToken || null;
    if (body.llmApiKey !== undefined)
      data.llmApiKey = body.llmApiKey || null;
    if (body.llmBaseUrl !== undefined)
      data.llmBaseUrl = body.llmBaseUrl || null;
    if (body.llmModel !== undefined)
      data.llmModel = body.llmModel || null;

    const profile = await prisma.userProfile.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
    });

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
