import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ProjectFormData } from "@/types";
import { getAuthUserId } from "@/lib/auth-helpers";

// GET /api/projects/[id] - Get a single project (must belong to user)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userIdOrError = await getAuthUserId();
    if (userIdOrError instanceof NextResponse) return userIdOrError;
    const userId = userIdOrError;

    const { id } = await params;
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        reports: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!project || project.userId !== userId) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(project);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PUT /api/projects/[id] - Update a project (must belong to user)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userIdOrError = await getAuthUserId();
    if (userIdOrError instanceof NextResponse) return userIdOrError;
    const userId = userIdOrError;

    const { id } = await params;

    // Verify ownership
    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    const body: Partial<ProjectFormData> = await request.json();

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.clientName && { clientName: body.clientName }),
        ...(body.githubOwner && { githubOwner: body.githubOwner }),
        ...(body.githubRepo && { githubRepo: body.githubRepo }),
        ...(body.githubBranch !== undefined && {
          githubBranch: body.githubBranch,
        }),
        ...(body.jiraProjectKey && {
          jiraProjectKey: body.jiraProjectKey,
        }),
        ...(body.jiraDomain && { jiraDomain: body.jiraDomain }),
        ...(body.slackWebhookUrl !== undefined && {
          slackWebhookUrl: body.slackWebhookUrl || null,
        }),
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/projects/[id] - Delete a project (must belong to user)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userIdOrError = await getAuthUserId();
    if (userIdOrError instanceof NextResponse) return userIdOrError;
    const userId = userIdOrError;

    const { id } = await params;

    // Verify ownership
    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    await prisma.project.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
