"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProjectFormData } from "@/types";

interface ProjectFormProps {
  initialData?: Partial<ProjectFormData>;
  onSubmit: (data: ProjectFormData) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}

/**
 * Parses a GitHub URL or "owner/repo" string into { owner, repo }.
 * Accepts formats:
 *   - https://github.com/owner/repo
 *   - github.com/owner/repo
 *   - owner/repo
 *   - just "repo" (owner stays unchanged)
 */
function parseGitHubInput(input: string, currentOwner: string) {
  const cleaned = input.trim().replace(/\/+$/, "");

  // Full URL: https://github.com/owner/repo or github.com/owner/repo
  const urlMatch = cleaned.match(
    /(?:https?:\/\/)?github\.com\/([^/]+)\/([^/]+)/
  );
  if (urlMatch) {
    return { owner: urlMatch[1], repo: urlMatch[2] };
  }

  // owner/repo format
  if (cleaned.includes("/")) {
    const parts = cleaned.split("/").filter(Boolean);
    if (parts.length >= 2) {
      return { owner: parts[0], repo: parts[1] };
    }
  }

  // Just a repo name
  return { owner: currentOwner, repo: cleaned };
}

/**
 * Strips protocol prefix from a domain string.
 * "https://company.atlassian.net" -> "company.atlassian.net"
 */
function sanitizeDomain(input: string): string {
  return input.trim().replace(/^https?:\/\//, "").replace(/\/+$/, "");
}

export function ProjectForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = "Save Project",
}: ProjectFormProps) {
  const [loading, setLoading] = useState(false);
  const [githubUrl, setGithubUrl] = useState(
    initialData?.githubOwner && initialData?.githubRepo
      ? `${initialData.githubOwner}/${initialData.githubRepo}`
      : ""
  );
  const [formData, setFormData] = useState<ProjectFormData>({
    name: initialData?.name || "",
    clientName: initialData?.clientName || "",
    githubOwner: initialData?.githubOwner || "",
    githubRepo: initialData?.githubRepo || "",
    githubBranch: initialData?.githubBranch || "main",
    jiraProjectKey: initialData?.jiraProjectKey || "",
    jiraDomain: initialData?.jiraDomain || "",
    slackWebhookUrl: initialData?.slackWebhookUrl || "",
  });

  const handleChange = (field: keyof ProjectFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleGitHubUrlChange = (value: string) => {
    setGithubUrl(value);
    const { owner, repo } = parseGitHubInput(value, formData.githubOwner);
    setFormData((prev) => ({ ...prev, githubOwner: owner, githubRepo: repo }));
  };

  const handleJiraDomainChange = (value: string) => {
    setFormData((prev) => ({ ...prev, jiraDomain: sanitizeDomain(value) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Sanitize all fields before submitting
      const sanitized: ProjectFormData = {
        ...formData,
        githubOwner: formData.githubOwner.trim(),
        githubRepo: formData.githubRepo
          .trim()
          .replace(/^https?:\/\/github\.com\/[^/]+\//, "")
          .replace(/\/+$/, ""),
        jiraDomain: sanitizeDomain(formData.jiraDomain),
      };
      await onSubmit(sanitized);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Project Info */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          Project Information
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              placeholder="e.g. Product Middleware"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="clientName">Client Name</Label>
            <Input
              id="clientName"
              placeholder="e.g. Lazer"
              value={formData.clientName}
              onChange={(e) => handleChange("clientName", e.target.value)}
              required
            />
          </div>
        </div>
      </div>

      {/* GitHub */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          GitHub Repository
        </h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="githubUrl">Repository URL or owner/repo</Label>
            <Input
              id="githubUrl"
              placeholder="e.g. https://github.com/italistdev/product-middleware"
              value={githubUrl}
              onChange={(e) => handleGitHubUrlChange(e.target.value)}
              required
            />
            {formData.githubOwner && formData.githubRepo && (
              <p className="text-xs text-green-600 dark:text-green-400">
                Owner: <strong>{formData.githubOwner}</strong> / Repo: <strong>{formData.githubRepo}</strong>
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="githubBranch">Branch (optional)</Label>
            <Input
              id="githubBranch"
              placeholder="main"
              value={formData.githubBranch}
              onChange={(e) => handleChange("githubBranch", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Jira */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          Jira Configuration
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="jiraDomain">Jira Domain</Label>
            <Input
              id="jiraDomain"
              placeholder="e.g. company.atlassian.net"
              value={formData.jiraDomain}
              onChange={(e) => handleJiraDomainChange(e.target.value)}
              required
            />
            <p className="text-xs text-zinc-400">
              Just the domain, without https:// (e.g. lazertechnologies.atlassian.net)
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="jiraProjectKey">Project Key</Label>
            <Input
              id="jiraProjectKey"
              placeholder="e.g. ICGI"
              value={formData.jiraProjectKey}
              onChange={(e) =>
                handleChange("jiraProjectKey", e.target.value)
              }
              required
            />
          </div>
        </div>
      </div>

      {/* Slack */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          Slack (Optional)
        </h3>
        <div className="space-y-2">
          <Label htmlFor="slackWebhookUrl">Webhook URL</Label>
          <Input
            id="slackWebhookUrl"
            placeholder="https://hooks.slack.com/services/..."
            value={formData.slackWebhookUrl}
            onChange={(e) =>
              handleChange("slackWebhookUrl", e.target.value)
            }
          />
          <p className="text-xs text-zinc-400">
            Set up an Incoming Webhook at{" "}
            <a
              href="https://api.slack.com/messaging/webhooks"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-zinc-600"
            >
              api.slack.com/messaging/webhooks
            </a>
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </div>
    </form>
  );
}
