import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider } from "@/components/sidebar-provider";


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
      <body suppressHydrationWarning>
          <Providers>
            <SidebarProvider>
              {children}
          </SidebarProvider>
            <Toaster />
          </Providers>
      </body>
    </html>
  );
}