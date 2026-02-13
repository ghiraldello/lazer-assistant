import OpenAI from "openai";
import { GitHubCommit, JiraTicket } from "@/types";
import { buildEODPrompt } from "./prompts";

const DEFAULT_BASE_URL = "https://openrouter.ai/api/v1";
const DEFAULT_MODEL = "anthropic/claude-sonnet-4-20250514";

interface LLMCredentials {
  apiKey: string;
  baseUrl?: string | null;
  model?: string | null;
}

function getClient(creds: LLMCredentials): OpenAI {
  return new OpenAI({
    apiKey: creds.apiKey,
    baseURL: creds.baseUrl || DEFAULT_BASE_URL,
  });
}

export async function generateEODReport(
  projectName: string,
  commits: GitHubCommit[],
  tickets: JiraTicket[],
  creds: LLMCredentials,
  additionalContext?: string
): Promise<{ content: string; model: string }> {
  const client = getClient(creds);
  const model = creds.model || DEFAULT_MODEL;

  const prompt = buildEODPrompt(
    projectName,
    commits,
    tickets,
    additionalContext
  );

  const response = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: prompt.system },
      { role: "user", content: prompt.user },
    ],
    temperature: 0.7,
    max_tokens: 1024,
  });

  const content = response.choices[0]?.message?.content;

  if (!content) {
    throw new Error("LLM returned an empty response");
  }

  return { content: content.trim(), model };
}
