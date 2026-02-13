"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Moon, Sun, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function AppHeader() {
  const router = useRouter();
  const { data: session } = useSession();
  const [dark, setDark] = useState(false);

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

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  const userName = session?.user?.name || session?.user?.email || "User";
  const avatarUrl = session?.user?.image || null;

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-zinc-200 bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:border-zinc-800">
      {/* Left: Lazer logo */}
      <div className="flex items-center">
        <img
          src={dark ? "/lazer/LAZER_LOGO_WHITE_TEXT.svg" : "/lazer/LAZER_LOGO_BLACK_TEXT_PINK.png"}
          alt="Lazer"
          className="h-6"
        />
      </div>

      {/* Right: theme toggle + user menu */}
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

        <Popover>
          <PopoverTrigger asChild>
            <button
              className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-zinc-200 bg-zinc-100 transition-opacity hover:opacity-80 dark:border-zinc-700 dark:bg-zinc-800"
              title={userName}
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={userName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-xs font-medium text-zinc-500">
                  {userName.charAt(0).toUpperCase()}
                </span>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-2" align="end">
            <div className="mb-2 border-b border-zinc-200 px-2 pb-2 dark:border-zinc-700">
              <p className="text-sm font-medium">{userName}</p>
              {session?.user?.email && (
                <p className="text-xs text-zinc-500">
                  {session.user.email}
                </p>
              )}
            </div>
            <button
              onClick={() => router.push("/settings")}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              Settings
            </button>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
}
