"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Moon, Sun, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AppHeader() {
  const router = useRouter();
  const [dark, setDark] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  // Initialize theme from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const isDark = stored === "dark" || (!stored && prefersDark);
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  // Fetch user avatar
  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data.githubUsername) {
          setUsername(data.githubUsername);
          setAvatarUrl(
            `https://github.com/${data.githubUsername}.png?size=80`
          );
        }
      })
      .catch(() => {});
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-zinc-200 bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:border-zinc-800">
      {/* Left: title */}
      <div className="flex items-center gap-2">
        <FileText className="h-5 w-5 text-zinc-900 dark:text-zinc-100" />
        <span className="text-base font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          EOD Assistant
        </span>
      </div>

      {/* Right: theme toggle + avatar */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          className="h-8 w-8 p-0"
          title={dark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {dark ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>

        <button
          onClick={() => router.push("/settings")}
          className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-zinc-200 bg-zinc-100 transition-opacity hover:opacity-80 dark:border-zinc-700 dark:bg-zinc-800"
          title={username ? `${username} – Settings` : "Settings"}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={username || "User"}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-xs font-medium text-zinc-500">?</span>
          )}
        </button>
      </div>
    </header>
  );
}
