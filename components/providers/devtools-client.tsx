'use client'

import { useEffect, useState } from 'react'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { hotkeysDevtoolsPlugin } from '@tanstack/react-hotkeys-devtools'

export function DevtoolsClient() {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia('(max-width: 767px)').matches;
  })

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 767px)')
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  if (process.env.NODE_ENV !== 'development') return null
  if (isMobile) return null
  return <TanStackDevtools plugins={[hotkeysDevtoolsPlugin()]} />
}
