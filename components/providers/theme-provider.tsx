"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react"

const STORAGE_KEY = "theme"

interface ThemeContextValue {
  theme: string | undefined
  setTheme: (theme: string) => void
  resolvedTheme: string | undefined
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: undefined,
  setTheme: () => {},
  resolvedTheme: undefined,
})

function getSystemTheme() {
  if (typeof window === "undefined") return "light"
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"
}

function applyThemeClass(theme: string) {
  const resolved =
    theme === "system" ? getSystemTheme() : theme
  document.documentElement.classList.toggle("dark", resolved === "dark")
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
}: {
  children: ReactNode
  defaultTheme?: string
}) {
  const [theme, setThemeState] = useState<string>(defaultTheme)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    let stored: string | null = null
    try {
      stored = localStorage.getItem(STORAGE_KEY)
    } catch {}
    const initial = stored ?? defaultTheme
    setThemeState(initial)
    applyThemeClass(initial)
    setMounted(true)
  }, [defaultTheme])

  const setTheme = useCallback((next: string) => {
    setThemeState(next)
    applyThemeClass(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {}
  }, [])

  const resolvedTheme =
    theme === "system" ? getSystemTheme() : theme

  return (
    <ThemeContext.Provider
      value={{
        theme: mounted ? theme : undefined,
        setTheme,
        resolvedTheme: mounted ? resolvedTheme : undefined,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
