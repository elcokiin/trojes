"use client"

import { HotkeysProvider } from "@tanstack/react-hotkeys"
import { useGlobalHotkeys } from "@/hooks/use-hotkey-scope"

function GlobalHotkeysRegistrar() {
  useGlobalHotkeys()
  return null
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
      <GlobalHotkeysRegistrar />
      {children}
    </HotkeysProvider>
  )
}
