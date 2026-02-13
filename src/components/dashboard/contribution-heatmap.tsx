"use client";

import { useState, useEffect, useMemo } from "react";
import { format, parseISO, getDay } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface ContributionDay {
  date: string;
  count: number;
}

interface ContributionHeatmapProps {
  owner: string;
  repo: string;
}

const DAY_LABELS = ["", "M", "", "W", "", "F", ""];
const CELL_SIZE = 10;
const CELL_GAP = 2;

function getColor(count: number, maxCount: number): string {
  if (count === 0) return "var(--color-heatmap-0)";
  const ratio = count / Math.max(maxCount, 1);
  if (ratio <= 0.25) return "var(--color-heatmap-1)";
  if (ratio <= 0.5) return "var(--color-heatmap-2)";
  if (ratio <= 0.75) return "var(--color-heatmap-3)";
  return "var(--color-heatmap-4)";
}

export function ContributionHeatmap({
  owner,
  repo,
}: ContributionHeatmapProps) {
  const [data, setData] = useState<ContributionDay[]>([]);
  const [totalCommits, setTotalCommits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!owner || !repo) return;

    setLoading(true);
    setError(null);

    const params = new URLSearchParams({ owner, repo, weeks: "12" });
    fetch(`/api/github/contributions?${params}`)
      .then((r) => r.json())
      .then((result) => {
        if (result.error) throw new Error(result.error);
        setData(result.contributions || []);
        setTotalCommits(result.totalCommits || 0);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load");
      })
      .finally(() => setLoading(false));
  }, [owner, repo]);

  const { weeks, maxCount, monthLabels } = useMemo(() => {
    if (data.length === 0)
      return {
        weeks: [] as ContributionDay[][],
        maxCount: 0,
        monthLabels: [] as { label: string; col: number }[],
      };

    let max = 0;
    const weeksMap: ContributionDay[][] = [];
    const months: { label: string; col: number }[] = [];
    let lastMonth = "";

    let currentWeek: ContributionDay[] = [];
    const firstDate = parseISO(data[0].date);
    const firstDayOfWeek = getDay(firstDate);

    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push({ date: "", count: -1 });
    }

    for (const day of data) {
      if (day.count > max) max = day.count;

      const dayOfWeek = getDay(parseISO(day.date));
      if (dayOfWeek === 0 && currentWeek.length > 0) {
        weeksMap.push(currentWeek);
        currentWeek = [];
      }
      currentWeek.push(day);

      const monthStr = format(parseISO(day.date), "MMM");
      if (monthStr !== lastMonth && dayOfWeek <= 1) {
        months.push({ label: monthStr, col: weeksMap.length });
        lastMonth = monthStr;
      }
    }
    if (currentWeek.length > 0) {
      weeksMap.push(currentWeek);
    }

    return { weeks: weeksMap, maxCount: max, monthLabels: months };
  }, [data]);

  const [tooltip, setTooltip] = useState<{
    text: string;
    x: number;
    y: number;
  } | null>(null);

  if (loading) {
    return <Skeleton className="h-24 w-full rounded-lg" />;
  }

  if (error) return null;

  const gridWidth = weeks.length * (CELL_SIZE + CELL_GAP);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-4">
        <span className="shrink-0 text-xs font-medium text-zinc-500 dark:text-zinc-400">
          Commit Activity
        </span>
        <span className="shrink-0 text-[10px] text-zinc-400 dark:text-zinc-500">
          {totalCommits} commit{totalCommits !== 1 ? "s" : ""} in the last 12 weeks
        </span>
      </div>

      <div className="overflow-x-auto">
        <div className="relative inline-block">
          {/* Month labels */}
          <div
            className="relative flex text-[9px] text-zinc-400"
            style={{ marginLeft: 20, height: 14, width: gridWidth }}
          >
            {monthLabels.map((m, i) => (
              <span
                key={i}
                className="absolute"
                style={{
                  left: m.col * (CELL_SIZE + CELL_GAP),
                }}
              >
                {m.label}
              </span>
            ))}
          </div>

          <div className="flex gap-0">
            {/* Day labels */}
            <div
              className="flex flex-col justify-between"
              style={{
                width: 18,
                height: 7 * (CELL_SIZE + CELL_GAP) - CELL_GAP,
              }}
            >
              {DAY_LABELS.map((label, i) => (
                <span
                  key={i}
                  className="text-zinc-400"
                  style={{
                    height: CELL_SIZE,
                    lineHeight: `${CELL_SIZE}px`,
                    fontSize: 9,
                  }}
                >
                  {label}
                </span>
              ))}
            </div>

            {/* Grid */}
            <div className="flex" style={{ gap: CELL_GAP }}>
              {weeks.map((week, weekIdx) => (
                <div
                  key={weekIdx}
                  className="flex flex-col"
                  style={{ gap: CELL_GAP }}
                >
                  {week.map((day, dayIdx) => (
                    <div
                      key={dayIdx}
                      className="rounded-[2px] transition-colors"
                      style={{
                        width: CELL_SIZE,
                        height: CELL_SIZE,
                        backgroundColor:
                          day.count === -1
                            ? "transparent"
                            : getColor(day.count, maxCount),
                        cursor: day.date ? "pointer" : "default",
                      }}
                      onMouseEnter={(e) => {
                        if (!day.date) return;
                        const rect = e.currentTarget.getBoundingClientRect();
                        setTooltip({
                          text: `${day.count} commit${day.count !== 1 ? "s" : ""} on ${format(parseISO(day.date), "MMM d, yyyy")}`,
                          x: rect.left + rect.width / 2,
                          y: rect.top - 8,
                        });
                      }}
                      onMouseLeave={() => setTooltip(null)}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-1.5 flex items-center gap-1 text-[9px] text-zinc-400" style={{ marginLeft: 18 }}>
            <span>Less</span>
            {[0, 1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className="rounded-[2px]"
                style={{
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                  backgroundColor: `var(--color-heatmap-${level})`,
                }}
              />
            ))}
            <span>More</span>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="pointer-events-none fixed z-50 rounded-md bg-zinc-900 px-2 py-1 text-xs text-white shadow-lg dark:bg-zinc-100 dark:text-zinc-900"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: "translate(-50%, -100%)",
          }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
}
