"use client"

import type { MousePosition } from "@/hooks/use-mouse-parallax";
import { Z } from "@/components/login/layers";

const SCENE_PARALLAX_MAX_SHIFT = 12

export function LoginSceneBackground({ mouseCoordinates }: { mouseCoordinates: MousePosition }) {
  return (
    <div className={`absolute inset-0 ${Z.SCENE} overflow-hidden`}>
      <div
        className="absolute -inset-4 bg-cover bg-center bg-[url(/assets/backgrounds/login-day.webp)] dark:bg-[url(/assets/backgrounds/login-night.webp)] transition-transform duration-200 ease-out will-change-transform"
        style={{
          transform: `translate3d(${mouseCoordinates.x * SCENE_PARALLAX_MAX_SHIFT}px, ${mouseCoordinates.y * SCENE_PARALLAX_MAX_SHIFT}px, 0)`,
        }}
      />
    </div>
  )
}
