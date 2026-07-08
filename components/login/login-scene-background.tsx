"use client"

import { useEffect, useRef } from "react"

const MAX_SHIFT = 12

export function LoginSceneBackground() {
  const ref = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const onMove = (e: MouseEvent) => {
      if ((e.target as Element)?.closest("#gbtn")) {
        el!.style.transform = "translate3d(0, 0, 0)"
        return
      }
      if (rafRef.current) return
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = 0
        const x = (e.clientX / window.innerWidth - 0.5) * 2
        const y = (e.clientY / window.innerHeight - 0.5) * 2
        el!.style.transform = `translate3d(${x * MAX_SHIFT}px, ${y * MAX_SHIFT}px, 0)`
      })
    }

    window.addEventListener("mousemove", onMove, { passive: true })
    return () => {
      window.removeEventListener("mousemove", onMove)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <div className="absolute inset-0 z-10 overflow-hidden">
      <div
        ref={ref}
        className="absolute -inset-4 bg-cover bg-center bg-[url(/assets/backgrounds/login-day.webp)] dark:bg-[url(/assets/backgrounds/login-night.webp)] transition-transform duration-200 ease-out will-change-transform"
      />
    </div>
  )
}
