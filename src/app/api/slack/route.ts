import { NextRequest, NextResponse } from "next/server";
import { postToSlack } from "@/lib/slack";
import { getAuthUserId } from "@/lib/auth-helpers";

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const userIdOrError = await getAuthUserId();
    if (userIdOrError instanceof NextResponse) return userIdOrError;

    const body = await request.json();
    const { webhookUrl, message } = body;

    if (!webhookUrl) {
      return NextResponse.json(
        { error: "webhookUrl is required in request body" },
        { status: 400 }
      );
    }

    if (!message) {
      return NextResponse.json(
        { error: "message is required" },
        { status: 400 }
      );
    }

    await postToSlack(webhookUrl, message);

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
