import { NextRequest, NextResponse } from "next/server";
import { postToSlack } from "@/lib/slack";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { webhookUrl, message } = body;

    const url =
      webhookUrl || process.env.SLACK_DEFAULT_WEBHOOK_URL;

    if (!url) {
      return NextResponse.json(
        {
          error:
            "webhookUrl is required (either in request body or SLACK_DEFAULT_WEBHOOK_URL env var)",
        },
        { status: 400 }
      );
    }

    if (!message) {
      return NextResponse.json(
        { error: "message is required" },
        { status: 400 }
      );
    }

    await postToSlack(url, message);

    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Slack post error:", message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
