"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { AppHeader } from "@/components/app-header";
import { MainContent } from "@/components/main-content";

export function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession();
  const pathname = usePathname();

  // Don't show sidebar/header on the login page or while loading
  const isLoginPage = pathname.startsWith("/login");
  if (isLoginPage || status !== "authenticated") {
    return <>{children}</>;
  }

  return (
    <>
      <Sidebar />
      <MainContent>
        <AppHeader />
        <main className="flex-1">
          <div className="mx-auto max-w-6xl px-6 py-6">{children}</div>
        </main>
      </MainContent>
    </>
  );
}
