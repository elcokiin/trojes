"use client"

import { HotkeysProvider } from "@tanstack/react-hotkeys"

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
      {children}
    </HotkeysProvider>
  )
}
