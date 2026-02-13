"use client";

import { useState } from "react";
import {
  Copy,
  Check,
  Send,
  Loader2,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

interface ReportEditorProps {
  report: string;
  onReportChange: (report: string) => void;
  webhookUrl?: string | null;
}

export function ReportEditor({
  report,
  onReportChange,
  webhookUrl,
}: ReportEditorProps) {
  const [copied, setCopied] = useState(false);
  const [posting, setPosting] = useState(false);

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

  const handlePostToSlack = async () => {
    if (!webhookUrl) {
      toast({
        title: "No Slack webhook configured",
        description:
          "Add a Slack webhook URL to your project settings first.",
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
          webhookUrl,
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

  return (
    <Card className="border-2 border-zinc-200 dark:border-zinc-700">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageSquare className="h-4 w-4" />
            Generated EOD Report
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </>
              )}
            </Button>
            <Button
              size="sm"
              onClick={handlePostToSlack}
              disabled={posting || !webhookUrl}
              className="gap-1.5"
              title={
                !webhookUrl
                  ? "Configure a Slack webhook in project settings"
                  : "Post to Slack"
              }
            >
              {posting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  Post to Slack
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Textarea
          value={report}
          onChange={(e) => onReportChange(e.target.value)}
          rows={Math.max(5, report.split("\n").length + 2)}
          className="min-h-[140px] resize-y font-mono text-sm leading-relaxed"
        />
        <p className="mt-2 text-xs text-zinc-400">
          Edit the report above before copying or posting. The text is fully
          editable.
        </p>
      </CardContent>
    </Card>
  );
}
