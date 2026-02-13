import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/auth-helpers";

// GET /api/reports - List reports for the authenticated user's projects
export async function GET(request: NextRequest) {
  try {
    const userIdOrError = await getAuthUserId();
    if (userIdOrError instanceof NextResponse) return userIdOrError;
    const userId = userIdOrError;

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    const reports = await prisma.report.findMany({
      where: {
        project: { userId },
        ...(projectId ? { projectId } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        project: {
          select: {
            name: true,
            clientName: true,
          },
        },
      },
    });

    return NextResponse.json(reports);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
