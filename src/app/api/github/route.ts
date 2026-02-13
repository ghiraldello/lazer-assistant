import { NextRequest, NextResponse } from "next/server";
import { fetchCommits } from "@/lib/github";
import { getUserCredentials } from "@/lib/profile";

/**
 * Sanitize GitHub repo input - handles full URLs, owner/repo, or just repo name.
 */
function sanitizeRepoParam(raw: string): string {
  let cleaned = raw.trim().replace(/\/+$/, "");
  const urlMatch = cleaned.match(
    /(?:https?:\/\/)?github\.com\/[^/]+\/([^/]+)/
  );
  if (urlMatch) return urlMatch[1];
  if (cleaned.includes("/")) {
    const parts = cleaned.split("/").filter(Boolean);
    return parts[parts.length - 1];
  }
  return cleaned;
}

export async function GET(request: NextRequest) {
  try {
    const creds = await getUserCredentials();

    if (!creds.githubToken) {
      return NextResponse.json(
        { error: "GitHub token not configured. Go to Settings to add it." },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const owner = searchParams.get("owner");
    const rawRepo = searchParams.get("repo");
    const author =
      searchParams.get("author") || creds.githubUsername;
    const date = searchParams.get("date");

    if (!owner || !rawRepo) {
      return NextResponse.json(
        { error: "owner and repo are required query parameters" },
        { status: 400 }
      );
    }

    const repo = sanitizeRepoParam(rawRepo);

    if (!author) {
      return NextResponse.json(
        { error: "GitHub username not configured. Go to Settings to add it." },
        { status: 400 }
      );
    }

    const targetDate = date ? new Date(date) : new Date();
    const since = new Date(targetDate);
    since.setHours(0, 0, 0, 0);
    const until = new Date(targetDate);
    until.setHours(23, 59, 59, 999);

    const commits = await fetchCommits(
      owner,
      repo,
      author,
      since.toISOString(),
      until.toISOString(),
      creds.githubToken
    );

    return NextResponse.json({
      commits,
      repo: `${owner}/${repo}`,
      author,
      allBranches: true,
      dateRange: {
        since: since.toISOString(),
        until: until.toISOString(),
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    console.error("GitHub API error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
