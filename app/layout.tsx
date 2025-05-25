import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider } from "@/components/sidebar-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DocMate",
  description: "AI-powered document processing and analysis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-title" content="DocMate" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
          <Providers attribute="class" defaultTheme="system" enableSystem>
            <SidebarProvider>
              {children}
            </SidebarProvider>
            <Toaster />
          </Providers>
      </body>
    </html>
  );
}