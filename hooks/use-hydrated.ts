"use client"

import { useEffect, useState } from "react"

/**
 * Returns true only after the component has hydrated on the client.
 * Use to suppress loading states during SSR/hydration so the server and
 * first client render produce identical markup.
 */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setHydrated(true)
  }, [])

  return hydrated
}
