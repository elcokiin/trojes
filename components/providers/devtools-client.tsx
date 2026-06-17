'use client'

import { useEffect, useState } from 'react'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { hotkeysDevtoolsPlugin } from '@tanstack/react-hotkeys-devtools'

export function DevtoolsClient() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 767px)')
    setIsMobile(mql.matches)
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  if (process.env.NODE_ENV !== 'development') return null
  if (isMobile) return null
  return <TanStackDevtools plugins={[hotkeysDevtoolsPlugin()]} />
}
