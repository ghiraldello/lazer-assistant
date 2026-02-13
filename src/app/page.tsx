"use client";

import { useState, useEffect, useCallback } from "react";
import { format, parseISO } from "date-fns";
import {
  GitCommit,
  Ticket,
  Sparkles,
  Loader2,
  AlertCircle,
  CalendarDays,
  Copy,
  Check,
  Send,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ContributionHeatmap } from "@/components/dashboard/contribution-heatmap";
import { toast } from "@/hooks/use-toast";
import type { GitHubCommit, JiraTicket } from "@/types";

interface Project {
  id: string;
  name: string;
  clientName: string;
  githubOwner: string;
  githubRepo: string;
  jiraProjectKey: string;
  jiraDomain: string;
  slackWebhookUrl: string | null;
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [date, setDate] = useState(new Date());
  const [additionalContext, setAdditionalContext] = useState("");

  const [commits, setCommits] = useState<GitHubCommit[]>([]);
  const [tickets, setTickets] = useState<JiraTicket[]>([]);
  const [selectedCommits, setSelectedCommits] = useState<Set<string>>(
    new Set()
  );
  const [selectedTickets, setSelectedTickets] = useState<Set<string>>(
    new Set()
  );

  const [loadingCommits, setLoadingCommits] = useState(false);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [loadingReport, setLoadingReport] = useState(false);
  const [errorCommits, setErrorCommits] = useState<string | null>(null);
  const [errorTickets, setErrorTickets] = useState<string | null>(null);

  const [report, setReport] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [posting, setPosting] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const selectedProject = projects.find((p) => p.id === selectedProjectId);
  const dateStr = format(date, "yyyy-MM-dd");

