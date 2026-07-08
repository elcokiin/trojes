"use client"

import { useCallback, useEffect, useRef } from "react"

export function use3DButton() {
  const btnRef = useRef<HTMLButtonElement>(null)
  const phaseRef = useRef(0)

  const clearPress = useCallback((btn: HTMLButtonElement) => {
    phaseRef.current = 3
    btn.classList.add("--releasing")
    btn.classList.remove("--active")
  }, [])

  const handleTransitionEnd = useCallback((e: Event) => {
    const btn = btnRef.current
    const te = e as TransitionEvent
    if (!btn || te.propertyName !== "transform") return
    if (phaseRef.current === 1) {
      phaseRef.current = 2
    } else if (phaseRef.current === 3) {
      phaseRef.current = 0
      btn.classList.remove("--releasing")
    }
  }, [])

  useEffect(() => {
    const btn = btnRef.current
    if (!btn) return
    btn.addEventListener("transitionend", handleTransitionEnd)
    return () => btn.removeEventListener("transitionend", handleTransitionEnd)
  }, [handleTransitionEnd])

  const handlePointerDown = useCallback(() => {
    const btn = btnRef.current
    if (!btn) return
    phaseRef.current = 1
    btn.classList.add("--active")
    btn.classList.remove("--left", "--middle", "--right")
  }, [])

  const handlePointerUp = useCallback(() => {
    const btn = btnRef.current
    if (!btn || phaseRef.current < 1) return
    clearPress(btn)
  }, [clearPress])

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      const btn = btnRef.current
      if (!btn || phaseRef.current >= 1) return
      const rect = btn.getBoundingClientRect()
      const pct = (e.clientX - rect.left) / rect.width
      btn.classList.remove("--left", "--middle", "--right")
      if (pct < 0.3) {
        btn.classList.add("--left")
      } else if (pct < 0.65) {
        btn.classList.add("--middle")
      } else {
        btn.classList.add("--right")
      }
    },
    [],
  )

  const handlePointerLeave = useCallback(() => {
    const btn = btnRef.current
    if (!btn) return
    btn.classList.remove("--left", "--middle", "--right")
    if (phaseRef.current >= 1) {
      clearPress(btn)
    }
  }, [clearPress])

  return {
    btnRef,
    handlers: {
      onPointerDown: handlePointerDown,
      onPointerUp: handlePointerUp,
      onPointerMove: handlePointerMove,
      onPointerLeave: handlePointerLeave,
    },
  } as const
}
