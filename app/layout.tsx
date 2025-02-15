import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { ThemeProvider as NextThemesProvider } from "next-themes";


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
      <body className={inter.className}>
        <Providers attribute="class" defaultTheme="system" enableSystem>
          {children}
        </Providers>
      </body>
    </html>
  );
}
