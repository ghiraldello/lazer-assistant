import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { AuthenticatedLayout } from "@/components/authenticated-layout";
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "EOD Assistant | Lazer",
  description:
    "Automate your End of Day reports from GitHub commits and Jira tickets",
  icons: {
    icon: "/lazer/LAZER_ICON_COLOUR.svg",
  },
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
        <Providers>
          <AuthenticatedLayout>{children}</AuthenticatedLayout>
          <Toaster />
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
