"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes"
import { AuthProvider } from "@/components/auth-provider"
import { SessionProvider } from "next-auth/react"

export function Providers({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = React.useState(false)

  // After mounting, we have access to the theme
  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <SessionProvider>
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      {...props}
    >
      <AuthProvider>
        {children}
      </AuthProvider>
    </NextThemesProvider>
    </SessionProvider>
  )
} 