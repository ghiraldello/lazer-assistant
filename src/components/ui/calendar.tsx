"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-2",
        month: "flex flex-col gap-4",
        month_caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "flex items-center gap-1",
        button_previous:
          "absolute left-1 top-0 inline-flex h-7 w-7 items-center justify-center rounded-md border border-zinc-200 bg-transparent p-0 text-zinc-500 opacity-50 hover:opacity-100 dark:border-zinc-700 dark:text-zinc-400",
        button_next:
          "absolute right-1 top-0 inline-flex h-7 w-7 items-center justify-center rounded-md border border-zinc-200 bg-transparent p-0 text-zinc-500 opacity-50 hover:opacity-100 dark:border-zinc-700 dark:text-zinc-400",
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday:
          "w-8 text-[0.8rem] font-normal text-zinc-500 dark:text-zinc-400",
        week: "flex w-full mt-2",
        day: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
        day_button:
          "inline-flex h-8 w-8 items-center justify-center rounded-md p-0 font-normal hover:bg-zinc-100 dark:hover:bg-zinc-800 aria-selected:opacity-100",
        selected:
          "bg-zinc-900 text-zinc-50 hover:bg-zinc-900 hover:text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900",
        today:
          "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50",
        outside:
          "text-zinc-500 opacity-50 dark:text-zinc-400",
        disabled: "text-zinc-500 opacity-50 dark:text-zinc-400",
        hidden: "invisible",
        ...classNames,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
