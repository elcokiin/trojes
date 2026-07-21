"use client"

import { Suspense } from "react"
import { HotkeysProvider } from "@tanstack/react-hotkeys"
import { useGlobalHotkeys } from "@/hooks/use-hotkey-scope"

function GlobalHotkeysRegistrar() {
  useGlobalHotkeys()
  return null
}

function GlobalHotkeysRegistrarWrapper() {
  return (
    <Suspense fallback={null}>
      <GlobalHotkeysRegistrar />
    </Suspense>
  )
}

export function HotkeysRootProvider({ children }: { children: React.ReactNode }) {
  return (
    <HotkeysProvider
      defaultOptions={{
        hotkey: {
          ignoreInputs: true,
          preventDefault: true,
          stopPropagation: true,
        },
        hotkeySequence: {
          ignoreInputs: true,
          preventDefault: true,
          stopPropagation: true,
          timeout: 1200,
        },
      }}
    >
      <GlobalHotkeysRegistrarWrapper />
      {children}
    </HotkeysProvider>
  )
}
