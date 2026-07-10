"use client"

import { useCallback } from "react"
import { useTheme } from "@/components/providers/theme-provider"

interface Coords {
  x: number
  y: number
}

export function useThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()

  const toggleTheme = useCallback(
    (coords?: Coords) => {
      const newMode = resolvedTheme === "dark" ? "light" : "dark"
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches

      if (!document.startViewTransition || prefersReducedMotion) {
        setTheme(newMode)
        return
      }

      const root = document.documentElement
      if (coords) {
        root.style.setProperty("--x", `${coords.x}px`)
        root.style.setProperty("--y", `${coords.y}px`)
      } else {
        root.style.removeProperty("--x")
        root.style.removeProperty("--y")
      }

      document.startViewTransition(() => {
        setTheme(newMode)
      })
    },
    [resolvedTheme, setTheme],
  )

  return { toggleTheme, setTheme, resolvedTheme }
}
