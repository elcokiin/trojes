'use client'

import { TanStackDevtools } from '@tanstack/react-devtools'
import { hotkeysDevtoolsPlugin } from '@tanstack/react-hotkeys-devtools'
import { useIsMobile } from '@/hooks/use-mobile'

export function DevtoolsClient() {
  const isMobile = useIsMobile()

  if (process.env.NODE_ENV !== 'development') return null
  if (isMobile) return null
  return <TanStackDevtools plugins={[hotkeysDevtoolsPlugin()]} />
}
