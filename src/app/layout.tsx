import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";
import { AppHeader } from "@/components/app-header";
import { MainContent } from "@/components/main-content";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "EOD Assistant",
  description:
    "Automate your End of Day reports from GitHub commits and Jira tickets",
};

// Inline script to prevent flash of wrong theme
const themeScript = `
  (function() {
    try {
      var stored = localStorage.getItem('theme');
      var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (stored === 'dark' || (!stored && prefersDark)) {
        document.documentElement.classList.add('dark');
      }
    } catch(e) {}
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-sans antialiased">
        <Sidebar />
        <MainContent>
          <AppHeader />
          <main className="flex-1">
            <div className="mx-auto max-w-6xl px-6 py-6">{children}</div>
          </main>
        </MainContent>
        <Toaster />
      </body>
    </html>
  );
}
