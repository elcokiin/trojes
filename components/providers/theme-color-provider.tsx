"use client"

import { useEffect } from "react"

export function ThemeColorProvider() {
  useEffect(() => {
    const meta: HTMLMetaElement =
      (document.querySelector('meta[name="theme-color"]') as HTMLMetaElement) ??
      (() => {
        const m = document.createElement("meta") as HTMLMetaElement
        m.name = "theme-color"
        document.head.appendChild(m)
        return m
      })()

    const probe = document.createElement("div")
    probe.style.cssText = "position:fixed;pointer-events:none;opacity:0"
    document.body.appendChild(probe)

    function update() {
      probe.style.setProperty("background-color", "var(--primary)")
      const color = getComputedStyle(probe).backgroundColor
      if (color && color !== "rgba(0, 0, 0, 0)") {
        meta.content = color
      }
    }

    update()

    const observer = new MutationObserver(() => update())
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })

    return () => {
      observer.disconnect()
      meta.remove()
      document.body.removeChild(probe)
    }
  }, [])

  return null
}
