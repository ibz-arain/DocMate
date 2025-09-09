"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes"
import { usePathname } from "next/navigation"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const pathname = usePathname()
  const isPlayground = pathname?.startsWith('/playground')
  
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={isPlayground ? "system" : "dark"}
      forcedTheme={isPlayground ? undefined : "dark"}
      enableSystem={isPlayground}
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
} 