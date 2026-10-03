"use client"

import { useEffect, useRef } from "react"
import styles from "./landing-page.module.css"

export function HeroScene({
  copy,
}: {
  copy: {
    illustration: string
    cardLabel: string
    cardText: string
    captured: string
    questionLabel: string
    question: string
    clarityLabel: string
    clarity: string
    orbitLabel: string
  }
}) {
  const sceneRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const scene = sceneRef.current
    if (!scene) return

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
    scene.dataset.reducedMotion = String(reducedMotion.matches)
    scene.dataset.pageVisible = String(!document.hidden)

    if (reducedMotion.matches) return

    let isVisible = false
    let frame = 0

    const updateScrollPosition = () => {
      if (!isVisible || frame) return
      frame = window.requestAnimationFrame(() => {
        frame = 0
        const top = scene.getBoundingClientRect().top
        const travel = Math.max(0, Math.min(48, -top * 0.1))
        scene.style.setProperty("--scroll-y", `${-Math.round(travel)}px`)
      })
    }

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting
      scene.dataset.visible = String(isVisible)
      if (isVisible) updateScrollPosition()
      else if (frame) {
        window.cancelAnimationFrame(frame)
        frame = 0
      }
    }, { rootMargin: "80px" })

    const handleVisibilityChange = () => {
      scene.dataset.pageVisible = String(!document.hidden)
      if (!document.hidden) updateScrollPosition()
    }

    intersectionObserver.observe(scene)
    window.addEventListener("scroll", updateScrollPosition, { passive: true })
    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      intersectionObserver.disconnect()
      window.removeEventListener("scroll", updateScrollPosition)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <div aria-hidden="true" className={styles.scene} ref={sceneRef}>
      <div aria-hidden="true" className={styles.sceneCanvas}>
        <div className={styles.orbit} />
        <div className={styles.orbitCore} />
        <div className={`${styles.floatCard} ${styles.cardMain}`}>
          <div className={styles.cardTopline}>
            <span className={styles.greenDot} />
            <span>{copy.cardLabel}</span>
            <span className={styles.cardSpark}>✳</span>
          </div>
          <p className={styles.cardIdea}>{copy.cardText}</p>
          <div className={styles.cardBottomline}>
            <span className={styles.savedIcon}>✓</span>
            <span>{copy.captured}</span>
          </div>
        </div>

        <div className={`${styles.floatCard} ${styles.cardQuestion}`}>
          <div className={styles.cardTopline}>
            <span className={styles.orangeDot} />
            <span>{copy.questionLabel}</span>
          </div>
          <p>{copy.question}</p>
          <div className={styles.questionLines}>
            <i /><i /><i />
          </div>
        </div>

        <div className={`${styles.floatCard} ${styles.cardClarity}`}>
          <span className={styles.clarityIcon}>↗</span>
          <div>
            <span className={styles.clarityLabel}>{copy.clarityLabel}</span>
            <p>{copy.clarity}</p>
          </div>
        </div>

        <div className={styles.orbitCaption}>
          <span />
          {copy.orbitLabel}
        </div>
      </div>
    </div>
  )
}
