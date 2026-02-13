export async function postToSlack(
  webhookUrl: string,
  message: string
): Promise<void> {
  if (!webhookUrl) {
    throw new Error("Slack webhook URL is required");
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: message,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Slack API error (${response.status}): ${error}`);
  }
}
