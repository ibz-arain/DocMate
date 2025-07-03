"use client"

import * as React from "react"
import { AuthProvider } from "@/components/auth-provider"
import { HistoryProvider } from "@/components/history-provider"
import { ThemeProvider } from "@/components/theme-provider"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <HistoryProvider>
          {children}
        </HistoryProvider>
      </AuthProvider>
    </ThemeProvider>
  )
} 