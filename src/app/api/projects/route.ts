import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ProjectFormData } from "@/types";

// GET /api/projects - List all projects
export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        _count: {
          select: { reports: true },
        },
      },
    });

    return NextResponse.json(projects);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    console.error("List projects error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/projects - Create a new project
export async function POST(request: NextRequest) {
  try {
    const body: ProjectFormData = await request.json();

    const {
      name,
      clientName,
      githubOwner,
      githubRepo,
      githubBranch,
      jiraProjectKey,
      jiraDomain,
      slackWebhookUrl,
    } = body;

    if (
      !name ||
      !clientName ||
      !githubOwner ||
      !githubRepo ||
      !jiraProjectKey ||
      !jiraDomain
    ) {
      return NextResponse.json(
        { error: "All required fields must be provided" },
        { status: 400 }
      );
    }

    const project = await prisma.project.create({
      data: {
        name,
        clientName,
        githubOwner,
        githubRepo,
        githubBranch: githubBranch || "main",
        jiraProjectKey,
        jiraDomain,
        slackWebhookUrl: slackWebhookUrl || null,
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Create project error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
