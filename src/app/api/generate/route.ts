import { NextRequest, NextResponse } from "next/server";
import { generateEODReport } from "@/lib/llm";
import { prisma } from "@/lib/prisma";
import { getUserCredentials } from "@/lib/profile";
import { GenerateReportRequest } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const creds = await getUserCredentials();

    if (!creds.llmApiKey) {
      return NextResponse.json(
        { error: "LLM API key not configured. Go to Settings to add it." },
        { status: 400 }
      );
    }

    const body: GenerateReportRequest = await request.json();
    const {
      projectId,
      projectName,
      commits,
      tickets,
      additionalContext,
    } = body;

    if (!projectName) {
      return NextResponse.json(
        { error: "projectName is required" },
        { status: 400 }
      );
    }

    if (!commits?.length && !tickets?.length) {
      return NextResponse.json(
        {
          error:
            "At least some commits or tickets are needed to generate a report",
        },
        { status: 400 }
      );
    }

    const { content, model } = await generateEODReport(
      projectName,
      commits || [],
      tickets || [],
      {
        apiKey: creds.llmApiKey,
        baseUrl: creds.llmBaseUrl,
        model: creds.llmModel,
      },
      additionalContext
    );

    if (projectId) {
      await prisma.report.create({
        data: {
          projectId,
          content,
          rawData: JSON.stringify({ commits, tickets }),
          date: new Date(),
        },
      });
    }

    return NextResponse.json({ content, model });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Generate report error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