  // Fetch projects on mount
  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProjects(data);
          if (data.length > 0) {
            setSelectedProjectId(data[0].id);
          }
        }
      })
      .catch(console.error);
  }, []);

  // Fetch data when project or date changes
  const fetchData = useCallback(async () => {
    if (!selectedProject) return;

    setCommits([]);
    setTickets([]);
    setSelectedCommits(new Set());
    setSelectedTickets(new Set());
    setErrorCommits(null);
    setErrorTickets(null);
    setReport("");

    // Fetch commits
    setLoadingCommits(true);
    try {
      const params = new URLSearchParams({
        owner: selectedProject.githubOwner,
        repo: selectedProject.githubRepo,
        date: dateStr,
      });
      const res = await fetch(`/api/github?${params}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setCommits(data.commits || []);
      // Start deselected — user picks what to include
      setSelectedCommits(new Set());
    } catch (err) {
      setErrorCommits(
        err instanceof Error ? err.message : "Failed to fetch commits"
      );
    } finally {
      setLoadingCommits(false);
    }

    // Fetch tickets
    setLoadingTickets(true);
    try {
      const params = new URLSearchParams({
        domain: selectedProject.jiraDomain,
        projectKey: selectedProject.jiraProjectKey,
      });
      const res = await fetch(`/api/jira?${params}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setTickets(data.tickets || []);
      // Start deselected — user picks what to include
      setSelectedTickets(new Set());
    } catch (err) {
      setErrorTickets(
        err instanceof Error ? err.message : "Failed to fetch tickets"
      );
    } finally {
      setLoadingTickets(false);
    }
  }, [selectedProject, dateStr]);

  useEffect(() => {
    if (selectedProject) {
      fetchData();
    }
  }, [selectedProject, dateStr, fetchData]);

  // Toggle commit selection
  const toggleCommit = (sha: string) => {
    setSelectedCommits((prev) => {
      const next = new Set(prev);
      if (next.has(sha)) next.delete(sha);
      else next.add(sha);
      return next;
    });
  };

  // Toggle ticket selection
  const toggleTicket = (key: string) => {
    setSelectedTickets((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // Generate report
  const handleGenerate = async () => {
    if (!selectedProject) return;

    const filteredCommits = commits.filter((c) => selectedCommits.has(c.sha));
    const filteredTickets = tickets.filter((t) => selectedTickets.has(t.key));

    if (filteredCommits.length === 0 && filteredTickets.length === 0) return;

    setLoadingReport(true);
    setReport("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: selectedProject.id,
          projectName: selectedProject.name,
          commits: filteredCommits,
          tickets: filteredTickets,
          additionalContext: additionalContext || undefined,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setReport(data.content);
    } catch (err) {
      console.error("Generate error:", err);
    } finally {
      setLoadingReport(false);
    }
  };

  // Copy to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      toast({
        title: "Copied to clipboard",
        description: "Your EOD report has been copied. Paste it in Slack!",
        variant: "success",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Failed to copy",
        description: "Please select the text and copy manually.",
        variant: "destructive",
      });
    }
  };

  // Post to Slack
  const handlePostToSlack = async () => {
    if (!selectedProject?.slackWebhookUrl) {
      toast({
        title: "No Slack webhook configured",
        description: "Add a Slack webhook URL to your project settings first.",
        variant: "destructive",
      });
      return;
    }

    setPosting(true);
    try {
      const res = await fetch("/api/slack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          webhookUrl: selectedProject.slackWebhookUrl,
          message: report,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      toast({
        title: "Posted to Slack",
        description: "Your EOD report has been posted successfully!",
        variant: "success",
      });
    } catch (err) {
      toast({
        title: "Failed to post to Slack",
        description:
          err instanceof Error ? err.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setPosting(false);
    }
  };

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        handleGenerate();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  return (
    <div className="space-y-4">
      {/* Header bar: project + date (left) | heatmap (right) */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Left: project + date selectors */}
            <div className="flex items-end gap-3 lg:shrink-0">
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-500">
                  Project
                </label>
                <Select
                  value={selectedProjectId}
                  onValueChange={setSelectedProjectId}
                >
                  <SelectTrigger className="w-56">
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} ({p.clientName})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-500">
                  Date
                </label>
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-44 justify-start gap-2 text-left font-normal"
                    >
                      <CalendarDays className="h-4 w-4 text-zinc-400" />
                      {format(date, "MMM d, yyyy")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(d) => {
                        if (d) {
                          setDate(d);
                          setCalendarOpen(false);
                        }
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Right: heatmap */}
            {selectedProject && (
              <div className="min-w-0 lg:max-w-[55%]">
                <ContributionHeatmap
                  owner={selectedProject.githubOwner}
                  repo={selectedProject.githubRepo}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Empty state */}
      {projects.length === 0 && !loadingCommits && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <AlertCircle className="mb-4 h-12 w-12 text-zinc-300 dark:text-zinc-600" />
            <h3 className="mb-2 text-lg font-medium">
              No projects configured
            </h3>
            <p className="mb-4 text-sm text-zinc-500">
              Add a project to get started with your EOD reports.
            </p>
            <Button asChild>
              <a href="/projects">Configure Projects</a>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Main content: two columns */}
      {selectedProject && (
        <div className="grid gap-4 lg:grid-cols-2">
          {/* LEFT COLUMN: Commits + Tickets stacked */}
          <div className="flex flex-col gap-4">
            {/* Commits Panel */}
            <Card>
              <CardHeader className="px-4 py-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <GitCommit className="h-4 w-4" />
                    Git Commits
                    {commits.length > 0 && (
                      <Badge variant="secondary" className="ml-1 text-xs">
                        {selectedCommits.size}/{commits.length}
                      </Badge>
                    )}
                  </CardTitle>
                  {commits.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => {
                        if (selectedCommits.size === commits.length) {
                          setSelectedCommits(new Set());
                        } else {
                          setSelectedCommits(
                            new Set(commits.map((c) => c.sha))
                          );
                        }
                      }}
                    >
                      {selectedCommits.size === commits.length
                        ? "Deselect all"
                        : "Select all"}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-0">
                {loadingCommits ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                ) : errorCommits ? (
                  <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-700 dark:bg-red-950/50 dark:text-red-400">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {errorCommits}
                  </div>
                ) : commits.length === 0 ? (
                  <p className="py-6 text-center text-xs text-zinc-500">
                    No commits found for this date.
                  </p>
                ) : (
                  <div className="max-h-48 space-y-0.5 overflow-y-auto">
                    {commits.map((commit) => (
                      <label
                        key={commit.sha}
                        className="flex cursor-pointer items-start gap-2.5 rounded-md p-1.5 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900"
                      >
                        <Checkbox
                          checked={selectedCommits.has(commit.sha)}
                          onCheckedChange={() => toggleCommit(commit.sha)}
                          className="mt-0.5"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs">{commit.message}</p>
                          <p className="text-[10px] text-zinc-400">
                            {commit.sha} &middot;{" "}
                            {new Date(commit.date).toLocaleTimeString()}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tickets Panel */}
            <Card>
              <CardHeader className="px-4 py-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Ticket className="h-4 w-4" />
                    Jira Tickets
                    {tickets.length > 0 && (
                      <Badge variant="secondary" className="ml-1 text-xs">
                        {selectedTickets.size}/{tickets.length}
                      </Badge>
                    )}
                  </CardTitle>
                  {tickets.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => {
                        if (selectedTickets.size === tickets.length) {
                          setSelectedTickets(new Set());
                        } else {
                          setSelectedTickets(
                            new Set(tickets.map((t) => t.key))
                          );
                        }
                      }}
                    >
                      {selectedTickets.size === tickets.length
                        ? "Deselect all"
                        : "Select all"}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-0">
                {loadingTickets ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                ) : errorTickets ? (
                  <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-700 dark:bg-red-950/50 dark:text-red-400">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {errorTickets}
                  </div>
                ) : tickets.length === 0 ? (
                  <p className="py-6 text-center text-xs text-zinc-500">
                    No in-progress tickets found.
                  </p>
                ) : (
                  <div className="max-h-48 space-y-0.5 overflow-y-auto">
                    {tickets.map((ticket) => (
                      <label
                        key={ticket.key}
                        className="flex cursor-pointer items-start gap-2.5 rounded-md p-1.5 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900"
                      >
                        <Checkbox
                          checked={selectedTickets.has(ticket.key)}
                          onCheckedChange={() => toggleTicket(ticket.key)}
                          className="mt-0.5"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs">{ticket.summary}</p>
                          <div className="mt-0.5 flex items-center gap-1.5">
                            <Badge variant="outline" className="text-[10px] px-1 py-0">
                              {ticket.key}
                            </Badge>
                            <span className="text-[10px] text-zinc-400">
                              {ticket.type}
                            </span>
                            {ticket.priority && (
                              <span className="text-[10px] text-zinc-400">
                                {ticket.priority}
                              </span>
                            )}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN: Context + Generate + Report */}
          <div className="flex flex-col gap-4">
            {/* Additional Context */}
            <Card>
              <CardHeader className="px-4 py-3">
                <CardTitle className="text-sm">
                  Additional Context{" "}
                  <span className="font-normal text-zinc-400">(optional)</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-0">
                <Textarea
                  placeholder="Meetings, blockers, plans for tomorrow..."
                  value={additionalContext}
                  onChange={(e) => setAdditionalContext(e.target.value)}
                  rows={2}
                  className="text-xs"
                />
              </CardContent>
            </Card>

            {/* Generate Button */}
            {!report && (
              <div className="flex flex-1 items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <Button
                    size="lg"
                    onClick={handleGenerate}
                    disabled={
                      loadingReport ||
                      (selectedCommits.size === 0 &&
                        selectedTickets.size === 0)
                    }
                    className="gap-2 px-10 py-6 text-base"
                  >
                    {loadingReport ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5" />
                        Generate EOD
                      </>
                    )}
                  </Button>
                  <span className="text-[10px] text-zinc-400">
                    or press{" "}
                    <kbd className="rounded border border-zinc-300 px-1 py-0.5 text-[10px] dark:border-zinc-700">
                      Cmd+Enter
                    </kbd>
                  </span>
                </div>
              </div>
            )}

            {/* Report Output */}
            {report && (
              <Card className="flex flex-1 flex-col border-2 border-zinc-200 dark:border-zinc-700">
                <CardHeader className="px-4 py-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <MessageSquare className="h-4 w-4" />
                      EOD Report
                    </CardTitle>
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopy}
                        className="h-7 gap-1 text-xs"
                      >
                        {copied ? (
                          <>
                            <Check className="h-3 w-3" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            Copy
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        onClick={handlePostToSlack}
                        disabled={
                          posting || !selectedProject.slackWebhookUrl
                        }
                        className="h-7 gap-1 text-xs"
                        title={
                          !selectedProject.slackWebhookUrl
                            ? "Configure a Slack webhook in project settings"
                            : "Post to Slack"
                        }
                      >
                        {posting ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Posting...
                          </>
                        ) : (
                          <>
                            <Send className="h-3 w-3" />
                            Slack
                          </>
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleGenerate}
                        disabled={loadingReport}
                        className="h-7 gap-1 text-xs"
                        title="Re-generate"
                      >
                        {loadingReport ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Sparkles className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 px-4 pb-4 pt-0">
                  <Textarea
                    value={report}
                    onChange={(e) => setReport(e.target.value)}
                    rows={Math.max(6, report.split("\n").length + 2)}
                    className="min-h-[160px] resize-y font-mono text-xs leading-relaxed"
                  />
                  <p className="mt-1.5 text-[10px] text-zinc-400">
                    Edit the report above before copying or posting.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
