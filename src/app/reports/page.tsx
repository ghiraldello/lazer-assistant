"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Copy,
  Check,
  History,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";

interface Report {
  id: string;
  projectId: string;
  content: string;
  date: string;
  postedToSlack: boolean;
  createdAt: string;
  project: {
    name: string;
    clientName: string;
  };
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/reports")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setReports(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleCopy = async (id: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      toast({
        title: "Copied to clipboard",
        variant: "success",
      });
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast({
        title: "Failed to copy",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Report History</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          View and re-use your previously generated EOD reports.
        </p>
      </div>

      {/* Reports List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <History className="mb-4 h-12 w-12 text-zinc-300 dark:text-zinc-600" />
            <h3 className="mb-2 text-lg font-medium">No reports yet</h3>
            <p className="mb-4 text-sm text-zinc-500">
              Generate your first EOD report from the dashboard.
            </p>
            <Button asChild>
              <a href="/">Go to Dashboard</a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <Card key={report.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-sm font-medium">
                      {report.project.name}
                    </CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      {report.project.clientName}
                    </Badge>
                    {report.postedToSlack && (
                      <Badge
                        variant="outline"
                        className="text-xs text-green-600 dark:text-green-400"
                      >
                        Posted to Slack
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-400">
                      {format(new Date(report.createdAt), "MMM d, yyyy h:mm a")}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleCopy(report.id, report.content)}
                    >
                      {copiedId === report.id ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() =>
                        setExpandedId(
                          expandedId === report.id ? null : report.id
                        )
                      }
                    >
                      {expandedId === report.id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {expandedId === report.id && (
                <CardContent>
                  <pre className="whitespace-pre-wrap rounded-lg bg-zinc-50 p-4 text-sm leading-relaxed dark:bg-zinc-900">
                    {report.content}
                  </pre>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
