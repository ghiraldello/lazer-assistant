"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export function MainContent({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    // Read initial state
    const stored = localStorage.getItem("sidebar-collapsed");
    if (stored === "true") setCollapsed(true);

    // Listen for sidebar toggle events
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<boolean>;
      setCollapsed(customEvent.detail);
    };
    window.addEventListener("sidebar-toggle", handler);
    return () => window.removeEventListener("sidebar-toggle", handler);
  }, []);

  return (
    <div
      className={cn(
        "flex min-h-screen flex-col transition-all duration-200",
        collapsed ? "ml-16" : "ml-56"
      )}
    >
      {children}
    </div>
  );
}
