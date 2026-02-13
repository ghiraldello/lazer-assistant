import { NextRequest, NextResponse } from "next/server";
import { getUserCredentials } from "@/lib/profile";

const GITHUB_API_BASE = "https://api.github.com";

export interface ContributionDay {
  date: string;
  count: number;
}

/**
 * GET /api/github/contributions
 * Fetches commit counts per day for the last N weeks (default 12 weeks).
 */
export async function GET(request: NextRequest) {
  try {
    const creds = await getUserCredentials();

    if (!creds.githubToken) {
      return NextResponse.json(
        { error: "GitHub token not configured" },
        { status: 400 }
      );
    }

    const headers: HeadersInit = {
      Authorization: `Bearer ${creds.githubToken}`,
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "eod-assistant",
    };

    const { searchParams } = new URL(request.url);
    const owner = searchParams.get("owner");
    const repo = searchParams.get("repo");
    const author =
      searchParams.get("author") || creds.githubUsername;
    const weeks = parseInt(searchParams.get("weeks") || "12", 10);

    if (!owner || !repo) {
      return NextResponse.json(
        { error: "owner and repo are required" },
        { status: 400 }
      );
    }

    if (!author) {
      return NextResponse.json(
        { error: "GitHub username not configured" },
        { status: 400 }
      );
    }

    const until = new Date();
    until.setHours(23, 59, 59, 999);
    const since = new Date();
    since.setDate(since.getDate() - weeks * 7);
    since.setHours(0, 0, 0, 0);

    const branchesRes = await fetch(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/branches?per_page=100`,
      { headers }
    );
    const branches: { name: string }[] = branchesRes.ok
      ? await branchesRes.json()
      : [];

    const branchNames =
      branches.length > 0 ? branches.map((b) => b.name) : [""];

    const seenShas = new Set<string>();
    const dateCounts: Record<string, number> = {};

    const batchSize = 5;
    for (let i = 0; i < branchNames.length; i += batchSize) {
      const batch = branchNames.slice(i, i + batchSize);
      const results = await Promise.all(
        batch.map(async (branch) => {
          const params = new URLSearchParams({
            author,
            since: since.toISOString(),
            until: until.toISOString(),
            per_page: "100",
          });
          if (branch) params.set("sha", branch);

          const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/commits?${params}`;
          const res = await fetch(url, { headers });
          if (!res.ok) return [];
          return res.json();
        })
      );

      for (const commits of results) {
        for (const commit of commits) {
          if (seenShas.has(commit.sha)) continue;
          seenShas.add(commit.sha);

          const dateStr = commit.commit.author.date.substring(0, 10);
          dateCounts[dateStr] = (dateCounts[dateStr] || 0) + 1;
        }
      }
    }

    const contributions: ContributionDay[] = [];
    const current = new Date(since);
    while (current <= until) {
      const dateStr = current.toISOString().substring(0, 10);
      contributions.push({
        date: dateStr,
        count: dateCounts[dateStr] || 0,
      });
      current.setDate(current.getDate() + 1);
    }

    return NextResponse.json({
      contributions,
      totalCommits: seenShas.size,
      repo: `${owner}/${repo}`,
      author,
      weeks,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Contributions API error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
