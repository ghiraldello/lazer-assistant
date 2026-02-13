"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

function LoginContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    setDark(stored === "dark" || (!stored && prefersDark));
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto">
            <img
              src={
                dark
                  ? "/lazer/LAZER_LOGO_WHITE_TEXT.svg"
                  : "/lazer/LAZER_LOGO_BLACK_TEXT_PINK.png"
              }
              alt="Lazer"
              className="h-8"
            />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">EOD Assistant</h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Sign in to manage your End of Day reports
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={() => signIn("github", { callbackUrl })}
            className="w-full gap-2"
            size="lg"
          >
            <Github className="h-5 w-5" />
            Sign in with GitHub
          </Button>
          <p className="text-center text-[11px] text-zinc-400 dark:text-zinc-500">
            Your credentials are stored securely and never shared with other
            users.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
