import { JiraTicket } from "@/types";

function getHeaders(email: string, token: string): HeadersInit {
  const encoded = Buffer.from(`${email}:${token}`).toString("base64");
  return {
    Authorization: `Basic ${encoded}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
}

export async function fetchInProgressTickets(
  domain: string,
  projectKey: string,
  jiraEmail: string,
  jiraApiToken: string,
  assigneeEmail?: string
): Promise<JiraTicket[]> {
  const jql = buildJQL(projectKey, assigneeEmail);

  const url = `https://${domain}/rest/api/3/search/jql`;

  const response = await fetch(url, {
    method: "POST",
    headers: getHeaders(jiraEmail, jiraApiToken),
    body: JSON.stringify({
      jql,
      fields: ["summary", "status", "issuetype", "priority"],
      maxResults: 50,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Jira API error (${response.status}): ${error}`);
  }

  const data = await response.json();

  const tickets: JiraTicket[] = data.issues.map(
    (issue: {
      key: string;
      fields: {
        summary: string;
        status: { name: string };
        issuetype: { name: string };
        priority?: { name: string };
      };
    }) => ({
      key: issue.key,
      summary: issue.fields.summary,
      status: issue.fields.status.name,
      type: issue.fields.issuetype.name,
      url: `https://${domain}/browse/${issue.key}`,
      priority: issue.fields.priority?.name,
    })
  );

  return tickets;
}

function buildJQL(projectKey: string, assigneeEmail?: string): string {
  const conditions = [
    `project = "${projectKey}"`,
    `status = "In Progress"`,
  ];

  if (assigneeEmail) {
    conditions.push(`assignee = "${assigneeEmail}"`);
  }

  return conditions.join(" AND ") + " ORDER BY updated DESC";
}
