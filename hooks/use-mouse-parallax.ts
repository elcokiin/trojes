"use client"

import { useState, useRef, useEffect } from "react"

interface MouseParallaxState {
  x: number
  y: number
}

interface UseMouseParallaxOptions {
  ignoreSelector?: string
}

export function useMouseParallax(
  { ignoreSelector }: UseMouseParallaxOptions = {},
): MouseParallaxState {
  const [mouse, setMouse] = useState<MouseParallaxState>({ x: 0, y: 0 })
  const rafRef = useRef(0)

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (ignoreSelector && (e.target as Element)?.closest(ignoreSelector)) {
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current)
          rafRef.current = 0
        }
        setMouse({ x: 0, y: 0 })
        return
      }
      if (rafRef.current) return
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = 0
        setMouse({
          x: (e.clientX / window.innerWidth - 0.5) * 2,
          y: (e.clientY / window.innerHeight - 0.5) * 2,
        })
      })
    }

    window.addEventListener("mousemove", onMove, { passive: true })
    return () => {
      window.removeEventListener("mousemove", onMove)
      cancelAnimationFrame(rafRef.current)
    }
  }, [ignoreSelector])

  return mouse
}
