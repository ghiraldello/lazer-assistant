"use client";

import { useState, useEffect } from "react";
import {
  Github,
  Ticket,
  Bot,
  Save,
  Loader2,
  Check,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

interface ProfileData {
  id: string;
  githubUsername: string | null;
  githubToken: string | null;
  jiraEmail: string | null;
  jiraApiToken: string | null;
  llmApiKey: string | null;
  llmBaseUrl: string | null;
  llmModel: string | null;
  hasGithubToken: boolean;
  hasJiraApiToken: boolean;
  hasLlmApiKey: boolean;
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Form state — empty string means "clear/remove", undefined means "don't update"
  const [githubUsername, setGithubUsername] = useState("");
  const [githubToken, setGithubToken] = useState("");
  const [jiraEmail, setJiraEmail] = useState("");
  const [jiraApiToken, setJiraApiToken] = useState("");
  const [llmApiKey, setLlmApiKey] = useState("");
  const [llmBaseUrl, setLlmBaseUrl] = useState("");
  const [llmModel, setLlmModel] = useState("");

  // Track which fields are configured (from DB)
  const [hasGithubToken, setHasGithubToken] = useState(false);
  const [hasJiraApiToken, setHasJiraApiToken] = useState(false);
  const [hasLlmApiKey, setHasLlmApiKey] = useState(false);

  // Show/hide tokens
  const [showGithubToken, setShowGithubToken] = useState(false);
  const [showJiraToken, setShowJiraToken] = useState(false);
  const [showLlmKey, setShowLlmKey] = useState(false);

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data: ProfileData) => {
        setGithubUsername(data.githubUsername || "");
        setGithubToken(data.githubToken || "");
        setJiraEmail(data.jiraEmail || "");
        setJiraApiToken(data.jiraApiToken || "");
        setLlmApiKey(data.llmApiKey || "");
        setLlmBaseUrl(data.llmBaseUrl || "");
        setLlmModel(data.llmModel || "");
        setHasGithubToken(data.hasGithubToken);
        setHasJiraApiToken(data.hasJiraApiToken);
        setHasLlmApiKey(data.hasLlmApiKey);

        if (data.githubUsername) {
          setAvatarUrl(
            `https://github.com/${data.githubUsername}.png?size=200`
          );
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const body: Record<string, string | null> = {
        githubUsername: githubUsername || null,
        githubToken: githubToken || null,
        jiraEmail: jiraEmail || null,
        jiraApiToken: jiraApiToken || null,
        llmApiKey: llmApiKey || null,
        llmBaseUrl: llmBaseUrl || null,
        llmModel: llmModel || null,
      };

      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setHasGithubToken(data.hasGithubToken);
      setHasJiraApiToken(data.hasJiraApiToken);
      setHasLlmApiKey(data.hasLlmApiKey);

      // Reload token values from response
      setGithubToken(data.githubToken || "");
      setJiraApiToken(data.jiraApiToken || "");
      setLlmApiKey(data.llmApiKey || "");

      if (data.githubUsername) {
        setAvatarUrl(
          `https://github.com/${data.githubUsername}.png?size=200`
        );
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);

      toast({
        title: "Settings saved",
        description: "Your profile has been updated successfully.",
        variant: "success",
      });
    } catch (err) {
      toast({
        title: "Failed to save",
        description:
          err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Configure your API credentials. These are stored securely in
          your local database.
        </p>
      </div>

      {/* User profile card */}
      <div className="flex items-center gap-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={githubUsername || "User"}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-2xl text-zinc-300 dark:text-zinc-600">?</span>
          )}
        </div>
        <div>
          <p className="font-medium">
            {githubUsername || "No username set"}
          </p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            <Badge
              variant={hasGithubToken ? "default" : "outline"}
              className="text-[10px]"
            >
              <ShieldCheck className="mr-1 h-3 w-3" />
              GitHub {hasGithubToken ? "Connected" : "Not set"}
            </Badge>
            <Badge
              variant={hasJiraApiToken ? "default" : "outline"}
              className="text-[10px]"
            >
              <ShieldCheck className="mr-1 h-3 w-3" />
              Jira {hasJiraApiToken ? "Connected" : "Not set"}
            </Badge>
            <Badge
              variant={hasLlmApiKey ? "default" : "outline"}
              className="text-[10px]"
            >
              <ShieldCheck className="mr-1 h-3 w-3" />
              LLM {hasLlmApiKey ? "Connected" : "Not set"}
            </Badge>
          </div>
        </div>
      </div>

      {/* GitHub */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <Github className="h-4 w-4" />
            GitHub
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="github-username" className="text-xs">
                Username
              </Label>
              <Input
                id="github-username"
                placeholder="your-github-username"
                value={githubUsername}
                onChange={(e) => setGithubUsername(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="github-token" className="text-xs">
                Personal Access Token{" "}
                {hasGithubToken && (
                  <span className="text-green-600 dark:text-green-400">
                    (configured)
                  </span>
                )}
              </Label>
              <div className="relative mt-1">
                <Input
                  id="github-token"
                  type={showGithubToken ? "text" : "password"}
                  placeholder="ghp_xxxxxxxxxxxx"
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowGithubToken(!showGithubToken)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                >
                  {showGithubToken ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-zinc-400">
            Create a token at{" "}
            <a
              href="https://github.com/settings/tokens"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-zinc-600 dark:hover:text-zinc-300"
            >
              github.com/settings/tokens
            </a>{" "}
            with <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">repo</code> scope.
          </p>
        </CardContent>
      </Card>

      {/* Jira */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <Ticket className="h-4 w-4" />
            Jira
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="jira-email" className="text-xs">
                Email
              </Label>
              <Input
                id="jira-email"
                type="email"
                placeholder="you@company.com"
                value={jiraEmail}
                onChange={(e) => setJiraEmail(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="jira-token" className="text-xs">
                API Token{" "}
                {hasJiraApiToken && (
                  <span className="text-green-600 dark:text-green-400">
                    (configured)
                  </span>
                )}
              </Label>
              <div className="relative mt-1">
                <Input
                  id="jira-token"
                  type={showJiraToken ? "text" : "password"}
                  placeholder="your-jira-api-token"
                  value={jiraApiToken}
                  onChange={(e) => setJiraApiToken(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowJiraToken(!showJiraToken)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                >
                  {showJiraToken ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-zinc-400">
            Create a token at{" "}
            <a
              href="https://id.atlassian.com/manage-profile/security/api-tokens"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-zinc-600 dark:hover:text-zinc-300"
            >
              id.atlassian.com
            </a>
          </p>
        </CardContent>
      </Card>

      {/* LLM */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <Bot className="h-4 w-4" />
            LLM / AI Provider
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="llm-key" className="text-xs">
              API Key{" "}
              {hasLlmApiKey && (
                <span className="text-green-600 dark:text-green-400">
                  (configured)
                </span>
              )}
            </Label>
            <div className="relative mt-1">
              <Input
                id="llm-key"
                type={showLlmKey ? "text" : "password"}
                placeholder="sk-xxxxxxxxxxxx"
                value={llmApiKey}
                onChange={(e) => setLlmApiKey(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowLlmKey(!showLlmKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              >
                {showLlmKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="llm-base-url" className="text-xs">
                Base URL{" "}
                <span className="font-normal text-zinc-400">(optional)</span>
              </Label>
              <Input
                id="llm-base-url"
                placeholder="https://llm.lazertechnologies.com"
                value={llmBaseUrl}
                onChange={(e) => setLlmBaseUrl(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="llm-model" className="text-xs">
                Model{" "}
                <span className="font-normal text-zinc-400">(optional)</span>
              </Label>
              <Input
                id="llm-model"
                placeholder="anthropic/claude-sonnet-4-20250514"
                value={llmModel}
                onChange={(e) => setLlmModel(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <p className="text-[11px] text-zinc-400">
            Compatible with OpenAI API format. Supports LiteLLM proxy,
            OpenRouter, or direct OpenAI. Get your API key at{" "}
            <a
              href="https://focus.lazertechnologies.com/settings"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-zinc-600 dark:hover:text-zinc-300"
            >
              Lazer Focus &rarr; Add API Key
            </a>
          </p>
        </CardContent>
      </Card>

      {/* Save */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="gap-2 px-8"
          size="lg"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : saved ? (
            <>
              <Check className="h-4 w-4" />
              Saved!
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
