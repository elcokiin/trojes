"use client"

const MAX_SHIFT = 12

interface MouseParallax {
  x: number
  y: number
}

export function LoginSceneBackground({ mouse }: { mouse: MouseParallax }) {
  return (
    <div className="absolute inset-0 z-10 overflow-hidden">
      <div
        className="absolute -inset-4 bg-cover bg-center bg-[url(/assets/backgrounds/login-day.webp)] dark:bg-[url(/assets/backgrounds/login-night.webp)] transition-transform duration-200 ease-out will-change-transform"
        style={{
          transform: `translate3d(${mouse.x * MAX_SHIFT}px, ${mouse.y * MAX_SHIFT}px, 0)`,
        }}
      />
    </div>
  )
}
