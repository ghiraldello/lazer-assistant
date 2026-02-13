import { NextRequest, NextResponse } from "next/server";
import { fetchInProgressTickets } from "@/lib/jira";
import { getUserCredentials } from "@/lib/profile";

/**
 * Sanitize Jira domain - strips https:// prefix and trailing slashes.
 */
function sanitizeDomain(raw: string): string {
  return raw.trim().replace(/^https?:\/\//, "").replace(/\/+$/, "");
}

export async function GET(request: NextRequest) {
  try {
    const creds = await getUserCredentials();

    if (!creds.jiraEmail || !creds.jiraApiToken) {
      return NextResponse.json(
        { error: "Jira credentials not configured. Go to Settings to add them." },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const rawDomain = searchParams.get("domain");
    const projectKey = searchParams.get("projectKey");
    const assignee =
      searchParams.get("assignee") || creds.jiraEmail;

    if (!rawDomain || !projectKey) {
      return NextResponse.json(
        { error: "domain and projectKey are required query parameters" },
        { status: 400 }
      );
    }

    const domain = sanitizeDomain(rawDomain);

    const tickets = await fetchInProgressTickets(
      domain,
      projectKey,
      creds.jiraEmail,
      creds.jiraApiToken,
      assignee || undefined
    );

    return NextResponse.json({
      tickets,
      project: projectKey,
      assignee: assignee || "unspecified",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Jira API error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
