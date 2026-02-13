import { GitHubCommit } from "@/types";

const GITHUB_API_BASE = "https://api.github.com";

function getHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "eod-assistant",
  };
}

/**
 * Fetches all branch names for a given repository.
 */
async function fetchBranches(
  owner: string,
  repo: string,
  token: string
): Promise<string[]> {
  const branches: string[] = [];
  let page = 1;

  while (true) {
    const params = new URLSearchParams({
      per_page: "100",
      page: String(page),
    });
    const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/branches?${params}`;
    const response = await fetch(url, { headers: getHeaders(token) });

    if (!response.ok) break;

    const data: { name: string }[] = await response.json();
    if (data.length === 0) break;

    branches.push(...data.map((b) => b.name));
    if (data.length < 100) break;
    page++;
  }

  return branches;
}

/**
 * Fetches commits from a single branch, filtered by author and date range.
 */
async function fetchCommitsFromBranch(
  owner: string,
  repo: string,
  branch: string,
  author: string,
  since: string,
  until: string,
  token: string
): Promise<GitHubCommit[]> {
  const params = new URLSearchParams({
    sha: branch,
    author,
    since,
    until,
    per_page: "100",
  });

  const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/commits?${params}`;
  const response = await fetch(url, { headers: getHeaders(token) });

  if (!response.ok) {
    return [];
  }

  const data = await response.json();

  return data.map(
    (commit: {
      sha: string;
      commit: {
        message: string;
        author: { date: string };
      };
      html_url: string;
    }) => ({
      sha: commit.sha.substring(0, 7),
      fullSha: commit.sha,
      message: commit.commit.message.split("\n")[0],
      date: commit.commit.author.date,
      url: commit.html_url,
    })
  );
}

/**
 * Fetches commits across ALL branches of a repository,
 * filtered by author and date range. Deduplicates by SHA.
 */
export async function fetchCommits(
  owner: string,
  repo: string,
  author: string,
  since: string,
  until: string,
  token: string
): Promise<GitHubCommit[]> {
  const branches = await fetchBranches(owner, repo, token);

  if (branches.length === 0) {
    return fetchCommitsFromBranch(owner, repo, "", author, since, until, token);
  }

  const seen = new Set<string>();
  const allCommits: GitHubCommit[] = [];

  const batchSize = 5;
  for (let i = 0; i < branches.length; i += batchSize) {
    const batch = branches.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map((branch) =>
        fetchCommitsFromBranch(owner, repo, branch, author, since, until, token)
      )
    );

    for (const commits of results) {
      for (const commit of commits) {
        if (!seen.has(commit.sha)) {
          seen.add(commit.sha);
          allCommits.push(commit);
        }
      }
    }
  }

  allCommits.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return allCommits;
}

export async function fetchCommitDetails(
  owner: string,
  repo: string,
  sha: string,
  token: string
): Promise<string[]> {
  const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/commits/${sha}`;

  const response = await fetch(url, { headers: getHeaders(token) });

  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  return (
    data.files?.map((f: { filename: string }) => f.filename) ?? []
  );
}
