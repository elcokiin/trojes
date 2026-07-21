"use client"

import { useState, useRef, useCallback } from "react"

export function useInView(options?: IntersectionObserverInit) {
  const [inView, setInView] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)

  const ref = useCallback((node: HTMLDivElement | null) => {
    if (observerRef.current) {
      observerRef.current.disconnect()
      observerRef.current = null
    }

    if (node) {
      observerRef.current = new IntersectionObserver(
        ([entry]) => setInView(entry.isIntersecting),
        options,
      )
      observerRef.current.observe(node)
    }
  }, [])

  return { ref, inView }
}
