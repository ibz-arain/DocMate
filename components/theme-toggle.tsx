"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"

interface ThemeToggleProps {
  isCollapsed?: boolean;
}

export function ThemeToggle({ isCollapsed }: ThemeToggleProps) {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const pathname = usePathname()
  
  // Only allow theme toggle in playground
  const isPlayground = pathname?.startsWith('/playground')

  // Prevent hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !isPlayground) {
    return (
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start",
          isCollapsed && "justify-center"
        )}
      >
        <div className="relative h-5 w-5">
          <Sun className="h-5 w-5" />
        </div>
        {!isCollapsed && <span className="ml-3">Toggle theme</span>}
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start",
        isCollapsed && "justify-center"
      )}
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      <div className="relative h-5 w-5">
        <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute left-0 top-0 h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      </div>
      {!isCollapsed && <span className="ml-3">Toggle theme</span>}
    </Button>
  )
} 